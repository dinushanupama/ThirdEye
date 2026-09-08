import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // State for available users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Form State updated with assignedUsers array
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', assignedUsers: [] });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Projects and Team Members
  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/users') // New endpoint
      ]);
      setProjects(projectsRes.data);
      setTeamMembers(usersRes.data);
    } catch (err) {
      setError('Failed to load project data.');
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
        assignedUsers: project.assignedUsers.map(u => u._id) // Extract IDs for the checkboxes
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', assignedUsers: [] });
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', assignedUsers: [] });
  };

  // Toggle user assignment in the checkbox list
  const handleUserToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.assignedUsers.includes(userId);
      return {
        ...prev,
        assignedUsers: isSelected 
          ? prev.assignedUsers.filter(id => id !== userId) // Remove if already selected
          : [...prev.assignedUsers, userId] // Add if not selected
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      await fetchData(); // Refresh table
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      
      // Prevent being stuck on an empty page if we delete the last item on it
      const newTotalPages = Math.ceil((projects.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;

  // --- Client-Side Pagination Logic ---
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage projects and assign team members.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>}

      {/* Projects Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Team</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Map over paginatedProjects instead of projects */}
            {paginatedProjects.map((project) => (
              <tr key={project._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{project.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {project.assignedUsers && project.assignedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {project.assignedUsers.map(user => (
                        <span key={user._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {user.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No one assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => openForm(project)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(project._id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, projects.length)}</span> of <span className="font-medium">{projects.length}</span> results
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

      {/* Create / Edit Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Project' : 'Create New Project'}</h2>
            {formError && <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" required className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea rows={2} className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              
              {/* NEW: Team Member Assignment Section */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Assign Team Members
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-gray-50">
                  {teamMembers.map(user => (
                    <label key={user._id} className="flex items-center space-x-3 p-1 hover:bg-gray-100 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={formData.assignedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))}
                  {teamMembers.length === 0 && <p className="text-sm text-gray-500 italic p-2">No team members found.</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
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