from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

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