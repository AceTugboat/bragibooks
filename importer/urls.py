from django.contrib.auth import views as auth_views
from django.urls import path, re_path
from django.views.generic import RedirectView

from . import views

urlpatterns = [
    path('', RedirectView.as_view(url='home/', permanent=False), name='home_redirect'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('home/', views.ImportView.as_view(), name='home'),
    path('match/', views.MatchView.as_view(), name='match'),
    re_path(r'^asin-search/$', views.AsinSearch.as_view(), name='asin-search'),
    path('books/', views.BookListView.as_view(), name='books'),
    path('settings/', views.SettingView.as_view(), name='settings'),
]
