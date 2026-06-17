import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Layers, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  UserCheck, 
  Info,
  RefreshCw,
  Plus,
  Shield,
  Smartphone,
  Search,
  Filter,
  Trash2,
  Edit,
  Sliders,
  Clock,
  ArrowRight,
  Check,
  X,
  Building
} from 'lucide-react';
import { Complaint, Officer, Citizen, DepartmentType, StatusType } from '../types';

export const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'database' | 'officers' | 'citizens'>('analytics');

  // Database Tab Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Edit State Modal
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editDept, setEditDept] = useState<DepartmentType>('Municipal Corporation');
  const [editOfficerId, setEditOfficerId] = useState<string>('');
  const [editStatus, setEditStatus] = useState<StatusType>('Assigned');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Roster Fields for adding new Officer
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [newOffId, setNewOffId] = useState('');
  const [newOffName, setNewOffName] = useState('');
  const [newOffDept, setNewOffDept] = useState<DepartmentType>('Municipal Corporation');
  const [newOffDist, setNewOffDist] = useState('Chennai');

  const DEPARTMENTS: DepartmentType[] = [
    "Municipal Corporation",
    "Water Board",
    "Electricity Board",
    "Highways Department",
    "Police Department"
  ];

  const STATUS_LIST: StatusType[] = [
    "Pending",
    "Assigned",
    "In Progress",
    "Verification Pending",
    "Resolved"
  ];

  const fetchAdminDetails = async () => {
    setLoading(true);
    try {
      // Load Analytics
      const resAnal = await fetch('/api/analytics');
      const dataAnal = await resAnal.json();
      setAnalytics(dataAnal);

      // Load Complaints
      const resComp = await fetch('/api/complaints');
      const dataComp = await resComp.json();
      setComplaints(dataComp);

      // Fetch roster officers
      // If none registered on server yet, loadDb provides defaults which are loaded with the complaints roster
      setOfficers([
        { id: "MUNI-CHE-01", name: "Thiru. S. Ramanujam", department: "Municipal Corporation", district: "Chennai" },
        { id: "MUNI-CBE-01", name: "Selvi. Priya Dharshini", department: "Municipal Corporation", district: "Coimbatore" },
        { id: "WAT-CHE-01", name: "Thiru. M. Kathirvel", department: "Water Board", district: "Chennai" },
        { id: "WAT-MDU-01", name: "Selvan. R. Vetrivel", department: "Water Board", district: "Madurai" },
        { id: "ELEC-CBE-01", name: "Thiru. A. Rajesh", department: "Electricity Board", district: "Coimbatore" },
        { id: "HIGH-TRY-01", name: "Thiru. N. Loganathan", department: "Highways Department", district: "Trichy" },
        { id: "POL-CHE-01", name: "Inspector G. Selvamani", department: "Police Department", district: "Chennai" },
        { id: "POL-MDU-01", name: "Inspector K. Pandian", department: "Police Department", district: "Madurai" }
      ]);

      setCitizens([
        { id: "citizen-1", name: "Divyakriti Pur", email: "9e.divyakriti.pu.103@gmail.com", phone: "+91 94445 12345", city: "Chennai", district: "Chennai", reputationPoints: 120 },
        { id: "citizen-2", name: "Anand Krishnan", email: "anand.k@gmail.com", phone: "+91 98401 56789", city: "Coimbatore", district: "Coimbatore", reputationPoints: 350 },
        { id: "citizen-3", name: "Janani Sundar", email: "janani.s@gmail.com", phone: "+91 97722 33445", city: "Madurai", district: "Madurai", reputationPoints: 80 }
      ]);

    } catch (err) {
      console.error("Failed to load administration dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffId || !newOffName) return;

    const newOfficer: Officer = {
      id: newOffId.toUpperCase(),
      name: newOffName,
      department: newOffDept,
      district: newOffDist
    };

    setOfficers(prev => [...prev, newOfficer]);
    setShowRosterModal(false);
    setNewOffId('');
    setNewOffName('');
  };

  // Admin Override Submission
  const handleSaveAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsSavingEdit(true);
    // Find matching officer's name for payload
    const matchingOfficer = officers.find(o => o.id === editOfficerId);

    try {
      const response = await fetch(`/api/complaints/${editingComplaint.id}/admin-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: editDept,
          assignedOfficerId: editOfficerId || null,
          assignedOfficerName: matchingOfficer ? matchingOfficer.name : null,
          remarks: editRemarks || "Administrative routing modified.",
          status: editStatus
        })
      });

      if (response.ok) {
        setEditingComplaint(null);
        await fetchAdminDetails();
      } else {
        alert("Verification failed to update on the server.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Admin deletion
  const handleDeleteComplaint = async (id: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete complaint ${id}? This is irreversible.`)) return;

    try {
      const res = await fetch(`/api/complaints/${id}/admin-delete`, { method: 'POST' });
      if (res.ok) {
        await fetchAdminDetails();
      } else {
        alert("Failed to delete from database");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load editing values to state
  const startEditing = (c: Complaint) => {
    setEditingComplaint(c);
    setEditDept(c.department);
    setEditOfficerId(c.assignedOfficerId || '');
    setEditStatus(c.status);
    setEditRemarks(c.remarks || '');
  };

  const isComplaintOverdue = (c: Complaint): boolean => {
    if (c.status === 'Resolved') return false;
    if (!c.dueDate) return false;
    return new Date() > new Date(c.dueDate);
  };

  // Dynamically calculate department progress stats
  const getDepartmentStats = () => {
    return DEPARTMENTS.map(dept => {
      const deptComplaints = complaints.filter(c => c.department === dept);
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
      const pending = total - resolved;
      const overdue = deptComplaints.filter(c => isComplaintOverdue(c)).length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        name: dept,
        total,
        resolved,
        pending,
        overdue,
        rate
      };
    });
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    // Keyword match
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Dept match
    const matchesDept = selectedDeptFilter === 'All' || c.department === selectedDeptFilter;

    // Status match
    let matchesStatus = true;
    if (selectedStatusFilter !== 'All') {
      if (selectedStatusFilter === 'Overdue') {
        matchesStatus = isComplaintOverdue(c);
      } else {
        matchesStatus = c.status === selectedStatusFilter;
      }
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Modern soft purple, pink and white themed color array for pie charts
  const CHARTS_COLORS = ['#7c3aed', '#db2777', '#f43f5e', '#d946ef', '#a855f7', '#6366f1'];

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Welcome Title for Admin */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-pink-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="bg-pink-500 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase font-mono">
              CENTRAL COMMAND
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-3 font-sans tracking-tight">Super Administration & Analytics</h2>
            <p className="text-xs text-purple-100 mt-1 max-w-xl">
              Cross-department audits, officer deployment rosters, dynamic district tracking, and visual analytics dashboards.
            </p>
          </div>
          <div>
            <button 
              onClick={fetchAdminDetails}
              className="flex items-center space-x-1.5 border border-white/25 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold font-mono py-2.5 px-4 rounded-xl cursor-copy"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Full Sync Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tab selectors */}
      <div className="flex border-b border-purple-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 shrink-0 transition-all ${
            activeTab === 'analytics' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          Analytics & Rerouting
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 shrink-0 transition-all flex items-center space-x-1.5 ${
            activeTab === 'database' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          <span>Complaints Ledger ({complaints.length})</span>
          {complaints.filter(c => isComplaintOverdue(c)).length > 0 && (
            <span className="bg-rose-500 text-white font-sans text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
              {complaints.filter(c => isComplaintOverdue(c)).length} Overdue
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('officers')}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 shrink-0 transition-all ${
            activeTab === 'officers' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          Deploy Roster ({officers.length})
        </button>
        <button
          onClick={() => setActiveTab('citizens')}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 shrink-0 transition-all ${
            activeTab === 'citizens' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          Citizen Directory
        </button>
      </div>

      {/* RENDER TAB CONTENTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Top Quick Aggregators */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-purple-50 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Cumulative</span>
              <p className="text-2xl font-sans font-black text-purple-950 mt-1">{analytics.summary.total}</p>
            </div>
            <div className="bg-white border border-purple-50 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Active Pending</span>
              <p className="text-2xl font-sans font-black text-pink-600 mt-1">{analytics.summary.pending}</p>
            </div>
            <div className="bg-white border border-purple-50 p-5 rounded-2xl shadow-xs text-left">
              <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Resolved Cases</span>
              <p className="text-2xl font-sans font-black text-emerald-700 mt-1">{analytics.summary.resolved}</p>
            </div>
            <div className="bg-white border border-purple-50 p-5 rounded-2xl shadow-xs text-left ring-1 ring-red-100">
              <span className="text-[10px] text-rose-500 font-mono font-bold block uppercase">Overdue SLA</span>
              <p className="text-2xl font-sans font-black text-rose-600 mt-1">{analytics.summary.overdue || 0}</p>
            </div>
            <div className="bg-white border border-purple-50 p-5 rounded-2xl shadow-xs text-left col-span-2 md:col-span-1">
              <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Resolution Rate</span>
              <p className="text-2xl font-sans font-black text-purple-800 mt-1">{analytics.resolutionRate}%</p>
            </div>
          </div>

          {/* Department-wise progress grid ("able to access all departments progress") */}
          <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-sans font-black text-purple-950 uppercase tracking-widest">
                  Departmental SLA Progress Tracker & Audit
                </h3>
                <p className="text-xs text-purple-500 mt-0.5">Real-time Service Level Agreement performance metrics across Chennai divisions</p>
              </div>
              <Building className="h-5 w-5 text-purple-650" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {getDepartmentStats().map((dept) => (
                <div 
                  key={dept.name}
                  onClick={() => {
                    setSelectedDeptFilter(dept.name);
                    setActiveTab('database');
                  }}
                  className="p-4 rounded-2xl border border-purple-100 bg-purple-50/15 flex flex-col justify-between hover:border-purple-300 transition-all cursor-pointer text-left"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-purple-950 font-sans truncate">{dept.name}</h4>
                    <div className="grid grid-cols-3 gap-1 mt-3 font-mono text-[10px] text-center border-b border-purple-100 pb-2">
                      <div>
                        <span className="text-purple-400 block uppercase text-[8px]">Tot</span>
                        <span className="font-bold text-purple-950">{dept.total}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 block uppercase text-[8px]">Res</span>
                        <span className="font-bold text-emerald-700">{dept.resolved}</span>
                      </div>
                      <div>
                        <span className="text-pink-500 block uppercase text-[8px]">Pen</span>
                        <span className="font-bold text-pink-700">{dept.pending}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-purple-500 font-semibold font-sans">SLA Rate:</span>
                      <span className="font-bold text-purple-950 font-mono">{dept.rate}%</span>
                    </div>
                    
                    {/* Micro gauge bar */}
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${dept.rate >= 75 ? 'bg-emerald-500' : dept.rate >= 50 ? 'bg-amber-500' : 'bg-pink-600'}`}
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>

                    {dept.overdue > 0 && (
                      <div className="mt-2 text-[9px] bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-sans font-bold text-center animate-pulse">
                        ⌛ {dept.overdue} OVERDUE CASES
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphics Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Complaints by Department */}
            <div className="bg-white border border-purple-50 p-6 rounded-3xl shadow-sm text-left">
              <h3 className="text-sm font-extrabold text-purple-950 font-sans uppercase tracking-widest mb-4">
                Complaints Volume by Govt Department
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8f3" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#4c1d95' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#4c1d95' }} />
                    <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f3e8f3' }} />
                    <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                      {analytics.byDepartment.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHARTS_COLORS[index % CHARTS_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Monthly Trends */}
            <div className="bg-white border border-purple-50 p-6 rounded-3xl shadow-sm text-left">
              <h3 className="text-sm font-extrabold text-purple-950 font-sans uppercase tracking-widest mb-4">
                Civic Records Timeline Trend Index (reported vs resolved)
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyTrends}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#db2777" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8f3" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#4c1d95' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#4c1d95' }} />
                    <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f3e8f3' }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="reported" stroke="#db2777" fillOpacity={1} fill="url(#colorReported)" name="Total Reported" />
                    <Area type="monotone" dataKey="resolved" stroke="#7c3aed" fillOpacity={1} fill="url(#colorResolved)" name="Total Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL COMPLAINTS DATABASE LEDGER */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-50 pb-5">
            <div>
              <h3 className="text-lg font-black text-purple-950 font-sans">Full Database of Complaints</h3>
              <p className="text-xs text-purple-505 font-sans mt-0.5">Categorized record entries, overdue timeline tracking, and route modification controls.</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-purple-50/50 p-1.5 rounded-xl border border-purple-100">
              <span className="text-[10px] text-purple-800 font-extrabold px-3 py-1 bg-white rounded-lg shadow-xs">
                Total: {filteredComplaints.length} Records
              </span>
              {filteredComplaints.filter(c => isComplaintOverdue(c)).length > 0 && (
                <span className="text-[10px] bg-pink-100 text-pink-700 font-black px-2.5 py-1 rounded-lg">
                  {filteredComplaints.filter(c => isComplaintOverdue(c)).length} Overdue
                </span>
              )}
            </div>
          </div>

          {/* Filtering Bars Component Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-purple-50/15 p-4 rounded-2xl border border-purple-100/50">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, ID, reporter..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-purple-100 rounded-xl focus:border-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-900"
              />
            </div>

            {/* Department Filter Selector */}
            <div className="relative md:col-span-3">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl focus:outline-none focus:border-purple-950 text-purple-950"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter Selector */}
            <div className="relative md:col-span-3">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl focus:outline-none focus:border-purple-950 text-purple-950"
              >
                <option value="All">All Statuses</option>
                {STATUS_LIST.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
                <option value="Overdue" className="text-rose-600 font-bold">⚠️ Overdue SLA</option>
              </select>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => { setSearchQuery(''); setSelectedDeptFilter('All'); setSelectedStatusFilter('All'); }}
              className="md:col-span-1 py-2.5 bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>

          {/* Database Spreadsheet Table */}
          <div className="overflow-x-auto">
            {filteredComplaints.length === 0 ? (
              <div className="py-16 text-center text-purple-400">
                <AlertCircle className="h-10 w-10 text-purple-200 mx-auto mb-2" />
                <p className="font-sans font-bold">No complaints match current parameters</p>
                <p className="text-xs text-purple-500">Try re-adjusting search tags or filters above.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-purple-100 text-[10px] font-bold text-purple-900 uppercase bg-purple-50/20">
                    <th className="py-3.5 px-4 rounded-tl-xl">ID</th>
                    <th className="py-3.5 px-4">Complaint details</th>
                    <th className="py-3.5 px-4 font-sans">Govt Department</th>
                    <th className="py-3.5 px-4 font-sans">Officer Assignee</th>
                    <th className="py-3.5 px-4 text-center font-sans">SLA Timeline Due</th>
                    <th className="py-3.5 px-4 text-center">Status state</th>
                    <th className="py-3.5 px-4 text-center rounded-tr-xl">Admin controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100/50">
                  {filteredComplaints.map((c) => {
                    const isOverdue = isComplaintOverdue(c);
                    return (
                      <tr key={c.id} className="hover:bg-purple-100/5 transition-all text-xs">
                        <td className="py-4 px-4 font-mono font-bold text-purple-400">
                          {c.id}
                        </td>
                        <td className="py-4 px-4 max-w-sm">
                          <h4 className="font-extrabold text-purple-950 font-sans line-clamp-1">{c.title}</h4>
                          <p className="text-[10px] text-purple-550 line-clamp-2 mt-0.5 leading-relaxed">{c.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {c.category}
                            </span>
                            <span className="text-[9px] text-purple-400">
                              BY: {c.reporter.name} ({c.reporter.phone})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-900">
                          {c.department}
                        </td>
                        <td className="py-4 px-4 text-purple-905">
                          {c.assignedOfficerName ? (
                            <div className="font-bold flex items-center space-x-1">
                              <span className="text-purple-950">{c.assignedOfficerName}</span>
                              <span className="text-[10px] text-purple-400 font-mono">({c.assignedOfficerId})</span>
                            </div>
                          ) : (
                            <p className="text-pink-600 font-bold italic">Unassigned</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-purple-950">
                              {c.dueDate ? new Date(c.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'SLA Unassigned'}
                            </span>
                            <span className="text-[9px] text-purple-400 mt-0.5">
                              Reported: {new Date(c.dateCreated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              c.status === 'Verification Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              c.status === 'In Progress' ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}>
                              {c.status}
                            </span>
                            
                            {isOverdue && (
                              <span className="bg-red-600 text-white font-sans text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-md animate-pulse">
                                OVERDUE SLA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => startEditing(c)}
                              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-lg cursor-pointer"
                              title="Override Assignment / Status"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteComplaint(c.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                              title="Delete Record Entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOY OFFICERS ROSTER */}
      {activeTab === 'officers' && (
        <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-purple-950 font-sans">Active field Division Officers Roster</h3>
              <p className="text-xs text-purple-500 font-sans">Deployment of authorized authorities across divisions and districts of Tamil Nadu</p>
            </div>
            <button
              onClick={() => setShowRosterModal(true)}
              className="px-4 py-2 bg-purple-950 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-copy"
            >
              <Plus className="h-4 w-4" />
              <span>Deploy Regional Officer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((off) => (
              <div key={off.id} className="border border-purple-100 p-4 rounded-2xl flex items-start space-x-3 bg-purple-50/20">
                <div className="w-10 h-10 bg-purple-100 border border-purple-200 text-purple-950 flex items-center justify-center font-bold text-sm rounded-xl">
                  👤
                </div>
                <div>
                  <h4 className="font-bold text-purple-950 text-sm font-sans">{off.name}</h4>
                  <p className="text-[10px] text-purple-500 font-bold uppercase font-mono">{off.id}</p>
                  <p className="text-xs text-purple-800 font-semibold mt-1">{off.department}</p>
                  <span className="inline-block bg-pink-100 text-pink-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 border border-pink-200">
                    📍 {off.district} Division
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CITIZENS DATABASE */}
      {activeTab === 'citizens' && (
        <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm text-left space-y-4 overflow-x-auto">
          <div>
            <h3 className="text-lg font-black text-purple-950 font-sans">Citizen Accountability Registry</h3>
            <p className="text-xs text-purple-500 font-sans">Citizen participation scoreboards and registered profiles details</p>
          </div>

          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-purple-100 text-[10px] font-bold text-purple-900 uppercase bg-purple-50/30">
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Contact coordinates</th>
                <th className="py-3 px-4">City / district</th>
                <th className="py-3 px-4 text-center">Reputation score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-55">
              {citizens.map((cit) => (
                <tr key={cit.id} className="hover:bg-purple-100/10">
                  <td className="py-3 px-4">
                    <span className="font-bold text-purple-950 text-sm block">{cit.name}</span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">{cit.id}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-xs text-purple-700">
                    <p className="font-bold">{cit.email}</p>
                    <p className="text-purple-400 font-medium">{cit.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-purple-905">
                    {cit.city}, {cit.district} District
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block bg-gradient-to-r from-purple-800 to-pink-600 text-white font-sans font-black text-xs px-3 py-1 rounded-lg">
                      ⭐ {cit.reputationPoints} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN REASSIGN MODAL OVERLAY */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/45 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 sm:p-8 flex flex-col text-left space-y-4">
            
            <button 
              onClick={() => setEditingComplaint(null)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-50 text-purple-950 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-[10px] font-mono font-bold text-purple-400">{editingComplaint.id}</span>
            <h3 className="text-base font-black text-purple-950 font-sans">Administrative Routing Overrides</h3>
            <p className="text-xs text-purple-500 leading-snug">Reroute to a different government board, update physical status parameters, or assign division officers.</p>

            <form onSubmit={handleSaveAdminEdit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Reroute Department Board</label>
                <select
                  value={editDept}
                  onChange={(e) => {
                    const nextDept = e.target.value as DepartmentType;
                    setEditDept(nextDept);
                    // Reset officer choice so it corresponds to next department
                    const matching = officers.find(o => o.department === nextDept);
                    setEditOfficerId(matching ? matching.id : '');
                  }}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Assign Division Officer</label>
                <select
                  value={editOfficerId}
                  onChange={(e) => setEditOfficerId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {officers
                    .filter(o => o.department === editDept)
                    .map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.id})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Operational Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as StatusType)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none"
                >
                  {STATUS_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Audit / Remarks Log Override</label>
                <textarea
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Describe details regarding re-routing or inspection overrides..."
                  rows={3}
                  className="w-full text-xs p-3 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="w-1/3 py-2.5 border border-purple-200 hover:bg-purple-150 text-purple-950 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-purple-800 to-pink-600 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110"
                >
                  {isSavingEdit ? 'Saving overrides...' : 'Save Administrative Fix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER OFFICER ROSTER MODAL */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 sm:p-8">
            <h3 className="text-lg font-black font-sans text-purple-950 mb-4 text-left">Deploy Government Department Officer</h3>
            
            <form onSubmit={handleCreateOfficer} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Officer ID (Unique)</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. WAT-CHE-03"
                    value={newOffId}
                    onChange={(e) => setNewOffId(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:border-purple-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Officer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Thiru. Ramachandran K."
                  value={newOffName}
                  onChange={(e) => setNewOffName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Active Government Department</label>
                <select
                  value={newOffDept}
                  onChange={(e) => setNewOffDept(e.target.value as DepartmentType)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-905"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">TN Civil Division District</label>
                <select
                  value={newOffDist}
                  onChange={(e) => setNewOffDist(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-905"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Salem">Salem</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="w-1/3 py-2 text-xs border border-purple-200 hover:bg-purple-100 text-purple-950 font-bold rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-purple-950 text-white text-xs font-bold rounded-xl text-center"
                >
                  Deploy Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
