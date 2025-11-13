"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { MedicalProfessional } from "@/docs/backend-documentation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProfessionalDialog } from "./edit-professional-dialog";

interface ProfessionalManagementProps {
    professionals: MedicalProfessional[];
    onDeleteProfessional: (id: string) => void;
    onUpdateProfessional: (id: string, data: Partial<MedicalProfessional>) => void;
    isLoading: boolean;
}

export function ProfessionalManagement({ professionals, onDeleteProfessional, onUpdateProfessional, isLoading }: ProfessionalManagementProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<MedicalProfessional | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [professionalToEdit, setProfessionalToEdit] = useState<MedicalProfessional | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (prof: MedicalProfessional) => {
    setProfessionalToDelete(prof);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (professionalToDelete?.id) {
      onDeleteProfessional(professionalToDelete.id);
      toast({
        title: "Professionnel supprimé",
        description: `${professionalToDelete.name} a été supprimé.`
      });
      setProfessionalToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleEditClick = (prof: MedicalProfessional) => {
    setProfessionalToEdit(prof);
    setIsEditDialogOpen(true);
  };

  const handleProfessionalUpdate = (data: Partial<MedicalProfessional>) => {
    if (professionalToEdit?.id) {
        onUpdateProfessional(professionalToEdit.id, data);
        toast({
            title: "Profil mis à jour",
            description: `Les informations de ${data.name || professionalToEdit.name} ont été mises à jour.`
        })
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Professionnels de Santé</CardTitle>
          <CardDescription>
            Gérez les médecins, pharmacies et autres professionnels listés sur la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                professionals.map((prof) => (
                  <TableRow key={prof.id}>
                    <TableCell className="font-medium">{prof.name}</TableCell>
                    <TableCell>{prof.specialty}</TableCell>
                    <TableCell>{prof.address}</TableCell>
                    <TableCell>{prof.phone}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Ouvrir/fermer le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(prof)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(prof)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le profil de <span className="font-semibold">{professionalToDelete?.name}</span> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive">
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {professionalToEdit && (
        <EditProfessionalDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          professional={professionalToEdit}
          onProfessionalUpdate={handleProfessionalUpdate}
        />
      )}
    </>
  );
}
