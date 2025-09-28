import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus, MessageCircle, EggFried as Verified, Check, Clock } from "lucide-react"; // Adicionado Check e Clock
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils";
import { Tables } from "@/integrations/supabase/types"; // Importando Tables para tipagem
import { useNavigate } from "react-router-dom"; // Importando useNavigate
import { AppProfile } from "@/types/app"; // Importar AppProfile

// Get the base row type from Supabase
type ProfileRow = Tables<'profiles'>;

// Define the Profile interface for this component, refining types as needed
interface Profile extends AppProfile {} // Usar AppProfile

interface Connection extends Tables<'connections'> {} // Tipo para conexões

const Network = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Inicializando useNavigate
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userConnections, setUserConnections] = useState<Connection[]>([]); // Estado para armazenar as conexões do usuário

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchUserConnections();
    }
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

      setProfiles(data as Profile[] || []); // Cast para Profile[]
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

  const fetchUserConnections = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching user connections:', error);
        return;
      }
      setUserConnections(data || []);
    } catch (error) {
      console.error('Error fetching user connections:', error);
    }
  };

  const getButtonState = (profileId: string) => {
    const connection = userConnections.find(
      (conn) =>
        (conn.requester_id === user?.id && conn.addressee_id === profileId) ||
        (conn.requester_id === profileId && conn.addressee_id === user?.id)
    );

    if (!connection) {
      return { text: "Conectar", variant: "default", icon: UserPlus, disabled: false };
    }

    if (connection.status === 'pending') {
      if (connection.requester_id === user?.id) {
        return { text: "Pendente", variant: "outline", icon: Clock, disabled: true };
      } else {
        // This user received the request, they can accept/reject
        return { text: "Aceitar Conexão", variant: "default", icon: UserPlus, disabled: false };
      }
    }

    if (connection.status === 'accepted') {
      return { text: "Conectado", variant: "secondary", icon: Check, disabled: true };
    }

    return { text: "Conectar", variant: "default", icon: UserPlus, disabled: false };
  };

  const handleConnect = async (profileId: string) => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para enviar solicitações de conexão.",
        variant: "destructive",
      });
      return;
    }

    const existingConnection = userConnections.find(
      (conn) =>
        (conn.requester_id === user.id && conn.addressee_id === profileId) ||
        (conn.requester_id === profileId && conn.addressee_id === user.id)
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending' && existingConnection.addressee_id === user.id) {
        await handleAcceptConnection(existingConnection.id);
      } else {
        toast({
          title: "Conexão existente",
          description: "Você já tem uma conexão pendente ou aceita com este perfil.",
          variant: "default",
        });
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert([{ requester_id: user.id, addressee_id: profileId, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;

      // Get current user's profile for notification
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const senderName = currentUserProfile?.full_name || user.email;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: profileId,
          type: 'connection_request',
          title: 'Nova solicitação de conexão',
          description: `${senderName} quer se conectar com você.`,
          related_entity_id: data.id,
        }]);

      if (notificationError) console.error('Error sending notification:', notificationError);
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de conexão foi enviada.",
      });
      fetchUserConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível enviar a solicitação de conexão.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;

      // Send notification to the requester
      const connection = userConnections.find(c => c.id === connectionId);
      if (connection && user) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: connection.requester_id,
            type: 'connection_request',
            title: 'Solicitação de conexão aceita!',
            description: `${user.user_metadata.full_name || user.email} aceitou sua solicitação de conexão.`,
            related_entity_id: connection.id,
          }]);
        if (notificationError) console.error('Error sending acceptance notification:', notificationError);
      }

      toast({
        title: "Conexão aceita!",
        description: "Você agora está conectado com este perfil.",
      });
      fetchUserConnections(); // Refresh connections to update UI
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Erro ao aceitar conexão",
        description: "Não foi possível aceitar a solicitação de conexão.",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (profileId: string) => {
    navigate('/dashboard/messages', { state: { targetUserId: profileId } });
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.user_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredProfiles.map((profile) => {
          const buttonState = getButtonState(profile.id);
          const Icon = buttonState.icon;

          return (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      variant={buttonState.variant as any} // Cast to any because shadcn Button variant type is strict
                      onClick={() => handleConnect(profile.id)}
                      disabled={buttonState.disabled}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {buttonState.text}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleMessage(profile.id)}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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