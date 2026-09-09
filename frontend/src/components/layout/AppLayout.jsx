import { useContext } from 'react';
import AIChatWidget from '../AIChatWidget.jsx';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  FolderOpen, 
  LogOut,
  User,
  Users,
  LineChart // <-- Added new icon for Insights
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation links based on user role
  const navLinks = [
    // Visible ONLY to team members
    { name: 'My Reports', path: '/my-reports', icon: FileText, roles: ['team_member'] },
    { name: 'New Report', path: '/reports/new', icon: PlusCircle, roles: ['team_member'] },
    
    // Visible ONLY to managers/admins
    { name: 'Team Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['manager', 'admin'] },
    { name: 'Team Insights', path: '/insights', icon: LineChart, roles: ['manager', 'admin'] }, // <-- Added Insights Route
    { name: 'Projects', path: '/projects', icon: FolderOpen, roles: ['manager', 'admin'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
  ];

  // Filter links based on the current user's role
  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-colors duration-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">ThirdEye System</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors duration-200">
          <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            {/* Can add breadcrumbs or page title here later */}
          </div>
          
          <div className="flex items-center space-x-6">
            
            {/* Dark Mode Toggle Button inserted here */}
            <ThemeToggle />

            <div className="flex items-center space-x-2 text-sm border-l border-gray-200 dark:border-slate-700 pl-6">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-slate-200">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
      {/* Global AI Chat Assistant Widget */}
      <AIChatWidget />
    </div>
  );
};

export default AppLayout;