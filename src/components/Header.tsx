import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Shield, ArrowRight, User, Menu, X, Landmark, LogOut, Vote, Award, BookOpen, Layers } from 'lucide-react';

export const Header: React.FC<{ onOpenLogin: (role: 'citizen' | 'officer' | 'admin') => void }> = ({ onOpenLogin }) => {
  const { currentRole, currentUser, logout, activeView, setActiveView, smsNotification, setSmsNotification } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/80 backdrop-blur-md">
      {/* SMS Simulator top bar */}
      {smsNotification && (
        <div id="sms-simulator-bar" className="bg-gradient-to-r from-pink-600 to-purple-800 text-white px-4 py-2 text-sm text-center font-mono flex items-center justify-between shadow-inner animate-pulse">
          <div className="mx-auto flex items-center space-x-2">
            <span className="bg-white text-purple-900 text-xs px-2 py-0.5 rounded-full font-bold">SMS SIMULATOR</span>
            <span>{smsNotification}</span>
          </div>
          <button onClick={() => setSmsNotification(null)} className="text-white hover:text-pink-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Tamil branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('home')}>
            <div className="relative flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-200">
              <Landmark className="h-6 w-6" />
              <div className="absolute -bottom-1 -right-1 bg-pink-500 text-[9px] px-1 rounded-md text-white border border-white font-bold font-sans">TN</div>
            </div>
            <div>
              <div className="flex items-baseline space-x-1 sm:space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-950 font-sans">Namma Voice</span>
                <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md font-sans">நம்ம குரல்</span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-600 font-medium tracking-wide">Government Accountability Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'home'
                  ? 'text-purple-900 bg-purple-50 font-semibold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('transparency')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'transparency'
                  ? 'text-purple-900 bg-purple-50 font-semibold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              Public Complaints
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'leaderboard'
                  ? 'text-purple-900 bg-purple-50 font-semibold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveView('sdg')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'sdg'
                  ? 'text-purple-900 bg-purple-50 font-semibold'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              SDG Goals
            </button>

            {/* Auth area */}
            {currentUser ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-purple-100">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'border border-purple-200 text-purple-900 bg-purple-50/30 hover:bg-purple-50'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Dashboard ({currentRole === 'citizen' ? 'Citizen' : currentRole === 'officer' ? 'Officer' : 'Admin'})</span>
                </button>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-purple-950 max-w-[120px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-pink-600 font-mono font-bold">
                    {currentRole === 'citizen' ? `⭐ ${currentUser.reputationPoints || 0} pts` : currentUser.department || 'Super Admin'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-purple-100">
                <button
                  onClick={() => onOpenLogin('citizen')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer"
                >
                  Citizen Port
                </button>
                <button
                  onClick={() => onOpenLogin('officer')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 transition-all cursor-pointer"
                >
                  Officer login
                </button>
                <button
                  onClick={() => onOpenLogin('admin')}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-800 to-purple-900 hover:brightness-110 shadow-sm transition-all cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser && (
              <button
                onClick={() => setActiveView('dashboard')}
                className="p-2 rounded-lg bg-purple-50 text-purple-950 font-bold"
                title="Go to Dashboard"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-purple-950 hover:bg-purple-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => { setActiveView('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium ${
              activeView === 'home' ? 'bg-purple-50 text-purple-950 font-bold' : 'text-purple-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setActiveView('transparency'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium ${
              activeView === 'transparency' ? 'bg-purple-50 text-purple-950 font-bold' : 'text-purple-700'
            }`}
          >
            Public Complaints
          </button>
          <button
            onClick={() => { setActiveView('leaderboard'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium ${
              activeView === 'leaderboard' ? 'bg-purple-50 text-purple-950 font-bold' : 'text-purple-700'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => { setActiveView('sdg'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium ${
              activeView === 'sdg' ? 'bg-purple-50 text-purple-950 font-bold' : 'text-purple-700'
            }`}
          >
            SDG Goals
          </button>

          {currentUser ? (
            <div className="pt-4 border-t border-purple-100 space-y-3">
              <div className="px-4">
                <p className="text-xs text-purple-500">SIGNED IN AS</p>
                <p className="text-sm font-bold text-purple-950">{currentUser.name}</p>
                <p className="text-xs text-pink-600 font-mono">
                  {currentRole === 'citizen' ? `Reputation: ⭐ ${currentUser.reputationPoints || 0} pts` : currentUser.department || 'Super Admin'}
                </p>
              </div>
              <button
                onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-purple-950 text-white rounded-lg font-semibold block text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-rose-50 text-rose-700 rounded-lg font-semibold block text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-purple-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenLogin('citizen'); setMobileMenuOpen(false); }}
                className="text-center py-2 bg-purple-50 text-purple-950 text-xs font-bold rounded-lg"
              >
                Citizen Portal
              </button>
              <button
                onClick={() => { onOpenLogin('officer'); setMobileMenuOpen(false); }}
                className="text-center py-2 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg"
              >
                Officer login
              </button>
              <button
                onClick={() => { onOpenLogin('admin'); setMobileMenuOpen(false); }}
                className="col-span-2 text-center py-2 bg-gradient-to-r from-purple-800 to-purple-900 text-white text-xs font-bold rounded-lg"
              >
                Super Admin Panel
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
