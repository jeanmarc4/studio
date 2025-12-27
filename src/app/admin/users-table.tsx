'use client';

import { collection, doc, updateDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Shield, MoreHorizontal, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';


const plans = ['Gratuit', 'Standard', 'Premium'];

export function UsersTable() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);
  
  const handlePlanChange = async (userId: string, newPlan: User['subscriptionPlan']) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    try {
        await updateDoc(userDocRef, { subscriptionPlan: newPlan });
        toast({
            title: "Succès",
            description: `Le plan de l'utilisateur a été mis à jour à ${newPlan}.`,
        });
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de mettre à jour le plan de l'utilisateur."
        })
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Plan Actuel</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.email || 'Utilisateur Anonyme'}</div>
                  <div className="text-xs text-muted-foreground">{user.id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                    {user.role === 'admin' ? 'Admin' : 'Patient'}
                  </Badge>
                </TableCell>
                <TableCell>{user.subscriptionPlan || 'Gratuit'}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Changer de plan</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuLabel>Sélectionner un plan</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {plans.map(plan => (
                                        <DropdownMenuItem 
                                            key={plan}
                                            onClick={() => handlePlanChange(user.id, plan as User['subscriptionPlan'])}
                                            disabled={user.subscriptionPlan === plan}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", user.subscriptionPlan === plan ? "opacity-100" : "opacity-0")} />
                                            {plan}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            {/* Future actions can be added here */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Aucun utilisateur trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
