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
import { User, Settings, Camera, MapPin, Globe, Mail, Save, Edit, Briefcase, Award, Target, Calendar, Flag, Foot, Ruler, Weight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils";
import { UserType } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  user_type: UserType | null;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  specialization?: string;
  experience?: string;
  achievements?: string;
}

interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  position: string;
  date_of_birth: string;
  height: number | null;
  weight: number | null;
  preferred_foot: string | null;
  market_value: number | null;
  contract_start: string | null;
  contract_end: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    user_type: "" as UserType | "",
    specialization: "",
    experience: "",
    achievements: "",
  });
  const [playerFormData, setPlayerFormData] = useState({
    date_of_birth: "",
    nationality: "",
    position: "",
    preferred_foot: "",
    height: "",
    weight: "",
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
          user_type: data.user_type || "",
          specialization: data.specialization || "",
          experience: data.experience || "",
          achievements: data.achievements || ""
        });

        if (data.user_type === 'player') {
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (playerError && playerError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error fetching player profile:', playerError);
          }

          if (playerData) {
            setPlayerProfile(playerData);
            setPlayerFormData({
              date_of_birth: playerData.date_of_birth || "",
              nationality: playerData.nationality || "",
              position: playerData.position || "",
              preferred_foot: playerData.preferred_foot || "",
              height: playerData.height?.toString() || "",
              weight: playerData.weight?.toString() || "",
            });
          }
        } else {
          setPlayerProfile(null);
          setPlayerFormData({
            date_of_birth: "", nationality: "", position: "", preferred_foot: "", height: "", weight: ""
          });
        }
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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          specialization: formData.specialization,
          experience: formData.experience,
          achievements: formData.achievements
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          title: "Erro ao atualizar perfil",
          description: "Ocorreu um erro ao salvar suas informações.",
          variant: "destructive",
        });
        return;
      }

      if (profile?.user_type === 'player') {
        const { error: playerError } = await supabase
          .from('players')
          .update({
            date_of_birth: playerFormData.date_of_birth,
            nationality: playerFormData.nationality,
            position: playerFormData.position,
            preferred_foot: playerFormData.preferred_foot || null,
            height: playerFormData.height ? parseInt(playerFormData.height) : null,
            weight: playerFormData.weight ? parseInt(playerFormData.weight) : null,
          })
          .eq('profile_id', user.id);

        if (playerError) {
          console.error('Error updating player profile:', playerError);
          toast({
            title: "Erro ao atualizar perfil de jogador",
            description: "Ocorreu um erro ao salvar suas informações de jogador.",
            variant: "destructive",
          });
          return;
        }
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

  const handlePlayerInputChange = (field: string, value: string) => {
    setPlayerFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
                      {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                    <Select 
                      value={formData.user_type}
                      onValueChange={(value: UserType) => setFormData(prev => ({ ...prev, user_type: value }))}
                      disabled={true} // User type should not be editable here
                    >
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
                        <SelectItem value="medical_staff">Staff Médico</SelectItem>
                        <SelectItem value="financial_staff">Staff Financeiro</SelectItem>
                        <SelectItem value="technical_staff">Staff Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{getUserTypeLabel(profile.user_type)}</p>
                  )}
                </div>

                {profile.user_type === 'player' && playerProfile && (
                  <>
                    <div>
                      <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                      {editMode ? (
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={playerFormData.date_of_birth}
                          onChange={(e) => handlePlayerInputChange("date_of_birth", e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {playerProfile.date_of_birth ? `${new Date(playerProfile.date_of_birth).toLocaleDateString('pt-BR')} (${calculateAge(playerProfile.date_of_birth)} anos)` : "Não informado"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nacionalidade</Label>
                      {editMode ? (
                        <Input
                          id="nationality"
                          value={playerFormData.nationality}
                          onChange={(e) => handlePlayerInputChange("nationality", e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Flag className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{playerProfile.nationality || "Não informado"}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="position">Posição</Label>
                      {editMode ? (
                        <Select
                          value={playerFormData.position}
                          onValueChange={(value) => handlePlayerInputChange("position", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a posição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Goleiro">Goleiro</SelectItem>
                            <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                            <SelectItem value="Lateral Direito">Lateral Direito</SelectItem>
                            <SelectItem value="Lateral Esquerdo">Lateral Esquerdo</SelectItem>
                            <SelectItem value="Volante">Volante</SelectItem>
                            <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                            <SelectItem value="Ponta Direita">Ponta Direita</SelectItem>
                            <SelectItem value="Ponta Esquerda">Ponta Esquerda</SelectItem>
                            <SelectItem value="Atacante">Atacante</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{playerProfile.position || "Não informado"}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="preferred_foot">Pé Preferido</Label>
                      {editMode ? (
                        <Select
                          value={playerFormData.preferred_foot}
                          onValueChange={(value) => handlePlayerInputChange("preferred_foot", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o pé" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Direito">Direito</SelectItem>
                            <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                            <SelectItem value="Ambos">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Foot className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{playerProfile.preferred_foot || "Não informado"}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="height">Altura (cm)</Label>
                      {editMode ? (
                        <Input
                          id="height"
                          type="number"
                          value={playerFormData.height}
                          onChange={(e) => handlePlayerInputChange("height", e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Ruler className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{playerProfile.height ? `${playerProfile.height} cm` : "Não informado"}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="weight">Peso (kg)</Label>
                      {editMode ? (
                        <Input
                          id="weight"
                          type="number"
                          value={playerFormData.weight}
                          onChange={(e) => handlePlayerInputChange("weight", e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Weight className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{playerProfile.weight ? `${playerProfile.weight} kg` : "Não informado"}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

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

                {/* NEW FIELD: Specialization */}
                <div>
                  <Label htmlFor="specialization">Especialização</Label>
                  {editMode ? (
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="Ex: Meio-campo, Análise Tática"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profile.specialization || "Não informado"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biografia e Experiência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {/* NEW FIELD: Experience */}
                <div>
                  <Label htmlFor="experience">Experiência</Label>
                  {editMode ? (
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Descreva sua experiência profissional..."
                      className="mt-1 min-h-32"
                    />
                  ) : (
                    <div className="flex items-start gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.experience || "Nenhuma experiência adicionada ainda."}
                      </p>
                    </div>
                  )}
                </div>

                {/* NEW FIELD: Achievements */}
                <div>
                  <Label htmlFor="achievements">Conquistas</Label>
                  {editMode ? (
                    <Textarea
                      id="achievements"
                      value={formData.achievements}
                      onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                      placeholder="Liste suas principais conquistas..."
                      className="mt-1 min-h-32"
                    />
                  ) : (
                    <div className="flex items-start gap-2 mt-1">
                      <Award className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.achievements || "Nenhuma conquista adicionada ainda."}
                      </p>
                    </div>
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