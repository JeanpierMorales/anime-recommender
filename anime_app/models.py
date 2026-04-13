from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta

class Anime(models.Model):
    """Caché de animes consultados para evitar redundancia"""
    mal_id = models.IntegerField(unique=True, primary_key=True)
    title = models.CharField(max_length=255)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    genres = models.CharField(max_length=255, blank=True) # Útil para recomendaciones rápidas

    def __str__(self):
        return self.title

class UserAnimeList(models.Model):
    """Relación Many-to-Many enriquecida (Tabla Intermedia)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_animes")
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)
    
    # Estados de la lista
    status_choices = [
        ('watching', 'Viendo'),
        ('completed', 'Completado'),
        ('dropped', 'Abandonado'),
        ('plan_to_watch', 'Plan por ver'),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='plan_to_watch')
    
    # Rating con validadores de rango (1-10 es estándar en anime)
    rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Esto es "lo perfecto": Evita que un usuario tenga el mismo anime dos veces en su lista
        unique_together = ('user', 'anime')
        verbose_name = "Lista de Usuario"

    def __str__(self):
        return f"{self.user.username} - {self.anime.title} ({self.status})"


class LoginAttempt(models.Model):
    """
    Modelo para rastrear intentos de login fallidos.
    Previene ataques de fuerza bruta mediante rate limiting.
    """
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Intento de Login"
        indexes = [
            models.Index(fields=['username', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.username} - {self.ip_address} - {'Exitoso' if self.success else 'Fallido'}"

    @classmethod
    def is_rate_limited(cls, username, ip_address, max_attempts=5, window_minutes=15):
        """
        Verifica si un usuario/IP está siendo rate limited.
        
        Args:
            username (str): Nombre de usuario
            ip_address (str): Dirección IP
            max_attempts (int): Máximo de intentos permitidos
            window_minutes (int): Ventana de tiempo en minutos
        
        Returns:
            bool: True si está rate limited, False en caso contrario
        """
        cutoff_time = timezone.now() - timedelta(minutes=window_minutes)
        failed_attempts = cls.objects.filter(
            username=username,
            ip_address=ip_address,
            success=False,
            timestamp__gte=cutoff_time
        ).count()
        
        return failed_attempts >= max_attempts

    @classmethod
    def get_failed_attempts(cls, username, ip_address, window_minutes=15):
        """Obtiene el número de intentos fallidos en la ventana de tiempo."""
        cutoff_time = timezone.now() - timedelta(minutes=window_minutes)
        return cls.objects.filter(
            username=username,
            ip_address=ip_address,
            success=False,
            timestamp__gte=cutoff_time
        ).count()


class AuthToken(models.Model):
    """
    Modelo para almacenar tokens de autenticación seguros.
    Alternativa a Django REST Framework tokens para más control.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="auth_token")
    token = models.CharField(max_length=200, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Token de Autenticación"

    def __str__(self):
        return f"Token de {self.user.username}"

    def update_last_used(self):
        """Actualiza la última vez que se usó el token."""
        self.last_used = timezone.now()
        self.save(update_fields=['last_used'])


class UserProfile(models.Model):
    """
    Perfil extendido del usuario con datos adicionales.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    bio = models.TextField(max_length=500, blank=True)

    class Meta:
        verbose_name = "Perfil de Usuario"

    def __str__(self):
        return f"Perfil de {self.user.username}"