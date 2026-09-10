// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Save, Send, Plus, Trash2, AlertCircle, Trophy, Clock, FileText, CheckSquare } from 'lucide-react';
// import api from '../api/axiosConfig';
// import Swal from 'sweetalert2';

// const ReportFormPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEditMode = Boolean(id);

//   const [loading, setLoading] = useState(isEditMode);
//   const [projects, setProjects] = useState([]);
  
//   // Updated master state object matching the complete backend schema
//   const [formData, setFormData] = useState({
//     projectId: '',
//     weekStartDate: '',
//     weekEndDate: '',
//     tasks: [],
//     blockers: [],
//     achievements: [],
//     plannedNextWeek: '',
//     notes: '',
//     hoursBreakdown: {
//       development: 0,
//       testing: 0,
//       meetings: 0,
//       documentation: 0
//     }
//   });

//   const [reviewComment, setReviewComment] = useState('');

//   const getSwalTheme = () => ({
//     background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
//     color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
//     confirmButtonColor: '#3b82f6'
//   });

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await api.get('/projects');
//         setProjects(res.data);
//       } catch (err) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Project Load Failed',
//           text: 'Could not load available projects.',
//           ...getSwalTheme()
//         });
//       }
//     };

//     const fetchReport = async () => {
//       try {
//         const res = await api.get(`/reports/${id}`);
//         const report = res.data;
        
//         const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';
        
//         setFormData({
//           projectId: report.project?._id || report.project,
//           weekStartDate: formatDate(report.weekStartDate),
//           weekEndDate: formatDate(report.weekEndDate),
//           tasks: report.tasks || [],
//           blockers: report.blockers || [],
//           achievements: report.achievements || [],
//           plannedNextWeek: report.plannedNextWeek || '',
//           notes: report.notes || '',
//           hoursBreakdown: report.hoursBreakdown || { development: 0, testing: 0, meetings: 0, documentation: 0 }
//         });
        
//         if (report.status === 'Needs Correction') {
//           setReviewComment(report.latestReviewComment);
//         }
//       } catch (err) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Data Load Error',
//           text: 'Failed to load the report data.',
//           ...getSwalTheme()
//         }).then(() => navigate('/my-reports'));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProjects();
//     if (isEditMode) fetchReport();
//   }, [id, isEditMode, navigate]);

//   // --- Handlers ---
//   const handleArrayChange = (field, index, key, value) => {
//     const updatedArray = [...formData[field]];
//     updatedArray[index][key] = value;
//     setFormData({ ...formData, [field]: updatedArray });
//   };

//   const handleHoursBreakdownChange = (key, value) => {
//     setFormData(prev => ({
//       ...prev,
//       hoursBreakdown: { ...prev.hoursBreakdown, [key]: Number(value) }
//     }));
//   };

//   const addItem = (field, defaultObj) => {
//     setFormData({ ...formData, [field]: [...formData[field], defaultObj] });
//   };

//   const removeItem = (field, index) => {
//     const updatedArray = formData[field].filter((_, i) => i !== index);
//     setFormData({ ...formData, [field]: updatedArray });
//   };

//   const handleSubmit = async (status) => {
//     if (!formData.projectId || !formData.weekStartDate || !formData.weekEndDate) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Fields',
//         text: 'Please select a project and specify the week dates before saving.',
//         ...getSwalTheme()
//       });
//       return;
//     }

//     try {
//       const payload = { ...formData, status };
      
//       if (isEditMode) {
//         await api.put(`/reports/${id}`, payload);
//       } else {
//         await api.post('/reports', payload);
//       }

//       await Swal.fire({
//         icon: 'success',
//         title: status === 'Draft' ? 'Draft Saved' : 'Report Submitted',
//         text: status === 'Draft' ? 'Your progress has been saved.' : 'Your report has been sent to your manager.',
//         timer: 1500,
//         showConfirmButton: false,
//         ...getSwalTheme()
//       });

//       navigate('/my-reports');
//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: err.response?.data?.message || 'Failed to save the report.',
//         ...getSwalTheme()
//       });
//     }
//   };

//   if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 animate-pulse h-[60vh] flex items-center justify-center">Loading form data...</div>;

//   const inputBaseClasses = "block w-full py-2 px-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-sm";

//   return (
//     <div className="max-w-5xl mx-auto pb-12 transition-all duration-200">
      
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//             {isEditMode ? 'Edit Weekly Report' : 'Create New Report'}
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Provide detailed metrics, achievements, and blockers for the week.</p>
//         </div>
//         <div className="flex space-x-3 w-full sm:w-auto">
//           <button 
//             onClick={() => handleSubmit('Draft')}
//             className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
//           >
//             <Save className="w-4 h-4 mr-2" /> Save Draft
//           </button>
//           <button 
//             onClick={() => handleSubmit('Submitted')}
//             className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white border border-transparent rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
//           >
//             <Send className="w-4 h-4 mr-2" /> Submit
//           </button>
//         </div>
//       </div>
      
//       {reviewComment && (
//         <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-xl p-4 mb-6 shadow-sm">
//           <div className="flex">
//             <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-3 flex-shrink-0" />
//             <div>
//               <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Manager requested changes</h3>
//               <p className="text-sm text-orange-700 dark:text-orange-200/80 mt-1">{reviewComment}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-10 transition-colors duration-200">
        
//         {/* Section 1: Meta Information */}
//         <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Project / Category <span className="text-red-500">*</span></label>
//             <select 
//               className={inputBaseClasses}
//               value={formData.projectId}
//               onChange={(e) => setFormData({...formData, projectId: e.target.value})}
//             >
//               <option value="">Select a project...</option>
//               {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Week Start <span className="text-red-500">*</span></label>
//             <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
//               value={formData.weekStartDate} onChange={(e) => setFormData({...formData, weekStartDate: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Week End <span className="text-red-500">*</span></label>
//             <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
//               value={formData.weekEndDate} onChange={(e) => setFormData({...formData, weekEndDate: e.target.value})} />
//           </div>
//         </div>

//         <hr className="border-gray-200 dark:border-slate-800" />

//         {/* Section 2: Tasks Completed */}
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
//               <CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> Tasks
//             </h3>
//             <button type="button" onClick={() => addItem('tasks', { taskName: '', status: 'To Do', priority: 'Medium', plannedHours: 0, spentHours: 0, plannedPercent: 0, actualPercent: 0, deliverable: '' })} 
//               className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
//               <Plus className="w-4 h-4 mr-1.5"/> Add Task
//             </button>
//           </div>
          
//           <div className="space-y-4">
//             {formData.tasks.map((task, index) => (
//               <div key={index} className="flex flex-col gap-4 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors relative">
                
//                 <button onClick={() => removeItem('tasks', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
//                   <Trash2 className="w-5 h-5" />
//                 </button>

//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-8">
//                   <div className="md:col-span-6">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Task Name</label>
//                     <input type="text" placeholder="E.g., API Integration" className={inputBaseClasses}
//                       value={task.taskName} onChange={(e) => handleArrayChange('tasks', index, 'taskName', e.target.value)} />
//                   </div>
//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Status</label>
//                     <select className={inputBaseClasses}
//                       value={task.status} onChange={(e) => handleArrayChange('tasks', index, 'status', e.target.value)}>
//                       <option value="To Do">To Do</option>
//                       <option value="In Progress">In Progress</option>
//                       <option value="Completed">Completed</option>
//                       <option value="Blocked">Blocked</option>
//                     </select>
//                   </div>
//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Priority</label>
//                     <select className={inputBaseClasses}
//                       value={task.priority} onChange={(e) => handleArrayChange('tasks', index, 'priority', e.target.value)}>
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                       <option value="Urgent">Urgent</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
//                   <div className="md:col-span-6">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Deliverable Link / Description</label>
//                     <input type="text" placeholder="https://github.com/..." className={inputBaseClasses}
//                       value={task.deliverable} onChange={(e) => handleArrayChange('tasks', index, 'deliverable', e.target.value)} />
//                   </div>
                  
//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Progress (%)</label>
//                     <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-700">
//                       <input type="number" placeholder="Plan" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
//                         value={task.plannedPercent} onChange={(e) => handleArrayChange('tasks', index, 'plannedPercent', e.target.value)} title="Planned %" />
//                       <span className="text-gray-300 dark:text-slate-600">/</span>
//                       <input type="number" placeholder="Actual" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
//                         value={task.actualPercent} onChange={(e) => handleArrayChange('tasks', index, 'actualPercent', e.target.value)} title="Actual %" />
//                     </div>
//                   </div>

//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Hours</label>
//                     <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-700">
//                       <input type="number" placeholder="Plan" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
//                         value={task.plannedHours} onChange={(e) => handleArrayChange('tasks', index, 'plannedHours', e.target.value)} title="Planned Hours" />
//                       <span className="text-gray-300 dark:text-slate-600">/</span>
//                       <input type="number" placeholder="Spent" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
//                         value={task.spentHours} onChange={(e) => handleArrayChange('tasks', index, 'spentHours', e.target.value)} title="Spent Hours" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {formData.tasks.length === 0 && (
//               <div className="text-center py-6 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
//                 <p className="text-sm text-gray-500 dark:text-slate-400 italic">No tasks added yet. Track your planned and actual progress here.</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <hr className="border-gray-200 dark:border-slate-800" />

//         {/* Section 3: Hours Breakdown */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
//             <Clock className="w-5 h-5 mr-2 text-indigo-500" /> Time Distribution (Hours)
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-800/30 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
//             {['development', 'testing', 'meetings', 'documentation'].map((field) => (
//               <div key={field}>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 capitalize mb-1">{field}</label>
//                 <input type="number" min="0" className={inputBaseClasses}
//                   value={formData.hoursBreakdown[field]} onChange={(e) => handleHoursBreakdownChange(field, e.target.value)} />
//               </div>
//             ))}
//           </div>
//         </div>

//         <hr className="border-gray-200 dark:border-slate-800" />

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
//           {/* Section 4: Achievements */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
//                 <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Achievements
//               </h3>
//               <button type="button" onClick={() => addItem('achievements', { description: '', isKeyAchievement: false })} 
//                 className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
//                 <Plus className="w-4 h-4 mr-1"/> Add Win
//               </button>
//             </div>
//             <div className="space-y-3">
//               {formData.achievements.map((achievement, index) => (
//                 <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//                   <input type="text" placeholder="Describe the win..." className={inputBaseClasses}
//                     value={achievement.description} onChange={(e) => handleArrayChange('achievements', index, 'description', e.target.value)} />
                  
//                   <div className="flex items-center justify-between w-full sm:w-auto">
//                     <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 whitespace-nowrap">
//                       <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:border-slate-600"
//                         checked={achievement.isKeyAchievement} 
//                         onChange={(e) => handleArrayChange('achievements', index, 'isKeyAchievement', e.target.checked)} />
//                       <span>Key Win</span>
//                     </label>
//                     <button onClick={() => removeItem('achievements', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors ml-2">
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {formData.achievements.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-500 italic">No achievements added.</p>}
//             </div>
//           </div>

//           {/* Section 5: Blockers */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
//                 <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Blockers
//               </h3>
//               <button type="button" onClick={() => addItem('blockers', { description: '', isKeyIssue: false })} 
//                 className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
//                 <Plus className="w-4 h-4 mr-1"/> Add Blocker
//               </button>
//             </div>
//             <div className="space-y-3">
//               {formData.blockers.map((blocker, index) => (
//                 <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//                   <input type="text" placeholder="Describe the challenge..." className={inputBaseClasses}
//                     value={blocker.description} onChange={(e) => handleArrayChange('blockers', index, 'description', e.target.value)} />
                  
//                   <div className="flex items-center justify-between w-full sm:w-auto">
//                     <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 whitespace-nowrap">
//                       <input type="radio" name={`keyIssue-${index}`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:border-slate-600"
//                         checked={blocker.isKeyIssue} 
//                         onChange={() => {
//                           const updated = formData.blockers.map((b, i) => ({...b, isKeyIssue: i === index}));
//                           setFormData({...formData, blockers: updated});
//                         }} />
//                       <span>Key Issue</span>
//                     </label>
//                     <button onClick={() => removeItem('blockers', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors ml-2">
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {formData.blockers.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-500 italic">No blockers added.</p>}
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200 dark:border-slate-800" />

//         {/* Section 6: Next Week & Notes */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Planned for Next Week</h3>
//             <textarea rows={4} className={inputBaseClasses} placeholder="Main objectives for next week..."
//               value={formData.plannedNextWeek} onChange={(e) => setFormData({...formData, plannedNextWeek: e.target.value})} />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
//               <FileText className="w-5 h-5 mr-2 text-gray-500" /> Additional Notes
//             </h3>
//             <textarea rows={4} className={inputBaseClasses} placeholder="Any other context or notes..."
//               value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ReportFormPage;

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Plus, Trash2, AlertCircle, Trophy, Clock, FileText, CheckSquare } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const ReportFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [projects, setProjects] = useState([]);
  
  // Updated master state object matching the complete backend schema
  const [formData, setFormData] = useState({
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    tasks: [],
    blockers: [],
    achievements: [],
    plannedNextWeek: '',
    notes: '',
    hoursBreakdown: {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0
    }
  });

  const [reviewComment, setReviewComment] = useState('');

  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6'
  });

  useEffect(() => {
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

    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        const report = res.data;
        
        const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';
        
        setFormData({
          projectId: report.project?._id || report.project,
          weekStartDate: formatDate(report.weekStartDate),
          weekEndDate: formatDate(report.weekEndDate),
          tasks: report.tasks || [],
          blockers: report.blockers || [],
          achievements: report.achievements || [],
          plannedNextWeek: report.plannedNextWeek || '',
          notes: report.notes || '',
          hoursBreakdown: report.hoursBreakdown || { development: 0, testing: 0, meetings: 0, documentation: 0 }
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

  // --- Handlers ---
  const handleArrayChange = (field, index, key, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index][key] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleHoursBreakdownChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      hoursBreakdown: { ...prev.hoursBreakdown, [key]: Number(value) }
    }));
  };

  const addItem = (field, defaultObj) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultObj] });
  };

  const removeItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleSubmit = async (status) => {
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

  const inputBaseClasses = "block w-full py-2 px-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="max-w-5xl mx-auto pb-12 transition-all duration-200">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Weekly Report' : 'Create New Report'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Provide detailed metrics, achievements, and blockers for the week.</p>
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
      
      {/* 2. THE FRONTEND FIX: Displaying the Manager's Feedback Banner */}
      {reviewComment && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                Manager Feedback - Action Required
              </h3>
              <div className="mt-1 text-sm text-amber-700 dark:text-amber-200 whitespace-pre-wrap">
                {reviewComment}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-10 transition-colors duration-200">
        
        {/* Section 1: Meta Information */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Project / Category <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Week Start <span className="text-red-500">*</span></label>
            <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
              value={formData.weekStartDate} onChange={(e) => setFormData({...formData, weekStartDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Week End <span className="text-red-500">*</span></label>
            <input type="date" className={`${inputBaseClasses} dark:[color-scheme:dark]`}
              value={formData.weekEndDate} onChange={(e) => setFormData({...formData, weekEndDate: e.target.value})} />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 2: Tasks Completed */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> Tasks
            </h3>
            <button type="button" onClick={() => addItem('tasks', { taskName: '', status: 'To Do', priority: 'Medium', plannedHours: 0, spentHours: 0, plannedPercent: 0, actualPercent: 0, deliverable: '' })} 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1.5"/> Add Task
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex flex-col gap-4 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors relative">
                
                <button onClick={() => removeItem('tasks', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-8">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Task Name</label>
                    <input type="text" placeholder="E.g., API Integration" className={inputBaseClasses}
                      value={task.taskName} onChange={(e) => handleArrayChange('tasks', index, 'taskName', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Status</label>
                    <select className={inputBaseClasses}
                      value={task.status} onChange={(e) => handleArrayChange('tasks', index, 'status', e.target.value)}>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Priority</label>
                    <select className={inputBaseClasses}
                      value={task.priority} onChange={(e) => handleArrayChange('tasks', index, 'priority', e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Deliverable Link / Description</label>
                    <input type="text" placeholder="https://github.com/..." className={inputBaseClasses}
                      value={task.deliverable} onChange={(e) => handleArrayChange('tasks', index, 'deliverable', e.target.value)} />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Progress (%)</label>
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-700">
                      <input type="number" placeholder="Plan" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
                        value={task.plannedPercent} onChange={(e) => handleArrayChange('tasks', index, 'plannedPercent', e.target.value)} title="Planned %" />
                      <span className="text-gray-300 dark:text-slate-600">/</span>
                      <input type="number" placeholder="Actual" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
                        value={task.actualPercent} onChange={(e) => handleArrayChange('tasks', index, 'actualPercent', e.target.value)} title="Actual %" />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Hours</label>
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-700">
                      <input type="number" placeholder="Plan" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
                        value={task.plannedHours} onChange={(e) => handleArrayChange('tasks', index, 'plannedHours', e.target.value)} title="Planned Hours" />
                      <span className="text-gray-300 dark:text-slate-600">/</span>
                      <input type="number" placeholder="Spent" className="w-1/2 bg-transparent border-none text-sm text-center focus:ring-0 text-gray-900 dark:text-slate-100 p-1"
                        value={task.spentHours} onChange={(e) => handleArrayChange('tasks', index, 'spentHours', e.target.value)} title="Spent Hours" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {formData.tasks.length === 0 && (
              <div className="text-center py-6 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-slate-400 italic">No tasks added yet. Track your planned and actual progress here.</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 3: Hours Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" /> Time Distribution (Hours)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-800/30 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            {['development', 'testing', 'meetings', 'documentation'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 capitalize mb-1">{field}</label>
                <input type="number" min="0" className={inputBaseClasses}
                  value={formData.hoursBreakdown[field]} onChange={(e) => handleHoursBreakdownChange(field, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 4: Achievements */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Achievements
              </h3>
              <button type="button" onClick={() => addItem('achievements', { description: '', isKeyAchievement: false })} 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                <Plus className="w-4 h-4 mr-1"/> Add Win
              </button>
            </div>
            <div className="space-y-3">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input type="text" placeholder="Describe the win..." className={inputBaseClasses}
                    value={achievement.description} onChange={(e) => handleArrayChange('achievements', index, 'description', e.target.value)} />
                  
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 whitespace-nowrap">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:border-slate-600"
                        checked={achievement.isKeyAchievement} 
                        onChange={(e) => handleArrayChange('achievements', index, 'isKeyAchievement', e.target.checked)} />
                      <span>Key Win</span>
                    </label>
                    <button onClick={() => removeItem('achievements', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors ml-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.achievements.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-500 italic">No achievements added.</p>}
            </div>
          </div>

          {/* Section 5: Blockers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Blockers
              </h3>
              <button type="button" onClick={() => addItem('blockers', { description: '', isKeyIssue: false })} 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                <Plus className="w-4 h-4 mr-1"/> Add Blocker
              </button>
            </div>
            <div className="space-y-3">
              {formData.blockers.map((blocker, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input type="text" placeholder="Describe the challenge..." className={inputBaseClasses}
                    value={blocker.description} onChange={(e) => handleArrayChange('blockers', index, 'description', e.target.value)} />
                  
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 whitespace-nowrap">
                      <input type="radio" name={`keyIssue-${index}`} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:border-slate-600"
                        checked={blocker.isKeyIssue} 
                        onChange={() => {
                          const updated = formData.blockers.map((b, i) => ({...b, isKeyIssue: i === index}));
                          setFormData({...formData, blockers: updated});
                        }} />
                      <span>Key Issue</span>
                    </label>
                    <button onClick={() => removeItem('blockers', index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors ml-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.blockers.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-500 italic">No blockers added.</p>}
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        {/* Section 6: Next Week & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Planned for Next Week</h3>
            <textarea rows={4} className={inputBaseClasses} placeholder="Main objectives for next week..."
              value={formData.plannedNextWeek} onChange={(e) => setFormData({...formData, plannedNextWeek: e.target.value})} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
              <FileText className="w-5 h-5 mr-2 text-gray-500" /> Additional Notes
            </h3>
            <textarea rows={4} className={inputBaseClasses} placeholder="Any other context or notes..."
              value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportFormPage;