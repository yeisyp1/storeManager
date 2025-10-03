import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Caja from './pages/Caja.jsx';
import Productos from './pages/Productos.jsx';
import Reportes from './pages/Reportes.jsx';
import Usuarios from './pages/Usuarios.jsx';

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col"style={{ margin: 0, padding: 0, maxWidth: 'none' }}>
      {showNavbar && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caja"
            element={
              <ProtectedRoute>
                <Caja />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute roles={['Administrador']}>
                <Productos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute roles={['Administrador']}>
                <Reportes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute roles={['Administrador']}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;