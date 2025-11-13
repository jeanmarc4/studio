import type { NavItem } from "@/types";
import { getImage } from "@/lib/placeholder-images";

export const doctors = [
  {
    id: '1',
    name: 'Dr. Évelyne Reed',
    specialty: 'Cardiologue',
    location: 'Springfield, IL',
    availability: ['Lundi', 'Mercredi', 'Vendredi'],
    rating: 4.9,
    reviews: 124,
    image: getImage('doctor-1')?.imageUrl,
    imageHint: getImage('doctor-1')?.imageHint
  },
  {
    id: '2',
    name: 'Dr. Marcus Thorne',
    specialty: 'Neurologue',
    location: 'Metropolis, NY',
    availability: ['Mardi', 'Jeudi'],
    rating: 4.8,
    reviews: 98,
    image: getImage('doctor-2')?.imageUrl,
    imageHint: getImage('doctor-2')?.imageHint
  },
  {
    id: '3',
    name: 'Dr. Lena Petrova',
    specialty: 'Pédiatre',
    location: 'Gotham, NJ',
    availability: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    rating: 5.0,
    reviews: 210,
    image: getImage('doctor-3')?.imageUrl,
    imageHint: getImage('doctor-3')?.imageHint
  },
  {
    id: '4',
    name: 'Dr. Samuel Chen',
    specialty: 'Dermatologue',
    location: 'Star City, CA',
    availability: ['Mercredi', 'Vendredi'],
    rating: 4.7,
    reviews: 76,
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
    id: '4',
    title: "La science du sommeil : comment passer une bonne nuit de repos",
    category: 'Santé Holistique',
    author: 'Dr. Alan Grant',
    date: '2024-05-08',
    readTime: '8 min de lecture',
    image: getImage('wellness-4')?.imageUrl,
    imageHint: getImage('wellness-4')?.imageHint,
    excerpt: "Comprenez l'importance de l'hygiène du sommeil et découvrez des conseils pour vous endormir plus rapidement et rester endormi plus longtemps."
  },
];

export const mainNav: NavItem[] = [
  {
    title: "Annuaire",
    href: "/directory",
  },
  {
    title: "Vérificateur de symptômes",
    href: "/symptom-checker",
  },
  {
    title: "Bien-être",
    href: "/wellness",
  },
];

export type Doctor = typeof doctors[0];
export type WellnessArticle = typeof wellnessArticles[0];
