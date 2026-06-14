from django.urls import path, re_path

from .api.auth import CheckSetupAPI, CurrentUserAPI, InitialSetupAPI, LoginAPI, LogoutAPI
from .api.books import BookDetailAPI, BooksListAPI
from .api.config import SettingsAPI, SettingsVerifyAPI, VersionsAPI
from .api.import_pipeline import AsinSearchAPI, DirectoryListAPI, ImportStartAPI, MatchAPI
from .api.users import UserDetailAPI, UsersListAPI
from .spa_view import SPAView

api_patterns = [
    # Auth
    path('api/auth/login', LoginAPI.as_view(), name='api-login'),
    path('api/auth/logout', LogoutAPI.as_view(), name='api-logout'),
    path('api/auth/user', CurrentUserAPI.as_view(), name='api-current-user'),
    path('api/auth/check-setup', CheckSetupAPI.as_view(), name='api-check-setup'),
    path('api/auth/setup', InitialSetupAPI.as_view(), name='api-setup'),

    # Books
    path('api/books/', BooksListAPI.as_view(), name='api-books'),
    path('api/books/<int:pk>/', BookDetailAPI.as_view(), name='api-book-detail'),

    # Import / match
    path('api/match/', MatchAPI.as_view(), name='api-match'),
    path('api/import/start/', ImportStartAPI.as_view(), name='api-import-start'),
    path('api/import/files/', DirectoryListAPI.as_view(), name='api-directory-list'),
    path('api/asin-search/', AsinSearchAPI.as_view(), name='api-asin-search'),

    # Settings & meta
    path('api/settings/', SettingsAPI.as_view(), name='api-settings'),
    path('api/settings/verify/', SettingsVerifyAPI.as_view(), name='api-settings-verify'),
    path('api/versions/', VersionsAPI.as_view(), name='api-versions'),

    # Users
    path('api/users/', UsersListAPI.as_view(), name='api-users'),
    path('api/users/<int:pk>/', UserDetailAPI.as_view(), name='api-user-detail'),
]

urlpatterns = api_patterns + [
    re_path(r'^.*$', SPAView.as_view(), name='spa'),
]
