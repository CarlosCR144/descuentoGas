from django.urls import path
from . import views

urlpatterns = [
    # Página de inicio
    path('', views.index, name='index'),
    
    # Autenticación
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Solicitudes (público)
    path('ingresar/', views.ingresar_solicitud, name='ingresar_solicitud'),
    
    # Vendedor
    path('vendedor/dashboard/', views.dashboard_vendedor, name='dashboard_vendedor'),
    path('vendedor/buscar/', views.buscar_solicitud_vendedor, name='buscar_solicitud_vendedor'),
    
    # Administrador - Solicitudes
    path('administrador/solicitudes/', views.administrar_solicitudes, name='administrar_solicitudes'),
    path('administrador/solicitudes/detalle/<int:solicitud_id>/', views.detalle_solicitud, name='detalle_solicitud'),
    path('administrador/solicitudes/cambiar-estado/<int:solicitud_id>/', views.cambiar_estado_page, name='cambiar_estado_page'),
    path('administrador/solicitudes/cambiar-estado/<int:solicitud_id>/guardar/', views.cambiar_estado, name='cambiar_estado'),
    path('administrador/solicitudes/eliminar/<int:solicitud_id>/', views.eliminar_solicitud, name='eliminar_solicitud'),
    path('administrador/solicitudes/eliminar-duplicados/', views.eliminar_duplicados, name='eliminar_duplicados'),
    
    # Administrador - Usuarios
    path('administrador/usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('administrador/usuarios/crear/', views.crear_usuario, name='crear_usuario'),
    path('administrador/usuarios/detalle/<int:usuario_id>/', views.detalle_usuario, name='detalle_usuario'),
    path('administrador/usuarios/reestablecer/<int:usuario_id>/', views.reestablecer_password, name='reestablecer_password'),
    path('administrador/usuarios/eliminar/<int:usuario_id>/', views.eliminar_usuario, name='eliminar_usuario'),
    
    # Perfil (autenticados)
    path('perfil/', views.perfil_usuario, name='perfil_usuario'),
    path('perfil/cambiar-password/', views.cambiar_password_propia, name='cambiar_password_propia'),
]
