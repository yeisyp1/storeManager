  import axios from 'axios';

  export const API_URL = 'http://localhost:3000/api'; 
  export const api = axios.create({
    baseURL: API_URL,
  });

  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/login') &&
        !originalRequest.url.includes('/auth/refresh')
      ) {
        originalRequest._retry = true;

        try {
          const { data } = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          sessionStorage.setItem('token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error refrescando token:', refreshError);
          sessionStorage.clear();

          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  export const loginUser = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    return data; 
  };

  export const logoutUser = async () => {
    await api.post('/auth/logout'); 
  };

  

  // PRODUCTOS
  export const getProductos = async () => {
    const { data } = await api.get('/productos');
    return data;
  };

  export const buscarProductoPorId = async (id) => {
  const { data } = await api.get(`/caja/productos/codigo/${id}`);
  return data;
};

  export const createProducto = async (productoData) => {
    const { data } = await api.post('/productos', productoData);
    return data;
  };

  export const updateProducto = async (id, productoData) => {
    const { data } = await api.put(`/productos/${id}`, productoData);
    return data;
  };

  export const deleteProducto = async (id) => {
    await api.delete(`/productos/${id}`);
  };

  // VENTAS
  export const getVentas = async () => {
    const { data } = await api.get('/caja/ventas');
    return data;
  };

  export const createVenta = async (ventaData) => {
    const { data } = await api.post('/caja/ventas', ventaData);
    return data;
  };

  // REPORTES
  export const getVentasDiarias = async (fecha = null) => {
    const params = fecha ? { fecha } : {};
    const { data } = await api.get('/reportes/ventas-diarias', { params });
    return data;
  };

  export const exportarPDF = async (fecha = null) => {
    const params = fecha ? { fecha } : {};
    const response = await api.get('/reportes/exportar-pdf', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  };

// USUARIOS
export const getUsuarios = async () => {
  const { data } = await api.get('/usuarios');
  return data;
};

export const getUsuarioPorId = async (id) => {
  const { data } = await api.get(`/usuarios/${id}`);
  return data;
};

export const createUsuario = async (usuarioData) => {
  const { data } = await api.post('/usuarios', usuarioData);
  return data;
};

export const updateUsuario = async (id, usuarioData) => {
  const { data } = await api.put(`/usuarios/${id}`, usuarioData);
  return data;
};

export const deleteUsuario = async (id) => {
  await api.delete(`/usuarios/${id}`);
};
