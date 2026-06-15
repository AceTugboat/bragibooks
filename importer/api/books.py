import json
import logging
from django.http import JsonResponse
from django.views import View

from ..models import Book, StatusChoices
from ..tasks import m4b_merge_task
from .mixins import JsonLoginRequiredMixin

logger = logging.getLogger(__name__)


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
