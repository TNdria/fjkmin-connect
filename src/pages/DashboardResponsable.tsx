import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Calendar, TrendingUp, ChartBar, FileText, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DashboardResponsable() {
  const [stats, setStats] = useState({
    totalAdherents: 0,
    nouveauxCeMois: 0,
    totalGroupes: 0,
    adherentsParGroupe: []
  });
  const [recentAdherents, setRecentAdherents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentAdherents();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalAdherents } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true });

      // Nouveaux adhérents ce mois
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const { count: nouveauxCeMois } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true })
        .gte('date_inscription', firstDayOfMonth.toISOString());

      const { count: totalGroupes } = await supabase
        .from('groupes')
        .select('*', { count: 'exact', head: true });

      // Adhérents par groupe
      const { data: groupData } = await supabase
        .from('adherents_groupes')
        .select(`
          groupe_id,
          groupes(nom_groupe)
        `);

      const groupCounts = groupData?.reduce((acc: any, curr: any) => {
        const groupName = curr.groupes?.nom_groupe;
        if (groupName) {
          acc[groupName] = (acc[groupName] || 0) + 1;
        }
        return acc;
      }, {});

      const adherentsParGroupe = Object.entries(groupCounts || {}).map(([nom_groupe, count]) => ({
        nom_groupe,
        count: count as number
      })).slice(0, 5); // Top 5 groupes

      setStats({
        totalAdherents: totalAdherents || 0,
        nouveauxCeMois: nouveauxCeMois || 0,
        totalGroupes: totalGroupes || 0,
        adherentsParGroupe
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAdherents = async () => {
    try {
      const { data } = await supabase
        .from('adherents')
        .select('*')
        .order('date_inscription', { ascending: false })
        .limit(5);

      setRecentAdherents(data || []);
    } catch (error) {
      console.error('Error fetching recent adherents:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-background to-muted/5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Responsable</h1>
          <p className="text-muted-foreground mt-1">Gérez efficacement les adhérents de la paroisse</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Link to="/adherents/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel Adhérent
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/adherents">
            <Users className="mr-2 h-4 w-4" />
            Voir tous les adhérents
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adhérents</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdherents}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Membres actifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
            <UserPlus className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nouveauxCeMois}</div>
            <p className="text-xs text-muted-foreground">Inscriptions récentes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes actifs</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroupes}</div>
            <p className="text-xs text-muted-foreground">Groupes paroissiaux</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'activité</CardTitle>
            <CheckCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Participation active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Adherents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Derniers adhérents inscrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAdherents.map((adherent) => (
                <div key={adherent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {adherent.prenom?.[0]}{adherent.nom?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{adherent.prenom} {adherent.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {new Date(adherent.date_inscription).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/adherents/${adherent.id}/edit`}>
                      Voir
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link to="/adherents">
                Voir tous les adhérents
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Groups Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Top 5 Groupes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.adherentsParGroupe}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nom_groupe" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/adherents/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un adhérent
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/groupes">
                <Users className="mr-2 h-4 w-4" />
                Gérer les groupes
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/statistiques">
                <ChartBar className="mr-2 h-4 w-4" />
                Voir les statistiques
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}