import json
import logging
import shutil
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse
from django.http import JsonResponse
from django.views import View

from ..models import Book, StatusChoices
from ..tasks import m4b_merge_task
from .mixins import JsonLoginRequiredMixin

logger = logging.getLogger(__name__)


def _validate_cover_url(url: str) -> bool:
    """Only allow HTTPS fetches to known Audible/Amazon CDN hostnames."""
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    if parsed.scheme != 'https':
        return False
    hostname = (parsed.hostname or '').lower().rstrip('.')
    allowed = (
        hostname.endswith('.media-amazon.com') or
        hostname.endswith('.images-amazon.com') or
        hostname == 'images-na.ssl-images-amazon.com'
    )
    return allowed


def serialize_book(book: Book) -> dict:
    return {
        'id': book.id,
        'title': book.title,
        'asin': book.asin,
        'short_desc': book.short_desc,
        'long_desc': book.long_desc,
        'release_date': book.release_date.isoformat(),
        'series': book.series,
        'publisher': book.publisher,
        'lang': book.lang,
        'runtime_length_minutes': book.runtime_length_minutes,
        'format_type': book.format_type,
        'converted': book.converted,
        'src_path': book.src_path,
        'dest_path': book.dest_path,
        'created_at': book.created_at.isoformat(),
        'updated_at': book.updated_at.isoformat(),
        'cover_image_link': book.cover_image_link,
        'status': {
            'id': book.status.id,
            'status': book.status.status,
            'message': book.status.message,
        },
        'authors': [
            {
                'id': author.id,
                'first_name': author.first_name,
                'last_name': author.last_name,
                'asin': author.asin,
            }
            for author in book.authors.all()
        ],
        'narrators': [
            {
                'id': narrator.id,
                'first_name': narrator.first_name,
                'last_name': narrator.last_name,
            }
            for narrator in book.narrators.all()
        ],
    }


class BooksListAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        try:
            done_books = Book.objects.filter(
                status__status=StatusChoices.DONE
            ).order_by('-created_at')
            processing_books = Book.objects.filter(
                status__status=StatusChoices.PROCESSING
            ).order_by('-created_at')
            error_books = Book.objects.filter(
                status__status=StatusChoices.ERROR
            ).order_by('-created_at')
            return JsonResponse({
                'done': [serialize_book(b) for b in done_books],
                'processing': [serialize_book(b) for b in processing_books],
                'error': [serialize_book(b) for b in error_books],
            })
        except Exception as e:
            logger.error("Error fetching books: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class BookDetailAPI(JsonLoginRequiredMixin, View):
    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            return JsonResponse(serialize_book(book))
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)
        except Exception as e:
            logger.error("Error fetching book %s: %s", pk, e)
            return JsonResponse({'error': str(e)}, status=500)

    def delete(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            book.delete()
            return JsonResponse({}, status=204)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)
        except Exception as e:
            logger.error("Error deleting book %s: %s", pk, e)
            return JsonResponse({'error': str(e)}, status=500)


class BookReprocessAPI(JsonLoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            data = json.loads(request.body) if request.body else {}
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)

        try:
            book = Book.objects.select_related('status').get(pk=pk)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)

        new_asin = data.get('asin', '').strip()
        if new_asin:
            errors = Book.objects.book_asin_validator(new_asin)
            if errors:
                return JsonResponse({'error': next(iter(errors.values()))}, status=400)
            book.asin = new_asin
            book.save(update_fields=['asin'])

        book.status.status = StatusChoices.PROCESSING
        book.status.message = ''
        book.status.save()

        try:
            m4b_merge_task.enqueue(book.asin)
        except Exception as e:
            logger.error("Failed to enqueue reprocess for book %s: %s", pk, e)
            return JsonResponse({'error': 'Failed to enqueue task'}, status=500)

        return JsonResponse({'success': True, 'asin': book.asin})


class BookMetadataAPI(JsonLoginRequiredMixin, View):
    def put(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)

        if not book.dest_path:
            return JsonResponse({'error': 'Book has no output file'}, status=400)
        if not Path(book.dest_path).exists():
            return JsonResponse({'error': 'Output file not found on disk'}, status=400)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)

        m4b_tool = shutil.which('m4b-tool')
        if not m4b_tool:
            return JsonResponse({'error': 'm4b-tool not available'}, status=503)

        args = [m4b_tool, 'meta']
        if data.get('title'):
            args += [f"--name={data['title']}", f"--album={data['title']}"]
            book.title = data['title']
        if data.get('author'):
            args.append(f"--albumartist={data['author']}")
        if data.get('narrator'):
            args.append(f"--artist={data['narrator']}")
        if data.get('year'):
            args.append(f"--year={data['year']}")
        if data.get('description'):
            args.append(f"--description={data['description']}")
        if data.get('genre'):
            args.append(f"--genre={data['genre']}")
        args.append(book.dest_path)

        try:
            result = subprocess.run(args, capture_output=True, timeout=60)
            if result.returncode != 0:
                err_out = result.stderr.decode(errors='replace')
                return JsonResponse({'error': f'm4b-tool failed: {err_out}'}, status=500)
        except subprocess.TimeoutExpired:
            return JsonResponse({'error': 'm4b-tool timed out'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        book.save()
        return JsonResponse(serialize_book(book))


class BookChaptersAPI(JsonLoginRequiredMixin, View):
    def _chapter_file(self, book: Book) -> Path:
        dest = Path(book.dest_path)
        return dest.parent / (dest.stem + '.chapters.txt')

    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)

        chapter_file = self._chapter_file(book)
        if not chapter_file.exists():
            return JsonResponse({'error': 'Chapter file not found'}, status=404)

        chapters = []
        idx = 0
        with open(chapter_file) as f:
            for line in f:
                stripped = line.strip()
                if not stripped or stripped.startswith('#'):
                    continue
                parts = stripped.split(' ', 1)
                if len(parts) == 2:
                    idx += 1
                    chapters.append({'index': idx, 'timestamp': parts[0], 'name': parts[1]})
        return JsonResponse(chapters, safe=False)

    def put(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)

        if not book.dest_path or not Path(book.dest_path).exists():
            return JsonResponse({'error': 'Output file not found on disk'}, status=400)

        mp4chaps = shutil.which('mp4chaps')
        if not mp4chaps:
            return JsonResponse({'error': 'mp4chaps not available'}, status=503)

        try:
            chapters = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)

        chapter_file = self._chapter_file(book)
        with open(chapter_file, 'w') as f:
            for ch in chapters:
                f.write(f"{ch['timestamp']} {ch['name']}\n")

        try:
            result = subprocess.run([mp4chaps, '-i', book.dest_path], capture_output=True, timeout=60)
            if result.returncode != 0:
                return JsonResponse({'error': result.stderr.decode(errors='replace')}, status=500)
        except subprocess.TimeoutExpired:
            return JsonResponse({'error': 'mp4chaps timed out'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

        return JsonResponse({'ok': True})


class BookCoverAPI(JsonLoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)

        if not book.dest_path or not Path(book.dest_path).exists():
            return JsonResponse({'error': 'Output file not found on disk'}, status=400)

        m4b_tool = shutil.which('m4b-tool')
        if not m4b_tool:
            return JsonResponse({'error': 'm4b-tool not available'}, status=503)

        # Determine mode — multipart sends mode in POST data, JSON sends in body
        if request.content_type and 'multipart' in request.content_type:
            mode = request.POST.get('mode')
        else:
            try:
                mode = json.loads(request.body).get('mode')
            except (json.JSONDecodeError, AttributeError):
                mode = None

        tmp_cover = None
        try:
            if mode == 'upload':
                cover_file = request.FILES.get('cover')
                if not cover_file:
                    return JsonResponse({'error': 'No file uploaded'}, status=400)
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    for chunk in cover_file.chunks():
                        tmp.write(chunk)
                    tmp_cover = tmp.name

            elif mode == 'refetch':
                if not book.cover_image_link:
                    return JsonResponse({'error': 'No cover image URL stored for this book'}, status=400)
                if not _validate_cover_url(book.cover_image_link):
                    return JsonResponse({'error': 'Cover image URL is not an allowed domain'}, status=400)
                import requests as req_lib
                resp = req_lib.get(book.cover_image_link, timeout=15)
                if resp.status_code != 200:
                    return JsonResponse({'error': 'Failed to download cover image'}, status=502)
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    tmp.write(resp.content)
                    tmp_cover = tmp.name
            else:
                return JsonResponse({'error': 'mode must be "upload" or "refetch"'}, status=400)

            result = subprocess.run(
                [m4b_tool, 'meta', f'--cover={tmp_cover}', book.dest_path],
                capture_output=True, timeout=60
            )
            if result.returncode != 0:
                return JsonResponse({'error': result.stderr.decode(errors='replace')}, status=500)

            return JsonResponse({'ok': True})

        except subprocess.TimeoutExpired:
            return JsonResponse({'error': 'm4b-tool timed out'}, status=500)
        except Exception as e:
            logger.error("Cover replace error for book %s: %s", pk, e)
            return JsonResponse({'error': str(e)}, status=500)
        finally:
            if tmp_cover:
                import os as _os
                try:
                    _os.unlink(tmp_cover)
                except OSError:
                    pass
