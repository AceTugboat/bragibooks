import json
import logging
import os
import subprocess
from pathlib import Path

import django
from django.http import JsonResponse
from django.views import View

from ..models import Setting
from ..version import __version__ as bragibooks_version
from .mixins import JsonLoginRequiredMixin

logger = logging.getLogger(__name__)


class SettingsAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        try:
            s = Setting.load()
            if s:
                return JsonResponse({
                    'id': s.id,
                    'api_url': s.api_url,
                    'archive_directory': s.archive_directory,
                    'input_directory': s.input_directory,
                    'num_cpus': s.num_cpus,
                    'output_directory': s.output_directory,
                    'output_scheme': s.output_scheme,
                })
            return JsonResponse(None, safe=False)
        except Exception as e:
            logger.error("Error fetching settings: %s", e)
            return JsonResponse({'error': str(e)}, status=500)

    def post(self, request):
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        try:
            data = json.loads(request.body)
            s = Setting.load()
            if s:
                for field in ['api_url', 'archive_directory', 'input_directory',
                              'num_cpus', 'output_directory', 'output_scheme']:
                    if field in data:
                        setattr(s, field, data[field])
                s.save()
            else:
                s = Setting.objects.create(**data)
            return JsonResponse({
                'id': s.id,
                'api_url': s.api_url,
                'archive_directory': s.archive_directory,
                'input_directory': s.input_directory,
                'num_cpus': s.num_cpus,
                'output_directory': s.output_directory,
                'output_scheme': s.output_scheme,
            })
        except Exception as e:
            logger.error("Error updating settings: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class SettingsVerifyAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        try:
            s = Setting.load()
            if not s:
                return JsonResponse({'error': 'Settings not configured'}, status=400)

            def check_path(path_str):
                if not path_str:
                    return 'not_configured'
                p = Path(path_str)
                if not p.is_dir():
                    return 'missing'
                if not os.access(p, os.W_OK):
                    return 'not_writable'
                return 'ok'

            return JsonResponse({
                'input_directory': check_path(s.input_directory),
                'output_directory': check_path(s.output_directory),
                'archive_directory': check_path(s.archive_directory),
            })
        except Exception as e:
            logger.error("Error verifying paths: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class VersionsAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        try:
            try:
                m4b_version = subprocess.check_output(
                    ['m4b-merge', '--version'],
                    stderr=subprocess.STDOUT
                ).decode().strip()
            except Exception:
                m4b_version = 'unknown'
            return JsonResponse({
                'bragibooks_version': bragibooks_version,
                'django_version': django.get_version(),
                'm4b_merge_version': m4b_version,
            })
        except Exception as e:
            logger.error("Error fetching versions: %s", e)
            return JsonResponse({'error': str(e)}, status=500)
