import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, UserPlus, Trash2, X, Mail, Lock, User, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_member'
  });

  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444'
  });

  const fetchUsers = async () => {
    try {
      // Assuming your backend has an endpoint to get all users
      const res = await api.get('/users'); 
      setUsers(res.data);
    } catch (err) {
      setError(true);
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load user data. Ensure you have Admin privileges.',
        ...getSwalTheme()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'team_member' });
  };

  // --- Handlers ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Assuming your backend has a registration/creation endpoint
      await api.post('/users/register', formData);
      
      await fetchUsers();
      closeForm();
      
      Swal.fire({
        icon: 'success',
        title: 'User Created',
        text: `${formData.name} has been added to the system.`,
        timer: 1500,
        showConfirmButton: false,
        ...getSwalTheme()
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: err.response?.data?.message || 'Failed to create user.',
        ...getSwalTheme()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Assuming a PUT route to update user role
      await api.put(`/users/${userId}/role`, { role: newRole });
      
      // Update local state instantly for snappy UI
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      
      Swal.fire({
        icon: 'success',
        title: 'Role Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        ...getSwalTheme()
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not update user role.',
        ...getSwalTheme()
      });
    }
  };

  const handleDeleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: 'Remove User?',
      text: `Are you sure you want to remove ${name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove them',
      cancelButtonText: 'Cancel',
      ...getSwalTheme()
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      
      const newTotalPages = Math.ceil((users.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      Swal.fire({
        icon: 'success',
        title: 'Removed!',
        text: 'The user has been removed from the system.',
        showConfirmButton: false,
        timer: 1500,
        ...getSwalTheme()
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: err.response?.data?.message || 'Failed to remove user.',
        ...getSwalTheme()
      });
    }
  };

  // --- Styling Helpers ---
  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-fuchsia-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800/50';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center h-[60vh] animate-pulse">Loading user directory...</div>;
  if (error) return null;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const inputBaseClasses = "block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm";

  return (
    <div className="max-w-7xl mx-auto pb-12 relative transition-all duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
            <Users className="w-7 h-7 mr-3 text-blue-600 dark:text-blue-500" /> User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Invite team members, assign roles, and manage access.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Invite User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role Access</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {paginatedUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-800">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 hidden sm:table-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        <span className="ml-1.5 capitalize">{u.role.replace('_', ' ')}</span>
                      </div>
                      {/* Instant Role Swap Dropdown */}
                      <select 
                        className="text-xs bg-transparent text-gray-400 hover:text-gray-900 dark:hover:text-slate-200 outline-none cursor-pointer border-none focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        title="Change Role"
                      >
                        <option value="team_member">Team Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteUser(u._id, u.name)} 
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, users.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span> results
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Form Overlay with Backdrop Blur */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-gray-200 dark:border-slate-800">
            <button 
              onClick={closeForm} 
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-500" /> Invite New User
            </h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="text" required className={inputBaseClasses} placeholder="John Doe"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="email" required className={inputBaseClasses} placeholder="john@company.com"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Temporary Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="password" required className={inputBaseClasses} placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Assign Role</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select className={inputBaseClasses}
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="team_member">Team Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-800 mt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;