export interface Adherent {
  id_adherent: string;
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
  id_groupe: string;
  nom_groupe: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdherentGroupe {
  id_adherent: string;
  id_groupe: string;
  date_adhesion: string;
  created_at: string;
}

export interface Utilisateur {
  id_utilisateur: string;
  auth_id: string | null;
  username: string;
  role: 'ADMIN' | 'RESPONSABLE' | 'UTILISATEUR';
  id_adherent: string | null;
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