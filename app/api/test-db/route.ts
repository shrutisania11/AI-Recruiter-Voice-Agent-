import { db, schema } from '@/db';
import { initializeDatabase } from '@/db/init';
import { auth, currentUser } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Not authenticated with Clerk' });
    }

    const email = user.emailAddresses[0]?.emailAddress ?? '';
    
    // Test the database synchronization
    let dbUser = await db.query.users.findFirst({
      where: sql`email = ${email}`
    });

    if (!dbUser) {
      // Sync user
      const [inserted] = await db.insert(schema.users).values({
        email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Recruiter',
        role: 'recruiter',
      }).returning();
      dbUser = inserted;
    }

    // Capture logs from init
    let initError = null;
    try {
      await initializeDatabase(email);
    } catch (e: any) {
      initError = { message: e.message, stack: e.stack };
    }

    // Inspect tables and counts
    const tablesInspect: any = {};
    
    try {
      const tablesResult = await db.execute(sql`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
      `);
      tablesInspect.tables = tablesResult.rows.map(r => r.table_name);
    } catch (e: any) {
      tablesInspect.tablesError = e.message;
    }

    try {
      const jobsCount = await db.execute(sql`SELECT count(*) FROM jobs;`);
      tablesInspect.jobsCount = jobsCount.rows[0]?.count;
    } catch (e: any) {
      tablesInspect.jobsError = e.message;
    }

    try {
      const candidatesCount = await db.execute(sql`SELECT count(*) FROM candidates;`);
      tablesInspect.candidatesCount = candidatesCount.rows[0]?.count;
    } catch (e: any) {
      tablesInspect.candidatesError = e.message;
    }

    try {
      const schedulesCount = await db.execute(sql`SELECT count(*) FROM schedules;`);
      tablesInspect.schedulesCount = schedulesCount.rows[0]?.count;
    } catch (e: any) {
      tablesInspect.schedulesError = e.message;
    }

    return NextResponse.json({
      success: true,
      recruiterEmail: email,
      recruiterId: dbUser?.id,
      initError,
      tablesInspect
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
