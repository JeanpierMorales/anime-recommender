/*
Script principal para la interfaz de búsqueda y landing page.
Permite cambiar idioma, alternar tema y consultar la API local.
*/

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const heroSearchButton = document.getElementById('heroSearchButton');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const resultsList = document.getElementById('resultsList');
const resultCount = document.getElementById('resultCount');
const detailCard = document.getElementById('detailCard');
const detailPlaceholder = document.getElementById('detailPlaceholder');
const closeDetail = document.getElementById('closeDetail');
const searchSection = document.getElementById('searchSection');
const carouselButtons = document.querySelectorAll('.pager');
const textNodes = document.querySelectorAll('[data-i18n]');

const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailGenres = document.getElementById('detailGenres');
const detailStatus = document.getElementById('detailStatus');
const detailSynopsis = document.getElementById('detailSynopsis');
const detailEpisodes = document.getElementById('detailEpisodes');
const detailScore = document.getElementById('detailScore');
const detailRank = document.getElementById('detailRank');
const detailUrl = document.getElementById('detailUrl');

// Pagination variables
let currentPage = 1;
const resultsPerPage = 4;
let allResults = [];
const paginationControls = document.getElementById('paginationControls');

const translations = {
    es: {
        nav_slogan: 'Busca anime con estilo',
        nav_home: 'Inicio',
        nav_explore: 'Explorar',
        nav_search: 'Buscar',
        nav_roadmap: 'Roadmap',
        hero_tag: 'Landing moderna',
        hero_title: 'Busca anime rápido y explora detalles al instante',
        hero_subtitle: 'Interfaz limpia con búsqueda dinámica, resultados en vivo y vista de detalle. Ideal para la base del frontend de tu aplicación.',
        hero_cta: 'Comenzar búsqueda',
        hero_roadmap: 'Ver roadmap',
        hero_metrics_1_title: 'Resultados en vivo',
        hero_metrics_1_body: 'Busca sin recargar y descubre anime al instante.',
        hero_metrics_2_title: 'Vista de detalle',
        hero_metrics_2_body: 'Selecciona un anime y ve sinopsis, score y episodios.',
        hero_metrics_3_title: 'Preparado para crecer',
        hero_metrics_3_body: 'La base de frontend lista para agregar login y favoritos.',
        explore_tag: 'Explora géneros',
        explore_title: 'Carrusel de categorías',
        genre_action: 'Acción',
        genre_adventure: 'Aventura',
        genre_fantasy: 'Fantasía',
        genre_sf: 'Ciencia ficción',
        genre_drama: 'Drama',
        genre_comedy: 'Comedia',
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
    },
    en: {
        nav_slogan: 'Search anime with style',
        nav_home: 'Home',
        nav_explore: 'Explore',
        nav_search: 'Search',
        nav_roadmap: 'Roadmap',
        hero_tag: 'Modern landing',
        hero_title: 'Search anime fast and explore details instantly',
        hero_subtitle: 'Clean interface with dynamic search, live results and detail view. Built for the frontend base of your app.',
        hero_cta: 'Start searching',
        hero_roadmap: 'View roadmap',
        hero_metrics_1_title: 'Live results',
        hero_metrics_1_body: 'Search without reloading and discover anime instantly.',
        hero_metrics_2_title: 'Detail view',
        hero_metrics_2_body: 'Select an anime and see synopsis, score and episodes.',
        hero_metrics_3_title: 'Ready to grow',
        hero_metrics_3_body: 'Frontend base ready for login and favorites.',
        explore_tag: 'Explore genres',
        explore_title: 'Categories carousel',
        genre_action: 'Action',
        genre_adventure: 'Adventure',
        genre_fantasy: 'Fantasy',
        genre_sf: 'Sci-fi',
        genre_drama: 'Drama',
        genre_comedy: 'Comedy',
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
    }
};

let currentLanguage = localStorage.getItem('animeLanguage') || 'es';
let currentTheme = localStorage.getItem('animeTheme') || 'light';

function applyTheme(theme) {
    const body = document.body;
    body.classList.toggle('theme-dark', theme === 'dark');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    currentTheme = theme;
    localStorage.setItem('animeTheme', theme);
}

function applyLanguage(lang) {
    const strings = translations[lang] || translations.es;
    textNodes.forEach((node) => {
        const key = node.dataset.i18n;
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

async function fetchAnimeResults(query) {
    resultsList.innerHTML = '<p class="hint">Buscando...</p>';
    resultCount.textContent = '0';
    currentPage = 1; // Reset to first page on new search

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

applyTheme(currentTheme);
applyLanguage(currentLanguage);
