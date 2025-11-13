
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, User, Clock, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ForumThread } from '@/types';
import { NewThreadDialog } from './new-thread-dialog';

export function ForumView() {
  const { user, firestore } = useFirebase();
  const router = useRouter();
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

  const threadsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forumThreads'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: threads, isLoading } = useCollection<ForumThread>(threadsQuery);

  const handleStartDiscussion = () => {
    if (!user) {
      router.push('/auth/login?redirect=/wellness');
      return;
    }
    setIsNewThreadOpen(true);
  };
  
  const handleThreadClick = (threadId: string) => {
    router.push(`/wellness/forum/${threadId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline">Discussions</h2>
        <Button onClick={handleStartDiscussion}>
          <PlusCircle className="mr-2" />
          Démarrer une discussion
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : threads && threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map(thread => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleThreadClick(thread.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-primary">{thread.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {thread.authorName}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 
                      {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucune discussion pour le moment</h3>
          <p className="mt-2 text-sm text-muted-foreground">Soyez le premier à lancer un sujet !</p>
          <Button className="mt-6" onClick={handleStartDiscussion}>
            Démarrer une discussion
          </Button>
        </div>
      )}
      
      {user && (
         <NewThreadDialog
            isOpen={isNewThreadOpen}
            onOpenChange={setIsNewThreadOpen}
            currentUser={user}
        />
      )}
    </>
  );
}
