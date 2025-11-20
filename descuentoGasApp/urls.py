from django.urls import path
from . import views

urlpatterns = [
    path('ingresar/', views.ingresar_solicitud, name='ingresar_solicitud'),
    path('administrar/', views.administrar_solicitudes, name='administrar_solicitudes'),
    path('administrar/cambiar_estado/<int:solicitud_id>/', views.cambiar_estado, name='cambiar_estado'),
    path('administrar/eliminar_duplicados/', views.eliminar_duplicados, name='eliminar_duplicados'),
    path('buscar/', views.buscar_solicitud, name='buscar_solicitud'),
    path('administrar/eliminar/<int:solicitud_id>/', views.eliminar_solicitud, name='eliminar_solicitud'),
    path('administrar/detalle/<int:solicitud_id>/', views.detalle_solicitud, name='detalle_solicitud'),
    path('administrar/cambiar_estado_page/<int:solicitud_id>/', views.cambiar_estado_page, name='cambiar_estado_page'),

]
