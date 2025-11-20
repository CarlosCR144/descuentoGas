# Changelog - DescuentoGas

Todas las mejoras y cambios notables del proyecto.

## [2.0.0] - 2025-11-20

### ➕ Agregado

#### Mejoras de UX/UI
- **Navbar Responsive con Menú Hamburguesa** 🍔
  - Menú hamburguesa animado en dispositivos móviles (<768px)
  - Transiciones suaves y overlay al abrir
  - Cierre automático al hacer click en enlaces o fuera del menú
  - Diseño adaptable para tablets y móviles pequeños

#### Validaciones y Formularios
- **Validación de Teléfono Chileno** 📞
  - Acepta formato: `9XXXXXXXX` o `+569XXXXXXXX`
  - Validación en frontend (HTML5 pattern) y backend (Django forms)
  - Normalización automática antes de guardar en BD
  - Mensajes de error descriptivos

- **Selector Inteligente de Región y Comuna** 🗺️
  - Dropdown de 16 regiones de Chile
  - Dropdown de comunas filtrado por región seleccionada
  - Autocompletado al escribir nombre de comuna
  - Base de datos completa con 346 comunas de Chile
  - Sugerencias dinámicas con resaltado visual
  - Funciona con o sin selección de región

#### Datos y Estructura
- **Archivo `regiones_comunas.py`**
  - Datos completos de todas las regiones y comunas de Chile
  - Funciones auxiliares: `get_all_regiones()`, `get_comunas_by_region()`, `get_all_comunas()`
  - Fácil mantenimiento y actualización

- **JavaScript `region_comuna.js`**
  - Lógica de filtrado y autocompletado
  - Manejo de eventos para región y comuna
  - Sugerencias en tiempo real
  - Cierre automático de sugerencias

#### Estilos y Responsive
- **Archivo `responsive.css`**
  - Estilos específicos para navbar responsive
  - Estilos para sugerencias de comuna
  - Media queries optimizados para móvil y tablet
  - Prevención de zoom en iOS (font-size: 16px en inputs)

### 🔧 Corregido
- Error de comillas inconsistentes en `crear_grupos.py` (línea 67)
- Template `ingresar_solicitud.html` actualizado con nuevos campos
- Importaciones agregadas en `forms.py` para soportar regiones/comunas

### 📝 Archivos Modificados
1. `descuentoGasApp/forms.py` - Validación de teléfono y campo región
2. `descuentoGasApp/templates/components/navbar.html` - Menú hamburguesa
3. `descuentoGasApp/templates/base.html` - Inclusión de `responsive.css`
4. `descuentoGasApp/templates/solicitudes/ingresar_solicitud.html` - Nuevos campos
5. `descuentoGasApp/management/commands/crear_grupos.py` - Fix comillas

### 🎉 Archivos Creados
1. `descuentoGasApp/regiones_comunas.py` - Base de datos de regiones/comunas
2. `descuentoGasApp/static/css/responsive.css` - Estilos responsive
3. `descuentoGasApp/static/js/region_comuna.js` - Lógica de autocompletado
4. `CHANGELOG.md` - Este archivo

---

## [1.0.0] - 2025-11-19

### ➕ Agregado Inicialmente
- Sistema completo de autenticación (login/logout)
- Control de acceso por roles (Administrador, Vendedor, Usuario Anónimo)
- Gestión completa de solicitudes (CRUD)
- Gestión de usuarios (crear, editar, eliminar)
- Diseño minimalista moderno
- Estados normalizados con choices
- Expiración automática mediante MySQL EVENT
- 18 templates organizados por funcionalidad
- Documentación completa (DOCS.md + README.md)

---

## Próximas Mejoras Planeadas

- [ ] Paginación en listados de solicitudes
- [ ] Exportación de datos a Excel/PDF
- [ ] Validación completa del dígito verificador de RUT chileno
- [ ] Sistema de notificaciones por email
- [ ] Dashboard con gráficos y estadísticas
- [ ] Tests automatizados (unit tests)
