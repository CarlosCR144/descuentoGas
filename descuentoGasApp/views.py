# Create your views here.
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Count
from django.db import IntegrityError
from django.http import Http404
from .models import Solicitud
from .forms import SolicitudForm, BuscarSolicitudForm, CrearUsuarioForm, ReestablecerPasswordForm
from django.utils import timezone

# ==========================================
# FUNCIONES AUXILIARES
# ==========================================

def es_administrador(user):
    """Verifica si el usuario pertenece al grupo Administrador"""
    return user.groups.filter(name='Administrador').exists()

def es_vendedor(user):
    """Verifica si el usuario pertenece al grupo Vendedor"""
    return user.groups.filter(name='Vendedor').exists()

def error_page(request, codigo_error="404", mensaje="Página no encontrada", detalle="Lo sentimos, no pudimos encontrar la página que buscas."):
    """Página de error centralizada"""
    return render(request, 'error.html', {
        'codigo_error': codigo_error,
        'mensaje': mensaje,
        'detalle': detalle
    })

# ==========================================
# VISTAS PÚBLICAS
# ==========================================

def index(request):
    """Página de inicio"""
    return render(request, 'index.html')

def ingresar_solicitud(request):
    """Permite a cualquier ciudadano ingresar una solicitud"""
    if request.method == 'POST':
        form = SolicitudForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Solicitud ingresada correctamente.')
                return redirect('ingresar_solicitud')
            except IntegrityError:
                messages.error(request, 'Ya existe una solicitud con ese RUT.')
    else:
        form = SolicitudForm()
    return render(request, 'solicitudes/ingresar_solicitud.html', {'form': form})

# ==========================================
# AUTENTICACIÓN
# ==========================================

def login_view(request):
    """Vista de inicio de sesión"""
    if request.user.is_authenticated:
        return redirect('index')
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f'Bienvenido, {user.first_name}!')
            
            # Redirigir según rol
            if es_administrador(user):
                return redirect('administrar_solicitudes')
            elif es_vendedor(user):
                return redirect('dashboard_vendedor')
            else:
                return redirect('index')
        else:
            messages.error(request, 'Credenciales inválidas. Por favor, inténtelo de nuevo.')
    
    return render(request, 'login/login.html')

def logout_view(request):
    """Cierra la sesión del usuario"""
    logout(request)
    messages.success(request, 'Sesión cerrada correctamente.')
    return redirect('index')

# ==========================================
# VENDEDOR
# ==========================================

@login_required
@user_passes_test(es_vendedor, login_url='/')
def dashboard_vendedor(request):
    """Dashboard principal del vendedor"""
    return render(request, 'vendedor/dashboard.html')

@login_required
@user_passes_test(es_vendedor, login_url='/')
def buscar_solicitud_vendedor(request):
    """Permite al vendedor buscar solicitudes por RUT"""
    solicitudes = []
    if request.method == 'POST':
        form = BuscarSolicitudForm(request.POST)
        if form.is_valid():
            rut = form.cleaned_data['rut']
            solicitudes = list(Solicitud.objects.filter(rut=rut))
            if not solicitudes:
                messages.info(request, f'No se encontraron solicitudes con el RUT {rut}')
    else:
        form = BuscarSolicitudForm()
    return render(request, 'vendedor/buscar_solicitud.html', {'form': form, 'solicitudes': solicitudes})

# ==========================================
# ADMINISTRADOR - SOLICITUDES
# ==========================================

@login_required
@user_passes_test(es_administrador, login_url='/')
def administrar_solicitudes(request):
    """Lista todas las solicitudes"""
    solicitudes = Solicitud.objects.all().order_by('-fecha_solicitud')
    return render(request, 'administrador/solicitudes/listar.html', {'solicitudes': solicitudes})

@login_required
@user_passes_test(es_administrador, login_url='/')
def detalle_solicitud(request, solicitud_id):
    """Muestra los detalles de una solicitud"""
    try:
        solicitud = get_object_or_404(Solicitud, id=solicitud_id)
        return render(request, 'administrador/solicitudes/detalle.html', {'solicitud': solicitud})
    except Http404:
        return error_page(
            request,
            mensaje="Solicitud no encontrada",
            detalle=f"La solicitud con ID {solicitud_id} no existe en el sistema."
        )

@login_required
@user_passes_test(es_administrador, login_url='/')
def cambiar_estado_page(request, solicitud_id):
    """Formulario para cambiar el estado de una solicitud"""
    solicitud = get_object_or_404(Solicitud, id=solicitud_id)
    return render(request, 'administrador/solicitudes/cambiar_estado.html', {'solicitud': solicitud})

@login_required
@user_passes_test(es_administrador, login_url='/')
def cambiar_estado(request, solicitud_id):
    """Procesa el cambio de estado de una solicitud"""
    solicitud = get_object_or_404(Solicitud, id=solicitud_id)
    if request.method == 'POST':
        nuevo_estado = request.POST.get('estado')
        if nuevo_estado in dict(Solicitud.ESTADOS).keys():
            solicitud.estado = nuevo_estado
            if nuevo_estado == "Aceptada":
                solicitud.fecha_aceptacion = timezone.now()
            else:
                solicitud.fecha_aceptacion = None
            solicitud.save(update_fields=["estado", "fecha_aceptacion"])
            messages.success(request, f'Estado cambiado a {nuevo_estado} correctamente.')
        else:
            messages.error(request, 'Estado inválido.')
    return redirect('administrar_solicitudes')

@login_required
@user_passes_test(es_administrador, login_url='/')
def eliminar_solicitud(request, solicitud_id):
    """Elimina una solicitud con confirmación"""
    try:
        solicitud = get_object_or_404(Solicitud, id=solicitud_id)
        if request.method == 'POST':
            solicitud.delete()
            messages.success(request, 'Solicitud eliminada correctamente.')
            return redirect('administrar_solicitudes')
        return render(request, 'administrador/solicitudes/eliminar_confirmacion.html', {'solicitud': solicitud})
    except Http404:
        return error_page(
            request,
            mensaje="Solicitud no encontrada",
            detalle=f"La solicitud con ID {solicitud_id} no existe en el sistema."
        )

@login_required
@user_passes_test(es_administrador, login_url='/')
def eliminar_duplicados(request):
    """Elimina solicitudes duplicadas por RUT, conservando la más antigua"""
    duplicados = Solicitud.objects.values('rut').annotate(cantidad=Count('id')).filter(cantidad__gt=1)
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
    
    if total_eliminados > 0:
        messages.success(request, f'Se eliminaron {total_eliminados} solicitudes duplicadas.')
    else:
        messages.info(request, 'No se encontraron solicitudes duplicadas.')
    
    return redirect('administrar_solicitudes')

# ==========================================
# ADMINISTRADOR - USUARIOS
# ==========================================

@login_required
@user_passes_test(es_administrador, login_url='/')
def listar_usuarios(request):
    """Lista todos los usuarios Administrador y Vendedor"""
    usuarios = User.objects.filter(groups__name__in=['Administrador', 'Vendedor']).distinct().order_by('first_name')
    return render(request, 'administrador/usuarios/listar.html', {'usuarios': usuarios})

@login_required
@user_passes_test(es_administrador, login_url='/')
def crear_usuario(request):
    """Crea un nuevo usuario Administrador o Vendedor"""
    if request.method == 'POST':
        form = CrearUsuarioForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'Usuario {user.email} creado correctamente.')
            return redirect('listar_usuarios')
    else:
        form = CrearUsuarioForm()
    return render(request, 'administrador/usuarios/crear.html', {'form': form})

@login_required
@user_passes_test(es_administrador, login_url='/')
def detalle_usuario(request, usuario_id):
    """Muestra los detalles de un usuario"""
    usuario = get_object_or_404(User, id=usuario_id)
    return render(request, 'administrador/usuarios/detalle.html', {'usuario': usuario})

@login_required
@user_passes_test(es_administrador, login_url='/')
def reestablecer_password(request, usuario_id):
    """Permite al administrador cambiar la contraseña de un usuario"""
    usuario = get_object_or_404(User, id=usuario_id)
    
    if request.method == 'POST':
        form = ReestablecerPasswordForm(request.POST)
        if form.is_valid():
            nueva_password = form.cleaned_data['nueva_password']
            usuario.set_password(nueva_password)
            usuario.save()
            messages.success(request, f'Contraseña de {usuario.email} actualizada correctamente.')
            return redirect('listar_usuarios')
    else:
        form = ReestablecerPasswordForm()
    
    return render(request, 'administrador/usuarios/reestablecer_password.html', {
        'form': form,
        'usuario': usuario
    })

@login_required
@user_passes_test(es_administrador, login_url='/')
def eliminar_usuario(request, usuario_id):
    """Elimina un usuario con confirmación"""
    usuario = get_object_or_404(User, id=usuario_id)
    
    # Evitar que el admin se elimine a sí mismo
    if usuario.id == request.user.id:
        messages.error(request, 'No puedes eliminar tu propia cuenta.')
        return redirect('listar_usuarios')
    
    if request.method == 'POST':
        email = usuario.email
        usuario.delete()
        messages.success(request, f'Usuario {email} eliminado correctamente.')
        return redirect('listar_usuarios')
    
    return render(request, 'administrador/usuarios/eliminar_confirmacion.html', {'usuario': usuario})

# ==========================================
# PERFIL DE USUARIO (TODOS LOS AUTENTICADOS)
# ==========================================

@login_required
def perfil_usuario(request):
    """Muestra el perfil del usuario autenticado"""
    return render(request, 'perfil/ver_perfil.html', {'usuario': request.user})

@login_required
def cambiar_password_propia(request):
    """Permite al usuario cambiar su propia contraseña"""
    if request.method == 'POST':
        form = ReestablecerPasswordForm(request.POST)
        if form.is_valid():
            nueva_password = form.cleaned_data['nueva_password']
            request.user.set_password(nueva_password)
            request.user.save()
            messages.success(request, 'Contraseña actualizada correctamente. Por favor, inicia sesión nuevamente.')
            logout(request)
            return redirect('login')
    else:
        form = ReestablecerPasswordForm()
    
    return render(request, 'perfil/cambiar_password.html', {'form': form})
