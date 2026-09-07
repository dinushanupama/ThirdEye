import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import ReportHistoryPage from './pages/ReportHistoryPage';
import ReportFormPage from './pages/ReportFormPage';
import ReportDetailPage from './pages/ReportDetailPage';
import TeamDashboardPage from './pages/TeamDashboardPage';
import ManagerReviewPage from './pages/ManagerReviewPage';
import ProjectManagementPage from './pages/ProjectManagementPage';

// Temporary placeholders for testing
const DashboardPlaceholder = () => <div className="bg-white p-6 rounded-lg shadow-sm">Manager Dashboard View</div>;
const NewReportPlaceholder = () => <div className="bg-white p-6 rounded-lg shadow-sm">Create New Report Form</div>;
const ProjectsPlaceholder = () => <div className="bg-white p-6 rounded-lg shadow-sm">Project Management View</div>;


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes wrapped in the AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            
            {/* Routes available to everyone */}
            <Route path="/my-reports" element={<ReportHistoryPage />} />
            <Route path="/reports/new" element={<ReportFormPage />} />
            <Route path="/reports/:id/edit" element={<ReportFormPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />

            {/* Routes strictly for Managers/Admins */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
              <Route path="/dashboard" element={<TeamDashboardPage />} />
              <Route path="/projects" element={<ProjectManagementPage />} />
              <Route path="/review/:id" element={<ManagerReviewPage />} />
            </Route>

          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/my-reports" replace />} />
      </Routes>
    </Router>
  );
}

export default App;