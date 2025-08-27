import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function GroupeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_groupe: '',
    description: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchGroupe();
    }
  }, [id]);

  const fetchGroupe = async () => {
    try {
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          nom_groupe: data.nom_groupe || '',
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du groupe",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('groupes')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Groupe modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('groupes')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Groupe créé avec succès",
        });
      }
      
      navigate('/groupes');
    } catch (error) {
      console.error('Error saving groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le groupe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/groupes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Modifier le groupe' : 'Nouveau groupe'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du groupe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom_groupe">Nom du groupe *</Label>
              <Input
                id="nom_groupe"
                name="nom_groupe"
                value={formData.nom_groupe}
                onChange={(e) => setFormData({ ...formData, nom_groupe: e.target.value })}
                required
                placeholder="Ex: Chorale, Jeunesse, École du dimanche..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du groupe..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? 'Modifier' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/groupes')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}