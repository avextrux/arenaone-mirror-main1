import { Routes, Route, useLocation } from "react-router-dom";
import Feed from "@/pages/dashboard/Feed";
import Network from "@/pages/dashboard/Network";
import Market from "@/pages/dashboard/Market";
import Messages from "@/pages/dashboard/Messages";
import Profile from "@/pages/dashboard/Profile";
import ClubManagement from "@/pages/dashboard/ClubManagement";
import ClubPlayers from "@/pages/dashboard/ClubPlayers";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const DashboardRouter = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Se estiver na rota principal do dashboard, mostrar o Feed
  if (currentPath === "/dashboard") {
    return <Feed />;
  }

  return (
    <Routes>
      <Route path="/network" element={<Network />} />
      <Route path="/market" element={<Market />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/club" element={<ClubManagement />} />
      <Route path="/players" element={<ClubPlayers />} />
      
      {/* Páginas em desenvolvimento */}
      <Route path="/notifications" element={<UnderDevelopment page="Notificações" />} />
      <Route path="/stats" element={<UnderDevelopment page="Estatísticas" />} />
      <Route path="/transfers" element={<UnderDevelopment page="Transferências" />} />
      <Route path="/training" element={<UnderDevelopment page="Treinamentos" />} />
      <Route path="/opportunities" element={<UnderDevelopment page="Oportunidades" />} />
      <Route path="/scouts" element={<UnderDevelopment page="Scout Reports" />} />
      <Route path="/scout-reports" element={<UnderDevelopment page="Scout Reports" />} />
      <Route path="/medical" element={<UnderDevelopment page="Histórico Médico" />} />
      <Route path="/medical-exams" element={<UnderDevelopment page="Exames Médicos" />} />
      <Route path="/finances" element={<UnderDevelopment page="Finanças" />} />
      <Route path="/staff" element={<UnderDevelopment page="Staff do Clube" />} />
      <Route path="/calendar" element={<UnderDevelopment page="Calendário" />} />
      <Route path="/jobs" element={<UnderDevelopment page="Vagas" />} />
      <Route path="/clients" element={<UnderDevelopment page="Meus Clientes" />} />
      <Route path="/contracts" element={<UnderDevelopment page="Contratos" />} />
      <Route path="/reports" element={<UnderDevelopment page="Relatórios" />} />
      <Route path="/team" element={<UnderDevelopment page="Minha Equipe" />} />
      <Route path="/tactics" element={<UnderDevelopment page="Táticas" />} />
      <Route path="/matches" element={<UnderDevelopment page="Partidas" />} />
      <Route path="/analysis" element={<UnderDevelopment page="Análises" />} />
      <Route path="/articles" element={<UnderDevelopment page="Artigos" />} />
      <Route path="/interviews" element={<UnderDevelopment page="Entrevistas" />} />
      <Route path="/events" element={<UnderDevelopment page="Eventos" />} />
      <Route path="/contacts" element={<UnderDevelopment page="Contatos" />} />
      <Route path="/teams" element={<UnderDevelopment page="Times Favoritos" />} />
      <Route path="/communities" element={<UnderDevelopment page="Comunidades" />} />
      <Route path="/post" element={<UnderDevelopment page="Novo Post" />} />
      <Route path="/search" element={<UnderDevelopment page="Pesquisar" />} />
      <Route path="/settings" element={<UnderDevelopment page="Configurações" />} />
      
      {/* Rota padrão - Feed */}
      <Route path="*" element={<Feed />} />
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