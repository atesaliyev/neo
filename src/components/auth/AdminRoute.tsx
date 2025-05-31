import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}