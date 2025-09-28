import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, KeyRound, Shield, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
    { title: "Gerenciar Convites", url: "/admin-dashboard/club-invites", icon: KeyRound },
    { title: "Moderação do Site", url: "/admin-dashboard/moderation", icon: Shield },
    { title: "Configurações", url: "/admin-dashboard/settings", icon: Settings, disabled: true },
  ];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-red-500 text-white font-medium" 
      : "text-foreground hover:bg-red-500/10 hover:text-red-500";

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} border-r border-border/50 bg-card/30 backdrop-blur-sm`}>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-heading font-bold text-red-500 px-2 mb-4">
            {!collapsed && "Admin Panel"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                      }
                      aria-disabled={item.disabled}
                      tabIndex={item.disabled ? -1 : undefined}
                      onClick={(e) => item.disabled && e.preventDefault()}
                    >
                      <item.icon className={`h-4 w-4 ${!collapsed ? 'mr-3' : ''}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                      {item.disabled && !collapsed && (
                        <span className="ml-auto text-xs text-muted-foreground">Em Breve</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-6">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Sair</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;