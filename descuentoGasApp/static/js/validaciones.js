function validarFormularioSolicitud(event) {
    let form = event.target;
    let isValid = true;
    clearErrors();

    const rut = form.querySelector('#id_rut').value.trim();
    if (!validarFormatoRut(rut)) {
        showError('id_rut', 'RUT inválido. Use formato: 12345678-9 o 12.345.678-9');
        isValid = false;
    }

    const nombre = form.querySelector('#id_nombre').value.trim();
    if (nombre.length < 2) {
        showError('id_nombre', 'Nombre debe tener al menos 2 caracteres');
        isValid = false;
    }

    const apellidoPaterno = form.querySelector('#id_apellido_paterno').value.trim();
    const apellidoMaterno = form.querySelector('#id_apellido_materno').value.trim();
    if (apellidoPaterno.length < 2) {
        showError('id_apellido_paterno', 'Apellido paterno debe tener al menos 2 caracteres');
        isValid = false;
    }
    if (apellidoMaterno.length < 2) {
        showError('id_apellido_materno', 'Apellido materno debe tener al menos 2 caracteres');
        isValid = false;
    }

    const direccion = form.querySelector('#id_direccion').value.trim();
    if (direccion.length < 5) {
        showError('id_direccion', 'Dirección debe tener al menos 5 caracteres');
        isValid = false;
    }

    const telefono = form.querySelector('#id_telefono').value.trim();
    if (!/^\d{8,9}$/.test(telefono)) {
        showError('id_telefono', 'Teléfono debe tener 8 o 9 dígitos');
        isValid = false;
    }

    const comuna = form.querySelector('#id_comuna').value.trim();
    if (comuna.length < 2) {
        showError('id_comuna', 'Comuna debe tener al menos 2 caracteres');
        isValid = false;
    }

    if (!isValid) {
        event.preventDefault();
    }
}

function validarFormatoRut(rut) {
    // Permite formato con o sin puntos: 12345678-9 o 12.345.678-9
    return /^[0-9\.]{1,10}\-[0-9kK]$/.test(rut);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    field.classList.add('is-invalid');
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}