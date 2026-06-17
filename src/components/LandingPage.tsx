import React, { useState, useEffect } from 'react';
import { useAppState } from './AppContext';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  CheckCircle, 
  Check, 
  BarChart3, 
  Award, 
  Layers, 
  Smartphone, 
  Clock, 
  Eye, 
  UserPlus, 
  ShieldAlert 
} from 'lucide-react';

export const LandingPage: React.FC<{ onOpenLogin: (role: 'citizen' | 'officer' | 'admin') => void }> = ({ onOpenLogin }) => {
  const { setActiveView, login } = useAppState();
  const [stats, setStats] = useState({
    total: 350,
    pending: 142,
    resolved: 208,
    citizens: 1240
  });

  useEffect(() => {
    // Dynamic fetch stats for landing page cards
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          if (data.summary) {
            setStats({
              total: data.summary.total,
              pending: data.summary.pending,
              resolved: data.summary.resolved,
              citizens: data.summary.citizensCount || 3
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-16 py-6 pb-20 text-left">
      
      {/* HERO SECTION - Beautifully Centered Layout */}
      <section id="hero-segment" className="relative flex flex-col items-center justify-center text-center bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900 text-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 lg:p-24 overflow-hidden shadow-xl shadow-purple-900/15">
        
        {/* Glow ambient lights */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-1/3 bottom-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

        {/* Text Area */}
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 p-2 py-1 border border-white/15 rounded-full text-xs font-mono tracking-widest text-pink-300">
            <Sparkles className="h-4 w-4 text-pink-300 animate-spin" />
            <span>AI GROUNDED CITIZEN BRIDGE</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-7xl font-black font-sans leading-none tracking-tight">
              Namma Voice <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-200 to-purple-200">
                நம்ம குரல்
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-black font-sans text-pink-300 tracking-wide">
              "Your Voice. Directly to Action."
            </p>
          </div>

          <p className="text-sm sm:text-base text-purple-100 max-w-2xl font-sans leading-relaxed text-center">
            Tamil Nadu's premier citizen-government platform. Report civic issues locally—garbage dumps, broken streets, power spark—and watch them classified by AI-powered routing engines straight to accountable regional officers. Verify closure personally with SMS-PIN secure authorization.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenLogin('citizen')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-md transform hover:-translate-y-0.5 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Raise Complaint</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveView('transparency')}
              className="px-8 py-4 border border-white/20 hover:bg-white/15 bg-white/5 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              View Transparency Report Board
            </button>
          </div>
        </div>
      </section>

      {/* STATISTICS CARDS */}
      <section id="stats-segment" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-purple-50 hover:border-purple-200 rounded-3xl p-6 shadow-sm transition-all text-left">
          <span className="text-[10px] sm:text-xs text-purple-400 font-extrabold uppercase font-mono">Total Reports filed</span>
          <p className="text-2xl sm:text-4xl font-sans font-black text-purple-950 mt-2">{stats.total}</p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Live GPS GPRS</span>
          </div>
        </div>

        <div className="bg-white border border-purple-50 hover:border-purple-200 rounded-3xl p-6 shadow-sm transition-all text-left">
          <span className="text-[10px] sm:text-xs text-purple-400 font-extrabold uppercase font-mono">Pending Incidents</span>
          <p className="text-2xl sm:text-4xl font-sans font-black text-pink-600 mt-2">{stats.pending}</p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-md">Field In Progress</span>
          </div>
        </div>

        <div className="bg-white border border-purple-50 hover:border-purple-200 rounded-3xl p-6 shadow-sm transition-all text-left">
          <span className="text-[10px] sm:text-xs text-purple-400 font-extrabold uppercase font-mono">Resolution Verified</span>
          <p className="text-2xl sm:text-4xl font-sans font-black text-emerald-700 mt-2">{stats.resolved}</p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">Citizen PIN Confirmed</span>
          </div>
        </div>

        <div className="bg-white border border-purple-50 hover:border-purple-200 rounded-3xl p-6 shadow-sm transition-all text-left">
          <span className="text-[10px] sm:text-xs text-purple-400 font-extrabold uppercase font-mono">Active Citizens Served</span>
          <p className="text-2xl sm:text-4xl font-sans font-black text-purple-800 mt-2">{stats.citizens}</p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Verified Profiles</span>
          </div>
        </div>

      </section>

      {/* CORE FEATURE CARDS */}
      <section id="features-segment" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-sm font-extrabold tracking-widest text-pink-600 uppercase font-sans">Empowering Communities</h2>
          <h3 className="text-3xl font-black font-sans text-purple-950 tracking-tight">Features Driving Open Accountability</h3>
          <p className="text-xs sm:text-sm text-purple-650 font-sans">
            Designed for transparent governance using smartphone proximity and structured department response chains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white hover:bg-purple-50/10 border border-purple-50 hover:border-purple-200 p-5 rounded-2xl transition-all shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-950 flex items-center justify-center font-bold text-lg mb-4">
              📝
            </div>
            <h4 className="font-sans font-black text-purple-950 text-sm">Report Issues</h4>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              Log potholes, trash piles, broken lights with photos, mock voice narration clips, and auto GPS coordinates.
            </p>
          </div>

          <div className="bg-white hover:bg-purple-50/10 border border-purple-50 hover:border-purple-200 p-5 rounded-2xl transition-all shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 text-pink-700 flex items-center justify-center font-bold text-lg mb-4">
              🎯
            </div>
            <h4 className="font-sans font-black text-purple-950 text-sm">Automated Dispatch</h4>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              Intelligent server routing categorizes complaints and delivers requests to correct field department in seconds.
            </p>
          </div>

          <div className="bg-white hover:bg-purple-50/10 border border-purple-50 hover:border-purple-200 p-5 rounded-2xl transition-all shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
              🔐
            </div>
            <h4 className="font-sans font-black text-purple-950 text-sm">Simulated PIN Secure</h4>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              No complaint status shifts to "Resolved" until the citizen enters verification PIN received on SMS simulator.
            </p>
          </div>

          <div className="bg-white hover:bg-purple-50/10 border border-purple-50 hover:border-purple-100 p-5 rounded-2xl transition-all shadow-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4">
              📢
            </div>
            <h4 className="font-sans font-black text-purple-950 text-sm">Public Registry</h4>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              All complaints, assignee officers, log milestones, and before/after photos published open with no login.
            </p>
          </div>

          <div className="bg-white hover:bg-purple-50/10 border border-purple-50 hover:border-purple-200 p-5 rounded-2xl transition-all shadow-xs text-left col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg mb-4">
              🏆
            </div>
            <h4 className="font-sans font-black text-purple-950 text-sm">Performance Index</h4>
            <p className="text-xs text-purple-600 mt-2 leading-relaxed">
              Drives department efficiency with live leaderboard ranks, monthly awards, and open response speed metrics.
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED MISSION STRATEGY */}
      <section id="mission-strategy-segment" className="bg-purple-50/30 border border-purple-100 rounded-[2rem] p-6 sm:p-10 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-[10px] font-extrabold tracking-widest text-pink-600 uppercase">CIVIC CHARTER BRIDGE</span>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-950 font-sans tracking-tight">Our Mission: Transforming Accountability Into Habit</h3>
          <p className="text-xs sm:text-sm text-purple-700 font-sans leading-relaxed">
            In modern society, complaints too often dissolve into red tape and ignored archives. Namma Voice creates absolute administrative transparency. Every resident has the power to see who is responsible, when the task is scheduled, and has the sole authority to approve the completed fix using verification PIN protocols.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-3 text-xs sm:text-sm font-sans font-bold text-purple-950">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 bg-white rounded-full border border-purple-200 flex items-center justify-center text-[10px] text-pink-500 font-bold">✓</span>
              <span>100% Public Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 bg-white rounded-full border border-purple-200 flex items-center justify-center text-[10px] text-pink-500 font-bold">✓</span>
              <span>AI Routing Engines</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 bg-white rounded-full border border-purple-200 flex items-center justify-center text-[10px] text-pink-500 font-bold">✓</span>
              <span>Regional Authorities Assigned</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 bg-white rounded-full border border-purple-200 flex items-center justify-center text-[10px] text-pink-500 font-bold">✓</span>
              <span>Earn Citizen Badges</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 bg-white border border-purple-150 rounded-2xl space-y-3.5 shadow-sm">
          <h4 className="font-black text-purple-950 font-sans text-sm pb-1.5 border-b border-purple-100 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-pink-500" />
            <span>Demonstration Checklist</span>
          </h4>
          <ul className="text-xs text-purple-600 space-y-2.5 font-sans leading-relaxed">
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span><strong>Easy Walkthrough</strong>: Click "Citizen login" → quick auto fill as mock citizen and report a potholes or sewage issue.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span><strong>Smart AI Assignment</strong>: The issue gets automatically categorized and routed based on details.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span><strong>Field Resolution</strong>: Log in as corresponding pre-assigned department officer (e.g. Highways dept WAT-CHE-01) and change status to 'Verification Pending'.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span><strong>Secure Closure</strong>: Check the topbar SMS Simulator notification for PIN, log back as citizen, and input code to mark <strong>Resolved</strong>!</span>
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
};
