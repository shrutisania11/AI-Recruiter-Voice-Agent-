import { auth, currentUser } from '@clerk/nextjs/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  const authData = await auth();
  const { userId } = authData;
  
  // Extract email from sessionClaims or fallback to currentUser()
  let email = (authData.sessionClaims as any)?.email || (authData.sessionClaims as any)?.primary_email;
  let name = (authData.sessionClaims as any)?.name || '';

  if (!email) {
    try {
      const user = await currentUser();
      if (user) {
        email = user.emailAddresses[0]?.emailAddress ?? '';
        name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || '';
      }
    } catch (err: any) {
      console.error('Clerk currentUser lookup failed in sync-user route:', err);
    }
  }

  if (!userId || !email) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (!existingUser) {
    await db.insert(schema.users).values({
      clerkId: userId,
      email,
      name: name || 'Recruiter',
      role: 'recruiter',
    });
  } else if (!existingUser.clerkId) {
    await db.update(schema.users)
      .set({ clerkId: userId })
      .where(eq(schema.users.id, existingUser.id));
  }

  return NextResponse.json({ ok: true, message: 'User synced' });
}
