-- Supprimer les anciennes contraintes si elles existent
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_adherent_id_fkey;
ALTER TABLE IF EXISTS public.adherents_groupes DROP CONSTRAINT IF EXISTS adherents_groupes_adherent_id_fkey;
ALTER TABLE IF EXISTS public.adherents_groupes DROP CONSTRAINT IF EXISTS adherents_groupes_groupe_id_fkey;

-- Créer la table Adherents avec la nouvelle structure
DROP TABLE IF EXISTS public.adherents CASCADE;
CREATE TABLE public.adherents (
  id_adherent UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Créer la table Groupes
DROP TABLE IF EXISTS public.groupes CASCADE;
CREATE TABLE public.groupes (
  id_groupe UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_groupe VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table de jonction Adherents_Groupes
DROP TABLE IF EXISTS public.adherents_groupes CASCADE;
CREATE TABLE public.adherents_groupes (
  id_adherent UUID NOT NULL,
  id_groupe UUID NOT NULL,
  date_adhesion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id_adherent, id_groupe),
  FOREIGN KEY (id_adherent) REFERENCES public.adherents(id_adherent) ON DELETE CASCADE,
  FOREIGN KEY (id_groupe) REFERENCES public.groupes(id_groupe) ON DELETE CASCADE
);

-- Créer la table Utilisateurs
DROP TABLE IF EXISTS public.utilisateurs CASCADE;
CREATE TABLE public.utilisateurs (
  id_utilisateur UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'UTILISATEUR' CHECK (role IN ('ADMIN', 'RESPONSABLE', 'UTILISATEUR')),
  id_adherent UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (id_adherent) REFERENCES public.adherents(id_adherent) ON DELETE SET NULL
);

-- Migrer les données de profiles vers utilisateurs
INSERT INTO public.utilisateurs (auth_id, username, role, id_adherent, created_at, updated_at)
SELECT 
  id,
  username,
  role,
  adherent_id,
  created_at,
  updated_at
FROM public.profiles
WHERE EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id);

-- Supprimer l'ancienne table profiles
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Activer RLS sur toutes les tables
ALTER TABLE public.adherents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherents_groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour Adherents
CREATE POLICY "Les admins peuvent tout faire sur les adhérents" 
ON public.adherents FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role = 'ADMIN'
));

CREATE POLICY "Les responsables peuvent tout faire sur les adhérents" 
ON public.adherents FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role IN ('RESPONSABLE', 'ADMIN')
));

CREATE POLICY "Les utilisateurs peuvent voir les adhérents" 
ON public.adherents FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid()
));

-- Créer les politiques RLS pour Groupes
CREATE POLICY "Les admins peuvent tout faire sur les groupes" 
ON public.groupes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role = 'ADMIN'
));

CREATE POLICY "Les responsables peuvent tout faire sur les groupes" 
ON public.groupes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role IN ('RESPONSABLE', 'ADMIN')
));

CREATE POLICY "Tous les utilisateurs connectés peuvent voir les groupes" 
ON public.groupes FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Créer les politiques RLS pour Adherents_Groupes
CREATE POLICY "Les admins peuvent gérer les associations" 
ON public.adherents_groupes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role = 'ADMIN'
));

CREATE POLICY "Les responsables peuvent gérer les associations" 
ON public.adherents_groupes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs 
  WHERE utilisateurs.auth_id = auth.uid() 
  AND utilisateurs.role IN ('RESPONSABLE', 'ADMIN')
));

CREATE POLICY "Tous peuvent voir les associations" 
ON public.adherents_groupes FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Créer les politiques RLS pour Utilisateurs
CREATE POLICY "Les admins peuvent tout faire sur les utilisateurs" 
ON public.utilisateurs FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.utilisateurs u
  WHERE u.auth_id = auth.uid() 
  AND u.role = 'ADMIN'
));

CREATE POLICY "Les utilisateurs peuvent voir tous les utilisateurs" 
ON public.utilisateurs FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON public.utilisateurs FOR UPDATE 
USING (auth_id = auth.uid());

-- Créer les triggers pour updated_at
CREATE TRIGGER update_adherents_updated_at 
BEFORE UPDATE ON public.adherents 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groupes_updated_at 
BEFORE UPDATE ON public.groupes 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_utilisateurs_updated_at 
BEFORE UPDATE ON public.utilisateurs 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- Mettre à jour la fonction handle_new_user pour créer un utilisateur au lieu d'un profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_adherent_id UUID;
BEGIN
  -- Créer un adhérent si les informations sont fournies
  IF NEW.raw_user_meta_data->>'nom' IS NOT NULL AND NEW.raw_user_meta_data->>'prenom' IS NOT NULL THEN
    INSERT INTO public.adherents (
      nom,
      prenom,
      sexe,
      date_naissance,
      adresse,
      quartier,
      telephone,
      email,
      fonction_eglise
    )
    VALUES (
      NEW.raw_user_meta_data->>'nom',
      NEW.raw_user_meta_data->>'prenom',
      COALESCE(NEW.raw_user_meta_data->>'sexe', 'M'),
      (NEW.raw_user_meta_data->>'date_naissance')::date,
      NEW.raw_user_meta_data->>'adresse',
      NEW.raw_user_meta_data->>'quartier',
      NEW.raw_user_meta_data->>'telephone',
      NEW.email,
      NEW.raw_user_meta_data->>'fonction_eglise'
    )
    RETURNING id_adherent INTO v_adherent_id;
  END IF;

  -- Créer l'utilisateur
  INSERT INTO public.utilisateurs (
    auth_id,
    username,
    role,
    id_adherent
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'UTILISATEUR'),
    v_adherent_id
  );
  
  RETURN NEW;
END;
$$;

-- Recréer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();