import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';

// ========================================
// COMPONENTE PRINCIPAL DE LA APP
// ========================================
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

                            {/* Rutas protegidas - por ahora placeholder */}
                            <Route
                                path="/solicitar"
                                element={
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <h2>Formulario de Solicitud</h2>
                                        <p>Esta página se implementará en el siguiente paso</p>
                                    </div>
                                }
                            />

                            <Route
                                path="/vendedor/buscar"
                                element={
                                    <ProtectedRoute requireVendedor>
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <h2>Buscar Solicitud - Vendedor</h2>
                                            <p>Esta página se implementará próximamente</p>
                                        </div>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/solicitudes"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <h2>Gestión de Solicitudes - Admin</h2>
                                            <p>Esta página se implementará próximamente</p>
                                        </div>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/usuarios"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <h2>Gestión de Usuarios - Admin</h2>
                                            <p>Esta página se implementará próximamente</p>
                                        </div>
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
