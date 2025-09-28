import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppProfile, AppClubMembership } from "@/types/app"; // Importar os tipos centralizados
import { UserType } from "@/integrations/supabase/types"; // Importar UserType

type OnboardingStep = "userTypeSetup" | "clubInvite" | "complete";

interface UseOnboardingStatusResult {
  loading: boolean;
  onboardingStep: OnboardingStep;
  profile: AppProfile | null;
  clubMemberships: AppClubMembership[];
  unreadNotificationCount: number;
  refetchStatus: () => Promise<void>;
}

export const useOnboardingStatus = (): UseOnboardingStatusResult => {
  const { user, loading: authLoading } = useAuth(); // Usar authLoading do useAuth
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [clubMemberships, setClubMemberships] = useState<AppClubMembership[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("complete");

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('useOnboardingStatus: Erro ao buscar perfil:', error);
      return null;
    }
    console.log('useOnboardingStatus: Dados do perfil buscados:', data);
    setProfile(data as AppProfile);
    return data as AppProfile;
  }, [user]);

  const fetchClubMemberships = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('club_members')
      .select(`*, clubs (name, logo_url)`)
      .eq('user_id', user.id)
      .eq('status', 'accepted');
    if (error) {
      console.error('useOnboardingStatus: Erro ao buscar afiliações a clubes:', error);
      return [];
    }
    console.log('useOnboardingStatus: Afiliações a clubes buscadas:', data);
    setClubMemberships(data as AppClubMembership[] || []);
    return data as AppClubMembership[] || [];
  }, [user]);

  const fetchManagedClubs = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('manager_id', user.id);
    if (error) {
      console.error('useOnboardingStatus: Erro ao buscar clubes gerenciados:', error);
      return [];
    }
    console.log('useOnboardingStatus: Clubes gerenciados buscados:', data);
    return data || [];
  }, [user]);

  const fetchUnreadNotificationCount = useCallback(async () => {
    if (!user) return 0;
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (error) {
      console.error('useOnboardingStatus: Erro ao buscar contagem de notificações não lidas:', error);
      return 0;
    }
    setUnreadNotificationCount(count || 0);
    return count || 0;
  }, [user]);

  const checkOnboardingStatus = useCallback(async () => {
    if (authLoading) { // Não execute se a autenticação ainda estiver carregando
      console.log("useOnboardingStatus: Auth ainda carregando, adiando checkOnboardingStatus.");
      return;
    }

    setLoading(true);
    console.log("useOnboardingStatus: Iniciando checkOnboardingStatus...");

    if (!user) {
      console.log("useOnboardingStatus: Nenhum usuário autenticado, definindo loading como false.");
      setProfile(null);
      setClubMemberships([]);
      setUnreadNotificationCount(0);
      setOnboardingStep("complete"); // Não há onboarding se não há usuário
      setLoading(false);
      return;
    }

    const currentProfile = await fetchProfile();
    const currentMemberships = await fetchClubMemberships();
    await fetchUnreadNotificationCount();

    if (!currentProfile) {
      console.log("useOnboardingStatus: Perfil não encontrado, algo está errado. Redirecionando para /auth.");
      // Isso não deveria acontecer se o usuário está autenticado, mas como fallback
      setLoading(false);
      navigate('/auth', { replace: true });
      return;
    }

    console.log("useOnboardingStatus: Tipo de Usuário do Perfil Atual:", currentProfile.user_type);
    console.log("useOnboardingStatus: Contagem de Afiliações a Clubes:", currentMemberships.length);

    let nextStep: OnboardingStep = "complete";

    if (!currentProfile.user_type || currentProfile.user_type === UserType.Fan) {
      console.log("useOnboardingStatus: Tipo de usuário é nulo ou Fan, definindo próximo passo para userTypeSetup.");
      nextStep = "userTypeSetup";
    } else {
      if (currentProfile.user_type === UserType.Club) {
        const managedClubs = await fetchManagedClubs();
        console.log("useOnboardingStatus: Usuário é do tipo Clube. Contagem de Clubes Gerenciados:", managedClubs.length);
        if (managedClubs.length === 0) {
          console.log("useOnboardingStatus: Usuário do tipo Clube não gerencia clubes, definindo próximo passo para clubInvite.");
          nextStep = "clubInvite";
        } else {
          console.log("useOnboardingStatus: Usuário do tipo Clube gerencia clubes, definindo próximo passo para complete.");
          nextStep = "complete";
        }
      } else if (currentProfile.user_type !== UserType.Admin && currentProfile.user_type !== UserType.Journalist) {
        // Outros tipos de usuário (Player, Agent, MedicalStaff, FinancialStaff, TechnicalStaff, Scout, Coach)
        // precisam de afiliação a um clube. Jornalistas e Admins não precisam.
        if (!currentMemberships || currentMemberships.length === 0) {
          console.log(`useOnboardingStatus: Usuário do tipo ${currentProfile.user_type} não tem afiliações a clubes, definindo próximo passo para clubInvite.`);
          nextStep = "clubInvite";
        } else {
          console.log(`useOnboardingStatus: Usuário do tipo ${currentProfile.user_type} tem afiliações a clubes, definindo próximo passo para complete.`);
          nextStep = "complete";
        }
      }
    }

    console.log("useOnboardingStatus: Passo final de onboarding determinado:", nextStep);
    setOnboardingStep(nextStep);
    setLoading(false);

  }, [user, authLoading, navigate, fetchProfile, fetchClubMemberships, fetchUnreadNotificationCount, fetchManagedClubs]);

  useEffect(() => {
    // Execute checkOnboardingStatus quando o usuário ou o estado de carregamento da autenticação mudar
    // e o authLoading for false (autenticação carregada)
    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, checkOnboardingStatus]);

  return { loading, onboardingStep, profile, clubMemberships, unreadNotificationCount, refetchStatus: checkOnboardingStatus };
};