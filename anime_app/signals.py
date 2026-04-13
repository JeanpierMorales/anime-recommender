"""
Señales de Django (Signals) para manejar eventos automáticos
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un perfil de usuario cuando se crea un usuario nuevo.
    
    Args:
        sender: Modelo que envió la señal (User)
        instance: Instancia del usuario
        created: Boolean indicando si fue creado
        **kwargs: Argumentos adicionales
    """
    if created:
        UserProfile.objects.get_or_create(user=instance)
        print(f"[SIGNAL] Perfil de usuario creado automáticamente para {instance.username}")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Guarda el perfil de usuario cuando se guarda el usuario.
    
    Args:
        sender: Modelo que envió la señal (User)
        instance: Instancia del usuario
        **kwargs: Argumentos adicionales
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
