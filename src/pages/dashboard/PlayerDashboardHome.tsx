import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, User, BarChart3, Briefcase, Activity, HeartPulse, Calendar, DollarSign, ShieldCheck, Users, Building } from "lucide-react";
import { Profile } from "@/pages/Dashboard";
import { Link } from "react-router-dom"; // Importar Link para navegação interna

interface PlayerProfileDetails {
  current_club_name?: string;
  current_club_logo?: string;
  contract_end_date?: string;
  market_value?: number;
  position?: string;
}

interface PlayerDashboardHomeProps {
  profile: Profile | null;
  playerDetails?: PlayerProfileDetails; // Adicionar detalhes específicos do jogador
}

const PlayerDashboardHome = ({ profile, playerDetails }: PlayerDashboardHomeProps) => {
  // Dados simulados para demonstração
  const simulatedStats = {
    goals: 5,
    assists: 3,
    gamesPlayed: 12,
    rating: 7.8,
  };

  const simulatedOpportunities = 2;
  const simulatedNextTraining = "Treino Tático";
  const simulatedNextTrainingTime = "Amanhã, 10:00";
  const simulatedHealthStatus = "Ótimo";
  const simulatedRecoveryPlan = "Ativo";
  const simulatedContractStatus = "Válido até 2027";
  const simulatedMarketValue = "€ 15M";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Jogador
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Jogador"}! Gerencie sua carreira e performance.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Meu Perfil */}
        <Link to="/dashboard/profile">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meu Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Completo</div>
              <p className="text-xs text-muted-foreground">Atualize suas informações</p>
            </CardContent>
          </Card>
        </Link>

        {/* Estatísticas Recentes */}
        <Link to="/dashboard/stats">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estatísticas Recentes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedStats.goals} Gols, {simulatedStats.assists} Assist.</div>
              <p className="text-xs text-muted-foreground">Média de {simulatedStats.rating} em {simulatedStats.gamesPlayed} jogos</p>
            </CardContent>
          </Card>
        </Link>

        {/* Oportunidades */}
        <Link to="/dashboard/market">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedOpportunities} novas</div>
              <p className="text-xs text-muted-foreground">Explore o mercado de transferências</p>
            </CardContent>
          </Card>
        </Link>

        {/* Próximo Treino */}
        <Link to="/dashboard/training">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Treino</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedNextTraining}</div>
              <p className="text-xs text-muted-foreground">{simulatedNextTrainingTime}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Saúde e Bem-estar */}
        <Link to="/dashboard/medical">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saúde e Bem-estar</CardTitle>
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Status: {simulatedHealthStatus}</div>
              <p className="text-xs text-muted-foreground">Plano de recuperação: {simulatedRecoveryPlan}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Contrato Atual */}
        <Link to="/dashboard/profile"> {/* Ou uma rota específica para contratos */}
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contrato Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulatedContractStatus}</div>
              <p className="text-xs text-muted-foreground">Valor de mercado: {simulatedMarketValue}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meu Clube Atual */}
        {playerDetails?.current_club_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Meu Clube Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {playerDetails.current_club_logo && (
                <img src={playerDetails.current_club_logo} alt={`${playerDetails.current_club_name} Logo`} className="w-12 h-12 object-contain" />
              )}
              <div>
                <p className="text-lg font-semibold">{playerDetails.current_club_name}</p>
                <p className="text-sm text-muted-foreground">Posição: {playerDetails.position || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Contrato até: {playerDetails.contract_end_date || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agenda da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Segunda: Treino Tático (09:00)</li>
              <li>Terça: Fisioterapia (14:00)</li>
              <li>Quarta: Jogo (20:00)</li>
              <li>Quinta: Descanso Ativo</li>
              <li>Sexta: Treino Técnico (10:00)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Status de Recuperação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você está 100% apto para o próximo jogo. Continue com os exercícios de fortalecimento.
            </p>
            <div className="mt-4 text-right">
              <Link to="/dashboard/medical" className="text-primary text-sm hover:underline">Ver plano de recuperação</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Visão Geral da Carreira</h3>
          <p className="text-muted-foreground">
            Aqui você terá um resumo completo de sua performance, contratos e oportunidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerDashboardHome;