import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building, Users, Trophy, TrendingUp, Calendar, Star, MapPin, Phone, Mail, Globe, Edit, Plus, BarChart3, Construction } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";
import { ClubMembership as DashboardClubMembership } from "@/pages/Dashboard";
import { format } from 'date-fns'; // Importado para formatar datas

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  nationality: string;
  date_of_birth: string;
  market_value: number;
}

interface ClubDetails {
  id: string;
  name: string;
  founded_year: number;
  stadium: string;
  league: string;
  country: string;
  logo_url?: string;
  // Adicione outros campos do clube conforme necessário
}

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  competition: string;
  // Joined data for club names
  home_clubs: { name: string } | null;
  away_clubs: { name: string } | null;
}

interface ClubManagementProps {
  clubMemberships: DashboardClubMembership[];
}

const ClubManagement = ({ clubMemberships }: ClubManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubInfo, setClubInfo] = useState<ClubDetails | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]); // Novo estado para próximos jogos

  const fetchClubDetails = useCallback(async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (error) throw error;
      setClubInfo(data as ClubDetails);
    } catch (error) {
      console.error('Error fetching club details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do clube.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchPlayers = useCallback(async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('current_club_id', clubId)
        .limit(20);

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);

  const fetchUpcomingMatches = useCallback(async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_clubs:home_team_id (name),
          away_clubs:away_team_id (name)
        `)
        .or(`home_team_id.eq.${clubId},away_team_id.eq.${clubId}`)
        .gte('match_date', format(new Date(), 'yyyy-MM-dd')) // Only future matches
        .order('match_date', { ascending: true })
        .limit(3); // Show next 3 matches

      if (error) throw error;
      setUpcomingMatches(data as Match[] || []); // <-- Correção aplicada aqui
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os próximos jogos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (clubMemberships.length > 0) {
        const primaryClubId = clubMemberships[0].club_id;
        await fetchClubDetails(primaryClubId);
        await fetchPlayers(primaryClubId);
        await fetchUpcomingMatches(primaryClubId); // Fetch matches
      } else {
        setClubInfo(null);
        setUpcomingMatches([]); // Clear matches if no club
      }
      setLoading(false);
    };
    loadData();
  }, [clubMemberships, fetchClubDetails, fetchPlayers, fetchUpcomingMatches]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPositionColor = (position: string) => {
    const colors = {
      'Goleiro': 'bg-yellow-100 text-yellow-800',
      'Zagueiro': 'bg-blue-100 text-blue-800',
      'Lateral': 'bg-green-100 text-green-800',
      'Volante': 'bg-purple-100 text-purple-800',
      'Meio-campo': 'bg-orange-100 text-orange-800',
      'Atacante': 'bg-red-100 text-red-800'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando informações do clube...</p>
        </div>
      </div>
    );
  }

  if (!clubInfo) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum clube encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Você precisa estar vinculado a um clube para gerenciar suas informações.
          </p>
          {/* Poderíamos adicionar um botão para criar/solicitar acesso aqui, se necessário */}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Building className="w-6 h-6" />
            Gestão do Clube
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os aspectos do seu clube
          </p>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Editar Clube
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="squad">Elenco</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="facilities">Instalações</TabsTrigger>
          <TabsTrigger value="finances">Finanças</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Club Info Card */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Club Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informações do Clube
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                    {clubInfo.logo_url ? (
                      <img src={clubInfo.logo_url} alt={`${clubInfo.name} Logo`} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{clubInfo.name}</h2>
                    <p className="text-muted-foreground">Fundado em {clubInfo.founded_year}</p>
                    <Badge className="mt-2">{clubInfo.league}</Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Estádio:</span>
                      <span className="font-medium">{clubInfo.stadium || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">País:</span>
                      <span className="font-medium">{clubInfo.country}</span>
                    </div>
                    {/* Adicionar website, phone, email se existirem na tabela clubs */}
                    {/* <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Website:</span>
                      <span className="font-medium text-primary">{clubInfo.website || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{clubInfo.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{clubInfo.email || 'Não informado'}</span>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{players.length}</p>
                  <p className="text-xs text-muted-foreground">Jogadores no Elenco</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">€{
                    (players.reduce((sum, player) => sum + (player.market_value || 0), 0) / 1_000_000).toFixed(1)
                  }M</p>
                  <p className="text-xs text-muted-foreground">Valor do Elenco</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {players.length > 0 ? (players.reduce((sum, player) => sum + calculateAge(player.date_of_birth), 0) / players.length).toFixed(0) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Idade Média</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(players.map(p => p.nationality)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Nacionalidades</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance da Temporada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center py-8">
                <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Dados de performance da temporada em desenvolvimento.
                  <br />
                  Serão integrados de resultados de partidas e análises.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximos Jogos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {match.home_clubs?.name} vs {match.away_clubs?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {match.competition} • {format(new Date(match.match_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(match.match_date), 'EEE dd/MM')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum jogo futuro encontrado.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="squad" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Elenco Principal</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Jogador
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {player.first_name[0]}{player.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{player.first_name} {player.last_name}</h4>
                      <p className="text-sm text-muted-foreground">{calculateAge(player.date_of_birth)} anos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getPositionColor(player.position)}>
                        {player.position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{player.nationality}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor de Mercado:</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(player.market_value)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver Perfil
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {players.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum jogador cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando jogadores ao seu elenco
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Jogador
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Gestão de Staff</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie técnicos, preparadores e staff administrativo
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Membro do Staff
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities">
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Instalações do Clube</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie estádio, centro de treinamento e outras instalações
              </p>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Gerenciar Instalações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Gestão Financeira</h3>
              <p className="text-muted-foreground mb-4">
                Controle orçamento, receitas e despesas do clube
              </p>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Relatórios Financeiros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubManagement;