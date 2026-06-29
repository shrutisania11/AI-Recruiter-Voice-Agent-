import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan');

    if (!sessionId || !plan) {
      return NextResponse.redirect(`${origin}/dashboard?payment=error&reason=missing_params`);
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      // Fallback update if keys got removed mid-flight (unlikely but safe)
      return NextResponse.redirect(`${origin}/dashboard?payment=error&reason=keys_missing`);
    }

    console.log(`Verifying Stripe Session ID: ${sessionId}...`);

    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(stripeSecretKey + ':').toString('base64')}`,
      },
    });

    const sessionData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe Session Verification failed:', sessionData);
      return NextResponse.redirect(`${origin}/dashboard?payment=error&reason=verification_failed`);
    }

    // Check payment status or subscription status
    const paymentStatus = sessionData.payment_status; // "paid"
    const status = sessionData.status; // "complete"

    if (paymentStatus === 'paid' || status === 'complete') {
      const email = sessionData.customer_email || sessionData.customer_details?.email;
      const userIdMetadata = sessionData.metadata?.userId;

      console.log(`Stripe payment confirmed for ${email}. Upgrading plan to ${plan}...`);

      if (userIdMetadata) {
        await db.update(schema.users).set({
          plan: plan,
          updatedAt: new Date(),
        }).where(eq(schema.users.id, userIdMetadata));
      } else if (email) {
        await db.update(schema.users).set({
          plan: plan,
          updatedAt: new Date(),
        }).where(eq(schema.users.email, email));
      } else {
        console.warn('Could not extract email or userId from Stripe Session, plan update skipped');
      }

      return NextResponse.redirect(`${origin}/dashboard?payment=success&plan=${plan}`);
    } else {
      console.warn(`Stripe session unpaid. Status: ${status}, Payment Status: ${paymentStatus}`);
      return NextResponse.redirect(`${origin}/dashboard?payment=unpaid`);
    }
  } catch (error: any) {
    console.error('Callback API Server Error:', error);
    return NextResponse.redirect(`${origin}/dashboard?payment=error&reason=server_error`);
  }
}
