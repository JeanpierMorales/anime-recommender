from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
import json

# Importar nuestro servicio de integración con Jikan API
from .services import search_anime, get_anime_detail, search_anime_by_genre

# Importar utilidades de autenticación
from .auth_utils import (
    get_client_ip, check_login_rate_limit, record_login_attempt,
    create_auth_token, authenticate_token, validate_password_strength,
    validate_username, validate_email, ensure_user_profile
)


def index(request):
    """
    Vista principal del frontend.
    Renderiza la plantilla HTML donde el usuario puede buscar anime dinámicamente.
    """
    return render(request, "anime_app/index.html")


def login_page(request):
    """
    Vista para la página de inicio de sesión.
    """
    return render(request, "anime_app/login.html")


def register_page(request):
    """
    Vista para la página de registro.
    """
    return render(request, "anime_app/register.html")


def profile_page(request):
    """
    Vista para la página de perfil del usuario.
    """
    return render(request, "anime_app/profile.html")


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


# ======== VISTAS DE AUTENTICACIÓN Y PERSISTENCIA ========


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """
    Endpoint para registrar un nuevo usuario.
    
    POST: /auth/register/
    
    Body JSON:
        {
            "username": "usuario123",
            "email": "usuario@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "message": "Mensaje descriptivo",
            "token": "token_string",  (si es exitoso)
            "user": {"id": 1, "username": "usuario123", "email": "usuario@example.com"}
        }
    """
    
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "JSON inválido"
        }, status=400)
    
    username = body.get("username", "").strip()
    email = body.get("email", "").strip()
    password = body.get("password", "")
    password_confirm = body.get("password_confirm", "")
    
    # Validar username
    username_validation = validate_username(username)
    if not username_validation['is_valid']:
        return JsonResponse({
            "status": "error",
            "message": "Nombre de usuario inválido",
            "errors": username_validation['errors']
        }, status=400)
    
    # Validar email
    email_validation = validate_email(email)
    if not email_validation['is_valid']:
        return JsonResponse({
            "status": "error",
            "message": "Email inválido",
            "errors": email_validation['errors']
        }, status=400)
    
    # Validar que las contraseñas coincidan
    if password != password_confirm:
        return JsonResponse({
            "status": "error",
            "message": "Las contraseñas no coinciden"
        }, status=400)
    
    # Validar fortaleza de contraseña
    password_validation = validate_password_strength(password, username)
    if not password_validation['is_valid']:
        return JsonResponse({
            "status": "error",
            "message": "Contraseña débil",
            "errors": password_validation['errors']
        }, status=400)
    
    try:
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Crear perfil de usuario
        ensure_user_profile(user)
        
        # Crear token de autenticación
        auth_token = create_auth_token(user)
        
        # Registrar intento exitoso
        ip_address = get_client_ip(request)
        record_login_attempt(username, ip_address, success=True)
        
        return JsonResponse({
            "status": "success",
            "message": "Usuario registrado exitosamente",
            "token": auth_token.token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Error al registrar usuario: {str(e)}"
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Endpoint para iniciar sesión.
    
    POST: /auth/login/
    
    Body JSON:
        {
            "username": "usuario123",
            "password": "SecurePass123!"
        }
    
    Returns:
        {
            "status": "success" | "error" | "rate_limited",
            "message": "Mensaje descriptivo",
            "token": "token_string",  (si es exitoso)
            "user": {"id": 1, "username": "usuario123", "email": "usuario@example.com"},
            "remaining_attempts": 3  (si rate_limited)
        }
    """
    
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "JSON inválido"
        }, status=400)
    
    username = body.get("username", "").strip()
    password = body.get("password", "")
    
    if not username or not password:
        return JsonResponse({
            "status": "error",
            "message": "Nombre de usuario y contraseña requeridos"
        }, status=400)
    
    # Obtener IP del cliente
    ip_address = get_client_ip(request)
    
    # Verificar rate limiting
    rate_limit = check_login_rate_limit(username, ip_address)
    if rate_limit['is_limited']:
        return JsonResponse({
            "status": "rate_limited",
            "message": f"Demasiados intentos fallidos. Intenta más tarde.",
            "remaining_attempts": 0
        }, status=429)
    
    # Intentar autenticar
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # Login exitoso
        ensure_user_profile(user)
        auth_token = create_auth_token(user)
        record_login_attempt(username, ip_address, success=True)
        
        return JsonResponse({
            "status": "success",
            "message": "Sesión iniciada exitosamente",
            "token": auth_token.token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
    else:
        # Login fallido
        record_login_attempt(username, ip_address, success=False)
        
        # Verificar si está rate limited ahora
        rate_limit = check_login_rate_limit(username, ip_address)
        
        return JsonResponse({
            "status": "error",
            "message": "Nombre de usuario o contraseña incorrectos",
            "remaining_attempts": rate_limit['remaining_attempts']
        }, status=401)


@require_http_methods(["POST"])
def verify_token(request):
    """
    Endpoint para verificar si un token es válido.
    
    POST: /auth/verify/
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        {
            "status": "success" | "error",
            "message": "Mensaje descriptivo",
            "user": {"id": 1, "username": "usuario123", "email": "usuario@example.com"}
        }
    """
    
    # Obtener token del header Authorization
    auth_header = request.META.get('HTTP_AUTHORIZATION', '').strip()
    
    if not auth_header.startswith('Bearer '):
        return JsonResponse({
            "status": "error",
            "message": "Token no proporcionado o formato inválido"
        }, status=401)
    
    token = auth_header[7:]  # Remover "Bearer "
    
    user = authenticate_token(token)
    
    if user is not None:
        return JsonResponse({
            "status": "success",
            "message": "Token válido",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
    else:
        return JsonResponse({
            "status": "error",
            "message": "Token inválido o expirado"
        }, status=401)


@require_http_methods(["GET", "POST"])
def user_favorites(request):
    """
    Endpoint para obtener y guardar favoritos del usuario.
    
    GET: /api/user/favorites/
        Headers:
            Authorization: Bearer <token>
    
    POST: /api/user/favorites/
        Headers:
            Authorization: Bearer <token>
        Body JSON:
            {
                "mal_id": 1,
                "action": "add" | "remove"
            }
    
    Returns (GET):
        {
            "status": "success",
            "count": 3,
            "favorites": [
                {
                    "mal_id": 1,
                    "title": "Death Note",
                    "image_url": "...",
                    "added_at": "2026-04-12T10:30:00Z"
                }
            ]
        }
    
    Returns (POST):
        {
            "status": "success" | "error",
            "message": "Mensaje descriptivo",
            "mal_id": 1,
            "action": "added" | "removed"
        }
    """
    
    # Obtener token y usuario
    auth_header = request.META.get('HTTP_AUTHORIZATION', '').strip()
    
    if not auth_header.startswith('Bearer '):
        return JsonResponse({
            "status": "error",
            "message": "Token no proporcionado"
        }, status=401)
    
    token = auth_header[7:]
    user = authenticate_token(token)
    
    if user is None:
        return JsonResponse({
            "status": "error",
            "message": "Token inválido"
        }, status=401)
    
    if request.method == "GET":
        # Obtener favoritos del usuario
        from .models import UserAnimeList
        
        favorites = UserAnimeList.objects.filter(
            user=user,
            status='plan_to_watch'  # Usamos plan_to_watch como favoritos
        ).select_related('anime').values(
            'anime__mal_id',
            'anime__title',
            'anime__image_url',
            'added_at'
        ).order_by('-added_at')
        
        return JsonResponse({
            "status": "success",
            "count": favorites.count(),
            "favorites": [
                {
                    "mal_id": fav['anime__mal_id'],
                    "title": fav['anime__title'],
                    "image_url": fav['anime__image_url'],
                    "added_at": fav['added_at'].isoformat()
                }
                for fav in favorites
            ]
        })
    
    elif request.method == "POST":
        # Agregar o remover favorito
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "JSON inválido"
            }, status=400)
        
        mal_id = body.get("mal_id")
        action = body.get("action", "").lower()  # "add" o "remove"
        
        if not mal_id or action not in ['add', 'remove']:
            return JsonResponse({
                "status": "error",
                "message": "mal_id y action ('add' o 'remove') requeridos"
            }, status=400)
        
        try:
            mal_id = int(mal_id)
        except ValueError:
            return JsonResponse({
                "status": "error",
                "message": "mal_id debe ser un número entero"
            }, status=400)
        
        from .models import Anime, UserAnimeList
        
        try:
            # Obtener o crear el anime en la BD
            anime, _ = Anime.objects.get_or_create(mal_id=mal_id)
            
            if action == "add":
                # Agregar a favoritos (crear o actualizar)
                favorite, created = UserAnimeList.objects.get_or_create(
                    user=user,
                    anime=anime,
                    defaults={'status': 'plan_to_watch'}
                )
                
                if not created and favorite.status != 'plan_to_watch':
                    favorite.status = 'plan_to_watch'
                    favorite.save()
                
                return JsonResponse({
                    "status": "success",
                    "message": "Anime agregado a favoritos",
                    "mal_id": mal_id,
                    "action": "added"
                })
            
            elif action == "remove":
                # Remover de favoritos
                UserAnimeList.objects.filter(
                    user=user,
                    anime=anime,
                    status='plan_to_watch'
                ).delete()
                
                return JsonResponse({
                    "status": "success",
                    "message": "Anime removido de favoritos",
                    "mal_id": mal_id,
                    "action": "removed"
                })
        
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error al procesar favorito: {str(e)}"
            }, status=500)
