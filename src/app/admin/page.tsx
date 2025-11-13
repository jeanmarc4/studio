"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import { UserManagement } from "./components/user-management";
import { AddUserDialog } from "./components/add-user-dialog";
import { RoleConfiguration } from "./components/role-configuration";
import { Dashboard } from "./components/dashboard";
import { adminUsers } from "@/lib/data";
import type { AdminUser } from "@/lib/data";
import { useFirebase } from '@/firebase/provider';
import { Skeleton } from "@/components/ui/skeleton";

type NewUser = Omit<AdminUser, "id" | "status" | "lastLogin">;

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);


  const handleAddUser = (newUser: NewUser) => {
    const userToAdd: AdminUser = {
      ...newUser,
      id: new Date().getTime().toString(),
      status: "Actif",
      lastLogin: new Date().toLocaleString(),
    };
    setUsers(prevUsers => [userToAdd, ...prevUsers]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="flex items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-32" />
          </div>
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
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddUserDialogOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Ajouter un utilisateur
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="users">
              <UserManagement users={users} onDeleteUser={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="roles">
              <RoleConfiguration />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdd={handleAddUser}
      />
    </div>
  );
}
