import { Routes, Route, useLocation } from "react-router-dom";
import Feed from "@/pages/dashboard/Feed";
import Network from "@/pages/dashboard/Network";
import Market from "@/pages/dashboard/Market";
import Messages from "@/pages/dashboard/Messages";
import Profile from "@/pages/dashboard/Profile";
import ClubManagement from "@/pages/dashboard/ClubManagement";
import ClubPlayers from "@/pages/dashboard/ClubPlayers";
import Notifications from "@/pages/dashboard/Notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Profile as UserProfile, ClubMembership } from "@/pages/Dashboard"; // Import types from Dashboard
import { UserType } from "@/integrations/supabase/types"; // Import UserType

interface DashboardRouterProps {
  profile: UserProfile | null;
  clubMemberships: ClubMembership[];
}

const DashboardRouter = ({ profile, clubMemberships }: DashboardRouterProps) => {
  const location = useLocation();
  console.log("DashboardRouter current path:", location.pathname); // Para depuração

  if (!profile || !profile.user_type) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground ml-4">Carregando rotas do dashboard...</p>
      </div>
    );
  }

  const userType: UserType = profile.user_type;

  const renderCommonRoutes = () => (
    <>
      <Route index element={<Feed profile={profile} />} />
      <Route path="network" element={<UnderDevelopment page="Rede" />} />
      <Route path="messages" element={<Messages />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="market" element={<Market />} /> {/* Mercado é comum para alguns, mas pode ser mais relevante para outros */}
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

  switch (userType) {
    case 'player':
      return (
        <Routes>
          {renderCommonRoutes()}
          <Route path="stats" element={<UnderDevelopment page="Estatísticas" />} />
          <Route path="opportunities" element={<UnderDevelopment page="Minhas Oportunidades" />} />
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
    case 'club':
      return (
        <Routes>
          {renderCommonRoutes()}
          {renderClubRelatedRoutes()}
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
    case 'agent':
      return (
        <Routes>
          {renderCommonRoutes()}
          <Route path="clients" element={<UnderDevelopment page="Meus Clientes" />} />
          <Route path="contracts" element={<UnderDevelopment page="Contratos" />} />
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
    case 'coach':
    case 'scout':
    case 'medical_staff':
    case 'financial_staff':
    case 'technical_staff':
      return (
        <Routes>
          {renderCommonRoutes()}
          {renderClubRelatedRoutes()}
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
    case 'journalist':
      return (
        <Routes>
          {renderCommonRoutes()}
          <Route path="articles" element={<UnderDevelopment page="Artigos" />} />
          <Route path="interviews" element={<UnderDevelopment page="Entrevistas" />} />
          <Route path="events" element={<UnderDevelopment page="Eventos" />} />
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
    default:
      // Fallback para tipos de usuário não configurados ou novos
      return (
        <Routes>
          {renderCommonRoutes()}
          <Route path="*" element={<UnderDevelopment page="Página Não Encontrada" />} />
        </Routes>
      );
  }
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
  );
};

export default DashboardRouter;