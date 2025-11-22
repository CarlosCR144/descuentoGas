from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .api_views import SolicitudViewSet, UserViewSet, usuario_actual


# ========================================
# CONFIGURACIÓN DEL ROUTER
# ========================================
# El router genera automáticamente las URLs para los ViewSets
router = DefaultRouter()

# Registrar ViewSets
router.register(r'solicitudes', SolicitudViewSet, basename='solicitud')
router.register(r'usuarios', UserViewSet, basename='usuario')


# ========================================
# URLs DE LA API
# ========================================
urlpatterns = [
    # ----------------
    # Autenticación JWT
    # ----------------
    # POST /api/auth/login/
    # Body: {"username": "email@ejemplo.com", "password": "contraseña"}
    # Response: {"access": "token...", "refresh": "token..."}
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # POST /api/auth/refresh/
    # Body: {"refresh": "token..."}
    # Response: {"access": "nuevo_token..."}
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # GET /api/auth/me/
    # Headers: Authorization: Bearer <access_token>
    # Response: Información del usuario actual
    path('auth/me/', usuario_actual, name='usuario_actual'),
    
    # ----------------
    # Endpoints del Router
    # ----------------
    # Esto incluye todas las URLs generadas automáticamente:
    # 
    # SOLICITUDES:
    # GET    /api/solicitudes/                           -> Listar todas
    # POST   /api/solicitudes/                           -> Crear nueva
    # GET    /api/solicitudes/{id}/                      -> Detalle
    # PUT    /api/solicitudes/{id}/                      -> Actualizar completa
    # PATCH  /api/solicitudes/{id}/                      -> Actualizar parcial
    # DELETE /api/solicitudes/{id}/                      -> Eliminar
    # GET    /api/solicitudes/buscar_por_rut/?rut=...    -> Buscar por RUT
    # PATCH  /api/solicitudes/{id}/cambiar_estado/       -> Cambiar estado
    # DELETE /api/solicitudes/eliminar_duplicados/       -> Eliminar duplicados
    #
    # USUARIOS:
    # GET    /api/usuarios/                              -> Listar todos
    # POST   /api/usuarios/                              -> Crear nuevo
    # GET    /api/usuarios/{id}/                         -> Detalle
    # PUT    /api/usuarios/{id}/                         -> Actualizar completo
    # PATCH  /api/usuarios/{id}/                         -> Actualizar parcial
    # DELETE /api/usuarios/{id}/                         -> Eliminar
    # POST   /api/usuarios/{id}/cambiar_password/        -> Cambiar contraseña
    path('', include(router.urls)),
]
