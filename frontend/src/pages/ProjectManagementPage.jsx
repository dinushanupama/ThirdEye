import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', assignedUsers: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper for SweetAlert theme
  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444'
  });

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/users')
      ]);
      setProjects(projectsRes.data);
      setTeamMembers(usersRes.data);
    } catch (err) {
      setError(true);
      Swal.fire({
        icon: 'error',
        title: 'Data Load Error',
        text: 'Failed to load project data.',
        ...getSwalTheme()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openForm = (project = null) => {
    if (project) {
      setEditingId(project._id);
      setFormData({ 
        name: project.name, 
        description: project.description,
        assignedUsers: project.assignedUsers.map(u => u._id)
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', assignedUsers: [] });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', assignedUsers: [] });
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.assignedUsers.includes(userId);
      return {
        ...prev,
        assignedUsers: isSelected 
          ? prev.assignedUsers.filter(id => id !== userId)
          : [...prev.assignedUsers, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      
      await fetchData();
      closeForm();
      
      Swal.fire({
        icon: 'success',
        title: editingId ? 'Project Updated' : 'Project Created',
        showConfirmButton: false,
        timer: 1500,
        ...getSwalTheme()
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || 'Failed to save project.',
        ...getSwalTheme()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This project will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      ...getSwalTheme()
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      
      const newTotalPages = Math.ceil((projects.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The project has been removed.',
        showConfirmButton: false,
        timer: 1500,
        ...getSwalTheme()
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: err.response?.data?.message || 'Failed to delete project.',
        ...getSwalTheme()
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading projects...</div>;
  if (error) return null;

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const inputBaseClasses = "mt-1 block w-full py-2 px-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-colors shadow-sm";

  return (
    <div className="max-w-7xl mx-auto pb-12 relative transition-all duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Project Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage reporting categories and assign team members.</p>
        </div>
        <button 
          onClick={() => openForm()} 
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        
        {projects.length === 0 ? (
           <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="h-16 w-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-slate-700">
               <Folder className="w-8 h-8 text-gray-400 dark:text-slate-500" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No projects found</h3>
             <p className="text-sm text-gray-500 dark:text-slate-400">Get started by creating a new project for your team.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Assigned Team</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                {paginatedProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">{project.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {project.assignedUsers && project.assignedUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {project.assignedUsers.map(user => (
                            <span key={user._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                              {user.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500 italic text-xs">No one assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openForm(project)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(project._id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, projects.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span> results
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

      {/* Create / Edit Form Overlay with Backdrop Blur */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
            <button 
              onClick={closeForm} 
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                <input type="text" required className={inputBaseClasses}
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Client A Portal" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Description <span className="text-gray-400 dark:text-slate-500 font-normal">(Optional)</span></label>
                <textarea rows={3} className={inputBaseClasses}
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of this project..." />
              </div>
              
              <div className="pt-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" /> Assign Team Members
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg p-2 space-y-1 bg-gray-50 dark:bg-slate-950 shadow-inner">
                  {teamMembers.map(user => (
                    <label key={user._id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-slate-800/80 rounded-md cursor-pointer transition-colors select-none">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-950 focus:ring-2"
                        checked={formData.assignedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{user.name}</span>
                    </label>
                  ))}
                  {teamMembers.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-500 italic p-3 text-center">No team members available.</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-800 mt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center">
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;