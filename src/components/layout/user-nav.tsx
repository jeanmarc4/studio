
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, PlusCircle, Settings, User as UserIcon, Shield, FileHeart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImage } from "@/lib/placeholder-images";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from '@/docs/backend-documentation';
import { doc } from "firebase/firestore";


export function UserNav() {
  const userAvatar = getImage("user-avatar");
  const { user, auth, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userProfileRef);

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);
  
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion réussie",
      });
      router.push("/");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se déconnecter.",
      });
    }
  };

  if (isUserLoading || isAdminRoleLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user) {
    return (
      <Button asChild>
        <Link href="/auth/login">Se connecter</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={user?.photoURL || userAvatar?.imageUrl} 
              alt={user?.displayName || "Avatar de l'utilisateur"}
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.firstName} {userProfile?.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/emergency-card">
            <DropdownMenuItem>
                <FileHeart className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Carte d'Urgence</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isAdmin && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                     <Link href="/admin">
                        <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Panneau d'administration</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
            </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    