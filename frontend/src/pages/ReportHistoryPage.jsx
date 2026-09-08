import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Eye, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

const ReportHistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const response = await api.get('/reports/my-reports');
        setReports(response.data);
      } catch (err) {
        setError('Failed to load your reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  // Helper to color-code the status badges
  const getStatusBadge = (status) => {
    const styles = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Needs Correction': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800'
    };
    return `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles['Draft']}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  // --- Client-Side Pagination Logic ---
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View your submission history and current drafts.</p>
        </div>
        <Link 
          to="/reports/new" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Report
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>You haven't created any reports yet.</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week Of</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Use paginatedReports instead of reports */}
                {paginatedReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.project?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      v{report.currentVersion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(report.status === 'Draft' || report.status === 'Needs Correction') ? (
                        <Link to={`/reports/${report._id}/edit`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Link>
                      ) : (
                        <Link to={`/reports/${report._id}`} className="text-gray-600 hover:text-gray-900 flex items-center justify-end">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, reports.length)}</span> of <span className="font-medium">{reports.length}</span> results
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md flex items-center disabled:opacity-50 hover:bg-gray-50 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md flex items-center disabled:opacity-50 hover:bg-gray-50 text-sm"
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