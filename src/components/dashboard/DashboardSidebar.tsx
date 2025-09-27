import { NavLink, useLocation } from "react-router-dom";
import { Chrome as Home, Users, MessageSquare, Briefcase, Calendar, ChartBar as BarChart3, Settings, User, Trophy, Search, Bell, CirclePlus as PlusCircle, Network, Target, Activity, FileText, Building, Stethoscope, Calculator, UserCheck, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface ClubMembership {
  id: string;
  club_id: string;
  department: string;
  permission_level: string;
  status: string;
  clubs: {
    name: string;
    logo_url?: string;
  };
}

interface DashboardSidebarProps {
  userType: string;
  clubMemberships?: ClubMembership[];
}

const DashboardSidebar = ({ userType, clubMemberships = [] }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "text-foreground hover:bg-primary/10 hover:text-primary";

  const getDepartmentLabel = (dept: string) => {
    const labels = {
      medical: "Médico",
      financial: "Financeiro", 
      technical: "Técnico",
      scouting: "Scouting",
      management: "Diretoria",
      admin: "Admin"
    };
    return labels[dept as keyof typeof labels] || dept;
  };

  const getPermissionColor = (level: string) => {
    const colors = {
      read: "bg-gray-100 text-gray-800",
      write: "bg-blue-100 text-blue-800",
      admin: "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || colors.read;
  };

  // Menu items baseado no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      { title: "Feed", url: "/dashboard", icon: Home },
      { title: "Rede", url: "/dashboard/network", icon: Network },
      { title: "Mensagens", url: "/dashboard/messages", icon: MessageSquare },
      { title: "Notificações", url: "/dashboard/notifications", icon: Bell },
    ];

    const userSpecificItems = {
      player: [
        { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
        { title: "Estatísticas", url: "/dashboard/stats", icon: BarChart3 },
        { title: "Oportunidades", url: "/dashboard/opportunities", icon: Briefcase },
      ],
      club: [
        { title: "Gestão do Clube", url: "/dashboard/club", icon: Building },
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
        { title: "Staff", url: "/dashboard/staff", icon: UserCheck },
        { title: "Relatórios", url: "/dashboard/reports", icon: FileText },
      ],
      agent: [
        { title: "Meus Clientes", url: "/dashboard/clients", icon: Users },
        { title: "Contratos", url: "/dashboard/contracts", icon: FileText },
        { title: "Mercado", url: "/dashboard/market", icon: Trophy },
        { title: "Oportunidades", url: "/dashboard/opportunities", icon: Briefcase },
      ],
      coach: [
        { title: "Minha Equipe", url: "/dashboard/team", icon: Users },
        { title: "Treinamentos", url: "/dashboard/training", icon: Activity },
        { title: "Táticas", url: "/dashboard/tactics", icon: Target },
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
      ],
      scout: [
        { title: "Relatórios", url: "/dashboard/scout-reports", icon: FileText },
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
        { title: "Análises", url: "/dashboard/analysis", icon: BarChart3 },
      ],
      medical_staff: [
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
        { title: "Histórico Médico", url: "/dashboard/medical", icon: Stethoscope },
        { title: "Exames", url: "/dashboard/medical-exams", icon: Activity },
      ],
      financial_staff: [
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
        { title: "Contratos", url: "/dashboard/contracts", icon: FileText },
        { title: "Finanças", url: "/dashboard/finances", icon: Calculator },
      ],
      technical_staff: [
        { title: "Jogadores", url: "/dashboard/players", icon: Users },
        { title: "Análises", url: "/dashboard/analysis", icon: BarChart3 },
        { title: "Relatórios", url: "/dashboard/reports", icon: FileText },
      ],
      journalist: [
        { title: "Artigos", url: "/dashboard/articles", icon: FileText },
        { title: "Entrevistas", url: "/dashboard/interviews", icon: MessageSquare },
        { title: "Eventos", url: "/dashboard/events", icon: Calendar },
      ],
      fan: [
        { title: "Times Favoritos", url: "/dashboard/teams", icon: Trophy },
        { title: "Eventos", url: "/dashboard/events", icon: Calendar },
        { title: "Comunidades", url: "/dashboard/communities", icon: Users },
      ]
    };

    return [
      ...baseItems,
      ...(userSpecificItems[userType as keyof typeof userSpecificItems] || userSpecificItems.fan)
    ];
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} border-r border-border/50 bg-card/30 backdrop-blur-sm`}>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-heading font-bold text-primary px-2 mb-4">
            {!collapsed && "ArenaOne"}
          </SidebarGroupLabel>
          
          {/* Club Memberships */}
          {!collapsed && clubMemberships.length > 0 && (
            <div className="mb-4 px-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Meus Clubes
              </h4>
              <div className="space-y-2">
                {clubMemberships.map((membership) => (
                  <div key={membership.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{membership.clubs.name}</p>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-xs ${getPermissionColor(membership.permission_level)}`}>
                          {getDepartmentLabel(membership.department)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className={`h-4 w-4 ${!collapsed ? 'mr-3' : ''}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-sm text-muted-foreground px-2 mb-2">
              Ações Rápidas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/post" 
                      className="flex items-center px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <PlusCircle className="mr-3 h-4 w-4" />
                      <span className="font-medium">Criar Post</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/search" 
                      className="flex items-center px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <Search className="mr-3 h-4 w-4" />
                      <span className="font-medium">Pesquisar</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/settings" 
                      className="flex items-center px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span className="font-medium">Configurações</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;