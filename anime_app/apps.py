from django.apps import AppConfig


class AnimeAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'anime_app'
    
    def ready(self):
        """
        Carga las señales cuando la aplicación está lista.
        """
        import anime_app.signals  # noqa
