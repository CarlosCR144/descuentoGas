# Create your views here.
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Count
from django.http import Http404
from .models import Solicitud
from .forms import SolicitudForm, BuscarSolicitudForm
from django.utils import timezone

def error_page(request, codigo_error="404", mensaje="Página no encontrada", detalle="Lo sentimos, no pudimos encontrar la página que buscas."):
    return render(request, 'error.html', {
        'codigo_error': codigo_error,
        'mensaje': mensaje,
        'detalle': detalle
    })

def ingresar_solicitud(request):
    if request.method == 'POST':
        form = SolicitudForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request, 'ingresar_solicitud.html', {'form': SolicitudForm(), 'mensaje': 'Solicitud ingresada correctamente.'})
    else:
        form = SolicitudForm()
    return render(request, 'ingresar_solicitud.html', {'form': form})

# Administrar solicitudes
# def administrar_solicitudes(request):
#     solicitudes = Solicitud.objects.all()
#     return render(request, 'descuentoGasApp/administrar_solicitudes.html', {'solicitudes': solicitudes})



def administrar_solicitudes(request):
    return render(request, 'administrar_solicitudes.html', {'solicitudes': Solicitud.objects.all()})


def cambiar_estado(request, solicitud_id):
    solicitud = get_object_or_404(Solicitud, id=solicitud_id)
    if request.method == 'POST':
        nuevo_estado = request.POST.get('estado')
        if nuevo_estado:
            solicitud.estado = nuevo_estado
            if nuevo_estado == "Aceptada":
                solicitud.fecha_aceptacion = timezone.now()
            else:
                solicitud.fecha_aceptacion = None
            solicitud.save(update_fields=["estado", "fecha_aceptacion"])
    return redirect('administrar_solicitudes')


def eliminar_duplicados(request):
    duplicados = Solicitud.objects.values('rut').annotate(cantidad=Count('id')).filter(cantidad__gt=1)
    for item in duplicados:
        rut = item['rut']
        solicitudes = Solicitud.objects.filter(rut=rut).order_by('fecha_solicitud')
        primera = solicitudes.first()
        if primera:
            dobles = solicitudes.exclude(pk=primera.pk)
            dobles.delete()
    return redirect('administrar_solicitudes')


def buscar_solicitud(request):
    # Proveer un formulario para buscar por RUT y devolver una lista (vacía o con 1 elemento)
    solicitudes = []
    if request.method == 'POST':
        form = BuscarSolicitudForm(request.POST)
        if form.is_valid():
            rut = form.cleaned_data['rut']
            solicitudes = list(Solicitud.objects.filter(rut=rut))
    else:
        form = BuscarSolicitudForm()
    return render(request, 'buscar_solicitud.html', {'form': form, 'solicitudes': solicitudes})


def detalle_solicitud(request, solicitud_id):
    try:
        solicitud = get_object_or_404(Solicitud, id=solicitud_id)
        return render(request, 'detalle_solicitud.html', {'solicitud': solicitud})
    except Http404:
        return error_page(
            request,
            mensaje="Solicitud no encontrada",
            detalle=f"La solicitud con ID {solicitud_id} no existe en el sistema."
        )


def cambiar_estado_page(request, solicitud_id):
    solicitud = get_object_or_404(Solicitud, id=solicitud_id)
    return render(request, 'cambiar_estado.html', {'solicitud': solicitud})

def eliminar_solicitud(request, solicitud_id):
    try:
        solicitud = get_object_or_404(Solicitud, id=solicitud_id)
        if request.method == 'POST':
            solicitud.delete()
            return redirect('administrar_solicitudes')
        return render(request, 'eliminar_confirmacion.html', {'solicitud': solicitud})
    except Http404:
        return error_page(
            request,
            mensaje="Solicitud no encontrada",
            detalle=f"La solicitud con ID {solicitud_id} no existe en el sistema."
        )
