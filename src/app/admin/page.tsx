"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import { UserManagement } from "./components/user-management";
import { AddUserDialog } from "./components/add-user-dialog";
import { RoleConfiguration } from "./components/role-configuration";
import { adminUsers } from "@/lib/data";
import type { AdminUser } from "@/lib/data";

type NewUser = Omit<AdminUser, "id" | "status" | "lastLogin">;

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const handleAddUser = (newUser: NewUser) => {
    const userToAdd: AdminUser = {
      ...newUser,
      id: new Date().getTime().toString(),
      status: "Active",
      lastLogin: new Date().toLocaleString(),
    };
    setUsers(prevUsers => [userToAdd, ...prevUsers]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">User Management</TabsTrigger>
                <TabsTrigger value="config">Role Configuration</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddUserDialogOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add User
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <UserManagement users={users} onDeleteUser={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="config">
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
