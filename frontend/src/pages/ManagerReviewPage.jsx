import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, ClipboardList } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2'; // <-- Imported SweetAlert2

const ManagerReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Review state
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        if (res.data.status !== 'Submitted') {
          setError(true);
          Swal.fire({
            icon: 'info',
            title: 'Not Reviewable',
            text: `This report is currently marked as ${res.data.status} and cannot be reviewed.`,
            ...getSwalTheme()
          }).then(() => navigate('/dashboard'));
          return;
        }
        
        setReport(res.data);
      } catch (err) {
        setError(true);
        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: 'Failed to load report details for review.',
          ...getSwalTheme()
        }).then(() => navigate('/dashboard'));
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleReviewAction = async (action) => {
    // Validate comment if requesting changes
    if (action === 'Needs Correction' && !comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Comment Required',
        text: 'Please provide a comment explaining what needs correction before returning the report.',
        ...getSwalTheme()
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/reports/${id}/review`, { action, comment });
      
      // Premium Success Notification
      await Swal.fire({
        icon: 'success',
        title: action === 'Approved' ? 'Report Approved' : 'Changes Requested',
        text: action === 'Approved' ? 'The report has been successfully approved.' : 'The report has been sent back for corrections.',
        timer: 1500,
        showConfirmButton: false,
        ...getSwalTheme()
      });
      
      navigate('/dashboard');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Review Submission Failed',
        text: err.response?.data?.message || 'Failed to submit review',
        ...getSwalTheme()
      });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading report context...</div>;
  if (error || !report) return null; // Handled by SweetAlert

  const inputBaseClasses = "w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg p-3 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="max-w-5xl mx-auto pb-12 transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Review Report: {report.user?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Week of {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Manager Action Panel */}
      <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden transition-colors duration-200">
        {/* Subtle background tint for the action panel */}
        <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 pointer-events-none"></div>
        
        <div className="relative">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Manager Review Decision
          </h2>
          
          <textarea
            className={inputBaseClasses}
            rows={4}
            placeholder="Leave a comment for the team member (Required if requesting changes)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-5">
            <button
              onClick={() => handleReviewAction('Approved')}
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 font-medium text-sm shadow-sm hover:shadow"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Approve Report
            </button>
            <button
              onClick={() => handleReviewAction('Needs Correction')}
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center px-5 py-2.5 bg-white dark:bg-slate-900 border border-orange-500 text-orange-600 dark:text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all disabled:opacity-50 font-medium text-sm shadow-sm"
            >
              <XCircle className="w-4 h-4 mr-2" /> Request Changes
            </button>
          </div>
        </div>
      </div>

      {/* Report Content Preview (Read-Only) */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-200 dark:border-slate-800 pb-4">
          <ClipboardList className="w-5 h-5 mr-2 text-gray-500 dark:text-slate-400" />
          Report Contents Snapshot
        </h3>
        
        {/* Tasks View */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Tasks Completed</h4>
          <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {report.tasks?.length > 0 ? report.tasks.map((task, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-slate-800 last:border-0 text-sm">
                <span className="font-medium text-gray-800 dark:text-slate-300">
                  {task.taskName} 
                  <span className="text-gray-400 dark:text-slate-500 font-normal ml-2 text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">{task.status}</span>
                </span>
                <span className="text-gray-600 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-slate-700">
                  {task.spentHours} <span className="text-gray-400 font-normal">hrs</span>
                </span>
              </div>
            )) : (
              <div className="p-4 text-sm text-gray-500 dark:text-slate-400 italic text-center">No tasks recorded.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blockers View */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Blockers</h4>
            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 h-full">
              {report.blockers?.length > 0 ? (
                <ul className="space-y-3">
                  {report.blockers.map((b, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className={`w-2 h-2 mt-1.5 rounded-full mr-2.5 flex-shrink-0 ${b.isKeyIssue ? 'bg-red-500' : 'bg-gray-400 dark:bg-slate-600'}`}></span>
                      <span className={`flex-1 ${b.isKeyIssue ? 'font-medium text-gray-900 dark:text-slate-200' : 'text-gray-700 dark:text-slate-400'}`}>
                        {b.description}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-500 italic">No blockers reported.</p>
              )}
            </div>
          </div>

          {/* Next Week View */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Planned Next Week</h4>
            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 h-full">
              <p className="text-sm text-gray-700 dark:text-slate-400 whitespace-pre-wrap">
                {report.plannedNextWeek || <span className="italic text-gray-500 dark:text-slate-500">None specified.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReviewPage;