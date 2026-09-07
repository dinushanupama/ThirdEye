import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import api from '../api/axiosConfig';

const ManagerReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review state
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data);
        if (res.data.status !== 'Submitted') {
          setError(`This report is currently marked as ${res.data.status} and cannot be reviewed.`);
        }
      } catch (err) {
        setError('Failed to load report details.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleReviewAction = async (action) => {
    if (action === 'Needs Correction' && !comment.trim()) {
      alert('Please provide a comment explaining what needs correction.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/reports/${id}/review`, { action, comment });
      navigate('/dashboard'); // Redirect to dashboard after successful review
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading report...</div>;
  if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Report: {report.user?.name}</h1>
          <p className="text-sm text-gray-500">
            Week of {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>
      ) : (
        <>
          {/* Manager Action Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Manager Review Decision
            </h2>
            
            <textarea
              className="w-full border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500 mb-4 border shadow-sm"
              rows={3}
              placeholder="Leave a general comment for the team member (required if requesting changes)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex space-x-4">
              <button
                onClick={() => handleReviewAction('Approved')}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve Report
              </button>
              <button
                onClick={() => handleReviewAction('Needs Correction')}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 font-medium text-sm"
              >
                <XCircle className="w-4 h-4 mr-2" /> Request Changes
              </button>
            </div>
          </div>

          {/* Report Content Preview (Read-Only) */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6 opacity-90">
            <h3 className="text-lg font-medium border-b pb-2">Report Contents</h3>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Tasks</h4>
              {report.tasks?.map((task, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="font-medium">{task.taskName} <span className="text-gray-400 font-normal">({task.status})</span></span>
                  <span className="text-gray-500">{task.spentHours} hrs spent</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Blockers</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {report.blockers?.length > 0 ? report.blockers.map((b, i) => <li key={i}>{b.description}</li>) : <li>None</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Planned Next Week</h4>
                <p className="text-sm text-gray-600">{report.plannedNextWeek || 'None specified'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerReviewPage;