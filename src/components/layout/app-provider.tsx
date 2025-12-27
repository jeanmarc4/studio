'use client';

import { type ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Toaster } from '@/components/ui/toaster';


export function AppProvider({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <FirebaseClientProvider>
            <AuthLayout>{children}</AuthLayout>
            <Toaster />
        </FirebaseClientProvider>
    </ThemeProvider>
  );
}
