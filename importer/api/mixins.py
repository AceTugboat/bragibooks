from django.http import JsonResponse


class JsonLoginRequiredMixin:
    """Return JSON 401 for unauthenticated requests instead of redirecting to login."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return super().dispatch(request, *args, **kwargs)
