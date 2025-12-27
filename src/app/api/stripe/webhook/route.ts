'use server';

import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {stripe} from '@/lib/stripe';
import {headers} from 'next/headers';
import {doc, updateDoc} from 'firebase/firestore';
import { getSdks } from '@/firebase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json(
      {error: `Webhook Error: ${error.message}`},
      {status: 400}
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    if (!session?.metadata?.userId || !session?.metadata?.plan) {
      return NextResponse.json(
        {error: 'Metadata is missing in the webhook event.'},
        {status: 400}
      );
    }

    try {
      const {firestore} = getSdks();
      const userRef = doc(firestore, 'users', session.metadata.userId);

      await updateDoc(userRef, {
        subscriptionPlan: session.metadata.plan,
      });
    } catch (error) {
      console.error('Error updating user subscription in Firestore:', error);
      return NextResponse.json(
        {error: 'Failed to update user subscription.'},
        {status: 500}
      );
    }
  }

  return NextResponse.json({result: event, ok: true});
}
