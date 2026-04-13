"""
Servicio para integración con Jikan API (MyAnimeList)
Maneja las peticiones HTTP a la API externa y cachea los datos en nuestra DB
"""

import requests
from django.core.cache import cache
from .models import Anime

# URL base de la API Jikan (gratuita, sin autenticación)
JIKAN_API_BASE = "https://api.jikan.moe/v4"
# Tiempo de caché en segundos (1 hora = 3600)
CACHE_TIME = 3600 # Tiempo optimo para balancear frescura de datos y reducción de llamadas a la API


def search_anime(query):
    """
    Busca animes en Jikan API por nombre/query.
    
    Args:
        query (str): Término de búsqueda (ej: "Death Note")
    
    Returns:
        list: Lista de animes encontrados con datos básicos
        
    Ejemplo:
        >>> search_anime("Death Note")
        [
            {
                'mal_id': 1,
                'title': 'Death Note',
                'image_url': '...',
                'genres': 'Thriller, ...'
            },
            ...
        ]
    """
    
    # Validar que query no esté vacía
    if not query or not query.strip(): # Si el query es vacío o solo espacios, retornar lista vacía
        return []
    
    # Crear clave de caché única para esta búsqueda
    cache_key = f"search_anime_{query.strip().lower().replace(' ', '_').replace(':', '')}" # por ejemplo "Death Note" -> "search_anime_death_note" para evitar problemas con espacios o caracteres especiales
    
    # Verificar si ya tenemos este resultado en caché para evitar consultas repetidas a la API
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        print(f"[CACHÉ] Retornando resultado en caché para: {query}")
        return cached_result
    
    try:
        # Hacer petición GET a Jikan API con parámetro de búsqueda
        print(f"[API] Buscando en Jikan: {query}")
        response = requests.get(
            f"{JIKAN_API_BASE}/anime",
            params={"q": query, "limit": 25},
            timeout=10
        )
        response.raise_for_status()  # Lanzar excepción si hay error HTTP
        
        data = response.json()
        results = []
        
        # Procesar cada anime encontrado
        for anime_data in data.get("data", []):
            anime_info = {
                "mal_id": anime_data.get("mal_id"),
                "title": anime_data.get("title"),
                "image_url": anime_data.get("images", {}).get("jpg", {}).get("image_url"),
                "genres": ", ".join([g["name"] for g in anime_data.get("genres", [])])
            }
            results.append(anime_info)
            
            # Guardar/actualizar anime en nuestra BD para caché local
            _save_anime_to_db(anime_info)
        
        # Guardar resultados en caché durante 1 hora
        cache.set(cache_key, results, CACHE_TIME)
        print(f"[GUARDADO] {len(results)} animes en caché")
        
        return results
        
    except requests.exceptions.RequestException as e:
        # Si hay error en la API, intentar devolver resultados locales
        print(f"[ERROR] Fallo en petición a Jikan: {str(e)}")
        return _get_anime_from_db(query)


def get_anime_detail(mal_id):
    """
    Obtiene detalles completos de un anime específico.
    
    Args:
        mal_id (int): ID de MyAnimeList del anime
    
    Returns:
        dict: Datos completos del anime (sinopsis, score, episodios, etc)
        
    Ejemplo:
        >>> get_anime_detail(1)
        {
            'mal_id': 1,
            'title': 'Death Note',
            'synopsis': 'A high school student...',
            'episodes': 37,
            'score': 9.13,
            ...
        }
    """
    
    # Crear clave de caché única para este anime
    cache_key = f"anime_detail_{mal_id}"
    
    # Verificar si ya tenemos este detalle en caché
    cached_detail = cache.get(cache_key)
    if cached_detail is not None:
        print(f"[CACHÉ] Retornando detalle en caché para mal_id: {mal_id}")
        return cached_detail
    
    try:
        # Hacer petición GET a Jikan API para obtener detalles del anime
        print(f"[API] Obteniendo detalles de mal_id: {mal_id}")
        response = requests.get(
            f"{JIKAN_API_BASE}/anime/{mal_id}",
            timeout=10
        )
        response.raise_for_status()
        
        anime_data = response.json().get("data", {})
        
        # Construir objeto con información detallada
        detail = {
            "mal_id": anime_data.get("mal_id"),
            "title": anime_data.get("title"),
            "title_english": anime_data.get("title_english"),
            "synopsis": anime_data.get("synopsis"),
            "episodes": anime_data.get("episodes"),
            "status": anime_data.get("status"),
            "aired_from": anime_data.get("aired", {}).get("from"),
            "aired_to": anime_data.get("aired", {}).get("to"),
            "score": anime_data.get("score"),
            "scored_by": anime_data.get("scored_by"),
            "rank": anime_data.get("rank"),
            "genres": [g["name"] for g in anime_data.get("genres", [])],
            "image_url": anime_data.get("images", {}).get("jpg", {}).get("image_url"),
            "url": anime_data.get("url"),
        }
        
        # Guardar/actualizar anime en nuestra BD
        anime_info = {
            "mal_id": detail["mal_id"],
            "title": detail["title"],
            "image_url": detail["image_url"],
            "genres": ", ".join(detail["genres"])
        }
        _save_anime_to_db(anime_info)
        
        # Guardar detalles en caché durante 1 hora
        cache.set(cache_key, detail, CACHE_TIME)
        print(f"[GUARDADO] Detalles guardados en caché")
        
        return detail
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Fallo al obtener detalles: {str(e)}")
        return None


def _save_anime_to_db(anime_info):
    """
    Guarda o actualiza un anime en nuestra base de datos local.
    Esto actúa como caché, evitando consultas repetidas a la API.
    
    Args:
        anime_info (dict): Diccionario con datos del anime
    """
    try:
        # Usar get_or_create para insertar si no existe, actualizar si existe
        anime, created = Anime.objects.update_or_create(
            mal_id=anime_info["mal_id"],
            defaults={
                "title": anime_info.get("title", "Unknown"),
                "image_url": anime_info.get("image_url", ""),
                "genres": anime_info.get("genres", "")
            }
        )
        action = "Creado" if created else "Actualizado"
        print(f"[DB] {action} anime: {anime.title}")
        
    except Exception as e:
        print(f"[ERROR BD] Error guardando anime: {str(e)}")


def _get_anime_from_db(query):
    """
    Busca animes en la base de datos local como fallback.
    Se usa cuando Jikan API no está disponible.
    
    Args:
        query (str): Término de búsqueda
    
    Returns:
        list: Animes encontrados en BD local
    """
    print(f"[BD] Buscando fallback en BD local: {query}")
    
    animes = Anime.objects.filter(
        title__icontains=query
    ).values(
        "mal_id", "title", "image_url", "genres"
    )[:25]
    
    return list(animes)


def search_anime_by_genre(genre_id, limit=25):
    """
    Busca animes por género específico usando Jikan API.
    
    Args:
        genre_id (int): ID del género en MyAnimeList
        limit (int): Número máximo de resultados (default: 25)
    
    Returns:
        list: Lista de animes del género especificado
        
    Ejemplo:
        >>> search_anime_by_genre(1)  # Acción
        [
            {
                'mal_id': 1,
                'title': 'Death Note',
                'image_url': '...',
                'genres': 'Thriller, ...'
            },
            ...
        ]
    """
    
    # Validar que genre_id sea válido
    if not genre_id or not isinstance(genre_id, int):
        return []
    
    # Crear clave de caché única para esta búsqueda
    cache_key = f"search_genre_{genre_id}_{limit}"
    
    # Verificar si ya tenemos este resultado en caché
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        print(f"[CACHÉ] Retornando resultado en caché para género {genre_id}")
        return cached_result
    
    try:
        # Hacer petición GET a Jikan API con parámetro de género
        print(f"[API] Buscando por género {genre_id} en Jikan")
        response = requests.get(
            f"{JIKAN_API_BASE}/anime",
            params={"genres": genre_id, "limit": limit, "order_by": "score", "sort": "desc"},
            timeout=10
        )
        response.raise_for_status()  # Lanzar excepción si hay error HTTP
        
        data = response.json()
        results = []
        
        # Procesar cada anime encontrado
        for anime_data in data.get("data", []):
            anime_info = {
                "mal_id": anime_data.get("mal_id"),
                "title": anime_data.get("title"),
                "image_url": anime_data.get("images", {}).get("jpg", {}).get("image_url"),
                "genres": ", ".join([g["name"] for g in anime_data.get("genres", [])])
            }
            results.append(anime_info)
            
            # Guardar/actualizar anime en nuestra BD para caché local
            _save_anime_to_db(anime_info)
        
        # Guardar resultados en caché durante 1 hora
        cache.set(cache_key, results, CACHE_TIME)
        print(f"[GUARDADO] {len(results)} animes por género {genre_id} en caché")
        
        return results
        
    except requests.exceptions.RequestException as e:
        # Si hay error en la API, intentar devolver resultados locales
        print(f"[ERROR] Fallo en petición a Jikan por género: {str(e)}")
        return _get_anime_by_genre_from_db(genre_id, limit)


def _get_anime_by_genre_from_db(genre_id, limit=25):
    """
    Busca animes por género en la base de datos local como fallback.
    Se usa cuando Jikan API no está disponible.
    
    Args:
        genre_id (int): ID del género
        limit (int): Número máximo de resultados
    
    Returns:
        list: Animes encontrados en BD local por género
    """
    print(f"[BD] Buscando fallback en BD local por género {genre_id}")
    
    # Mapear IDs de género a nombres comunes para búsqueda en BD
    genre_names = {
        1: "Action", 2: "Adventure", 4: "Comedy", 8: "Drama", 10: "Fantasy",
        22: "Romance", 24: "Sci-Fi", 36: "Slice of Life", 37: "Supernatural",
        7: "Mystery", 14: "Horror", 18: "Mecha", 30: "Sports", 19: "Music"
    }
    
    genre_name = genre_names.get(genre_id, "")
    if not genre_name:
        return []
    
    animes = Anime.objects.filter(
        genres__icontains=genre_name
    ).values(
        "mal_id", "title", "image_url", "genres"
    )[:limit]
    
    return list(animes)
