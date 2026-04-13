"""
Utilidades de autenticación y seguridad
Incluye funciones para rate limiting, validación y token management
"""

import secrets
import hashlib
from django.utils import timezone
from datetime import timedelta
from .models import LoginAttempt, AuthToken, UserProfile
from django.contrib.auth.models import User


def get_client_ip(request):
    """
    Obtiene la dirección IP del cliente, considerando proxies.
    
    Args:
        request: HttpRequest object
    
    Returns:
        str: Dirección IP del cliente
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def check_login_rate_limit(username, ip_address, max_attempts=5, window_minutes=15):
    """
    Verifica si el usuario está siendo rate limited por intentos fallidos.
    
    Args:
        username (str): Nombre de usuario
        ip_address (str): Dirección IP
        max_attempts (int): Máximo de intentos permitidos
        window_minutes (int): Ventana de tiempo en minutos
    
    Returns:
        dict: {'is_limited': bool, 'remaining_attempts': int}
    """
    from django.conf import settings
    max_attempts = getattr(settings, 'LOGIN_MAX_ATTEMPTS', max_attempts)
    window_minutes = getattr(settings, 'LOGIN_ATTEMPT_WINDOW_MINUTES', window_minutes)
    
    is_limited = LoginAttempt.is_rate_limited(username, ip_address, max_attempts, window_minutes)
    failed_attempts = LoginAttempt.get_failed_attempts(username, ip_address, window_minutes)
    remaining_attempts = max(0, max_attempts - failed_attempts)
    
    return {
        'is_limited': is_limited,
        'remaining_attempts': remaining_attempts,
        'failed_attempts': failed_attempts,
    }


def record_login_attempt(username, ip_address, success=False):
    """
    Registra un intento de login en la base de datos para auditoría y rate limiting.
    
    Args:
        username (str): Nombre de usuario
        ip_address (str): Dirección IP
        success (bool): Si el intento fue exitoso
    
    Returns:
        LoginAttempt: Objeto creado
    """
    attempt = LoginAttempt.objects.create(
        username=username,
        ip_address=ip_address,
        success=success
    )
    print(f"[AUTH] Intento de login {'exitoso' if success else 'fallido'}: {username} desde {ip_address}")
    return attempt


def generate_secure_token(user):
    """
    Genera un token seguro para el usuario.
    
    Args:
        user: User object
    
    Returns:
        str: Token hexadecimal seguro
    """
    token_data = f"{user.id}:{user.username}:{secrets.token_hex(32)}"
    token = hashlib.sha256(token_data.encode()).hexdigest()
    return token


def create_auth_token(user):
    """
    Crea o actualiza un token de autenticación para el usuario.
    
    Args:
        user: User object
    
    Returns:
        AuthToken: Objeto de token creado
    """
    # Eliminar token anterior si existe
    AuthToken.objects.filter(user=user).delete()
    
    token = generate_secure_token(user)
    auth_token = AuthToken.objects.create(
        user=user,
        token=token,
        is_active=True
    )
    
    print(f"[AUTH] Token creado para {user.username}")
    return auth_token


def authenticate_token(token):
    """
    Autentica un usuario usando su token.
    
    Args:
        token (str): Token a verificar
    
    Returns:
        User or None: Usuario si el token es válido, None en caso contrario
    """
    try:
        auth_token = AuthToken.objects.get(
            token=token,
            is_active=True
        )
        auth_token.update_last_used()
        return auth_token.user
    except AuthToken.DoesNotExist:
        return None


def validate_password_strength(password, username):
    """
    Valida la fortaleza de una contraseña.
    
    Args:
        password (str): Contraseña a validar
        username (str): Nombre de usuario (para evitar coincidencias)
    
    Returns:
        dict: {'is_valid': bool, 'errors': [list of errors]}
    """
    errors = []
    
    if len(password) < 8:
        errors.append("La contraseña debe tener al menos 8 caracteres.")
    
    if not any(char.isupper() for char in password):
        errors.append("La contraseña debe contener al menos una letra mayúscula.")
    
    if not any(char.isdigit() for char in password):
        errors.append("La contraseña debe contener al menos un número.")
    
    if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?' for char in password):
        errors.append("La contraseña debe contener al menos un carácter especial.")
    
    if username.lower() in password.lower():
        errors.append("La contraseña no puede contener el nombre de usuario.")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }


def validate_username(username):
    """
    Valida el formato y disponibilidad del nombre de usuario.
    
    Args:
        username (str): Nombre de usuario a validar
    
    Returns:
        dict: {'is_valid': bool, 'errors': [list of errors]}
    """
    errors = []
    
    if len(username) < 3:
        errors.append("El nombre de usuario debe tener al menos 3 caracteres.")
    
    if len(username) > 150:
        errors.append("El nombre de usuario no puede exceder 150 caracteres.")
    
    if not username.replace('_', '').replace('-', '').isalnum():
        errors.append("El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.")
    
    if User.objects.filter(username=username).exists():
        errors.append("El nombre de usuario ya está registrado.")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }


def validate_email(email):
    """
    Valida el formato y disponibilidad del email.
    
    Args:
        email (str): Email a validar
    
    Returns:
        dict: {'is_valid': bool, 'errors': [list of errors]}
    """
    errors = []
    
    if not email or '@' not in email:
        errors.append("Email inválido.")
    
    if User.objects.filter(email=email).exists():
        errors.append("Este email ya está registrado.")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }


def ensure_user_profile(user):
    """
    Asegura que exista un perfil de usuario, creándolo si es necesario.
    
    Args:
        user: User object
    
    Returns:
        UserProfile: Objeto de perfil creado o existente
    """
    profile, created = UserProfile.objects.get_or_create(user=user)
    if created:
        print(f"[AUTH] Perfil creado para {user.username}")
    return profile
