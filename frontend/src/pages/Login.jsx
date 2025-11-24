import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

// ========================================
// PÁGINA DE LOGIN
// ========================================
const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Si ya está autenticado, redirigir a home
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(''); // Limpiar error al escribir
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validación básica
        if (!formData.username || !formData.password) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        // Intentar login
        const result = await login(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Credenciales inválidas');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Iniciar Sesión</h1>
                <p className="login-subtitle">DescuentoGas</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input
                            type="email"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="login-footer">
                    Sistema de gestión de solicitudes de descuento en gas
                </p>
            </div>
        </div>
    );
};

export default Login;
