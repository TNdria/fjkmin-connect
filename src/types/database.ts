export interface Adherent {
  id: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  date_naissance: string | null;
  adresse: string | null;
  quartier: string | null;
  telephone: string | null;
  email: string | null;
  fonction_eglise: string | null;
  date_inscription: string;
  created_at: string;
  updated_at: string;
}

export interface Groupe {
  id: string;
  nom_groupe: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdherentGroupe {
  id: string;
  adherent_id: string;
  groupe_id: string;
  date_adhesion: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  role: 'ADMIN' | 'RESPONSABLE' | 'UTILISATEUR';
  nom?: string | null;
  prenom?: string | null;
  sexe?: 'M' | 'F' | null;
  date_naissance?: string | null;
  adresse?: string | null;
  quartier?: string | null;
  telephone?: string | null;
  email?: string | null;
  fonction_eglise?: string | null;
  adherent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  totalAdherents: number;
  totalHommes: number;
  totalFemmes: number;
  totalGroupes: number;
  adherentsParQuartier: { quartier: string; count: number }[];
  adherentsParGroupe: { nom_groupe: string; count: number }[];
}