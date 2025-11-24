import axios from 'axios';

// ========================================
// CONFIGURACIÓN BASE DE AXIOS
// ========================================
const API = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ========================================
// INTERCEPTOR: Agregar token JWT automáticamente
// ========================================
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ========================================
// INTERCEPTOR: Manejar respuestas y errores
// ========================================
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401) y no hemos intentado renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(
                    'http://localhost:8000/api/auth/refresh/',
                    { refresh: refreshToken }
                );

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                // Reintentar la petición original con el nuevo token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Si falla el refresh, eliminar tokens y redirigir a login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ========================================
// SERVICIOS DE AUTENTICACIÓN
// ========================================
export const authAPI = {
    // Login
    login: async (credentials) => {
        const response = await API.post('auth/login/', credentials);
        return response.data;
    },

    // Obtener usuario actual
    getCurrentUser: async () => {
        const response = await API.get('auth/me/');
        return response.data;
    },

    // Logout (local)
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
};

// ========================================
// SERVICIOS DE SOLICITUDES
// ========================================
export const solicitudesAPI = {
    // Listar todas
    getAll: async () => {
        const response = await API.get('solicitudes/');
        return response.data;
    },

    // Crear nueva (público - sin token)
    create: async (data) => {
        const response = await axios.post(
            'http://localhost:8000/api/solicitudes/',
            data
        );
        return response.data;
    },

    // Obtener detalle
    getById: async (id) => {
        const response = await API.get(`solicitudes/${id}/`);
        return response.data;
    },

    // Buscar por RUT
    buscarPorRut: async (rut) => {
        const response = await API.get(`solicitudes/buscar_por_rut/?rut=${rut}`);
        return response.data;
    },

    // Cambiar estado
    cambiarEstado: async (id, estado) => {
        const response = await API.patch(`solicitudes/${id}/cambiar_estado/`, {
            estado,
        });
        return response.data;
    },

    // Eliminar
    delete: async (id) => {
        const response = await API.delete(`solicitudes/${id}/`);
        return response.data;
    },

    // Eliminar duplicados
    eliminarDuplicados: async () => {
        const response = await API.delete('solicitudes/eliminar_duplicados/');
        return response.data;
    },
};

// ========================================
// SERVICIOS DE USUARIOS
// ========================================
export const usuariosAPI = {
    // Listar todos
    getAll: async () => {
        const response = await API.get('usuarios/');
        return response.data;
    },

    // Crear nuevo
    create: async (data) => {
        const response = await API.post('usuarios/', data);
        return response.data;
    },

    // Obtener detalle
    getById: async (id) => {
        const response = await API.get(`usuarios/${id}/`);
        return response.data;
    },

    // Cambiar contraseña
    cambiarPassword: async (id, passwords) => {
        const response = await API.post(`usuarios/${id}/cambiar_password/`, passwords);
        return response.data;
    },

    // Eliminar
    delete: async (id) => {
        const response = await API.delete(`usuarios/${id}/`);
        return response.data;
    },
};

export default API;
