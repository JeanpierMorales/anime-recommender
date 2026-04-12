"""
URLs de la aplicación anime_app
Mapea las vistas a rutas HTTP específicas
"""

from django.urls import path
from . import views

# Nombre de la aplicación (usado en reverse() y namespacing)
app_name = "anime_app"

urlpatterns = [
    # Página principal del frontend
    # GET: /
    path("", views.index, name="index"),

    # Endpoint para búsqueda de animes
    # GET: /anime/search/?query=Death+Note
    # POST: /anime/search/ con JSON: {"query": "Death Note"}
    path("anime/search/", views.anime_search, name="anime_search"),
    
    # Endpoint para obtener detalles de un anime específico
    # GET: /anime/1/
    # Devuelve: sinopsis, episodios, score, géneros, URLs, etc.
    path("anime/<int:mal_id>/", views.anime_detail, name="anime_detail"),
]
