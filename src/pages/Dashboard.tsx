import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UsersRound, UserCheck, TrendingUp, ChartBar, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Stats } from "@/types/database";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAdherents: 0,
    totalHommes: 0,
    totalFemmes: 0,
    totalGroupes: 0,
    adherentsParQuartier: [],
    adherentsParGroupe: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total adherents
      const { count: totalAdherents } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true });

      // Fetch by gender
      const { count: totalHommes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true })
        .eq('sexe', 'M');

      const { count: totalFemmes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true })
        .eq('sexe', 'F');

      // Fetch total groups
      const { count: totalGroupes } = await supabase
        .from('groupes')
        .select('*', { count: 'exact', head: true });

      // Fetch adherents by quartier
      const { data: quartierData } = await supabase
        .from('adherents')
        .select('quartier')
        .not('quartier', 'is', null);

      const quartierCounts = quartierData?.reduce((acc: any, curr) => {
        acc[curr.quartier] = (acc[curr.quartier] || 0) + 1;
        return acc;
      }, {});

      const adherentsParQuartier = Object.entries(quartierCounts || {}).map(([quartier, count]) => ({
        quartier,
        count: count as number
      }));

      // Fetch adherents by group
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
      }));

      setStats({
        totalAdherents: totalAdherents || 0,
        totalHommes: totalHommes || 0,
        totalFemmes: totalFemmes || 0,
        totalGroupes: totalGroupes || 0,
        adherentsParQuartier,
        adherentsParGroupe
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Hommes', value: stats.totalHommes, color: '#3B82F6' },
    { name: 'Femmes', value: stats.totalFemmes, color: '#EC4899' }
  ];

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
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

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hommes</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHommes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAdherents > 0 ? Math.round((stats.totalHommes / stats.totalAdherents) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Femmes</CardTitle>
            <UserCheck className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFemmes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAdherents > 0 ? Math.round((stats.totalFemmes / stats.totalAdherents) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes</CardTitle>
            <UsersRound className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroupes}</div>
            <p className="text-xs text-muted-foreground">Groupes paroissiaux</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Répartition par genre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Groups Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Adhérents par groupe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.adherentsParGroupe}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom_groupe" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quartier Distribution */}
      {stats.adherentsParQuartier.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5" />
              Répartition par quartier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.adherentsParQuartier}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quartier" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Nombre d'adhérents" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}