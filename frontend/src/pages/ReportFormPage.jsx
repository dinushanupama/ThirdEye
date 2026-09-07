import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

const ReportFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If there's an ID, we are in Edit Mode
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    // 1. Fetch available projects for the dropdown
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to load projects');
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
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    if (isEditMode) fetchReport();
  }, [id, isEditMode]);

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
    try {
      const payload = { ...formData, status }; // Attach 'Draft' or 'Submitted'
      
      if (isEditMode) {
        await api.put(`/reports/${id}`, payload);
      } else {
        await api.post('/reports', payload);
      }
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Weekly Report' : 'Create New Weekly Report'}
        </h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleSubmit('Draft')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </button>
          <button 
            onClick={() => handleSubmit('Submitted')}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" /> Submit Report
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>}
      
      {reviewComment && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Manager requested changes</h3>
              <p className="text-sm text-orange-700 mt-1">{reviewComment}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-8">
        
        {/* Section 1: Meta Information */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project / Category</label>
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
            >
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Week Start</label>
            <input type="date" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" 
              value={formData.weekStartDate} onChange={(e) => setFormData({...formData, weekStartDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Week End</label>
            <input type="date" className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md" 
              value={formData.weekEndDate} onChange={(e) => setFormData({...formData, weekEndDate: e.target.value})} />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Section 2: Tasks Completed */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Tasks</h3>
            <button type="button" onClick={() => addItem('tasks', { taskName: '', status: 'To Do', priority: 'Medium', plannedHours: 0, spentHours: 0 })} className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
              <Plus className="w-4 h-4 mr-1"/> Add Task
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <input type="text" placeholder="Task Name" className="flex-1 border-gray-300 rounded-md p-2 text-sm border"
                  value={task.taskName} onChange={(e) => handleArrayChange('tasks', index, 'taskName', e.target.value)} />
                
                <select className="border-gray-300 rounded-md p-2 text-sm border"
                  value={task.status} onChange={(e) => handleArrayChange('tasks', index, 'status', e.target.value)}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Hours:</span>
                  <input type="number" placeholder="Plan" className="w-16 border-gray-300 rounded-md p-2 text-sm border"
                    value={task.plannedHours} onChange={(e) => handleArrayChange('tasks', index, 'plannedHours', e.target.value)} />
                  <span className="text-xs text-gray-500">/</span>
                  <input type="number" placeholder="Spent" className="w-16 border-gray-300 rounded-md p-2 text-sm border"
                    value={task.spentHours} onChange={(e) => handleArrayChange('tasks', index, 'spentHours', e.target.value)} />
                </div>

                <button onClick={() => removeItem('tasks', index)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.tasks.length === 0 && <p className="text-sm text-gray-500 italic">No tasks added yet.</p>}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Section 3: Blockers */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Blockers & Challenges</h3>
            <button type="button" onClick={() => addItem('blockers', { description: '', isKeyIssue: false })} className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
              <Plus className="w-4 h-4 mr-1"/> Add Blocker
            </button>
          </div>
          <div className="space-y-3">
            {formData.blockers.map((blocker, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input type="text" placeholder="Describe the challenge..." className="flex-1 border-gray-300 rounded-md p-2 text-sm border"
                  value={blocker.description} onChange={(e) => handleArrayChange('blockers', index, 'description', e.target.value)} />
                
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="keyIssue" className="text-blue-600 focus:ring-blue-500"
                    checked={blocker.isKeyIssue} 
                    onChange={() => {
                      // Set all to false, then this one to true
                      const updated = formData.blockers.map((b, i) => ({...b, isKeyIssue: i === index}));
                      setFormData({...formData, blockers: updated});
                    }} />
                  <span>Key Issue</span>
                </label>

                <button onClick={() => removeItem('blockers', index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Section 4: Planned Next Week */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Planned for Next Week</h3>
          <textarea rows={3} className="block w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="What are your main objectives for next week?"
            value={formData.plannedNextWeek} onChange={(e) => setFormData({...formData, plannedNextWeek: e.target.value})} />
        </div>

      </div>
    </div>
  );
};

export default ReportFormPage;