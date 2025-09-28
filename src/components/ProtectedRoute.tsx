import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log("ProtectedRoute useEffect: authLoading =", authLoading, "user =", user ? user.id : "null");

    if (!authLoading && !user) {
      // Se não estiver carregando e o usuário for nulo, inicie um redirecionamento atrasado
      console.log("ProtectedRoute: Usuário NÃO autenticado. Agendando redirecionamento para /auth em 500ms.");
      redirectTimerRef.current = setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 500); // Pequeno atraso para contabilizar possíveis estados nulos transitórios
    } else if (user) {
      // Se o usuário estiver presente, limpe qualquer redirecionamento pendente
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
        console.log("ProtectedRoute: Usuário encontrado, redirecionamento pendente cancelado.");
      }
    }

    // Função de limpeza para limpar o timer se o componente for desmontado ou as dependências mudarem
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
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

  // Se a verificação de autenticação estiver completa e o usuário for nulo,
  // estamos aguardando o timer de redirecionamento ou ele já foi acionado.
  console.log("ProtectedRoute: Verificação de autenticação completa, usuário nulo. Aguardando redirecionamento ou já redirecionado. Retornando null.");
  return null; // Ou uma UI de fallback, se necessário
};

export default ProtectedRoute;