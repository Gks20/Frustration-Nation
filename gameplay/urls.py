from django.urls import path
from . import views

app_name = 'gameplay'

urlpatterns = [
    path('quick-login/', views.quick_login, name='quick_login'),
    path('start-fishing/', views.start_fishing, name='start_fishing'),
    path('cast-line/', views.cast_line, name='cast_line'),
    path('stats/', views.player_stats, name='player_stats'),
]