import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// ========================================
// CREAR CONTEXT
// ========================================
const AuthContext = createContext();

// ========================================
// HOOK PERSONALIZADO PARA USAR EL CONTEXT
// ========================================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

// ========================================
// PROVIDER DEL CONTEXT
// ========================================
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario al iniciar (si hay token)
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Error al cargar usuario:', error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Login
    const login = async (credentials) => {
        try {
            const data = await authAPI.login(credentials);
            
            // Guardar tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Obtener datos del usuario
            const userData = await authAPI.getCurrentUser();
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Error al iniciar sesión',
            };
        }
    };

    // Logout
    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    // Verificar si es administrador
    const isAdmin = () => {
        return user?.es_administrador || false;
    };

    // Verificar si es vendedor
    const isVendedor = () => {
        return user?.es_vendedor || false;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isVendedor,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
