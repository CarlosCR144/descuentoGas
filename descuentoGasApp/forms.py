from django import forms
from django.contrib.auth.models import User, Group
from django.contrib.auth.forms import PasswordChangeForm
from .models import Solicitud
from .regiones_comunas import get_all_regiones, get_comunas_by_region, REGIONES_COMUNAS
import re


class SolicitudForm(forms.ModelForm):
    # Campo adicional para región (no se guarda en BD)
    region = forms.ChoiceField(
        choices=[('', 'Seleccione una región')] + [(r, r) for r in get_all_regiones()],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_region'
        }),
        label='Región'
    )
    
    class Meta:
        model = Solicitud
        fields = ['rut', 'nombre', 'apellido_paterno', 'apellido_materno', 'direccion', 'telefono', 'comuna']
        widgets = {
            'rut': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': '12.345.678-5'
            }),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido_paterno': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido_materno': forms.TextInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '912345678 o +56912345678',
                'pattern': '^(\+?56)?9\d{8}$',
                'title': 'Formato: 9XXXXXXXX o +569XXXXXXXX'
            }),
            'comuna': forms.TextInput(attrs={
                'class': 'form-control',
                'id': 'id_comuna_input',
                'placeholder': 'Escriba para buscar...'
            }),
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
    
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono', '')
        if telefono:
            # Limpiar espacios y guiones
            telefono_clean = telefono.replace(' ', '').replace('-', '')
            
            # Validar formato chileno: 9XXXXXXXX o +569XXXXXXXX
            if not re.match(r'^(\+?56)?9\d{8}$', telefono_clean):
                raise forms.ValidationError(
                    'Número de teléfono inválido. Use formato: 9XXXXXXXX o +569XXXXXXXX'
                )
            
            # Normalizar al formato sin código de país para guardar
            if telefono_clean.startswith('+56'):
                telefono_clean = telefono_clean[3:]
            elif telefono_clean.startswith('56'):
                telefono_clean = telefono_clean[2:]
            
            return telefono_clean
        return telefono


class BuscarSolicitudForm(forms.Form):
    rut = forms.CharField(max_length=12, label="RUT", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '12.345.678-5'}))


class CrearUsuarioForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        label='Contraseña',
        min_length=6
    )
    confirmar_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        label='Confirmar Contraseña'
    )
    rol = forms.ModelChoiceField(
        queryset=Group.objects.filter(name__in=['Administrador', 'Vendedor']),
        label='Rol',
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="Seleccione un rol"
    )
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']
        labels = {
            'email': 'Correo Electrónico',
            'first_name': 'Nombre',
            'last_name': 'Apellidos',
        }
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
        }
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Ya existe un usuario con este correo electrónico.')
        return email
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirmar = cleaned_data.get('confirmar_password')
        
        if password and confirmar and password != confirmar:
            raise forms.ValidationError('Las contraseñas no coinciden.')
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = self.cleaned_data['email']
        user.set_password(self.cleaned_data['password'])
        
        if commit:
            user.save()
            rol = self.cleaned_data['rol']
            user.groups.add(rol)
        
        return user


class ReestablecerPasswordForm(forms.Form):
    nueva_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        label='Nueva Contraseña',
        min_length=6
    )
    confirmar_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        label='Confirmar Contraseña'
    )
    
    def clean(self):
        cleaned_data = super().clean()
        nueva = cleaned_data.get('nueva_password')
        confirmar = cleaned_data.get('confirmar_password')
        
        if nueva and confirmar and nueva != confirmar:
            raise forms.ValidationError('Las contraseñas no coinciden.')
        
        return cleaned_data
