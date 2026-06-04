import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
const navigate = useNavigate();
const location = useLocation();
const [menuOpen, setMenuOpen] = useState(false);
const user = JSON.parse(localStorage.getItem('ls_user') || '{}');

const handleLogout = () => {
localStorage.removeItem('ls_token');
localStorage.removeItem('ls_user');
navigate('/login');
};

return ( <nav className="fixed top-0 inset-x-0 z-50 glass"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div className="flex items-center justify-between h-16">

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
          LS
        </div>

        <span className="font-bold text-xl gradient-text hidden sm:block">
          LinkSphere
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">

        <Link
          to="/dashboard"
          className={`text-sm font-semibold transition-colors duration-200 ${
            location.pathname === '/dashboard'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          Dashboard
        </Link>

        <div className="h-5 w-px bg-slate-300" />

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
            <span className="text-blue-700 text-xs font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>

          <span className="text-slate-700 text-sm font-medium">
            {user?.name || 'User'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="w-5 h-0.5 bg-slate-700 mb-1"></div>
        <div className="w-5 h-0.5 bg-slate-700 mb-1"></div>
        <div className="w-5 h-0.5 bg-slate-700"></div>
      </button>
    </div>

    {/* Mobile Menu */}
    {menuOpen && (
      <div className="md:hidden pb-4 pt-2 border-t border-slate-200 space-y-1 bg-white">

        <Link
          to="/dashboard"
          className="block px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>

        <div className="px-3 py-2 text-sm text-slate-500">
          Signed in as {user?.email}
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </div>
    )}
  </div>
</nav>


);
}
