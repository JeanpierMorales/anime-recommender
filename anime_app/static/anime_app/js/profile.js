// Animatcher - Profile Page JavaScript

// ===== ELEMENTOS DEL DOM =====
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const userMenu = document.getElementById('userMenu');
const userMenuUsername = document.getElementById('userMenuUsername');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const exploreButton = document.getElementById('exploreButton');
const viewFavorites = document.getElementById('viewFavorites');
const editProfile = document.getElementById('editProfile');
const changePassword = document.getElementById('changePassword');

// Elementos del perfil
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileJoinedDate = document.getElementById('profileJoinedDate');
const favoritesCount = document.getElementById('favoritesCount');
const watchTime = document.getElementById('watchTime');
const genresCount = document.getElementById('genresCount');
const favoritesList = document.getElementById('favoritesList');

// ===== VARIABLES DE ESTADO =====
let currentLanguage = localStorage.getItem('animeLanguage') || 'es';
let currentTheme = localStorage.getItem('animeTheme') || 'light';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// ===== FUNCIONES DE TRADUCCIÓN =====
function applyLanguage(lang) {
    const strings = translations[lang] || translations.es;
    const textNodes = document.querySelectorAll('[data-i18n]');
    textNodes.forEach((node) => {
        const key = node.dataset.i18n;
        if (strings[key]) {
            node.textContent = strings[key];
        }
    });
    if (langToggle) {
        langToggle.textContent = lang.toUpperCase();
    }
    currentLanguage = lang;
    localStorage.setItem('animeLanguage', lang);
}

// ===== FUNCIONES DE TEMA =====
function applyTheme(theme) {
    const body = document.body;
    body.classList.toggle('theme-dark', theme === 'dark');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    currentTheme = theme;
    localStorage.setItem('animeTheme', theme);
}

// ===== FUNCIONES DE AUTENTICACIÓN =====
function logoutUser() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showToast(currentLanguage === 'en' ? 'Logged out' : 'Sesión cerrada', 'info');

    // Redirigir al inicio
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
}

async function verifyToken() {
    if (!authToken) {
        window.location.href = '/login/';
        return false;
    }

    try {
        const response = await fetch('/auth/verify/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return true;
        } else {
            logoutUser();
            return false;
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logoutUser();
        return false;
    }
}

// ===== FUNCIONES DEL PERFIL =====
async function loadUserProfile() {
    if (!currentUser) return;

    // Cargar información básica del perfil
    if (profileUsername) profileUsername.textContent = currentUser.username;
    if (profileEmail) profileEmail.textContent = currentUser.email;
    if (userMenuUsername) userMenuUsername.textContent = currentUser.username;

    // Fecha de registro (simulada por ahora)
    if (profileJoinedDate) {
        const joinedDate = new Date();
        joinedDate.setDate(joinedDate.getDate() - 30); // Simular 30 días de antigüedad
        profileJoinedDate.textContent = joinedDate.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US');
    }

    // Cargar favoritos
    await loadUserFavorites();
}

async function loadUserFavorites() {
    try {
        const response = await fetch('/api/user/favorites/', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            displayFavorites(data.favorites);
            if (favoritesCount) favoritesCount.textContent = data.count;

            // Calcular estadísticas
            calculateStats(data.favorites);
        } else {
            console.error('Error loading favorites:', data.message);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        if (favoritesList) {
            favoritesList.innerHTML = '<p class="error">Error al cargar favoritos</p>';
        }
    }
}

function displayFavorites(favorites) {
    if (!favoritesList) return;

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">No tienes favoritos aún. ¡Explora y agrega algunos!</p>';
        return;
    }

    favoritesList.innerHTML = '';

    favorites.forEach(favorite => {
        const favoriteCard = document.createElement('div');
        favoriteCard.className = 'favorite-card';
        favoriteCard.innerHTML = `
            <img src="${favorite.image_url || 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${favorite.title}">
            <div class="favorite-info">
                <h3>${favorite.title}</h3>
                <p>Agregado: ${new Date(favorite.added_at).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US')}</p>
                <button class="remove-favorite" data-mal-id="${favorite.mal_id}">
                    ❌ Quitar
                </button>
            </div>
        `;

        // Event listener para quitar favorito
        const removeBtn = favoriteCard.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', () => removeFavorite(favorite.mal_id));

        favoritesList.appendChild(favoriteCard);
    });
}

async function removeFavorite(malId) {
    try {
        const response = await fetch('/api/user/favorites/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mal_id: malId, action: 'remove' })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showToast('Favorito removido', 'success');
            // Recargar favoritos
            await loadUserFavorites();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        showToast('Error al remover favorito', 'error');
    }
}

function calculateStats(favorites) {
    // Calcular tiempo de visionado estimado (simulado)
    const estimatedHours = favorites.length * 24; // 24 horas por anime promedio
    if (watchTime) watchTime.textContent = `${estimatedHours}h`;

    // Contar géneros únicos (simulado)
    if (genresCount) genresCount.textContent = Math.min(favorites.length, 8); // Máximo 8 géneros
}

// ===== FUNCIONES DE UI =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6b7280'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== EVENT LISTENERS =====

// Aplicar tema e idioma al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);

    // Verificar autenticación
    const isAuthenticated = await verifyToken();
    if (isAuthenticated) {
        await loadUserProfile();
    }
});

// Event listeners de controles
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

if (langToggle) {
    langToggle.addEventListener('click', () => {
        applyLanguage(currentLanguage === 'es' ? 'en' : 'es');
    });
}

// Event listeners del menú de usuario
if (userMenu) {
    userMenu.addEventListener('click', () => {
        if (userDropdown) {
            userDropdown.classList.toggle('hidden');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
}

// Event listeners de acciones del perfil
if (exploreButton) {
    exploreButton.addEventListener('click', () => {
        window.location.href = '/';
    });
}

if (viewFavorites) {
    viewFavorites.addEventListener('click', () => {
        // Scroll a la sección de favoritos
        document.querySelector('.favorites-section').scrollIntoView({ behavior: 'smooth' });
    });
}

if (editProfile) {
    editProfile.addEventListener('click', () => {
        showToast('Función próximamente', 'info');
    });
}

if (changePassword) {
    changePassword.addEventListener('click', () => {
        showToast('Función próximamente', 'info');
    });
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    if (userMenu && userDropdown && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});