import type { NavItem } from "@/types";
import { getImage } from "@/lib/placeholder-images";

export const doctors = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiologist',
    location: 'Springfield, IL',
    availability: ['Monday', 'Wednesday', 'Friday'],
    rating: 4.9,
    reviews: 124,
    image: getImage('doctor-1')?.imageUrl,
    imageHint: getImage('doctor-1')?.imageHint
  },
  {
    id: '2',
    name: 'Dr. Marcus Thorne',
    specialty: 'Neurologist',
    location: 'Metropolis, NY',
    availability: ['Tuesday', 'Thursday'],
    rating: 4.8,
    reviews: 98,
    image: getImage('doctor-2')?.imageUrl,
    imageHint: getImage('doctor-2')?.imageHint
  },
  {
    id: '3',
    name: 'Dr. Lena Petrova',
    specialty: 'Pediatrician',
    location: 'Gotham, NJ',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    rating: 5.0,
    reviews: 210,
    image: getImage('doctor-3')?.imageUrl,
    imageHint: getImage('doctor-3')?.imageHint
  },
  {
    id: '4',
    name: 'Dr. Samuel Chen',
    specialty: 'Dermatologist',
    location: 'Star City, CA',
    availability: ['Wednesday', 'Friday'],
    rating: 4.7,
    reviews: 76,
    image: getImage('doctor-4')?.imageUrl,
    imageHint: getImage('doctor-4')?.imageHint
  },
];

export const wellnessArticles = [
  {
    id: '1',
    title: 'The Art of Mindfulness in a Busy World',
    category: 'Mental Wellness',
    author: 'Jane Doe',
    date: '2024-05-15',
    readTime: '7 min read',
    image: getImage('wellness-1')?.imageUrl,
    imageHint: getImage('wellness-1')?.imageHint,
    excerpt: 'Learn how to practice mindfulness and reduce stress even on your busiest days. Simple techniques for a calmer mind.'
  },
  {
    id: '2',
    title: 'Superfoods: What to Eat for a Healthier You',
    category: 'Nutrition',
    author: 'John Smith',
    date: '2024-05-12',
    readTime: '10 min read',
    image: getImage('wellness-2')?.imageUrl,
    imageHint: getImage('wellness-2')?.imageHint,
    excerpt: 'A deep dive into the most nutrient-dense foods that can boost your immune system and overall health.'
  },
  {
    id: '3',
    title: 'Beginner\'s Guide to Yoga for Flexibility',
    category: 'Fitness',
    author: 'Priya Patel',
    date: '2024-05-10',
    readTime: '12 min read',
    image: getImage('wellness-3')?.imageUrl,
    imageHint: getImage('wellness-3')?.imageHint,
    excerpt: 'Start your yoga journey with these fundamental poses designed to improve flexibility and strength.'
  },
  {
    id: '4',
    title: 'The Science of Sleep: How to Get a Good Night\'s Rest',
    category: 'Holistic Health',
    author: 'Dr. Alan Grant',
    date: '2024-05-08',
    readTime: '8 min read',
    image: getImage('wellness-4')?.imageUrl,
    imageHint: getImage('wellness-4')?.imageHint,
    excerpt: 'Understand the importance of sleep hygiene and discover tips for falling asleep faster and staying asleep longer.'
  },
];

export const mainNav: NavItem[] = [
  {
    title: "Directory",
    href: "/directory",
  },
  {
    title: "Symptom Checker",
    href: "/symptom-checker",
  },
  {
    title: "Wellness",
    href: "/wellness",
  },
];

export const adminUsers = [
    {
        id: '1',
        name: 'Admin 1',
        email: 'admin1@santeconnect.com',
        role: 'Super Admin',
        status: 'Active',
        lastLogin: '2024-05-21 10:00 AM'
    },
    {
        id: '2',
        name: 'Dr. Evelyn Reed',
        email: 'e.reed@santeconnect.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-05-20 03:45 PM'
    },
    {
        id: '3',
        name: 'Support Staff',
        email: 'support@santeconnect.com',
        role: 'Moderator',
        status: 'Inactive',
        lastLogin: '2024-05-18 11:20 AM'
    },
];

export type Doctor = typeof doctors[0];
export type WellnessArticle = typeof wellnessArticles[0];
export type AdminUser = typeof adminUsers[0];
