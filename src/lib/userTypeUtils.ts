import { User, Building, Briefcase, Target, Trophy, PenTool, Activity, Stethoscope, Calculator, Smile, LucideProps, Shield } from "lucide-react";
import { UserType } from "@/integrations/supabase/types";
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