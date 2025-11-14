
import { Wrench } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <AppLogo />
                </div>
            </CardHeader>
            <CardContent>
                <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold font-headline text-primary">
                    Site en Maintenance
                </h1>
                <p className="mt-2 text-lg text-muted-foreground font-body">
                    Nous améliorons votre expérience. Le site sera de retour très prochainement.
                </p>
                <p className="mt-6 text-sm text-muted-foreground">
                    Merci de votre patience.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
