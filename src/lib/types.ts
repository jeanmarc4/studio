import { Timestamp } from 'firebase/firestore';

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
};

export type Medication = {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  times: string[];
  days: string[];
  voiceReminderMessage?: string;
  createdAt: Timestamp;
};

export type Appointment = {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  dateTime: Timestamp;
  reminder: string;
  voiceReminderMessage?: string;
};

export type Todo = {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    createdAt: Timestamp;
};

export type User = {
    id: string;
    email?: string | null;
    role?: 'admin' | 'patient';
    subscriptionPlan?: 'Gratuit' | 'Standard' | 'Premium';
    pathologies?: string[];
    fcmTokens?: string[];
    validated?: boolean;
}

export type MedicalFile = {
    id: string;
    userId: string;
    doctorId: string;
    doctorName: string;
    fileName: string;
    type: 'Ordonnance' | 'Compte-rendu';
    url: string; 
    filePath: string;
    createdAt: Timestamp;
}

export type BloodGlucoseLog = {
    id: string;
    userId: string;
    glucoseLevel: number;
    context: 'À jeun' | 'Avant repas' | 'Après repas' | 'Au coucher';
    measuredAt: Timestamp;
}

export type SymptomLog = {
    id: string;
    userId: string;
    pathology: 'MS' | 'Fibromyalgia'; 
    fatigueLevel: number; // 0-10
    notes: string;
    loggedAt: Timestamp;
}

export type BloodPressureLog = {
    id: string;
    userId: string;
    systolic: number;
    diastolic: number;
    pulse: number;
    measuredAt: Timestamp;
}

export type Pathology = {
    id: string;
    name: string;
    description: string;
    subscriptionRequired: boolean;
}

    