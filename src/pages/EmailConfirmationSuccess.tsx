import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle } from 'lucide-react';

const EmailConfirmationSuccess = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and user is authenticated, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
    // If not loading and no user, it means confirmation failed or user is not logged in
    // In a real app, you might want to show an error or redirect to login
    if (!loading && !user) {
      // Optionally, redirect to login or show an error if confirmation didn't lead to a logged-in state
      // For now, we'll just let the loading state handle it until user is confirmed
      // console.warn("Email confirmation page loaded, but no user found after loading. User might need to log in.");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="text-center bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce-in" />
        <h1 className="text-3xl font-heading font-bold mb-4 text-foreground">
          Registro Concluído!
        </h1>
        <p className="text-muted-foreground mb-6">
          Seu e-mail foi confirmado com sucesso. Estamos preparando seu dashboard.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default EmailConfirmationSuccess;