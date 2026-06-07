from django.urls import path, re_path

from .api import (
    AsinSearchAPI, BookDetailAPI, BooksListAPI, DirectoryListAPI,
    ImportStartAPI, MatchAPI, SettingsAPI, VersionsAPI,
)
from .auth_api import CheckSetupAPI, CurrentUserAPI, InitialSetupAPI, LoginAPI, LogoutAPI
from .spa_view import SPAView
from .users_api import UserDetailAPI, UsersListAPI

api_patterns = [
    # Auth
    path('api/auth/login', LoginAPI.as_view(), name='api-login'),
    path('api/auth/logout', LogoutAPI.as_view(), name='api-logout'),
    path('api/auth/user', CurrentUserAPI.as_view(), name='api-current-user'),
    path('api/auth/check-setup', CheckSetupAPI.as_view(), name='api-check-setup'),
    path('api/auth/setup', InitialSetupAPI.as_view(), name='api-setup'),

    # Books
    path('api/books/', BooksListAPI.as_view(), name='api-books'),
    path('api/books/<str:asin>/', BookDetailAPI.as_view(), name='api-book-detail'),

    # Import / match
    path('api/match/', MatchAPI.as_view(), name='api-match'),
    path('api/import/start/', ImportStartAPI.as_view(), name='api-import-start'),
    path('api/import/files/', DirectoryListAPI.as_view(), name='api-directory-list'),
    path('api/asin-search/', AsinSearchAPI.as_view(), name='api-asin-search'),

    # Settings & meta
    path('api/settings/', SettingsAPI.as_view(), name='api-settings'),
    path('api/versions/', VersionsAPI.as_view(), name='api-versions'),

    # Users
    path('api/users/', UsersListAPI.as_view(), name='api-users'),
    path('api/users/<int:pk>/', UserDetailAPI.as_view(), name='api-user-detail'),
]

urlpatterns = api_patterns + [
    # Catch-all: serve the React SPA for every non-API route
    re_path(r'^.*$', SPAView.as_view(), name='spa'),
]
