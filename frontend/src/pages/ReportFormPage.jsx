import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2'; // <-- Imported SweetAlert2

const ReportFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If there's an ID, we are in Edit Mode
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [projects, setProjects] = useState([]);
  
  // The master state object matching our backend schema
  const [formData, setFormData] = useState({
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    tasks: [],
    blockers: [],
    achievements: [],
    plannedNextWeek: '',
    notes: ''
  });

  const [reviewComment, setReviewComment] = useState('');

  // Helper for SweetAlert theme
  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6'
  });

  useEffect(() => {
    // 1. Fetch available projects for the dropdown
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        Swal.fire({
          icon: 'warning',
          title: 'Project Load Failed',
          text: 'Could not load available projects.',
          ...getSwalTheme()
        });
      }
    };

    // 2. If editing, fetch the existing report
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        const report = res.data;
        
        // Format dates for HTML date inputs (YYYY-MM-DD)
        const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';
        
        setFormData({
          projectId: report.project?._id || report.project,
          weekStartDate: formatDate(report.weekStartDate),
          weekEndDate: formatDate(report.weekEndDate),
          tasks: report.tasks || [],
          blockers: report.blockers || [],
          achievements: report.achievements || [],
          plannedNextWeek: report.plannedNextWeek || '',
          notes: report.notes || ''
        });
        
        if (report.status === 'Needs Correction') {
          setReviewComment(report.latestReviewComment);
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Data Load Error',
          text: 'Failed to load the report data.',
          ...getSwalTheme()
        }).then(() => navigate('/my-reports'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    if (isEditMode) fetchReport();
  }, [id, isEditMode, navigate]);

  // --- Dynamic Array Handlers ---
  const handleArrayChange = (field, index, key, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index][key] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addItem = (field, defaultObj) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultObj] });
  };

  const removeItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  // --- Submission Handler ---
  const handleSubmit = async (status) => {
    // Basic validation
    if (!formData.projectId || !formData.weekStartDate || !formData.weekEndDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please select a project and specify the week dates before saving.',
        ...getSwalTheme()
      });
      return;
    }

    try {
      const payload = { ...formData, status };
      
      if (isEditMode) {
        await api.put(`/reports/${id}`, payload);
      } else {
        await api.post('/reports', payload);
      }

      // Premium Success Notification
      await Swal.fire({
        icon: 'success',
        title: status === 'Draft' ? 'Draft Saved' : 'Report Submitted',
        text: status === 'Draft' ? 'Your progress has been saved.' : 'Your report has been sent to your manager.',
        timer: 1500,
        showConfirmButton: false,
        ...getSwalTheme()
      });

      navigate('/my-reports');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'Failed to save the report.',
        ...getSwalTheme()
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 animate-pulse h-[60vh] flex items-center justify-center">Loading form data...</div>;

  // Shared Shadcn Input Classes
  const inputBaseClasses = "mt-1 block w-full py-2 px-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="max-w-5xl mx-auto pb-12 transition-all duration-200">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Weekly Report' : 'Create New Report'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Fill out your tasks, hours, and blockers for the week.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => handleSubmit('Draft')}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </button>
          <button 
            onClick={() => handleSubmit('Submitted')}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white border border-transparent rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" /> Submit
          </button>
        </div>
      </div>
      
      {reviewComment && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Manager requested changes</h3>
              <p className="text-sm text-orange-700 dark:text-orange-200/80 mt-1">{reviewComment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-8 transition-colors duration-200">
        
        {/* Section 1: Meta Information */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Project / Category <span className="text-red-500">*</span></label>
            <select 
              className={inputBaseClasses}
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
            >
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Week Start <span className="text-red-500">*</span></label>
            <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
              value={formData.weekStartDate} onChange={(e) => setFormData({...formData, weekStartDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Week End <span className="text-red-500">*</span></label>
            <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
              value={formData.weekEndDate} onChange={(e) => setFormData({...formData, weekEndDate: e.target.value})} />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 2: Tasks Completed */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
            <button type="button" onClick={() => addItem('tasks', { taskName: '', status: 'To Do', priority: 'Medium', plannedHours: 0, spentHours: 0 })} 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1.5"/> Add Task
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
                <input type="text" placeholder="Task Name" className={`${inputBaseClasses} !mt-0 flex-1`}
                  value={task.taskName} onChange={(e) => handleArrayChange('tasks', index, 'taskName', e.target.value)} />
                
                <div className="flex w-full lg:w-auto items-center gap-4">
                  <select className={`${inputBaseClasses} !mt-0 w-36`}
                    value={task.status} onChange={(e) => handleArrayChange('tasks', index, 'status', e.target.value)}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>

                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400 pl-2">Hrs:</span>
                    <input type="number" placeholder="Plan" className="w-14 bg-transparent border-none text-sm text-center text-gray-900 dark:text-slate-100 focus:ring-0 p-1"
                      value={task.plannedHours} onChange={(e) => handleArrayChange('tasks', index, 'plannedHours', e.target.value)} />
                    <span className="text-gray-300 dark:text-slate-600">/</span>
                    <input type="number" placeholder="Spent" className="w-14 bg-transparent border-none text-sm text-center text-gray-900 dark:text-slate-100 focus:ring-0 p-1"
                      value={task.spentHours} onChange={(e) => handleArrayChange('tasks', index, 'spentHours', e.target.value)} />
                  </div>

                  <button onClick={() => removeItem('tasks', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors ml-auto lg:ml-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {formData.tasks.length === 0 && (
              <div className="text-center py-6 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-slate-400 italic">No tasks added yet. Add a task to track your time.</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 3: Blockers */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blockers & Challenges</h3>
            <button type="button" onClick={() => addItem('blockers', { description: '', isKeyIssue: false })} 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1.5"/> Add Blocker
            </button>
          </div>
          <div className="space-y-3">
            {formData.blockers.map((blocker, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input type="text" placeholder="Describe the challenge..." className={`${inputBaseClasses} !mt-0 flex-1`}
                  value={blocker.description} onChange={(e) => handleArrayChange('blockers', index, 'description', e.target.value)} />
                
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer select-none bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
                    <input type="radio" name="keyIssue" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                      checked={blocker.isKeyIssue} 
                      onChange={() => {
                        const updated = formData.blockers.map((b, i) => ({...b, isKeyIssue: i === index}));
                        setFormData({...formData, blockers: updated});
                      }} />
                    <span>Key Issue</span>
                  </label>

                  <button onClick={() => removeItem('blockers', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {formData.blockers.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-slate-400 italic">No blockers reported this week.</p>
            )}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 4: Planned Next Week */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Planned for Next Week</h3>
          <textarea rows={4} className={inputBaseClasses} placeholder="What are your main objectives for next week? (Optional)"
            value={formData.plannedNextWeek} onChange={(e) => setFormData({...formData, plannedNextWeek: e.target.value})} />
        </div>

      </div>
    </div>
  );
};

export default ReportFormPage;