'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Todo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const formSchema = z.object({
  title: z.string().min(1, 'Le titre ne peut pas être vide.'),
});

export default function TodosPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const todosQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/todos`);
  }, [firestore, user]);

  const { data: todos, isLoading: isLoadingTodos } = useCollection<Todo>(todosQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleAddTodo = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    const colRef = collection(firestore, `users/${user.uid}/todos`);
    addDocumentNonBlocking(colRef, {
      userId: user.uid,
      title: values.title,
      completed: false,
      createdAt: serverTimestamp(),
    });
    form.reset();
  };

  const handleToggleTodo = (todo: Todo) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/todos`, todo.id);
    setDocumentNonBlocking(docRef, { completed: !todo.completed }, { merge: true });
  };

  const handleDeleteTodo = (todoId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/todos`, todoId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const sortedTodos = todos?.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Assuming createdAt is a Firestore Timestamp
    const dateA = a.createdAt?.toMillis() || 0;
    const dateB = b.createdAt?.toMillis() || 0;
    return dateA - dateB;
  });

  const isLoading = isUserLoading || isLoadingTodos;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour gérer vos tâches.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground font-headline">Tâches Quotidiennes</h1>
        <p className="mt-1 text-lg text-muted-foreground">Organisez votre journée et ne manquez rien d'important.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une tâche</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTodo)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Ex: Prendre la tension à 18h..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Ajouter</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {sortedTodos && sortedTodos.length > 0 ? (
          sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                todo.completed ? 'border-dashed bg-muted/50' : 'bg-card'
              )}
            >
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => handleToggleTodo(todo)}
                className="h-5 w-5"
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={cn(
                  'flex-1 cursor-pointer text-base',
                  todo.completed && 'text-muted-foreground line-through'
                )}
              >
                {todo.title}
              </label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette tâche?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteTodo(todo.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Aucune tâche pour le moment.</p>
            <p className="text-sm">Ajoutez-en une ci-dessus pour commencer !</p>
          </div>
        )}
      </div>

    </div>
  );
}
    