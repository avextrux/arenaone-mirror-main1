import { NavLink } from "react-router-dom";
import { Chrome as Home, Users, MessageSquare, Briefcase, Calendar, ChartBar as BarChart3, Settings, User, Trophy, PenTool, Activity, FileText, Building, Stethoscope, Calculator, UserCheck, Search, LayoutDashboard, DollarSign, HeartPulse, BookOpen, ClipboardList, GraduationCap, Handshake, Lightbulb, LineChart, ShieldCheck, TrendingUp, Megaphone, Newspaper, Camera, Video, MapPin, Smile, PlusCircle } from "lucide-react";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { UserType } from "@/integrations/supabase/types";
import { ClubMembership } from "@/pages/Dashboard";

interface MenuItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  disabled?: boolean;
}

export const useDashboardNavigation = (userType: UserType, clubMemberships: ClubMembership[]): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { title: "Feed", url: "/dashboard", icon: Home },
    { title: "Rede", url: "/dashboard/network", icon: Users },
    { title: "Mensagens", url: "/dashboard/messages", icon: MessageSquare },
    { title: "Notificações", url: "/dashboard/notifications", icon: Bell },
    { title: "Mercado", url: "/dashboard/market", icon: TrendingUp },
  ];

  const userSpecificItems: Record<UserType, MenuItem[]> = {
    player: [
      { title: "Meu Dashboard", url: "/dashboard/player-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Estatísticas", url: "/dashboard/stats", icon: BarChart3, disabled: true },
      { title: "Oportunidades", url: "/dashboard/opportunities", icon: Briefcase, disabled: true },
      { title: "Treinamento", url: "/dashboard/training", icon: Activity, disabled: true },
      { title: "Saúde", url: "/dashboard/medical", icon: HeartPulse, disabled: true },
    ],
    club: [
      { title: "Dashboard do Clube", url: "/dashboard/club-home", icon: LayoutDashboard },
      { title: "Gestão do Clube", url: "/dashboard/club", icon: Building },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Staff", url: "/dashboard/staff", icon: UserCheck, disabled: true },
      { title: "Finanças", url: "/dashboard/finances", icon: DollarSign, disabled: true },
      { title: "Relatórios", url: "/dashboard/reports", icon: FileText, disabled: true },
      { title: "Táticas", url: "/dashboard/tactics", icon: Target, disabled: true },
    ],
    agent: [
      { title: "Meu Dashboard", url: "/dashboard/agent-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Meus Clientes", url: "/dashboard/clients", icon: Users, disabled: true },
      { title: "Contratos", url: "/dashboard/contracts", icon: FileText, disabled: true },
      { title: "Oportunidades", url: "/dashboard/opportunities", icon: Briefcase, disabled: true },
    ],
    coach: [
      { title: "Meu Dashboard", url: "/dashboard/coach-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Planos de Treino", url: "/dashboard/coach/training-plans", icon: Activity }, // Nova página
      { title: "Táticas", url: "/dashboard/tactics", icon: Target, disabled: true },
      { title: "Análises de Jogo", url: "/dashboard/match-analysis", icon: LineChart, disabled: true },
    ],
    scout: [
      { title: "Meu Dashboard", url: "/dashboard/scout-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Relatórios de Scouting", url: "/dashboard/scout/reports", icon: ClipboardList }, // Nova página
      { title: "Análises de Mercado", url: "/dashboard/market-analysis", icon: LineChart, disabled: true },
    ],
    medical_staff: [
      { title: "Meu Dashboard", url: "/dashboard/medical-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Lesões e Saúde", url: "/dashboard/medical/injuries", icon: Stethoscope }, // Nova página
      { title: "Exames Médicos", url: "/dashboard/medical-exams", icon: HeartPulse, disabled: true },
      { title: "Planos de Recuperação", url: "/dashboard/recovery-plans", icon: ShieldCheck, disabled: true },
    ],
    financial_staff: [
      { title: "Meu Dashboard", url: "/dashboard/financial-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Finanças do Clube", url: "/dashboard/finances", icon: DollarSign, disabled: true },
      { title: "Contratos", url: "/dashboard/contracts", icon: FileText, disabled: true },
      { title: "Orçamento", url: "/dashboard/budget", icon: Calculator, disabled: true },
    ],
    technical_staff: [
      { title: "Meu Dashboard", url: "/dashboard/technical-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Análises de Performance", url: "/dashboard/performance-analysis", icon: LineChart, disabled: true },
      { title: "Relatórios Técnicos", url: "/dashboard/technical-reports", icon: FileText, disabled: true },
      { title: "Ferramentas", url: "/dashboard/tools", icon: Lightbulb, disabled: true },
    ],
    journalist: [
      { title: "Meu Dashboard", url: "/dashboard/journalist-home", icon: LayoutDashboard },
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Artigos", url: "/dashboard/articles", icon: Newspaper, disabled: true },
      { title: "Entrevistas", url: "/dashboard/interviews", icon: Megaphone, disabled: true },
      { title: "Eventos", url: "/dashboard/events", icon: Calendar, disabled: true },
    ],
  };

  // Combine base items with user-specific items
  return [
    ...baseItems,
    ...(userSpecificItems[userType] || userSpecificItems.player) // Fallback para player se userType não for encontrado
  ];
};