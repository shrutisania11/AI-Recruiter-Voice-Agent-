import { getRecruiterId } from '@/lib/auth';
import { db, schema } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const recruiterId = await getRecruiterId();
  if (!recruiterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schedulesList = await db.query.schedules.findMany({
      where: eq(schema.schedules.recruiterId, recruiterId),
      orderBy: [desc(schema.schedules.createdAt)],
    });

    const candidatesList = await db.select().from(schema.candidates).where(eq(schema.candidates.recruiterId, recruiterId));
    const jobsList = await db.select().from(schema.jobs).where(eq(schema.jobs.recruiterId, recruiterId));

    const merged = schedulesList.map(s => {
      const candidate = candidatesList.find(c => c.id === s.candidateId);
      const job = jobsList.find(j => j.id === s.jobId);
      return {
        ...s,
        name: candidate?.fullName || 'Unknown Candidate',
        email: candidate?.email || '',
        jobTitle: job?.title || 'Unknown Job',
      };
    });

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const recruiterId = await getRecruiterId();
  if (!recruiterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { candidates, jobId, interviewType } = body;
    // candidates is an array of { name, email, score, skills, inviteUrl }

    if (!jobId || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: 'Missing jobId or candidates list' }, { status: 400 });
    }

    const job = await db.query.jobs.findFirst({
      where: and(eq(schema.jobs.id, jobId), eq(schema.jobs.recruiterId, recruiterId))
    });

    if (!job) {
      return NextResponse.json({ error: 'Job position not found' }, { status: 404 });
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const invitedAtDateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

    const createdSchedules = [];

    for (const c of candidates) {
      // 1. Check if candidate exists by email under this recruiter
      let dbCandidate = await db.query.candidates.findFirst({
        where: and(
          eq(schema.candidates.email, c.email),
          eq(schema.candidates.recruiterId, recruiterId)
        )
      });

      if (!dbCandidate) {
        // Create candidate in db
        const [newCand] = await db.insert(schema.candidates).values({
          recruiterId,
          fullName: c.name,
          email: c.email,
          role: job.title,
          skills: c.skills || job.skills || 'N/A',
          score: c.score || '85%',
          status: 'Scheduled',
        }).returning();
        dbCandidate = newCand;
      } else {
        // Update status of existing candidate to Scheduled
        await db.update(schema.candidates)
          .set({ status: 'Scheduled', role: job.title })
          .where(eq(schema.candidates.id, dbCandidate.id));
      }

      // 2. Generate invite url if not provided
      const candidateSlug = c.name.toLowerCase().replace(/\s+/g, '-');
      const interviewUrl = c.inviteUrl || `/interview/${candidateSlug}-${jobId}`;

      // 3. Create schedule record
      const [newSchedule] = await db.insert(schema.schedules).values({
        candidateId: dbCandidate.id,
        jobId: jobId,
        recruiterId: recruiterId,
        invitedAt: invitedAtDateStr,
        status: 'Invited',
        interviewType: interviewType || 'Screening',
        interviewUrl: interviewUrl,
      }).returning();

      createdSchedules.push(newSchedule);
    }

    return NextResponse.json({ success: true, count: createdSchedules.length, schedules: createdSchedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
