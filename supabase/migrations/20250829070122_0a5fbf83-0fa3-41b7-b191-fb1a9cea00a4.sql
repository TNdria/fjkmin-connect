-- Update profiles table to include more user information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nom VARCHAR(255),
ADD COLUMN IF NOT EXISTS prenom VARCHAR(255),
ADD COLUMN IF NOT EXISTS sexe VARCHAR(1) CHECK (sexe IN ('M', 'F')),
ADD COLUMN IF NOT EXISTS date_naissance DATE,
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS quartier VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS fonction_eglise VARCHAR(255);

-- Update the trigger function to include more data during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    role,
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
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'UTILISATEUR'),
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom',
    NEW.raw_user_meta_data->>'sexe',
    (NEW.raw_user_meta_data->>'date_naissance')::date,
    NEW.raw_user_meta_data->>'adresse',
    NEW.raw_user_meta_data->>'quartier',
    NEW.raw_user_meta_data->>'telephone',
    NEW.email,
    NEW.raw_user_meta_data->>'fonction_eglise'
  );
  RETURN NEW;
END;
$$;