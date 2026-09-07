import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, AlertCircle, CheckCircle, FileText, Filter } from 'lucide-react';
import api from '../api/axiosConfig';

const TeamDashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const res = await api.get('/reports/all');
        setReports(res.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // --- Derived Metrics ---
  const totalReports = reports.length;
  const needsCorrectionCount = reports.filter(r => r.status === 'Needs Correction').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  
  // Calculate total open blockers across all submitted/approved/needs correction reports
  const totalBlockers = reports.reduce((total, report) => {
    return total + (report.blockers?.length || 0);
  }, 0);

  // --- Chart Data Processing ---
  // 1. Status Distribution Data
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  const COLORS = { 'Draft': '#9ca3af', 'Submitted': '#3b82f6', 'Needs Correction': '#f97316', 'Approved': '#22c55e' };

  // 2. Time Spent by Task Type Data
  const hoursData = [
    { name: 'Development', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.development || 0), 0) },
    { name: 'Testing', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.testing || 0), 0) },
    { name: 'Meetings', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.meetings || 0), 0) },
    { name: 'Documentation', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.documentation || 0), 0) }
  ];

  // Apply filters to the table feed
  const filteredReports = statusFilter === 'All' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of team activity, workloads, and blockers.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Needs Correction</p>
            <p className="text-2xl font-bold text-gray-900">{needsCorrectionCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-100 text-red-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Blockers</p>
            <p className="text-2xl font-bold text-gray-900">{totalBlockers}</p>
          </div>
        </div>
      </div>

      {/* Visual Insights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Time Spent (Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports / Activity Feed */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports Feed</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 pl-2 pr-8 border"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Needs Correction">Needs Correction</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.user?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{report.project?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}
                    style={{ backgroundColor: `${COLORS[report.status]}20`, color: COLORS[report.status] }}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {report.status === 'Submitted' ? (
                    <Link to={`/review/${report._id}`} className="text-blue-600 hover:text-blue-900">Review</Link>
                  ) : (
                    <Link to={`/reports/${report._id}`} className="text-gray-600 hover:text-gray-900">View</Link>
                  )}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No reports found matching this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamDashboardPage;