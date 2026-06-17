import React, { useState, useEffect } from 'react';
import { LeaderboardMetric } from '../types';
import { Award, ShieldAlert, Sparkles, Zap, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<LeaderboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/departments/leaderboard');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          badge: '🥇 Gold Class',
          icon: '🏆'
        };
      case 2:
        return {
          bg: 'bg-slate-50 border-slate-300 text-slate-800',
          badge: '🥈 Silver Class',
          icon: '🥈'
        };
      case 3:
        return {
          bg: 'bg-orange-50 border-orange-300 text-orange-850',
          badge: '🥉 Bronze Class',
          icon: '🥉'
        };
      default:
        return {
          bg: 'bg-purple-50/50 border-purple-100 text-purple-800',
          badge: '🎖️ Ranked',
          icon: '⭐'
        };
    }
  };

  return (
    <div id="accountability-leaderboard-container" className="space-y-6">
      {/* Overview Block */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-pink-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
          <Award className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-pink-500 text-white text-[10px] sm:text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase">
            LIVE METRICS DEMOCRACY
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-3 font-sans tracking-tight">Tamil Nadu Department Accountability Leaderboard</h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed font-sans">
            Departments are ranked live based on their performance using our formula: <strong className="text-pink-300">Highest Resolution Rate</strong> → <strong className="text-pink-300">Lowest Pending Workloads</strong> → <strong className="text-pink-300">Fastest Resolution Time</strong>. Public visibility promotes collaborative competitive performance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-left">
          <div>
            <span className="text-[10px] text-purple-200 uppercase font-mono">Best Resolved</span>
            <p className="text-sm sm:text-lg font-bold font-sans">Municipal Corp.</p>
          </div>
          <div>
            <span className="text-[10px] text-purple-200 uppercase font-mono">Fastest Pace</span>
            <p className="text-sm sm:text-lg font-bold font-sans">Electricity Board</p>
          </div>
          <div>
            <span className="text-[10px] text-purple-200 uppercase font-mono">Average Resolution</span>
            <p className="text-sm sm:text-lg font-bold font-sans">~30 Hours</p>
          </div>
          <div>
            <button 
              onClick={fetchLeaderboard}
              className="flex items-center space-x-1 border border-white/20 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold font-sans py-2 px-4 rounded-xl cursor-copy self-end"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Ranks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Chart Grid */}
      <div className="bg-white rounded-3xl border border-purple-50 p-6 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-purple-950 font-sans flex items-center space-x-2">
            <BarChart2 className="h-5 w-5 text-purple-700" />
            <span>Public Performance Audit</span>
          </h3>
          <span className="text-xs text-purple-500 font-mono">Rank Update Frequency: Instant</span>
        </div>

        {isLoading && metrics.length === 0 ? (
          <div className="py-12 text-center text-purple-500 font-medium">Computing live leaderboard scores...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-purple-100 text-[11px] font-bold text-purple-900 uppercase bg-purple-50/50">
                <th className="py-3 px-4 rounded-tl-xl text-center w-16">Rank</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4 text-center">Total Complaints</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4 text-center">Avg Response Pace</th>
                <th className="py-3 px-4 text-center pr-4 rounded-tr-xl">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {metrics.map((row) => {
                const badgeInfo = getRankBadge(row.rank);
                return (
                  <tr key={row.departmentName} className="hover:bg-purple-50/20 transition-all">
                    {/* Rank cell */}
                    <td className="py-4 px-4 text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mx-auto ${
                        row.rank <= 3 ? badgeInfo.bg + ' border' : 'bg-purple-50 text-purple-900'
                      }`}>
                        {row.rank}
                      </div>
                    </td>

                    {/* Dept name */}
                    <td className="py-4 px-4 font-sans font-black text-purple-950">
                      <div className="flex flex-col">
                        <span>{row.departmentName}</span>
                        <span className={`text-[10px] w-max px-2 py-0.5 rounded-full font-sans font-bold mt-1 ${badgeInfo.bg} border`}>
                          {badgeInfo.badge}
                        </span>
                      </div>
                    </td>

                    {/* Total complaints */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-purple-900">
                      {row.totalComplaints}
                    </td>

                    {/* Resolved complaints */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block bg-pink-50 text-pink-700 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                        {row.resolvedComplaints}
                      </span>
                    </td>

                    {/* Pending complaints */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${
                        row.pendingComplaints > 0 ? 'bg-amber-50 text-amber-700' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {row.pendingComplaints}
                      </span>
                    </td>

                    {/* Avg resolution time */}
                    <td className="py-4 px-4 text-center text-sm font-sans font-semibold text-purple-700">
                      <div className="flex items-center justify-center space-x-1">
                        <Zap className="h-3.5 w-3.5 text-pink-500" />
                        <span>{row.avgResolutionTimeHours} Hrs</span>
                      </div>
                    </td>

                    {/* Resolution Rate */}
                    <td className="py-4 px-4 text-center pr-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-24 bg-purple-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full" 
                            style={{ width: `${row.resolutionRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-purple-950 w-8 text-right">
                          {row.resolutionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly Award Banner */}
      <div className="bg-gradient-to-tr from-pink-50 via-purple-50 to-pink-50/50 rounded-3xl p-6 border border-pink-200 flex flex-col sm:flex-row items-center justify-between text-left">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-2xl border border-pink-300 flex items-center justify-center text-2xl shadow-sm">
            🏆
          </div>
          <div>
            <h4 className="text-purple-950 font-black font-sans text-lg">Monthly Best Department Award (June 2026)</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-purple-700 font-bold">Winner:</span>
              <span className="bg-purple-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md font-sans">
                ELECTRICITY BOARD (TNEB)
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block bg-pink-100 border border-pink-200 text-pink-700 font-black text-xs px-4 py-2 rounded-2xl font-mono tracking-wider">
            SCORE: 96.8 / 100
          </div>
        </div>
      </div>
    </div>
  );
};
