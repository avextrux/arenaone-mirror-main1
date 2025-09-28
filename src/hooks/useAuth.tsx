import { useEffect, useState, createContext, useContext, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string, userType?: string) => Promise<{ user: User | null, session: Session | null, error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null, session: Session | null, error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMounted = useRef(true); // Ref para verificar se o componente está montado
  const initialSessionChecked = useRef(false); // Ref para garantir que o loading seja definido como false apenas uma vez após a verificação inicial

  useEffect(() => {
    isMounted.current = true; // Marca como montado
    console.log("useAuth: useEffect iniciado. Configurando listener de auth state.");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted.current) {
          console.log("useAuth: Componente desmontado, ignorando atualização de estado.");
          return;
        }

        console.log(`useAuth: onAuthStateChange event: ${event}, session:`, currentSession);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Define loading como false apenas após a primeira verificação de sessão
        if (!initialSessionChecked.current) {
          setLoading(false);
          initialSessionChecked.current = true;
        }

        // Exibir toasts para eventos de autenticação
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo à ArenaOne.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'USER_UPDATED') {
          toast({
            title: "Perfil atualizado",
            description: "Suas informações foram atualizadas.",
          });
        }
      }
    );

    // Cleanup function
    return () => {
      isMounted.current = false; // Marca como desmontado
      console.log("useAuth: useEffect cleanup. Desinscrevendo listener de auth state.");
      subscription.unsubscribe();
    };
  }, [toast]); // Dependência de toast para garantir que a função de toast esteja sempre atualizada

  const signUp = async (email: string, password: string, fullName?: string, userType?: string) => {
    const emailConfirmationRedirectUrl = `${window.location.origin}/email-confirmation-success`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: emailConfirmationRedirectUrl,
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    });

    if (authError) {
      let message = "Erro ao criar conta.";
      if (authError.message.includes("User already registered")) {
        message = "Este email já está cadastrado. Tente fazer login.";
      } else if (authError.message.includes("Password")) {
        message = "A senha deve ter pelo menos 6 caracteres.";
      } else if (authError.message.includes("Email")) {
        message = "Por favor, insira um email válido.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });
      return { user: null, session: null, error: authError };
    } else {
      // O toast de sucesso para SIGNED_IN é tratado pelo onAuthStateChange
    }

    return { user: authData.user, session: authData.session, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = "Email ou senha incorretos.";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message.includes("Email not confirmed") || 
                 error.message.includes("email_not_confirmed")) {
        message = "Sua conta ainda não foi confirmada. Verifique seu email e clique no link de confirmação. Você pode reenviar o email de confirmação abaixo.";
      }
      
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    }

    return { user: data.user, session: data.session, error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation-success`
      }
    });

    if (error) {
      let message = "Erro ao reenviar email de confirmação.";
      if (error.message.includes("email_not_confirmed")) {
        message = "Email não confirmado. Tente novamente.";
      } else if (error.message.includes("rate_limit")) {
        message = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error.message.includes("over_email_send_rate_limit")) {
        message = "Limite de emails atingido. Aguarde alguns minutos antes de tentar novamente.";
      }
      
      toast({
        title: "Erro ao reenviar confirmação",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email de confirmação reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // O toast de sucesso/erro para SIGNED_OUT é tratado pelo onAuthStateChange
    return { error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};