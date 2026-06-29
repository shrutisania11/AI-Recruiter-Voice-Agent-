import { auth, currentUser } from '@clerk/nextjs/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { initializeDatabase } from '@/db/init';

export async function getRecruiterId() {
  const authData = await auth();
  const { userId } = authData;

  if (!userId) return null;

  // Run schema initialization to make sure tables/columns exist
  try {
    await initializeDatabase('system-init@vocalhire.ai');
  } catch (err) {
    console.error('Error auto-initializing database in getRecruiterId:', err);
  }

  // 1. Try finding user by clerkId (fully local JWT verification + db query)
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.clerkId, userId),
    });
    if (existingUser) {
      return existingUser.id;
    }
  } catch (err) {
    console.error('Error finding user by clerkId:', err);
  }

  // 2. Try email from sessionClaims
  let email = (authData.sessionClaims as any)?.email || (authData.sessionClaims as any)?.primary_email;
  let name = (authData.sessionClaims as any)?.name || '';

  // 3. Fallback to currentUser() if email not in claims (takes longer)
  if (!email) {
    try {
      const user = await currentUser();
      if (user) {
        email = user.emailAddresses[0]?.emailAddress ?? '';
        name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || '';
      }
    } catch (err) {
      console.error('Error fetching currentUser from Clerk:', err);
    }
  }

  if (!email) return null;

  // 4. Find user by email
  try {
    const existingUserByEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUserByEmail) {
      // Backfill clerkId so subsequent requests are fast
      await db.update(schema.users)
        .set({ clerkId: userId })
        .where(eq(schema.users.id, existingUserByEmail.id));
      return existingUserByEmail.id;
    }

    // 5. Create user if not exists
    const [newUser] = await db.insert(schema.users).values({
      clerkId: userId,
      email,
      name: name || 'Recruiter',
      role: 'recruiter',
      plan: 'free',
    }).returning();

    return newUser.id;
  } catch (err) {
    console.error('Error in getRecruiterId database fallback:', err);
    return null;
  }
}
