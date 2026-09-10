import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, LayoutDashboard } from 'lucide-react';
import Swal from 'sweetalert2'; 
import Logo from '../assets/logo.svg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Helper for SweetAlert theme matching
  const getSwalTheme = () => ({
    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Premium Success Toast before redirect
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Signing you into your dashboard...',
        timer: 1200,
        showConfirmButton: false,
        ...getSwalTheme()
      }).then(() => {
        // Redirect based on role or just send to a default dashboard
        navigate('/dashboard'); 
      });
    } else {
      // SweetAlert Error Popup
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: result.message || 'Invalid email or password. Please try again.',
        ...getSwalTheme()
      });
      setIsSubmitting(false);
    }
  };

  // Shared input classes for Shadcn style
  const inputBaseClasses = "block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-200 p-4">
      
      {/* Decorative background blur (optional but adds a premium SaaS feel) */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-400/10 dark:bg-indigo-900/20 blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 relative z-10 transition-colors duration-200">
        
        {/* Brand/Logo Area */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shadow-sm">
            <img src={Logo} alt="WeeklyStatus Logo" className="h-7 w-7 object-contain" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Sign in to manage your weekly reports</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                className={inputBaseClasses}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                className={inputBaseClasses}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition-all mt-6"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* Helper footer text */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-slate-500">
          <p>Secure login powered by JWT Authentication</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;