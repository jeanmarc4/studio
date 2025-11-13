"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";
import { RoleConfiguration } from "./components/role-configuration";
import { Dashboard } from "./components/dashboard";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from '@/docs/backend-documentation';
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";

export default function AdminPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
    // We will check for admin role later
  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    // Note: This only deletes the Firestore document, not the Firebase Auth user.
    // A more complete solution would use a Cloud Function to delete the auth user as well.
    const userDocRef = doc(firestore, 'users', userId);
    deleteDocumentNonBlocking(userDocRef);
  };
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="flex items-center mb-8">
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="w-full h-[400px]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="dashboard">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
                <TabsTrigger value="roles">Configuration des rôles</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="dashboard">
              <Dashboard users={users} areUsersLoading={areUsersLoading} />
            </TabsContent>
            <TabsContent value="users">
              <UserManagement 
                users={users || []} 
                onDeleteUser={handleDeleteUser}
                isLoading={areUsersLoading}
              />
            </TabsContent>
            <TabsContent value="roles">
              <RoleConfiguration />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
