import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UsersRound, UserCheck, TrendingUp, ChartBar, Calendar, Shield, Activity, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Stats } from "@/types/database";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function DashboardAdmin() {
  const [stats, setStats] = useState<Stats>({
    totalAdherents: 0,
    totalHommes: 0,
    totalFemmes: 0,
    totalGroupes: 0,
    adherentsParQuartier: [],
    adherentsParGroupe: []
  });
  const [userStats, setUserStats] = useState({
    totalAdmins: 0,
    totalResponsables: 0,
    totalUtilisateurs: 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchUserStats();
    fetchMonthlyGrowth();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { count: totalAdmins } = await supabase
        .from('utilisateurs')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'ADMIN');

      const { count: totalResponsables } = await supabase
        .from('utilisateurs')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'RESPONSABLE');

      const { count: totalUtilisateurs } = await supabase
        .from('utilisateurs')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'UTILISATEUR');

      setUserStats({
        totalAdmins: totalAdmins || 0,
        totalResponsables: totalResponsables || 0,
        totalUtilisateurs: totalUtilisateurs || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchMonthlyGrowth = async () => {
    try {
      const { data } = await supabase
        .from('adherents')
        .select('date_inscription')
        .order('date_inscription', { ascending: true });

      if (data) {
        const monthlyData = data.reduce((acc: any, curr) => {
          const month = new Date(curr.date_inscription).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const growthData = Object.entries(monthlyData).map(([month, count]) => ({
          month,
          adherents: count
        }));

        setMonthlyGrowth(growthData.slice(-6)); // Last 6 months
      }
    } catch (error) {
      console.error('Error fetching monthly growth:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: totalAdherents } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true });

      const { count: totalHommes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true })
        .eq('sexe', 'M');

      const { count: totalFemmes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact', head: true })
        .eq('sexe', 'F');

      const { count: totalGroupes } = await supabase
        .from('groupes')
        .select('*', { count: 'exact', head: true });

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
    { name: 'Hommes', value: stats.totalHommes, color: 'hsl(var(--chart-1))' },
    { name: 'Femmes', value: stats.totalFemmes, color: 'hsl(var(--chart-2))' }
  ];

  const roleData = [
    { name: 'Administrateurs', value: userStats.totalAdmins, color: 'hsl(var(--destructive))' },
    { name: 'Responsables', value: userStats.totalResponsables, color: 'hsl(var(--warning))' },
    { name: 'Utilisateurs', value: userStats.totalUtilisateurs, color: 'hsl(var(--success))' }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded w-64"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background to-muted/5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Administrateur
          </h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble complète de votre paroisse</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border shadow-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Adhérents</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAdherents}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-xs text-muted-foreground">Membres actifs de la paroisse</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-chart-1/10 via-chart-1/5 to-transparent border-chart-1/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Hommes</CardTitle>
            <div className="p-2 bg-chart-1/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalHommes}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-chart-1 to-chart-1/70"
                  style={{ width: `${stats.totalAdherents > 0 ? Math.round((stats.totalHommes / stats.totalAdherents) * 100) : 0}%` }}
                />
              </div>
              <span className="text-xs font-medium">{stats.totalAdherents > 0 ? Math.round((stats.totalHommes / stats.totalAdherents) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent border-chart-2/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Femmes</CardTitle>
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalFemmes}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-chart-2 to-chart-2/70"
                  style={{ width: `${stats.totalAdherents > 0 ? Math.round((stats.totalFemmes / stats.totalAdherents) * 100) : 0}%` }}
                />
              </div>
              <span className="text-xs font-medium">{stats.totalAdherents > 0 ? Math.round((stats.totalFemmes / stats.totalAdherents) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Groupes</CardTitle>
            <div className="p-2 bg-secondary/10 rounded-lg">
              <UsersRound className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalGroupes}</div>
            <p className="text-xs text-muted-foreground mt-2">Groupes paroissiaux actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Administrateurs</CardTitle>
            <Shield className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">{userStats.totalAdmins}</div>
            <p className="text-sm text-muted-foreground mt-2">Accès complet au système</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Responsables</CardTitle>
            <Activity className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-warning">{userStats.totalResponsables}</div>
            <p className="text-sm text-muted-foreground mt-2">Gestion des adhérents</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Utilisateurs</CardTitle>
            <FileText className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">{userStats.totalUtilisateurs}</div>
            <p className="text-sm text-muted-foreground mt-2">Consultation uniquement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gender Distribution */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-primary" />
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
                  outerRadius={100}
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

        {/* Role Distribution */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Répartition des rôles utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      {monthlyGrowth.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Croissance mensuelle des adhérents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="adherents" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Groups Distribution */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" />
            Adhérents par groupe paroissial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.adherentsParGroupe}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="nom_groupe" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quartier Distribution */}
      {stats.adherentsParQuartier.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-primary" />
              Répartition géographique par quartier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.adherentsParQuartier}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="quartier" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Nombre d'adhérents" 
                  fill="hsl(var(--secondary))" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}