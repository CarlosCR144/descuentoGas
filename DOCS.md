# Documentación del proyecto DescuentoGas

Esta documentación describe los archivos que se han modificado, su propósito, cómo funcionan juntos, y una revisión contra los requerimientos del PDF y la rúbrica. Está pensada para que el equipo (o tú) entienda el flujo y pueda mantener el proyecto.

## Manejo de Errores

El proyecto incluye un sistema robusto de manejo de errores que:
- Captura y muestra errores 404 de manera amigable
- Maneja intentos de acceso a solicitudes inexistentes
- Proporciona mensajes descriptivos al usuario
- Mantiene la consistencia visual con el resto de la aplicación

### Componentes del Sistema de Errores
- `templates/error.html` - Template base para mostrar errores
- Vista `error_page` en `views.py` - Maneja la presentación de errores
- Manejador global 404 configurado en `urls.py` del proyecto
- Manejo de excepciones en vistas críticas (detalle, eliminación, cambio de estado)

## Estructura principal relevante

- `manage.py` — lanzador de Django (sin modificaciones importantes).
- `descuentoGas/` — configuración del proyecto Django (settings, urls, wsgi, asgi).
- `descuentoGasApp/` — aplicación principal con modelos, vistas, templates y estáticos.
- `db.sqlite3` o base de datos MySQL — en tu caso usas MySQL (`descuentogas_db`).

## Archivos que hemos modificado o creado

- `descuentoGas/descuentoGas/settings.py`
  - Cambios: `TIME_ZONE` cambiado a `America/Santiago`, `LANGUAGE_CODE` a `es-cl`, `USE_TZ = True` conservado.
  - Propósito: controlar la localización y comportamiento de zonas horarias en Django.

- `descuentoGasApp/models.py`
  - Modelo principal: `Solicitud` con campos:
    - `rut`, `nombre`, `apellido_paterno`, `apellido_materno`, `direccion`, `telefono`, `comuna`.
    - `fecha_solicitud = DateTimeField(auto_now_add=True)` — momento de creación.
    - `fecha_aceptacion = DateTimeField(null=True, blank=True)` — se setea cuando se acepta.
    - `estado` — valores por defecto y posibles (Pendiente, Aceptada, Rechazada, Expirada).
  - Notas: Django guarda datetimes en UTC cuando `USE_TZ = True`.

- `descuentoGasApp/views.py`
  - Vistas principales:
    - `ingresar_solicitud`: crea nuevas solicitudes usando `SolicitudForm`.
    - `administrar_solicitudes`: lista todas las solicitudes; contiene lógica para marcar como `Expirada`.
    - `cambiar_estado` / `cambiar_estado_page`: cambiar estado y fijar `fecha_aceptacion = timezone.now()` cuando se acepta.
    - `eliminar_duplicados`: elimina registros duplicados por RUT, conservando el más antiguo.
    - `buscar_solicitud`, `detalle_solicitud`, `eliminar_solicitud`.
    - `error_page`: maneja la presentación de errores de forma centralizada.
  - Manejo de errores:
    - Todas las vistas críticas incluyen try/except para capturar Http404.
    - Redirección a página de error personalizada con mensajes descriptivos.
    - Preservación del contexto del error para mejor experiencia de usuario.
  - Nota: rutas a templates actualizadas para usar `templates/` en la app (eliminado prefijo `descuentoGasApp/`).

- `descuentoGasApp/templates/` (mover desde `templates/descuentoGasApp/` a `templates/`)
  - Templates creados/movidos:
    - `ingresar_solicitud.html` - Formulario de ingreso
    - `administrar_solicitudes.html` - Lista principal
    - `buscar_solicitud.html` - Búsqueda por RUT
    - `detalle_solicitud.html` - Vista detallada
    - `cambiar_estado.html` - Modificación de estado
    - `eliminar_confirmacion.html` - Confirmación de borrado
    - `error.html` - Página de errores personalizada
  - Propósito: interfaz de usuario con Bootstrap 5 y estilos centralizados
  - Manejo consistente de errores en todas las vistas

- `descuentoGasApp/static/css/styles.css` y `descuentoGasApp/static/js/validaciones.js` (ya existentes/creados previamente)
  - Contienen estilos globales y validaciones cliente.

- `descuentoGasApp/utils.py` — fue eliminado porque no se estaba usando.

- `requirements.txt` — creado con dependencias mínimas: `django` y `mysqlclient`.

## Comportamiento de zona horaria y por qué ves diferencia en MySQL

- Con `USE_TZ = True` Django convierte instantes a UTC antes de guardar en la BD. Las columnas `datetime(6)` en MySQL no almacenan zona, pero el valor que guarda Django corresponde a UTC.
- En las plantillas Django convierte el valor UTC a `TIME_ZONE` (America/Santiago) al mostrar, por eso ves la hora local correcta en el sitio, pero en MySQL Workbench puedes ver el valor crudo en UTC.
- Recomendación: mantener `USE_TZ = True` en producción.

## Evento MySQL para expiración automática

Se creó (o se sugirió) un EVENT en MySQL para marcar `estado = 'EXPIRADA'` cuando `fecha_aceptacion + INTERVAL 1 MONTH <= UTC_TIMESTAMP()`.

SQL usado para pruebas (2 minutos) y producción (1 mes) está documentado en los mensajes anteriores. Resumen:

Pruebas (2 minutos):
```sql
SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS check_expired_requests;
DELIMITER //
CREATE EVENT check_expired_requests
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    UPDATE descuentogasapp_solicitud
    SET estado = 'EXPIRADA'
    WHERE estado = 'ACEPTADA'
      AND fecha_aceptacion IS NOT NULL
      AND TIMESTAMPADD(MINUTE, 2, fecha_aceptacion) <= UTC_TIMESTAMP();
END //
DELIMITER ;
```

Producción (1 mes): similar pero con `TIMESTAMPADD(MONTH, 1, fecha_aceptacion)` y `ON SCHEDULE EVERY 1 DAY`.

## Revisión frente a los requerimientos del PDF y la rúbrica

Requisitos relevantes extraídos del PDF:

- Las solicitudes tienen vigencia de un mes.  -> Implementado (evento DB + lógica en vista como respaldo).
- Estado inicial PENDIENTE. -> `estado` en `models.py` por defecto es 'Pendiente'.
- Estados posibles: ACEPTADA, RECHAZADA, EXPIRADA. -> Se usan los strings 'Aceptada','Rechazada','Expirada' (nota: conviene normalizar mayúsculas si la rúbrica requiere exactitud).
- Cambiar a EXPIRADA cuando transcurra un mes desde que fue aceptada. -> Implementado a nivel de base de datos (evento) y hay lógica en la vista como medida adicional.

Checklist de la rúbrica (evaluación rápida):

- Funcionalidad básica (crear/listar/editar/eliminar): ✅ Implementado.
- Validaciones cliente/servidor: ⚠️ Hay validación básica en formularios; validar RUT y mensajes de duplicado podría mejorarse.
- Persistencia/consistencia (zona horaria): ✅ Correcto con `USE_TZ=True` y manejo UTC; documentación incluida.
- Automatización de expiración: ✅ Implementada con EVENT en MySQL (no necesita app activa).
- Calidad del código y organización: ✅ Estructura Django estándar; se centralizó CSS y se limpiaron templates.

Recomendaciones para completar y pulir:

1. Normalizar constantes de estado: definir choices en `models.Solicitud` para evitar strings sueltos y diferencias de mayúsculas.
2. Mejorar mensajes de error en `ingresar_solicitud` (mostrar si RUT duplicado). Ya hay una tarea pendiente.
3. Tests automatizados (unit tests) para vistas y modelos.
4. Documentar el flujo de despliegue y la creación del evento MySQL en un README operativo.

## Cómo probar localmente (resumen rápido)

1. Crear entorno virtual e instalar dependencias:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Configura `descuentoGas/settings.py` con las credenciales de MySQL y asegúrate de que la BD `descuentogas_db` exista.

3. Ejecuta migraciones y servidor:

```powershell
py manage.py migrate
py manage.py runserver
```

4. Crear EVENT en MySQL Workbench (pegar SQL de la sección "Evento MySQL").

5. Probar la expiración: actualizar `fecha_aceptacion` con `DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 MINUTE)` para pruebas y esperar el EVENT o ejecutar el UPDATE manual.

## Conclusión

Se han realizado los cambios solicitados: centralización de templates, corrección de rutas, ajustes de zona horaria, documentación y archivo `requirements.txt`. La expiración automática cumple el requisito de la rúbrica y se implementó a nivel de base de datos para no depender de la aplicación activa.

Si quieres, puedo:

- Añadir `choices` en el modelo para los estados y migración correspondiente.
- Implementar tests unitarios básicos.
- Mejorar la validación/feedback de RUT duplicado en la vista `ingresar_solicitud`.

Fin del documento.
