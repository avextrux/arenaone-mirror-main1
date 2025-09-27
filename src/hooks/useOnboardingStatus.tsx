import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Profile, ClubMembership } from "@/pages/Dashboard"; // Re-importando tipos

type OnboardingStep = "userTypeSetup" | "createClub" | "clubInvite" | "complete";

interface UseOnboardingStatusResult {
  loading: boolean;
  onboardingStep: OnboardingStep;
  profile: Profile | null;
  clubMemberships: ClubMembership[];
  refetchStatus: () => Promise<void>;
}

export const useOnboardingStatus = (): UseOnboardingStatusResult => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("complete");

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    setProfile(data);
    return data;
  }, [user]);

  const fetchClubMemberships = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('club_members')
      .select(`*, clubs (name, logo_url)`)
      .eq('user_id', user.id)
      .eq('status', 'accepted');
    if (error) {
      console.error('Error fetching club memberships:', error);
      return [];
    }
    setClubMemberships(data || []);
    return data || [];
  }, [user]);

  const checkOnboardingStatus = useCallback(async () => {
    setLoading(true);
    const currentProfile = await fetchProfile();
    const currentMemberships = await fetchClubMemberships();

    if (!currentProfile) {
      setLoading(false);
      // This case should ideally be handled by ProtectedRoute, but as a fallback
      // if user is null here, it means they are not authenticated or session expired.
      // ProtectedRoute will redirect to /auth.
      return;
    }

    let nextStep: OnboardingStep = "complete";

    // Se o user_type já foi definido no registro, pulamos a etapa userTypeSetup
    if (!currentProfile.user_type) {
      nextStep = "userTypeSetup";
    } else {
      const isClubRelatedUser = ['medical_staff', 'financial_staff', 'technical_staff', 'scout', 'coach', 'club', 'referee'].includes(currentProfile.user_type); // Adicionado 'referee'
      
      if (currentProfile.user_type === 'club') {
        const userOwnsClub = currentMemberships?.some(m => m.permission_level === 'admin' && m.department === 'management' && m.user_id === user?.id);
        if (!userOwnsClub) {
          nextStep = "createClub";
        }
      } else if (isClubRelatedUser) {
        if (!currentMemberships || currentMemberships.length === 0) {
          nextStep = "clubInvite";
        }
      }
    }

    setOnboardingStep(nextStep);
    setLoading(false);

    // Handle redirects if onboarding is complete and on base dashboard path
    if (nextStep === "complete" && location.pathname === '/dashboard') {
      if (currentProfile.user_type && ['medical_staff', 'financial_staff', 'technical_staff', 'scout', 'coach', 'club', 'referee'].includes(currentProfile.user_type) && currentMemberships && currentMemberships.length > 0) {
        navigate('/dashboard/club', { replace: true });
      } else if (currentProfile.user_type === 'player') {
        navigate('/dashboard/profile', { replace: true });
      } else if (currentProfile.user_type === 'agent') {
        navigate('/dashboard/market', { replace: true });
      } else if (currentProfile.user_type === 'journalist') {
        navigate('/dashboard/notifications', { replace: true });
      } else { // Fallback para qualquer outro tipo de usuário que não tenha um redirecionamento específico
        navigate('/dashboard/profile', { replace: true });
      }
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setLoading(false); // If no user, ProtectedRoute will handle redirect
    }
  }, [user, checkOnboardingStatus]);

  return { loading, onboardingStep, profile, clubMemberships, refetchStatus: checkOnboardingStatus };
};