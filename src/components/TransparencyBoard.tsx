import React, { useState, useEffect, useRef } from 'react';
import { Complaint, CategoryType, DepartmentType, StatusType } from '../types';
import { Search, MapPin, Filter, AlertCircle, Eye, RefreshCw, Layers, Calendar, User, MessageSquare } from 'lucide-react';

export const TransparencyBoard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Detail Drawer state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Canvas Heatmap Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = `/api/complaints?search=${searchTerm}`;
      if (selectedDistrict) query += `&district=${selectedDistrict}`;
      if (selectedDepartment) query += `&department=${selectedDepartment}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;
      
      const response = await fetch(query);
      const data = await response.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchTerm, selectedDistrict, selectedDepartment, selectedStatus]);

  // Load timeline for drawer
  const viewComplaintDetails = async (c: Complaint) => {
    setSelectedComplaint(c);
    setTimelineLoading(true);
    try {
      const response = await fetch(`/api/complaints/${c.id}`);
      const data = await response.json();
      if (data.timeline) {
        setTimeline(data.timeline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Draw Heatmap Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resizing for crisp display
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 360;

    // Clear background
    ctx.fillStyle = '#fdf8fd'; // off white purple
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#f3e8f3';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Coordinates mapping helper: Tamil Nadu Bounds roughly mapped onto local viewport
    // Districts approximate coordinates:
    // Chennai: (width - 60, 50)
    // Coimbatore: (60, height - 120)
    // Madurai: (width/2 - 20, height - 100)
    // Trichy: (width/2, height/2)
    // Salem: (width/2 - 40, height/3)
    const cities = [
      { name: 'Chennai', x: canvas.width - 80, y: 60, radius: 25 },
      { name: 'Coimbatore', x: 80, y: canvas.height - 100, radius: 25 },
      { name: 'Madurai', x: canvas.width / 2 - 30, y: canvas.height - 70, radius: 20 },
      { name: 'Trichy', x: canvas.width / 2 + 10, y: canvas.height / 2, radius: 20 },
      { name: 'Salem', x: canvas.width / 2 - 30, y: canvas.height / 3 + 10, radius: 20 }
    ];

    // Draw major district clusters references
    cities.forEach(city => {
      // Glow background
      const gradient = ctx.createRadialGradient(city.x, city.y, 2, city.x, city.y, city.radius * 2);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(city.x, city.y, city.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core point
      ctx.fillStyle = '#7c3aed'; // Deep purple
      ctx.beginPath();
      ctx.arc(city.x, city.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#4c1d95';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(city.name, city.x + 8, city.y + 4);
    });

    // Plot dynamic complaints coordinates relative to cities
    complaints.forEach((c, idx) => {
      let baseCity = cities.find(ct => ct.name.toLowerCase() === c.location.district.toLowerCase()) || cities[0];
      
      // Calculate a deterministic offset so they scatter cleanly
      const seed = c.id.charCodeAt(c.id.length - 1) + idx;
      const angle = (seed * 11) % (Math.PI * 2);
      const dist = (seed * 7) % 35 + 8;
      
      const x = baseCity.x + Math.cos(angle) * dist;
      const y = baseCity.y + Math.sin(angle) * dist;

      // Color based on status
      let color = '#ec4899'; // In progress / Assigned (fuchsia / pink)
      if (c.status === 'Resolved') {
        color = '#10b981'; // green
      } else if (c.status === 'Verification Pending') {
        color = '#f59e0b'; // orange
      }

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Concentric circles for hot spots (unresolved)
      if (c.status !== 'Resolved') {
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = color + '44'; // translucent
        ctx.stroke();
      }
    });

    // Draw Heatmap legend with dynamic measured width spacing to prevent overlap
    ctx.font = 'bold 9px sans-serif';
    const padding = 10;
    const itemGap = 10;
    const titleText = 'LEGEND:';
    const titleWidth = ctx.measureText(titleText).width;

    const states = [
      { name: 'Active', color: '#ec4899' },
      { name: 'Pending Verification', color: '#f59e0b' },
      { name: 'Resolved', color: '#10b981' }
    ];

    // Compute dynamic width needed for single-line
    let singleLineWidthNeeded = padding + titleWidth + 8;
    const measuredList = states.map((st, idx) => {
      ctx.font = 'bold 9px sans-serif';
      const textW = ctx.measureText(st.name).width;
      singleLineWidthNeeded += 8 + textW + (idx === states.length - 1 ? 0 : itemGap);
      return { ...st, textWidth: textW };
    });
    singleLineWidthNeeded += padding;

    const isMultiLine = canvas.width < (singleLineWidthNeeded + 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    
    if (isMultiLine) {
      // Draw 2-line height legend card
      const legendHeight = 44;
      const legendY = canvas.height - legendHeight - 10;
      const legendWidth = Math.min(290, canvas.width - 20);
      
      const pathExist = typeof ctx.roundRect === 'function';
      if (pathExist) {
        ctx.roundRect(10, legendY, legendWidth, legendHeight, 8);
      } else {
        ctx.rect(10, legendY, legendWidth, legendHeight);
      }
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Line 1: Title
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(titleText, 10 + padding, legendY + 16);

      // Line 2: Items
      let startX = 10 + padding;
      measuredList.forEach((st) => {
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(startX, legendY + 32, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4c1d95';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillText(st.name, startX + 8, legendY + 35);

        startX += 8 + st.textWidth + itemGap;
      });
    } else {
      // Draw single-line legend card
      const legendHeight = 26;
      const legendY = canvas.height - legendHeight - 10;
      
      const pathExist = typeof ctx.roundRect === 'function';
      if (pathExist) {
        ctx.roundRect(10, legendY, singleLineWidthNeeded, legendHeight, 8);
      } else {
        ctx.rect(10, legendY, singleLineWidthNeeded, legendHeight);
      }
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Title
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(titleText, 10 + padding, legendY + 16);

      // Items
      let startX = 10 + padding + titleWidth + 10;
      measuredList.forEach((st) => {
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(startX, legendY + 13, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4c1d95';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillText(st.name, startX + 8, legendY + 16);

        startX += 8 + st.textWidth + itemGap;
      });
    }

  }, [complaints]);

  // Sorting
  const getSortedComplaints = () => {
    const list = [...complaints];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    } else {
      return list.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    }
  };

  const sortedList = getSortedComplaints();

  // Helper calculation for "time since submission"
  const getTimeSince = (isoString: string) => {
    const submitted = new Date(isoString);
    const now = new Date("2026-06-17T01:25:34-07:00"); // Current system context time
    const diffMs = now.getTime() - submitted.getTime();
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (hrs <= 0) return "Just now";
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} days ago`;
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Verification Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'In Progress':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Assigned':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-purple-50/50 text-purple-600 border-purple-100';
    }
  };

  return (
    <div id="public-transparency-board" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: FILTERS, MAP, & COMPLAINTS LIST (8 cols) */}
      <div className="lg:col-span-8 space-y-6 text-left">
        
        {/* Search and Filters panel */}
        <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-purple-950 font-sans">Public Civic Registry Dashboard</h3>
              <p className="text-xs text-purple-500 font-sans">Full transparent tracking of active and closed civic incidents</p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-purple-600 font-bold font-sans whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-1.5 bg-purple-50/50 border border-purple-100 rounded-lg text-purple-900 font-semibold focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-300" />
              <input
                type="text"
                placeholder="Search by ID, keyword, road..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:outline-none focus:border-pink-300"
              />
            </div>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-900 font-medium focus:outline-none"
            >
              <option value="">All TN Districts</option>
              <option value="Chennai">Chennai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Madurai">Madurai</option>
              <option value="Trichy">Trichy</option>
              <option value="Salem">Salem</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs px-3 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-900 font-medium focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Municipal Corporation">Municipal Corporation</option>
              <option value="Water Board">Water Board</option>
              <option value="Electricity Board">Electricity Board</option>
              <option value="Highways Department">Highways Department</option>
              <option value="Police Department">Police Department</option>
            </select>
          </div>
        </div>

        {/* Heatmap Area */}
        <div id="interactive-canvas-map-card" className="bg-white rounded-3xl border border-purple-50 p-4 shadow-sm overflow-hidden text-center">
          <div className="flex items-center justify-between px-2 mb-3 text-left">
            <div>
              <h4 className="text-sm font-black text-purple-950 font-sans flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-purple-600" />
                <span>Geospatial Complaint Heatmap (Tamil Nadu)</span>
              </h4>
              <p className="text-[10px] text-purple-400 font-sans">Dynamic localized coordinates plotted in real time</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
              TAMIL NADU CLUSTERS
            </span>
          </div>

          <div className="relative bg-purple-50 border border-purple-100/40 rounded-2xl overflow-hidden shadow-inner flex justify-center">
            <canvas ref={canvasRef} className="max-w-full block" />
          </div>
        </div>

        {/* Complaints Grid List */}
        {loading ? (
          <div className="py-20 text-center text-purple-500 font-bold">Synchronizing public registry data...</div>
        ) : sortedList.length === 0 ? (
          <div className="bg-purple-50/50 border border-dashed border-purple-100 py-16 text-center rounded-3xl">
            <AlertCircle className="h-10 w-10 text-purple-300 mx-auto mb-2" />
            <p className="text-purple-950 font-black font-sans">No matching public complaints</p>
            <p className="text-xs text-purple-500">Try broadening your search keywords or clear location filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedList.map((c) => (
              <div 
                key={c.id} 
                onClick={() => viewComplaintDetails(c)}
                className={`group cursor-pointer bg-white rounded-2xl border ${
                  selectedComplaint?.id === c.id ? 'border-pink-500 shadow-md ring-1 ring-pink-500/10' : 'border-purple-100/50'
                } hover:border-purple-300 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">{c.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-sans font-black text-purple-950 group-hover:text-pink-600 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs text-purple-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-100/50 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-1.5 text-purple-800">
                    <MapPin className="h-3.5 w-3.5 text-pink-500" />
                    <span className="truncate">{c.location.district} District • {c.location.city}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-purple-500">
                    <span className="font-semibold text-purple-900">{c.department}</span>
                    <span className="font-mono">{getTimeSince(c.dateCreated)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAIL DRAWER (4 cols) */}
      <div className="lg:col-span-4 text-left">
        {selectedComplaint ? (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 sticky top-24 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-pink-600">{selectedComplaint.id}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-purple-950 font-sans tracking-tight mt-2">{selectedComplaint.title}</h3>
              <p className="mt-2 text-xs text-purple-700 leading-relaxed font-sans">{selectedComplaint.description}</p>
            </div>

            {/* Before Photo if any */}
            {selectedComplaint.beforePhotoUrl && (
              <div className="bg-purple-100/40 border border-purple-100 rounded-2xl overflow-hidden group">
                <span className="bg-purple-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg absolute z-10">BEFORE PHOTO</span>
                <img 
                  src={selectedComplaint.beforePhotoUrl} 
                  alt="Incident Condition" 
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* After Photo if any */}
            {selectedComplaint.afterPhotoUrl && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl overflow-hidden relative">
                <span className="bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg absolute z-10">AFTER RESOLUTION</span>
                <img 
                  src={selectedComplaint.afterPhotoUrl} 
                  alt="Resolved Condition" 
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Accountability Officer Assigned */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1.5">
              <span className="text-[10px] text-purple-500 block uppercase font-bold tracking-wider">Accountable Authority</span>
              <div className="flex justify-between font-semibold">
                <span>Assigned Dept:</span>
                <span className="text-purple-950 text-right">{selectedComplaint.department}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Active Officer:</span>
                <span className="text-purple-950 text-right">{selectedComplaint.assignedOfficerName || 'Awaiting assignment'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Location address:</span>
                <span className="text-purple-950 text-right max-w-[150px] truncate">{selectedComplaint.location.manualAddress}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black text-purple-950 font-sans uppercase tracking-wider flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Accountability Audit Log</span>
              </h4>

              {timelineLoading ? (
                <div className="text-purple-600 text-[11px] font-mono">Syncing log timeline...</div>
              ) : timeline.length === 0 ? (
                <p className="text-[11px] text-purple-400">No milestone details reported.</p>
              ) : (
                <div className="space-y-4 border-l border-purple-150 pl-3 relative">
                  {timeline.map((hist, hidx) => (
                    <div key={hist.id || hidx} className="relative pl-2.5">
                      {/* circle node */}
                      <span className="absolute -left-7 top-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                      
                      <div className="flex justify-between text-[10px] text-purple-400">
                        <span className="font-bold text-purpe-805">{hist.updatedBy} ({hist.updatedByRole})</span>
                        <span className="font-mono">{new Date(hist.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-purple-950 mt-0.5">{hist.remarks}</p>
                      <span className="bg-purple-100 text-purple-800 text-[9px] px-1 py-0.1 font-bold rounded-md block w-max mt-1 font-mono">{hist.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-purple-50/20 border border-purple-100 border-dashed rounded-3xl p-8 py-24 text-center sticky top-24">
            <Eye className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h4 className="text-base font-black text-purple-950 font-sans">Incidents Inspector</h4>
            <p className="text-xs text-purple-600 mt-2 max-w-sm mx-auto">
              Click any complaint card in the public registry to audit the assigned officer, timeline logs, and photographic validation records.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
