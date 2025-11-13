import type { NavItem } from "@/types";
import { getImage } from "@/lib/placeholder-images";

// Ces données sont statiques et utilisées pour enrichir les données des médecins provenant de Firestore,
// car des champs comme rating, reviews, image etc. ne sont pas dans notre schéma de base de données.
export const staticDoctorImages = [
  {
    id: '1',
    rating: 4.9,
    reviews: 124,
    availability: ['Lundi', 'Mercredi', 'Vendredi'],
    image: getImage('doctor-1')?.imageUrl,
    imageHint: getImage('doctor-1')?.imageHint
  },
  {
    id: '2',
    rating: 4.8,
    reviews: 98,
    availability: ['Mardi', 'Jeudi'],
    image: getImage('doctor-2')?.imageUrl,
    imageHint: getImage('doctor-2')?.imageHint
  },
  {
    id: '3',
    rating: 5.0,
    reviews: 210,
    availability: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    image: getImage('doctor-3')?.imageUrl,
    imageHint: getImage('doctor-3')?.imageHint
  },
  {
    id: '4',
    rating: 4.7,
    reviews: 76,
    availability: ['Mercredi', 'Vendredi'],
    image: getImage('doctor-4')?.imageUrl,
    imageHint: getImage('doctor-4')?.imageHint
  },
];


export const wellnessArticles = [
  {
    id: '1',
    title: "L'art de la pleine conscience dans un monde occupé",
    category: 'Bien-être Mental',
    author: 'Jane Doe',
    date: '2024-05-15',
    readTime: '7 min de lecture',
    image: getImage('wellness-1')?.imageUrl,
    imageHint: getImage('wellness-1')?.imageHint,
    excerpt: "Apprenez à pratiquer la pleine conscience et à réduire le stress même les jours les plus chargés. Des techniques simples pour un esprit plus calme."
  },
  {
    id: '2',
    title: "Superaliments : que manger pour être en meilleure santé",
    category: 'Nutrition',
    author: 'John Smith',
    date: '2024-05-12',
    readTime: '10 min de lecture',
    image: getImage('wellness-2')?.imageUrl,
    imageHint: getImage('wellness-2')?.imageHint,
    excerpt: "Une analyse approfondie des aliments les plus riches en nutriments qui peuvent renforcer votre système immunitaire et votre santé globale."
  },
  {
    id: '3',
    title: "Guide du débutant pour le yoga pour la flexibilité",
    category: 'Fitness',
    author: 'Priya Patel',
    date: '2024-05-10',
    readTime: '12 min de lecture',
    image: getImage('wellness-3')?.imageUrl,
    imageHint: getImage('wellness-3')?.imageHint,
    excerpt: "Commencez votre voyage de yoga avec ces poses fondamentales conçues pour améliorer la flexibilité et la force."
  },
  {
    id: '4'
  }
];

export const mainNav: NavItem[] = [
  {
    title: "Mes Médecins",
    href: "/my-health",
  },
    {
    title: "Profil",
    href: "/profile",
  },
  {
    title: "Ordonnances",
    href: "/prescriptions",
  },
  {
    title: "Médicaments",
    href: "/medications",
  },
  {
    title: "Soins Holistiques",
    href: "/wellness",
  },
];

export type WellnessArticle = typeof wellnessArticles[0];
