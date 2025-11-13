
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Pill, Calendar, Heart, ArrowRight, Shield } from 'lucide-react';

const quickLinks = [
  {
    title: 'Gérer mes Ordonnances',
    href: '/prescriptions',
    icon: FileText,
  },
  {
    title: 'Voir tous mes Médicaments',
    href: '/medications',
    icon: Pill,
  },
  {
    title: 'Consulter mes Vaccins',
    href: '/vaccinations',
    icon: Shield,
  },
  {
    title: 'Explorer le Bien-être',
    href: '/wellness',
    icon: Heart,
  },
];

export function QuickAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès Rapide</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="outline"
            className="h-20 justify-start p-4 text-left"
          >
            <Link href={link.href}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-md">
                    <link.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="flex-1 font-semibold">{link.title}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
