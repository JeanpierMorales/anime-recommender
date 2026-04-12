from django.contrib import admin
from .models import Anime, UserAnimeList

@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    list_display = ('mal_id', 'title', 'genres')
    list_filter = ('genres',)
    search_fields = ('title',)
    readonly_fields = ('mal_id',)

@admin.register(UserAnimeList)
class UserAnimeListAdmin(admin.ModelAdmin):
    list_display = ('user', 'anime', 'status', 'rating', 'added_at')
    list_filter = ('status', 'added_at')
    search_fields = ('user__username', 'anime__title')
    readonly_fields = ('added_at', 'updated_at')
    
    fieldsets = (
        ('Usuario y Anime', {'fields': ('user', 'anime')}),
        ('Estado', {'fields': ('status', 'rating')}),
        ('Fechas', {'fields': ('added_at', 'updated_at')}),
    )
