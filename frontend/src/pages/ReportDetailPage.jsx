import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertOctagon, Clock, FileText } from 'lucide-react';
import api from '../api/axiosConfig';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        setError('Failed to load report details. You may not have permission to view this.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Needs Correction': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800'
    };
    return `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${styles[status] || styles['Draft']}`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading report details...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-md m-6">{error}</div>;
  if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Report</h1>
          <span className={getStatusBadge(report.status)}>{report.status}</span>
        </div>
        
        {/* If a manager is viewing a submitted report, provide a quick link to review it */}
        {report.status === 'Submitted' && (
           <Link to={`/review/${report._id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
             Review Report
           </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Meta Information Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Author</p>
              <p className="text-base font-semibold text-gray-900">{report.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Project</p>
              <p className="text-base font-semibold text-gray-900">{report.project?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Week Of</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Version</p>
              <p className="text-base font-semibold text-gray-900">v{report.currentVersion}</p>
            </div>
          </div>
          
          {report.latestReviewComment && (
            <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-md">
              <p className="text-sm font-medium text-orange-800">Latest Manager Comment:</p>
              <p className="text-sm text-orange-700 mt-1">{report.latestReviewComment}</p>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Tasks Overview
            </h3>
          </div>
          {report.tasks && report.tasks.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hours (Plan / Spent)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.tasks.map((task, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.taskName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{task.plannedHours} / {task.spentHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-sm text-gray-500">No tasks reported.</div>
          )}
        </div>

        {/* Two-Column Grid for Blockers and Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blockers */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <AlertOctagon className="w-5 h-5 mr-2 text-red-500" />
              Blockers & Challenges
            </h3>
            {report.blockers && report.blockers.length > 0 ? (
              <ul className="space-y-3">
                {report.blockers.map((blocker, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`w-2 h-2 mt-2 rounded-full mr-3 flex-shrink-0 ${blocker.isKeyIssue ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    <div>
                      <p className={`text-sm ${blocker.isKeyIssue ? 'font-semibold text-red-700' : 'text-gray-700'}`}>
                        {blocker.description}
                      </p>
                      {blocker.isKeyIssue && <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Key Issue</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No blockers reported.</p>
            )}
          </div>

          {/* Planned Next Week */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Planned for Next Week
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {report.plannedNextWeek || <span className="text-gray-500 italic">No plans detailed.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;