import { Tables, UserType, ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";

// Perfil de usuário com campos essenciais garantidos como não-nulos para uso na UI
export interface AppProfile extends Tables<'profiles'> {
  full_name: NonNullable<Tables<'profiles'>['full_name']>;
  user_type: NonNullable<Tables<'profiles'>['user_type']>;
  verified: NonNullable<Tables<'profiles'>['verified']>;
  // Outros campos podem ser adicionados aqui se forem sempre esperados como não-nulos na UI
}

// Membro do clube com informações do clube aninhadas
export interface AppClubMembership extends Tables<'club_members'> {
  clubs: {
    name: string;
    logo_url?: string | null;
  };
}

// Jogador com campos essenciais garantidos como não-nulos para uso na UI
export interface AppPlayer extends Tables<'players'> {
  first_name: NonNullable<Tables<'players'>['first_name']>;
  last_name: NonNullable<Tables<'players'>['last_name']>;
  nationality: NonNullable<Tables<'players'>['nationality']>;
  position: NonNullable<Tables<'players'>['position']>;
  date_of_birth: NonNullable<Tables<'players'>['date_of_birth']>;
}

// Oportunidade com perfil do poster aninhado
export interface AppOpportunity extends Tables<'opportunities'> {
  profiles: AppProfile;
}

// Mensagem com perfil do remetente aninhado
export interface AppMessage extends Tables<'messages'> {
  profiles?: AppProfile;
}

// Conversa com perfil do outro usuário aninhado e contagem de não lidas
export interface AppConversation extends Tables<'conversations'> {
  other_user_profile?: AppProfile;
  last_message_content?: string;
  unread_count?: number;
}

// Notificação
export interface AppNotification extends Tables<'notifications'> {}

// Transferência
export interface AppTransfer extends Tables<'transfers'> {}

// Informações Médicas do Jogador
export interface AppPlayerMedicalInfo extends Tables<'player_medical_info'> {}

// Informações Financeiras do Jogador
export interface AppPlayerFinancialInfo extends Tables<'player_financial_info'> {}

// Relatório Técnico do Jogador
export interface AppPlayerTechnicalReport extends Tables<'player_technical_reports'> {}

// Relatório de Scouting com jogador e perfil do olheiro aninhados
export interface AppScoutReport extends Tables<'scout_reports'> {
  players: (AppPlayer & { clubs: { name: string | null } | null }) | null;
  profiles: AppProfile | null;
}

// Plano de Treino (se a tabela existir, caso contrário, é um tipo customizado)
export interface AppTrainingPlan extends Tables<'training_plans'> { // Assumindo que 'training_plans' existe
  profiles: AppProfile | null;
  players_info?: Array<{ id: string; first_name: string; last_name: string }>;
}