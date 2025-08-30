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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  UserPlus, 
  UsersRound, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Church,
  Calendar,
  FileText,
  Settings,
  Shield,
  Activity,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: Home,
    href: "/dashboard",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"],
    badge: null,
    description: "Vue d'ensemble"
  },
  {
    title: "Adhérents",
    icon: Users,
    href: "/adherents",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"],
    badge: null,
    description: "Gérer les membres"
  },
  {
    title: "Nouveau adhérent",
    icon: UserPlus,
    href: "/adherents/new",
    roles: ["ADMIN", "RESPONSABLE"],
    badge: null,
    description: "Ajouter un membre"
  },
  {
    title: "Groupes",
    icon: UsersRound,
    href: "/groupes",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"],
    badge: null,
    description: "Groupes paroissiaux"
  },
  {
    title: "Nouveau groupe",
    icon: Sparkles,
    href: "/groupes/new",
    roles: ["ADMIN", "RESPONSABLE"],
    badge: "Nouveau",
    description: "Créer un groupe"
  },
  {
    title: "Statistiques",
    icon: BarChart3,
    href: "/statistiques",
    roles: ["ADMIN", "RESPONSABLE"],
    badge: null,
    description: "Analyses et rapports"
  },
  {
    title: "Calendrier",
    icon: Calendar,
    href: "/calendrier",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"],
    badge: null,
    description: "Événements"
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/documents",
    roles: ["ADMIN", "RESPONSABLE", "UTILISATEUR"],
    badge: null,
    description: "Fichiers partagés"
  }
];

const adminOnlyItems = [
  {
    title: "Utilisateurs",
    icon: Shield,
    href: "/utilisateurs",
    roles: ["ADMIN"],
    badge: null,
    description: "Gestion des accès"
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/parametres",
    roles: ["ADMIN"],
    badge: null,
    description: "Configuration"
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { utilisateur, signOut } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    utilisateur && item.roles.includes(utilisateur.role)
  );

  const filteredAdminItems = adminOnlyItems.filter(item => 
    utilisateur && item.roles.includes(utilisateur.role)
  );

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'RESPONSABLE': return 'Responsable';
      default: return 'Utilisateur';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-destructive text-destructive-foreground';
      case 'RESPONSABLE': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-br from-sidebar-background to-sidebar-accent/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow animate-pulse-glow">
            <Church className="h-6 w-6 text-primary-foreground" />
            <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-30 blur-xl animate-pulse" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-sidebar-foreground tracking-tight">FJKM Vatomandry</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Gestion paroissiale moderne
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
            Navigation principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="group">
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`
                        relative overflow-hidden transition-all duration-200
                        ${isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm' : 'hover:bg-sidebar-accent'}
                      `}
                    >
                      <Link to={item.href}>
                        <div className={`
                          p-1 rounded-lg transition-all duration-200
                          ${isActive ? 'bg-primary/10' : 'group-hover:bg-sidebar-accent'}
                        `}>
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-gradient-accent text-xs px-1.5 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className={`
                          ml-auto h-4 w-4 transition-transform duration-200
                          ${isActive ? 'translate-x-0 opacity-100' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50'}
                        `} />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href} className="group">
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive}
                        className={`
                          relative overflow-hidden transition-all duration-200
                          ${isActive ? 'bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive shadow-sm' : 'hover:bg-sidebar-accent'}
                        `}
                      >
                        <Link to={item.href}>
                          <div className={`
                            p-1 rounded-lg transition-all duration-200
                            ${isActive ? 'bg-destructive/10' : 'group-hover:bg-sidebar-accent'}
                          `}>
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-destructive' : ''}`} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <ChevronRight className={`
                            ml-auto h-4 w-4 transition-transform duration-200
                            ${isActive ? 'translate-x-0 opacity-100' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50'}
                          `} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-br from-sidebar-background to-sidebar-accent/5">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-sidebar-accent/50 backdrop-blur">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-glow">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                {utilisateur?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {utilisateur?.username}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-0 ${utilisateur && getRoleBadgeColor(utilisateur.role)}`}>
                  {utilisateur && getRoleLabel(utilisateur.role)}
                </Badge>
              </div>
            </div>
          </div>
          <SidebarMenuButton 
            onClick={signOut}
            className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium">Déconnexion</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}