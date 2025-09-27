import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Sparkles, Building, Briefcase, Target, Trophy, PenTool, Heart, Flag, Activity, Stethoscope, Calculator } from "lucide-react"; // Removed Chrome, Linkedin

const authSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  fullName: z.string().optional().refine((val) => !val || (val.trim().length >= 2 && val.length <= 100), {
    message: "Nome deve ter entre 2 e 100 caracteres"
  }),
  // userType is now optional and will be set via invite or UserTypeSetup
  userType: z.string().optional() 
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "" // This will not be directly set in signup form anymore
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const { signUp, signIn, resendConfirmation, user } = useAuth(); // Removed signInWithGoogle, signInWithLinkedIn
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // User types for display purposes, not for direct selection during signup
  const userTypes = [
    {
      value: "player",
      label: "Jogador",
      icon: User,
      description: "Atleta profissional ou amador",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      value: "club",
      label: "Clube/Organização",
      icon: Building,
      description: "Representante de clube esportivo",
      color: "bg-red-50 border-red-200 hover:bg-red-100"
    },
    {
      value: "agent",
      label: "Agente",
      icon: Briefcase,
      description: "Empresário de jogadores",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      value: "coach",
      label: "Técnico",
      icon: Target,
      description: "Treinador ou preparador",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      value: "scout",
      label: "Olheiro",
      icon: Trophy,
      description: "Observador de talentos",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    {
      value: "medical_staff",
      label: "Staff Médico",
      icon: Stethoscope,
      description: "Profissional de saúde esportiva",
      color: "bg-teal-50 border-teal-200 hover:bg-teal-100"
    },
    {
      value: "financial_staff",
      label: "Staff Financeiro",
      icon: Calculator,
      description: "Profissional financeiro",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
    },
    {
      value: "technical_staff",
      label: "Staff Técnico",
      icon: Activity,
      description: "Analista ou preparador técnico",
      color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100"
    },
    {
      value: "journalist",
      label: "Jornalista",
      icon: PenTool,
      description: "Profissional de mídia esportiva",
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
    },
    {
      value: "fan",
      label: "Torcedor",
      icon: Heart,
      description: "Fã do futebol",
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form data
      const validationData = isSignUp 
        ? { ...formData, fullName: formData.fullName.trim() || undefined } // userType is not selected here
        : { email: formData.email, password: formData.password };
        
      authSchema.parse(validationData);

      let result;
      if (isSignUp) {
        // userType is not passed during initial signup, it will be set in UserTypeSetup or via invite
        result = await signUp(formData.email.trim(), formData.password, formData.fullName.trim());
      } else {
        result = await signIn(formData.email.trim(), formData.password);
        
        // Show resend button if email not confirmed error
        if (result.error && (
          result.error.message.includes("Email not confirmed") || 
          result.error.message.includes("email_not_confirmed")
        )) {
          setShowResendButton(true);
        }
      }

      if (!result.error && !isSignUp) {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    await resendConfirmation(formData.email.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-2xl"></div>
      </div>

      {/* Back to home button */}
      <Button
        variant="ghost" 
        className="absolute top-8 left-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Início
      </Button>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <img 
                  src="/images/arenaone-logo.svg" 
                  alt="ArenaOne" 
                  className="h-12 w-auto" 
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ArenaOne
            </CardTitle>
            <CardDescription className="text-base mt-2">
              O Sistema Operacional do Futebol Global
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => !loading && setIsSignUp(false)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => !loading && setIsSignUp(true)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Registrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
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
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 font-semibold py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      "Entrar na ArenaOne"
                    )}
                  </Button>

                  {showResendButton && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleResendConfirmation}
                      disabled={loading}
                    >
                      {loading ? "Reenviando..." : "Reenviar Email de Confirmação"}
                    </Button>
                  )}
                </form>

                {/* Removed social login section */}
                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={signInWithGoogle}
                    disabled={loading}
                  >
                    <Chrome className="w-4 h-4" />
                    Entrar com Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={signInWithLinkedIn}
                    disabled={loading}
                  >
                    <Linkedin className="w-4 h-4" />
                    Entrar com LinkedIn
                  </Button>
                </div> */}
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
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
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Removed userType selection from signup form as it will be handled by invite or UserTypeSetup */}
                  {/* <div className="space-y-3">
                    <Label className="text-sm font-medium">Tipo de Perfil *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            className={`
                              relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                              ${formData.userType === type.value 
                                ? 'border-primary bg-primary/5 shadow-md' 
                                : `border-border ${type.color}`
                              }
                            `}
                            onClick={() => handleInputChange("userType", type.value)}
                          >
                            <div className="flex flex-col items-center text-center space-y-2">
                              <Icon className={`w-6 h-6 ${formData.userType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div>
                                <p className={`text-sm font-medium ${formData.userType === type.value ? 'text-primary' : 'text-foreground'}`}>
                                  {type.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.userType && (
                      <p className="text-sm text-destructive">{errors.userType}</p>
                    )}
                  </div> */}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 font-semibold py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando conta...
                      </div>
                    ) : (
                      "Criar Conta ArenaOne"
                    )}
                  </Button>
                </form>

                {/* Removed social login section */}
                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={signInWithGoogle}
                    disabled={loading}
                  >
                    <Chrome className="w-4 h-4" />
                    Registrar com Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={signInWithLinkedIn}
                    disabled={loading}
                  >
                    <Linkedin className="w-4 h-4" />
                    Registrar com LinkedIn
                  </Button>
                </div> */}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;