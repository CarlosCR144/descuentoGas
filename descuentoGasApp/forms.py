from django import forms
from .models import Solicitud
import re


class SolicitudForm(forms.ModelForm):
    class Meta:
        model = Solicitud
        fields = ['rut', 'nombre', 'apellido_paterno', 'apellido_materno', 'direccion', 'telefono', 'comuna']
        widgets = {
            'rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12.345.678-5'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido_paterno': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido_materno': forms.TextInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
            'comuna': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def clean_rut(self):
        rut = self.cleaned_data.get('rut', '')
        if rut:
            rut_clean = rut.replace(' ', '')
            if len(rut_clean) < 7 or len(rut_clean) > 12:
                raise forms.ValidationError('RUT debe tener entre 7 y 12 caracteres (incluyendo guión y dígito verificador).')
            if not re.match(r'^[0-9\.\-kK]+$', rut_clean):
                raise forms.ValidationError('Formato de RUT inválido. Use solo números, puntos, guión y K.')
            return rut_clean
        return rut


class BuscarSolicitudForm(forms.Form):
    rut = forms.CharField(max_length=12, label="RUT", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12.345.678-5'}))
