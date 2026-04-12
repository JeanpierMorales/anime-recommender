from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json

# Importar nuestro servicio de integración con Jikan API
from .services import search_anime, get_anime_detail, search_anime_by_genre


def index(request):
    """
    Vista principal del frontend.
    Renderiza la plantilla HTML donde el usuario puede buscar anime dinámicamente.
    """
    return render(request, "anime_app/index.html")


@require_http_methods(["GET", "POST"])
def anime_search(request):
    """
    Vista para buscar animes usando la Jikan API.
    
    GET/POST: /api/anime/search/?query=Death+Note
    
    Params:
        - query (str): Término de búsqueda (requerido)
    
    Returns:
        JSON con lista de animes encontrados
        
    Ejemplo de respuesta:
        {
            "status": "success",
            "count": 3,
            "results": [
                {
                    "mal_id": 1,
                    "title": "Death Note",
                    "image_url": "...",
                    "genres": "Thriller, ..."
                }
            ]
        }
    """
    
    # Obtener parámetro de búsqueda desde GET o POST
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            query = body.get("query", "").strip()
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)
    else:  # GET
        query = request.GET.get("query", "").strip()
    
    # Validar que la búsqueda no esté vacía
    if not query:
        return JsonResponse({
            "status": "error",
            "message": "Por favor proporciona un término de búsqueda"
        }, status=400)
    
    # Llamar al servicio que se conecta con Jikan API
    results = search_anime(query)
    
    return JsonResponse({
        "status": "success",
        "query": query,
        "count": len(results),
        "results": results
    })


@require_http_methods(["GET"])
def anime_detail(request, mal_id):
    """
    Vista para obtener detalles completos de un anime específico.
    
    GET: /api/anime/<mal_id>/
    
    Args:
        - mal_id (int): ID de MyAnimeList del anime
    
    Returns:
        JSON con datos completos del anime
        
    Ejemplo de respuesta:
        {
            "status": "success",
            "mal_id": 1,
            "title": "Death Note",
            "synopsis": "A high school student...",
            "episodes": 37,
            "score": 9.13,
            "genres": ["Thriller", "Supernatural"],
            ...
        }
    """
    
    # Validar que mal_id sea un número válido
    try:
        mal_id = int(mal_id)
    except ValueError:
        return JsonResponse({
            "status": "error",
            "message": "mal_id debe ser un número entero"
        }, status=400)
    
    # Llamar al servicio para obtener detalles del anime
    detail = get_anime_detail(mal_id)
    
    # Verificar si la API devolvió datos válidos
    if detail is None:
        return JsonResponse({
            "status": "error",
            "message": "No se encontró el anime o error en la API"
        }, status=404)
    
    # Devolver los detalles como JSON
    detail["status"] = "success"
    return JsonResponse(detail)


@require_http_methods(["GET"])
def anime_search_by_genre(request):
    """
    Vista para buscar animes por género usando la Jikan API.
    
    GET: /api/anime/genre/<genre_id>/
    
    Params:
        - genre_id (int): ID del género en MyAnimeList (requerido)
        - limit (int): Número máximo de resultados (opcional, default: 25)
    
    Returns:
        JSON con lista de animes del género especificado
        
    Ejemplo de respuesta:
        {
            "status": "success",
            "genre_id": 1,
            "count": 3,
            "results": [
                {
                    "mal_id": 1,
                    "title": "Death Note",
                    "image_url": "...",
                    "genres": "Thriller, ..."
                }
            ]
        }
    """
    
    # Obtener parámetros de la URL
    genre_id_str = request.GET.get("genre_id", "").strip()
    limit_str = request.GET.get("limit", "25").strip()
    
    # Validar genre_id
    try:
        genre_id = int(genre_id_str)
        if genre_id <= 0:
            raise ValueError("ID de género debe ser positivo")
    except (ValueError, TypeError):
        return JsonResponse({
            "status": "error",
            "message": "ID de género inválido. Debe ser un número entero positivo."
        }, status=400)
    
    # Validar limit
    try:
        limit = int(limit_str)
        if limit <= 0 or limit > 100:
            limit = 25  # valor por defecto si está fuera de rango
    except (ValueError, TypeError):
        limit = 25
    
    try:
        # Buscar animes por género
        results = search_anime_by_genre(genre_id, limit)
        
        return JsonResponse({
            "status": "success",
            "genre_id": genre_id,
            "count": len(results),
            "results": results
        })
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Error interno del servidor: {str(e)}"
        }, status=500)
