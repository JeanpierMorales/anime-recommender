# 🚀 GUÍA SEMANA 4: Autenticación + Persistencia

## 1. Setup Inicial

### Instalar dependencias
```bash
cd "anime-recommender"
pip install -r requirements.txt
```

### Crear migraciones
```bash
python manage.py makemigrations anime_app
python manage.py migrate
```

### Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### Ejecutar servidor
```bash
python manage.py runserver
```

Acceder a: `http://localhost:8000`
Admin: `http://localhost:8000/admin`

---

## 2. Testing de Endpoints

### 🔐 REGISTRO

```bash
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "email": "usuario@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
  }'
```

**Respuesta Exitosa (201):**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente",
  "token": "abc123xyz...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com"
  }
}
```

**Errores Posibles:**
- Username existe → 400
- Email existe → 400
- Contraseña débil → 400
- Contraseñas no coinciden → 400

---

### 🔑 LOGIN

```bash
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "SecurePass123!"
  }'
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "message": "Sesión iniciada exitosamente",
  "token": "abc123xyz...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com"
  }
}
```

**Errores Posibles:**
- Credenciales inválidas → 401
- Rate limited (5 intentos fallidos) → 429

---

### ✅ VERIFICAR TOKEN

```bash
curl -X POST http://localhost:8000/auth/verify/ \
  -H "Authorization: Bearer abc123xyz..."
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "message": "Token válido",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com"
  }
}
```

---

### ⭐ GESTIONAR FAVORITOS

#### Obtener favoritos
```bash
curl -X GET http://localhost:8000/api/user/favorites/ \
  -H "Authorization: Bearer abc123xyz..."
```

**Respuesta (200):**
```json
{
  "status": "success",
  "count": 2,
  "favorites": [
    {
      "mal_id": 1,
      "title": "Death Note",
      "image_url": "...",
      "added_at": "2026-04-12T10:30:00Z"
    },
    {
      "mal_id": 5,
      "title": "Cowboy Bebop",
      "image_url": "...",
      "added_at": "2026-04-12T09:15:00Z"
    }
  ]
}
```

#### Agregar favorito
```bash
curl -X POST http://localhost:8000/api/user/favorites/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123xyz..." \
  -d '{
    "mal_id": 1,
    "action": "add"
  }'
```

**Respuesta (200):**
```json
{
  "status": "success",
  "message": "Anime agregado a favoritos",
  "mal_id": 1,
  "action": "added"
}
```

#### Remover favorito
```bash
curl -X POST http://localhost:8000/api/user/favorites/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123xyz..." \
  -d '{
    "mal_id": 1,
    "action": "remove"
  }'
```

**Respuesta (200):**
```json
{
  "status": "success",
  "message": "Anime removido de favoritos",
  "mal_id": 1,
  "action": "removed"
}
```

---

## 3. Validaciones de Seguridad

### ✅ Rate Limiting Activo
- Máximo 5 intentos fallidos por usuario/IP en 15 minutos
- Después del 5to intento fallido: error 429 (Too Many Requests)

### ✅ Validación de Contraseña
Requisitos:
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&*...)
- No puede contener el username

### ✅ Validación de Usuario
- Mínimo 3 caracteres
- Máximo 150 caracteres
- Solo letras, números, guiones, guiones bajos
- Debe ser único en la BD

### ✅ Protección CSRF
- Habilitada en formularios POST
- Session cookies con HttpOnly

---

## 4. Estructura de Producción

Para deploy en producción, actualiza `.env`:

```bash
DEBUG=False
ALLOWED_HOSTS=tudominio.com
SECRET_KEY=<generate-new-key>
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

---

## 5. Próximos Pasos (Semana 5)

- [ ] Frontend: UI de Login/Registro
- [ ] Frontend: Integración de favoritos
- [ ] Backend: Ratings de usuario
- [ ] Backend: Recomendaciones personalizadas
- [ ] Testing: Test suite completo

---

## 📊 Modelos de BD

```
User (Django built-in)
├── UserProfile (1-1)
├── AuthToken (1-1)
├── UserAnimeList (1-many)
│   └── status: plan_to_watch, watching, completed, dropped
│   └── rating: 1-10
└── LoginAttempt (1-many) - Solo auditoría

Anime
├── mal_id (PK)
├── title
├── genres
└── image_url
```

---

## 🔒 Consideraciones de Seguridad

1. **Tokens**: Generados con SHA256 + secrets.token_hex(32)
2. **Passwords**: PBKDF2/Argon2 hashing automático
3. **Rate Limiting**: Por usuario + IP address
4. **IP Tracking**: Registración de intentos para auditoría
5. **Session**: 24 horas, HttpOnly, SameSite=Lax
6. **CSRF**: Habilitado, protege contra ataques cross-site

---

¡Ya tienes un sistema de autenticación enterprise-grade! 🎉
