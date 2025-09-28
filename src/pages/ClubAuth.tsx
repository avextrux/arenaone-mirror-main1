import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Building, Flag, Calendar, Globe, Upload, FileText, Image as ImageIcon, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { TablesInsert } from "@/integrations/supabase/types";

// Esquema de validação para o formulário de registro de clube
const clubSignUpSchema = z.object({
  clubName: z.string().min(2, "Nome do clube deve ter pelo menos 2 caracteres").max(100, "Nome do clube muito longo"),
  country: z.string().min(2, "País deve ter pelo menos 2 caracteres").max(50, "País muito longo"),
  foundedYear: z.string().regex(/^\d{4}$/, "Ano de fundação inválido"),
  managerEmail: z.string().email("Email do gerente inválido").max(255, "Email muito longo"),
  managerPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  inviteCode: z.string().min(1, "Código de convite é obrigatório"),
});

const ClubAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    clubName: "",
    country: "",
    foundedYear: "",
    league: "",
    stadium: "",
    managerEmail: "",
    managerPassword: "",
    inviteCode: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { signUp, signIn, user } = useAuth(); // Usar signIn para verificar se o usuário já existe
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, GIF, SVG, WEBP).",
          variant: "destructive",
        });
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const uploadLogo = async (file: File, userId: string) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `club_logos/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('club-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro ao fazer upload da logo: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('club-logos')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error("Não foi possível obter a URL pública da logo.");
    }

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      clubSignUpSchema.parse({
        clubName: formData.clubName.trim(),
        country: formData.country.trim(),
        foundedYear: formData.foundedYear,
        managerEmail: formData.managerEmail.trim(),
        managerPassword: formData.managerPassword,
        inviteCode: formData.inviteCode.trim(),
      });

      // 1. Validate Invite Code
      const { data: inviteData, error: inviteError } = await supabase
        .from('club_members')
        .select('*')
        .eq('invite_code', formData.inviteCode.trim())
        .eq('status', 'pending')
        .is('user_id', null) // Must be an unassigned invite
        .eq('department', 'management') // Must be for a manager
        .eq('permission_level', 'admin') // Must have admin permissions
        .single();

      if (inviteError || !inviteData) {
        throw new Error("Código de convite inválido, já utilizado ou não é para registro de clube.");
      }

      let managerUserId = user?.id; // If already logged in
      let isNewUser = false;

      // 2. Check if manager email already exists as a user
      const { data: existingUsers, error: fetchUserError } = await supabase.auth.admin.listUsers({
        email: formData.managerEmail.trim(),
      });

      if (fetchUserError) throw fetchUserError;

      if (existingUsers.users.length > 0) {
        // User already exists, try to sign them in
        const { error: signInError } = await signIn(formData.managerEmail.trim(), formData.managerPassword);
        if (signInError) {
          throw new Error("Email já registrado. Por favor, faça login com sua senha existente ou use um email diferente.");
        }
        managerUserId = existingUsers.users[0].id;
      } else {
        // User does not exist, create new user
        const { error: signUpError } = await signUp(formData.managerEmail.trim(), formData.managerPassword, formData.clubName.trim(), 'club'); // Pass 'club' as userType
        if (signUpError) throw signUpError;
        
        // After successful signup, the user object in useAuth should be updated
        // We need to wait for the session to be established to get the new user ID
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (!newUser) throw new Error("Erro ao obter informações do novo usuário após o registro.");
        managerUserId = newUser.id;
        isNewUser = true;
      }

      if (!managerUserId) throw new Error("Não foi possível determinar o ID do gerente.");

      // 3. Upload Club Logo
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, managerUserId);
      }

      // 4. Create Club
      const clubPayload: TablesInsert<'clubs'> = {
        name: formData.clubName.trim(),
        country: formData.country.trim(),
        founded_year: parseInt(formData.foundedYear),
        league: formData.league.trim() || null,
        stadium: formData.stadium.trim() || null,
        logo_url: logoUrl,
        manager_id: managerUserId,
      };

      const { data: newClub, error: clubError } = await supabase
        .from('clubs')
        .insert([clubPayload])
        .select()
        .single();

      if (clubError) throw clubError;

      // 5. Update Club Membership (the invite)
      const { error: updateInviteError } = await supabase
        .from('club_members')
        .update({
          user_id: managerUserId,
          club_id: newClub.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          used: true,
        })
        .eq('id', inviteData.id); // Use the ID of the validated invite

      if (updateInviteError) throw updateInviteError;

      // 6. Update Manager's Profile to user_type 'club'
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ user_type: 'club' })
        .eq('id', managerUserId);

      if (profileUpdateError) console.error('Error updating manager profile user_type:', profileUpdateError);

      toast({
        title: "Clube registrado com sucesso!",
        description: "Você foi registrado como gerente do clube.",
      });
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error: any) {
      console.error('Error during club registration:', error);
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Erro no registro do clube",
          description: error.message || "Ocorreu um erro inesperado ao registrar o clube.",
          variant: "destructive",
        });
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-2xl"></div>
      </div>

      <Button
        variant="ghost"
        className="absolute top-8 left-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        onClick={() => navigate("/auth")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Login
      </Button>

      <div className="w-full max-w-3xl relative z-10">
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Building className="h-12 w-auto text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Registrar Clube
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Use seu código de convite para registrar seu clube e se tornar o gerente.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações do Clube
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clubName">Nome do Clube *</Label>
                  <Input
                    id="clubName"
                    placeholder="Ex: ArenaOne FC"
                    value={formData.clubName}
                    onChange={(e) => handleInputChange("clubName", e.target.value)}
                    className={`${errors.clubName ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                  {errors.clubName && <p className="text-sm text-destructive mt-1">{errors.clubName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <Input
                    id="country"
                    placeholder="Ex: Brasil"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className={`${errors.country ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                  {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Ano de Fundação *</Label>
                  <Select
                    value={formData.foundedYear}
                    onValueChange={(value) => handleInputChange("foundedYear", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={`${errors.foundedYear ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.foundedYear && <p className="text-sm text-destructive mt-1">{errors.foundedYear}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="league">Liga/Campeonato</Label>
                  <Input
                    id="league"
                    placeholder="Ex: Série A"
                    value={formData.league}
                    onChange={(e) => handleInputChange("league", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stadium">Estádio</Label>
                <Input
                  id="stadium"
                  placeholder="Ex: ArenaOne Stadium"
                  value={formData.stadium}
                  onChange={(e) => handleInputChange("stadium", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_upload">Logo do Clube (Imagem)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                    disabled={loading}
                  />
                  {logoPreview && (
                    <div className="w-16 h-16 flex-shrink-0 border rounded-md flex items-center justify-center overflow-hidden">
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {!logoFile && (
                    <div className="w-16 h-16 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {logoFile && (
                  <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {logoFile.name}</p>
                )}
              </div>

              <h3 className="text-xl font-semibold flex items-center gap-2 mt-8">
                <Mail className="w-5 h-5" />
                Informações do Gerente
              </h3>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">Email do Gerente *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="managerEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.managerEmail}
                    onChange={(e) => handleInputChange("managerEmail", e.target.value)}
                    className={`pl-10 ${errors.managerEmail ? "border-destructive" : ""}`}
                    disabled={loading}
                  />
                </div>
                {errors.managerEmail && <p className="text-sm text-destructive mt-1">{errors.managerEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerPassword">Senha do Gerente *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="managerPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.managerPassword}
                    onChange={(e) => handleInputChange("managerPassword", e.target.value)}
                    className={`pl-10 pr-10 ${errors.managerPassword ? "border-destructive" : ""}`}
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
                {errors.managerPassword && <p className="text-sm text-destructive mt-1">{errors.managerPassword}</p>}
              </div>

              <h3 className="text-xl font-semibold flex items-center gap-2 mt-8">
                <KeyRound className="w-5 h-5" />
                Código de Convite
              </h3>
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Código de Convite *</Label>
                <Input
                  id="inviteCode"
                  placeholder="Digite o código de convite fornecido pela moderação"
                  value={formData.inviteCode}
                  onChange={(e) => handleInputChange("inviteCode", e.target.value)}
                  className={`${errors.inviteCode ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.inviteCode && <p className="text-sm text-destructive mt-1">{errors.inviteCode}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 font-semibold py-2.5 mt-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando Clube...
                  </div>
                ) : (
                  "Registrar Clube na ArenaOne"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ao registrar um clube, você concorda com nossos{" "}
                <a href="/terms-of-service" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubAuth;