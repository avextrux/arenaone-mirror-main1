import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Trophy, ClipboardList, LineChart, Users, MapPin, Search, FileText, TrendingUp } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface ScoutDashboardHomeProps {
  profile: Profile | null;
}

const ScoutDashboardHome = ({ profile }: ScoutDashboardHomeProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Olheiro
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Olheiro"}! Encontre os próximos talentos.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Criados</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Ver todos os relatórios</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores Monitorados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Lista de talentos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises de Mercado</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Atualizado</div>
            <p className="text-xs text-muted-foreground">Tendências e valores</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Viagem</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">São Paulo</div>
            <p className="text-xs text-muted-foreground">20/01/2025</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Talentos</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Potenciais contratações</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Para revisão</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Últimos Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Relatório de Jogo: Jovem Promessa (05/01)</li>
              <li>Análise de Treino: Atacante X (03/01)</li>
              <li>Observação de Torneio: Sub-17 (28/12)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendências de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A demanda por laterais ofensivos está em alta no mercado europeu.
            </p>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Ver análises completas</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Identificação de Talentos</h3>
          <p className="text-muted-foreground">
            Aqui você terá acesso a ferramentas avançadas para identificar e monitorar talentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoutDashboardHome;