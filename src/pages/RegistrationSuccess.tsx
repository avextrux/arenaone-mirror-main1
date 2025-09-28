import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  // Opcional: Redirecionar para a página de login após um tempo,
  // ou deixar o usuário clicar para ir para o login.
  // Por enquanto, vamos deixar o usuário clicar.

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="text-center bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <MailCheck className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce-in" />
        <h1 className="text-3xl font-heading font-bold mb-4 text-foreground">
          Registro Quase Concluído!
        </h1>
        <p className="text-muted-foreground mb-6">
          Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
        </p>
        <Button onClick={() => navigate('/auth')} className="mt-4">
          Ir para a página de Login
        </Button>
      </div>
    </div>
  );
};

export default RegistrationSuccess;