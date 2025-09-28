import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Obter user e loading do contexto de autenticação

  useEffect(() => {
    if (!loading && user) { // Apenas redirecionar se não estiver carregando e o usuário estiver presente
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000); // Reduzir o atraso, pois já estamos esperando pelo estado de autenticação

      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // Se não estiver carregando e não houver usuário, algo deu errado com o login, redirecionar para o auth
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]); // Depender de user e loading

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="text-center bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce-in" />
        <h1 className="text-3xl font-heading font-bold mb-4 text-foreground">
          Login Realizado com Sucesso!
        </h1>
        <p className="text-muted-foreground mb-6">
          Você será redirecionado para o seu dashboard em breve.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;