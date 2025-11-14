
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";
import { RoleConfiguration } from "./components/role-configuration";
import { Dashboard } from "./components/dashboard";
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { User, MedicalProfessional, HolisticContent } from '@/docs/backend-documentation';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { AddUserDialog } from "./components/add-user-dialog";
import { ProfessionalManagement } from "./components/professional-management";
import { AddProfessionalDialog } from "./components/add-professional-dialog";
import { HolisticContentManagement } from "./components/holistic-content-management";
import { AddHolisticContentDialog } from "./components/add-holistic-content-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddProfessionalDialogOpen, setIsAddProfessionalDialogOpen] = useState(false);
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check for admin role document existence. This is the single source of truth.
  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);
  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  useEffect(() => {
    if (isUserLoading || isAdminRoleLoading) {
      return; // Wait for auth state and role doc to load
    }
    
    if (!user) {
      router.push('/auth/login?redirect=/admin');
      return;
    }

    // Authorization is determined SOLELY by the existence of the admin role document.
    setIsAuthorized(!!adminRoleDoc);

  }, [user, isUserLoading, adminRoleDoc, isAdminRoleLoading, router]);


  const handleBecomeAdmin = async () => {
    if (!firestore || !user) return;
    const adminDocRef = doc(firestore, 'roles_admin', user.uid);
    try {
      // This will fail if the user isn't already an admin, which is intended behavior
      // for a production environment. This button serves as a way to "claim" admin
      // status if rules are temporarily relaxed or for the very first admin.
      await setDoc(adminDocRef, { userId: user.uid, role: 'admin' });
      toast({
        title: "Statut d'administrateur accordé",
        description: "Vous avez maintenant les privilèges d'administrateur.",
      });
    } catch (e: any) {
       console.error("Failed to become admin", e);
       toast({
        variant: "destructive",
        title: "Échec de l'opération",
        description: "Vous n'avez pas les autorisations nécessaires pour devenir administrateur.",
      });
    }
  };

  // Data fetching - only trigger queries if user is authorized
  const usersQuery = useMemoFirebase(() => isAuthorized ? collection(firestore, 'users') : null, [firestore, isAuthorized]);
  const professionalsQuery = useMemoFirebase(() => isAuthorized ? collection(firestore, 'medicalProfessionals') : null, [firestore, isAuthorized]);
  const contentQuery = useMemoFirebase(() => isAuthorized ? collection(firestore, 'holisticContent') : null, [firestore, isAuthorized]);

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);
  const { data: professionals, isLoading: areProfessionalsLoading } = useCollection<MedicalProfessional>(professionalsQuery);
  const { data: holisticContent, isLoading: areContentLoading } = useCollection<HolisticContent>(contentQuery);

  // User management handlers
  const handleAddUser = (newUser: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', newUser.id);
    setDocumentNonBlocking(userDocRef, newUser, {});
    if (newUser.role === 'Admin' && newUser.id) {
      const adminRoleDocRef = doc(firestore, 'roles_admin', newUser.id);
      setDocumentNonBlocking(adminRoleDocRef, { userId: newUser.id, role: 'admin' }, {});
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', userId));
    // Also remove them from the admin role collection, just in case
    deleteDocumentNonBlocking(doc(firestore, 'roles_admin', userId));
  };
  
  const handleUpdateUserRole = (userId: string, role: "Admin" | "Gratuit" | "Standard" | "Premium") => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'users', userId), { role });
    
    const adminRoleDocRef = doc(firestore, 'roles_admin', userId);
    if (role === "Admin") {
        setDocumentNonBlocking(adminRoleDocRef, { userId, role: 'admin' }, {});
    } else {
        deleteDocumentNonBlocking(adminRoleDocRef);
    }
  };

  // Professional management handlers
  const handleAddProfessional = (newProfessional: MedicalProfessional) => {
    if (!firestore) return;
    const professionalDocRef = doc(firestore, 'medicalProfessionals', newProfessional.id);
    setDocumentNonBlocking(professionalDocRef, newProfessional, {});
  };

  const handleDeleteProfessional = (professionalId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'medicalProfessionals', professionalId));
  };
  
  const handleUpdateProfessional = (professionalId: string, data: Partial<MedicalProfessional>) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'medicalProfessionals', professionalId), data);
  };
  
  // Holistic Content management handlers
  const handleAddHolisticContent = (newContent: HolisticContent) => {
    if (!firestore) return;
    const contentDocRef = doc(firestore, 'holisticContent', newContent.id);
    setDocumentNonBlocking(contentDocRef, newContent, {});
  };

  const handleDeleteHolisticContent = (contentId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'holisticContent', contentId));
  };
  
  const handleUpdateHolisticContent = (contentId: string, data: Partial<HolisticContent>) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'holisticContent', contentId), data);
  };

  if (isAuthorized === null || isUserLoading || isAdminRoleLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Vérification des autorisations...</p>
      </div>
    )
  }
  
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/>Accès Restreint</CardTitle>
             <CardDescription>
                Cette section est réservée aux administrateurs.
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
                Si vous devriez avoir accès mais que vous ne l'avez pas, contactez un administrateur. Le bouton ci-dessous est destiné à la configuration initiale ou à des cas spécifiques et peut ne pas fonctionner si les règles de sécurité sont actives.
             </p>
           </CardContent>
           <CardFooter className="flex flex-col gap-4">
              <Button onClick={handleBecomeAdmin} className="w-full">
                Tenter de devenir Administrateur
              </Button>
               <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Retour à l'accueil
              </Button>
           </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="w-max">
                        <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="professionals">Professionnels</TabsTrigger>
                        <TabsTrigger value="articles">Articles</TabsTrigger>
                        <TabsTrigger value="roles">Rôles</TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="ml-auto hidden sm:flex items-center gap-2">
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
                  {activeTab === 'articles' && (
                    <Button size="sm" onClick={() => setIsAddContentDialogOpen(true)}>
                      Ajouter un article
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
                  onDeleteProfessional={handleDeleteProfessional}
                  onUpdateProfessional={handleUpdateProfessional}
                  isLoading={areProfessionalsLoading}
                />
              </TabsContent>
               <TabsContent value="articles">
                 <HolisticContentManagement
                  articles={holisticContent || []}
                  onDeleteArticle={handleDeleteHolisticContent}
                  onUpdateArticle={handleUpdateHolisticContent}
                  isLoading={areContentLoading}
                />
              </TabsContent>
              <TabsContent value="roles">
                <RoleConfiguration />
              </TabsContent>
            </Tabs>

            <div className="sm:hidden fixed bottom-4 right-4 z-50">
                {activeTab === 'users' && (
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setIsAddUserDialogOpen(true)}>
                    +
                </Button>
                )}
                {activeTab === 'professionals' && (
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setIsAddProfessionalDialogOpen(true)}>
                    +
                </Button>
                )}
                {activeTab === 'articles' && (
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setIsAddContentDialogOpen(true)}>
                    +
                </Button>
                )}
            </div>

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
        onProfessionalAdd={handleAddProfessional}
      />
      <AddHolisticContentDialog
        isOpen={isAddContentDialogOpen}
        onOpenChange={setIsAddContentDialogOpen}
        onArticleAdd={handleAddHolisticContent}
      />
    </>
  );
}
