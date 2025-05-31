import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotesProvider } from './contexts/NotesContext';
import { MessagingProvider } from './contexts/MessagingContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DomainList from './pages/domains/DomainList';
import DomainAdd from './pages/domains/DomainAdd';
import DomainEdit from './pages/domains/DomainEdit';
import Keywords from './pages/Keywords';
import BTK from './pages/BTKRun';
import ApiSettings from './pages/ApiSettings';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import FileManagerPage from './pages/FileManagerPage';
import Login from './pages/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <NotesProvider>
            <MessagingProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard\" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="domains" element={<DomainList />} />
                    <Route path="domains/add" element={<DomainAdd />} />
                    <Route path="domains/edit/:id" element={<DomainEdit />} />
                    <Route path="keywords" element={<Keywords />} />
                    <Route path="btk" element={<BTK />} />
                    <Route path="api-settings" element={<ApiSettings />} />
                    <Route path="files" element={<FileManagerPage />} />
                    <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
                    <Route path="notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
                  </Route>
                </Routes>
              </Router>
            </MessagingProvider>
          </NotesProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;