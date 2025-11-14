import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { GlobalReminderProvider } from '@/components/reminders/global-reminder-provider';
import { Footer } from '@/components/layout/footer';
import { PwaInstaller } from '@/components/pwa-installer';

const fontHeadline = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '700'],
});


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
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-body antialiased",
          fontHeadline.variable,
          fontBody.variable
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
