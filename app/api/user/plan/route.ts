import { auth, currentUser } from '@clerk/nextjs/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/db/init';

export async function GET() {
  try {
    const authData = await auth();
    const { userId } = authData;

    if (!userId) {
      console.warn('User Plan API auth failed: userId is null');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Try to find user by clerkId first (takes ~10-20ms, no Clerk API calls)
    let dbUser = await db.query.users.findFirst({
      where: eq(schema.users.clerkId, userId),
    });

    if (dbUser) {
      return NextResponse.json({ plan: dbUser.plan || 'free' });
    }

    // 2. Fallback if not found by clerkId (sync or legacy user lookup)
    let email = (authData.sessionClaims as any)?.email || (authData.sessionClaims as any)?.primary_email;
    let name = (authData.sessionClaims as any)?.name || '';

    if (!email) {
      try {
        const user = await currentUser();
        if (user) {
          email = user.emailAddresses[0]?.emailAddress;
          name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || '';
        }
      } catch (err: any) {
        console.error('Clerk currentUser lookup failed in user plan API:', err);
      }
    }

    if (!email) {
      console.warn('User Plan API auth failed: email is null');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure database tables and columns are initialized
    await initializeDatabase(email);

    // Find or create user in db
    dbUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!dbUser) {
      const [inserted] = await db.insert(schema.users).values({
        clerkId: userId,
        email: email,
        name: name || 'Recruiter',
        role: 'recruiter',
        plan: 'free',
      }).returning();
      dbUser = inserted;
    } else {
      // Backfill clerkId
      const [updated] = await db.update(schema.users)
        .set({ clerkId: userId })
        .where(eq(schema.users.id, dbUser.id))
        .returning();
      dbUser = updated;
    }

    return NextResponse.json({ plan: dbUser.plan || 'free' });
  } catch (error: any) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
