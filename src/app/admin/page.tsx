"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";
import { RoleConfiguration } from "./components/role-configuration";
import { Dashboard } from "./components/dashboard";
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from '@/docs/backend-documentation';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { AddUserDialog } from "./components/add-user-dialog";

export default function AdminPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Check for admin role
  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    const isAuthenticating = isUserLoading || isAdminRoleLoading;
    if (!isAuthenticating) {
      if (!user) {
        router.push('/auth/login');
      } else if (!adminRole) {
        // Not an admin, redirect
        console.log("Accès non autorisé, redirection...");
        router.push('/'); 
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isUserLoading, adminRole, isAdminRoleLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    deleteDocumentNonBlocking(userDocRef);
    
    // Also delete admin role if it exists
    const adminRoleDocRef = doc(firestore, 'roles_admin', userId);
    deleteDocumentNonBlocking(adminRoleDocRef);
  };
  
  const handleUpdateUserRole = (userId: string, role: "Admin" | "Standard" | "Premium") => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userDocRef, { role });

    const adminRoleDocRef = doc(firestore, 'roles_admin', userId);
    if (role === "Admin") {
      // Add to admin roles collection
      setDoc(adminRoleDocRef, { userId, role: 'admin' });
    } else {
      // Remove from admin roles collection
      deleteDoc(adminRoleDocRef);
    }
  };

  const isLoading = isUserLoading || isAdminRoleLoading;

  if (isLoading || !isAuthorized) {
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
    <>
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
                  onUpdateUserRole={handleUpdateUserRole}
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
    </>
  );
}
