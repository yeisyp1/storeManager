import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        if (parsedUser.id && !sessionStorage.getItem('userId')) {
        sessionStorage.setItem('userId', parsedUser.id);
      }
      } catch {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      const { token, user } = await loginUser(username, password);
      
      if (token && user) {
        setUser(user);
        setToken(token);
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);

        sessionStorage.setItem('userId', user.id);
        return { success: true };
      }
      return { success: false, error: 'Respuesta inválida del servidor' };
    } catch (error) {
      console.error("Error en login:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); 
    } catch (err) {
      console.warn("Error en logout backend:", err);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};