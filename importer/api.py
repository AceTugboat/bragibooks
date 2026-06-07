"""
API endpoints for React frontend
"""
import logging
from pathlib import Path
from django.conf import settings
from django.http import HttpResponseBadRequest, JsonResponse
from django.views import View
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import requests

from .models import Book, Setting, StatusChoices
from .version import __version__ as bragibooks_version
from utils.search_tools import ScoreTool, SearchTool
import django

logger = logging.getLogger(__name__)


class DirectoryListAPI(View):
    """API endpoint to get directory contents"""
    
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        from .views import rootdir
        try:
            all_items = []
            root_path = Path(rootdir)
            if not root_path.is_dir():
                return JsonResponse({'contents': []})
            
            # Walk through all subdirectories
            for item in root_path.rglob('*'):
                stat = item.stat()
                all_items.append({
                    'path': str(item),
                    'name': item.name,
                    'is_directory': item.is_dir(),
                    'created_at': stat.st_ctime,  # Creation time
                    'modified_at': stat.st_mtime,  # Modification time
                    'size': stat.st_size if item.is_file() else 0,
                })
            
            return JsonResponse({'contents': all_items})
        except Exception as e:
            logger.error(f"Error listing directory: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class ImportStartAPI(View):
    """API endpoint to start import process"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            input_dirs = data.get('input_dir', [])
            
            if not input_dirs:
                return JsonResponse({'error': 'No directories selected'}, status=400)
            
            # Store in session like the old view did
            request.session['input_dir'] = input_dirs
            return JsonResponse({'success': True})
        except Exception as e:
            logger.error(f"Error starting import: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class BooksListAPI(View):
    """API endpoint to get books by status"""
    
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
            
            def serialize_book(book):
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
            
            return JsonResponse({
                'done': [serialize_book(book) for book in done_books],
                'processing': [serialize_book(book) for book in processing_books],
                'error': [serialize_book(book) for book in error_books],
            })
        except Exception as e:
            logger.error(f"Error fetching books: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class BookDetailAPI(View):
    """API endpoint to get a single book by ID"""
    
    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            
            return JsonResponse({
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
            })
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)
        except Exception as e:
            logger.error(f"Error fetching book {pk}: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class MatchAPI(View):
    """API endpoint to match ASINs"""
    
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        """Get the list of directories to match from session"""
        try:
            input_dirs = request.session.get('input_dir', [])
            return JsonResponse({'input_dirs': input_dirs})
        except Exception as e:
            logger.error(f"Error getting match data: {e}")
            return JsonResponse({'error': str(e)}, status=500)

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        try:
            # Import here to avoid circular imports
            from .views import MatchView
            
            # Reuse the existing match view logic
            match_view = MatchView()
            match_view.request = request
            result = match_view.post(request)
            
            # If it's a redirect, return success
            if result.status_code == 302:
                return JsonResponse({'success': True})
            else:
                return result
        except Exception as e:
            logger.error(f"Error in match: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class SettingsAPI(View):
    """API endpoint for settings"""
    
    def get(self, request):
        try:
            settings = Setting.objects.first()
            if settings:
                return JsonResponse({
                    'id': settings.id,
                    'api_url': settings.api_url,
                    'completed_directory': settings.completed_directory,
                    'input_directory': settings.input_directory,
                    'num_cpus': settings.num_cpus,
                    'output_directory': settings.output_directory,
                    'output_scheme': settings.output_scheme,
                })
            return JsonResponse(None, safe=False)
        except Exception as e:
            logger.error(f"Error fetching settings: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            existing_settings = Setting.objects.first()
            
            if existing_settings:
                # Update existing
                for field in ['api_url', 'completed_directory', 'input_directory', 
                             'num_cpus', 'output_directory', 'output_scheme']:
                    if field in data:
                        setattr(existing_settings, field, data[field])
                existing_settings.save()
                settings = existing_settings
            else:
                # Create new
                settings = Setting.objects.create(**data)
            
            return JsonResponse({
                'id': settings.id,
                'api_url': settings.api_url,
                'completed_directory': settings.completed_directory,
                'input_directory': settings.input_directory,
                'num_cpus': settings.num_cpus,
                'output_directory': settings.output_directory,
                'output_scheme': settings.output_scheme,
            })
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class VersionsAPI(View):
    """API endpoint for version information"""
    
    def get(self, request):
        try:
            # Get m4b-merge version
            import subprocess
            try:
                m4b_version = subprocess.check_output(
                    ['m4b-merge', '--version'], 
                    stderr=subprocess.STDOUT
                ).decode().strip()
            except:
                m4b_version = 'unknown'
            
            return JsonResponse({
                'bragibooks_version': bragibooks_version,
                'django_version': django.get_version(),
                'm4b_merge_version': m4b_version,
            })
        except Exception as e:
            logger.error(f"Error fetching versions: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class AsinSearchAPI(View):
    """API endpoint for ASIN search (used by React Match page)"""
    
    def get(self, request):
        accepted_keywords = ["media_dir", "title", "author", "keywords"]

        if any(key not in accepted_keywords for key in request.GET.keys()):
            return HttpResponseBadRequest(
                f"'{', '.join(request.GET.keys() - accepted_keywords)}' are not valid parameters. \
                Valid search parameters are {accepted_keywords}"
            )

        return self.search(
            request.GET.get("media_dir"),
            request.GET.get("title"),
            request.GET.get("author"),
            request.GET.get("keywords")
        )

    def search(self, media_dir: str = "", title: str = "", author: str = "", keywords: str = "") -> JsonResponse:
        """
            Search for an album.
        """
        # Instantiate search helper
        search_helper = SearchTool(
            filename=media_dir, title=title, author=author, keywords=keywords)

        # Call search API
        results = self.call_search_api(search_helper)

        # Write search result status to log
        if not results:
            logger.warn(
                f'No results found for query {search_helper.normalizedFileName}')
            return JsonResponse([], safe=False)

        logger.debug(
            f'Found {len(results)} result(s) for query \"{search_helper.normalizedFileName}\"')

        results = self.process_results(search_helper, results)

        return JsonResponse(results, safe=False)

    @staticmethod
    def process_results(helper: SearchTool, result) -> list[dict[str, str | int]]:
        """
            Process the results from the API call.
        """
        scored_results = []
        # Walk the found items and gather extended information
        logger.debug(msg="Search results")
        for index, result_dict in enumerate(result):
            score_helper = ScoreTool(
                helper, index, settings.LANGUAGE_CODE, result_dict)
            scored_results.append(score_helper.run_score_book())

            # Print separators for easy reading
            if index <= len(result):
                logger.debug("-" * 35)

        return sorted(scored_results, key=lambda inf: inf['score'], reverse=True)

    @staticmethod
    def call_search_api(helper: SearchTool):
        '''
            Builds URL then calls API, returns the JSON to helper function.
        '''
        query = helper.build_search_args()
        search_url = helper.build_url(query)
        request = requests.get(search_url)
        return helper.parse_api_response(request.json())
