import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ClipboardList, Plus, User, Calendar, Star, Building, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ClubMembership } from "@/pages/Dashboard";

interface ScoutReport {
  id: string;
  player_id: string;
  report_date: string;
  overall_rating: number;
  notes: string | null;
  scout_id: string;
  players: {
    first_name: string;
    last_name: string;
    position: string;
    current_club_id: string | null;
    clubs: { name: string } | null; // Nested club info
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

interface ScoutReportsProps {
  clubMemberships: ClubMembership[];
}

const ScoutReports = ({ clubMemberships }: ScoutReportsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const primaryClubId = clubMemberships.length > 0 ? clubMemberships[0].club_id : null;

  useEffect(() => {
    fetchScoutReports();
  }, [user]);

  const fetchScoutReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scout_reports')
        .select(`
          *,
          players (
            first_name,
            last_name,
            position,
            current_club_id,
            clubs (name)
          ),
          profiles (
            full_name
          )
        `)
        .order('report_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching scout reports:', error);
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar a lista de relatórios de scouting.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.players?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.players?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.players?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Relatórios de Scouting
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie relatórios de jogadores dentro e fora do clube
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por jogador, olheiro ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredReports.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {report.players?.first_name} {report.players?.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{report.players?.position}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Clube Atual:</span> {report.players?.clubs?.name || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Olheiro:</span> {report.profiles?.full_name || 'Desconhecido'}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Avaliação Geral:</span> 
                    {[...Array(report.overall_rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    {[...Array(10 - (report.overall_rating || 0))].map((_, i) => (
                      <Star key={i + report.overall_rating} className="w-4 h-4 text-gray-300" />
                    ))}
                  </p>
                  <p className="line-clamp-3 text-muted-foreground">
                    <span className="font-medium text-foreground">Notas:</span> {report.notes || 'Sem notas detalhadas.'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline-block mr-1" />
                    {format(new Date(report.report_date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Relatório Completo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum relatório de scouting</h3>
            <p className="text-muted-foreground">
              Crie relatórios para acompanhar o desempenho de jogadores.
            </p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Relatório
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoutReports;