import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

// ========================================
// PÁGINA DE INICIO
// ========================================
const Home = () => {
    const { isAuthenticated, user, isAdmin, isVendedor } = useAuth();

    return (
        <div className="home-container">
            <div className="home-hero">
                <h1>Bienvenido a DescuentoGas</h1>
                <p>Sistema de gestión de solicitudes de descuento en gas</p>
            </div>

            <div className="home-content">
                {/* Usuario no autenticado */}
                {!isAuthenticated && (
                    <div className="home-section">
                        <h2>¿Necesitas solicitar un descuento?</h2>
                        <p>
                            Completa el formulario de solicitud y te contactaremos a la brevedad.
                        </p>
                        <Link to="/solicitar" className="home-button">
                            Solicitar Descuento
                        </Link>
                    </div>
                )}

                {/* Usuario autenticado */}
                {isAuthenticated && (
                    <div className="home-section">
                        <h2>Hola, {user?.first_name || 'Usuario'}!</h2>
                        
                        {/* Vendedor */}
                        {isVendedor() && (
                            <div className="home-card">
                                <h3>Panel de Vendedor</h3>
                                <p>Busca y consulta solicitudes de descuento por RUT.</p>
                                <Link to="/vendedor/buscar" className="home-button">
                                    Buscar Solicitudes
                                </Link>
                            </div>
                        )}

                        {/* Administrador */}
                        {isAdmin() && (
                            <>
                                <div className="home-card">
                                    <h3>Gestión de Solicitudes</h3>
                                    <p>Administra todas las solicitudes del sistema.</p>
                                    <Link to="/admin/solicitudes" className="home-button">
                                        Ver Solicitudes
                                    </Link>
                                </div>

                                <div className="home-card">
                                    <h3>Gestión de Usuarios</h3>
                                    <p>Administra vendedores y otros administradores.</p>
                                    <Link to="/admin/usuarios" className="home-button">
                                        Ver Usuarios
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
