import { NavLink } from "react-router-dom";
import { Chrome as Home, Users, MessageSquare, Briefcase, Calendar, ChartBar as BarChart3, Settings, User, Trophy, PenTool, Bell, CirclePlus as PlusCircle, Network, Target, Activity, FileText, Building, Stethoscope, Calculator, UserCheck, Search } from "lucide-react";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { UserType } from "@/integrations/supabase/types";
import { ClubMembership } from "@/pages/Dashboard"; // Importando ClubMembership

interface MenuItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  disabled?: boolean;
}

export const useDashboardNavigation = (userType: UserType, clubMemberships: ClubMembership[]): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { title: "Feed", url: "/dashboard", icon: Home },
    { title: "Rede", url: "/dashboard/network", icon: Network, disabled: true },
    { title: "Mensagens", url: "/dashboard/messages", icon: MessageSquare },
    { title: "Notificações", url: "/dashboard/notifications", icon: Bell },
  ];

  const userSpecificItems: Record<UserType, MenuItem[]> = {
    player: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Estatísticas", url: "/dashboard/stats", icon: BarChart3, disabled: true },
      { title: "Oportunidades", url: "/dashboard/opportunities", icon: Briefcase, disabled: true },
    ],
    club: [
      { title: "Gestão do Clube", url: "/dashboard/club", icon: Building },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Staff", url: "/dashboard/staff", icon: UserCheck, disabled: true },
      { title: "Relatórios", url: "/dashboard/reports", icon: FileText, disabled: true },
    ],
    agent: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Meus Clientes", url: "/dashboard/clients", icon: Users, disabled: true },
      { title: "Contratos", url: "/dashboard/contracts", icon: FileText, disabled: true },
      { title: "Mercado", url: "/dashboard/market", icon: Trophy },
    ],
    coach: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Minha Equipe", url: "/dashboard/team", icon: Users, disabled: true },
      { title: "Treinamentos", url: "/dashboard/training", icon: Activity, disabled: true },
      { title: "Táticas", url: "/dashboard/tactics", icon: Target, disabled: true },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
    ],
    scout: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Relatórios", url: "/dashboard/scout-reports", icon: FileText, disabled: true },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Análises", url: "/dashboard/analysis", icon: BarChart3, disabled: true },
    ],
    medical_staff: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Histórico Médico", url: "/dashboard/medical", icon: Stethoscope, disabled: true },
      { title: "Exames", url: "/dashboard/medical-exams", icon: Activity, disabled: true },
    ],
    financial_staff: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Contratos", url: "/dashboard/contracts", icon: FileText, disabled: true },
      { title: "Finanças", url: "/dashboard/finances", icon: Calculator, disabled: true },
    ],
    technical_staff: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Jogadores", url: "/dashboard/players", icon: Users },
      { title: "Análises", url: "/dashboard/analysis", icon: BarChart3, disabled: true },
      { title: "Relatórios", url: "/dashboard/reports", icon: FileText, disabled: true },
    ],
    journalist: [
      { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
      { title: "Artigos", url: "/dashboard/articles", icon: FileText, disabled: true },
      { title: "Entrevistas", url: "/dashboard/interviews", icon: MessageSquare, disabled: true },
      { title: "Eventos", url: "/dashboard/events", icon: Calendar, disabled: true },
    ],
  };

  // Combine base items with user-specific items
  return [
    ...baseItems,
    ...(userSpecificItems[userType] || userSpecificItems.player) // Fallback para player se userType não for encontrado
  ];
};