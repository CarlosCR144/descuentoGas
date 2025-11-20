from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from descuentoGasApp.models import Solicitud

class Command(BaseCommand):
    help = 'Crea grupos Administrador y Vendedor con permisos, y usuario admin inicial'

    def handle(self, *args, **options):
        # Crear grupo Administrador
        admin_group, created = Group.objects.get_or_create(name='Administrador')
        if created:
            self.stdout.write(self.style.SUCCESS('Grupo Administrador creado'))
            
            # Permisos sobre Solicitud
            content_type_solicitud = ContentType.objects.get_for_model(Solicitud)
            permisos_solicitud = Permission.objects.filter(content_type=content_type_solicitud)
            admin_group.permissions.set(permisos_solicitud)
            
            # Permisos sobre User
            content_type_user = ContentType.objects.get_for_model(User)
            permisos_user = Permission.objects.filter(content_type=content_type_user)
            admin_group.permissions.add(*permisos_user)
            
            self.stdout.write(self.style.SUCCESS('Permisos asignados a Administrador'))
        else:
            self.stdout.write(self.style.WARNING('Grupo Administrador ya existe'))

        # Crear grupo Vendedor
        vendedor_group, created = Group.objects.get_or_create(name='Vendedor')
        if created:
            self.stdout.write(self.style.SUCCESS('Grupo Vendedor creado'))
            
            # Solo permiso de ver Solicitud
            content_type_solicitud = ContentType.objects.get_for_model(Solicitud)
            permiso_view = Permission.objects.get(
                codename='view_solicitud',
                content_type=content_type_solicitud
            )
            vendedor_group.permissions.add(permiso_view)
            
            self.stdout.write(self.style.SUCCESS('Permisos asignados a Vendedor'))
        else:
            self.stdout.write(self.style.WARNING('Grupo Vendedor ya existe'))

        # Crear usuario administrador inicial
        email_admin = 'admin@descuentogas.cl'
        if not User.objects.filter(username=email_admin).exists():
            admin_user = User.objects.create_user(
                username=email_admin,
                email=email_admin,
                first_name='Administrador',
                last_name='Sistema',
                password='admin123'
            )
            admin_user.groups.add(admin_group)
            admin_user.is_staff = True
            admin_user.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Usuario administrador creado: {email_admin} / admin123'
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f'Usuario {email_admin} ya existe'
            ))

        self.stdout.write(self.style.SUCCESS('\n=== Configuración completada ==="))
        self.stdout.write('Grupos creados: Administrador, Vendedor')
        self.stdout.write(f'Usuario admin: {email_admin} / admin123')
