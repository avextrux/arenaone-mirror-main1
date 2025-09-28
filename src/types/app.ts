import { Tables, UserType, ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";

// Perfil de usuário com campos essenciais garantidos como não-nulos para uso na UI
export interface AppProfile extends Tables<'profiles'> {
  full_name: NonNullable<Tables<'profiles'>['full_name']>;
  user_type: NonNullable<Tables<'profiles'>['user_type']>;
  verified: NonNullable<Tables<'profiles'>['verified']>;
  email: NonNullable<Tables<'profiles'>['email']>; // Adicionado para garantir que email não seja nulo
  // Outros campos podem ser adicionados aqui se forem sempre esperados como não-nulos na UI
}

// Perfil de autor para o feed, um subconjunto de AppProfile
export interface FeedAuthorProfile {
  id: string;
  full_name: NonNullable<Tables<'profiles'>['full_name']>;
  avatar_url?: Tables<'profiles'>['avatar_url'];
  user_type: NonNullable<Tables<'profiles'>['user_type']>;
  verified: NonNullable<Tables<'profiles'>['verified']>;
  email: NonNullable<Tables<'profiles'>['email']>;
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

// Plano de Treino (definido manualmente, pois 'training_plans' não está em supabase/types.ts)
export interface AppTrainingPlan {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  focus_areas: string[];
  assigned_players: string[]; // Player IDs
  coach_id: string;
  created_at: string;
  profiles: AppProfile | null;
  players_info?: Array<{ id: string; first_name: string; last_name: string }>;
}

// Post estendido com o perfil do autor
export interface AppPost extends Tables<'posts'> {
  profiles: FeedAuthorProfile | null;
}