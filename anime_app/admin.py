from django.contrib import admin
from .models import Anime, UserAnimeList, LoginAttempt, AuthToken, UserProfile

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

@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('username', 'ip_address', 'success', 'timestamp')
    list_filter = ('success', 'timestamp')
    search_fields = ('username', 'ip_address')
    readonly_fields = ('username', 'ip_address', 'success', 'timestamp')
    
    def has_add_permission(self, request):
        return False  # No permitir agregar registros manualmente

@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_active', 'created_at', 'last_used')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('token', 'created_at', 'last_used')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_verified', 'created_at')
    list_filter = ('email_verified', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Usuario', {'fields': ('user',)}),
        ('Datos', {'fields': ('email_verified', 'bio')}),
        ('Fechas', {'fields': ('created_at', 'updated_at')}),
    )
