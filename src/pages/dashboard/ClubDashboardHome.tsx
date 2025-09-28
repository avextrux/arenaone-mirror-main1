import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Building, Users, DollarSign, FileText, Trophy, Calendar, TrendingUp, BarChart3, Plus } from "lucide-react";
import { Profile, ClubMembership } from "@/pages/Dashboard";
import { Link } from "react-router-dom"; // Importar Link para navegação interna

interface ClubDashboardHomeProps {
  profile: Profile | null;
  clubMemberships: ClubMembership[];
}

const ClubDashboardHome = ({ profile, clubMemberships }: ClubDashboardHomeProps) => {
  const primaryClub = clubMemberships.length > 0 ? clubMemberships[0].clubs : null;

  // Dados simulados para demonstração
  const simulatedSquadSize = 25;
  const simulatedNextMatch = "vs Rival FC";
  const simulatedNextMatchDate = "25/12/2024";
  const simulatedBudget = "€ 15M";
  const simulatedPendingReports = 3; // Scouting, Médico, Técnico
  const simulatedTitles = 12;
  const simulatedSquadMarketValue = "€ 120M";
  const simulatedRecentResults = [
    "Vitória vs Time A (3-1)",
    "Empate vs Time B (1-1)",
    "Derrota vs Time C (0-2)",
    "Vitória vs Time D (2-0)",
    "Vitória vs Time E (4-1)",
  ];
  const simulatedActiveStaff = 15;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Clube
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Gerente"}! Gerencie seu clube: {primaryClub?.name || "Nenhum clube selecionado"}.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Jogadores Ativos */}
        <Link to="/dashboard/players">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogadores Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedSquadSize}</div>
              <p className="text-xs text-muted-foreground">Ver elenco completo</p>
            </CardContent>
          </Card>
        </Link>

        {/* Próximo Jogo */}
        <Link to="/dashboard/club"> {/* Ou uma rota específica para jogos */}
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Jogo</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedNextMatch}</div>
              <p className="text-xs text-muted-foreground">{simulatedNextMatchDate}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Orçamento Disponível */}
        <Link to="/dashboard/finances">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedBudget}</div>
              <p className="text-xs text-muted-foreground">Ver detalhes financeiros</p>
            </CardContent>
          </Card>
        </Link>

        {/* Relatórios Pendentes */}
        <Link to="/dashboard/reports">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedPendingReports}</div>
              <p className="text-xs text-muted-foreground">Scouting, Médico, Técnico</p>
            </CardContent>
          </Card>
        </Link>

        {/* Títulos Conquistados */}
        <Link to="/dashboard/club"> {/* Ou uma rota específica para histórico do clube */}
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Títulos Conquistados</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedTitles}</div>
              <p className="text-xs text-muted-foreground">Histórico do clube</p>
            </CardContent>
          </Card>
        </Link>

        {/* Valor de Mercado do Elenco */}
        <Link to="/dashboard/market">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor de Mercado do Elenco</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedSquadMarketValue}</div>
              <p className="text-xs text-muted-foreground">Análise de mercado</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance da Equipe (Últimos 5 Jogos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {simulatedRecentResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você tem {simulatedActiveStaff} membros de staff ativos, incluindo técnicos, médicos e olheiros.
            </p>
            <div className="mt-4 text-right">
              <Link to="/dashboard/staff" className="text-primary text-sm hover:underline">Gerenciar Staff</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Visão Geral da Gestão</h3>
          <p className="text-muted-foreground">
            Aqui você terá um resumo completo das operações do seu clube.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubDashboardHome;