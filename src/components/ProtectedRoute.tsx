import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute useEffect: authLoading =", authLoading, "user =", user ? user.id : "null");

    if (!authLoading && !user) {
      console.log("ProtectedRoute: Usuário NÃO autenticado e carregamento concluído. Redirecionando para /auth.");
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    console.log("ProtectedRoute: Ainda carregando o estado de autenticação. Exibindo spinner.");
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (user) {
    console.log("ProtectedRoute: Usuário autenticado. Renderizando filhos.");
    return <>{children}</>;
  }

  console.log("ProtectedRoute: Verificação de autenticação completa, usuário nulo. Não renderizando filhos e aguardando redirecionamento.");
  return null; // Não renderiza nada se não estiver autenticado e não estiver carregando (aguardando redirecionamento)
};

export default ProtectedRoute;