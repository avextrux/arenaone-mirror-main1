import { useEffect, useState, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  // signInWithGoogle: () => Promise<void>; // Removed
  // signInWithLinkedIn: () => Promise<void>; // Removed
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Show success toast for login/signup
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo à ArenaOne.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string, userType?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`; // Redirect to dashboard after signup
    
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
        message = "Este email já está cadastrado. Tente fazer login.";
      } else if (error.message.includes("Password")) {
        message = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes("Email")) {
        message = "Por favor, insira um email válido.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
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
      } else if (error.message.includes("Email not confirmed")) {
        message = "Sua conta ainda não foi confirmada. Verifique seu email e clique no link de confirmação. Você pode reenviar o email de confirmação abaixo.";
      } else if (error.message.includes("email_not_confirmed")) {
        message = "Sua conta ainda não foi confirmada. Verifique seu email e clique no link de confirmação. Você pode reenviar o email de confirmação abaixo.";
      }
      
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    }

    return { error };
  };

  // const signInWithGoogle = async () => { // Removed
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       redirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard after OAuth
  //     },
  //   });
  //   if (error) {
  //     toast({
  //       title: "Erro no login com Google",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // };

  // const signInWithLinkedIn = async () => { // Removed
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'linkedin_oidc', // Use 'linkedin_oidc' for OpenID Connect
  //     options: {
  //       redirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard after OAuth
  //     },
  //   });
  //   if (error) {
  //     toast({
  //       title: "Erro no login com LinkedIn",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard` // Redirect to dashboard after confirmation
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
    // signInWithGoogle, // Removed
    // signInWithLinkedIn, // Removed
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