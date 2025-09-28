import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Activity, Plus, Calendar, Users, Target, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ClubMembership } from "@/pages/Dashboard";

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  focus_areas: string[];
  assigned_players: string[]; // Player IDs
  coach_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  players_info?: {
    id: string;
    first_name: string;
    last_name: string;
  }[];
}

interface TrainingPlansProps {
  clubMemberships: ClubMembership[];
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
  }, [user]);

  const fetchTrainingPlans = async () => {
    setLoading(true);
    try {
      // This assumes a 'training_plans' table exists. If not, this will need adjustment.
      // For now, we'll use placeholder data or a simplified fetch.
      // If 'training_plans' table doesn't exist, we'd need to create it or simulate data.
      // For this example, let's simulate some data.
      const simulatedData: TrainingPlan[] = [
        {
          id: "tp1",
          title: "Pré-temporada: Força e Resistência",
          description: "Foco no desenvolvimento da força muscular e resistência cardiovascular para o início da temporada.",
          start_date: "2024-07-01",
          end_date: "2024-07-31",
          focus_areas: ["Força", "Resistência", "Prevenção de Lesões"],
          assigned_players: ["player1_id", "player2_id"], // Placeholder IDs
          coach_id: user?.id || "coach_id_placeholder",
          created_at: "2024-06-20T10:00:00Z",
          profiles: { full_name: user?.user_metadata.full_name || "Meu Perfil" },
          players_info: [{ id: "player1_id", first_name: "João", last_name: "Silva" }, { id: "player2_id", first_name: "Pedro", last_name: "Souza" }]
        },
        {
          id: "tp2",
          title: "Tático: Posição e Transição",
          description: "Sessões focadas em posicionamento tático e transições ofensivas/defensivas.",
          start_date: "2024-08-05",
          end_date: "2024-08-19",
          focus_areas: ["Tática", "Posicionamento", "Transição"],
          assigned_players: ["player3_id"], // Placeholder IDs
          coach_id: user?.id || "coach_id_placeholder",
          created_at: "2024-08-01T14:30:00Z",
          profiles: { full_name: user?.user_metadata.full_name || "Meu Perfil" },
          players_info: [{ id: "player3_id", first_name: "Carlos", last_name: "Ferreira" }]
        }
      ];
      setTrainingPlans(simulatedData);

      // If a 'training_plans' table existed, the fetch would look like this:
      /*
      const { data, error } = await supabase
        .from('training_plans')
        .select(`
          *,
          profiles (full_name),
          players (id, first_name, last_name) // Assuming a join table or array of player IDs
        `)
        .eq('coach_id', user.id) // Or filter by club_id if it's a club-wide plan
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTrainingPlans(data || []);
      */
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
    plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.focus_areas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                  <p>
                    <span className="font-medium">Foco:</span> {plan.focus_areas.join(', ')}
                  </p>
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