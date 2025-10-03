import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md px-4"> 
      <div className="bg-white border border-gray-300 px-10 py-8 mb-3">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-8" style={{ fontFamily: 'cursive' }}>
            STORE MANAGER
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <input
              id="username"
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              className="w-full px-3 py-3 text-sm border border-gray-300 rounded-sm bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full px-3 py-3 text-sm border border-gray-300 rounded-sm bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-base hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200 mt-4"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center mt-3">
              {error}
            </div>
          )}
        </form>
      </div>

      
    </div>
  </div>
);
};

export default Login;