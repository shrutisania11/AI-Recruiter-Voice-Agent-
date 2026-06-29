import { auth, currentUser } from '@clerk/nextjs/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/db/init';

export async function POST(req: Request) {
  const fs = require('fs');
  const path = require('path');
  const logFilePath = path.join(process.cwd(), 'db-debug.log');
  const log = (msg: string) => {
    console.log(`[STRIPE_CHECKOUT_API] ${msg}`);
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      try {
        fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] [STRIPE_CHECKOUT_API] ${msg}\n`);
      } catch (err) {}
    }
  };

  try {
    const authData = await auth();
    const { userId } = authData;
    
    // Extract email from sessionClaims or fallback to currentUser()
    let email = (authData.sessionClaims as any)?.email || (authData.sessionClaims as any)?.primary_email;

    if (!email) {
      try {
        const user = await currentUser();
        if (user) {
          email = user.emailAddresses[0]?.emailAddress;
        }
      } catch (err: any) {
        log(`Clerk currentUser() network error: ${err.message}`);
      }
    }

    log(`POST request. userId: ${userId}, email: ${email}`);

    if (!userId || !email) {
      log('Authentication failed: userId or email is null');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || (plan !== 'pro' && plan !== 'enterprise')) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Ensure database tables and columns are initialized
    await initializeDatabase(email);

    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    if (!stripeSecretKey || stripeSecretKey === 'placeholder' || stripeSecretKey.trim() === '') {
      // No Stripe keys found, redirect to our premium Mock Checkout flow
      console.log('Stripe API Key missing. Falling back to Mock Checkout simulator.');
      return NextResponse.json({ url: `${origin}/dashboard/checkout-mock?plan=${plan}` });
    }

    // Determine details based on selected plan
    const isPro = plan === 'pro';
    const amount = isPro ? 4900 : 19900;
    const productName = isPro ? 'vocalHire Pro Recruiter' : 'vocalHire Enterprise';
    const productDesc = isPro
      ? '100 AI voice interviews/mo & advanced analytics'
      : 'Unlimited AI voice interviews/mo & 24/7 dedicated support';

    // Construct checkout session request using Stripe REST API
    const params = new URLSearchParams();
    params.append('success_url', `${origin}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`);
    params.append('cancel_url', `${origin}/dashboard?payment=cancelled`);
    params.append('mode', 'subscription');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', amount.toString());
    params.append('line_items[0][price_data][recurring][interval]', 'month');
    params.append('line_items[0][price_data][product_data][name]', productName);
    params.append('line_items[0][price_data][product_data][description]', productDesc);
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[userId]', dbUser.id);
    params.append('metadata[plan]', plan);
    params.append('customer_email', email);

    console.log(`Creating Stripe Checkout Session for ${email} (${plan})...`);

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(stripeSecretKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const sessionData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe API Error:', sessionData);
      // Fallback to Mock Checkout in case of API request configuration error (e.g. invalid test key)
      return NextResponse.json({ url: `${origin}/dashboard/checkout-mock?plan=${plan}&api_error=true` });
    }

    return NextResponse.json({ url: sessionData.url });
  } catch (error: any) {
    console.error('Checkout API Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
