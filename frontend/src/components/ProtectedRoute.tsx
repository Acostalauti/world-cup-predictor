import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: 'admin' | 'player';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/auth" replace />;
    }

    // Admins can access everything
    if (currentUser.role === 'admin') {
        return <>{children}</>;
    }

    // Players can only access player routes
    if (requiredRole === 'admin' && currentUser.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
