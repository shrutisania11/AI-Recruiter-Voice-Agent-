import { auth, currentUser } from '@clerk/nextjs/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || (plan !== 'pro' && plan !== 'enterprise' && plan !== 'free')) {
      return NextResponse.json({ error: 'Invalid plan specified' }, { status: 400 });
    }

    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 });
    }

    console.log(`Simulating mock checkout success. Upgrading user ${email} to plan: ${plan}...`);

    await db.update(schema.users).set({
      plan: plan,
      updatedAt: new Date(),
    }).where(eq(schema.users.id, dbUser.id));

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Mock Checkout success API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
