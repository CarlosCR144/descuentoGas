from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.utils import timezone
from .models import Solicitud
from .serializers import (
    SolicitudSerializer, 
    UserSerializer, 
    CrearUsuarioSerializer,
    CambiarPasswordSerializer
)


# ========================================
# FUNCIONES AUXILIARES
# ========================================
def es_administrador(user):
    """Verifica si el usuario es administrador"""
    return user.groups.filter(name='Administrador').exists()

def es_vendedor(user):
    """Verifica si el usuario es vendedor"""
    return user.groups.filter(name='Vendedor').exists()


# ========================================
# VIEWSET PARA SOLICITUDES
# ========================================
class SolicitudViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de Solicitudes.
    
    Endpoints generados automáticamente:
    - GET    /api/solicitudes/          -> Listar todas
    - POST   /api/solicitudes/          -> Crear nueva
    - GET    /api/solicitudes/{id}/     -> Detalle de una
    - PUT    /api/solicitudes/{id}/     -> Actualizar completa
    - PATCH  /api/solicitudes/{id}/     -> Actualizar parcial
    - DELETE /api/solicitudes/{id}/     -> Eliminar
    """
    
    queryset = Solicitud.objects.all().order_by('-fecha_solicitud')
    serializer_class = SolicitudSerializer
    
    def get_permissions(self):
        """
        Permisos personalizados según la acción:
        - create: Público (cualquiera puede crear solicitud)
        - resto: Requiere autenticación
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """
        Crear nueva solicitud con manejo de duplicados.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(
                {
                    'message': 'Solicitud creada exitosamente',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {'error': 'Ya existe una solicitud con ese RUT'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def buscar_por_rut(self, request):
        """
        Endpoint personalizado para buscar solicitudes por RUT.
        URL: /api/solicitudes/buscar_por_rut/?rut=12345678-9
        """
        rut = request.query_params.get('rut', None)
        
        if not rut:
            return Response(
                {'error': 'Debe proporcionar un RUT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        solicitudes = self.queryset.filter(rut=rut)
        serializer = self.get_serializer(solicitudes, many=True)
        
        return Response({
            'count': solicitudes.count(),
            'solicitudes': serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        """
        Endpoint para cambiar el estado de una solicitud.
        URL: PATCH /api/solicitudes/{id}/cambiar_estado/
        Body: {"estado": "Aceptada"}
        
        Solo administradores pueden cambiar estado.
        """
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para cambiar el estado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        solicitud = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        # Validar que el estado sea válido
        estados_validos = dict(Solicitud.ESTADOS).keys()
        if nuevo_estado not in estados_validos:
            return Response(
                {
                    'error': 'Estado inválido',
                    'estados_validos': list(estados_validos)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar estado
        solicitud.estado = nuevo_estado
        
        # Si se acepta, guardar fecha de aceptación
        if nuevo_estado == "Aceptada":
            solicitud.fecha_aceptacion = timezone.now()
        else:
            solicitud.fecha_aceptacion = None
        
        solicitud.save(update_fields=['estado', 'fecha_aceptacion'])
        
        serializer = self.get_serializer(solicitud)
        return Response({
            'message': f'Estado cambiado a {nuevo_estado}',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['delete'])
    def eliminar_duplicados(self, request):
        """
        Endpoint para eliminar solicitudes duplicadas.
        URL: DELETE /api/solicitudes/eliminar_duplicados/
        
        Solo administradores pueden ejecutar esto.
        """
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para eliminar duplicados'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Count
        
        duplicados = Solicitud.objects.values('rut').annotate(
            cantidad=Count('id')
        ).filter(cantidad__gt=1)
        
        total_eliminados = 0
        
        for item in duplicados:
            rut = item['rut']
            solicitudes = Solicitud.objects.filter(rut=rut).order_by('fecha_solicitud')
            primera = solicitudes.first()
            if primera:
                dobles = solicitudes.exclude(pk=primera.pk)
                count = dobles.count()
                dobles.delete()
                total_eliminados += count
        
        return Response({
            'message': f'Se eliminaron {total_eliminados} solicitudes duplicadas',
            'total_eliminados': total_eliminados
        })


# ========================================
# VIEWSET PARA USUARIOS
# ========================================
class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de Usuarios.
    Solo administradores pueden acceder.
    """
    
    queryset = User.objects.filter(
        groups__name__in=['Administrador', 'Vendedor']
    ).distinct().order_by('first_name')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Solo administradores pueden gestionar usuarios"""
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        """Listar usuarios - solo administradores"""
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para listar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Crear nuevo usuario - solo administradores.
        Usa CrearUsuarioSerializer que maneja contraseñas.
        """
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para crear usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CrearUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            {
                'message': 'Usuario creado exitosamente',
                'data': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar usuario - solo administradores.
        No puede eliminarse a sí mismo.
        """
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para eliminar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        usuario = self.get_object()
        
        # Evitar que el admin se elimine a sí mismo
        if usuario.id == request.user.id:
            return Response(
                {'error': 'No puedes eliminar tu propia cuenta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = usuario.email
        usuario.delete()
        
        return Response({
            'message': f'Usuario {email} eliminado correctamente'
        })
    
    @action(detail=True, methods=['post'])
    def cambiar_password(self, request, pk=None):
        """
        Endpoint para cambiar contraseña de un usuario.
        URL: POST /api/usuarios/{id}/cambiar_password/
        Body: {"nueva_password": "...", "confirmar_password": "..."}
        """
        if not es_administrador(request.user):
            return Response(
                {'error': 'No tienes permisos para cambiar contraseñas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        usuario = self.get_object()
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nueva_password = serializer.validated_data['nueva_password']
        usuario.set_password(nueva_password)
        usuario.save()
        
        return Response({
            'message': f'Contraseña de {usuario.email} actualizada correctamente'
        })


# ========================================
# ENDPOINT PARA OBTENER USUARIO ACTUAL
# ========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuario_actual(request):
    """
    Endpoint para obtener información del usuario autenticado.
    URL: GET /api/auth/me/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
