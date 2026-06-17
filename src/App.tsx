import { useState } from 'react';
import { AppProvider, useAppState } from './components/AppContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { TransparencyBoard } from './components/TransparencyBoard';
import { LeaderboardView } from './components/LeaderboardView';
import { SdgImpact } from './components/SdgImpact';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { Shield, Sparkles, AlertCircle, Landmark } from 'lucide-react';

function AppContent() {
  const { activeView, setActiveView, currentRole } = useAppState();
  const [loginRole, setLoginRole] = useState<'citizen' | 'officer' | 'admin' | null>(null);

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-16">
            <LandingPage onOpenLogin={setLoginRole} />
            <SdgImpact />
          </div>
        );
      case 'transparency':
        return <TransparencyBoard />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'sdg':
        return <SdgImpact />;
      case 'dashboard':
        if (!currentRole) {
          return (
            <div id="unauthorized-dashboard-fallback" className="py-20 text-center max-w-md mx-auto space-y-4">
              <AlertCircle className="h-12 w-12 text-pink-500 mx-auto" />
              <h3 className="text-xl font-bold text-purple-950 font-sans">Access Denied</h3>
              <p className="text-sm text-purple-600">Please sign in to access your secure workspace dashboard.</p>
              <div className="pt-2 flex justify-center space-x-2">
                <button
                  onClick={() => setLoginRole('citizen')}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold font-sans cursor-pointer"
                >
                  Citizen login
                </button>
                <button
                  onClick={() => setLoginRole('officer')}
                  className="px-4 py-2 border border-purple-200 hover:bg-purple-50 text-purple-900 rounded-xl text-xs font-bold font-sans cursor-pointer"
                >
                  Officer login
                </button>
              </div>
            </div>
          );
        }
        if (currentRole === 'citizen') return <CitizenDashboard />;
        if (currentRole === 'officer') return <OfficerDashboard />;
        if (currentRole === 'admin') return <AdminDashboard />;
        return null;
      default:
        return <LandingPage onOpenLogin={setLoginRole} />;
    }
  };

  return (
    <div id="namma-voice-app" className="min-h-screen bg-[#faf7fa] flex flex-col font-sans selection:bg-pink-150 selection:text-purple-900">
      
      {/* Dynamic Header */}
      <Header onOpenLogin={setLoginRole} />

      {/* Main Content Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderActiveView()}
      </main>

      {/* Modal Dialog for Login/Register */}
      {loginRole && (
        <LoginModal 
          initialRole={loginRole} 
          onClose={() => setLoginRole(null)} 
        />
      )}

      {/* FOOTER */}
      <footer id="app-footer" className="bg-white border-t border-purple-100 py-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center text-white text-xs font-bold">
                TN
              </div>
              <span className="text-lg font-black text-purple-950 font-sans">Namma Voice / நம்ம குரல்</span>
            </div>
            <p className="text-xs text-purple-500 leading-relaxed font-sans">
              "Your Voice. Directly to Action." <br />
              Namma Voice is a citizen-government accountability bridge enabling Tamil Nadu citizens to file, audit, trace, and close localized civic complaints transparently.
            </p>
          </div>

          <div className="md:col-span-4 space-y-1 text-xs text-purple-500 font-sans">
            <p className="font-bold text-purple-950 uppercase text-[10px] tracking-widest">Digital Infrastructure</p>
            <p>State Data Center, IT & Digital Services Dept.</p>
            <p>Government of Tamil Nadu, Chennai - 600009</p>
            <p className="text-[10px] text-pink-600 font-mono font-bold">RELEASE VERSION: June 2026 Stable</p>
          </div>

          <div className="md:col-span-3 text-left md:text-right text-xs text-purple-400 space-y-2">
            <div className="flex items-center space-x-2 justify-start md:justify-end">
              <span className="bg-emerald-500 w-2 h-2 rounded-full inline-block animate-pulse" />
              <span className="text-[10px] tracking-wide text-emerald-800 font-bold uppercase font-mono">Central Registry Live</span>
            </div>
            <p className="font-sans">Developed in alignment with UN SDG Goals 11, 16 and 9.</p>
          </div>
        </div>

        {/* Small Attribution Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-4 border-t border-purple-50/80 flex flex-col sm:flex-row justify-between items-center text-[10px] text-purple-400">
          <p>© 2026 Namma Voice. Government of Tamil Nadu.</p>
          <p className="text-right mt-1 sm:mt-0 font-sans">
            created by <span className="text-purple-900 font-extrabold uppercase tracking-widest text-[11px]">DIVYAKRITI PRABHU UMA, ECE, SSN COLLEGE OF ENGINEERING</span>
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
export { App };
