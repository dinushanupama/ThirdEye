import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, AlertCircle, CheckCircle, FileText, Filter, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

const TeamDashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [projectCount, setProjectCount] = useState(0); // New state for project count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch both reports and projects concurrently
        const [reportsRes, projectsRes] = await Promise.all([
          api.get('/reports/all'),
          api.get('/projects')
        ]);
        setReports(reportsRes.data);
        setProjectCount(projectsRes.data.length);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- Reset Pagination when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, memberFilter, projectFilter]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // --- Derived Metrics ---
  const totalReports = reports.length;
  const needsCorrectionCount = reports.filter(r => r.status === 'Needs Correction').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const totalBlockers = reports.reduce((total, r) => total + (r.blockers?.length || 0), 0);

  // Extract unique members and projects dynamically from reports for the dropdowns
  const uniqueMembers = [...new Set(reports.map(r => r.user?.name).filter(Boolean))];
  const uniqueProjects = [...new Set(reports.map(r => r.project?.name).filter(Boolean))];

  // --- Apply Filters ---
  const filteredReports = reports.filter(report => {
    const matchStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchMember = memberFilter === 'All' || report.user?.name === memberFilter;
    const matchProject = projectFilter === 'All' || report.project?.name === projectFilter;
    return matchStatus && matchMember && matchProject;
  });

  // --- Apply Client-Side Pagination (No extra DB calls!) ---
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // --- Chart Data Processing ---
  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  const COLORS = { 'Draft': '#9ca3af', 'Submitted': '#3b82f6', 'Needs Correction': '#f97316', 'Approved': '#22c55e' };

  const hoursData = [
    { name: 'Dev', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.development || 0), 0) },
    { name: 'Test', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.testing || 0), 0) },
    { name: 'Meet', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.meetings || 0), 0) },
    { name: 'Docs', hours: reports.reduce((sum, r) => sum + (r.hoursBreakdown?.documentation || 0), 0) }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of team activity, workloads, and blockers.</p>
      </div>

      {/* Summary Metrics (Now 5 Columns to fit Project Count) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600"><FileText className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Reports</p>
            <p className="text-xl font-bold text-gray-900">{totalReports}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600"><FolderOpen className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Projects</p>
            <p className="text-xl font-bold text-gray-900">{projectCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600"><CheckCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Approved</p>
            <p className="text-xl font-bold text-gray-900">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Corrections</p>
            <p className="text-xl font-bold text-gray-900">{needsCorrectionCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-100 text-red-600"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Blockers</p>
            <p className="text-xl font-bold text-gray-900">{totalBlockers}</p>
          </div>
        </div>
      </div>

      {/* Visual Insights Charts (Code remains identical to previous version) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... Keep the PieChart and BarChart exactly the same ... */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000'} />)}
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

      {/* Filterable & Paginated Feed */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 space-y-3 md:space-y-0">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" /> Filter Reports
          </h3>
          <div className="flex flex-wrap gap-2">
            <select className="text-sm border-gray-300 rounded-md border p-1.5" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
              <option value="All">All Members</option>
              {uniqueMembers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="text-sm border-gray-300 rounded-md border p-1.5" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="All">All Projects</option>
              {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="text-sm border-gray-300 rounded-md border p-1.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
            {paginatedReports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.user?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{report.project?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full`} style={{ backgroundColor: `${COLORS[report.status]}20`, color: COLORS[report.status] }}>
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
            {paginatedReports.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No reports found matching these filters.</td></tr>
            )}
          </tbody>
        </table>

        {/* Client-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of <span className="font-medium">{filteredReports.length}</span> results
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
      </div>
    </div>
  );
};

export default TeamDashboardPage;