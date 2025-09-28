import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/integrations/supabase/types";

const adminSignInSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
});

const AdminAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log("AdminAuth.tsx: Usuário logado, verificando status de admin...");
      checkAdminStatus(user.id);
    }
  }, [user]);

  const checkAdminStatus = async (userId: string) => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profileData?.user_type === UserType.Admin) { // Usar UserType.Admin
        console.log("AdminAuth.tsx: Usuário é admin, navegando para /admin-dashboard.");
        navigate("/admin-dashboard");
      } else {
        console.warn("AdminAuth.tsx: Usuário não é admin. Tipo:", profileData?.user_type);
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive",
        });
        // Opcionalmente, deslogar usuários não-admin que tentam acessar o login de admin
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("AdminAuth.tsx: Erro ao verificar status de admin:", error);
      toast({
        title: "Erro de Verificação",
        description: error.message || "Não foi possível verificar seu status de administrador.",
        variant: "destructive",
      });
      await supabase.auth.signOut(); // Garantir que o usuário seja deslogado em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    console.log("AdminAuth.tsx: Tentando login de admin...");

    try {
      adminSignInSchema.parse({
        email: formData.email.trim(),
        password: formData.password,
      });

      const { error: signInError } = await signIn(formData.email.trim(), formData.password);

      if (signInError) {
        // A mensagem de erro já é tratada pelo toast do useAuth
        setLoading(false);
        console.error("AdminAuth.tsx: Erro no login:", signInError);
        return;
      }

      // Se o login for bem-sucedido, o useEffect acionará checkAdminStatus
      console.log("AdminAuth.tsx: Login bem-sucedido, aguardando verificação de status de admin.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        console.error("AdminAuth.tsx: Erro de validação Zod:", fieldErrors);
      } else {
        console.error("AdminAuth.tsx: Erro inesperado no handleSubmit:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/5 rounded-full blur-2xl"></div>
      </div>

      <Button
        variant="ghost"
        className="absolute top-8 left-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Início
      </Button>

      <div className="w-full max-w-md relative z-10">
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-500/10 rounded-full">
                <Shield className="h-12 w-auto text-red-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Acesso restrito ao painel de administração.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@arenaone.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <span className="text-lg leading-none">›</span> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha de administrador"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <span className="text-lg leading-none">›</span> {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:opacity-90 font-semibold py-2.5 mt-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar como Administrador"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;