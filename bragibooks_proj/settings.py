"""
Django settings for bragibooks_proj project.
"""

import os
import dj_database_url

from django.conf.global_settings import LOGIN_URL

APP_NAME = "Bragi Books"

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# config section for docker
if os.path.isdir("/config"):
    CONFIG_DIR = os.path.abspath("/config")
else:
    CONFIG_DIR = os.path.join(BASE_DIR, 'config')

SECRET_PATH = os.path.join(CONFIG_DIR, 'secret_key.txt')

# SECURITY WARNING: keep the secret key used in production secret!
with open(SECRET_PATH) as f:
    SECRET_KEY = f.read().strip()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True if os.environ.get('DEBUG', 'false').lower() == "true" else False

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'importer',
    'django_tasks_db',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_vite',
]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bragibooks_proj.urls'

# Production deployment - set HOSTED_DOMAIN to your domain (e.g., bragibooks.example.com)
# This will automatically configure CORS and CSRF settings
HOSTED_DOMAIN = os.getenv("HOSTED_DOMAIN", "")

if HOSTED_DOMAIN:
    trusted_origins = [
        f'https://{HOSTED_DOMAIN}',
        f'https://www.{HOSTED_DOMAIN}',
    ]
    # Production: use the hosted domain
    CORS_ALLOWED_ORIGINS = trusted_origins
    CSRF_TRUSTED_ORIGINS = trusted_origins if not os.getenv("CSRF_TRUSTED_ORIGINS") else os.getenv("CSRF_TRUSTED_ORIGINS").split(",")
else:
    trusted_origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

    # Development: use localhost
    CORS_ALLOWED_ORIGINS = trusted_origins
    CSRF_TRUSTED_ORIGINS = trusted_origins

CORS_ALLOW_CREDENTIALS = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'importer.context_processors.add_version_to_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'bragibooks_proj.wsgi.application'

# Database
# dj_database_url.config() reads the DATABASE_URL environment variable automatically.
# If DATABASE_URL is not set, it falls back to the default below (SQLite).
# To use PostgreSQL, set DATABASE_URL=postgres://user:pass@host:5432/dbname
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{os.path.join(CONFIG_DIR, 'db.sqlite3')}",
        conn_max_age=600,
    )
}

DEFAULT_AUTO_FIELD='django.db.models.AutoField'

# Password validation

LOGIN_URL = 'login'  # Redirect to this URL if not logged in
LOGIN_REDIRECT_URL = 'home'  # Redirect to this URL after login
LOGOUT_REDIRECT_URL = 'login'  # Redirect to this URL after logout

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

# Django Vite
DJANGO_VITE_ASSETS_PATH = os.path.join(BASE_DIR, 'static', 'dist')
DJANGO_VITE_DEV_MODE = DEBUG
DJANGO_VITE_DEV_SERVER_PORT = 5173
DJANGO_VITE_DEV_SERVER_HOST = 'localhost'
DJANGO_VITE_MANIFEST_PATH = os.path.join(DJANGO_VITE_ASSETS_PATH, 'manifest.json')

# Logging
# Set environment variable DJANGO_LOG_LEVEL to desired level
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.getenv('LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        'gunicorn': {
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'handlers': ['console'],
            'propagate': True,
        },
    },
}


TASKS = {
    "default": {
        "BACKEND": "django_tasks_db.DatabaseBackend",
        "QUEUES": ["default"],
    }
}
