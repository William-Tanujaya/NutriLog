import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children, requireProfile = true }: {
  children: ReactNode;
  requireProfile?: boolean;
}) {
  const { isLoggedIn, hasProfile } = useAuth();
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (requireProfile && !hasProfile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
