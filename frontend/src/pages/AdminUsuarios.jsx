import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import '../styles/AdminUsuarios.css';

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'crear', 'editar', 'cambiar-password', 'eliminar'
    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        grupo: 'Vendedor',
    });

    const [passwordData, setPasswordData] = useState({
        nueva_password: '',
        confirmar_password: '',
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await usuariosAPI.getAll();
            setUsuarios(response.results || response);
        } catch (err) {
            setError('Error al cargar los usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, usuario = null) => {
        setModalType(type);
        setSelectedUsuario(usuario);
        
        if (type === 'crear') {
            setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                password: '',
                password_confirm: '',
                grupo: 'Vendedor',
            });
        } else if (type === 'editar' && usuario) {
            setFormData({
                username: usuario.username,
                email: usuario.email,
                first_name: usuario.first_name,
                last_name: usuario.last_name,
                password: '',
                password_confirm: '',
                grupo: usuario.grupos[0] || 'Vendedor',
            });
        } else if (type === 'cambiar-password') {
            setPasswordData({
                nueva_password: '',
                confirmar_password: '',
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUsuario(null);
        setModalType('');
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            password: '',
            password_confirm: '',
            grupo: 'Vendedor',
        });
        setPasswordData({
            nueva_password: '',
            confirmar_password: '',
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCrearUsuario = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirm) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setActionLoading(true);
        try {
            await usuariosAPI.create(formData);
            await cargarUsuarios();
            closeModal();
        } catch (err) {
            const errorMsg = err.response?.data?.username?.[0] || 
                           err.response?.data?.email?.[0] ||
                           'Error al crear el usuario';
            alert(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCambiarPassword = async (e) => {
        e.preventDefault();

        if (passwordData.nueva_password !== passwordData.confirmar_password) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.nueva_password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setActionLoading(true);
        try {
            await usuariosAPI.cambiarPassword(selectedUsuario.id, passwordData);
            alert('Contraseña actualizada correctamente');
            closeModal();
        } catch (err) {
            alert('Error al cambiar la contraseña');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEliminarUsuario = async () => {
        if (!selectedUsuario) return;

        setActionLoading(true);
        try {
            await usuariosAPI.delete(selectedUsuario.id);
            await cargarUsuarios();
            closeModal();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error al eliminar el usuario';
            alert(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const getRolBadgeClass = (grupos) => {
        if (grupos.includes('Administrador')) return 'badge-primary';
        if (grupos.includes('Vendedor')) return 'badge-success';
        return 'badge-secondary';
    };

    const getRolLabel = (grupos) => {
        if (grupos.includes('Administrador')) return 'Administrador';
        if (grupos.includes('Vendedor')) return 'Vendedor';
        return 'Sin Rol';
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(usuario => {
        const searchLower = searchTerm.toLowerCase();
        return searchTerm === '' ||
            usuario.username.toLowerCase().includes(searchLower) ||
            usuario.email.toLowerCase().includes(searchLower) ||
            usuario.first_name.toLowerCase().includes(searchLower) ||
            usuario.last_name.toLowerCase().includes(searchLower);
    });

    return (
        <div className="admin-usuarios-container">
            <div className="admin-usuarios-content">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1>Gestión de Usuarios</h1>
                        <p>Administra vendedores y otros administradores</p>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => openModal('crear')}
                    >
                        + Crear Usuario
                    </button>
                </div>

                {/* Búsqueda */}
                <div className="filters-card">
                    <div className="form-group">
                        <label htmlFor="search">Buscar Usuario</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar por nombre, email o usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-stats">
                        <span className="stat-badge">
                            Total: {usuariosFiltrados.length} de {usuarios.length}
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
                        <p>Cargando usuarios...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabla */}
                        {usuariosFiltrados.length === 0 ? (
                            <div className="no-results">
                                <div className="no-results-icon">👥</div>
                                <h3>No hay usuarios</h3>
                                <p>
                                    {searchTerm 
                                        ? 'No se encontraron usuarios con los filtros aplicados'
                                        : 'No hay usuarios registrados en el sistema'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Email / Usuario</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuariosFiltrados.map((usuario) => (
                                            <tr key={usuario.id}>
                                                <td data-label="Nombre">
                                                    {usuario.first_name} {usuario.last_name}
                                                </td>
                                                <td data-label="Email">
                                                    <div className="user-email-info">
                                                        <div>{usuario.email}</div>
                                                        <small>@{usuario.username}</small>
                                                    </div>
                                                </td>
                                                <td data-label="Rol">
                                                    <span className={`badge ${getRolBadgeClass(usuario.grupos)}`}>
                                                        {getRolLabel(usuario.grupos)}
                                                    </span>
                                                </td>
                                                <td data-label="Estado">
                                                    <span className={`badge ${usuario.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td data-label="Acciones">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon btn-primary"
                                                            onClick={() => openModal('cambiar-password', usuario)}
                                                            title="Cambiar contraseña"
                                                        >
                                                            🔑
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            onClick={() => openModal('eliminar', usuario)}
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
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    {modalType === 'crear' && 'Crear Nuevo Usuario'}
                                    {modalType === 'editar' && 'Editar Usuario'}
                                    {modalType === 'cambiar-password' && 'Cambiar Contraseña'}
                                    {modalType === 'eliminar' && 'Eliminar Usuario'}
                                </h2>
                                <button className="modal-close" onClick={closeModal}>×</button>
                            </div>

                            <div className="modal-body">
                                {/* Crear Usuario */}
                                {modalType === 'crear' && (
                                    <form onSubmit={handleCrearUsuario} className="usuario-form">
                                        <div className="form-group">
                                            <label htmlFor="email">Email *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="username">Nombre de Usuario *</label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="first_name">Nombre *</label>
                                                <input
                                                    type="text"
                                                    id="first_name"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="last_name">Apellido *</label>
                                                <input
                                                    type="text"
                                                    id="last_name"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="grupo">Rol *</label>
                                            <select
                                                id="grupo"
                                                name="grupo"
                                                value={formData.grupo}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Vendedor">Vendedor</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password">Contraseña *</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                minLength="8"
                                                required
                                            />
                                            <small>Mínimo 8 caracteres</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password_confirm">Confirmar Contraseña *</label>
                                            <input
                                                type="password"
                                                id="password_confirm"
                                                name="password_confirm"
                                                value={formData.password_confirm}
                                                onChange={handleInputChange}
                                                minLength="8"
                                                required
                                            />
                                        </div>

                                        <div className="modal-footer">
                                            <button 
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={closeModal}
                                                disabled={actionLoading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Creando...' : 'Crear Usuario'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Cambiar Contraseña */}
                                {modalType === 'cambiar-password' && selectedUsuario && (
                                    <form onSubmit={handleCambiarPassword} className="usuario-form">
                                        <div className="usuario-info-modal">
                                            <p><strong>Usuario:</strong> {selectedUsuario.username}</p>
                                            <p><strong>Email:</strong> {selectedUsuario.email}</p>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="nueva_password">Nueva Contraseña *</label>
                                            <input
                                                type="password"
                                                id="nueva_password"
                                                name="nueva_password"
                                                value={passwordData.nueva_password}
                                                onChange={handlePasswordChange}
                                                minLength="8"
                                                required
                                            />
                                            <small>Mínimo 8 caracteres</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirmar_password">Confirmar Contraseña *</label>
                                            <input
                                                type="password"
                                                id="confirmar_password"
                                                name="confirmar_password"
                                                value={passwordData.confirmar_password}
                                                onChange={handlePasswordChange}
                                                minLength="8"
                                                required
                                            />
                                        </div>

                                        <div className="modal-footer">
                                            <button 
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={closeModal}
                                                disabled={actionLoading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Eliminar Usuario */}
                                {modalType === 'eliminar' && selectedUsuario && (
                                    <>
                                        <div className="usuario-info-modal">
                                            <p><strong>Usuario:</strong> {selectedUsuario.username}</p>
                                            <p><strong>Email:</strong> {selectedUsuario.email}</p>
                                            <p>
                                                <strong>Nombre:</strong> {selectedUsuario.first_name} {selectedUsuario.last_name}
                                            </p>
                                        </div>

                                        <div className="alert alert-warning">
                                            ⚠️ ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.
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
                                                className="btn btn-danger"
                                                onClick={handleEliminarUsuario}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Eliminando...' : 'Eliminar Usuario'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsuarios;
