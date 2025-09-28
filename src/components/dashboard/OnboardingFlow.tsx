import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import UserTypeSetup from "@/components/dashboard/UserTypeSetup";
import ClubInviteSetup from "@/components/dashboard/ClubInviteSetup";
import CreateClubDialog from "@/components/dashboard/CreateClubDialog";
import { UserType } from "@/integrations/supabase/types";
import { AppProfile, AppClubMembership } from "@/types/app"; // Importar os tipos centralizados

interface OnboardingFlowProps {
  onboardingStep: "userTypeSetup" | "createClub" | "clubInvite" | "complete";
  profile: AppProfile | null; // Usar AppProfile
  clubMemberships: AppClubMembership[]; // Usar AppClubMembership
  refetchStatus: () => Promise<void>;
}

const OnboardingFlow = ({ onboardingStep, profile, clubMemberships, refetchStatus }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUserTypeSetupComplete = async (userType: string, profileData: any) => {
    if (!user) return;
    try {
      // Prepare profile data, converting empty strings to null for optional fields
      const updatedProfileData = {
        user_type: userType as UserType,
        bio: profileData.bio || null,
        location: profileData.location || null,
        website: profileData.website || null,
        specialization: profileData.specialization || null,
        experience: profileData.experience || null,
        achievements: profileData.achievements || null
      };

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        toast({
          title: "Erro ao atualizar perfil",
          description: `Ocorreu um erro ao salvar suas informações: ${profileUpdateError.message || JSON.stringify(profileUpdateError)}.`,
          variant: "destructive",
        });
        return;
      }

      // If user is a player, also create an entry in the players table
      if (userType === 'player') {
        const { data: existingPlayer, error: fetchPlayerError } = await supabase
          .from('players')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (fetchPlayerError && fetchPlayerError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error checking existing player entry:', fetchPlayerError);
          throw fetchPlayerError;
        }

        // Prepare player data, converting empty strings to null for optional fields
        const playerPayload = {
          profile_id: user.id,
          first_name: user.user_metadata.full_name?.split(' ')[0] || '', // Assuming full_name is in user_metadata
          last_name: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
          date_of_birth: profileData.date_of_birth || null,
          nationality: profileData.nationality || null,
          position: profileData.position || null,
          preferred_foot: profileData.preferred_foot || null,
          // Other player fields can be null initially or set to defaults
        };

        if (!existingPlayer) {
          const { error: playerInsertError } = await supabase
            .from('players')
            .insert([playerPayload]);

          if (playerInsertError) {
            console.error('Error creating player entry:', playerInsertError);
            toast({
              title: "Erro ao criar perfil de jogador",
              description: `Ocorreu um erro ao salvar suas informações de jogador: ${playerInsertError.message || JSON.stringify(playerInsertError)}.`,
              variant: "destructive",
            });
            return;
          }
        } else {
          // If player entry already exists, update it
          const { error: playerUpdateError } = await supabase
            .from('players')
            .update(playerPayload)
            .eq('profile_id', user.id);

          if (playerUpdateError) {
            console.error('Error updating player entry:', playerUpdateError);
            toast({
              title: "Erro ao atualizar perfil de jogador",
              description: `Ocorreu um erro ao atualizar suas informações de jogador: ${playerUpdateError.message || JSON.stringify(playerUpdateError)}.`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      toast({
        title: "Perfil configurado!",
        description: "Seu perfil foi configurado com sucesso.",
      });
      refetchStatus();
    } catch (error) {
      console.error('Error in handleUserTypeSetup:', error);
      toast({
        title: "Erro inesperado",
        description: `Ocorreu um erro inesperado durante a configuração do perfil: ${error instanceof Error ? error.message : JSON.stringify(error)}.`,
        variant: "destructive",
      });
    }
  };

  const handleClubInviteSetupComplete = async () => {
    toast({
      title: "Afiliação ao clube!",
      description: "Você agora está vinculado a um clube.",
    });
    refetchStatus();
  };

  const handleClubCreated = async (newClub: any, newMembership: AppClubMembership) => { // Usar AppClubMembership
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