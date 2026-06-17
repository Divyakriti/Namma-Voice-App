import React, { useState, useEffect } from 'react';
import { useAppState } from './AppContext';
import { Complaint, CategoryType } from '../types';
import { CameraCapture } from './CameraCapture';
import { 
  PlusCircle, 
  MapPin, 
  Mic, 
  Trash2, 
  Camera, 
  Compass, 
  Tag, 
  Smartphone, 
  Lock, 
  Check, 
  X, 
  Activity, 
  History, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser, setSmsNotification, refreshComplaints, complaints, isLoading } = useAppState();

  // Active view tabs
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');

  // Create Complaint Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [city, setCity] = useState('Chennai');
  const [manualAddress, setManualAddress] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [videoOption, setVideoOption] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Verification PIN
  const [activeVerifyId, setActiveVerifyId] = useState<string | null>(null);
  const [verificationPin, setVerificationPin] = useState('');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Simulating GPS coordinates
  const triggerGpsDetect = () => {
    setIsGpsLoading(true);
    setVerifyError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setManualAddress(`Detected via device GPS: Near Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
        setIsGpsLoading(false);
      },
      (err) => {
        // Fallback simulated GPS coordinates for Chennai center
        setTimeout(() => {
          setLatitude(13.0401);
          setLongitude(80.2337);
          setManualAddress("Auto Detected GPS: Anna Nagar East metro, Chennai - 600102");
          setIsGpsLoading(false);
        }, 1200);
      },
      { timeout: 5000 }
    );
  };

  // Simulated Voice recording
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);
  const toggleRecordSimulate = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
      setVoiceRecorded(true);
    } else {
      setVoiceSeconds(0);
      setVoiceRecorded(false);
      const interval = setInterval(() => {
        setVoiceSeconds(prev => {
          if (prev >= 10) { // max 10s
            clearInterval(interval);
            setRecordingInterval(null);
            setVoiceRecorded(true);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingInterval(interval);
    }
  };

  const handlePostComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setVerifyError(null);

    if (!title || !description) {
      setVerifyError("Title and description details are required");
      return;
    }

    setIsSubmitting(true);
    
    // Unsplash references corresponding to keywords
    let pUrl = beforePhotoUrl;
    if (!pUrl) {
      const text = (title + ' ' + description).toLowerCase();
      if (text.includes('garbage')) pUrl = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60";
      else if (text.includes('water') || text.includes('sewage')) pUrl = "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=600&auto=format&fit=crop&q=60";
      else if (text.includes('light') || text.includes('power')) pUrl = "https://images.unsplash.com/photo-1509024644558-2f060d43f60b?w=600&auto=format&fit=crop&q=60";
      else pUrl = "https://images.unsplash.com/photo-1515162305285-0293fe4767cc?w=600&auto=format&fit=crop&q=60"; // Road pothole
    }

    try {
      const payload = {
        title,
        description,
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        reporterPhone: currentUser.phone,
        manualAddress: manualAddress || "Anna Nagar East Road, Chennai",
        latitude,
        longitude,
        district,
        city,
        voiceUrl: voiceRecorded ? "https://nammavoice.gov.in/audio/simulated_voice_clip.mp3" : undefined,
        videoUrl: videoOption ? "https://nammavoice.gov.in/video/simulated_video.mp4" : undefined,
        beforePhotoUrl: pUrl
      };

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMsg(`Succesfully created complaint! Classified to "${data.complaint.category}" by AI router.`);
        // Reset form
        setTitle('');
        setDescription('');
        setManualAddress('');
        setVoiceRecorded(false);
        setBeforePhotoUrl('');
        setVideoOption(false);
        
        await refreshComplaints();
        setTimeout(() => {
          setActiveTab('list');
          setSuccessMsg(null);
        }, 2200);
      } else {
        setVerifyError(data.error || "Submission failed");
      }
    } catch (err) {
      setVerifyError("Network connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit PIN for closure
  const handleVerifyPin = async (complaintId: string, action: 'approve' | 'reject') => {
    setVerifyError(null);
    setRewardMessage(null);
    try {
      const response = await fetch(`/api/complaints/${complaintId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: verificationPin,
          action,
          remarks: action === 'approve' ? 'Verified resolved by citizen. Case closed.' : rejectFeedback,
          citizenId: currentUser.id
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (action === 'approve') {
          setRewardMessage(data.rewardMessage || "Success! Thank you for participating.");
          // Update local state points
          currentUser.reputationPoints += 100;
          localStorage.setItem('nv_user', JSON.stringify(currentUser));
        } else {
          setRewardMessage("Feedback submitted. Complaint returned to department.");
        }
        setVerificationPin('');
        setRejectFeedback('');
        setIsRejecting(false);
        setActiveVerifyId(null);
        await refreshComplaints();
      } else {
        setVerifyError(data.error || "Verification PIN is incorrect");
      }
    } catch (err) {
      setVerifyError("Verification failed on connectivity.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Citizen Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-800 to-purple-950 text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-purple-200 uppercase font-mono font-bold">Reputation Status</span>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-2xl font-sans font-black">⭐ {currentUser?.reputationPoints || 0}</span>
              <span className="text-[10px] text-pink-300 font-bold bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">Citizen Star</span>
            </div>
            <p className="text-[9px] text-purple-300 mt-1 font-sans">You earn +100 points for each verified fix</p>
          </div>
          <Compass className="h-10 w-10 text-purple-300/40" />
        </div>

        <div className="bg-white border border-purple-50 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left">
          <div>
            <span className="text-[10px] text-purple-400 uppercase font-mono font-bold">My Active Complaints</span>
            <p className="text-3xl font-sans font-black text-purple-950 mt-1">
              {complaints.filter(c => c.status !== 'Resolved').length}
            </p>
            <p className="text-[9px] text-purple-500 mt-1 font-sans">Awaiting assigned officer closure</p>
          </div>
          <Activity className="h-10 w-10 text-pink-500/20" />
        </div>

        <div className="bg-white border border-purple-50 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left">
          <div>
            <span className="text-[10px] text-purple-400 uppercase font-mono font-bold">Resolved Cases</span>
            <p className="text-3xl font-sans font-black text-emerald-700 mt-1">
              {complaints.filter(c => c.status === 'Resolved').length}
            </p>
            <p className="text-[9px] text-emerald-600 mt-1 font-sans">Verified completed by you</p>
          </div>
          <Check className="h-10 w-10 text-emerald-500/20" />
        </div>
      </div>

      {rewardMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl text-center flex items-center justify-center space-x-2 animate-bounce">
          <span>{rewardMessage}</span>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-purple-100">
        <button
          onClick={() => { setActiveTab('list'); setVerifyError(null); }}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'list' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          My Complaints Track ({complaints.length})
        </button>
        <button
          onClick={() => { setActiveTab('create'); setVerifyError(null); }}
          className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all flex items-center space-x-1 ${
            activeTab === 'create' ? 'border-purple-900 text-purple-950' : 'border-transparent text-purple-500 hover:text-purple-950'
          }`}
        >
          <PlusCircle className="h-4 w-4 text-pink-500" />
          <span>Raise New Complaint</span>
        </button>
      </div>

      {/* Verification Dialog Overlay */}
      {activeVerifyId && (
        <div className="bg-pink-50/50 border border-pink-200 rounded-3xl p-6 text-left space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-purple-950 font-black font-sans text-base">Authorize Closure Verification Code</h4>
              <p className="text-xs text-purple-600 mt-1 font-sans">To accept resolution, enter the 4-digit PIN sent via SIMULATOR card above</p>
            </div>
            <button 
              onClick={() => { setActiveVerifyId(null); setVerifyError(null); setIsRejecting(false); }}
              className="p-1 rounded-full text-purple-900 hover:bg-pink-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {verifyError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-center font-semibold">
              {verifyError}
            </div>
          )}

          {!isRejecting ? (
            <div className="flex items-center space-x-3 max-w-sm">
              <input
                type="text"
                placeholder="Enter 4-Digit Verification PIN"
                maxLength={4}
                value={verificationPin}
                onChange={(e) => setVerificationPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 border border-purple-200 rounded-xl bg-white focus:outline-none focus:border-purple-900"
              />
              <button
                onClick={() => handleVerifyPin(activeVerifyId, 'approve')}
                className="bg-purple-950 hover:brightness-110 text-white text-xs font-bold py-3 px-6 rounded-xl shrink-0 cursor-copy"
              >
                Accept & Close Case
              </button>
              <button
                onClick={() => setIsRejecting(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-3 px-4 rounded-xl shrink-0"
              >
                Reject Fix
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                placeholder="Briefly describe why the issue is not fixed correctly so the officer can correct it..."
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                className="w-full text-xs p-3 border border-purple-200 rounded-xl bg-white focus:outline-none"
                rows={3}
              />
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-4 py-2 text-xs border border-purple-200 hover:bg-purple-50 text-purple-950 font-bold rounded-lg"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyPin(activeVerifyId, 'reject')}
                  className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                >
                  Confirm Rejection & Reopen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTROLLING ACTIVE VIEWS */}
      {activeTab === 'create' ? (
        
        /* RAISE NEW COMPLAINT VIEW */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          <form onSubmit={handlePostComplaint} className="md:col-span-8 bg-white border border-purple-50 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-purple-950 font-sans">Register Live Civic Grievance</h3>
            <p className="text-xs text-purple-500 font-sans">AI engine will instantly classify description and assign specific regional officer in charge.</p>

            {verifyError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
                {verifyError}
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-1 block">Complaint Title</label>
              <input
                type="text"
                placeholder="e.g., Deep dangerous pothole opposite Anna Arch street corner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none focus:border-pink-300 text-purple-950 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-1 block">Detailed Issue Description</label>
              <textarea
                placeholder="Provide details about the issue. Include size, landmark, smell, how long it's been happening, or hazard risks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 bg-purple-50/20 border border-purple-100 rounded-xl focus:outline-none focus:border-pink-300 text-purple-950"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-1 block">District (Location Context)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-purple-100 rounded-xl bg-purple-50/20"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Salem">Salem</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-500 mb-1 block">City/Town</label>
                <input
                  type="text"
                  placeholder="Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-purple-50/20 border border-purple-100 rounded-xl"
                />
              </div>
            </div>

            {/* GPS Detection panel */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-purple-950 flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span>Pinpoint Location Coordinate Matrix</span>
                </span>
                <button
                  type="button"
                  onClick={triggerGpsDetect}
                  className="bg-white hover:bg-purple-100 border border-purple-200 text-purple-950 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isGpsLoading ? 'animate-spin' : ''}`} />
                  <span>{isGpsLoading ? 'Detecting GPS...' : 'Simulate GPS Detect'}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="GPS Auto-Detected Address / manual coordinate entry"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-purple-100 rounded-xl text-purple-950 font-medium"
              />
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px] text-purple-400">
                <span>Latitude: {latitude.toFixed(6)}</span>
                <span>Longitude: {longitude.toFixed(6)}</span>
              </div>
            </div>

            {/* Media Upload Simulators */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-purple-500 block mb-1">Verify media proof attach (Simulated)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Voice Upload Button */}
                <button
                  type="button"
                  onClick={toggleRecordSimulate}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 hover:border-purple-300 transition-all ${
                    recordingInterval ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : voiceRecorded ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-purple-50/30 border-purple-100 text-purple-800'
                  }`}
                >
                  <Mic className="h-5 w-5" />
                  <span className="text-xs font-semibold">
                    {recordingInterval ? `Recording ${voiceSeconds}s...` : voiceRecorded ? '✓ Voice Clip Attached' : 'Record voice note'}
                  </span>
                </button>

                {/* Photo Upload or Capture */}
                <div className="relative border border-purple-100 bg-purple-50/10 p-2.5 rounded-2xl flex flex-col justify-center items-center min-h-[58px]">
                  {beforePhotoUrl ? (
                    <div className="relative w-full h-full min-h-[50px] flex items-center justify-between px-2">
                      <span className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1">✓ Photo Attached</span>
                      <button 
                        type="button" 
                        onClick={() => setBeforePhotoUrl('')}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="w-1/2 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5 text-pink-400" />
                        <span>Live Photo</span>
                      </button>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={beforePhotoUrl}
                        onChange={(e) => setBeforePhotoUrl(e.target.value)}
                        className="w-1/2 text-[9px] px-2 py-1.5 bg-white border border-purple-100 rounded-xl focus:outline-none text-purple-950 text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Video Simulator toggle */}
                <button
                  type="button"
                  onClick={() => setVideoOption(!videoOption)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 hover:border-purple-300 transition-all ${
                    videoOption ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-purple-50/30 border-purple-100 text-purple-800'
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs font-semibold">{videoOption ? '✓ Video Attached' : 'Attach video clip'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-800 via-purple-900 to-pink-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md cursor-pointer transition-all"
            >
              {isSubmitting ? 'AI Classifying and Routing Complaint...' : '✓ AI Submit Complaint'}
            </button>
          </form>

          {/* Right Guide Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-3xl p-5 space-y-4">
              <h4 className="text-purple-950 font-black font-sans text-sm block">Platform Routing Rules</h4>
              <ul className="space-y-3.5 text-xs text-purple-700">
                <li className="flex items-start">
                  <span className="inline-block bg-white text-pink-500 font-mono font-bold text-center w-5 h-5 rounded-full shrink-0 mr-2.5 mt-0.5 shadow-sm text-xs">1</span>
                  <span><strong>Instant Dispatch</strong>: Issues are parsed and routed to Municipal, Road, Electricity, Water or Police departments automatically.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block bg-white text-pink-500 font-mono font-bold text-center w-5 h-5 rounded-full shrink-0 mr-2.5 mt-0.5 shadow-sm text-xs">2</span>
                  <span><strong>Audit Tracking</strong>: Officers add completion photographic proofs visible on public transparency portal.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block bg-white text-pink-500 font-mono font-bold text-center w-5 h-5 rounded-full shrink-0 mr-2.5 mt-0.5 shadow-sm text-xs">3</span>
                  <span><strong>Citizen closure code</strong>: You must provide verification PIN to mark complaint Resolved. Verified status yields +100 reputation coins.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        
        /* MY COMPLAINTS LISTS VIEW */
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-purple-500 font-bold">Synchronizing records...</div>
          ) : complaints.length === 0 ? (
            <div className="bg-purple-50/50 border border-dashed border-purple-100 py-16 text-center rounded-3xl">
              <History className="h-10 w-10 text-purple-300 mx-auto mb-2" />
              <p className="text-purple-950 font-black font-sans">No history reports logged yet</p>
              <p className="text-xs text-purple-500 mb-4">You have a clean civic report history! Log a new complaint above.</p>
              <button onClick={() => setActiveTab('create')} className="px-5 py-2 bg-purple-950 hover:brightness-110 text-white rounded-xl text-xs font-bold leading-none cursor-pointer">
                File incident
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {complaints.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-purple-100 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] text-purple-400 font-mono font-bold block">{c.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        c.status === 'Verification Pending' ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse font-extrabold' : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-sans font-black text-purple-950 mt-2">{c.title}</h3>
                    <p className="text-xs text-purple-600 line-clamp-2 mt-1 leading-relaxed">{c.description}</p>
                    
                    {/* Remarks of officer */}
                    {c.remarks && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100/50 text-[11px] text-purple-800">
                        <strong className="font-bold text-purple-950 block">Officer Remarks:</strong>
                        <span>{c.remarks}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Verification triggers */}
                  <div className="mt-5 pt-3 border-t border-purple-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-purple-400">ASSIGNED AUTHORITY</p>
                      <p className="font-semibold text-purple-950">{c.department}</p>
                    </div>
                    
                    {c.status === 'Verification Pending' ? (
                      <button
                        onClick={() => { setActiveVerifyId(c.id); setVerificationPin(''); setVerifyError(null); }}
                        className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl cursor-copy transition-colors animate-bounce"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Enter PIN code to sign Resolved</span>
                      </button>
                    ) : c.status === 'Resolved' ? (
                      <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold font-sans">
                        <Check className="h-3.5 w-3.5" />
                        <span>Resolved Verified (+100)</span>
                      </div>
                    ) : (
                      <div className="text-right text-[11px] text-purple-500 font-sans">
                        <span>Awaiting verification completion...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isCameraOpen && (
        <CameraCapture 
          title="Filing Evidence Camera"
          onCapture={(base64) => {
            setBeforePhotoUrl(base64);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};
