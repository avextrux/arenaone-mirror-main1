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
  const { user } = useAuth();
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
      console.error('useOnboardingStatus: Error fetching profile:', error);
      return null;
    }
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
      console.error('useOnboardingStatus: Error fetching club memberships:', error);
      return [];
    }
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
      console.error('useOnboardingStatus: Error fetching managed clubs:', error);
      return [];
    }
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
      console.error('useOnboardingStatus: Error fetching unread notification count:', error);
      return 0;
    }
    setUnreadNotificationCount(count || 0);
    return count || 0;
  }, [user]);

  const checkOnboardingStatus = useCallback(async () => {
    setLoading(true);
    const currentProfile = await fetchProfile();
    const currentMemberships = await fetchClubMemberships();
    await fetchUnreadNotificationCount();

    if (!currentProfile) {
      setLoading(false);
      return;
    }

    let nextStep: OnboardingStep = "complete";

    if (!currentProfile.user_type || currentProfile.user_type === UserType.Fan) {
      nextStep = "userTypeSetup";
    } else {
      // Tratamento especial para UserType.Club
      if (currentProfile.user_type === UserType.Club) {
        const managedClubs = await fetchManagedClubs();
        if (managedClubs.length === 0) {
          // Se um usuário do tipo clube não gerencia nenhum clube, ele precisa passar pelo convite/criação de clube
          nextStep = "clubInvite";
        } else {
          // Se ele gerencia um clube, seu onboarding está completo para a afiliação ao clube.
          nextStep = "complete";
        }
      } else {
        // Para outros tipos de usuário que precisam de afiliação a um clube
        const needsClubAffiliation = [
          UserType.Player,
          UserType.Agent,
          UserType.MedicalStaff,
          UserType.FinancialStaff,
          UserType.TechnicalStaff,
          UserType.Scout,
          UserType.Coach,
        ];
        
        if (needsClubAffiliation.includes(currentProfile.user_type)) {
          if (!currentMemberships || currentMemberships.length === 0) {
            nextStep = "clubInvite";
          }
        }
      }
    }

    setOnboardingStep(nextStep);
    setLoading(false);

  }, [user, location.pathname, fetchProfile, fetchClubMemberships, fetchUnreadNotificationCount, fetchManagedClubs]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setLoading(false);
    }
  }, [user, checkOnboardingStatus]);

  return { loading, onboardingStep, profile, clubMemberships, unreadNotificationCount, refetchStatus: checkOnboardingStatus };
};