import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-4 items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3 text-white hover:text-blue-100 transition-colors duration-200"
            >
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">STORE MANAGER</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
              <div className="bg-white bg-opacity-20 p-1.5 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-sm">
                  {user?.nombre || user?.username}
                </p>
                <p className="text-blue-100 text-xs">
                  {user?.rol}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;