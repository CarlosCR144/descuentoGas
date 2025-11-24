import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../services/api';
import '../styles/AdminSolicitudes.css';

const AdminSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'cambiar-estado' o 'eliminar'
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const estados = ['Pendiente', 'Aceptada', 'Rechazada', 'Expirada'];

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await solicitudesAPI.getAll();
            setSolicitudes(response.results || response);
        } catch (err) {
            setError('Error al cargar las solicitudes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async () => {
        if (!nuevoEstado || !selectedSolicitud) return;

        setActionLoading(true);
        try {
            await solicitudesAPI.cambiarEstado(selectedSolicitud.id, nuevoEstado);
            await cargarSolicitudes();
            setShowModal(false);
            setSelectedSolicitud(null);
            setNuevoEstado('');
        } catch (err) {
            alert('Error al cambiar el estado de la solicitud');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!selectedSolicitud) return;

        setActionLoading(true);
        try {
            await solicitudesAPI.delete(selectedSolicitud.id);
            await cargarSolicitudes();
            setShowModal(false);
            setSelectedSolicitud(null);
        } catch (err) {
            alert('Error al eliminar la solicitud');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEliminarDuplicados = async () => {
        if (!window.confirm('¿Estás seguro de eliminar todas las solicitudes duplicadas? Esta acción no se puede deshacer.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await solicitudesAPI.eliminarDuplicados();
            alert(response.message || `Se eliminaron ${response.total_eliminados} solicitudes duplicadas`);
            await cargarSolicitudes();
        } catch (err) {
            alert('Error al eliminar duplicados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (solicitud, type) => {
        setSelectedSolicitud(solicitud);
        setModalType(type);
        if (type === 'cambiar-estado') {
            setNuevoEstado(solicitud.estado);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSolicitud(null);
        setNuevoEstado('');
        setModalType('');
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

    // Filtrar solicitudes
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        const matchSearch = searchTerm === '' || 
            solicitud.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
            solicitud.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            solicitud.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            solicitud.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = filterEstado === '' || solicitud.estado === filterEstado;

        return matchSearch && matchEstado;
    });

    return (
        <div className="admin-solicitudes-container">
            <div className="admin-solicitudes-content">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1>Gestión de Solicitudes</h1>
                        <p>Administra todas las solicitudes del sistema</p>
                    </div>
                    <button 
                        className="btn btn-secondary"
                        onClick={handleEliminarDuplicados}
                        disabled={loading}
                    >
                        Eliminar Duplicados
                    </button>
                </div>

                {/* Filtros */}
                <div className="filters-card">
                    <div className="filters-grid">
                        <div className="form-group">
                            <label htmlFor="search">Buscar</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Buscar por RUT o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="filterEstado">Filtrar por Estado</label>
                            <select
                                id="filterEstado"
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                {estados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filters-stats">
                        <span className="stat-badge">
                            Total: {solicitudesFiltradas.length} de {solicitudes.length}
                        </span>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando solicitudes...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabla */}
                        {solicitudesFiltradas.length === 0 ? (
                            <div className="no-results">
                                <div className="no-results-icon">📋</div>
                                <h3>No hay solicitudes</h3>
                                <p>
                                    {searchTerm || filterEstado 
                                        ? 'No se encontraron solicitudes con los filtros aplicados'
                                        : 'No hay solicitudes registradas en el sistema'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>RUT</th>
                                            <th>Nombre Completo</th>
                                            <th>Comuna</th>
                                            <th>Teléfono</th>
                                            <th>Estado</th>
                                            <th>Fecha Solicitud</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudesFiltradas.map((solicitud) => (
                                            <tr key={solicitud.id}>
                                                <td data-label="RUT">{solicitud.rut}</td>
                                                <td data-label="Nombre">
                                                    {solicitud.nombre} {solicitud.apellido_paterno} {solicitud.apellido_materno}
                                                </td>
                                                <td data-label="Comuna">{solicitud.comuna}</td>
                                                <td data-label="Teléfono">{solicitud.telefono}</td>
                                                <td data-label="Estado">
                                                    <span className={`badge ${getEstadoBadgeClass(solicitud.estado)}`}>
                                                        {solicitud.estado_display || solicitud.estado}
                                                    </span>
                                                </td>
                                                <td data-label="Fecha">{formatFecha(solicitud.fecha_solicitud)}</td>
                                                <td data-label="Acciones">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon btn-primary"
                                                            onClick={() => openModal(solicitud, 'cambiar-estado')}
                                                            title="Cambiar estado"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            onClick={() => openModal(solicitud, 'eliminar')}
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Modal */}
                {showModal && selectedSolicitud && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {modalType === 'cambiar-estado' 
                                        ? 'Cambiar Estado de Solicitud' 
                                        : 'Eliminar Solicitud'}
                                </h2>
                                <button className="modal-close" onClick={closeModal}>×</button>
                            </div>

                            <div className="modal-body">
                                <div className="solicitud-info-modal">
                                    <p><strong>RUT:</strong> {selectedSolicitud.rut}</p>
                                    <p>
                                        <strong>Nombre:</strong> {selectedSolicitud.nombre} {' '}
                                        {selectedSolicitud.apellido_paterno} {selectedSolicitud.apellido_materno}
                                    </p>
                                    <p><strong>Estado Actual:</strong> {' '}
                                        <span className={`badge ${getEstadoBadgeClass(selectedSolicitud.estado)}`}>
                                            {selectedSolicitud.estado}
                                        </span>
                                    </p>
                                </div>

                                {modalType === 'cambiar-estado' ? (
                                    <div className="form-group">
                                        <label htmlFor="nuevoEstado">Nuevo Estado</label>
                                        <select
                                            id="nuevoEstado"
                                            value={nuevoEstado}
                                            onChange={(e) => setNuevoEstado(e.target.value)}
                                        >
                                            {estados.map(estado => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        ⚠️ ¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn btn-outline"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className={modalType === 'cambiar-estado' ? 'btn btn-primary' : 'btn btn-danger'}
                                    onClick={modalType === 'cambiar-estado' ? handleCambiarEstado : handleEliminar}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Procesando...' : 
                                        (modalType === 'cambiar-estado' ? 'Cambiar Estado' : 'Eliminar')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSolicitudes;
