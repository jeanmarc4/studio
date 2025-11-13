
export interface User {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "User";
    type: "object";
    description: "Represents a user of the SanteConnect application.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the user entity.";
        };
        firstName: {
            type: "string";
            description: "The first name of the user.";
        };
        lastName: {
            type: "string";
            description: "The last name of the user.";
        };
        email: {
            type: "string";
            description: "The email address of the user.";
            format: "email";
        };
        phone: {
            type: "string";
            description: "The phone number of the user.";
        };
        role: {
            type: "string";
            description: "The role or plan of the user.";
            enum: ["Gratuit", "Standard", "Premium", "Admin"];
        };
    };
    required: ["id", "firstName", "lastName", "email", "role"];
}
export interface Admin {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Admin";
    type: "object";
    description: "Represents an administrator user of the SanteConnect application.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the admin entity.";
        };
        userId: {
            type: "string";
            description: "Reference to User. (Relationship: User 1:1 Admin)";
        };
        role: {
            type: "string";
            description: "The role of the administrator (e.g., superadmin, editor).";
        };
        permissions: {
            type: "array";
            description: "List of permisions for the admin user.";
            items: {
                type: "string";
            };
        };
    };
    required: ["id", "userId", "role"];
}
export interface MedicalProfessional {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "MedicalProfessional";
    type: "object";
    description: "Represents a doctor, pharmacy, or other healthcare provider.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the medical professional entity.";
        };
        name: {
            type: "string";
            description: "The name of the medical professional or institution.";
        };
        type: {
            type: "string";
            description: "The type of medical professional (e.g., doctor, pharmacy).";
        };
        specialty: {
            type: "string";
            description: "The medical specialty of the professional (e.g., cardiology, pediatrics).";
        };
        address: {
            type: "string";
            description: "The address of the medical professional.";
        };
        phone: {
            type: "string";
            description: "The phone number of the medical professional.";
        };
        location: {
            type: "string";
            description: "The GPS coordinates for the medical professional.";
        };
    };
    required: ["id", "name", "type"];
}
export interface Appointment {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Appointment";
    type: "object";
    description: "Represents a scheduled appointment between a user and a medical professional.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the appointment entity.";
        };
        userId: {
            type: "string";
            description: "Reference to User. (Relationship: User 1:N Appointment)";
        };
        medicalProfessionalId: {
            type: "string";
            description: "Reference to MedicalProfessional. (Relationship: MedicalProfessional 1:N Appointment)";
        };
        dateTime: {
            type: "string";
            description: "The date and time of the appointment.";
            format: "date-time";
        };
        reason: {
            type: "string";
            description: "The reason for the appointment.";
        };
        status: {
            type: "string";
            description: "The status of the appointment (e.g., scheduled, completed, canceled, archived).";
        };
    };
    required: ["id", "userId", "medicalProfessionalId", "dateTime", "status"];
}
export interface HolisticContent {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "HolisticContent";
    type: "object";
    description: "Represents holistic wellness content.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the holistic content entity.";
        };
        title: {
            type: "string";
            description: "The title of the holistic content.";
        };
        type: {
            type: "string";
            description: "The type of holistic content (e.g., article, video).";
        };
        url: {
            type: "string";
            description: "The URL of the holistic content.";
            format: "uri";
        };
        description: {
            type: "string";
            description: "Description of the content";
        };
    };
    required: ["id", "title", "type", "url", "description"];
}
export interface EmergencyContact {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "EmergencyContact";
    type: "object";
    description: "Represents an emergency contact for a user.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the emergency contact entity.";
        };
        userId: {
            type: "string";
            description: "Reference to User. (Relationship: User 1:N EmergencyContact)";
        };
        name: {
            type: "string";
            description: "The name of the emergency contact.";
        };
        phone: {
            type: "string";
            description: "The phone number of the emergency contact.";
        };
    };
    required: ["id", "userId", "name", "phone"];
}
export interface Medication {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Medication";
    type: "object";
    description: "Represents a medication for a user's schedule.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the medication entity.";
        };
        userId: {
            type: "string";
            description: "Reference to User. (Relationship: User 1:N Medication)";
        };
        name: {
            type: "string";
            description: "The name of the medication.";
        };
        dosage: {
            type: "string";
            description: "The dosage of the medication (e.g., '1 comprimé', '10mg').";
        };
        intakeTimes: {
            type: "array";
            description: "List of times to take the medication (e.g., ['08:00', '20:00']).";
            items: {
                type: "string";
                format: "time";
            };
        };
        quantity: {
            type: "number";
            description: "Total quantity of the medication remaining.";
        };
    };
    required: ["id", "userId", "name", "dosage", "intakeTimes"];
}
export interface ExtractedMedication {
    title: "ExtractedMedication";
    type: "object";
    description: "Represents a medication extracted from a prescription by the AI.";
    properties: {
        name: {
            type: "string";
            description: "The name of the medication.";
        };
        dosage: {
            type: "string";
            description: "The dosage of the medication (e.g., '1 comprimé', '500mg').";
        };
        quantity: {
            type: "number";
            description: "Total quantity prescribed.";
        };
        intakeTimes: {
            type: "array";
            description: "List of times to take the medication (e.g., ['matin', 'soir']). This is often textual.";
            items: {
                type: "string";
            };
        };
    };
    required: ["name", "dosage"];
}
export interface Prescription {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Prescription";
    type: "object";
    description: "Represents a medical prescription uploaded by a user.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the prescription entity.";
        };
        userId: {
            type: "string";
            description: "Reference to User. (Relationship: User 1:N Prescription)";
        };
        doctorName: {
            type: "string";
            description: "The name of the doctor who issued the prescription.";
        };
        issueDate: {
            type: "string";
            description: "The date the prescription was issued.";
            format: "date-time";
        };
        imageUrl: {
            type: "string";
            description: "URL of the uploaded prescription image.";
            format: "uri";
        };
        status: {
            type: "string";
            description: "The processing status of the prescription.";
            enum: ["new", "processing", "processed", "error", "archived"];
        };
        extractedMedications: {
            type: "array";
            description: "List of medications extracted from the prescription by the AI.";
            items: {
                $ref: "#/backend/entities/ExtractedMedication";
            };
        };
    };
    required: ["id", "userId", "doctorName", "issueDate", "imageUrl", "status"];
}
export interface ForumThread {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Forum Thread";
    type: "object";
    description: "Represents a discussion thread in the wellness forum.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the forum thread.";
        };
        title: {
            type: "string";
            description: "The title of the thread.";
        };
        content: {
            type: "string";
            description: "The initial content of the thread.";
        };
        authorId: {
            type: "string";
            description: "The ID of the user who created the thread.";
        };
        authorName: {
            type: "string";
            description: "The name of the user who created the thread.";
        };
        createdAt: {
            type: "string";
            format: "date-time";
            description: "The timestamp when the thread was created.";
        };
        category: {
            type: "string";
            description: "The wellness category of the thread (e.g., 'Nutrition', 'Fitness').";
        };
    };
    required: ["id", "title", "content", "authorId", "authorName", "createdAt", "category"];
}
export interface ForumPost {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "Forum Post";
    type: "object";
    description: "Represents a single post or reply within a forum thread.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the forum post.";
        };
        threadId: {
            type: "string";
            description: "The ID of the thread this post belongs to.";
        };
        content: {
            type: "string";
            description: "The content of the post.";
        };
        authorId: {
            type: "string";
            description: "The ID of the user who created the post.";
        };
        authorName: {
            type: "string";
            description: "The name of the user who created the post.";
        };
        createdAt: {
            type: "string";
            format: "date-time";
            description: "The timestamp when the post was created.";
        };
    };
    required: ["id", "threadId", "content", "authorId", "authorName", "createdAt"];
}
export interface SOSAlert {
    "$schema": "http://json-schema.org/draft-07/schema#";
    title: "SOSAlert";
    type: "object";
    description: "Represents an SOS alert triggered by a user.";
    properties: {
        id: {
            type: "string";
            description: "Unique identifier for the SOS alert.";
        };
        userId: {
            type: "string";
            description: "The ID of the user who triggered the alert.";
        };
        createdAt: {
            type: "string";
            format: "date-time";
            description: "The timestamp when the alert was triggered.";
        };
        contactsNotified: {
            type: "array";
            description: "A snapshot of the emergency contacts who were notified.";
            items: {
                type: "object";
                properties: {
                    name: {
                        type: "string";
                    };
                    phone: {
                        type: "string";
                    };
                };
            };
        };
    };
    required: ["id", "userId", "createdAt", "contactsNotified"];
}
export interface Backend {
    entities: {
        User: User;
        Admin: Admin;
        MedicalProfessional: MedicalProfessional;
        Appointment: Appointment;
        HolisticContent: HolisticContent;
        EmergencyContact: EmergencyContact;
        Medication: Medication;
        ExtractedMedication: ExtractedMedication;
        Prescription: Prescription;
        ForumThread: ForumThread;
        ForumPost: ForumPost;
        Vaccine: Vaccine;
        SOSAlert: SOSAlert;
    };
    auth: Auth;
    firestore: Firestore;
}
