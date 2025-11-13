import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { GlobalReminderProvider } from '@/components/reminders/global-reminder-provider';
import { Footer } from '@/components/layout/footer';
import { PwaInstaller } from '@/components/pwa-installer';

export const metadata: Metadata = {
  title: 'SanteConnect',
  description: 'Votre compagnon de santé moderne pour les rendez-vous, la vérification des symptômes et le bien-être.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SanteConnect',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-body antialiased"
        )}
      >
        <FirebaseClientProvider>
          <GlobalReminderProvider>
            <PwaInstaller />
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </GlobalReminderProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
