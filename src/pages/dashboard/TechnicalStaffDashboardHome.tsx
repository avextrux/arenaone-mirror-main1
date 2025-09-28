import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, LineChart, FileText, Lightbulb, Activity, Target, Calendar, TrendingUp } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface TechnicalStaffDashboardHomeProps {
  profile: Profile | null;
}

const TechnicalStaffDashboardHome = ({ profile }: TechnicalStaffDashboardHomeProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Staff Técnico
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Staff Técnico"}! Otimize a performance da equipe.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores Analisados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">Ver lista de jogadores</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises de Performance</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 novas</div>
            <p className="text-xs text-muted-foreground">Relatórios detalhados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Técnicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Documentação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas Ativas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Análise de vídeo, GPS, etc.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Análise</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jogo vs Rival</div>
            <p className="text-xs text-muted-foreground">28/12/2024</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Treino (horas/semana)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15h</div>
            <p className="text-xs text-muted-foreground">Carga de trabalho da equipe</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Performance Individual (Top 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Jogador A: +15% em passes precisos</li>
              <li>Jogador B: +10% em duelos ganhos</li>
              <li>Jogador C: -5% em erros de posse</li>
            </ul>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Ver todos os relatórios</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximas Análises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Análise de vídeo do próximo adversário agendada para amanhã.
            </p>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Ver agenda completa</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Otimização de Performance</h3>
          <p className="text-muted-foreground">
            Aqui você terá acesso a dados e ferramentas para otimizar a performance da equipe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalStaffDashboardHome;