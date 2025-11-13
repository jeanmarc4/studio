'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
            <AppLogo />
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SanteConnect. Tous droits réservés.
            </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
                Politique de Confidentialité
            </Link>
            <Link href="/legal" className="hover:text-primary transition-colors">
                Mentions Légales
            </Link>
            <a href="mailto:diojm93@gmail.com" className="hover:text-primary transition-colors">
                Contact
            </a>
            <a href="https://www.paypal.com/donate/?hosted_button_id=WTNC9Z978PCGS" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                Faire un don
            </a>
        </div>
      </div>
    </footer>
  );
}
