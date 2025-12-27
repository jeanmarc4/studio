import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/components/layout/app-provider';

export const metadata: Metadata = {
  title: 'Santé Zen',
  description: 'Votre assistant santé personnel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="apple-touch-icon" href="https://firebasestorage.googleapis.com/v0/b/studio-9090208553-5057b.appspot.com/o/FCMImages%2Fsantezen_192x192.png?alt=media&token=ee6970e2-7bdd-48c8-9be9-0d6ad0e53496" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', 'h-full min-h-screen bg-background font-sans')}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
