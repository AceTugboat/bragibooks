import json
import logging
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


class LoginAPI(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            if not username or not password:
                return JsonResponse({'error': 'Username and password required'}, status=400)
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                })
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            logger.error("Login error: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class LogoutAPI(View):
    def post(self, request):
        try:
            logout(request)
            return JsonResponse({'message': 'Logged out successfully'})
        except Exception as e:
            logger.error("Logout error: %s", e)
            return JsonResponse({'error': str(e)}, status=500)


class CurrentUserAPI(View):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
            })
        return JsonResponse({'error': 'Not authenticated'}, status=401)


class CheckSetupAPI(View):
    def get(self, request):
        has_admin = User.objects.filter(is_superuser=True).exists()
        return JsonResponse({'setup_needed': not has_admin})


class InitialSetupAPI(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            if User.objects.filter(is_superuser=True).exists():
                return JsonResponse({'error': 'Setup already completed'}, status=400)
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
            if not username or not password:
                return JsonResponse({'error': 'Username and password required'}, status=400)
            if len(password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            user = User.objects.create_superuser(username=username, email=email, password=password)
            login(request, user)
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
        except Exception as e:
            logger.error("Initial setup error: %s", e)
            return JsonResponse({'error': str(e)}, status=500)
