import base64
import json
import logging

from django.conf import settings as django_settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url

from ..models import PasskeyCredential
from .mixins import JsonLoginRequiredMixin

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


class PasskeyRegisterBeginAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        options = generate_registration_options(
            rp_id=django_settings.PASSKEY_RP_ID,
            rp_name=django_settings.PASSKEY_RP_NAME,
            user_id=str(request.user.pk).encode(),
            user_name=request.user.username,
            user_display_name=request.user.username,
        )
        request.session['webauthn_reg_challenge'] = base64.b64encode(options.challenge).decode()
        return JsonResponse(json.loads(options_to_json(options)))


class PasskeyRegisterCompleteAPI(JsonLoginRequiredMixin, View):
    def post(self, request):
        try:
            credential = json.loads(request.body)
            challenge_b64 = request.session.pop('webauthn_reg_challenge', None)
            if not challenge_b64:
                return JsonResponse({'error': 'No registration challenge in session'}, status=400)
            verification = verify_registration_response(
                credential=credential,
                expected_challenge=base64.b64decode(challenge_b64),
                expected_rp_id=django_settings.PASSKEY_RP_ID,
                expected_origin=django_settings.PASSKEY_ORIGIN,
            )
            PasskeyCredential.objects.create(
                user=request.user,
                credential_id=bytes_to_base64url(verification.credential_id),
                public_key=bytes_to_base64url(verification.credential_public_key),
                sign_count=verification.sign_count,
                name=credential.get('name', ''),
            )
            return JsonResponse({'ok': True})
        except Exception as e:
            logger.error("Passkey register complete error: %s", e)
            return JsonResponse({'error': str(e)}, status=400)


class PasskeyLoginBeginAPI(View):
    def get(self, request):
        options = generate_authentication_options(
            rp_id=django_settings.PASSKEY_RP_ID,
        )
        request.session['webauthn_auth_challenge'] = base64.b64encode(options.challenge).decode()
        return JsonResponse(json.loads(options_to_json(options)))


class PasskeyLoginCompleteAPI(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            credential = json.loads(request.body)
            challenge_b64 = request.session.pop('webauthn_auth_challenge', None)
            if not challenge_b64:
                return JsonResponse({'error': 'No authentication challenge in session'}, status=400)

            cred_id_b64 = credential.get('id', '')
            try:
                passkey = PasskeyCredential.objects.select_related('user').get(credential_id=cred_id_b64)
            except PasskeyCredential.DoesNotExist:
                return JsonResponse({'error': 'Unknown credential'}, status=401)

            verification = verify_authentication_response(
                credential=credential,
                expected_challenge=base64.b64decode(challenge_b64),
                expected_rp_id=django_settings.PASSKEY_RP_ID,
                expected_origin=django_settings.PASSKEY_ORIGIN,
                credential_public_key=base64url_to_bytes(passkey.public_key),
                credential_current_sign_count=passkey.sign_count,
            )
            passkey.sign_count = verification.new_sign_count
            passkey.last_used_at = timezone.now()
            passkey.save(update_fields=['sign_count', 'last_used_at'])

            login(request, passkey.user)
            return JsonResponse({
                'id': passkey.user.id,
                'username': passkey.user.username,
                'email': passkey.user.email,
                'is_staff': passkey.user.is_staff,
                'is_superuser': passkey.user.is_superuser,
            })
        except Exception as e:
            logger.error("Passkey login complete error: %s", e)
            return JsonResponse({'error': str(e)}, status=401)


class PasskeyListAPI(JsonLoginRequiredMixin, View):
    def get(self, request):
        passkeys = request.user.passkeys.values('id', 'name', 'created_at', 'last_used_at')
        return JsonResponse(list(passkeys), safe=False)


class PasskeyDeleteAPI(JsonLoginRequiredMixin, View):
    def delete(self, request, pk):
        try:
            passkey = PasskeyCredential.objects.get(pk=pk, user=request.user)
            passkey.delete()
            return JsonResponse({}, status=204)
        except PasskeyCredential.DoesNotExist:
            return JsonResponse({'error': 'Passkey not found'}, status=404)
