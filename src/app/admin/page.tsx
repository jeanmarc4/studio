'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { UsersTable } from "./users-table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userData, isLoading: isUserDataLoading } = useDoc<User>(userDocRef);

    const isAdmin = userData?.role === 'admin';
    const isLoading = isUserLoading || isUserDataLoading;

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isLoading, isAdmin, router]);

    if (isLoading || !isAdmin) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Administration
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Gérez les utilisateurs, les abonnements et les accès aux fonctionnalités.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>
            Modifiez les plans d'abonnement et les accès aux suivis de pathologies pour les utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
