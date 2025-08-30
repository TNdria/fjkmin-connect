import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Adherent } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Adherents() {
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { utilisateur } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAdherents();
  }, []);

  const fetchAdherents = async () => {
    try {
      const { data, error } = await supabase
        .from('adherents')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      setAdherents((data || []) as Adherent[]);
    } catch (error) {
      console.error('Error fetching adherents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet adhérent?")) return;

    try {
      const { error } = await supabase
        .from('adherents')
        .delete()
        .eq('id_adherent', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Adhérent supprimé avec succès",
      });
      
      fetchAdherents();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'adhérent",
        variant: "destructive",
      });
    }
  };

  const filteredAdherents = adherents.filter(adherent =>
    adherent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adherent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adherent.quartier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = utilisateur?.role === 'ADMIN' || utilisateur?.role === 'RESPONSABLE';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Adhérents</h1>
        {canEdit && (
          <Button asChild className="bg-gradient-primary">
            <Link to="/adherents/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel adhérent
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des adhérents</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom ou quartier..."
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
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Quartier</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Fonction</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdherents.map((adherent) => (
                <TableRow key={adherent.id_adherent}>
                  <TableCell className="font-medium">{adherent.nom}</TableCell>
                  <TableCell>{adherent.prenom}</TableCell>
                  <TableCell>{adherent.sexe}</TableCell>
                  <TableCell>{adherent.quartier || '-'}</TableCell>
                  <TableCell>{adherent.telephone || '-'}</TableCell>
                  <TableCell>{adherent.fonction_eglise || '-'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/adherents/${adherent.id_adherent}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(adherent.id_adherent)}
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