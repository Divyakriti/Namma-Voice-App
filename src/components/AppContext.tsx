import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, Citizen, Officer, Complaint } from '../types';

interface AppContextProps {
  currentRole: Role | null;
  currentUser: any | null;
  smsNotification: string | null;
  setSmsNotification: (msg: string | null) => void;
  login: (role: Role, user: any) => void;
  logout: () => void;
  refreshComplaints: () => Promise<void>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  isLoading: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
}

const AppStateContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role | null>(() => {
    const saved = localStorage.getItem('nv_role');
    return saved ? (saved as Role) : null;
  });

  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('nv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('home'); // home, dashboard, transparency, leaderboard, sdg

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let url = '/api/complaints';
      if (currentRole === 'officer' && currentUser?.id) {
        url += `?officerId=${currentUser.id}`;
      } else if (currentRole === 'citizen' && currentUser?.id) {
        url += `?reporterId=${currentUser.id}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentRole, currentUser]);

  const login = (role: Role, user: any) => {
    setCurrentRole(role);
    setCurrentUser(user);
    localStorage.setItem('nv_role', role);
    localStorage.setItem('nv_user', JSON.stringify(user));
    setActiveView('dashboard');
  };

  const logout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
    localStorage.removeItem('nv_role');
    localStorage.removeItem('nv_user');
    setActiveView('home');
  };

  return (
    <AppStateContext.Provider
      value={{
        currentRole,
        currentUser,
        smsNotification,
        setSmsNotification,
        login,
        logout,
        refreshComplaints: fetchComplaints,
        complaints,
        setComplaints,
        isLoading,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};
