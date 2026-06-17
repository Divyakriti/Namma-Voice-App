import React, { useState, useEffect } from 'react';
import { useAppState } from './AppContext';
import { Complaint, StatusType } from '../types';
import { CameraCapture } from './CameraCapture';
import { 
  Check, 
  MapPin, 
  Clock, 
  Edit, 
  Camera, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  Phone, 
  Eye, 
  X, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { currentUser, setSmsNotification, refreshComplaints, complaints, isLoading } = useAppState();

  // Active modal edit state
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  
  // Edit complaint form fields
  const [status, setStatus] = useState<StatusType>('In Progress');
  const [remarks, setRemarks] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Verification Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'In Progress':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsUpdating(true);
    setSuccessInfo(null);

    // Dynamic clean up after photos if the officer marks as verification pending but didn't input photo
    let postPhoto = afterPhotoUrl;
    if (status === 'Verification Pending' && !postPhoto) {
      // Choose appropriate after photos from professional unsplash
      if (editingComplaint.category === 'Garbage') {
        postPhoto = "https://images.unsplash.com/photo-1599740831666-dec68233ed89?w=600&auto=format&fit=crop&q=60";
      } else if (editingComplaint.category === 'Water') {
        postPhoto = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60";
      } else {
        postPhoto = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=60"; // construction completed
      }
    }

    try {
      const response = await fetch(`/api/complaints/${editingComplaint.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks,
          officerName: currentUser.name,
          officerId: currentUser.id,
          afterPhotoUrl: postPhoto
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessInfo(`Status updated successfully!`);
        
        // If Verification Pending was selected, trigger top simulator SMS toast!
        if (data.smsSimulated) {
          setSmsNotification(data.smsSimulated);
        }

        await refreshComplaints();
        setTimeout(() => {
          setEditingComplaint(null);
          setSuccessInfo(null);
          setRemarks('');
          setAfterPhotoUrl('');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Pre-seed mock fields when clicking "inspect & resolve"
  const openEditModal = (c: Complaint) => {
    setEditingComplaint(c);
    setStatus(c.status);
    setRemarks(c.remarks || '');
    setAfterPhotoUrl(c.afterPhotoUrl || '');
  };

  // Metrics specifically for the officer's filtered complaints list
  const pendingCount = complaints.filter(c => c.status === 'Assigned' || c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const verificationCount = complaints.filter(c => c.status === 'Verification Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Area */}
      <div className="bg-gradient-to-r from-purple-950 to-purple-900 text-white p-6 rounded-3xl text-left flex flex-col sm:flex-row items-center justify-between shadow-md">
        <div>
          <span className="bg-pink-500 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase font-mono">
            AUTHORITY WORKSPACE
          </span>
          <h2 className="text-2xl font-black mt-2 font-sans tracking-tight">Welcome, {currentUser.name}</h2>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            You are logged in as Deputy Division Officer for the <strong className="text-pink-300 font-sans">{currentUser.department}</strong>. You only see civic complaints assigned strictly to your department in the <strong className="text-pink-300">{currentUser.district}</strong> area.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center sm:text-right mt-6 sm:mt-0 font-sans">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0">
            <span className="text-[10px] text-purple-200 block uppercase font-mono">Total Workload</span>
            <span className="text-xl font-bold">{complaints.length} Assigned</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0">
            <span className="text-[10px] text-purple-200 block uppercase font-mono">My District</span>
            <span className="text-xl font-bold">{currentUser.district}</span>
          </div>
        </div>
      </div>

      {/* Metrics breakdown row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-purple-50 p-4 rounded-2xl shadow-xs text-left">
          <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Assigned / New</span>
          <p className="text-2xl font-black text-purple-950 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white border border-purple-50 p-4 rounded-2xl shadow-xs text-left">
          <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">In Progress</span>
          <p className="text-2xl font-black text-pink-600 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white border border-purple-50 p-4 rounded-2xl shadow-xs text-left">
          <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Verification Awaiting</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{verificationCount}</p>
        </div>
        <div className="bg-white border border-purple-50 p-4 rounded-2xl shadow-xs text-left">
          <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase">Marked Resolved</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Main workload listing */}
      <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm text-left">
        <h3 className="text-lg font-black text-purple-950 font-sans flex items-center space-x-2 mb-6">
          <CheckSquare className="h-5 w-5 text-purple-600" />
          <span>Active Operations Queue ({currentUser.department})</span>
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-purple-500 font-bold">Synchronizing department database...</div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-purple-400">
            <AlertTriangle className="h-10 w-10 text-purple-300 mx-auto mb-2" />
            <p className="font-sans font-bold text-purple-950">Awesome, zero outstanding backlogs!</p>
            <p className="text-xs text-purple-500 mt-1">There are no pending civic complaints raised for your department in {currentUser.district}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div 
                key={c.id} 
                className="group border border-purple-100/50 hover:border-purple-300 hover:shadow-xs p-5 rounded-2xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
              >
                {/* Details left side */}
                <div className="space-y-2 flex-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-purple-400">{c.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] bg-purple-50 text-purple-500 px-2 py-0.5 rounded font-sans font-bold">{c.category}</span>
                  </div>

                  <h4 className="text-base font-black text-purple-950 font-sans line-clamp-1 group-hover:text-pink-600 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-purple-600 leading-relaxed font-sans">{c.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-purple-550 pt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-pink-500" />
                      <span>{c.location.manualAddress}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3.5 w-3.5 text-purple-400" />
                      <span>Reporter: {c.reporter.name} ({c.reporter.phone})</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Action Right Side */}
                <div className="shrink-0 flex sm:flex-col justify-end gap-2.5">
                  <button
                    onClick={() => openEditModal(c)}
                    className="w-full sm:w-auto flex items-center justify-center space-x-1 px-4 py-2.5 bg-gradient-to-r from-purple-800 to-pink-600 text-white text-xs font-bold rounded-xl shadow-xs font-sans hover:brightness-110 cursor-copy transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Inspect & Action Grieveness</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPDATE MODAL OVERLAY */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-purple-100 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto text-left">
            
            <button 
              onClick={() => setEditingComplaint(null)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-50 text-purple-950 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest">{editingComplaint.id}</span>
            <h3 className="text-xl font-black font-sans text-purple-950 mt-1 max-w-[90%]">{editingComplaint.title}</h3>
            
            {/* Before Media container */}
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-purple-100/30 p-2.5 rounded-xl border border-purple-150 text-center">
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase block mb-1">PROPORTIONAL BEFORE PROOF</span>
                {editingComplaint.beforePhotoUrl ? (
                  <img src={editingComplaint.beforePhotoUrl} alt="Before Condition" referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-lg border" />
                ) : (
                  <div className="h-24 flex items-center justify-center border border-dashed rounded-lg text-purple-400 text-xs">No Photo attached</div>
                )}
              </div>
              <div className="bg-pink-50/20 p-2.5 rounded-xl border border-pink-100 text-center">
                <span className="text-[9px] font-mono font-bold text-pink-600 uppercase block mb-1">RESOLUTION PROOF ATTACH</span>
                {afterPhotoUrl ? (
                  <img src={afterPhotoUrl} alt="After Condition Preview" referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-lg border border-pink-200" />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center border border-dashed border-pink-200 rounded-lg text-pink-400 text-xs p-1">
                    <Camera className="h-5 w-5 mb-1" />
                    <span>Auto-simulated on verify pending</span>
                  </div>
                )}
              </div>
            </div>

            {successInfo && (
              <div className="mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 text-center rounded-xl">
                {successInfo}
              </div>
            )}

            <form onSubmit={handleUpdateAction} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Shift Status State</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Assigned', 'In Progress', 'Verification Pending'] as StatusType[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`text-xs py-2 px-3 rounded-xl font-bold border transition-all ${
                        status === st 
                          ? 'bg-purple-950 text-white border-purple-950 shadow-xs' 
                          : 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">Action / Status Remarks</label>
                <textarea
                  placeholder="Provide explicit details corresponding to field findings and operations. e.g. Sealed pipe, cleared 15 tons trash..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-3 border border-purple-100 rounded-xl bg-purple-50/20 focus:outline-none focus:border-pink-300 text-purple-950"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500 mb-1 block">After Photo Evidence</label>
                {afterPhotoUrl ? (
                  <div className="flex items-center justify-between p-2 border border-purple-100 bg-emerald-50 text-emerald-800 rounded-xl mb-2">
                    <span className="text-[10px] font-extrabold flex items-center gap-1">✓ Solution Proof Attached</span>
                    <button 
                      type="button" 
                      onClick={() => setAfterPhotoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="py-2 px-3 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                    >
                      <Camera className="h-4 w-4 text-pink-400" />
                      <span>Take Photo</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Or paste direct proof photo URL"
                      value={afterPhotoUrl}
                      onChange={(e) => setAfterPhotoUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="w-1/3 py-2.5 border border-purple-200 hover:bg-purple-50 text-purple-950 text-xs font-bold rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-purple-800 to-pink-600 hover:brightness-110 text-white text-xs font-bold rounded-xl text-center shadow-md cursor-copy"
                >
                  {isUpdating ? 'Updating milestone log...' : '✓ Finalize & Dispatch Record'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {isCameraOpen && (
        <CameraCapture 
          title="Resolution Proof Evidence Camera"
          onCapture={(base64) => {
            setAfterPhotoUrl(base64);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};
