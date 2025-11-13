
'use client';

import { useState } from 'react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Clock, MessageSquare, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ForumThread, ForumPost, User as UserProfile } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function PostItem({ post }: { post: ForumPost }) {
    return (
        <div className="flex items-start gap-4">
            <Avatar>
                <AvatarFallback>{post.authorName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <p className="font-semibold">{post.authorName}</p>
                    <p className="text-muted-foreground">·</p>
                    <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
            </div>
        </div>
    )
}

export default function ThreadPage() {
    const { user, firestore } = useFirebase();
    const router = useRouter();
    const params = useParams();
    const threadId = params.threadId as string;
    const { toast } = useToast();

    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Fetch user profile to get the full name
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const threadRef = useMemoFirebase(() => {
        if (!firestore || !threadId) return null;
        return doc(firestore, 'forumThreads', threadId);
    }, [firestore, threadId]);
    const { data: thread, isLoading: isThreadLoading } = useDoc<ForumThread>(threadRef);

    const postsQuery = useMemoFirebase(() => {
        if (!firestore || !threadId) return null;
        return query(collection(firestore, `forumThreads/${threadId}/posts`), orderBy('createdAt', 'asc'));
    }, [firestore, threadId]);
    const { data: posts, isLoading: arePostsLoading } = useCollection<ForumPost>(postsQuery);

    const handlePostReply = async () => {
        if (!replyContent.trim() || !user || !firestore || !threadId || !userProfile) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Vous devez être connecté et le contenu ne peut être vide.'
            });
            return;
        }

        setIsSubmitting(true);
        const newPost: Omit<ForumPost, 'id'> = {
            threadId: threadId,
            content: replyContent,
            authorId: user.uid,
            authorName: `${userProfile.firstName} ${userProfile.lastName}`,
            createdAt: new Date().toISOString(),
        };

        const postsRef = collection(firestore, 'forumThreads', threadId, 'posts');
        await addDocumentNonBlocking(postsRef, newPost);
        
        // Non-blocking, so we give a little visual feedback time
        setTimeout(() => {
            setReplyContent('');
            setIsSubmitting(false);
            toast({
                title: 'Réponse publiée !',
            });
        }, 300);
    };

    const isLoading = isThreadLoading || arePostsLoading;

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-5 w-1/2 mb-8" />
                <div className="space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    if (!thread) {
        return <div className="container max-w-4xl mx-auto py-8 text-center">Sujet non trouvé.</div>;
    }

    return (
        <div className="container max-w-4xl mx-auto py-8">
             <Link href="/wellness" className="text-sm text-primary hover:underline mb-4 inline-block">
                &larr; Retour au forum
            </Link>
            <h1 className="text-3xl font-bold font-headline mb-2">{thread.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 border-b pb-6">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {thread.authorName}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: fr })}
                </span>
                <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {posts?.length || 0} réponses</span>
            </div>

            <div className="space-y-8">
                {/* Original Post */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                   <PostItem post={{ ...thread, threadId: thread.id, id: thread.id }} />
                </div>
                
                {/* Replies */}
                {posts && posts.map(post => <PostItem key={post.id} post={post} />)}

                {/* Reply Form */}
                {user ? (
                    <div className="pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">Votre réponse</h3>
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback>{userProfile?.firstName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea 
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Écrivez votre réponse ici..."
                                    rows={4}
                                    disabled={isSubmitting}
                                />
                                <Button onClick={handlePostReply} disabled={isSubmitting || !replyContent.trim()}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Envoi...' : 'Répondre'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="pt-8 border-t text-center">
                        <p>Vous devez être connecté pour répondre.</p>
                        <Button asChild className="mt-4">
                            <Link href={`/auth/login?redirect=/wellness/forum/${threadId}`}>Se connecter</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
