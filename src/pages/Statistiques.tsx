import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Home, Calendar, ChartBar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Stats {
  totalAdherents: number;
  totalHommes: number;
  totalFemmes: number;
  totalGroupes: number;
  adherentsParQuartier: { quartier: string; count: number }[];
  adherentsParGroupe: { groupe: string; count: number }[];
  adherentsParAge: { range: string; count: number }[];
}

export default function Statistiques() {
  const [stats, setStats] = useState<Stats>({
    totalAdherents: 0,
    totalHommes: 0,
    totalFemmes: 0,
    totalGroupes: 0,
    adherentsParQuartier: [],
    adherentsParGroupe: [],
    adherentsParAge: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch total adherents
      const { count: totalAdherents } = await supabase
        .from('adherents')
        .select('*', { count: 'exact' });

      // Fetch by gender
      const { count: totalHommes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact' })
        .eq('sexe', 'M');

      const { count: totalFemmes } = await supabase
        .from('adherents')
        .select('*', { count: 'exact' })
        .eq('sexe', 'F');

      // Fetch total groups
      const { count: totalGroupes } = await supabase
        .from('groupes')
        .select('*', { count: 'exact' });

      // Fetch adherents by quartier
      const { data: quartierData } = await supabase
        .from('adherents')
        .select('quartier')
        .not('quartier', 'is', null);

      const quartierCounts: { [key: string]: number } = {};
      quartierData?.forEach((item: any) => {
        if (item.quartier) {
          quartierCounts[item.quartier] = (quartierCounts[item.quartier] || 0) + 1;
        }
      });

      const adherentsParQuartier = Object.entries(quartierCounts)
        .map(([quartier, count]) => ({ quartier, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Fetch adherents by age groups
      const { data: ageData } = await supabase
        .from('adherents')
        .select('date_naissance');

      const ageGroups = {
        '0-17': 0,
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0
      };

      ageData?.forEach((item: any) => {
        if (item.date_naissance) {
          const age = new Date().getFullYear() - new Date(item.date_naissance).getFullYear();
          if (age < 18) ageGroups['0-17']++;
          else if (age <= 25) ageGroups['18-25']++;
          else if (age <= 35) ageGroups['26-35']++;
          else if (age <= 50) ageGroups['36-50']++;
          else if (age <= 65) ageGroups['51-65']++;
          else ageGroups['65+']++;
        }
      });

      const adherentsParAge = Object.entries(ageGroups)
        .map(([range, count]) => ({ range, count }));

      setStats({
        totalAdherents: totalAdherents || 0,
        totalHommes: totalHommes || 0,
        totalFemmes: totalFemmes || 0,
        totalGroupes: totalGroupes || 0,
        adherentsParQuartier,
        adherentsParGroupe: [],
        adherentsParAge
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const genderData = [
    { name: 'Hommes', value: stats.totalHommes, color: '#3b82f6' },
    { name: 'Femmes', value: stats.totalFemmes, color: '#ec4899' }
  ];

  const handleExport = () => {
    // Placeholder for export functionality
    alert("Fonctionnalité d'export à venir");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <Button onClick={handleExport} className="bg-gradient-primary">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adhérents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdherents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hommes</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHommes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAdherents > 0 ? 
                `${((stats.totalHommes / stats.totalAdherents) * 100).toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Femmes</CardTitle>
            <UserCheck className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFemmes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAdherents > 0 ? 
                `${((stats.totalFemmes / stats.totalAdherents) * 100).toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroupes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par sexe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par âge</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.adherentsParAge}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quartier Distribution */}
        {stats.adherentsParQuartier.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top 5 Quartiers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.adherentsParQuartier}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quartier" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}