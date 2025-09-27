import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";  
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardRouter from "@/components/dashboard/DashboardRouter";
import UserTypeSetup from "@/components/dashboard/UserTypeSetup";
import ClubInviteSetup from "@/components/dashboard/ClubInviteSetup";
import CreateClubDialog from "@/components/dashboard/CreateClubDialog"; // Import new component
import { LogOut, Bell, Settings, Search, Users, Building, TrendingUp, MessageSquare } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  user_type: string | null; // user_type can be null initially
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface ClubMembership {
  id: string;
  club_id: string;
  department: string;
  permission_level: string;
  status: string;
  clubs: {
    name: string;
    logo_url?: string;
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserTypeSetup, setShowUserTypeSetup] = useState(false);
  const [showClubInviteSetup, setShowClubInviteSetup] = useState(false);
  const [showCreateClubDialog, setShowCreateClubDialog] = useState(false); // State for new dialog
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchClubMemberships();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && profile) {
      // Onboarding flow logic
      if (!profile.user_type) {
        setShowUserTypeSetup(true);
        return;
      }

      const isClubRelatedUser = ['medical_staff', 'financial_staff', 'technical_staff', 'scout', 'coach', 'club'].includes(profile.user_type);
      
      if (profile.user_type === 'club') {
        // If user is a club, check if they own a club
        const userOwnsClub = clubMemberships.some(m => m.permission_level === 'admin' && m.department === 'management');
        if (!userOwnsClub) {
          setShowCreateClubDialog(true);
          return;
        }
      } else if (isClubRelatedUser) {
        // If user is staff-related, check if they are part of any club
        if (clubMemberships.length === 0) {
          setShowClubInviteSetup(true);
          return;
        }
      }

      // If onboarding is complete, handle redirection
      const isAlreadyOnClubPage = location.pathname.startsWith('/dashboard/club') || location.pathname.startsWith('/dashboard/players');
      const isAlreadyOnProfilePage = location.pathname.startsWith('/dashboard/profile');
      const isAlreadyOnMarketPage = location.pathname.startsWith('/dashboard/market');
      const isAlreadyOnMessagesPage = location.pathname.startsWith('/dashboard/messages');
      const isAlreadyOnNotificationsPage = location.pathname.startsWith('/dashboard/notifications');
      const isAlreadyOnFeedPage = location.pathname === '/dashboard';


      if (isClubRelatedUser && clubMemberships.length > 0 && location.pathname === '/dashboard') {
        navigate('/dashboard/club', { replace: true });
      } else if (profile.user_type === 'player' && location.pathname === '/dashboard') {
        navigate('/dashboard/profile', { replace: true });
      } else if (profile.user_type === 'agent' && location.pathname === '/dashboard') {
        navigate('/dashboard/market', { replace: true });
      } else if (profile.user_type === 'journalist' && location.pathname === '/dashboard') {
        navigate('/dashboard/notifications', { replace: true }); // Example for journalist
      } else if (profile.user_type === 'fan' && location.pathname === '/dashboard') {
        navigate('/dashboard/messages', { replace: true }); // Example for fan
      }
    }
  }, [loading, profile, clubMemberships, showUserTypeSetup, showClubInviteSetup, showCreateClubDialog, location.pathname, navigate]);


  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubMemberships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          *,
          clubs (
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching club memberships:', error);
        return;
      }

      setClubMemberships(data || []);
    } catch (error) {
      console.error('Error fetching club memberships:', error);
    }
  };

  const handleUserTypeSetupComplete = async (userType: string, profileData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: userType as any,
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

      setShowUserTypeSetup(false);
      await fetchProfile(); // Re-fetch profile to update user_type in state
      await fetchClubMemberships(); // Re-fetch memberships as user_type might affect them
      
      toast({
        title: "Perfil configurado!",
        description: "Seu perfil foi configurado com sucesso.",
      });
    } catch (error) {
      console.error('Error in handleUserTypeSetup:', error);
    }
  };

  const handleClubInviteSetupComplete = async () => {
    setShowClubInviteSetup(false);
    await fetchProfile();
    await fetchClubMemberships();
  };

  const handleClubCreated = async () => {
    setShowCreateClubDialog(false);
    await fetchProfile();
    await fetchClubMemberships();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserTypeColor = (userType: string | null) => {
    if (!userType) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    const colors = {
      player: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      club: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      coach: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      scout: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      medical_staff: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      financial_staff: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      technical_staff: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      journalist: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      fan: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[userType as keyof typeof colors] || colors.fan;
  };

  const getUserTypeLabel = (userType: string | null) => {
    if (!userType) return "Não Definido";
    const labels = {
      player: "Jogador",
      club: "Clube", 
      agent: "Agente",
      coach: "Técnico",
      scout: "Olheiro",
      medical_staff: "Staff Médico",
      financial_staff: "Staff Financeiro",
      technical_staff: "Staff Técnico",
      journalist: "Jornalista",
      fan: "Torcedor"
    };
    return labels[userType as keyof typeof labels] || "Usuário";
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

  if (showUserTypeSetup) {
    return <UserTypeSetup onComplete={handleUserTypeSetupComplete} />;
  }

  if (showCreateClubDialog) {
    return <CreateClubDialog open={showCreateClubDialog} onOpenChange={setShowCreateClubDialog} onClubCreated={handleClubCreated} />;
  }

  if (showClubInviteSetup) {
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
              <DashboardRouter />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;