import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import UserTypeSetup from "@/components/dashboard/UserTypeSetup";
import ClubInviteSetup from "@/components/dashboard/ClubInviteSetup";
import { UserType } from "@/integrations/supabase/types";
import { AppProfile, AppClubMembership } from "@/types/app";

interface OnboardingFlowProps {
  onboardingStep: "userTypeSetup" | "clubInvite" | "complete";
  profile: AppProfile | null;
  clubMemberships: AppClubMembership[];
  refetchStatus: () => Promise<void>;
}

const OnboardingFlow = ({ onboardingStep, profile, clubMemberships, refetchStatus }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUserTypeSetupComplete = async (userType: string, profileData: any) => {
    if (!user) return;
    console.log("OnboardingFlow: handleUserTypeSetupComplete iniciado. UserType:", userType, "ProfileData:", profileData);
    try {
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
        console.error('OnboardingFlow: Erro ao atualizar perfil:', profileUpdateError);
        toast({
          title: "Erro ao atualizar perfil",
          description: `Ocorreu um erro ao salvar suas informações: ${profileUpdateError.message || JSON.stringify(profileUpdateError)}.`,
          variant: "destructive",
        });
        return;
      }
      console.log("OnboardingFlow: Perfil atualizado com sucesso.");

      if (userType === 'player') {
        console.log("OnboardingFlow: Usuário é jogador, verificando entrada de jogador.");
        const { data: existingPlayer, error: fetchPlayerError } = await supabase
          .from('players')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (fetchPlayerError && fetchPlayerError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('OnboardingFlow: Erro ao verificar entrada de jogador existente:', fetchPlayerError);
          throw fetchPlayerError;
        }

        const playerPayload = {
          profile_id: user.id,
          first_name: user.user_metadata.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
          date_of_birth: profileData.date_of_birth || null,
          nationality: profileData.nationality || null,
          position: profileData.position || null,
          preferred_foot: profileData.preferred_foot || null,
        };

        if (!existingPlayer) {
          console.log("OnboardingFlow: Criando nova entrada de jogador.");
          const { error: playerInsertError } = await supabase
            .from('players')
            .insert([playerPayload]);

          if (playerInsertError) {
            console.error('OnboardingFlow: Erro ao criar entrada de jogador:', playerInsertError);
            toast({
              title: "Erro ao criar perfil de jogador",
              description: `Ocorreu um erro ao salvar suas informações de jogador: ${playerInsertError.message || JSON.stringify(playerInsertError)}.`,
              variant: "destructive",
            });
            return;
          }
          console.log("OnboardingFlow: Entrada de jogador criada com sucesso.");
        } else {
          console.log("OnboardingFlow: Atualizando entrada de jogador existente.");
          const { error: playerUpdateError } = await supabase
            .from('players')
            .update(playerPayload)
            .eq('profile_id', user.id);

          if (playerUpdateError) {
            console.error('OnboardingFlow: Erro ao atualizar entrada de jogador:', playerUpdateError);
            toast({
              title: "Erro ao atualizar perfil de jogador",
              description: `Ocorreu um erro ao atualizar suas informações de jogador: ${playerUpdateError.message || JSON.stringify(playerUpdateError)}.`,
              variant: "destructive",
            });
            return;
          }
          console.log("OnboardingFlow: Entrada de jogador atualizada com sucesso.");
        }
      }

      toast({
        title: "Perfil configurado!",
        description: "Seu perfil foi configurado com sucesso.",
      });
      console.log("OnboardingFlow: Refetching status após handleUserTypeSetupComplete.");
      refetchStatus();
    } catch (error) {
      console.error('OnboardingFlow: Erro em handleUserTypeSetupComplete (bloco catch):', error);
      toast({
        title: "Erro inesperado",
        description: `Ocorreu um erro inesperado durante a configuração do perfil: ${error instanceof Error ? error.message : JSON.stringify(error)}.`,
        variant: "destructive",
      });
    }
  };

  const handleClubInviteSetupComplete = async () => {
    console.log("OnboardingFlow: handleClubInviteSetupComplete iniciado.");
    toast({
      title: "Afiliação ao clube!",
      description: "Você agora está vinculado a um clube.",
    });
    console.log("OnboardingFlow: Refetching status após handleClubInviteSetupComplete.");
    refetchStatus();
  };

  switch (onboardingStep) {
    case "userTypeSetup":
      console.log("OnboardingFlow: Renderizando UserTypeSetup.");
      return <UserTypeSetup onComplete={handleUserTypeSetupComplete} />;
    case "clubInvite":
      console.log("OnboardingFlow: Renderizando ClubInviteSetup. Profile user_type:", profile?.user_type);
      return <ClubInviteSetup onComplete={handleClubInviteSetupComplete} userType={profile?.user_type || UserType.Fan} />;
    case "complete":
      console.log("OnboardingFlow: Onboarding completo, navegando para /dashboard.");
      navigate('/dashboard', { replace: true });
      return null;
    default:
      console.warn("OnboardingFlow: Passo de onboarding desconhecido:", onboardingStep);
      return null;
  }
};

export default OnboardingFlow;