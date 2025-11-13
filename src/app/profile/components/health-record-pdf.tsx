
'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { User, FamilyProfile, Medication, Appointment, Vaccine, EmergencyContact } from '@/types';

interface HealthRecordPDFProps {
    user: User;
    profile: FamilyProfile;
    medications: Medication[];
    appointments: Appointment[];
    vaccines: Vaccine[];
    emergencyContacts: EmergencyContact[];
}

export function HealthRecordPDF({ user, profile, medications, appointments, vaccines, emergencyContacts }: HealthRecordPDFProps) {

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '24px', color: '#14532d' }}>
      {children}
    </h2>
  );

  const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
      <div style={{ marginTop: '8px' }}>
        <p style={{ fontSize: '12px', color: '#555' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{value}</p>
      </div>
    );
  };
  
  const isSelfProfile = user.id === profile.id;

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', padding: '40px' }}>
      <header style={{ textAlign: 'center', borderBottom: '2px solid #16a34a', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>SanteConnect</h1>
        <p style={{ fontSize: '16px', margin: '4px 0 0' }}>Dossier de Santé Personnel</p>
      </header>

      <main>
        <SectionTitle>Informations du Patient</SectionTitle>
        <InfoRow label="Nom Complet" value={isSelfProfile ? `${user.firstName} ${user.lastName}` : profile.name} />
        {isSelfProfile && <InfoRow label="Email" value={user.email} />}
        {isSelfProfile && <InfoRow label="Téléphone" value={user.phone} />}
        {!isSelfProfile && <InfoRow label="Relation" value={profile.relationship} />}
        <InfoRow label="Groupe Sanguin" value={user.bloodType} />
        <InfoRow label="Allergies connues" value={user.allergies} />
        <InfoRow label="Conditions médicales" value={user.medicalConditions} />

        <SectionTitle>Traitements en cours</SectionTitle>
        {medications.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '8px', fontSize: '12px' }}>Médicament</th>
                <th style={{ padding: '8px', fontSize: '12px' }}>Dosage</th>
                <th style={{ padding: '8px', fontSize: '12px' }}>Heures de prise</th>
              </tr>
            </thead>
            <tbody>
              {medications.map(med => (
                <tr key={med.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{med.name}</td>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{med.dosage}</td>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{med.intakeTimes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ fontSize: '14px', color: '#777', marginTop: '12px' }}>Aucun traitement enregistré.</p>}
        
        <SectionTitle>Carnet de Vaccination</SectionTitle>
        {vaccines.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '8px', fontSize: '12px' }}>Vaccin</th>
                <th style={{ padding: '8px', fontSize: '12px' }}>Date d'injection</th>
                <th style={{ padding: '8px', fontSize: '12px' }}>Prochain rappel</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map(vac => (
                <tr key={vac.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{vac.name}</td>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{format(new Date(vac.date), 'dd/MM/yyyy', { locale: fr })}</td>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{vac.nextBooster ? format(new Date(vac.nextBooster), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ fontSize: '14px', color: '#777', marginTop: '12px' }}>Aucun vaccin enregistré.</p>}


        <SectionTitle>Historique des rendez-vous</SectionTitle>
        {appointments.length > 0 ? (
          appointments.map(apt => (
            <div key={apt.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', marginTop: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {format(new Date(apt.dateTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
              <InfoRow label="Motif" value={apt.reason} />
            </div>
          ))
        ) : <p style={{ fontSize: '14px', color: '#777', marginTop: '12px' }}>Aucun rendez-vous enregistré.</p>}
        
        <SectionTitle>Contacts d'Urgence</SectionTitle>
         {emergencyContacts.length > 0 ? (
          emergencyContacts.map(contact => (
            <div key={contact.id} style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{contact.name}</p>
              <p style={{ fontSize: '14px', color: '#555' }}>{contact.phone}</p>
            </div>
          ))
        ) : <p style={{ fontSize: '14px', color: '#777', marginTop: '12px' }}>Aucun contact d'urgence.</p>}

      </main>
       <footer style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '10px', color: '#999', textAlign: 'center' }}>
          Dossier généré par SanteConnect le {format(new Date(), 'dd/MM/yyyy à HH:mm')}
      </footer>
    </div>
  );
}
