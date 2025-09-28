import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Newspaper, Megaphone, Calendar, FileText, Camera, Video, TrendingUp, Users } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface JournalistDashboardHomeProps {
  profile: Profile | null;
}

const JournalistDashboardHome = ({ profile }: JournalistDashboardHomeProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard do Jornalista
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || "Jornalista"}! Acompanhe as últimas notícias e eventos.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artigos Publicados</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Ver meus artigos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrevistas Agendadas</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Próximas entrevistas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Cobertos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Histórico de eventos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notícias Recentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 novas</div>
            <p className="text-xs text-muted-foreground">Atualizações do mercado</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mídia Publicada</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Fotos e vídeos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões na Mídia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50+</div>
            <p className="text-xs text-muted-foreground">Fontes e contatos</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções mais detalhadas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Pautas em Destaque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Análise da janela de transferências de janeiro</li>
              <li>Impacto da IA no scouting de jovens talentos</li>
              <li>O futuro dos contratos de patrocínio no futebol</li>
            </ul>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Ver todas as pautas</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Artigos Mais Lidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seu artigo sobre "A Revolução Tática no Futebol Moderno" teve 1500 visualizações na última semana.
            </p>
            <div className="mt-4 text-right">
              <a href="#" className="text-primary text-sm hover:underline">Ver estatísticas de artigos</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Central de Notícias</h3>
          <p className="text-muted-foreground">
            Aqui você terá acesso rápido às últimas notícias e ferramentas para sua cobertura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalistDashboardHome;