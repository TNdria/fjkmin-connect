import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  UserPlus, 
  UsersRound, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Church 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: Home,
    href: "/dashboard",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"]
  },
  {
    title: "Adhérents",
    icon: Users,
    href: "/adherents",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"]
  },
  {
    title: "Nouveau adhérent",
    icon: UserPlus,
    href: "/adherents/new",
    roles: ["ADMIN", "RESPONSABLE"]
  },
  {
    title: "Groupes",
    icon: UsersRound,
    href: "/groupes",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"]
  },
  {
    title: "Statistiques",
    icon: BarChart3,
    href: "/statistiques",
    roles: ["ADMIN", "RESPONSABLE"]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      default: return 'Utilisateur';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Church className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">FJKM Vatomandry</h2>
            <p className="text-xs text-muted-foreground">Gestion des adhérents</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {profile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile && getRoleLabel(profile.role)}
              </p>
            </div>
          </div>
          <SidebarMenuButton 
            onClick={signOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}