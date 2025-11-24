import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ========================================
// COMPONENTE PARA PROTEGER RUTAS
// ========================================
const ProtectedRoute = ({ children, requireAdmin = false, requireVendedor = false }) => {
    const { isAuthenticated, isAdmin, isVendedor } = useAuth();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si requiere ser admin y no lo es
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    // Si requiere ser vendedor y no lo es
    if (requireVendedor && !isVendedor()) {
        return <Navigate to="/" replace />;
    }

    // Si pasa todas las validaciones, mostrar el componente
    return children;
};

export default ProtectedRoute;
