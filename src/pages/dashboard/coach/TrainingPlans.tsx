import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Activity, Plus, Calendar, Users, Target, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { AppClubMembership, AppTrainingPlan, AppProfile } from "@/types/app"; // Importar AppClubMembership, AppTrainingPlan e AppProfile

interface TrainingPlan extends AppTrainingPlan {} // Usar AppTrainingPlan

interface TrainingPlansProps {
  clubMemberships: AppClubMembership[];
}

const TrainingPlans = ({ clubMemberships }: TrainingPlansProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const primaryClubId = clubMemberships.length > 0 ? clubMemberships[0].club_id : null;

  useEffect(() => {
    if (user) {
      fetchTrainingPlans();
    }
  }, [user, primaryClubId]); // Adicionar primaryClubId como dependência

  const fetchTrainingPlans = async () => {
    setLoading(true);
    try {
      // Fetch training plans created by the current user OR for the primary club they belong to
      const { data, error } = await supabase
        .from('training_plans')
        .select(`
          *,
          profiles (id, full_name, user_type, verified, email),
          players_info:assigned_players (id, first_name, last_name)
        `)
        .or(`coach_id.eq.${user?.id},club_id.eq.${primaryClubId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Map assigned_players (UUID array) to player objects
      const plansWithPlayerDetails = await Promise.all((data || []).map(async (plan) => {
        if (plan.assigned_players && plan.assigned_players.length > 0) {
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('id, first_name, last_name')
            .in('id', plan.assigned_players);
          
          if (playersError) console.error('Error fetching assigned players:', playersError);
          
          return { ...plan, players_info: playersData || [] };
        }
        return { ...plan, players_info: [] };
      }));

      setTrainingPlans(plansWithPlayerDetails as TrainingPlan[]);
    } catch (error) {
      console.error('Error fetching training plans:', error);
      toast({
        title: "Erro ao carregar planos de treino",
        description: "Não foi possível carregar a lista de planos de treino.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = trainingPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) || // description pode ser null
    plan.focus_areas?.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) || // focus_areas pode ser null
    plan.players_info?.some(player => `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos de treino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Planos de Treino
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie os planos de treinamento para sua equipe
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano de Treino
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descrição ou área de foco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredPlans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{plan.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.profiles?.full_name || 'Meu Plano'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="line-clamp-2 text-muted-foreground">
                    {plan.description}
                  </p>
                  <p>
                    <span className="font-medium">Período:</span> {format(new Date(plan.start_date), 'dd/MM/yyyy')} - {format(new Date(plan.end_date), 'dd/MM/yyyy')}
                  </p>
                  {plan.focus_areas && plan.focus_areas.length > 0 && (
                    <p>
                      <span className="font-medium">Foco:</span> {plan.focus_areas.join(', ')}
                    </p>
                  )}
                  {plan.players_info && plan.players_info.length > 0 && (
                    <p>
                      <span className="font-medium">Jogadores:</span> {plan.players_info.map(p => `${p.first_name} ${p.last_name}`).join(', ')}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum plano de treino criado</h3>
            <p className="text-muted-foreground">
              Crie planos de treino personalizados para sua equipe.
            </p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingPlans;