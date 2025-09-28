import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Shield } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // Not authenticated, redirect to admin login
      navigate('/admin-auth');
    } else if (!profileLoading && profile && profile.user_type !== 'admin') {
      // Authenticated but not an admin, redirect to general dashboard or home
      navigate('/dashboard'); // Or '/'
    }
  }, [user, authLoading, profile, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões de administrador...</p>
        </div>
      </div>
    );
  }

  return user && profile?.user_type === 'admin' ? <>{children}</> : null;
};

export default AdminProtectedRoute;