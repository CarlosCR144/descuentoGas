import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

// ========================================
// COMPONENTE NAVBAR
// ========================================
const Navbar = () => {
    const { user, isAuthenticated, isAdmin, isVendedor, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    DescuentoGas
                </Link>

                <ul className="navbar-menu">
                    {/* Enlaces públicos */}
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link">
                            Inicio
                        </Link>
                    </li>

                    <li className="navbar-item">
                        <Link to="/solicitar" className="navbar-link">
                            Solicitar Descuento
                        </Link>
                    </li>

                    {/* Enlaces para usuarios autenticados */}
                    {isAuthenticated && (
                        <>
                            {/* Enlaces para Vendedor */}
                            {isVendedor() && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/vendedor/dashboard" className="navbar-link">
                                            Dashboard Vendedor
                                        </Link>
                                    </li>
                                    <li className="navbar-item">
                                        <Link to="/vendedor/buscar" className="navbar-link">
                                            Buscar Solicitud
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Enlaces para Administrador */}
                            {isAdmin() && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/admin/solicitudes" className="navbar-link">
                                            Gestionar Solicitudes
                                        </Link>
                                    </li>
                                    <li className="navbar-item">
                                        <Link to="/admin/usuarios" className="navbar-link">
                                            Gestionar Usuarios
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Perfil de usuario */}
                            <li className="navbar-item">
                                <Link to="/perfil" className="navbar-link">
                                    {user?.first_name || 'Perfil'}
                                </Link>
                            </li>

                            {/* Logout */}
                            <li className="navbar-item">
                                <button onClick={handleLogout} className="navbar-link navbar-button">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    )}

                    {/* Login para usuarios no autenticados */}
                    {!isAuthenticated && (
                        <li className="navbar-item">
                            <Link to="/login" className="navbar-link navbar-link-highlight">
                                Iniciar Sesión
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
