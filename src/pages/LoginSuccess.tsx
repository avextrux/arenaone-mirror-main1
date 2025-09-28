import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Obter user e loading do contexto de autenticação

  useEffect(() => {
    if (!loading) { // Uma vez que o estado de autenticação é resolvido (não está carregando)
      if (user) {
        // Se o usuário estiver presente, navegue para o dashboard imediatamente
        navigate('/dashboard', { replace: true });
      } else {
        // Se não houver usuário, algo deu errado ou a sessão expirou, redirecione para o auth
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, navigate]); // Depender de user e loading

  // Renderiza um estado de carregamento enquanto a autenticação está sendo verificada
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="text-center bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce-in" />
          <h1 className="text-3xl font-heading font-bold mb-4 text-foreground">
            Login Realizado com Sucesso!
          </h1>
          <p className="text-muted-foreground mb-6">
            Verificando seu status de autenticação...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver carregando e o useEffect já tiver navegado, este componente será desmontado.
  // Caso contrário, renderiza nulo.
  return null;
};

export default LoginSuccess;