
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";
import { RoleConfiguration } from "./components/role-configuration";
import { Dashboard } from "./components/dashboard";
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import type { User, MedicalProfessional } from '@/docs/backend-documentation';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { AddUserDialog } from "./components/add-user-dialog";
import { ProfessionalManagement } from "./components/professional-management";
import { AddProfessionalDialog } from "./components/add-professional-dialog";

export default function AdminPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddProfessionalDialogOpen, setIsAddProfessionalDialogOpen] = useState(false);

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
        console.log("Accès non autorisé, redirection...");
        router.push('/'); 
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isUserLoading, adminRole, isAdminRoleLoading, router]);

  // Data fetching
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const professionalsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'medicalProfessionals') : null, [firestore]);

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);
  const { data: professionals, isLoading: areProfessionalsLoading } = useCollection<MedicalProfessional>(professionalsQuery);

  // User management handlers
  const handleAddUser = (newUser: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', newUser.id);
    setDocumentNonBlocking(userDocRef, newUser, {});
  };

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', userId));
    deleteDocumentNonBlocking(doc(firestore, 'roles_admin', userId));
  };
  
  const handleUpdateUserRole = (userId: string, role: "Admin" | "Standard" | "Premium") => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'users', userId), { role });
    const adminRoleDocRef = doc(firestore, 'roles_admin', userId);
    if (role === "Admin") {
      setDoc(adminRoleDocRef, { userId, role: 'admin' });
    } else {
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
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                  <TabsTrigger value="professionals">Professionnels</TabsTrigger>
                  <TabsTrigger value="roles">Rôles</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                   {activeTab === 'users' && (
                    <Button size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
                      Ajouter un utilisateur
                    </Button>
                  )}
                  {activeTab === 'professionals' && (
                    <Button size="sm" onClick={() => setIsAddProfessionalDialogOpen(true)}>
                      Ajouter un professionnel
                    </Button>
                  )}
                </div>
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
              <TabsContent value="professionals">
                 <ProfessionalManagement
                  professionals={professionals || []}
                  onDeleteProfessional={() => {}} // TODO: Implement
                  onUpdateProfessional={() => {}} // TODO: Implement
                  isLoading={areProfessionalsLoading}
                />
              </TabsContent>
              <TabsContent value="roles">
                <RoleConfiguration />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <AddUserDialog 
        isOpen={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdd={handleAddUser}
      />
      <AddProfessionalDialog
        isOpen={isAddProfessionalDialogOpen}
        onOpenChange={setIsAddProfessionalDialogOpen}
        onProfessionalAdd={() => {}} // TODO: Implement
      />
    </>
  );
}
