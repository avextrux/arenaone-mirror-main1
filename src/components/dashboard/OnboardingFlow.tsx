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
      // Update generic profile data
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          user_type: userType as UserType,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          specialization: profileData.specialization,
          experience: profileData.experience,
          achievements: profileData.achievements
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        toast({
          title: "Erro ao atualizar perfil",
          description: "Ocorreu um erro ao salvar suas informações.",
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

        if (!existingPlayer) {
          const { error: playerInsertError } = await supabase
            .from('players')
            .insert([{
              profile_id: user.id,
              first_name: user.user_metadata.full_name.split(' ')[0] || '', // Assuming full_name is in user_metadata
              last_name: user.user_metadata.full_name.split(' ').slice(1).join(' ') || '',
              date_of_birth: profileData.date_of_birth,
              nationality: profileData.nationality,
              position: profileData.position,
              preferred_foot: profileData.preferred_foot || null,
              // Other player fields can be null initially or set to defaults
            }]);

          if (playerInsertError) {
            console.error('Error creating player entry:', playerInsertError);
            toast({
              title: "Erro ao criar perfil de jogador",
              description: "Ocorreu um erro ao salvar suas informações de jogador.",
              variant: "destructive",
            });
            return;
          }
        } else {
          // If player entry already exists, update it
          const { error: playerUpdateError } = await supabase
            .from('players')
            .update({
              date_of_birth: profileData.date_of_birth,
              nationality: profileData.nationality,
              position: profileData.position,
              preferred_foot: profileData.preferred_foot || null,
            })
            .eq('profile_id', user.id);

          if (playerUpdateError) {
            console.error('Error updating player entry:', playerUpdateError);
            toast({
              title: "Erro ao atualizar perfil de jogador",
              description: "Ocorreu um erro ao atualizar suas informações de jogador.",
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