// Anime Recommender - Auth Pages JavaScript

// ===== ELEMENTOS DEL DOM =====
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// ===== VARIABLES DE ESTADO =====
let currentLanguage = localStorage.getItem('animeLanguage') || 'es';
let currentTheme = localStorage.getItem('animeTheme') || 'light';

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
async function loginUser(username, password) {
    try {
        const response = await fetch('/auth/login/', { //. fetch significa hacer una solicitud HTTP al backend para enviar las credenciales del usuario y obtener un token de autenticación si son correctas.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Mostrar mensaje de éxito
            showToast(currentLanguage === 'en' ? 'Welcome!' : '¡Bienvenido!', 'success');

            // Redirigir a la página principal
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

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
            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Mostrar mensaje de éxito
            showToast(currentLanguage === 'en' ? 'Account created successfully!' : '¡Cuenta creada exitosamente!', 'success');

            // Redirigir a la página principal
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

            return true;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
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

// ===== EVENT LISTENERS =====

// Aplicar tema e idioma al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    applyLanguage(currentLanguage);
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

// Event listeners de formularios
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (loginError) loginError.classList.add('hidden');

        try {
            await loginUser(username, password);
        } catch (error) {
            if (loginError) {
                loginError.textContent = error.message;
                loginError.classList.remove('hidden');
            }
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            password_confirm: document.getElementById('registerPasswordConfirm').value,
        };

        if (registerError) registerError.classList.add('hidden');

        try {
            await registerUser(userData);
        } catch (error) {
            if (registerError) {
                if (error.message.includes('errors')) {
                    const errorData = JSON.parse(error.message);
                    registerError.innerHTML = Object.values(errorData.errors).flat().join('<br>');
                } else {
                    registerError.textContent = error.message;
                }
                registerError.classList.remove('hidden');
            }
        }
    });
}