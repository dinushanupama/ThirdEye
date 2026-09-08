import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertOctagon, Clock, FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2'; // <-- Imported SweetAlert2

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Helper for SweetAlert theme
  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6'
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        setError(true);
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Failed to load report details. You may not have permission to view this.',
          ...getSwalTheme()
        }).then(() => {
          navigate(-1); // Send them back to where they came from
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  // Translucent Shadcn-style badges
  const getStatusStyles = (status) => {
    const COLORS = { 'Draft': '#9ca3af', 'Submitted': '#3b82f6', 'Needs Correction': '#f97316', 'Approved': '#22c55e' };
    const color = COLORS[status] || COLORS['Draft'];
    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}30`
    };
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading report details...</div>;
  if (error || !report) return null; // SweetAlert handles the error UI and redirects

  return (
    <div className="max-w-5xl mx-auto pb-12 transition-all duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Weekly Report</h1>
          <span 
            className="px-3 py-1 text-xs font-semibold rounded-full border transition-colors hidden sm:inline-block" 
            style={getStatusStyles(report.status)}
          >
            {report.status}
          </span>
        </div>
        
        {/* Mobile status badge */}
        <span 
          className="px-3 py-1 text-xs font-semibold rounded-full border transition-colors sm:hidden" 
          style={getStatusStyles(report.status)}
        >
          {report.status}
        </span>
        
        {/* Manager Review Action Link */}
        {report.status === 'Submitted' && (
           <Link 
            to={`/review/${report._id}`} 
            className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm font-medium hover:bg-blue-700 hover:shadow transition-all text-sm"
           >
             Review Report
           </Link>
        )}
      </div>

      <div className="space-y-6">
        
        {/* Meta Information Card */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Author</p>
              <p className="text-base font-medium text-gray-900 dark:text-slate-100">{report.user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Project</p>
              <p className="text-base font-medium text-gray-900 dark:text-slate-100">{report.project?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Week Of</p>
              <p className="text-base font-medium text-gray-900 dark:text-slate-100">
                {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Version</p>
              <p className="text-base font-medium text-gray-900 dark:text-slate-100">v{report.currentVersion}</p>
            </div>
          </div>
          
          {report.latestReviewComment && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-lg shadow-sm">
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 flex items-center mb-1">
                <AlertOctagon className="w-4 h-4 mr-1.5" /> Latest Manager Comment
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-200/80">{report.latestReviewComment}</p>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Tasks Overview
            </h3>
          </div>
          {report.tasks && report.tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                <thead className="bg-white dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Hours (Plan / Spent)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {report.tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{task.taskName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{task.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{task.priority}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200 text-right">
                        {task.plannedHours} <span className="text-gray-400 dark:text-slate-500 font-normal mx-1">/</span> {task.spentHours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-400 italic">No tasks reported for this week.</div>
          )}
        </div>

        {/* Two-Column Grid for Blockers and Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Blockers */}
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 flex flex-col transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <AlertOctagon className="w-5 h-5 mr-2 text-red-500" />
              Blockers & Challenges
            </h3>
            {report.blockers && report.blockers.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {report.blockers.map((blocker, index) => (
                  <li key={index} className="flex items-start bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
                    <span className={`w-2.5 h-2.5 mt-1.5 rounded-full mr-3 flex-shrink-0 shadow-sm ${blocker.isKeyIssue ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-500'}`}></span>
                    <div className="flex-1">
                      <p className={`text-sm ${blocker.isKeyIssue ? 'font-medium text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-slate-300'}`}>
                        {blocker.description}
                      </p>
                      {blocker.isKeyIssue && <span className="mt-1.5 inline-block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">Key Issue</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-slate-400">No blockers reported.</p>
              </div>
            )}
          </div>

          {/* Planned Next Week */}
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 flex flex-col transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Planned for Next Week
            </h3>
            <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-100 dark:border-slate-700/50 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {report.plannedNextWeek || <span className="text-gray-500 dark:text-slate-500 italic">No plans detailed for next week.</span>}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;