import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MyTasksPage from './pages/tasks/MyTasksPage';
import TaskDetailsPage from './pages/tasks/TaskDetailsPage';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DashboardLayout from './layouts/DashboardLayout';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import AddEmployeePage from './pages/employees/AddEmployeePage';
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage';
import AttendancePage from './pages/attendance/AttendancePage';
import LeaveRequestPage from './pages/attendance/LeaveRequestPage';
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import AddJobPage from './pages/recruitment/AddJobPage';
import JobApplicantsPage from './pages/recruitment/JobApplicantsPage';
import ProjectListPage from './pages/projects/ProjectListPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import AddProjectPage from './pages/projects/AddProjectPage';
import ProjectSettingsPage from './pages/projects/ProjectSettingsPage';
import PlansListPage from './pages/boards/PlansListPage';
import BoardPage from './pages/boards/BoardPage';
import SettingsPage from './pages/SettingsPage';
import ReportingPage from './pages/ReportingPage';
import OvertimePage from './pages/hr/OvertimePage';
import PayrollPage from './pages/hr/PayrollPage';
import AwardsPage from './pages/hr/AwardsPage';
import DocumentsPage from './pages/hr/DocumentsPage';
import WorkRegulationsPage from './pages/settings/WorkRegulationsPage';
import AwardsSetupPage from './pages/settings/AwardsSetupPage';
import AttendanceReportPage from './pages/reports/AttendanceReportPage';
import LogsPage from './pages/reports/LogsPage';
import PublicJobBoard from './pages/public/PublicJobBoard';
import PublicJobApplyPage from './pages/public/PublicJobApplyPage';
import CompanySettingsPage from './pages/settings/CompanySettingsPage';
import NotificationsSettingsPage from './pages/settings/NotificationsSettingsPage';
import SecuritySettingsPage from './pages/settings/SecuritySettingsPage';
import RolesSettingsPage from './pages/settings/RolesSettingsPage';
import DepartmentsSettingsPage from './pages/settings/DepartmentsSettingsPage';
import HolidaysSettingsPage from './pages/settings/HolidaysSettingsPage';
import { useAuthStore } from './store/auth.store';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Career Routes */}
        <Route path="/careers" element={<PublicJobBoard />} />
        <Route path="/careers/:id" element={<PublicJobApplyPage />} />
        <Route path="/jobs" element={<PublicJobBoard />} />
        <Route path="/jobs/:id" element={<PublicJobApplyPage />} />

        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director', 'Manager']}>
              <DashboardLayout>
                <EmployeeListPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/new"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <AddEmployeePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director', 'Manager']}>
              <DashboardLayout>
                <EmployeeProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttendancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/leave"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LeaveRequestPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruitment"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director']}>
              <DashboardLayout>
                <RecruitmentPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruitment/new"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <AddJobPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruitment/jobs/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <JobApplicantsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ... (other imports) */}

        {/* Individual Task Details Page - MUST come before /tasks */}
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TaskDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MyTasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectListPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddProjectPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Plans Routes */}
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlansListPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BoardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/company"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <CompanySettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <NotificationsSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <SecuritySettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/roles"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <RolesSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/departments"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <DepartmentsSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/holidays"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <HolidaysSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/*"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director', 'Manager']}>
              <DashboardLayout>
                <ReportingPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* HR Module Routes */}
        <Route
          path="/hr/overtime"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OvertimePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payroll"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director', 'Manager']}>
              <DashboardLayout>
                <PayrollPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/awards"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AwardsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/documents"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <DocumentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Module Routes */}
        <Route
          path="/settings/regulations"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <WorkRegulationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/awards"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <AwardsSetupPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Reports Module Routes */}
        <Route
          path="/reports/attendance"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR', 'Director', 'Manager']}>
              <DashboardLayout>
                <AttendanceReportPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/logs"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'HR']}>
              <DashboardLayout>
                <LogsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
