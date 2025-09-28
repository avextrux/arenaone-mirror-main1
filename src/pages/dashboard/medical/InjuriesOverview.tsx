import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HeartPulse, Plus, User, Calendar, Shield, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ClubMembership } from "@/pages/Dashboard";

interface PlayerInjury {
  id: string;
  player_id: string;
  injury_type: string;
  body_part: string;
  severity: string;
  diagnosis_date: string;
  recovery_date_estimate: string | null;
  status: string;
  notes: string | null;
  players: {
    first_name: string;
    last_name: string;
    position: string;
  } | null;
}

interface InjuriesOverviewProps {
  clubMemberships: ClubMembership[];
}

const InjuriesOverview = ({ clubMemberships }: InjuriesOverviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [injuries, setInjuries] = useState<PlayerInjury[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const primaryClubId = clubMemberships.length > 0 ? clubMemberships[0].club_id : null;

  useEffect(() => {
    if (primaryClubId) {
      fetchInjuries(primaryClubId);
    } else {
      setInjuries([]);
      setLoading(false);
    }
  }, [primaryClubId]);

  const fetchInjuries = async (clubId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_medical_info') // Assuming injuries are part of medical info or a separate table
        .select(`
          id,
          player_id,
          injuries_history,
          players (
            first_name,
            last_name,
            position
          )
        `)
        .eq('club_id', clubId);

      if (error) throw error;

      // Process injuries_history (JSONB array) into a flat list of PlayerInjury
      const processedInjuries: PlayerInjury[] = [];
      data.forEach((medicalRecord: any) => {
        if (medicalRecord.injuries_history && Array.isArray(medicalRecord.injuries_history)) {
          medicalRecord.injuries_history.forEach((injury: any) => {
            processedInjuries.push({
              id: `${medicalRecord.id}-${injury.diagnosis_date}-${injury.body_part}`, // Unique ID for each injury entry
              player_id: medicalRecord.player_id,
              injury_type: injury.type || 'Desconhecido',
              body_part: injury.body_part || 'Não especificado',
              severity: injury.severity || 'Média',
              diagnosis_date: injury.diagnosis_date || format(new Date(), 'yyyy-MM-dd'),
              recovery_date_estimate: injury.recovery_date_estimate || null,
              status: injury.status || 'Ativa',
              notes: injury.notes || null,
              players: medicalRecord.players,
            });
          });
        }
      });
      setInjuries(processedInjuries);
    } catch (error) {
      console.error('Error fetching injuries:', error);
      toast({
        title: "Erro ao carregar lesões",
        description: "Não foi possível carregar a lista de lesões dos jogadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInjuries = injuries.filter(injury =>
    injury.players?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    injury.players?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    injury.injury_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    injury.body_part.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando lesões...</p>
        </div>
      </div>
    );
  }

  if (!primaryClubId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Você precisa estar vinculado a um clube para acessar informações médicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <HeartPulse className="w-6 h-6" />
            Lesões e Saúde
          </h1>
          <p className="text-muted-foreground">
            Visão geral das lesões dos jogadores do clube
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Lesão
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por jogador, tipo de lesão ou parte do corpo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredInjuries.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInjuries.map((injury) => (
            <Card key={injury.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {injury.players?.first_name} {injury.players?.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{injury.players?.position}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Lesão:</span> {injury.injury_type} ({injury.body_part})
                  </p>
                  <p>
                    <span className="font-medium">Severidade:</span> {injury.severity}
                  </p>
                  <p>
                    <span className="font-medium">Diagnóstico:</span> {format(new Date(injury.diagnosis_date), 'dd/MM/yyyy')}
                  </p>
                  {injury.recovery_date_estimate && (
                    <p>
                      <span className="font-medium">Previsão de Retorno:</span> {format(new Date(injury.recovery_date_estimate), 'dd/MM/yyyy')}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Status:</span> <Badge variant={injury.status === 'Ativa' ? 'destructive' : 'secondary'}>{injury.status}</Badge>
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Detalhes Médicos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <HeartPulse className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma lesão registrada</h3>
            <p className="text-muted-foreground">
              Registre as lesões dos jogadores para um acompanhamento detalhado.
            </p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Lesão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InjuriesOverview;