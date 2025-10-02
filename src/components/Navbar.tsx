import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Home, UserCircle, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const location = useLocation();
  const currentUser = useStore((state) => state.currentUser);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-airbnb-red to-orange-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">Hack2024</span>
              <span className="text-xs text-gray-500 -mt-1">Airbnb Hackathon</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'text-airbnb-red bg-red-50'
                  : 'text-gray-600 hover:text-airbnb-red hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/teams"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/teams')
                  ? 'text-airbnb-red bg-red-50'
                  : 'text-gray-600 hover:text-airbnb-red hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </Link>

            {currentUser ? (
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'text-airbnb-red bg-red-50'
                    : 'text-gray-600 hover:text-airbnb-red hover:bg-gray-50'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary"
              >
                Join Hackathon
              </Link>
            )}
          </div>

          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.department}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-airbnb-red to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          )}

          <div className="md:hidden flex items-center space-x-2">
            {currentUser ? (
              <div className="w-8 h-8 bg-gradient-to-br from-airbnb-red to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser.name.charAt(0)}
              </div>
            ) : (
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Join
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;