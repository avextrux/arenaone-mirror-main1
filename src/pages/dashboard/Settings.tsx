import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Bell, Lock, User, Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileSettings, setProfileSettings] = useState({
    emailNotifications: "important",
    profileVisibility: "public",
    twoFactorAuth: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user settings
    const fetchUserSettings = async () => {
      setLoading(true);
      // In a real app, fetch from Supabase or a settings table
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfileSettings({
        emailNotifications: "important",
        profileVisibility: "public",
        twoFactorAuth: false,
      });
      setLoading(false);
    };
    fetchUserSettings();
  }, []);

  const handleSaveSettings = async () => {
    // In a real app, save to Supabase
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("As novas senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Supabase does not have a direct "change password" function that requires old password
      // It's usually done via resetPasswordForEmail or update user with new password (if authenticated)
      // For this example, we'll simulate success if passwords match basic criteria.
      // In a real app, you'd need to re-authenticate the user or use a server-side function.
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Erro ao alterar a senha.");
      toast({
        title: "Erro ao alterar senha",
        description: err.message || "Não foi possível alterar sua senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja desativar sua conta? Esta ação é irreversível.")) {
      return;
    }
    setLoading(true);
    try {
      // In a real app, this would involve deleting user data and then the user itself
      // Supabase's `deleteUser` is typically a server-side admin function.
      // For client-side, you might just sign out and mark the profile for deletion.
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deletion
      await signOut();
      toast({
        title: "Conta desativada",
        description: "Sua conta foi desativada com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erro ao desativar conta",
        description: "Não foi possível desativar sua conta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e segurança da conta
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          Salvar Configurações
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Visibilidade do Perfil</Label>
              <Select 
                value={profileSettings.profileVisibility} 
                onValueChange={(value) => setProfileSettings(prev => ({ ...prev, profileVisibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a visibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="connections">Apenas Conexões</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Alterne entre modo claro, escuro ou sistema.</p>
                <ThemeToggle />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailNotifications">Notificações por Email</Label>
              <Select 
                value={profileSettings.emailNotifications} 
                onValueChange={(value) => setProfileSettings(prev => ({ ...prev, emailNotifications: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Frequência de emails" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as notificações</SelectItem>
                  <SelectItem value="important">Apenas importantes</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="inAppNotifications">Notificações no Aplicativo</Label>
              <Switch id="inAppNotifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="font-semibold text-lg">Alterar Senha</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmNewPassword" 
                    type="password" 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="font-semibold text-lg">Autenticação de Dois Fatores (2FA)</h3>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="twoFactorAuth">Ativar 2FA</Label>
                <Switch 
                  id="twoFactorAuth" 
                  checked={profileSettings.twoFactorAuth}
                  onCheckedChange={(checked) => setProfileSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="font-semibold text-lg text-destructive">Desativar Conta</h3>
              <p className="text-sm text-muted-foreground">
                Ao desativar sua conta, você removerá permanentemente seu perfil e todos os seus dados da ArenaOne. Esta ação não pode ser desfeita.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Desativar Minha Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;