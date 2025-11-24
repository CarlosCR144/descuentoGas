import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
    const { isAuthenticated, user, isAdmin, isVendedor } = useAuth();

    return (
        <div className="home-container">
            <div className="home-content">
                <div className="home-hero">
                    <h1>Bienvenido a DescuentoGas</h1>
                    <p>
                        Sistema de gestión de solicitudes de descuento en cilindros de gas 
                        licuado para la Agrupación de Municipalidades de Chile
                    </p>
                    
                    <div className="home-hero-buttons">
                        <Link to="/solicitar" className="home-button btn-lg">
                            Ingresar Solicitud
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/login" className="home-button btn-outline btn-lg">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>

                <div className="home-grid">
                    <div className="home-card">
                        <h3>Para Ciudadanos</h3>
                        <p>
                            Ingresa tu solicitud de descuento de forma rápida y sencilla. 
                            Solo necesitas tu RUT y datos personales.
                        </p>
                    </div>
                    
                    <div className="home-card">
                        <h3>Para Vendedores</h3>
                        <p>
                            Consulta el estado de las solicitudes mediante el RUT del 
                            solicitante de manera rápida.
                        </p>
                    </div>
                    
                    <div className="home-card">
                        <h3>Para Administradores</h3>
                        <p>
                            Gestiona todas las solicitudes y usuarios del sistema con 
                            herramientas completas de administración.
                        </p>
                    </div>
                </div>

                {isAuthenticated && (
                    <div className="quick-access-card">
                        <div className="quick-access-header">
                            <h2>Acceso Rápido</h2>
                        </div>
                        <div className="quick-access-body">
                            <div className="button-group">
                                {isAdmin() && (
                                    <>
                                        <Link to="/admin/solicitudes" className="home-button">
                                            Ver Solicitudes
                                        </Link>
                                        <Link to="/admin/usuarios" className="home-button btn-secondary">
                                            Gestionar Usuarios
                                        </Link>
                                    </>
                                )}
                                
                                {isVendedor() && (
                                    <Link to="/vendedor/buscar" className="home-button">
                                        Buscar Solicitud
                                    </Link>
                                )}
                                
                                <Link to="/perfil" className="home-button btn-outline">
                                    Mi Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
