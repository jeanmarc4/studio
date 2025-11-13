
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
import type { HolisticContent } from "@/docs/backend-documentation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditHolisticContentDialog } from "./edit-holistic-content-dialog";

interface HolisticContentManagementProps {
    articles: HolisticContent[];
    onDeleteArticle: (id: string) => void;
    onUpdateArticle: (id: string, data: Partial<HolisticContent>) => void;
    isLoading: boolean;
}

export function HolisticContentManagement({ articles, onDeleteArticle, onUpdateArticle, isLoading }: HolisticContentManagementProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<HolisticContent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<HolisticContent | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (article: HolisticContent) => {
    setArticleToDelete(article);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete?.id) {
      onDeleteArticle(articleToDelete.id);
      toast({
        title: "Article supprimé",
        description: `"${articleToDelete.title}" a été supprimé.`
      });
      setArticleToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleEditClick = (article: HolisticContent) => {
    setArticleToEdit(article);
    setIsEditDialogOpen(true);
  };

  const handleArticleUpdate = (data: Partial<HolisticContent>) => {
    if (articleToEdit?.id) {
        onUpdateArticle(articleToEdit.id, data);
        toast({
            title: "Article mis à jour",
            description: `Les informations de "${data.title || articleToEdit.title}" ont été mises à jour.`
        })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contenu Holistique</CardTitle>
          <CardDescription>
            Gérez les articles de bien-être, de nutrition et de fitness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.type}</TableCell>
                    <TableCell><a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{article.url}</a></TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(article)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(article)} className="text-destructive focus:text-destructive">
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
              Cette action est irréversible. L'article <span className="font-semibold">"{articleToDelete?.title}"</span> sera définitivement supprimé.
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

      {articleToEdit && (
        <EditHolisticContentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          article={articleToEdit}
          onArticleUpdate={handleArticleUpdate}
        />
      )}
    </>
  );
}

    