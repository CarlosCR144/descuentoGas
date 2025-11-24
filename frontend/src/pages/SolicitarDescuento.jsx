import React, { useState } from 'react';
import { solicitudesAPI } from '../services/api';
import '../styles/SolicitarDescuento.css';

// ========================================
// PÁGINA PARA SOLICITAR DESCUENTO (PÚBLICO)
// ========================================
const SolicitarDescuento = () => {
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        direccion: '',
        telefono: '',
        comuna: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Regiones y comunas de Chile (simplificado)
    const comunas = [
        'Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'Las Condes',
        'Providencia', 'Ñuñoa', 'Valparaíso', 'Viña del Mar', 'Concepción',
        'Temuco', 'Antofagasta', 'La Serena', 'Iquique', 'Puerto Montt',
        // Agrega más comunas según necesites
    ].sort();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setError('');
    };

    const handleRutChange = (e) => {
        let value = e.target.value.replace(/[^0-9kK]/g, ''); // Solo números y K
        
        // Formatear RUT: 12345678-9
        if (value.length > 1) {
            const body = value.slice(0, -1);
            const dv = value.slice(-1);
            value = `${body}-${dv}`;
        }
        
        setFormData({
            ...formData,
            rut: value,
        });
        setError('');
    };

    const handleTelefonoChange = (e) => {
        let value = e.target.value.replace(/[^0-9+]/g, ''); // Solo números y +
        
        // Agregar +56 si no lo tiene
        if (value && !value.startsWith('+')) {
            value = '+56' + value;
        }
        
        setFormData({
            ...formData,
            telefono: value,
        });
        setError('');
    };

    const validateForm = () => {
        // Validar que todos los campos estén llenos
        for (const [key, value] of Object.entries(formData)) {
            if (!value.trim()) {
                setError('Por favor completa todos los campos');
                return false;
            }
        }

        // Validar formato RUT (simple)
        if (!formData.rut.includes('-') || formData.rut.length < 9) {
            setError('Formato de RUT inválido');
            return false;
        }

        // Validar teléfono
        if (formData.telefono.length < 11) {
            setError('Formato de teléfono inválido');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await solicitudesAPI.create(formData);
            setSuccess(true);
            
            // Limpiar formulario
            setFormData({
                rut: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                direccion: '',
                telefono: '',
                comuna: '',
            });

            // Scroll al mensaje de éxito
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.rut?.[0] ||
                               'Error al crear la solicitud. Intenta nuevamente.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="solicitud-container">
            <div className="solicitud-card">
                <h1 className="solicitud-title">Solicitar Descuento en Gas</h1>
                <p className="solicitud-subtitle">
                    Completa el formulario para solicitar tu descuento
                </p>

                {/* Mensaje de éxito */}
                {success && (
                    <div className="alert alert-success">
                        <strong>¡Solicitud enviada exitosamente!</strong>
                        <p>Te contactaremos pronto con la respuesta.</p>
                    </div>
                )}

                {/* Mensaje de error */}
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="solicitud-form">
                    {/* RUT */}
                    <div className="form-group">
                        <label htmlFor="rut">RUT *</label>
                        <input
                            type="text"
                            id="rut"
                            name="rut"
                            value={formData.rut}
                            onChange={handleRutChange}
                            placeholder="12345678-9"
                            maxLength="12"
                            required
                            disabled={loading}
                        />
                        <small>Formato: 12345678-9</small>
                    </div>

                    {/* Nombre */}
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre *</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Juan"
                            maxLength="100"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Apellido Paterno */}
                    <div className="form-group">
                        <label htmlFor="apellido_paterno">Apellido Paterno *</label>
                        <input
                            type="text"
                            id="apellido_paterno"
                            name="apellido_paterno"
                            value={formData.apellido_paterno}
                            onChange={handleChange}
                            placeholder="Pérez"
                            maxLength="100"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Apellido Materno */}
                    <div className="form-group">
                        <label htmlFor="apellido_materno">Apellido Materno *</label>
                        <input
                            type="text"
                            id="apellido_materno"
                            name="apellido_materno"
                            value={formData.apellido_materno}
                            onChange={handleChange}
                            placeholder="González"
                            maxLength="100"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Dirección */}
                    <div className="form-group">
                        <label htmlFor="direccion">Dirección *</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Calle Ejemplo 123, Depto 45"
                            maxLength="255"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Comuna */}
                    <div className="form-group">
                        <label htmlFor="comuna">Comuna *</label>
                        <select
                            id="comuna"
                            name="comuna"
                            value={formData.comuna}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Selecciona una comuna</option>
                            {comunas.map((comuna) => (
                                <option key={comuna} value={comuna}>
                                    {comuna}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teléfono */}
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono *</label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleTelefonoChange}
                            placeholder="+56912345678"
                            maxLength="20"
                            required
                            disabled={loading}
                        />
                        <small>Formato: +56912345678</small>
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        className="solicitud-button"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>

                    <p className="form-note">
                        * Todos los campos son obligatorios
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SolicitarDescuento;
