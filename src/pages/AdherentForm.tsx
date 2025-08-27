import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function AdherentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    adresse: '',
    quartier: '',
    telephone: '',
    email: '',
    fonction_eglise: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchAdherent();
    }
  }, [id]);

  const fetchAdherent = async () => {
    try {
      const { data, error } = await supabase
        .from('adherents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          sexe: data.sexe || 'M',
          date_naissance: data.date_naissance || '',
          adresse: data.adresse || '',
          quartier: data.quartier || '',
          telephone: data.telephone || '',
          email: data.email || '',
          fonction_eglise: data.fonction_eglise || ''
        });
      }
    } catch (error) {
      console.error('Error fetching adherent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'adhérent",
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
          .from('adherents')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Adhérent modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('adherents')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Adhérent créé avec succès",
        });
      }
      
      navigate('/adherents');
    } catch (error) {
      console.error('Error saving adherent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'adhérent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/adherents')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Modifier l\'adhérent' : 'Nouvel adhérent'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'adhérent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe *</Label>
                <Select
                  value={formData.sexe}
                  onValueChange={(value) => setFormData({ ...formData, sexe: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_naissance">Date de naissance</Label>
                <Input
                  id="date_naissance"
                  name="date_naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input
                  id="quartier"
                  name="quartier"
                  value={formData.quartier}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fonction_eglise">Fonction dans l'église</Label>
                <Input
                  id="fonction_eglise"
                  name="fonction_eglise"
                  value={formData.fonction_eglise}
                  onChange={handleChange}
                  placeholder="Ex: Diacre, Choriste, etc."
                />
              </div>
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
                onClick={() => navigate('/adherents')}
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