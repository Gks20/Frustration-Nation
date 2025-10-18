"""
URL configuration for project_red project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# Import Django admin interface
from django.contrib import admin

# Import path and include functions for routing URLs to views or other URL configurations
from django.urls import path, include

# Import settings and static helpers for serving media/static files during development
from django.conf import settings
from django.conf.urls.static import static

# Import views from the frontend app (used for main site pages)
from frontend import views

# Define all URL patterns for the project
urlpatterns = [
    path('admin/', admin.site.urls), # Django admin panel route
    path("", views.index, name="index"), # project home page
    path("game/", views.game, name="game"), # Route for the main game page
    path("login/", views.login, name="login"), # Route for the login page
    path("start/", views.start, name="start"), # Route for the start page
    path("store/", include('store.urls')), # Include URL configurations from the store app
    path("", include('gameplay.urls')),  # Include gameplay API endpoints
]

# # Serve static and media files during development (when DEBUG = True)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # Serve static files (CSS, JS, images in STATIC directory)

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # Serve user-uploaded media files (in MEDIA directory)
