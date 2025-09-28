import { useEffect, useState, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/integrations/supabase/types'; // Importar UserType

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
    console.log("useAuth.tsx: useEffect - Setting up auth state listener.");
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("useAuth.tsx: onAuthStateChange - Event:", event, "Session:", session);
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
      console.log("useAuth.tsx: getSession - Initial session check:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("useAuth.tsx: useEffect cleanup - Unsubscribing from auth state changes.");
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string, userType?: string) => {
    console.log("useAuth.tsx: signUp - Attempting to sign up user:", email);
    const redirectUrl = `${window.location.origin}/dashboard`; // Redirect to dashboard after signup
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      console.error("useAuth.tsx: signUp - Error:", authError);
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
      return { error: authError };
    } else {
      console.log("useAuth.tsx: signUp - Sign up successful, check email for confirmation.");
      
      // Se o registro for bem-sucedido, garanta que a tabela de perfis seja atualizada com user_type
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: fullName,
            user_type: userType as UserType, // Garante que o user_type seja salvo
          }, { onConflict: 'id' }); // Usa upsert para criar ou atualizar o perfil

        if (profileError) {
          console.error("useAuth.tsx: signUp - Erro ao atualizar a tabela de perfis:", profileError);
          toast({
            title: "Erro ao configurar perfil",
            description: "Sua conta foi criada, mas houve um problema ao configurar seu perfil inicial. Por favor, entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log("useAuth.tsx: signIn - Attempting to sign in user:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("useAuth.tsx: signIn - Error:", error);
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
    } else {
      console.log("useAuth.tsx: signIn - Supabase signInWithPassword call completed without direct error.");
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    console.log("useAuth.tsx: resendConfirmation - Attempting to resend confirmation for:", email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard` // Redirect to dashboard after confirmation
      }
    });

    if (error) {
      console.error("useAuth.tsx: resendConfirmation - Error:", error);
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
      console.log("useAuth.tsx: resendConfirmation - Confirmation email resent successfully.");
      toast({
        title: "Email de confirmação reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    console.log("useAuth.tsx: signOut - Attempting to sign out user.");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("useAuth.tsx: signOut - Error:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout.",
        variant: "destructive",
      });
    } else {
      console.log("useAuth.tsx: signOut - Logout successful.");
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