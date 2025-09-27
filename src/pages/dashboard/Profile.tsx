import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Settings, Camera, MapPin, Globe, Mail, Save, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  user_type: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    user_type: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          user_type: data.user_type || ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          user_type: formData.user_type as any
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: "Ocorreu um erro ao salvar suas informações.",
          variant: "destructive",
        });
        return;
      }

      await fetchProfile();
      setEditMode(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getUserTypeColor = (userType: string) => {
    const colors = {
      player: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      club: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      coach: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      scout: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      journalist: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      fan: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[userType as keyof typeof colors] || colors.fan;
  };

  const getUserTypeLabel = (userType: string) => {
    const labels = {
      player: "Jogador",
      club: "Clube", 
      agent: "Agente",
      coach: "Técnico",
      scout: "Olheiro",
      journalist: "Jornalista",
      fan: "Torcedor"
    };
    return labels[userType as keyof typeof labels] || "Usuário";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações profissionais
          </p>
        </div>
        <Button 
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={saving}
        >
          {editMode ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    {profile.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        ✓ Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <Badge className={`mb-4 ${getUserTypeColor(profile.user_type)}`}>
                    {getUserTypeLabel(profile.user_type)}
                  </Badge>
                  
                  <div className="grid grid-cols-3 gap-8 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.posts_count}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.followers_count}</p>
                      <p className="text-sm text-muted-foreground">Seguidores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.following_count}</p>
                      <p className="text-sm text-muted-foreground">Seguindo</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  {editMode ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{profile.full_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="user_type">Função</Label>
                  {editMode ? (
                    <Select value={formData.user_type} onValueChange={(value) => setFormData(prev => ({ ...prev, user_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Jogador</SelectItem>
                        <SelectItem value="club">Clube</SelectItem>
                        <SelectItem value="agent">Agente</SelectItem>
                        <SelectItem value="coach">Técnico</SelectItem>
                        <SelectItem value="scout">Olheiro</SelectItem>
                        <SelectItem value="journalist">Jornalista</SelectItem>
                        <SelectItem value="fan">Torcedor</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{getUserTypeLabel(profile.user_type)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Localização</Label>
                  {editMode ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, País"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profile.location || "Não informado"}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  {editMode ? (
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://seusite.com"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="bio">Sobre você</Label>
                  {editMode ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      className="mt-1 min-h-32"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {profile.bio || "Nenhuma biografia adicionada ainda."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {editMode && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Privacidade</h3>
                <div className="space-y-2">
                  <Label>Visibilidade do Perfil</Label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                      <SelectItem value="connections">Apenas Conexões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Notificações</h3>
                <div className="space-y-2">
                  <Label>Email de Notificação</Label>
                  <Select defaultValue="important">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as notificações</SelectItem>
                      <SelectItem value="important">Apenas importantes</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button variant="destructive">
                  Desativar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;