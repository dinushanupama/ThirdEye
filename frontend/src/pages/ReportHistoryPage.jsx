import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Eye, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const ReportHistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const response = await api.get('/reports/my-reports');
        setReports(response.data);
      } catch (err) {
        setError(true);
        // Premium SweetAlert Popup for errors
        Swal.fire({
          icon: 'error',
          title: 'Data Fetch Error',
          text: 'Failed to load your reports. Please try again.',
          confirmButtonColor: '#3b82f6',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  // Helper to color-code the status badges with translucent Shadcn style
  const getStatusStyles = (status) => {
    const COLORS = { 'Draft': '#9ca3af', 'Submitted': '#3b82f6', 'Needs Correction': '#f97316', 'Approved': '#22c55e' };
    const color = COLORS[status] || COLORS['Draft'];
    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}30`
    };
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading your reports...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load reports.</div>;

  // --- Client-Side Pagination Logic ---
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 transition-all duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Reports</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View your submission history and current drafts.</p>
        </div>
        <Link 
          to="/reports/new" 
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Report
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {reports.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-slate-700">
              <FileText className="w-8 h-8 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reports found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">You haven't created any weekly status reports yet. Click the button above to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Week Of</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {paginatedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">
                        {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {report.project?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors" 
                          style={getStatusStyles(report.status)}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 font-medium">
                        v{report.currentVersion || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(report.status === 'Draft' || report.status === 'Needs Correction') ? (
                          <Link to={`/reports/${report._id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-end font-semibold">
                            <Edit className="w-4 h-4 mr-1.5" /> Edit
                          </Link>
                        ) : (
                          <Link to={`/reports/${report._id}`} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center justify-end">
                            <Eye className="w-4 h-4 mr-1.5" /> View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, reports.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{reports.length}</span> results
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportHistoryPage;