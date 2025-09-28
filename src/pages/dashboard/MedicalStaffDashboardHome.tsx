import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, HeartPulse, Users, Stethoscope, ShieldCheck, Calendar, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface MedicalStaffDashboardHomeProps {
  profile: Profile | null;
}

const MedicalStaffDashboardHome = ({ profile }: MedicalStaffDashboardHomeProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Staff Médico
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Staff Médico"}! Gerencie a saúde dos jogadores.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Ver lista de jogadores</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesões Ativas</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">4</div>
            <p className="text-xs text-muted-foreground">Ver detalhes das lesões</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Exames</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Agendamentos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos de Recuperação</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Em andamento</div>
            <p className="text-xs text-muted-foreground">Acompanhamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Médicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 novos</div>
            <p className="text-xs text-muted-foreground">Documentação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risco de Lesão (Média)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">Médio</div>
            <p className="text-xs text-muted-foreground">Análise preditiva</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5" />
              Jogadores com Lesões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Jogador A: Torção no tornozelo (Retorno: 2 semanas)</li>
              <li>Jogador B: Fadiga muscular (Retorno: 3 dias)</li>
              <li>Jogador C: Recuperação pós-cirúrgica (Retorno: 3 meses)</li>
            </ul>
            <div className="mt-4 text-right">
              <a href="/dashboard/medical/injuries" className="text-primary text-sm hover:underline">Ver todas as lesões</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendências de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Observado um aumento de lesões musculares leves no último mês. Recomenda-se revisão dos protocolos de aquecimento.
            </p>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Gerar relatório de tendências</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Gestão de Saúde dos Atletas</h3>
          <p className="text-muted-foreground">
            Aqui você terá uma visão completa da saúde e bem-estar dos jogadores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalStaffDashboardHome;