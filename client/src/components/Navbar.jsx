import React from 'react';
import { Wrench, MapPin, Calendar, ShieldCheck, Navigation, User, LogOut, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({
  currentLocation,
  onOpenLocationModal,
  user,
  onOpenAuthModal,
  onOpenAddGarageModal,
  onLogout
}) {
  const location = useLocation();

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                AUTOFIX
              </span>
              <span className="text-[10px] block font-medium tracking-widest uppercase text-blue-400 -mt-1">
                Vehicle Service Discovery
              </span>
            </div>
          </Link>

          {/* High-Precision GPS Bar */}
          <button
            onClick={onOpenLocationModal}
            className="hidden md:flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 px-3.5 py-1.5 rounded-full text-xs text-slate-200 transition-all shadow-md group"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold max-w-[200px] truncate">
              {currentLocation?.name || 'Koramangala, Bengaluru'}
            </span>
            <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/40">
              Change GPS
            </span>
          </button>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' ? 'text-blue-400 bg-blue-950/60' : 'text-slate-300 hover:text-white'
              }`}
            >
              Discover Garages
            </Link>

            <Link
              to="/tracker"
              className={`px-3 py-2 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 ${
                location.pathname === '/tracker' ? 'text-blue-400 bg-blue-950/60' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> My Bookings
            </Link>

            {/* Dealer Partner / Add Garage Button */}
            {user?.role === 'vendor' ? (
              <button
                onClick={onOpenAddGarageModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Garage</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddGarageModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dealer Partner</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 font-bold max-w-[90px] truncate">{user.name}</span>
                <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-800 uppercase">
                  {user.role}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-red-400 ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
