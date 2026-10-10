import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import ProjectTasks from './pages/ProjectTasks'
import Calendar from './pages/Calendar'
import Proposals from './pages/Proposals'
import Payments from './pages/Payments'
import Team from './pages/Team'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected CRM Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <NotificationProvider>
                  <AppLayout />
                </NotificationProvider>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/project/:projectId" element={<ProjectTasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/team" element={<Team />} />
            </Route>
          </Route>

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
