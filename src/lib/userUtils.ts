import { User, Building, Briefcase, Target, Trophy, PenTool, Activity, Stethoscope, Calculator, Smile, LucideProps, Shield } from "lucide-react";
import { UserType, ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface UserTypeOption {
  value: UserType;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  description: string;
  color: string;
}

export const userTypeOptions: UserTypeOption[] = [
  {
    value: UserType.Player,
    label: "Jogador",
    icon: User,
    description: "Atleta profissional ou amador",
    color: "bg-blue-100 text-blue-800"
  },
  {
    value: UserType.Club,
    label: "Clube",
    icon: Building,
    description: "Representante ou gestor de clube",
    color: "bg-red-100 text-red-800"
  },
  {
    value: UserType.Agent,
    label: "Agente",
    icon: Briefcase,
    description: "Representante de jogadores",
    color: "bg-green-100 text-green-800"
  },
  {
    value: UserType.Coach,
    label: "Técnico",
    icon: Target,
    description: "Treinador ou preparador",
    color: "bg-purple-100 text-purple-800"
  },
  {
    value: UserType.Scout,
    label: "Olheiro",
    icon: Trophy,
    description: "Observador de talentos",
    color: "bg-orange-100 text-orange-800"
  },
  {
    value: UserType.Journalist,
    label: "Jornalista",
    icon: PenTool,
    description: "Profissional de mídia esportiva",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    value: UserType.MedicalStaff,
    label: "Staff Médico",
    icon: Stethoscope,
    description: "Profissional de saúde esportiva",
    color: "bg-teal-100 text-teal-800"
  },
  {
    value: UserType.FinancialStaff,
    label: "Staff Financeiro",
    icon: Calculator,
    description: "Profissional de finanças do clube",
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    value: UserType.TechnicalStaff,
    label: "Staff Técnico",
    icon: Activity,
    description: "Profissional de apoio técnico",
    color: "bg-cyan-100 text-cyan-800"
  },
  {
    value: UserType.Fan,
    label: "Torcedor",
    icon: Smile,
    description: "Acompanhe seu time e jogadores favoritos",
    color: "bg-gray-100 text-gray-800"
  },
  {
    value: UserType.Admin,
    label: "Administrador",
    icon: Shield,
    description: "Gerenciamento e moderação do site",
    color: "bg-red-100 text-red-800"
  }
];

export const getSpecializationPlaceholder = (userType: UserType | string) => {
  const placeholders: Record<string, string> = {
    [UserType.Player]: "Ex: Meio-campo, Atacante, Goleiro...",
    [UserType.Club]: "Ex: Futebol profissional, Base, Feminino...",
    [UserType.Agent]: "Ex: Negociação de contratos, Transferências internacionais...",
    [UserType.Coach]: "Ex: Futebol de base, Preparação física, Análise técnica...",
    [UserType.Scout]: "Ex: Talentos jovens, Mercado europeu, Futebol brasileiro...",
    [UserType.Journalist]: "Ex: Cobertura de jogos, Entrevistas, Análise tática...",
    [UserType.MedicalStaff]: "Ex: Fisioterapia, Nutrição esportiva, Preparação física...",
    [UserType.FinancialStaff]: "Ex: Contabilidade, Orçamento, Análise de investimentos...",
    [UserType.TechnicalStaff]: "Ex: Análise de dados, Suporte de vídeo, Tecnologia esportiva...",
    [UserType.Fan]: "Ex: Acompanhamento de notícias, Interação com outros torcedores...",
    [UserType.Admin]: "Ex: Gerenciamento de usuários, Moderação de conteúdo..."
  };
  return placeholders[userType] || "Descreva sua especialização...";
};

export const getPostTypeOptions = (userType: UserType) => {
  const baseOptions = [
    { value: "post", label: "Post Normal" }
  ];

  const userTypeSpecificOptions: Record<UserType, { value: string; label: string }[]> = {
    [UserType.Player]: [
      { value: "training", label: "Treinamento" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    [UserType.Club]: [
      { value: "transfer", label: "Transferência" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    [UserType.Agent]: [
      { value: "transfer", label: "Transferência" }
    ],
    [UserType.Coach]: [
      { value: "training", label: "Treinamento" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    [UserType.Scout]: [
      { value: "match_result", label: "Análise da Partida" }
    ],
    [UserType.Journalist]: [],
    [UserType.MedicalStaff]: [],
    [UserType.FinancialStaff]: [],
    [UserType.TechnicalStaff]: [],
    [UserType.Fan]: [],
    [UserType.Admin]: [], // Admin doesn't have specific post types for now
  };

  return [
    ...baseOptions,
    ...(userTypeSpecificOptions[userType] || [])
  ];
};

export const getUserTypeColor = (userType: UserType | string | null) => {
  if (!userType) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  const colors: Record<string, string> = {
    player: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    club: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    coach: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    scout: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    medical_staff: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    financial_staff: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    technical_staff: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    journalist: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    fan: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[userType] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"; // Fallback para 'Usuário' genérico
};

export const getUserTypeLabel = (userType: UserType | string | null) => {
  if (!userType) return "Não Definido";
  const labels: Record<string, string> = {
    player: "Jogador",
    club: "Clube", 
    agent: "Agente",
    coach: "Técnico",
    scout: "Olheiro",
    medical_staff: "Staff Médico",
    financial_staff: "Staff Financeiro",
    technical_staff: "Staff Técnico",
    journalist: "Jornalista",
    fan: "Torcedor",
    admin: "Administrador",
  };
  return labels[userType] || "Usuário"; // Fallback para 'Usuário' genérico
};

export const getDepartmentLabel = (dept: ClubDepartment | string) => {
  const labels: Record<string, string> = {
    medical: "Médico",
    financial: "Financeiro", 
    technical: "Técnico",
    scouting: "Scouting",
    management: "Diretoria",
    admin: "Admin"
  };
  return labels[dept] || dept;
};

export const getPermissionLabel = (level: PermissionLevel | string) => {
  const labels: Record<string, string> = {
    read: "Leitura",
    write: "Escrita",
    admin: "Administrador"
  };
  return labels[level] || level;
};

// Nova função para mapear ClubDepartment para UserType
export const mapDepartmentToUserType = (department: ClubDepartment): UserType => {
  switch (department) {
    case ClubDepartment.Medical: return UserType.MedicalStaff;
    case ClubDepartment.Scouting: return UserType.Scout;
    case ClubDepartment.Technical: return UserType.TechnicalStaff;
    case ClubDepartment.Financial: return UserType.FinancialStaff;
    case ClubDepartment.Management: return UserType.Club; // Gerente de clube
    case ClubDepartment.Admin: return UserType.Admin;
    default: return UserType.Fan; // Fallback seguro
  }
};