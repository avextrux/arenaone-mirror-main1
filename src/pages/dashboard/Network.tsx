import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus, MessageCircle, Verified } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_type: string;
  bio?: string;
  location?: string;
  verified: boolean;
}

const Network = () => {
  const { user } = useAuth();
  const { toast } = useToast(); // Initialize useToast
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [user]); // Re-fetch if user changes

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '') // Exclude current user's profile
        .limit(20); // Limit to 20 profiles for initial load

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Erro ao carregar perfis",
          description: "Não foi possível carregar a rede de profissionais.",
          variant: "destructive",
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Erro ao carregar perfis",
        description: "Ocorreu um erro inesperado ao carregar a rede.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.user_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = (profileId: string) => {
    // Implement connection logic here
    toast({
      title: "Conectar",
      description: `Solicitação de conexão enviada para ${profileId}. (Funcionalidade em desenvolvimento)`,
    });
  };

  const handleMessage = (profileId: string) => {
    // Implement message logic here, potentially navigating to messages page with pre-selected user
    toast({
      title: "Mensagem",
      description: `Iniciando conversa com ${profileId}. (Funcionalidade em desenvolvimento)`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando rede...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Rede Profissional
          </h1>
          <p className="text-muted-foreground">
            Conecte-se com profissionais do futebol mundial
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, função ou localização..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Network Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                  {profile.full_name}
                  {profile.verified && (
                    <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </h3>
                
                <Badge className={`mb-3 ${getUserTypeColor(profile.user_type)}`}>
                  {getUserTypeLabel(profile.user_type)}
                </Badge>
                
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                
                {profile.location && (
                  <p className="text-xs text-muted-foreground mb-4">
                    📍 {profile.location}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleConnect(profile.id)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Conectar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleMessage(profile.id)}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os termos da sua busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Network;