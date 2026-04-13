// Anime Recommender - Frontend JavaScript 

// ===== ELEMENTOS DEL DOM =====
// Autenticación
const authToggle = document.getElementById('authToggle');
const registerToggle = document.getElementById('registerToggle');
const guestToggle = document.getElementById('guestToggle');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const userMenu = document.getElementById('userMenu');
const userMenuUsername = document.getElementById('userMenuUsername');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');

// Formularios de autenticación
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const tabButtons = document.querySelectorAll('.tab-btn');

// Favoritos
const favButton = document.getElementById('favButton');

// Búsqueda de anime
const searchInput = document.getElementById('searchInput'); // Input de búsqueda
const searchButton = document.getElementById('searchButton'); // Botón de búsqueda
const heroSearchButton = document.getElementById('heroSearchButton'); // Botón de búsqueda en la sección hero
const guestButton = document.getElementById('guestButton'); // Botón para continuar como invitado
const themeToggle = document.getElementById('themeToggle'); // Botón para cambiar tema
const langToggle = document.getElementById('langToggle'); // Botón para cambiar idioma
const resultsList = document.getElementById('resultsList'); //  Contenedor de resultados de búsqueda
const resultCount = document.getElementById('resultCount'); // Contador de resultados encontrados
const detailCard = document.getElementById('detailCard'); //    Contenedor de detalles del anime seleccionado
const detailPlaceholder = document.getElementById('detailPlaceholder'); // Contenedor de mensaje cuando no hay detalles seleccionados
const closeDetail = document.getElementById('closeDetail'); // Botón para cerrar la vista de detalle
const searchSection = document.getElementById('searchSection'); // Sección de búsqueda para scroll suave
const carouselButtons = document.querySelectorAll('.pager'); // Botones de paginación para carrusel de géneros
const textNodes = document.querySelectorAll('[data-i18n]'); // Nodos de texto para traducción

// Detalles del anime
const detailImage = document.getElementById('detailImage'); // Imagen del anime en la vista de detalle
const detailTitle = document.getElementById('detailTitle'); // Título del anime en la vista de detalle
const detailGenres = document.getElementById('detailGenres'); // Géneros del anime en la vista de detalle
const detailStatus = document.getElementById('detailStatus'); // Estado del anime (emitido, en emisión, etc.) en la vista de detalle
const detailSynopsis = document.getElementById('detailSynopsis'); // Sinopsis del anime en la vista de detalle
const detailEpisodes = document.getElementById('detailEpisodes'); // Número de episodios del anime en la vista de detalle
const detailScore = document.getElementById('detailScore'); // Puntuación del anime en la vista de detalle
const detailRank = document.getElementById('detailRank'); // Rango del anime en la vista de detalle
const detailUrl = document.getElementById('detailUrl'); // URL del anime en la vista de detalle

// ===== VARIABLES DE ESTADO =====
let currentPage = 1;
const resultsPerPage = 4; // Número de resultados a mostrar por página
let allResults = []; 
const paginationControls = document.getElementById('paginationControls'); // Contenedor para los controles de paginación

// Estado de autenticación
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let isGuest = localStorage.getItem('isGuest') === 'true';
let currentAnimeId = null; // Para guardar el anime actual en favoritos

const translations = {
    es: {
        nav_slogan: 'Busca anime con estilo',
        nav_home: 'Inicio',
        nav_explore: 'Explorar',
        nav_search: 'Buscar',
        nav_roadmap: 'Roadmap',
        guest_mode: 'Continuar como Invitado',
        hero_tag: 'Landing moderna',
        hero_title: 'Busca anime rápido y explora detalles al instante',
        hero_subtitle: 'Interfaz limpia con búsqueda dinámica, resultados en vivo y vista de detalle. Ideal para la base del frontend de tu aplicación.',
        hero_cta: 'Comenzar búsqueda',
        hero_roadmap: 'Ver roadmap',
        hero_metrics_1_title: 'Resultados en vivo',
        hero_metrics_1_body: 'Busca sin recargar y descubre anime al instante.',
        hero_metrics_2_title: 'Vista de detalle',
        hero_metrics_2_body: 'Selecciona un anime y ve sinopsis, score y episodios.',
        hero_metrics_3_title: 'Tus Favoritos',
        hero_metrics_3_body: 'Guarda y gestiona tu lista personal de animes favoritos.',
        explore_tag: 'Explora géneros',
        explore_title: 'Carrusel de categorías',
        genre_action: 'Acción',
        genre_adventure: 'Aventura',
        genre_comedy: 'Comedia',
        genre_fantasy: 'Fantasía',
        genre_romance: 'Romance',
        genre_scifi: 'Ciencia Ficción',
        genre_slice_of_life: 'Vida Cotidiana',
        genre_supernatural: 'Sobrenatural',
        genre_mystery: 'Misterio',
        genre_horror: 'Terror',
        genre_mecha: 'Mecha',
        genre_sports: 'Deportes',
        genre_music: 'Música',
        genre_isekai: 'Isekai',
        search_tag: 'Búsqueda dinámica',
        search_title: 'Encuentra anime en segundos',
        search_label: 'Buscar anime',
        search_button: 'Buscar',
        search_hint: 'Escribe al menos 2 caracteres y presiona Buscar.',
        results_title: 'Resultados',
        results_description: 'Haz clic en un anime para ver más información.',
        detail_tag: 'Detalle instantáneo',
        detail_title: 'Vista completa del anime',
        detail_episodes: 'Episodios',
        detail_score: 'Score',
        detail_rank: 'Ranking',
        detail_mal_button: 'Ver en MyAnimeList',
        detail_placeholder: 'Selecciona un resultado para ver información ampliada aquí.',
        roadmap_tag: 'Próximos pasos',
        roadmap_title: 'Qué viene después',
        roadmap_week3: 'Frontend base con búsqueda dinámica y detalle.',
        roadmap_week4: 'Login, registro y guardar favoritos.',
        roadmap_week5: 'Ratings, recomendaciones y lista del usuario.',
        roadmap_week6: 'UI pulida, errores y despliegue.',
        footer_slogan: 'Descubre tu próximo anime favorito',
        footer_home: 'Inicio',
        footer_explore: 'Explorar',
        footer_search: 'Buscar',
        footer_copyright: '© 2026 Anime Recommender. Todos los derechos reservados.',
        footer_data_source: 'Datos proporcionados por MyAnimeList',
        nav_guest: 'Invitado',
        nav_login: 'Ingresar',
        nav_register: 'Registrarse',
        tab_login: 'Ingresar',
        tab_register: 'Registrarse',
        login_title: 'Inicia sesión',
        login_username: 'Nombre de usuario',
        login_password: 'Contraseña',
        login_button: 'Ingresar',
        login_hint: '¿No tienes cuenta? Regístrate arriba.',
        register_title: 'Crea tu cuenta',
        register_username: 'Nombre de usuario',
        register_username_hint: '3-150 caracteres, letras, números, guiones',
        register_email: 'Email',
        register_password: 'Contraseña',
        register_password_hint: 'Mínimo 8 caracteres, mayúscula, número, carácter especial',
        register_password_confirm: 'Confirmar contraseña',
        register_button: 'Registrarse',
        register_hint: '¿Ya tienes cuenta? Inicia sesión arriba.',
        menu_favorites: '⭐ Mis favoritos',
        menu_profile: '👤 Mi perfil',
        menu_logout: '🚪 Cerrar sesión',
        detail_add_favorite: '⭐ Añadir a favoritos',
        detail_remove_favorite: '⭐ Quitar de favoritos'
    },
    en: {
        nav_slogan: 'Search anime with style',
        nav_home: 'Home',
        nav_explore: 'Explore',
        nav_search: 'Search',
        nav_roadmap: 'Roadmap',
        guest_mode: 'Continue as Guest',
        hero_tag: 'Modern landing',
        hero_title: 'Search anime fast and explore details instantly',
        hero_subtitle: 'Clean interface with dynamic search, live results and detail view. Built for the frontend base of your app.',
        hero_cta: 'Start searching',
        hero_roadmap: 'View roadmap',
        hero_metrics_1_title: 'Live results',
        hero_metrics_1_body: 'Search without reloading and discover anime instantly.',
        hero_metrics_2_title: 'Detail view',
        hero_metrics_2_body: 'Select an anime and see synopsis, score and episodes.',
        hero_metrics_3_title: 'Your Favorites',
        hero_metrics_3_body: 'Save and manage your personal list of favorite anime.',
        explore_tag: 'Explore genres',
        explore_title: 'Categories carousel',
        genre_action: 'Action',
        genre_adventure: 'Adventure',
        genre_comedy: 'Comedy',
        genre_fantasy: 'Fantasy',
        genre_romance: 'Romance',
        genre_scifi: 'Sci-Fi',
        genre_slice_of_life: 'Slice of Life',
        genre_supernatural: 'Supernatural',
        genre_mystery: 'Mystery',
        genre_horror: 'Horror',
        genre_mecha: 'Mecha',
        genre_sports: 'Sports',
        genre_music: 'Music',
        genre_isekai: 'Isekai',
        search_tag: 'Dynamic search',
        search_title: 'Find anime in seconds',
        search_label: 'Search anime',
        search_button: 'Search',
        search_hint: 'Type at least 2 characters and press Search.',
        results_title: 'Results',
        results_description: 'Click an anime to view more information.',
        detail_tag: 'Instant detail',
        detail_title: 'Full anime preview',
        detail_episodes: 'Episodes',
        detail_score: 'Score',
        detail_rank: 'Rank',
        detail_mal_button: 'View on MyAnimeList',
        detail_placeholder: 'Select a result to display extended information here.',
        roadmap_tag: 'Next steps',
        roadmap_title: 'What comes next',
        roadmap_week3: 'Frontend base with dynamic search and detail.',
        roadmap_week4: 'Login, register and save favorites.',
        roadmap_week5: 'Ratings, recommendations and user list.',
        roadmap_week6: 'Polished UI, error handling and deploy.',
        footer_slogan: 'Discover your next favorite anime',
        footer_home: 'Home',
        footer_explore: 'Explore',
        footer_search: 'Search',
        footer_copyright: '© 2026 Anime Recommender. All rights reserved.',
        footer_data_source: 'Data provided by MyAnimeList',
        nav_guest: 'Guest',
        nav_login: 'Sign In',
        nav_register: 'Register',
        tab_login: 'Sign In',
        tab_register: 'Register',
        login_title: 'Sign in',
        login_username: 'Username',
        login_password: 'Password',
        login_button: 'Sign In',
        login_hint: 'No account? Register above.',
        register_title: 'Create your account',
        register_username: 'Username',
        register_username_hint: '3-150 characters, letters, numbers, hyphens',
        register_email: 'Email',
        register_password: 'Password',
        register_password_hint: 'Minimum 8 characters, uppercase, number, special character',
        register_password_confirm: 'Confirm password',
        register_button: 'Register',
        register_hint: 'Already have an account? Sign in above.',
        menu_favorites: '⭐ My favorites',
        menu_profile: '👤 My profile',
        menu_logout: '🚪 Sign Out',
        detail_add_favorite: '⭐ Add to favorites',
        detail_remove_favorite: '⭐ Remove from favorites'
    }
};

// Cargar preferencias de idioma y tema desde localStorage
let currentLanguage = localStorage.getItem('animeLanguage') || 'es';
let currentTheme = localStorage.getItem('animeTheme') || 'light';

// Funciones para aplicar tema y idioma
function applyTheme(theme) {
    const body = document.body; // Aplicar clase de tema al body
    body.classList.toggle('theme-dark', theme === 'dark'); // Agregar o quitar clase según el tema
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'; // Cambiar ícono del botón de tema
    currentTheme = theme; //    Actualizar variable de tema actual
    localStorage.setItem('animeTheme', theme); // Guardar preferencia de tema en localStorage
}

// Función para aplicar idioma a los elementos con data-i18n
function applyLanguage(lang) {
    const strings = translations[lang] || translations.es;
    textNodes.forEach((node) => {
        const key = node.dataset.i18n; // Obtener clave de traducción del atributo data-i18n
        if (strings[key]) {
            node.textContent = strings[key];
        }
    });
    langToggle.textContent = lang.toUpperCase();
    currentLanguage = lang;
    localStorage.setItem('animeLanguage', lang);
    const placeholder = searchInput.dataset[`placeholder${lang.toUpperCase()}`];
    if (placeholder) {
        searchInput.placeholder = placeholder;
    }
}

function scrollCarousel(targetSelector, direction) {
    const carousel = document.querySelector(targetSelector);
    if (!carousel) return;
    const amount = carousel.offsetWidth * 0.65;
    carousel.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        alert(translations[currentLanguage].search_hint);
        return;
    }
    fetchAnimeResults(query);
});

heroSearchButton.addEventListener('click', () => {
    searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchInput.focus();
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchButton.click();
    }
});

closeDetail.addEventListener('click', () => {
    detailCard.classList.add('hidden');
    detailPlaceholder.classList.remove('hidden');
});

themeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

langToggle.addEventListener('click', () => {
    applyLanguage(currentLanguage === 'es' ? 'en' : 'es');
});

carouselButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;
        const direction = button.dataset.direction;
        scrollCarousel(target, direction);
    });
});

// Event listeners for genre cards
document.querySelectorAll('.genre-card').forEach((card) => {
    card.addEventListener('click', () => {
        const genreId = card.dataset.genreId;
        fetchAnimeByGenre(genreId);
    });
});

async function fetchAnimeResults(query) {
    resultsList.innerHTML = '<p class="hint">Buscando...</p>';
    resultCount.textContent = '0';
    currentPage = 1; 

    try {
        const response = await fetch(`/anime/search/?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }

        const data = await response.json();
        allResults = data.results || [];
        resultCount.textContent = allResults.length;
        renderResultsPage();

    } catch (error) {
        resultsList.innerHTML = `<p class="hint">${currentLanguage === 'en' ? 'Search failed. Please try again.' : 'No se pudo completar la búsqueda. Intenta de nuevo.'}</p>`;
        console.error(error);
    }
}

function renderResultsPage() {
    if (!allResults.length) {
        resultsList.innerHTML = `<p class="hint">${currentLanguage === 'en' ? 'No results found.' : 'No se encontraron resultados.'}</p>`;
        paginationControls.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = allResults.slice(startIndex, endIndex);

    resultsList.innerHTML = '';

    pageResults.forEach((anime) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${anime.image_url || 'https://via.placeholder.com/100x140?text=No+Image'}" alt="${anime.title}">
            <div class="result-body">
                <h3 class="result-title">${anime.title}</h3>
                <p class="result-genres">${anime.genres || (currentLanguage === 'en' ? 'No genres' : 'Sin géneros')}</p>
                <div class="result-meta">
                    <span>${currentLanguage === 'en' ? 'MAL ID' : 'MAL ID'}: ${anime.mal_id}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            fetchAnimeDetail(anime.mal_id);
        });

        resultsList.appendChild(card);
    });

    renderPagination();
}


async function fetchAnimeDetail(malId) {
    detailPlaceholder.classList.add('hidden');
    detailCard.classList.remove('hidden');
    detailTitle.textContent = currentLanguage === 'en' ? 'Loading...' : 'Cargando...';
    detailImage.src = '';
    detailGenres.textContent = '';
    detailStatus.textContent = '';
    detailSynopsis.textContent = '';
    detailEpisodes.textContent = '-';
    detailScore.textContent = '-';
    detailRank.textContent = '-';
    detailUrl.href = '#';

    try {
        const response = await fetch(`/anime/${malId}/`);
        if (!response.ok) {
            throw new Error('Error al obtener detalles');
        }

        const detail = await response.json();
        detailImage.src = detail.image_url || 'https://via.placeholder.com/128x180?text=No+Image';
        detailImage.alt = detail.title;
        detailTitle.textContent = detail.title;
        detailGenres.textContent = Array.isArray(detail.genres) ? detail.genres.join(', ') : detail.genres;
        detailStatus.textContent = detail.status || (currentLanguage === 'en' ? 'Unknown' : 'Desconocido');
        detailSynopsis.textContent = detail.synopsis || (currentLanguage === 'en' ? 'No synopsis available.' : 'Sin sinopsis disponible.');
        detailEpisodes.textContent = detail.episodes || '-';
        detailScore.textContent = detail.score || '-';
        detailRank.textContent = detail.rank || '-';
        detailUrl.href = detail.url || '#';
        detailUrl.textContent = detail.url ? (currentLanguage === 'en' ? 'View on MyAnimeList' : 'Ver en MyAnimeList') : (currentLanguage === 'en' ? 'Link unavailable' : 'Enlace no disponible');

    } catch (error) {
        detailTitle.textContent = currentLanguage === 'en' ? 'Could not load details' : 'No se pudieron cargar los detalles';
        detailSynopsis.textContent = currentLanguage === 'en' ? 'Try selecting another anime or refresh the page.' : 'Intenta seleccionar otro anime o recarga la página.';
        console.error(error);
    }
}

function renderPagination() {
    const totalPages = Math.ceil(allResults.length / resultsPerPage);

    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    const startResult = (currentPage - 1) * resultsPerPage + 1;
    const endResult = Math.min(currentPage * resultsPerPage, allResults.length);

    paginationControls.innerHTML = `
        <button class="pagination-btn" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
            ${currentLanguage === 'en' ? 'Previous' : 'Anterior'}
        </button>
        <span class="pagination-info">
            ${currentLanguage === 'en' ? 'Showing' : 'Mostrando'} ${startResult}-${endResult} ${currentLanguage === 'en' ? 'of' : 'de'} ${allResults.length} ${currentLanguage === 'en' ? 'results' : 'resultados'}
        </span>
        <button class="pagination-btn" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
            ${currentLanguage === 'en' ? 'Next' : 'Siguiente'}
        </button>
    `;

    // Add event listeners
    document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
}

function changePage(page) {
    const totalPages = Math.ceil(allResults.length / resultsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderResultsPage();

    // Scroll to results section
    searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function fetchAnimeByGenre(genreId) {
    // Reset pagination
    currentPage = 1;

    // Show loading state
    resultsList.innerHTML = `<p class="hint">${currentLanguage === 'en' ? 'Searching...' : 'Buscando...'}</p>`;
    paginationControls.innerHTML = '';
    resultCount.textContent = '0';

    try {
        const response = await fetch(`/anime/genre/?genre_id=${genreId}&limit=50`);
        if (!response.ok) {
            throw new Error('Error al buscar por género');
        }

        const data = await response.json();
        allResults = data.results || [];
        resultCount.textContent = allResults.length;

        // Scroll to results section
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        renderResultsPage();

    } catch (error) {
        resultsList.innerHTML = `<p class="hint error">${currentLanguage === 'en' ? 'Error searching by genre. Please try again.' : 'Error al buscar por género. Inténtalo de nuevo.'}</p>`;
        console.error(error);
    }
}

// ===== FUNCIONES DE AUTENTICACIÓN =====

async function loginUser(username, password) {
    try {
        const response = await fetch('/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            authToken = data.token;
            currentUser = data.user;
            isGuest = false;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.removeItem('isGuest');
            updateAuthUI();
            showAuthenticatedSections();
            closeAuthModal();
            showToast(currentLanguage === 'en' ? 'Welcome!' : '¡Bienvenido!', 'success');
            return true;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const response = await fetch('/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            authToken = data.token;
            currentUser = data.user;
            isGuest = false;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.removeItem('isGuest');
            updateAuthUI();
            showAuthenticatedSections();
            closeAuthModal();
            showToast(currentLanguage === 'en' ? 'Account created successfully!' : '¡Cuenta creada exitosamente!', 'success');
            return true;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

function logoutUser() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showToast(currentLanguage === 'en' ? 'Logged out' : 'Sesión cerrada', 'info');
}

async function verifyToken() {
    if (!authToken) return false;

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

function updateAuthUI() {
    if (authToken && currentUser) {
        // Usuario autenticado
        authToggle.classList.add('hidden');
        registerToggle.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
        }
        if (userMenuUsername) {
            userMenuUsername.textContent = currentUser.username;
        }
        if (favButton) {
            favButton.classList.remove('hidden');
        }
        isGuest = false;
    } else {
        // Usuario no autenticado
        if (authToggle) {
            authToggle.classList.remove('hidden');
        }
        if (registerToggle) {
            registerToggle.classList.remove('hidden');
        }
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
        if (favButton) {
            favButton.classList.add('hidden');
        }
    }
}

// Mostrar secciones autorizadas (cuando usuario está autenticado o es invitado)
function showAuthenticatedSections() {
    const authRequiredSections = document.querySelectorAll('.auth-required');
    authRequiredSections.forEach(section => {
        if (isGuest || (authToken && currentUser)) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// Verificar autorización al cargar la página
function checkAuthorization() {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    isGuest = localStorage.getItem('isGuest') === 'true';
    
    updateAuthUI();
    showAuthenticatedSections();
}

// ===== FUNCIONES DE FAVORITOS =====

async function checkIfFavorite(malId) {
    if (!authToken) return false;

    try {
        const response = await fetch('/api/user/favorites/', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            return data.favorites.some(fav => fav.mal_id === malId);
        }
    } catch (error) {
        console.error('Error checking favorite:', error);
    }
    return false;
}

async function toggleFavorite(malId) {
    if (!authToken) {
        showToast(currentLanguage === 'en' ? 'Please log in to add favorites' : 'Inicia sesión para añadir favoritos', 'warning');
        authModal.classList.remove('hidden');
        return;
    }

    const isFavorite = await checkIfFavorite(malId);
    const action = isFavorite ? 'remove' : 'add';

    try {
        const response = await fetch('/api/user/favorites/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mal_id: malId, action })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            updateFavoriteButton(malId, !isFavorite);
            showToast(
                isFavorite 
                    ? (currentLanguage === 'en' ? 'Removed from favorites' : 'Removido de favoritos')
                    : (currentLanguage === 'en' ? 'Added to favorites' : 'Añadido a favoritos'),
                'success'
            );
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
        showToast(currentLanguage === 'en' ? 'Error updating favorites' : 'Error actualizando favoritos', 'error');
    }
}

function updateFavoriteButton(malId, isFavorite) {
    if (currentAnimeId === malId) {
        favButton.textContent = isFavorite 
            ? (currentLanguage === 'en' ? '⭐ Remove from favorites' : '⭐ Quitar de favoritos')
            : (currentLanguage === 'en' ? '⭐ Add to favorites' : '⭐ Añadir a favoritos');
        favButton.dataset.isFavorite = isFavorite;
    }
}

// ===== FUNCIONES DE UI =====

function showToast(message, type = 'info') {
    // Crear toast temporal
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

function closeAuthModal() {
    authModal.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

// ===== EVENT LISTENERS =====

// Verificar token al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    // Aplicar tema e idioma guardados
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);
    
    // Verificar autorización y mostrar secciones apropiadas
    checkAuthorization();
    
    if (authToken) {
        await verifyToken();
    }
    updateAuthUI();
    showAuthenticatedSections();
});

// Event listeners de autenticación
authToggle.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabButtons[0].classList.add('active');
    tabButtons[1].classList.remove('active');
});

if (registerToggle) {
    registerToggle.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabButtons[0].classList.remove('active');
        tabButtons[1].classList.add('active');
    });
}

if (guestButton) {
    guestButton.addEventListener('click', () => {
        authToken = null;
        currentUser = null;
        isGuest = true;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.setItem('isGuest', 'true');
        updateAuthUI();
        showAuthenticatedSections();
    });
}

if (guestToggle) {
    guestToggle.addEventListener('click', () => {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showToast(currentLanguage === 'en' ? 'Browsing as guest' : 'Navegando como invitado', 'info');
    });
}

closeAuthModal.addEventListener('click', closeAuthModal);

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    loginError.classList.add('hidden');
    
    try {
        await loginUser(username, password);
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        username: document.getElementById('registerUsername').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        password_confirm: document.getElementById('registerPasswordConfirm').value,
    };
    
    registerError.classList.add('hidden');
    
    try {
        await registerUser(userData);
    } catch (error) {
        if (error.message.includes('errors')) {
            const errorData = JSON.parse(error.message);
            registerError.innerHTML = Object.values(errorData.errors).flat().join('<br>');
        } else {
            registerError.textContent = error.message;
        }
        registerError.classList.remove('hidden');
    }
});

userMenu.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
});

logoutBtn.addEventListener('click', () => {
    logoutUser();
    userDropdown.classList.add('hidden');
});

// Event listener para botón de favoritos
favButton.addEventListener('click', () => {
    if (currentAnimeId) {
        toggleFavorite(currentAnimeId);
    }
});

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});
