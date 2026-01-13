import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: 'platform_admin' | 'group_admin' | 'player';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/auth" replace />;
    }

    if (currentUser.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
