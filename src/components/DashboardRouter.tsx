import { useAuth } from "@/lib/auth-context";
import DashboardAdmin from "@/pages/DashboardAdmin";
import DashboardResponsable from "@/pages/DashboardResponsable";
import DashboardUtilisateur from "@/pages/DashboardUtilisateur";

export function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'ADMIN':
      return <DashboardAdmin />;
    case 'RESPONSABLE':
      return <DashboardResponsable />;
    case 'UTILISATEUR':
    default:
      return <DashboardUtilisateur />;
  }
}