"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HolisticContent } from "@/docs/backend-documentation";

const contentSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit comporter au moins 5 caractères." }),
  type: z.string().min(2, { message: "Le type est requis." }),
  url: z.string().url({ message: "Veuillez entrer une URL valide." }),
  description: z.string().min(10, { message: "La description doit comporter au moins 10 caractères." }),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface EditHolisticContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  article: HolisticContent;
  onArticleUpdate: (data: ContentFormData) => void;
}

export function EditHolisticContentDialog({ isOpen, onOpenChange, article, onArticleUpdate }: EditHolisticContentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: article.title,
      type: article.type,
      url: article.url,
      description: article.description || "",
    },
  });

  useEffect(() => {
    form.reset({
      title: article.title,
      type: article.type,
      url: article.url,
      description: article.description || "",
    });
  }, [article, form]);

  async function onSubmit(values: ContentFormData) {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onArticleUpdate(values);
    setIsLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
          <DialogDescription>
            Mettre à jour les informations de "{article.title}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bien-être Mental">Bien-être Mental</SelectItem>
                      <SelectItem value="Nutrition">Nutrition</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'article</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Extrait</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Sauvegarder les changements"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
