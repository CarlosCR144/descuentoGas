# DescuentoGas 📦

Sistema de gestión de solicitudes de descuento en cilindros de gas licuado para la Agrupación de Municipalidades de Chile.

## 🎯 Características

- ✅ **Sistema de autenticación completo** - Login/Logout con control de acceso
- ✅ **Tres niveles de acceso** - Usuario Anónimo, Vendedor, Administrador
- ✅ **Gestión completa** - CRUD de solicitudes y usuarios
- ✅ **Expiración automática** - Mediante MySQL EVENT (independiente de la aplicación)
- ✅ **Diseño moderno** - UI minimalista y responsive
- ✅ **Zona horaria Chile** - Configurado para `America/Santiago`

## 🛠️ Stack Tecnológico

- **Backend:** Django 5.2.5
- **Base de Datos:** MySQL
- **Frontend:** HTML + CSS moderno (sistema de diseño propio)
- **Autenticación:** Django Auth + Groups & Permissions

## 🚀 Instalación

### Requisitos Previos

- Python 3.10+
- MySQL 8.0+
- pip (gestor de paquetes Python)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/CarlosCR144/descuentoGas.git
cd descuentoGas
```

### Paso 2: Crear Entorno Virtual

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Paso 3: Instalar Dependencias

```bash
pip install -r requirements.txt
```

### Paso 4: Configurar Base de Datos

1. **Crear base de datos en MySQL:**

```sql
CREATE DATABASE descuentogas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Actualizar credenciales** en `descuentoGas/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'descuentogas_db',
        'USER': 'tu_usuario',      # Cambiar
        'PASSWORD': 'tu_password',  # Cambiar
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### Paso 5: Ejecutar Migraciones

```bash
python manage.py migrate
```

### Paso 6: Crear Grupos y Usuario Administrador

```bash
python manage.py crear_grupos
```

**Este comando crea:**
- Grupo "Administrador" con todos los permisos
- Grupo "Vendedor" con permiso solo de lectura
- Usuario administrador inicial:
  - **Email:** `admin@descuentogas.cl`
  - **Contraseña:** `admin123`

### Paso 7: Activar Evento de Expiración en MySQL

**Conectarse a MySQL y ejecutar:**

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

**Para pruebas (expira en 2 minutos):**
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

### Paso 8: Ejecutar Servidor de Desarrollo

```bash
python manage.py runserver
```

Accede a: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 👤 Credenciales de Acceso

### Usuario Administrador (Creado automáticamente)

```
Email: admin@descuentogas.cl
Contraseña: admin123
```

### Crear Usuarios Adicionales

1. Inicia sesión como administrador
2. Ve a **Gestión de Usuarios** → **Crear Usuario**
3. Completa el formulario y asigna un rol (Administrador o Vendedor)

## 📚 Documentación

Para documentación detallada, consulta [DOCS.md](DOCS.md)

**Incluye:**
- Arquitectura del sistema
- Roles y permisos detallados
- Guía de desarrollo
- Estructura de templates
- Sistema de diseño
- Mapa completo de URLs

## 📋 Funcionalidades por Rol

### Usuario Anónimo (Público)

- ✅ Ingresar solicitudes de descuento
- ✅ Ver página de inicio

### Vendedor

- ✅ Buscar solicitudes por RUT
- ✅ Ver detalles de solicitudes
- ✅ Ver y editar su perfil
- ✅ Cambiar su propia contraseña

### Administrador

- ✅ Todas las funciones de Vendedor
- ✅ Listar todas las solicitudes
- ✅ Cambiar estados de solicitudes
- ✅ Eliminar solicitudes
- ✅ Eliminar duplicados automáticamente
- ✅ Crear usuarios (Administradores y Vendedores)
- ✅ Editar usuarios
- ✅ Reestablecer contraseñas de usuarios
- ✅ Eliminar usuarios

## 💻 Comandos Útiles

### Desarrollo

```bash
# Ejecutar servidor de desarrollo
python manage.py runserver

# Crear nuevas migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Acceder a shell de Django
python manage.py shell

# Crear superusuario (admin de Django)
python manage.py createsuperuser
```

### Gestión de Base de Datos

```bash
# Ver estado del evento de expiración
mysql -u root -p -e "SHOW EVENTS FROM descuentogas_db;"

# Activar scheduler de eventos
mysql -u root -p -e "SET GLOBAL event_scheduler = ON;"
```

## 🌐 Estructura de URLs

```
/                              → Página de inicio
/login/                        → Iniciar sesión
/ingresar/                     → Ingresar solicitud (público)

/vendedor/dashboard/           → Dashboard vendedor
/vendedor/buscar/              → Buscar solicitud

/administrador/solicitudes/    → Administrar solicitudes
/administrador/usuarios/       → Gestión de usuarios

/perfil/                       → Mi perfil
/perfil/cambiar-password/      → Cambiar contraseña
```

Para el mapa completo de URLs, consulta [DOCS.md](DOCS.md#urls-del-sistema)

## 🛡️ Seguridad

- ✅ Contraseñas hasheadas con algoritmo PBKDF2
- ✅ Protección CSRF habilitada
- ✅ Control de acceso basado en decoradores
- ✅ Validación de formularios cliente y servidor
- ✅ Prevención de duplicados con RUT único

**Recomendaciones para producción:**
- Cambiar `SECRET_KEY` en `settings.py`
- Configurar `DEBUG = False`
- Usar variables de entorno para credenciales
- Configurar HTTPS
- Agregar `ALLOWED_HOSTS`

## 🐛 Solución de Problemas

### Error de conexión a MySQL

```
django.db.utils.OperationalError: (2003, "Can't connect to MySQL server...")
```

**Solución:**
- Verifica que MySQL esté ejecutándose
- Confirma credenciales en `settings.py`
- Asegúrate de que la base de datos exista

### Evento de expiración no funciona

```sql
-- Verificar si el scheduler está activo
SHOW VARIABLES LIKE 'event_scheduler';

-- Activarlo si está en OFF
SET GLOBAL event_scheduler = ON;

-- Ver eventos existentes
SHOW EVENTS FROM descuentogas_db;
```

### Migraciones pendientes

```bash
# Ver migraciones pendientes
python manage.py showmigrations

# Aplicar migraciones
python manage.py migrate
```

## 📚 Recursos Adicionales

- [Documentación Django](https://docs.djangoproject.com/)
- [Django Authentication](https://docs.djangoproject.com/en/5.2/topics/auth/)
- [MySQL Events](https://dev.mysql.com/doc/refman/8.0/en/events.html)

## 📝 Licencia

Este proyecto fue desarrollado como parte de las evaluaciones sumativas del curso de Programación Back End.

## 👨‍💻 Autor

Carlos Andrés Carrasco Robles
- GitHub: [@CarlosCR144](https://github.com/CarlosCR144)

---

**Última actualización:** Noviembre 2025
