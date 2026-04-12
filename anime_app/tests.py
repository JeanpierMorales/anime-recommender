from django.test import TestCase
from django.contrib.auth.models import User
from .models import Anime, UserAnimeList

class AnimeModelTest(TestCase):
    """Tests para el modelo Anime"""
    
    def setUp(self):
        self.anime = Anime.objects.create(
            mal_id=1,
            title="Death Note",
            image_url="https://example.com/death-note.jpg",
            genres="Thriller, Supernatural"
        )
    
    def test_anime_creation(self):
        """Verifica que un anime se crea correctamente"""
        self.assertEqual(self.anime.title, "Death Note")
        self.assertEqual(self.anime.mal_id, 1)
    
    def test_anime_str(self):
        """Verifica la representación en string del anime"""
        self.assertEqual(str(self.anime), "Death Note")

class UserAnimeListModelTest(TestCase):
    """Tests para el modelo UserAnimeList"""
    
    def setUp(self):
        self.user = User.objects.create(username="testuser", password="testpass123")
        self.anime = Anime.objects.create(
            mal_id=1,
            title="Death Note",
            genres="Thriller"
        )
        self.user_anime = UserAnimeList.objects.create(
            user=self.user,
            anime=self.anime,
            status="watching",
            rating=9
        )
    
    def test_user_anime_creation(self):
        """Verifica que se crea una relación usuario-anime correctamente"""
        self.assertEqual(self.user_anime.user.username, "testuser")
        self.assertEqual(self.user_anime.anime.title, "Death Note")
        self.assertEqual(self.user_anime.status, "watching")
    
    def test_rating_validation(self):
        """Verifica que el rating se valida en rango 1-10"""
        self.user_anime.rating = 5
        self.user_anime.full_clean()  # Debe pasar sin errores
    
    def test_unique_together_constraint(self):
        """Verifica que no se duplica anime para mismo usuario"""
        with self.assertRaises(Exception):
            UserAnimeList.objects.create(
                user=self.user,
                anime=self.anime,
                status="completed"
            )
