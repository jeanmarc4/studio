
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalSubscriptionButtonProps {
  planId: string;
}

export function PayPalSubscriptionButton({ planId }: PayPalSubscriptionButtonProps) {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const { toast } = useToast();

  const handleScriptLoad = () => {
    setIsSdkReady(true);
  };

  useEffect(() => {
    if (isSdkReady && window.paypal) {
      // Clear previous button if any
      const container = document.getElementById(`paypal-button-container-${planId}`);
      if (container) {
        container.innerHTML = '';
      }
      
      try {
        window.paypal.Buttons({
          style: {
            shape: 'pill',
            color: 'gold',
            layout: 'horizontal',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId
            });
          },
          onApprove: function(data: any, actions: any) {
            toast({
              title: "Abonnement réussi !",
              description: `Votre abonnement (${data.subscriptionID}) a été activé.`,
              duration: 5000,
            });
          },
          onError: function(err: any) {
            console.error("Erreur du bouton PayPal :", err);
            toast({
              variant: 'destructive',
              title: "Erreur d'abonnement",
              description: "Une erreur est survenue lors de la tentative d'abonnement. Veuillez réessayer.",
            });
          }
        }).render(`#paypal-button-container-${planId}`);
      } catch (error) {
        console.error("Échec du rendu du bouton PayPal :", error);
      }
    }
  }, [isSdkReady, planId, toast]);
  
  // Affiche un placeholder si l'ID du plan n'est pas celui pour la démo
  if (planId !== 'P-4P647554GL1336123NEKZ2HI') {
      return <div className="text-center text-sm text-muted-foreground p-4">Bouton d'abonnement Premium bientôt disponible.</div>
  }

  return (
    <>
      <Script 
        src="https://www.paypal.com/sdk/js?client-id=ASfqyV865Nt-9CbsQj9SYc5eBNHEhwoxpLepl3FycYF8tsCLCAgEPf6zQWRfuRtalSrYTMkgRAlYEyQV&vault=true&intent=subscription"
        onLoad={handleScriptLoad}
        data-sdk-integration-source="button-factory"
      />
      {!isSdkReady && <Skeleton className="h-10 w-full" />}
      <div id={`paypal-button-container-${planId}`} style={{ display: isSdkReady ? 'block' : 'none' }} />
    </>
  );
}

