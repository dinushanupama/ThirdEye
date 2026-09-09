import { useState, useEffect } from 'react';
import { AlertOctagon, Trophy, CheckSquare, Clock, Filter, Users } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const TeamInsightsView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Blockers');

  // Helper for SweetAlert theme
  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6'
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/all');
        const data = res.data;
        setReports(data);
        
        // Auto-select the most recent week if data exists
        if (data.length > 0) {
          const uniqueWeeks = [...new Set(data.map(r => r.weekStartDate))].sort((a, b) => new Date(b) - new Date(a));
          setSelectedWeek(uniqueWeeks[0]);
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to load insights',
          text: 'Could not fetch report data for the comparison view.',
          ...getSwalTheme()
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 animate-pulse">Loading team insights...</div>;

  // 1. Get unique weeks for the dropdown filter (sorted newest to oldest)
  const availableWeeks = [...new Set(reports.map(r => r.weekStartDate))].sort((a, b) => new Date(b) - new Date(a));

  // 2. Filter reports to ONLY include the selected week
  const activeReports = reports.filter(r => r.weekStartDate === selectedWeek);

  const categories = [
    { id: 'Blockers', icon: AlertOctagon, color: 'text-red-500' },
    { id: 'Achievements', icon: Trophy, color: 'text-yellow-500' },
    { id: 'Tasks', icon: CheckSquare, color: 'text-blue-500' },
    { id: 'Plans', icon: Clock, color: 'text-indigo-500' }
  ];

  const inputBaseClasses = "text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm outline-none";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 transition-all duration-200">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" /> Cross-Team Insights
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Compare team metrics and updates side-by-side.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                className={inputBaseClasses}
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {availableWeeks.map(week => {
                  const report = reports.find(r => r.weekStartDate === week);
                  return (
                    <option key={week} value={week}>
                      Week of {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <select 
              className={inputBaseClasses}
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => <option key={c.id} value={c.id}>Show: {c.id}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeReports.map(report => (
          <div key={report._id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-200">
            
            {/* User Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{report.user?.name}</h3>
              <span className="text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700">
                {report.project?.name || 'No Project'}
              </span>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 bg-white dark:bg-slate-900">
              
              {/* BLOCKERS VIEW */}
              {selectedCategory === 'Blockers' && (
                <ul className="space-y-3">
                  {report.blockers?.length > 0 ? report.blockers.map((b, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className={`w-2 h-2 mt-1.5 rounded-full mr-2.5 flex-shrink-0 ${b.isKeyIssue ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-600'}`}></span>
                      <span className={`text-gray-700 dark:text-slate-300 ${b.isKeyIssue ? 'font-medium text-red-700 dark:text-red-400' : ''}`}>{b.description}</span>
                    </li>
                  )) : <p className="text-sm text-gray-500 dark:text-slate-500 italic">No blockers.</p>}
                </ul>
              )}

              {/* ACHIEVEMENTS VIEW */}
              {selectedCategory === 'Achievements' && (
                <ul className="space-y-3">
                  {report.achievements?.length > 0 ? report.achievements.map((a, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className={`w-2 h-2 mt-1.5 rounded-full mr-2.5 flex-shrink-0 ${a.isKeyAchievement ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-slate-600'}`}></span>
                      <span className={`text-gray-700 dark:text-slate-300 ${a.isKeyAchievement ? 'font-medium' : ''}`}>{a.description}</span>
                    </li>
                  )) : <p className="text-sm text-gray-500 dark:text-slate-500 italic">No achievements reported.</p>}
                </ul>
              )}

              {/* TASKS VIEW */}
              {selectedCategory === 'Tasks' && (
                <div className="space-y-3">
                  {report.tasks?.length > 0 ? report.tasks.map((t, i) => (
                    <div key={i} className="text-sm border-b border-gray-100 dark:border-slate-800 pb-2 last:border-0">
                      <p className="font-medium text-gray-800 dark:text-slate-200 truncate">{t.taskName}</p>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>{t.status}</span>
                        <span>{t.spentHours} hrs</span>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-500 dark:text-slate-500 italic">No tasks.</p>}
                </div>
              )}

              {/* PLANS VIEW */}
              {selectedCategory === 'Plans' && (
                <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                  {report.plannedNextWeek || <span className="italic text-gray-500 dark:text-slate-500">None specified.</span>}
                </p>
              )}

            </div>
          </div>
        ))}

        {activeReports.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
            <p className="text-gray-500 dark:text-slate-400">No reports found for this week.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamInsightsView;