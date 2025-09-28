import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Feed from "@/pages/dashboard/Feed";
import Network from "@/pages/dashboard/Network";
import Market from "@/pages/dashboard/Market";
import Messages from "@/pages/dashboard/Messages";
import Profile from "@/pages/dashboard/Profile";
import ClubManagement from "@/pages/dashboard/ClubManagement";
import ClubPlayers from "@/pages/dashboard/ClubPlayers";
import Notifications from "@/pages/dashboard/Notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, LayoutDashboard } from "lucide-react";
import { Profile as UserProfile, ClubMembership } from "@/pages/Dashboard";
import { UserType } from "@/integrations/supabase/types";

// Importar as novas páginas de Dashboard Home
import PlayerDashboardHome from "@/pages/dashboard/PlayerDashboardHome";
import ClubDashboardHome from "@/pages/dashboard/ClubDashboardHome";
import AgentDashboardHome from "@/pages/dashboard/AgentDashboardHome";
import CoachDashboardHome from "@/pages/dashboard/CoachDashboardHome";
import ScoutDashboardHome from "@/pages/dashboard/ScoutDashboardHome";
import MedicalStaffDashboardHome from "@/pages/dashboard/MedicalStaffDashboardHome";
import FinancialStaffDashboardHome from "@/pages/dashboard/FinancialStaffDashboardHome";
import JournalistDashboardHome from "@/pages/dashboard/JournalistDashboardHome";

// Importar as novas páginas especializadas
import InjuriesOverview from "@/pages/dashboard/medical/InjuriesOverview";
import ScoutReports from "@/pages/dashboard/scout/ScoutReports";
import TrainingPlans from "@/pages/dashboard/coach/TrainingPlans";


interface DashboardRouterProps {
  profile: UserProfile | null;
  clubMemberships: ClubMembership[];
}

const DashboardRouter = ({ profile, clubMemberships }: DashboardRouterProps) => {
  const location = useLocation();

  if (!profile || !profile.user_type) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground ml-4">Carregando rotas do dashboard...</p>
      </div>
    );
  }

  const userType: UserType = profile.user_type;

  // Função para obter a URL da página inicial específica do usuário
  const getHomeRouteForUserType = (type: UserType) => {
    switch (type) {
      case 'player': return '/dashboard/player-home';
      case 'club': return '/dashboard/club-home';
      case 'agent': return '/dashboard/agent-home';
      case 'coach': return '/dashboard/coach-home';
      case 'scout': return '/dashboard/scout-home';
      case 'medical_staff': return '/dashboard/medical-home';
      case 'financial_staff': return '/dashboard/financial-home';
      case 'technical_staff': return '/dashboard/technical-home';
      case 'journalist': return '/dashboard/journalist-home';
      default: return '/dashboard/profile'; // Fallback
    }
  };

  const renderCommonRoutes = () => (
    <>
      <Route path="network" element={<Network />} />
      <Route path="messages" element={<Messages />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="market" element={<Market />} />
      <Route path="post" element={<UnderDevelopment page="Criar Post" />} />
      <Route path="search" element={<UnderDevelopment page="Pesquisar" />} />
      <Route path="settings" element={<UnderDevelopment page="Configurações" />} />
    </>
  );

  const renderClubRelatedRoutes = () => (
    <>
      <Route path="club" element={<ClubManagement clubMemberships={clubMemberships} />} />
      <Route path="players" element={<ClubPlayers clubMemberships={clubMemberships} />} />
      <Route path="staff" element={<UnderDevelopment page="Staff do Clube" />} />
      <Route path="reports" element={<UnderDevelopment page="Relatórios" />} />
      <Route path="medical" element={<UnderDevelopment page="Histórico Médico" />} />
      <Route path="medical-exams" element={<UnderDevelopment page="Exames Médicos" />} />
      <Route path="finances" element={<UnderDevelopment page="Finanças" />} />
      <Route path="training" element={<UnderDevelopment page="Treinamentos" />} />
      <Route path="tactics" element={<UnderDevelopment page="Táticas" />} />
      <Route path="analysis" element={<UnderDevelopment page="Análises" />} />
    </>
  );

  return (
    <Routes>
      {/* Rota padrão para o dashboard, redireciona para a home específica do usuário */}
      <Route index element={<Navigate to={getHomeRouteForUserType(userType)} replace />} />
      <Route path="feed" element={<Feed profile={profile} />} /> {/* Feed ainda é uma rota separada */}

      {/* Rotas comuns a todos os usuários */}
      {renderCommonRoutes()}

      {/* Rotas específicas para cada tipo de usuário */}
      <Route path="player-home" element={<PlayerDashboardHome profile={profile} />} />
      <Route path="club-home" element={<ClubDashboardHome profile={profile} clubMemberships={clubMemberships} />} />
      <Route path="agent-home" element={<AgentDashboardHome profile={profile} />} />
      <Route path="coach-home" element={<CoachDashboardHome profile={profile} />} />
      <Route path="scout-home" element={<ScoutDashboardHome profile={profile} />} />
      <Route path="medical-home" element={<MedicalStaffDashboardHome profile={profile} />} />
      <Route path="financial-home" element={<FinancialStaffDashboardHome profile={profile} />} />
      <Route path="technical-home" element={<TechnicalStaffDashboardHome profile={profile} />} />
      <Route path="journalist-home" element={<JournalistDashboardHome profile={profile} />} />

      {/* Rotas relacionadas a clubes (acessíveis por membros de clubes) */}
      {['club', 'coach', 'scout', 'medical_staff', 'financial_staff', 'technical_staff'].includes(userType) && renderClubRelatedRoutes()}

      {/* Rotas específicas adicionais para cada tipo de usuário */}
      {userType === 'player' && (
        <>
          <Route path="stats" element={<UnderDevelopment page="Estatísticas do Jogador" />} />
          <Route path="opportunities" element={<UnderDevelopment page="Minhas Oportunidades" />} />
          <Route path="training" element={<UnderDevelopment page="Meu Treinamento" />} />
          <Route path="medical" element={<UnderDevelopment page="Meu Histórico Médico" />} />
        </>
      )}
      {userType === 'agent' && (
        <>
          <Route path="clients" element={<UnderDevelopment page="Meus Clientes" />} />
          <Route path="contracts" element={<UnderDevelopment page="Contratos de Clientes" />} />
          <Route path="opportunities" element={<UnderDevelopment page="Oportunidades de Agente" />} />
        </>
      )}
      {userType === 'coach' && (
        <>
          <Route path="team" element={<UnderDevelopment page="Minha Equipe" />} />
          <Route path="match-analysis" element={<UnderDevelopment page="Análises de Jogo" />} />
          <Route path="coach/training-plans" element={<TrainingPlans clubMemberships={clubMemberships} />} /> {/* Nova rota */}
        </>
      )}
      {userType === 'scout' && (
        <>
          <Route path="scout-reports" element={<UnderDevelopment page="Relatórios de Scouting" />} />
          <Route path="market-analysis" element={<UnderDevelopment page="Análises de Mercado" />} />
          <Route path="scout/reports" element={<ScoutReports clubMemberships={clubMemberships} />} /> {/* Nova rota */}
        </>
      )}
      {userType === 'medical_staff' && (
        <>
          <Route path="recovery-plans" element={<UnderDevelopment page="Planos de Recuperação" />} />
          <Route path="medical/injuries" element={<InjuriesOverview clubMemberships={clubMemberships} />} /> {/* Nova rota */}
        </>
      )}
      {userType === 'financial_staff' && (
        <>
          <Route path="budget" element={<UnderDevelopment page="Orçamento do Clube" />} />
        </>
      )}
      {userType === 'technical_staff' && (
        <>
          <Route path="performance-analysis" element={<UnderDevelopment page="Análises de Performance" />} />
          <Route path="technical-reports" element={<UnderDevelopment page="Relatórios Técnicos" />} />
          <Route path="tools" element={<UnderDevelopment page="Ferramentas Técnicas" />} />
        </>
      )}
      {userType === 'journalist' && (
        <>
          <Route path="articles" element={<UnderDevelopment page="Meus Artigos" />} />
          <Route path="interviews" element={<UnderDevelopment page="Minhas Entrevistas" />} />
          <Route path="events" element={<UnderDevelopment page="Cobertura de Eventos" />} />
        </>
      )}

      {/* Rota catch-all para páginas não encontradas no dashboard */}
      <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
    </Routes>
  );
};

const UnderDevelopment = ({ page }: { page: string }) => (
  <div className="max-w-4xl mx-auto">
    <Card>
      <CardContent className="p-12 text-center">
        <Construction className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{page}</h3>
        <p className="text-muted-foreground">
          Esta funcionalidade está em desenvolvimento e estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default DashboardRouter;