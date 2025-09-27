import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import UserTypeSetup from "@/components/dashboard/UserTypeSetup";
import ClubInviteSetup from "@/components/dashboard/ClubInviteSetup";
import CreateClubDialog from "@/components/dashboard/CreateClubDialog";
import { UserType } from "@/integrations/supabase/types";
import { Profile, ClubMembership } from "@/pages/Dashboard"; // Importando tipos

interface OnboardingFlowProps {
  onboardingStep: "userTypeSetup" | "createClub" | "clubInvite" | "complete";
  profile: Profile | null;
  clubMemberships: ClubMembership[];
  refetchStatus: () => Promise<void>;
}

const OnboardingFlow = ({ onboardingStep, profile, clubMemberships, refetchStatus }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUserTypeSetupComplete = async (userType: string, profileData: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: userType as UserType,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          specialization: profileData.specialization, // NEW FIELD
          experience: profileData.experience,         // NEW FIELD
          achievements: profileData.achievements      // NEW FIELD
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: "Ocorreu um erro ao salvar suas informações.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Perfil configurado!",
        description: "Seu perfil foi configurado com sucesso.",
      });
      refetchStatus();
    } catch (error) {
      console.error('Error in handleUserTypeSetup:', error);
    }
  };

  const handleClubInviteSetupComplete = async () => {
    toast({
      title: "Afiliação ao clube!",
      description: "Você agora está vinculado a um clube.",
    });
    refetchStatus();
  };

  const handleClubCreated = async (newClub: any, newMembership: ClubMembership) => {
    toast({
      title: "Clube criado!",
      description: "Seu perfil de clube foi criado com sucesso.",
    });
    refetchStatus();
  };

  switch (onboardingStep) {
    case "userTypeSetup":
      return <UserTypeSetup onComplete={handleUserTypeSetupComplete} />;
    case "createClub":
      // For onboarding, the dialog acts as a full-page step, so it's always open.
      // onOpenChange is provided but won't typically be triggered by user interaction to close it.
      return <CreateClubDialog open={true} onOpenChange={() => {}} onClubCreated={handleClubCreated} />;
    case "clubInvite":
      return <ClubInviteSetup onComplete={handleClubInviteSetupComplete} userType={profile?.user_type || ''} />;
    case "complete":
      // This case should ideally not be reached if OnboardingFlow is rendered only when onboarding is not complete.
      // However, as a safeguard, we can redirect or show a message.
      navigate('/dashboard', { replace: true });
      return null;
    default:
      return null;
  }
};

export default OnboardingFlow;