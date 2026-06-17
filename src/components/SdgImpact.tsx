import React from 'react';
import { Home, ShieldCheck, Cpu, ArrowUpRight, Check } from 'lucide-react';

export const SdgImpact: React.FC = () => {
  return (
    <section id="sdg-impact-section" className="py-12 bg-white rounded-3xl border border-purple-50 p-6 sm:p-10 shadow-sm">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-sm font-extrabold tracking-widest text-pink-600 uppercase">Global Alignment</h2>
        <h3 className="mt-2 text-3xl sm:text-4xl font-black text-purple-950 font-sans tracking-tight">SDG United Nations Impact</h3>
        <p className="mt-4 text-purple-600 max-w-xl mx-auto text-sm sm:text-base">
          Namma Voice operates at the intersection of modern citizen technology and the UN Sustainable Development Goals (SDG), striving to achieve civic inclusivity, peace, and institutional trust in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SDG 11 */}
        <div className="bg-gradient-to-b from-purple-50 to-white hover:from-purple-100/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 border border-purple-100 flex flex-col justify-between h-full shadow-inner-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-6">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-orange-600 tracking-wider uppercase">GOAL 11</span>
            <h4 className="mt-1 text-xl font-black text-purple-950 font-sans">Sustainable Cities</h4>
            <p className="mt-3 text-xs text-purple-700 leading-relaxed">
              Provides robust mechanism to handle garbage dumping, water leakages, sewage blockages, and non-functioning streetlights, directly fostering cleaner, safer, and highly adaptive micro-neighborhoods.
            </p>
          </div>
          <ul className="mt-6 space-y-2 border-t border-purple-100 pt-4 text-left">
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Reduced garbage backlogs by 40%</span>
            </li>
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Enhanced street safety with active lights</span>
            </li>
          </ul>
        </div>

        {/* SDG 16 */}
        <div className="bg-gradient-to-b from-purple-50 to-white hover:from-purple-100/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 border border-purple-100 flex flex-col justify-between h-full shadow-inner-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">GOAL 16</span>
            <h4 className="mt-1 text-xl font-black text-purple-950 font-sans">Strong Institutions</h4>
            <p className="mt-3 text-xs text-purple-700 leading-relaxed">
              Drives complete government transparency. Citizens know exactly which department and officer are working on their issues, cutting down corruption and building concrete civic digital accountability.
            </p>
          </div>
          <ul className="mt-6 space-y-2 border-t border-purple-100 pt-4 text-left">
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Public compliance leaderboard audits</span>
            </li>
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Closed loops via PIN SMS system</span>
            </li>
          </ul>
        </div>

        {/* SDG 9 */}
        <div className="bg-gradient-to-b from-purple-50 to-white hover:from-purple-100/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 border border-purple-100 flex flex-col justify-between h-full shadow-inner-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-pink-600 tracking-wider uppercase">GOAL 9</span>
            <h4 className="mt-1 text-xl font-black text-purple-950 font-sans">Innovation & Infra</h4>
            <p className="mt-3 text-xs text-purple-700 leading-relaxed">
              Integrates server-side Artificial Intelligence (Gemini GenAI) to automatically parse language, categorize tasks, route issues to local department offices, and map complaints dynamically.
            </p>
          </div>
          <ul className="mt-6 space-y-2 border-t border-purple-100 pt-4 text-left">
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Automated Gemini deep sorting</span>
            </li>
            <li className="flex items-start text-[11px] font-medium text-purple-600">
              <Check className="h-3.5 w-3.5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Pothole & road asset digital routing</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-tr from-purple-950 via-purple-900 to-pink-900 text-white flex flex-col sm:flex-row items-center justify-between text-left">
        <div className="mb-4 sm:mb-0 max-w-2xl">
          <p className="text-[11px] font-bold text-pink-300 tracking-wider uppercase font-mono">VISION TAMIL NADU 2030</p>
          <h4 className="text-xl font-bold font-sans">"Direct democracy powered by smart, uncorruptible technology."</h4>
          <p className="mt-1 text-xs text-purple-100 font-sans">Empowering 80+ Million Tamil Nadu citizens to build safe communities.</p>
        </div>
        <div className="flex-shrink-0 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-widest border border-white/20 transition-all">
          GOVT. REPORT REF: SDG-TN-2026
        </div>
      </div>
    </section>
  );
};
