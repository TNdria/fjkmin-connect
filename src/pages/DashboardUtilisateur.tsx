import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Info, BookOpen, Bell, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export default function DashboardUtilisateur() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalAdherents: 0,
    totalGroupes: 0
  });
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Fetch des annonces pourrait venir d'une autre table
    setAnnonces([
      {
        id: 1,
        titre: "Messe de Noël",
        date: "24 Décembre 2024",
        description: "Célébration spéciale à 20h"
      },
      {
        id: 2,
        titre: "Réunion paroissiale",
        date: "15 Janvier 2025",
        description: "Discussion sur les projets 2025"
      },
      {
        id: 3,
        titre: "Journée de prière",
        date: "1er Février 2025",
        description: "Journée de recueillement et de prière commune"
      }
    ]);
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalAdherents } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true });

      const { count: totalGroupes } = await supabase
        .from('groupes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalAdherents: totalAdherents || 0,
        totalGroupes: totalGroupes || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-background via-muted/5 to-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue {profile?.prenom ? `${profile.prenom}` : 'dans votre espace'}
          </h1>
          <p className="text-muted-foreground mt-1">Consultez les informations de la paroisse</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres de la paroisse</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdherents}</div>
            <p className="text-xs text-muted-foreground">Adhérents inscrits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes paroissiaux</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroupes}</div>
            <p className="text-xs text-muted-foreground">Groupes actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Annonces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Annonces et événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {annonces.map((annonce) => (
              <div key={annonce.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border-l-4 border-primary">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning" />
                      {annonce.titre}
                    </h3>
                    <p className="text-sm text-muted-foreground">{annonce.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    {annonce.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations utiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/80 rounded-lg">
            <h4 className="font-semibold mb-2">Horaires des messes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dimanche : 8h30 et 10h30</li>
              <li>• Mercredi : 18h30</li>
              <li>• Vendredi : 7h00</li>
            </ul>
          </div>
          
          <div className="p-4 bg-background/80 rounded-lg">
            <h4 className="font-semibold mb-2">Contact paroisse</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Téléphone : 01 23 45 67 89</li>
              <li>• Email : contact@paroisse.fr</li>
              <li>• Adresse : 123 Rue de l'Église, 75000 Paris</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-3 md:grid-cols-3">
        <Button variant="outline" className="justify-start" asChild>
          <Link to="/adherents">
            <Users className="mr-2 h-4 w-4" />
            Voir les adhérents
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link to="/groupes">
            <BookOpen className="mr-2 h-4 w-4" />
            Consulter les groupes
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link to="/statistiques">
            <Info className="mr-2 h-4 w-4" />
            Statistiques
          </Link>
        </Button>
      </div>
    </div>
  );
}