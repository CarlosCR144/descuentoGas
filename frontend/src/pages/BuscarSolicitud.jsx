import React, { useState } from 'react';
import { solicitudesAPI } from '../services/api';
import '../styles/BuscarSolicitud.css';

const BuscarSolicitud = () => {
    const [rut, setRut] = useState('');
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const formatRut = (value) => {
        // Remover todo excepto números y K
        let cleaned = value.replace(/[^0-9kK]/g, '');
        
        // Formatear: 12345678-9
        if (cleaned.length > 1) {
            const body = cleaned.slice(0, -1);
            const dv = cleaned.slice(-1);
            return `${body}-${dv}`;
        }
        
        return cleaned;
    };

    const handleRutChange = (e) => {
        const formatted = formatRut(e.target.value);
        setRut(formatted);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rut.trim()) {
            setError('Por favor ingresa un RUT');
            return;
        }

        if (!rut.includes('-') || rut.length < 9) {
            setError('Formato de RUT inválido');
            return;
        }

        setLoading(true);
        setError('');
        setSolicitudes([]);
        setSearched(false);

        try {
            const response = await solicitudesAPI.buscarPorRut(rut);
            setSolicitudes(response.solicitudes || []);
            setSearched(true);
        } catch (err) {
            setError('Error al buscar solicitudes. Intenta nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadgeClass = (estado) => {
        const clases = {
            'Pendiente': 'badge-warning',
            'Aceptada': 'badge-success',
            'Rechazada': 'badge-danger',
            'Expirada': 'badge-secondary',
        };
        return clases[estado] || 'badge-secondary';
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="buscar-container">
            <div className="buscar-content">
                <div className="buscar-header">
                    <h1>Buscar Solicitud por RUT</h1>
                    <p>Consulta el estado de las solicitudes de descuento</p>
                </div>

                {/* Formulario de búsqueda */}
                <div className="search-card">
                    <form onSubmit={handleSubmit} className="search-form">
                        <div className="form-group">
                            <label htmlFor="rut">RUT del Solicitante</label>
                            <input
                                type="text"
                                id="rut"
                                value={rut}
                                onChange={handleRutChange}
                                placeholder="12345678-9"
                                maxLength="12"
                                disabled={loading}
                                autoFocus
                            />
                            <small>Formato: 12345678-9</small>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn-search"
                            disabled={loading}
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>
                </div>

                {/* Resultados */}
                {searched && !loading && (
                    <div className="results-section">
                        {solicitudes.length === 0 ? (
                            <div className="no-results">
                                <div className="no-results-icon">🔍</div>
                                <h3>No se encontraron solicitudes</h3>
                                <p>No hay solicitudes registradas con el RUT {rut}</p>
                            </div>
                        ) : (
                            <>
                                <div className="results-header">
                                    <h2>Resultados de la Búsqueda</h2>
                                    <span className="results-count">
                                        {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} encontrada{solicitudes.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="solicitudes-grid">
                                    {solicitudes.map((solicitud) => (
                                        <div key={solicitud.id} className="solicitud-card">
                                            <div className="solicitud-card-header">
                                                <div className="solicitud-info">
                                                    <h3 className="solicitud-nombre">
                                                        {solicitud.nombre} {solicitud.apellido_paterno} {solicitud.apellido_materno}
                                                    </h3>
                                                    <p className="solicitud-rut">RUT: {solicitud.rut}</p>
                                                </div>
                                                <span className={`badge ${getEstadoBadgeClass(solicitud.estado)}`}>
                                                    {solicitud.estado_display || solicitud.estado}
                                                </span>
                                            </div>

                                            <div className="solicitud-card-body">
                                                <div className="info-row">
                                                    <span className="info-label">Dirección:</span>
                                                    <span className="info-value">{solicitud.direccion}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="info-label">Comuna:</span>
                                                    <span className="info-value">{solicitud.comuna}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="info-label">Teléfono:</span>
                                                    <span className="info-value">{solicitud.telefono}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="info-label">Fecha de Solicitud:</span>
                                                    <span className="info-value">
                                                        {formatFecha(solicitud.fecha_solicitud)}
                                                    </span>
                                                </div>

                                                {solicitud.fecha_aceptacion && (
                                                    <div className="info-row">
                                                        <span className="info-label">Fecha de Aceptación:</span>
                                                        <span className="info-value">
                                                            {formatFecha(solicitud.fecha_aceptacion)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuscarSolicitud;
