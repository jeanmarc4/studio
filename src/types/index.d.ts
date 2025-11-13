
import type { MedicalProfessional, Medication as MedicationSchema, Prescription as PrescriptionSchema, ForumThread as ForumThreadSchema, ForumPost as ForumPostSchema, User as UserSchema, Appointment as AppointmentSchema, Vaccine as VaccineSchema } from "@/docs/backend-documentation";
import type { ExtractedMedication as ExtractedMedicationSchema } from "@/ai/flows/extract-medications-flow";

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

export type User = UserSchema;

export type Medication = Omit<MedicationSchema, 'userId'> & { id: string };

export type Prescription = Omit<PrescriptionSchema, 'userId' | 'extractedMedications'> & { 
  id: string;
  extractedMedications?: ExtractedMedication[];
};

export type Appointment = Omit<AppointmentSchema, 'userId'> & { id: string };

export type ExtractedMedication = ExtractedMedicationSchema;

export type ForumThread = ForumThreadSchema & { id: string };

export type ForumPost = ForumPostSchema & { id: string };

export type Vaccine = Omit<VaccineSchema, 'userId'> & { id: string };

    