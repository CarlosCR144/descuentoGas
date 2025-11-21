from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Solicitud


# ========================================
# SERIALIZER PARA SOLICITUD
# ========================================
class SolicitudSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Solicitud.
    Convierte objetos Solicitud a JSON y viceversa.
    """
    
    # Campo adicional para mostrar el estado con formato legible
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Solicitud
        fields = [
            'id',
            'rut',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'direccion',
            'telefono',
            'comuna',
            'fecha_solicitud',
            'fecha_aceptacion',
            'estado',
            'estado_display',
        ]
        read_only_fields = ['id', 'fecha_solicitud', 'estado_display']
    
    def validate_rut(self, value):
        """
        Validación personalizada para el RUT.
        Verifica formato y que no exista duplicado al crear.
        """
        # Si estamos actualizando, permitir el mismo RUT
        if self.instance and self.instance.rut == value:
            return value
        
        # Verificar si ya existe una solicitud con este RUT
        if Solicitud.objects.filter(rut=value).exists():
            raise serializers.ValidationError("Ya existe una solicitud con este RUT.")
        
        return value


# ========================================
# SERIALIZER PARA GRUPOS (ROLES)
# ========================================
class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer para los grupos (roles) de usuario.
    """
    class Meta:
        model = Group
        fields = ['id', 'name']


# ========================================
# SERIALIZER PARA USUARIO
# ========================================
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo User de Django.
    Incluye información de los grupos (roles) del usuario.
    """
    
    # Relación con grupos - devuelve lista de nombres de grupos
    grupos = serializers.SerializerMethodField()
    
    # Campo adicional para saber si es administrador
    es_administrador = serializers.SerializerMethodField()
    
    # Campo adicional para saber si es vendedor
    es_vendedor = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'grupos',
            'es_administrador',
            'es_vendedor',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']
    
    def get_grupos(self, obj):
        """Obtiene los nombres de los grupos del usuario"""
        return [grupo.name for grupo in obj.groups.all()]
    
    def get_es_administrador(self, obj):
        """Verifica si el usuario es administrador"""
        return obj.groups.filter(name='Administrador').exists()
    
    def get_es_vendedor(self, obj):
        """Verifica si el usuario es vendedor"""
        return obj.groups.filter(name='Vendedor').exists()


# ========================================
# SERIALIZER PARA CREAR USUARIO
# ========================================
class CrearUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear nuevos usuarios.
    Incluye manejo de contraseña y asignación de grupos.
    """
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    grupo = serializers.CharField(write_only=True)  # 'Administrador' o 'Vendedor'
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password_confirm',
            'grupo',
        ]
    
    def validate(self, data):
        """Validación de contraseñas coincidentes"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return data
    
    def validate_grupo(self, value):
        """Validación del grupo"""
        if value not in ['Administrador', 'Vendedor']:
            raise serializers.ValidationError(
                "El grupo debe ser 'Administrador' o 'Vendedor'."
            )
        return value
    
    def create(self, validated_data):
        """Creación del usuario con contraseña encriptada y grupo asignado"""
        # Extraer datos que no son del modelo User
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        grupo_nombre = validated_data.pop('grupo')
        
        # Crear usuario con contraseña encriptada
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Asignar grupo
        try:
            grupo = Group.objects.get(name=grupo_nombre)
            user.groups.add(grupo)
        except Group.DoesNotExist:
            raise serializers.ValidationError({
                "grupo": f"El grupo '{grupo_nombre}' no existe."
            })
        
        return user


# ========================================
# SERIALIZER PARA CAMBIAR CONTRASEÑA
# ========================================
class CambiarPasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña de un usuario.
    """
    nueva_password = serializers.CharField(write_only=True, min_length=8)
    confirmar_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validación de contraseñas coincidentes"""
        if data['nueva_password'] != data['confirmar_password']:
            raise serializers.ValidationError({
                "nueva_password": "Las contraseñas no coinciden."
            })
        return data
