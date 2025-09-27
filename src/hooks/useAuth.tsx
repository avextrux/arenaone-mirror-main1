import { useEffect, useState, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo à ArenaOne.",
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string, userType?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`; 
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    });

    if (error) {
      let message = "Erro ao criar conta.";
      if (error.message.includes("User already registered")) {
        message = "Este e-mail já está registrado. Tente fazer login ou redefinir a senha.";
      } else if (error.message.includes("Password should be at least 6 characters")) {
        message = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes("AuthApiError: Email not confirmed")) {
        message = "Sua conta foi criada, mas o e-mail não foi confirmado. Verifique sua caixa de entrada e spam.";
      } else if (error.message.includes("Email link is invalid or has expired")) {
        message = "O link de confirmação de e-mail é inválido ou expirou. Por favor, solicite um novo.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar a conta e fazer login.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = "Email ou senha incorretos.";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        message = "Sua conta ainda não foi confirmada. Verifique seu e-mail e clique no link de confirmação. Você pode reenviar o e-mail de confirmação abaixo.";
      } else if (error.message.includes("User not found")) {
        message = "Usuário não encontrado. Verifique o e-mail ou registre-se.";
      }
      
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard` 
      }
    });

    if (error) {
      let message = "Erro ao reenviar e-mail de confirmação.";
      if (error.message.includes("email_not_confirmed")) {
        message = "E-mail não confirmado. Tente novamente.";
      } else if (error.message.includes("rate_limit") || error.message.includes("over_email_send_rate_limit")) {
        message = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error.message.includes("User not found")) {
        message = "Nenhuma conta encontrada com este e-mail.";
      }
      
      toast({
        title: "Erro ao reenviar confirmação",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "E-mail de confirmação reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    }

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