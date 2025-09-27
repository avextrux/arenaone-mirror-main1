import { UserType } from "@/integrations/supabase/types";

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
    referee: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
    referee: "Árbitro"
  };
  return labels[userType] || "Usuário"; // Fallback para 'Usuário' genérico
};