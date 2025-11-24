import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, isVendedor, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Cerrar menú al cambiar de tamaño la ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cerrar menú al hacer click fuera (en móvil)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && window.innerWidth <= 768) {
                const navbar = document.querySelector('.navbar-menu');
                const toggle = document.querySelector('.navbar-toggle');
                
                if (navbar && toggle && 
                    !navbar.contains(event.target) && 
                    !toggle.contains(event.target)) {
                    setIsMenuOpen(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    DescuentoGas
                </Link>

                {/* Botón hamburguesa */}
                <button 
                    className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Menú de navegación */}
                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link" onClick={closeMenu}>
                            Inicio
                        </Link>
                    </li>

                    <li className="navbar-item">
                        <Link to="/solicitar" className="navbar-link" onClick={closeMenu}>
                            Ingresar Solicitud
                        </Link>
                    </li>

                    {isAuthenticated && (
                        <>
                            {isVendedor() && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/vendedor/dashboard" className="navbar-link" onClick={closeMenu}>
                                            Dashboard Vendedor
                                        </Link>
                                    </li>
                                    <li className="navbar-item">
                                        <Link to="/vendedor/buscar" className="navbar-link" onClick={closeMenu}>
                                            Buscar Solicitud
                                        </Link>
                                    </li>
                                </>
                            )}

                            {isAdmin() && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/admin/solicitudes" className="navbar-link" onClick={closeMenu}>
                                            Administrar Solicitudes
                                        </Link>
                                    </li>
                                    <li className="navbar-item">
                                        <Link to="/admin/usuarios" className="navbar-link" onClick={closeMenu}>
                                            Gestión de Usuarios
                                        </Link>
                                    </li>
                                </>
                            )}

                            <li className="navbar-item">
                                <Link to="/perfil" className="navbar-link" onClick={closeMenu}>
                                    Mi Perfil
                                </Link>
                            </li>

                            <li className="navbar-item">
                                <button onClick={handleLogout} className="navbar-link navbar-button">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    )}

                    {!isAuthenticated && (
                        <li className="navbar-item">
                            <Link to="/login" className="navbar-link navbar-link-highlight" onClick={closeMenu}>
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
