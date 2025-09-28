import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, User, BarChart3, Briefcase, Activity, HeartPulse, Calendar, DollarSign, ShieldCheck } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface PlayerDashboardHomeProps {
  profile: Profile | null;
}

const PlayerDashboardHome = ({ profile }: PlayerDashboardHomeProps) => {
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meu Perfil</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Completo</div>
            <p className="text-xs text-muted-foreground">Atualize suas informações</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estatísticas Recentes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Em breve</div>
            <p className="text-xs text-muted-foreground">Performance em campo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 novas</div>
            <p className="text-xs text-muted-foreground">Explore o mercado</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Treino</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Amanhã, 10h</div>
            <p className="text-xs text-muted-foreground">Plano de treino personalizado</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde e Bem-estar</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Status: Ótimo</div>
            <p className="text-xs text-muted-foreground">Histórico médico</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrato Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">Válido até 2027</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
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
              <a href="#" className="text-primary text-sm hover:underline">Ver plano de recuperação</a>
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