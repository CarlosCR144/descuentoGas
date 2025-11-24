import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SolicitarDescuento from './pages/SolicitarDescuento';
import BuscarSolicitud from './pages/BuscarSolicitud';
import AdminSolicitudes from './pages/AdminSolicitudes';
import AdminUsuarios from './pages/AdminUsuarios';

import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/solicitar" element={<SolicitarDescuento />} />

                            {/* Rutas protegidas - Vendedor */}
                            <Route
                                path="/vendedor/buscar"
                                element={
                                    <ProtectedRoute requireVendedor>
                                        <BuscarSolicitud />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/vendedor/dashboard"
                                element={
                                    <ProtectedRoute requireVendedor>
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <h2>Dashboard Vendedor</h2>
                                            <p>Esta página se implementará próximamente</p>
                                        </div>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Rutas protegidas - Admin */}
                            <Route
                                path="/admin/solicitudes"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <AdminSolicitudes />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/usuarios"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <AdminUsuarios />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Ruta 404 */}
                            <Route
                                path="*"
                                element={
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <h2>404 - Página no encontrada</h2>
                                    </div>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
