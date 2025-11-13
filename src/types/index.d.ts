import type { MedicalProfessional } from "@/docs/backend-documentation";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

// Ce type étend le schéma de base MedicalProfessional avec
// des données d'affichage qui ne sont pas stockées dans Firestore.
export type PopulatedMedicalProfessional = MedicalProfessional & {
  rating: number;
  reviews: number;
  availability: string[];
  image: string | undefined;
  imageHint: string | undefined;
};
