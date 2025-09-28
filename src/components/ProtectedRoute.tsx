import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!loading) { // Uma vez que o estado de autenticação foi carregado (não está mais 'loading')
      setHasCheckedAuth(true); // Marcamos que a verificação inicial foi feita
      if (!user) {
        // Se não houver usuário após o carregamento, redirecionar para a página de autenticação
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Enquanto estiver carregando ou antes de ter verificado o estado de autenticação, mostra um spinner
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver carregando e a verificação inicial foi feita, e o usuário está presente, renderiza os filhos.
  // Se o usuário for nulo, o useEffect já teria redirecionado.
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;