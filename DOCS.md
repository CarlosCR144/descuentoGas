# Documentación del proyecto DescuentoGas

Esta documentación describe el sistema completo de gestión de descuentos en cilindros de gas licuado, incluyendo autenticación, control de acceso por roles y todas las funcionalidades implementadas.

## Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Sistema de Autenticación](#sistema-de-autenticación)
4. [Roles y Permisos](#roles-y-permisos)
5. [Modelos de Datos](#modelos-de-datos)
6. [Vistas y Funcionalidades](#vistas-y-funcionalidades)
7. [Diseño y Templates](#diseño-y-templates)
8. [Configuración y Despliegue](#configuración-y-despliegue)
9. [Migraciones y Comandos](#migraciones-y-comandos)

---

## Visión General

**DescuentoGas** es una aplicación web Django para la Agrupación de Municipalidades de Chile que gestiona solicitudes de descuento en cilindros de gas licuado.

### Características principales

- ✅ Sistema de autenticación completo (login/logout)
- ✅ Control de acceso basado en roles (Administrador, Vendedor, Usuario Anónimo)
- ✅ Gestión completa de solicitudes (CRUD)
- ✅ Gestión de usuarios (crear, editar, eliminar)
- ✅ Expiración automática de solicitudes (MySQL EVENT)
- ✅ Diseño minimalista moderno y responsive
- ✅ Manejo robusto de errores
- ✅ Zona horaria configurada para Chile

### Stack Tecnológico

- **Backend:** Django 5.2.5
- **Base de Datos:** MySQL
- **Frontend:** HTML, CSS moderno (sistema de diseño propio)
- **Autenticación:** Django Auth + Groups & Permissions

---

## Estructura del Proyecto

```
descuentoGas/
├── descuentoGas/                  # Configuración del proyecto
│   ├── settings.py              # Configuración principal + autenticación
│   ├── urls.py                  # Rutas principales (sin prefijo)
│   └── wsgi.py/asgi.py          # Despliegue
│
├── descuentoGasApp/             # Aplicación principal
│   ├── models.py                # Modelo Solicitud con choices
│   ├── views.py                 # 20+ vistas con decoradores de roles
│   ├── forms.py                 # Formularios + validaciones
│   ├── urls.py                  # Rutas de la app (organizadas por rol)
│   │
│   ├── templates/
│   │   ├── base.html           # Template master
│   │   ├── index.html          # Página de inicio
│   │   ├── components/         # Navbar, footer
│   │   ├── solicitudes/        # Templates públicos
│   │   ├── administrador/      # Templates admin (solicitudes + usuarios)
│   │   ├── vendedor/           # Templates vendedor
│   │   ├── perfil/             # Templates perfil de usuario
│   │   └── login/              # Templates autenticación
│   │
│   ├── static/
│   │   ├── css/styles.css      # Diseño minimalista moderno
│   │   └── js/validaciones.js  # Validaciones cliente
│   │
│   └── management/
│       └── commands/
│           └── crear_grupos.py # Comando para inicializar roles
│
├── manage.py                    # CLI de Django
├── requirements.txt             # Dependencias
├── descuentogas_db_script.sql   # Scripts SQL
└── DOCS.md                      # Este archivo
```

---

## Sistema de Autenticación

### Configuración (settings.py)

```python
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

MESSAGE_TAGS = {
    messages.SUCCESS: 'success',
    messages.ERROR: 'danger',
    messages.WARNING: 'warning',
    messages.INFO: 'info',
}
```

### Vistas de Autenticación

| Vista | URL | Descripción |
|-------|-----|-------------|
| `login_view` | `/login/` | Formulario de inicio de sesión |
| `logout_view` | `/logout/` | Cierre de sesión y redirección |

### Flujo de Login

1. Usuario ingresa email y contraseña
2. Sistema autentica con `django.contrib.auth.authenticate()`
3. Se verifica el grupo del usuario
4. Redirección automática según rol:
   - **Administrador** → `/administrador/solicitudes/`
   - **Vendedor** → `/vendedor/dashboard/`

### Credenciales Iniciales

```
Email: admin@descuentogas.cl
Contraseña: admin123
Rol: Administrador
```

---

## Roles y Permisos

### Grupos Configurados

#### 1. Usuario Anónimo (Público)

**Sin autenticación requerida**

- ✅ Ingresar solicitudes
- ✅ Ver página de inicio
- ❌ Acceso a funciones administrativas

#### 2. Vendedor

**Requiere: `@login_required` + `@user_passes_test(es_vendedor)`**

**Permisos:**
- ✅ Ver solicitudes (solo mediante búsqueda por RUT)
- ✅ Ver su propio perfil
- ✅ Cambiar su propia contraseña
- ❌ Modificar o eliminar solicitudes
- ❌ Acceso a gestión de usuarios

**Funcionalidades:**
| Funcionalidad | URL | Template |
|---------------|-----|----------|
| Dashboard Vendedor | `/vendedor/dashboard/` | `vendedor/dashboard.html` |
| Buscar Solicitud | `/vendedor/buscar/` | `vendedor/buscar_solicitud.html` |

#### 3. Administrador

**Requiere: `@login_required` + `@user_passes_test(es_administrador)`**

**Permisos:**
- ✅ Gestión completa de solicitudes (CRUD)
- ✅ Cambiar estados de solicitudes
- ✅ Eliminar duplicados
- ✅ Gestión completa de usuarios (crear, editar, eliminar)
- ✅ Reestablecer contraseñas de usuarios
- ✅ Ver su propio perfil

**Funcionalidades de Solicitudes:**
| Funcionalidad | URL | Template |
|---------------|-----|----------|
| Listar Solicitudes | `/administrador/solicitudes/` | `administrador/solicitudes/listar.html` |
| Ver Detalle | `/administrador/solicitudes/detalle/<id>/` | `administrador/solicitudes/detalle.html` |
| Cambiar Estado | `/administrador/solicitudes/cambiar-estado/<id>/` | `administrador/solicitudes/cambiar_estado.html` |
| Eliminar | `/administrador/solicitudes/eliminar/<id>/` | `administrador/solicitudes/eliminar_confirmacion.html` |
| Eliminar Duplicados | `/administrador/solicitudes/eliminar-duplicados/` | (Redirect) |

**Funcionalidades de Usuarios:**
| Funcionalidad | URL | Template |
|---------------|-----|----------|
| Listar Usuarios | `/administrador/usuarios/` | `administrador/usuarios/listar.html` |
| Crear Usuario | `/administrador/usuarios/crear/` | `administrador/usuarios/crear.html` |
| Ver Detalle | `/administrador/usuarios/detalle/<id>/` | `administrador/usuarios/detalle.html` |
| Reestablecer Contraseña | `/administrador/usuarios/reestablecer/<id>/` | `administrador/usuarios/reestablecer_password.html` |
| Eliminar | `/administrador/usuarios/eliminar/<id>/` | `administrador/usuarios/eliminar_confirmacion.html` |

### Funciones Auxiliares

```python
def es_administrador(user):
    return user.groups.filter(name='Administrador').exists()

def es_vendedor(user):
    return user.groups.filter(name='Vendedor').exists()
```

### Uso de Decoradores

```python
@login_required
@user_passes_test(es_administrador, login_url='/')
def administrar_solicitudes(request):
    # Solo accesible para administradores autenticados
    ...
```

---

## Modelos de Datos

### Modelo Solicitud

```python
class Solicitud(models.Model):
    ESTADOS = [
        ('Pendiente', 'Pendiente'),
        ('Aceptada', 'Aceptada'),
        ('Rechazada', 'Rechazada'),
        ('Expirada', 'Expirada'),
    ]
    
    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20)
    comuna = models.CharField(max_length=100)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_aceptacion = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
```

**Mejoras Implementadas:**
- ✅ **Choices normalizados:** Evita errores tipográficos y asegura consistencia
- ✅ **RUT único:** Previene duplicados automáticamente
- ✅ **Fechas automáticas:** `fecha_solicitud` se asigna en creación

### Modelo User (Django Auth)

Se utiliza `django.contrib.auth.models.User` con las siguientes características:

- `username` = email del usuario
- `email` = correo electrónico
- `first_name` = nombre
- `last_name` = apellidos
- `groups` = asignación a "Administrador" o "Vendedor"

---

## Vistas y Funcionalidades

### Vistas Públicas (Sin Autenticación)

| Vista | URL | Descripción |
|-------|-----|-------------|
| `index` | `/` | Página de inicio con información del sistema |
| `ingresar_solicitud` | `/ingresar/` | Formulario para crear solicitudes |
| `login_view` | `/login/` | Inicio de sesión |

### Manejo de Duplicados (Mejorado)

```python
# En ingresar_solicitud
try:
    form.save()
    messages.success(request, 'Solicitud ingresada correctamente.')
except IntegrityError:
    messages.error(request, 'Ya existe una solicitud con ese RUT.')
```

### Lógica de Cambio de Estado

```python
if nuevo_estado == "Aceptada":
    solicitud.fecha_aceptacion = timezone.now()  # Guarda en UTC
else:
    solicitud.fecha_aceptacion = None
```

### Eliminación de Duplicados

```python
duplicados = Solicitud.objects.values('rut').annotate(
    cantidad=Count('id')
).filter(cantidad__gt=1)

for item in duplicados:
    solicitudes = Solicitud.objects.filter(rut=rut).order_by('fecha_solicitud')
    primera = solicitudes.first()  # Conserva la más antigua
    solicitudes.exclude(pk=primera.pk).delete()
```

---

## Diseño y Templates

### Sistema de Diseño Minimalista

**Características:**
- 🎨 Paleta de colores moderna (azul #2563eb + grises)
- ✨ Sombras sutiles y bordes redondeados
- 📱 100% responsive (mobile-first)
- ♻️ Sistema de variables CSS reutilizables
- 💁 Tipografía Inter (Google Fonts)

**Variables CSS Principales:**
```css
:root {
    --color-primary: #2563eb;
    --color-background: #f8fafc;
    --color-surface: #ffffff;
    --color-border: #e2e8f0;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --radius-md: 0.5rem;
}
```

### Template Master (base.html)

**Estructura:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}DescuentoGas{% endblock %}</title>
    <link rel="stylesheet" href="{% static 'css/styles.css' %}">
</head>
<body>
    {% include 'components/navbar.html' %}
    
    <main>
        <div class="container">
            {% if messages %}
                <!-- Mensajes de feedback -->
            {% endif %}
            {% block content %}{% endblock %}
        </div>
    </main>
    
    {% include 'components/footer.html' %}
</body>
</html>
```

### Navbar Dinámica

Muestra opciones según el rol del usuario:

**Usuario Anónimo:**
- Inicio
- Ingresar Solicitud
- Iniciar Sesión

**Vendedor:**
- Inicio
- Ingresar Solicitud
- Buscar Solicitud
- Mi Perfil
- Cerrar Sesión

**Administrador:**
- Inicio
- Ingresar Solicitud
- Administrar Solicitudes
- Gestión de Usuarios
- Mi Perfil
- Cerrar Sesión

### Organización de Templates

```
templates/
├── base.html                    # Template master
├── index.html                   # Página inicio
├── components/
│   ├── navbar.html              # Navbar dinámica
│   └── footer.html              # Footer
├── solicitudes/
│   └── ingresar_solicitud.html  # Formulario público
├── administrador/
│   ├── solicitudes/
│   │   ├── listar.html
│   │   ├── detalle.html
│   │   ├── cambiar_estado.html
│   │   └── eliminar_confirmacion.html
│   └── usuarios/
│       ├── listar.html
│       ├── crear.html
│       ├── detalle.html
│       ├── reestablecer_password.html
│       └── eliminar_confirmacion.html
├── vendedor/
│   ├── dashboard.html
│   └── buscar_solicitud.html
├── perfil/
│   ├── ver_perfil.html
│   └── cambiar_password.html
└── login/
    └── login.html
```

---

## Configuración y Despliegue

### Requisitos

```txt
django>=5.2.5
mysqlclient>=2.1
```

### Configuración de Base de Datos

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'descuentogas_db',
        'USER': 'root',
        'PASSWORD': 'root1234',  # Cambiar en producción
    }
}
```

### Zona Horaria

```python
TIME_ZONE = 'America/Santiago'
LANGUAGE_CODE = 'es-cl'
USE_TZ = True  # Django guarda en UTC, muestra en TIME_ZONE
```

### Evento MySQL de Expiración

**Para Producción (1 mes):**
```sql
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS check_expired_requests;

DELIMITER //
CREATE EVENT check_expired_requests
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    UPDATE descuentogasapp_solicitud
    SET estado = 'Expirada'
    WHERE estado = 'Aceptada'
      AND fecha_aceptacion IS NOT NULL
      AND TIMESTAMPADD(MONTH, 1, fecha_aceptacion) <= UTC_TIMESTAMP();
END //
DELIMITER ;
```

**Para Pruebas (2 minutos):**
```sql
CREATE EVENT check_expired_requests
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    UPDATE descuentogasapp_solicitud
    SET estado = 'Expirada'
    WHERE estado = 'Aceptada'
      AND fecha_aceptacion IS NOT NULL
      AND TIMESTAMPADD(MINUTE, 2, fecha_aceptacion) <= UTC_TIMESTAMP();
END //
```

---

## Migraciones y Comandos

### Setup Inicial

```powershell
# 1. Crear entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear base de datos en MySQL
# Ejecutar: CREATE DATABASE descuentogas_db;

# 4. Ejecutar migraciones
python manage.py migrate

# 5. Crear grupos y usuario administrador inicial
python manage.py crear_grupos

# 6. Ejecutar servidor
python manage.py runserver
```

### Comando Personalizado: crear_grupos

**Ubicación:** `descuentoGasApp/management/commands/crear_grupos.py`

**Funcionalidad:**
1. Crea grupo "Administrador" con todos los permisos
2. Crea grupo "Vendedor" con permiso solo de ver Solicitud
3. Crea usuario inicial:
   - Email: `admin@descuentogas.cl`
   - Password: `admin123`
   - Rol: Administrador

**Uso:**
```bash
python manage.py crear_grupos
```

### Crear Migraciones Nuevas

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Formularios y Validaciones

### SolicitudForm

**Validación de RUT:**
```python
def clean_rut(self):
    rut = self.cleaned_data.get('rut', '').replace(' ', '')
    if len(rut) < 7 or len(rut) > 12:
        raise forms.ValidationError('RUT debe tener entre 7 y 12 caracteres...')
    if not re.match(r'^[0-9\.\-kK]+$', rut):
        raise forms.ValidationError('Formato de RUT inválido...')
    return rut
```

### CrearUsuarioForm

**Validaciones:**
- Email único (no puede repetirse)
- Contraseñas coincidentes
- Rol obligatorio (Administrador o Vendedor)
- Mínimo 6 caracteres en contraseña

### ReestablecerPasswordForm

**Validaciones:**
- Contraseñas coincidentes
- Mínimo 6 caracteres

---

## Manejo de Errores

### Sistema Centralizado

**Vista de Error:**
```python
def error_page(request, codigo_error="404", mensaje="...", detalle="..."):
    return render(request, 'error.html', {...})
```

**Handler 404 Global:**
```python
# descuentoGas/urls.py
handler404 = lambda request, exception: error_page(request)
```

**Try/Except en Vistas Críticas:**
```python
try:
    solicitud = get_object_or_404(Solicitud, id=solicitud_id)
except Http404:
    return error_page(request, mensaje="Solicitud no encontrada", ...)
```

---

## URLs del Sistema

### Mapa Completo de URLs

```
/                                             → Página de inicio
/login/                                       → Iniciar sesión
/logout/                                      → Cerrar sesión
/ingresar/                                    → Ingresar solicitud (público)

# Vendedor
/vendedor/dashboard/                          → Dashboard vendedor
/vendedor/buscar/                             → Buscar solicitud por RUT

# Administrador - Solicitudes
/administrador/solicitudes/                   → Listar solicitudes
/administrador/solicitudes/detalle/<id>/      → Ver detalle
/administrador/solicitudes/cambiar-estado/<id>/ → Cambiar estado
/administrador/solicitudes/eliminar/<id>/     → Eliminar solicitud
/administrador/solicitudes/eliminar-duplicados/ → Limpiar duplicados

# Administrador - Usuarios
/administrador/usuarios/                      → Listar usuarios
/administrador/usuarios/crear/                → Crear usuario
/administrador/usuarios/detalle/<id>/         → Ver detalle
/administrador/usuarios/reestablecer/<id>/    → Cambiar contraseña
/administrador/usuarios/eliminar/<id>/        → Eliminar usuario

# Perfil
/perfil/                                      → Ver perfil propio
/perfil/cambiar-password/                     → Cambiar contraseña propia
```

---

## Cumplimiento de Requisitos

### Evaluación Sumativa 2 (ES2)

| Requisito | Estado | Implementación |
|-----------|--------|------------------|
| CRUD de solicitudes | ✅ | Todas las vistas implementadas |
| Conexión a BD | ✅ | MySQL configurado |
| Vigencia de 1 mes | ✅ | MySQL EVENT |
| Estados normalizados | ✅ | `choices` en modelo |
| Expiración automática | ✅ | EVENT independiente |

### Evaluación Sumativa 3 (ES3)

| Requisito | Estado | Implementación |
|-----------|--------|------------------|
| Autenticación | ✅ | Login/Logout completo |
| Roles (Admin/Vendedor) | ✅ | Django Groups + decoradores |
| Gestión de usuarios | ✅ | CRUD completo de usuarios |
| Control de acceso | ✅ | `@user_passes_test` |
| Perfil de usuario | ✅ | Ver y cambiar contraseña |
| Sesiones | ✅ | Django sessions |

---

## Conclusión

El proyecto **DescuentoGas** es una aplicación Django completa y funcional que cumple con todos los requisitos de las evaluaciones sumativas 2 y 3. 

**Implementaciones clave:**
- ✅ Sistema de autenticación robusto
- ✅ Control de acceso granular por roles
- ✅ Diseño moderno y responsive
- ✅ Expiración automática independiente
- ✅ Manejo de errores centralizado
- ✅ Código limpio y bien organizado

**Próximos pasos opcionales:**
- Tests automatizados (unit tests)
- Validación completa de RUT chileno
- Paginación en listados
- Protección de credenciales con variables de entorno

---

**Fecha de última actualización:** Noviembre 2025
