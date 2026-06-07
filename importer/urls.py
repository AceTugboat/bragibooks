from django.urls import path, re_path
from . import api, auth_api, users_api
from .spa_view import SPAView
from . import views, api

urlpatterns = [
    # Authentication endpoints
    path('api/auth/login', auth_api.LoginAPI.as_view(), name='api-auth-login'),
    path('api/auth/logout', auth_api.LogoutAPI.as_view(), name='api-auth-logout'),
    path('api/auth/user', auth_api.CurrentUserAPI.as_view(), name='api-auth-user'),
    path('api/auth/check-setup', auth_api.CheckSetupAPI.as_view(), name='api-auth-check-setup'),
    path('api/auth/initial-setup', auth_api.InitialSetupAPI.as_view(), name='api-auth-initial-setup'),
    
    # User management endpoints (admin only)
    path('api/users/', users_api.UsersListAPI.as_view(), name='api-users-list'),
    path('api/users/<int:pk>/', users_api.UserDetailAPI.as_view(), name='api-users-detail'),
    
    # API endpoints for React frontend
    path('api/directories/', api.DirectoryListAPI.as_view(), name='api-directories'),
    path('api/import/start', api.ImportStartAPI.as_view(), name='api-import-start'),
    path('api/books/', api.BooksListAPI.as_view(), name='api-books'),
    path('api/books/<int:pk>/', api.BookDetailAPI.as_view(), name='api-book-detail'),
    path('api/match/', api.MatchAPI.as_view(), name='api-match'),
    path('api/settings/', api.SettingsAPI.as_view(), name='api-settings'),
    path('api/versions/', api.VersionsAPI.as_view(), name='api-versions'),
    
    # ASIN search endpoint (used by React app)
    re_path(r'^asin-search/$', api.AsinSearchAPI.as_view(), name='asin-search'),
    
    # React SPA - catch all routes and serve index
    # This must be last to catch all non-API routes
    re_path(r'^.*$', SPAView.as_view(), name='spa'),
]
