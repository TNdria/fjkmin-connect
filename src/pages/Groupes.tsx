import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Groupe } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Groupes() {
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { utilisateur } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroupes();
  }, []);

  const fetchGroupes = async () => {
    try {
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .order('nom_groupe', { ascending: true });

      if (error) throw error;
      setGroupes((data || []) as Groupe[]);
    } catch (error) {
      console.error('Error fetching groupes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce groupe?")) return;

    try {
      const { error } = await supabase
        .from('groupes')
        .delete()
        .eq('id_groupe', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Groupe supprimé avec succès",
      });
      
      fetchGroupes();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le groupe",
        variant: "destructive",
      });
    }
  };

  const filteredGroupes = groupes.filter(groupe =>
    groupe.nom_groupe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = utilisateur?.role === 'ADMIN';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Groupes</h1>
        {canEdit && (
          <Button asChild className="bg-gradient-primary">
            <Link to="/groupes/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau groupe
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des groupes</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du groupe</TableHead>
                <TableHead>Description</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroupes.map((groupe) => (
                <TableRow key={groupe.id_groupe}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {groupe.nom_groupe}
                    </div>
                  </TableCell>
                  <TableCell>{groupe.description || '-'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/groupes/${groupe.id_groupe}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(groupe.id_groupe)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}