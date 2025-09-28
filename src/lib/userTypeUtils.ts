import { User, Building, Briefcase, Target, Trophy, PenTool, Activity, Stethoscope, Calculator, Smile, LucideProps } from "lucide-react";
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
    value: "player",
    label: "Jogador",
    icon: User,
    description: "Atleta profissional ou amador",
    color: "bg-blue-100 text-blue-800"
  },
  {
    value: "club",
    label: "Clube",
    icon: Building,
    description: "Representante ou gestor de clube",
    color: "bg-red-100 text-red-800"
  },
  {
    value: "agent",
    label: "Agente",
    icon: Briefcase,
    description: "Representante de jogadores",
    color: "bg-green-100 text-green-800"
  },
  {
    value: "coach",
    label: "Técnico",
    icon: Target,
    description: "Treinador ou preparador",
    color: "bg-purple-100 text-purple-800"
  },
  {
    value: "scout",
    label: "Olheiro",
    icon: Trophy,
    description: "Observador de talentos",
    color: "bg-orange-100 text-orange-800"
  },
  {
    value: "journalist",
    label: "Jornalista",
    icon: PenTool,
    description: "Profissional de mídia esportiva",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    value: "medical_staff",
    label: "Staff Médico",
    icon: Stethoscope,
    description: "Profissional de saúde esportiva",
    color: "bg-teal-100 text-teal-800"
  },
  {
    value: "financial_staff",
    label: "Staff Financeiro",
    icon: Calculator,
    description: "Profissional de finanças do clube",
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    value: "technical_staff",
    label: "Staff Técnico",
    icon: Activity,
    description: "Profissional de apoio técnico",
    color: "bg-cyan-100 text-cyan-800"
  },
  {
    value: "fan",
    label: "Torcedor",
    icon: Smile,
    description: "Acompanhe seu time e jogadores favoritos",
    color: "bg-gray-100 text-gray-800"
  }
];

export const getSpecializationPlaceholder = (userType: UserType | string) => {
  const placeholders: Record<string, string> = {
    player: "Ex: Meio-campo, Atacante, Goleiro...",
    club: "Ex: Futebol profissional, Base, Feminino...",
    agent: "Ex: Negociação de contratos, Transferências internacionais...",
    coach: "Ex: Futebol de base, Preparação física, Análise técnica...",
    scout: "Ex: Talentos jovens, Mercado europeu, Futebol brasileiro...",
    journalist: "Ex: Cobertura de jogos, Entrevistas, Análise tática...",
    medical_staff: "Ex: Fisioterapia, Nutrição esportiva, Preparação física...",
    financial_staff: "Ex: Contabilidade, Orçamento, Análise de investimentos...",
    technical_staff: "Ex: Análise de dados, Suporte de vídeo, Tecnologia esportiva...",
    fan: "Ex: Acompanhamento de notícias, Interação com outros torcedores..."
  };
  return placeholders[userType] || "Descreva sua especialização...";
};

export const getPostTypeOptions = (userType: UserType) => {
  const baseOptions = [
    { value: "post", label: "Post Normal" }
  ];

  const userTypeSpecificOptions: Record<UserType, { value: string; label: string }[]> = {
    player: [
      { value: "training", label: "Treinamento" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    club: [
      { value: "transfer", label: "Transferência" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    agent: [
      { value: "transfer", label: "Transferência" }
    ],
    coach: [
      { value: "training", label: "Treinamento" },
      { value: "match_result", label: "Resultado da Partida" }
    ],
    scout: [
      { value: "match_result", label: "Análise da Partida" }
    ],
    journalist: [],
    medical_staff: [],
    financial_staff: [],
    technical_staff: [],
    fan: [],
  };

  return [
    ...baseOptions,
    ...(userTypeSpecificOptions[userType] || [])
  ];
};