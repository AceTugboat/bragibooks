import json
import logging
import requests
from pathlib import Path

from django.conf import settings
from django.http import HttpResponseBadRequest, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie

from ..models import Setting
from ..services.match import MatchEntry, MatchValidationError, process_match
from .mixins import JsonLoginRequiredMixin
from utils.search_tools import ScoreTool, SearchTool

logger = logging.getLogger(__name__)


class DirectoryListAPI(JsonLoginRequiredMixin, View):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        try:
            setting = Setting.load()
            input_dir = setting.input_directory if setting else None
            if not input_dir:
                input_dir = '/downloads' if Path('/downloads').is_dir() else f"{Path.home()}/input"
            root_path = Path(input_dir)
            if not root_path.is_dir():
                return JsonResponse({'contents': []})
            all_items = []
            for item in root_path.rglob('*'):
                stat = item.stat()
                all_items.append({
                    'path': str(item),
                    'name': item.name,
                    'is_directory': item.is_dir(),
                    'created_at': stat.st_ctime,
                    'modified_at': stat.st_mtime,
                    'size': stat.st_size if item.is_file() else 0,
                })
            return JsonResponse({'contents': all_items})
        except Exception as e:
            logger.error("Error listing directory: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class ImportStartAPI(JsonLoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            input_dirs = data.get('input_dir', [])
            if not input_dirs:
                return JsonResponse({'error': 'No directories selected'}, status=400)
            request.session['input_dir'] = input_dirs
            return JsonResponse({'success': True})
        except Exception as e:
            logger.error("Error starting import: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class MatchAPI(JsonLoginRequiredMixin, View):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        try:
            input_dirs = request.session.get('input_dir', [])
            return JsonResponse({'input_dirs': input_dirs})
        except Exception as e:
            logger.error("Error getting match data: %s", e)
            return JsonResponse({'error': str(e)}, status=500)

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        try:
            data = json.loads(request.body)
            entries = [
                MatchEntry(src_path=k, asin=v)
                for k, v in data.items()
                if k and v
            ]
            books = process_match(entries)
            return JsonResponse({'success': True, 'books_queued': len(books)})
        except MatchValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
        except Exception as e:
            logger.error("Unexpected error in MatchAPI.post: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class AsinSearchAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        accepted_keywords = ["media_dir", "title", "author", "keywords"]
        if any(key not in accepted_keywords for key in request.GET.keys()):
            return HttpResponseBadRequest(
                f"'{', '.join(request.GET.keys() - accepted_keywords)}' are not valid parameters. "
                f"Valid search parameters are {accepted_keywords}"
            )
        return self.search(
            request.GET.get("media_dir"),
            request.GET.get("title"),
            request.GET.get("author"),
            request.GET.get("keywords"),
        )

    def search(self, media_dir="", title="", author="", keywords=""):
        search_helper = SearchTool(filename=media_dir, title=title, author=author, keywords=keywords)
        results = self.call_search_api(search_helper)
        if not results:
            logger.warning("No results found for query %s", search_helper.normalizedFileName)
            return JsonResponse([], safe=False)
        logger.debug("Found %d result(s) for query '%s'", len(results), search_helper.normalizedFileName)
        results = self.process_results(search_helper, results)
        return JsonResponse(results, safe=False)

    @staticmethod
    def process_results(helper: SearchTool, result):
        scored_results = []
        for index, result_dict in enumerate(result):
            score_helper = ScoreTool(helper, index, settings.LANGUAGE_CODE, result_dict)
            scored_results.append(score_helper.run_score_book())
            if index <= len(result):
                logger.debug("-" * 35)
        return sorted(scored_results, key=lambda inf: inf['score'], reverse=True)

    @staticmethod
    def call_search_api(helper: SearchTool):
        query = helper.build_search_args()
        search_url = helper.build_url(query)
        response = requests.get(search_url)
        return helper.parse_api_response(response.json())
