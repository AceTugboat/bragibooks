"""
User management API endpoints
"""
import logging
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

logger = logging.getLogger(__name__)


class UsersListAPI(View):
    """List and create users"""
    
    def get(self, request):
        """List all users (admin only)"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        users = User.objects.all().values(
            'id', 'username', 'email', 'is_staff', 'is_superuser',
            'is_active', 'date_joined', 'last_login'
        )
        return JsonResponse(list(users), safe=False)
    
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Create a new user (admin only)"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
            is_superuser = data.get('is_superuser', False)
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password required'}, status=400)
            
            if len(password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            # Create user
            if is_superuser:
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
            else:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
            
        except Exception as e:
            logger.error(f"Create user error: {e}")
            return JsonResponse({'error': str(e)}, status=500)


class UserDetailAPI(View):
    """Get, update, or delete a specific user"""
    
    def get(self, request, pk):
        """Get user details (admin only)"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        try:
            user = User.objects.get(pk=pk)
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def put(self, request, pk):
        """Update user (admin only)"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        try:
            user = User.objects.get(pk=pk)
            data = json.loads(request.body)
            
            # Update fields
            if 'email' in data:
                user.email = data['email']
            
            if 'is_superuser' in data:
                # Prevent removing last superuser
                if not data['is_superuser'] and user.is_superuser:
                    if User.objects.filter(is_superuser=True).count() <= 1:
                        return JsonResponse({'error': 'Cannot remove last admin'}, status=400)
                user.is_superuser = data['is_superuser']
                user.is_staff = data['is_superuser']  # Superusers are also staff
            
            if 'password' in data and data['password']:
                if len(data['password']) < 8:
                    return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
                user.set_password(data['password'])
            
            user.save()
            
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            logger.error(f"Update user error: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    def delete(self, request, pk):
        """Delete user (admin only)"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        try:
            user = User.objects.get(pk=pk)
            
            # Prevent deleting self
            if user.id == request.user.id:
                return JsonResponse({'error': 'Cannot delete yourself'}, status=400)
            
            # Prevent deleting last superuser
            if user.is_superuser and User.objects.filter(is_superuser=True).count() <= 1:
                return JsonResponse({'error': 'Cannot delete last admin'}, status=400)
            
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'})
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            logger.error(f"Delete user error: {e}")
            return JsonResponse({'error': str(e)}, status=500)
