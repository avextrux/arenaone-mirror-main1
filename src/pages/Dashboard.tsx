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
import OnboardingFlow from "@/components/dashboard/OnboardingFlow"; // Importando o novo componente OnboardingFlow
import { LogOut, Bell, Settings, Search } from "lucide-react";
import { UserType, ClubDepartment, PermissionLevel } from "@/integrations/supabase/types";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { AppProfile, AppClubMembership } from "@/types/app"; // Importar os tipos centralizados

// Exportar as interfaces centralizadas para uso em outros componentes que as importam de Dashboard
export type Profile = AppProfile;
export type ClubMembership = AppClubMembership;

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth(); // Obter authLoading do useAuth
  const { loading: onboardingLoading, onboardingStep, profile, clubMemberships, unreadNotificationCount, refetchStatus } = useOnboardingStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNotificationsClick = () => {
    navigate('/dashboard/notifications');
  };

  // Se o useAuth ainda estiver carregando, mostre o spinner
  if (authLoading) {
    console.log("Dashboard.tsx: useAuth ainda carregando.");
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado (e authLoading já terminou), ProtectedRoute deve redirecionar.
  // Este bloco é mais uma salvaguarda, mas ProtectedRoute deve lidar com isso.
  if (!user) {
    console.log("Dashboard.tsx: Usuário não autenticado após authLoading. ProtectedRoute deve redirecionar.");
    return null; 
  }

  // Se o onboarding ainda estiver carregando, mostre o spinner do onboarding
  if (onboardingLoading) {
    console.log("Dashboard.tsx: Onboarding ainda carregando.");
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando status do perfil...</p>
        </div>
      </div>
    );
  }

  console.log("Dashboard.tsx: onboardingStep =", onboardingStep);
  if (onboardingStep !== "complete") {
    console.log("Dashboard.tsx: Onboarding não completo, renderizando OnboardingFlow.");
    return (
      <OnboardingFlow 
        onboardingStep={onboardingStep} 
        profile={profile} 
        clubMemberships={clubMemberships} 
        refetchStatus={refetchStatus} 
      />
    );
  }

  // Se o onboarding estiver completo, mas o perfil ou user_type ainda estiver faltando, é um erro.
  if (!profile || !profile.user_type) {
    console.error("Dashboard.tsx: Perfil ou user_type está faltando após o onboarding. Perfil:", profile);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar perfil ou tipo de usuário não definido.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  console.log("Dashboard.tsx: Onboarding completo, renderizando Dashboard principal.");
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardSidebar userType={profile.user_type} clubMemberships={clubMemberships} />
        
        <div className="flex-1 flex flex-col">
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-primary/10 relative"
                    onClick={handleNotificationsClick}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                        {unreadNotificationCount}
                      </span>
                    )}
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