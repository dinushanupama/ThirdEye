import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, AlertCircle, CheckCircle, FileText, Filter, FolderOpen, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const TeamDashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reportsRes, projectsRes] = await Promise.all([
          api.get('/reports/all'),
          api.get('/projects')
        ]);
        setReports(reportsRes.data);
        setProjectCount(projectsRes.data.length);
      } catch (err) {
        setError(true);
        Swal.fire({
          icon: 'error',
          title: 'Connection Failed',
          text: 'Unable to load the team dashboard data.',
          confirmButtonColor: '#3b82f6',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- Reset Pagination when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, memberFilter, projectFilter, startDate, endDate]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading dashboard metrics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Dashboard is currently unavailable.</div>;

  // --- Derived Metrics ---
  const totalReports = reports.length;
  const needsCorrectionCount = reports.filter(r => r.status === 'Needs Correction').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const totalBlockers = reports.reduce((total, r) => total + (r.blockers?.length || 0), 0);

  // Extract unique members and projects
  const uniqueMembers = [...new Set(reports.map(r => r.user?.name).filter(Boolean))];
  const uniqueProjects = [...new Set(reports.map(r => r.project?.name).filter(Boolean))];

  // --- Apply Filters ---
  const filteredReports = reports.filter(report => {
    const matchStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchMember = memberFilter === 'All' || report.user?.name === memberFilter;
    const matchProject = projectFilter === 'All' || report.project?.name === projectFilter;
    
    // Date Filtering Logic
    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && new Date(report.weekStartDate) >= new Date(startDate);
    }
    if (endDate) {
      matchDate = matchDate && new Date(report.weekEndDate) <= new Date(endDate);
    }

    return matchStatus && matchMember && matchProject && matchDate;
  });

  // --- Apply Client-Side Pagination ---
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

  const customTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const inputBaseClasses = "text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm outline-none";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 transition-all duration-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Overview of team activity, workloads, and blockers.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Reports', value: totalReports, icon: FileText, color: 'blue' },
          { title: 'Projects', value: projectCount, icon: FolderOpen, color: 'indigo' },
          { title: 'Approved', value: approvedCount, icon: CheckCircle, color: 'green' },
          { title: 'Corrections', value: needsCorrectionCount, icon: AlertCircle, color: 'orange' },
          { title: 'Blockers', value: totalBlockers, icon: Users, color: 'red' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center space-x-4 transition-colors duration-200 hover:shadow-md">
            <div className={`p-3 rounded-full bg-${metric.color}-100 dark:bg-${metric.color}-900/30 text-${metric.color}-600 dark:text-${metric.color}-400`}>
              <metric.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Insights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />)}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Time Spent (Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} dx={-10} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={customTooltipStyle} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filterable & Paginated Feed */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-gray-50/50 dark:bg-slate-900/50 space-y-4 xl:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-400" /> Filter Reports
          </h3>
          
          <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full xl:w-auto">
            {/* Date Range Filters */}
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400 ml-2" />
              <input 
                type="date" 
                className="text-sm bg-transparent border-none text-gray-900 dark:text-slate-200 focus:ring-0 dark:[color-scheme:dark] p-1.5 outline-none" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
              />
              <span className="text-gray-400 dark:text-slate-500 text-sm">to</span>
              <input 
                type="date" 
                className="text-sm bg-transparent border-none text-gray-900 dark:text-slate-200 focus:ring-0 dark:[color-scheme:dark] p-1.5 outline-none" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { state: memberFilter, setter: setMemberFilter, defaultOption: 'All Members', options: uniqueMembers },
                { state: projectFilter, setter: setProjectFilter, defaultOption: 'All Projects', options: uniqueProjects },
                { state: statusFilter, setter: setStatusFilter, defaultOption: 'All Statuses', options: ['Submitted', 'Needs Correction', 'Approved'] }
              ].map((filter, i) => (
                <select 
                  key={i}
                  className={`${inputBaseClasses} pr-8`}
                  value={filter.state} 
                  onChange={(e) => filter.setter(e.target.value)}
                >
                  <option value="All">{filter.defaultOption}</option>
                  {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ))}
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Week Of</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {paginatedReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{report.user?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{report.project?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors" 
                      style={{ 
                        backgroundColor: `${COLORS[report.status]}15`, 
                        color: COLORS[report.status],
                        borderColor: `${COLORS[report.status]}30`
                      }}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {report.status === 'Submitted' ? (
                      <Link to={`/review/${report._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">Review</Link>
                    ) : (
                      <Link to={`/reports/${report._id}`} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200">View</Link>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedReports.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400 italic">No reports found matching these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Client-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredReports.length}</span> results
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
      </div>
    </div>
  );
};

export default TeamDashboardPage;