import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Shield, Sparkles, X, Mail, Key, User, Phone, MapPin, CheckCircle, Smartphone } from 'lucide-react';

interface LoginModalProps {
  initialRole: 'citizen' | 'officer' | 'admin' | null;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ initialRole, onClose }) => {
  const { login } = useAppState();
  const [activeTab, setActiveTab] = useState<'citizen' | 'officer' | 'admin'>(initialRole || 'citizen');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  // Officer Fields
  const [officerId, setOfficerId] = useState('');
  const [officerPwd, setOfficerPwd] = useState('');

  // Admin Fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleCitizenLogin = async (e: React.FormEvent, isGoogleSimulation = false) => {
    e.preventDefault();
    setErrorMessage(null);
    
    let targetEmail = email;
    if (isGoogleSimulation) {
      targetEmail = "google.citizen@gmail.com";
    }

    if (!targetEmail) {
      setErrorMessage("Please enter email address");
      return;
    }

    try {
      const response = await fetch('/api/auth/citizen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        login('citizen', data.user);
        onClose();
      } else {
        setErrorMessage(data.error || "Login failed");
      }
    } catch (err) {
      setErrorMessage("Connection refused on login. Please try again.");
    }
  };

  const handleCitizenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !phone || !city || !district) {
      setErrorMessage("All registration fields are required");
      return;
    }

    try {
      const response = await fetch('/api/auth/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, city, district })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        login('citizen', data.user);
        onClose();
      } else {
        setErrorMessage(data.error || "Registration failed");
      }
    } catch (err) {
      setErrorMessage("Registration failed on server connectivity.");
    }
  };

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!officerId) {
      setErrorMessage("Please fill Officer ID");
      return;
    }

    try {
      const response = await fetch('/api/auth/officer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId, password: officerPwd })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        login('officer', data.user);
        onClose();
      } else {
        setErrorMessage(data.error || "Officer not declared");
      }
    } catch (err) {
      setErrorMessage("Offline connection failed");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        login('admin', data.user);
        onClose();
      } else {
        setErrorMessage(data.error || "Invalid Username/Password");
      }
    } catch (err) {
      setErrorMessage("Internal connection failed");
    }
  };

  // Quick select utilities for convenience
  const autofillOfficer = (id: string) => {
    setOfficerId(id);
    setOfficerPwd('password123');
    setErrorMessage(null);
  };

  const autofillAdmin = () => {
    setAdminUsername('admin');
    setAdminPassword('admin123');
    setErrorMessage(null);
  };

  const autofillCitizen = () => {
    setEmail('9e.divyakriti.pu.103@gmail.com');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white/95 rounded-3xl border border-purple-100 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-50 text-purple-950 cursor-pointer transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Framing Header */}
        <div className="text-center mb-6">
          <span className="font-extrabold text-[10px] tracking-widest text-pink-600 uppercase">ACCESS SECURE PORTAL</span>
          <h2 className="text-2xl font-black text-purple-950 font-sans tracking-tight">Connect to Namma Voice</h2>
          <p className="text-xs text-purple-600 mt-1 font-sans">Choose your workspace to get started</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-purple-50 p-1.5 rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab('citizen'); setErrorMessage(null); setIsRegistering(false); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'citizen' ? 'bg-purple-900 text-white shadow-sm' : 'text-purple-600 hover:text-purple-900'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => { setActiveTab('officer'); setErrorMessage(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'officer' ? 'bg-purple-900 text-white shadow-sm' : 'text-purple-600 hover:text-purple-900'
            }`}
          >
            Officer
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setErrorMessage(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'admin' ? 'bg-purple-900 text-white shadow-sm' : 'text-purple-600 hover:text-purple-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Errors section */}
        {errorMessage && (
          <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
            {errorMessage}
          </div>
        )}

        {/* Content area based on tab */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {/* TAB 1: CITIZEN */}
          {activeTab === 'citizen' && (
            <div>
              {isRegistering ? (
                /* REGISTRATION */
                <form onSubmit={handleCitizenRegister} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                      <input
                        type="text"
                        placeholder="Divyakriti Pur"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="divyakriti@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 94445 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">City/Town</label>
                      <input
                        type="text"
                        placeholder="Chennai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none text-purple-900 font-medium"
                      >
                        <option value="">Select Tamil Nadu District</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Coimbatore">Coimbatore</option>
                        <option value="Madurai">Madurai</option>
                        <option value="Trichy">Trichy</option>
                        <option value="Salem">Salem</option>
                        <option value="Tirunelveli">Tirunelveli</option>
                        <option value="Vellore">Vellore</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-800 to-pink-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md cursor-pointer pt-3 transition-all"
                  >
                    Complete Registration
                  </button>

                  <p className="text-center text-[11px] text-purple-500 pt-1">
                    Already registered?{' '}
                    <button type="button" onClick={() => setIsRegistering(false)} className="text-pink-600 font-extrabold hover:underline">
                      Sign In here
                    </button>
                  </p>
                </form>
              ) : (
                /* LOGIN */
                <div className="space-y-4">
                  <form onSubmit={(e) => handleCitizenLogin(e)} className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Enter Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                        <input
                          type="email"
                          placeholder="divyakriti@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Enter Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-800 to-pink-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md cursor-pointer transition-all"
                    >
                      Verify email & login
                    </button>
                  </form>

                  {/* Google Login section */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-100"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2.5 text-purple-400">Or connected partner</span></div>
                  </div>

                  <button
                    onClick={(e) => handleCitizenLogin(e, true)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 border border-purple-200 hover:bg-purple-50/50 text-purple-850 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 15.01 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.87 3C6.3 7.55 8.95 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.5h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.7-4.94 3.7-8.57z" />
                      <path fill="#FBBC05" d="M5.37 14.5c-.24-.73-.37-1.5-.37-2.3s.13-1.57.37-2.3L1.5 6.9C.54 8.84 0 11.02 0 13.3c0 2.28.54 4.46 1.5 6.4l3.87-3.2z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.7-2.87c-1.04.7-2.37 1.12-4.26 1.12-3.05 0-5.7-2.51-6.63-5.46l-3.87 3C3.4 20.35 7.35 23 12 23z" />
                    </svg>
                    <span>Instant Google Login</span>
                  </button>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <button onClick={autofillCitizen} className="text-purple-600 hover:underline font-bold">
                      ⚡ Demo Auto Fill
                    </button>
                    <button onClick={() => setIsRegistering(true)} className="text-pink-600 hover:underline font-extrabold">
                      Create New Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OFFICER */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Officer ID Code</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                  <input
                    type="text"
                    placeholder="MUNI-CHE-01"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Officer Secure Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={officerPwd}
                    onChange={(e) => setOfficerPwd(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-950 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md cursor-pointer transition-all"
              >
                Access Officer Workspace
              </button>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-left">
                <span className="text-[10px] font-black text-purple-950 uppercase block mb-1">Pre-Seeded Test Officers</span>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                  <button type="button" onClick={() => autofillOfficer('MUNI-CHE-01')} className="flex items-center space-x-1 hover:text-pink-600 bg-white p-1 rounded border border-purple-100">
                    <span>MUNI-CHE-01</span>
                    <span className="text-purple-400 font-sans">(Waste, Chennai)</span>
                  </button>
                  <button type="button" onClick={() => autofillOfficer('WAT-CHE-01')} className="flex items-center space-x-1 hover:text-pink-600 bg-white p-1 rounded border border-purple-100">
                    <span>WAT-CHE-01</span>
                    <span className="text-purple-400 font-sans">(Water, Chennai)</span>
                  </button>
                  <button type="button" onClick={() => autofillOfficer('ELEC-CBE-01')} className="flex items-center space-x-1 hover:text-pink-600 bg-white p-1 rounded border border-purple-100">
                    <span>ELEC-CBE-01</span>
                    <span className="text-purple-400 font-sans">(Lights, Coimbatore)</span>
                  </button>
                  <button type="button" onClick={() => autofillOfficer('HIGH-TRY-01')} className="flex items-center space-x-1 hover:text-pink-600 bg-white p-1 rounded border border-purple-100">
                    <span>HIGH-TRY-01</span>
                    <span className="text-purple-400 font-sans">(Roads, Trichy)</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: ADMIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Admin Username</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                  <input
                    type="text"
                    placeholder="admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-purple-500 font-bold block mb-1">Admin Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                  <input
                    type="password"
                    placeholder="admin123"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-pink-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[10px] text-purple-500 font-mono text-center">
                Autofill Credentials:{' '}
                <button type="button" onClick={autofillAdmin} className="text-pink-600 font-bold hover:underline">
                  admin / admin123
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-950 to-purple-850 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md cursor-pointer transition-all"
              >
                Access Central System Admin
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
