import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";  
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardRouter from "@/components/dashboard/DashboardRouter";
import UserTypeSetup from "@/components/dashboard/UserTypeSetup";
import ClubInviteSetup from "@/components/dashboard/ClubInviteSetup";
import CreateClubDialog from "@/components/dashboard/CreateClubDialog";
import { LogOut, Bell, Settings, Search } from "lucide-react";
import { UserType, ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus"; // Importando o novo hook

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  user_type: UserType | null;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  department: ClubDepartment;
  permission_level: PermissionLevel;
  status: string;
  clubs: {
    name: string;
    logo_url?: string;
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { loading, onboardingStep, profile, clubMemberships, refetchStatus } = useOnboardingStatus(); // Usando o novo hook
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUserTypeSetupComplete = async (userType: string, profileData: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: userType as UserType,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website
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
      refetchStatus(); // Re-fetch status after update
    } catch (error) {
      console.error('Error in handleUserTypeSetup:', error);
    }
  };

  const handleClubInviteSetupComplete = async () => {
    toast({
      title: "Afiliação ao clube!",
      description: "Você agora está vinculado a um clube.",
    });
    refetchStatus(); // Re-fetch status
  };

  const handleClubCreated = async (newClub: any, newMembership: ClubMembership) => {
    toast({
      title: "Clube criado!",
      description: "Seu perfil de clube foi criado com sucesso.",
    });
    refetchStatus(); // Re-fetch status
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (onboardingStep === "userTypeSetup") {
    return <UserTypeSetup onComplete={handleUserTypeSetupComplete} />;
  }

  if (onboardingStep === "createClub") {
    return <CreateClubDialog open={true} onOpenChange={() => {}} onClubCreated={handleClubCreated} />;
  }

  if (onboardingStep === "clubInvite") {
    return <ClubInviteSetup onComplete={handleClubInviteSetupComplete} userType={profile?.user_type || ''} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar perfil</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardSidebar userType={profile.user_type || 'fan'} clubMemberships={clubMemberships} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="p-2" />
                <div className="flex items-center gap-2 md:gap-3">
                  <img 
                    src="/images/arenaone-logo.svg" 
                    alt="ArenaOne" 
                    className="h-6 md:h-8 w-auto" 
                  />
                  <h1 className="text-lg md:text-xl font-heading font-bold text-primary">ArenaOne</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-xs font-semibold">
                      {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold">{profile.full_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getUserTypeColor(profile.user_type)}`}>
                        {getUserTypeLabel(profile.user_type)}
                      </Badge>
                      {clubMemberships.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {clubMemberships[0].clubs.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
              <DashboardRouter profile={profile} clubMemberships={clubMemberships} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;