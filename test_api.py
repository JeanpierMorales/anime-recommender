"""
Script de prueba para verificar que la integración con Jikan API funciona.
Uso: python manage.py shell < test_api.py
"""

from anime_app.services import search_anime, get_anime_detail
import json

print("\n" + "="*60)
print("🧪 PRUEBA DE INTEGRACIÓN CON JIKAN API")
print("="*60 + "\n")

# ======================================================================
# PRUEBA 1: Búsqueda de anime
# ======================================================================
print("📌 PRUEBA 1: Búsqueda de anime 'Death Note'")
print("-" * 60)

results = search_anime("Death Note")
print(f"Resultados encontrados: {len(results)}")

if results:
    print(f"\nPrimer resultado:")
    print(json.dumps(results[0], indent=2, ensure_ascii=False))
else:
    print("❌ No se encontraron resultados")

# ======================================================================
# PRUEBA 2: Obtener detalles de un anime
# ======================================================================
print("\n📌 PRUEBA 2: Obtener detalles del anime Death Note (mal_id=1)")
print("-" * 60)

detail = get_anime_detail(1)

if detail:
    print("✅ Detalles obtenidos exitosamente:")
    print(f"   Título: {detail.get('title')}")
    print(f"   Episodios: {detail.get('episodes')}")
    print(f"   Score: {detail.get('score')}")
    print(f"   Estado: {detail.get('status')}")
    print(f"   Géneros: {', '.join(detail.get('genres', []))}")
    print(f"   Sinopsis: {detail.get('synopsis', 'N/A')[:100]}...")
else:
    print("❌ No se pudo obtener los detalles")

# ======================================================================
# PRUEBA 3: Verificar caché local en BD
# ======================================================================
print("\n📌 PRUEBA 3: Verificar animes guardados en BD")
print("-" * 60)

from anime_app.models import Anime

animes_en_bd = Anime.objects.all()
print(f"Total de animes en BD: {animes_en_bd.count()}")

if animes_en_bd.exists():
    print("\nÚltimos 5 animes guardados:")
    for anime in animes_en_bd[:5]:
        print(f"  • {anime.title} (MAL ID: {anime.mal_id})")

# ======================================================================
# RESUMEN
# ======================================================================
print("\n" + "="*60)
print("✅ PRUEBAS COMPLETADAS")
print("="*60)
print("""
Próximos pasos:
1. Iniciar servidor: python manage.py runserver
2. Visitar: http://localhost:8000/api/anime/search/?query=Naruto
3. Probar detalles: http://localhost:8000/api/anime/1/
4. Ver resultados en BD: http://localhost:8000/admin/anime_app/anime/
""")
