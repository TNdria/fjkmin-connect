-- Création des tables pour la gestion des adhérents FJKM

-- Table des adhérents
CREATE TABLE public.adherents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  sexe VARCHAR(1) CHECK (sexe IN ('M', 'F')) NOT NULL,
  date_naissance DATE,
  adresse VARCHAR(255),
  quartier VARCHAR(100),
  telephone VARCHAR(20),
  email VARCHAR(100),
  fonction_eglise VARCHAR(100),
  date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des groupes paroissiaux
CREATE TABLE public.groupes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_groupe VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison adhérents-groupes (relation n-n)
CREATE TABLE public.adherents_groupes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adherent_id UUID NOT NULL REFERENCES public.adherents(id) ON DELETE CASCADE,
  groupe_id UUID NOT NULL REFERENCES public.groupes(id) ON DELETE CASCADE,
  date_adhesion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(adherent_id, groupe_id)
);

-- Table des profils utilisateurs (liée à auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('ADMIN', 'RESPONSABLE', 'UTILISATEUR')) DEFAULT 'UTILISATEUR',
  adherent_id UUID REFERENCES public.adherents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances
CREATE INDEX idx_adherents_nom ON public.adherents(nom);
CREATE INDEX idx_adherents_prenom ON public.adherents(prenom);
CREATE INDEX idx_adherents_quartier ON public.adherents(quartier);
CREATE INDEX idx_adherents_groupe ON public.adherents_groupes(adherent_id, groupe_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_adherents_updated_at
  BEFORE UPDATE ON public.adherents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groupes_updated_at
  BEFORE UPDATE ON public.groupes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE public.adherents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherents_groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour les adhérents
CREATE POLICY "Les admins peuvent tout faire sur les adhérents"
  ON public.adherents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Les responsables peuvent voir et modifier les adhérents"
  ON public.adherents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('RESPONSABLE', 'ADMIN')
    )
  );

CREATE POLICY "Les utilisateurs peuvent voir les adhérents"
  ON public.adherents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Policies pour les groupes
CREATE POLICY "Les admins peuvent tout faire sur les groupes"
  ON public.groupes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Tous les utilisateurs connectés peuvent voir les groupes"
  ON public.groupes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policies pour adherents_groupes
CREATE POLICY "Les admins peuvent gérer les associations"
  ON public.adherents_groupes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Les responsables peuvent gérer les associations"
  ON public.adherents_groupes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('RESPONSABLE', 'ADMIN')
    )
  );

CREATE POLICY "Tous peuvent voir les associations"
  ON public.adherents_groupes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policies pour les profiles
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout faire sur les profils"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'ADMIN'
    )
  );

-- Fonction pour créer automatiquement un profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    'UTILISATEUR'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insertion de données de test
INSERT INTO public.groupes (nom_groupe, description) VALUES
  ('Chorale', 'Groupe de chant et louange'),
  ('Jeunesse', 'Groupe des jeunes de l''église'),
  ('École du Dimanche', 'Enseignement pour les enfants'),
  ('Diacres', 'Groupe des diacres'),
  ('Femmes', 'Association des femmes'),
  ('Hommes', 'Association des hommes');