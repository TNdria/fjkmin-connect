-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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