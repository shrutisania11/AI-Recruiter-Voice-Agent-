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
    const jobsList = await db.query.jobs.findMany({
      where: eq(schema.jobs.recruiterId, recruiterId),
      orderBy: [desc(schema.jobs.createdAt)],
    });

    const schedulesList = await db.select().from(schema.schedules).where(eq(schema.schedules.recruiterId, recruiterId));

    const jobsWithCount = jobsList.map(job => {
      const count = schedulesList.filter(s => s.jobId === job.id).length;
      return {
        ...job,
        candidatesCount: count
      };
    });

    return NextResponse.json(jobsWithCount);
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
    const { title, description, skills, location, experience, salary, status } = body;

    if (!title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    const [inserted] = await db.insert(schema.jobs).values({
      recruiterId,
      title,
      description: description || 'No job description provided.',
      skills: skills || 'N/A',
      location: location || 'Remote',
      experience: experience || '3+ years',
      salary: salary || '$100,000 - $145,000 / yr',
      status: status || 'Active',
    }).returning();

    return NextResponse.json(inserted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const recruiterId = await getRecruiterId();
  if (!recruiterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const [updated] = await db.update(schema.jobs).set({
      status,
      updatedAt: new Date()
    }).where(
      and(
        eq(schema.jobs.id, id),
        eq(schema.jobs.recruiterId, recruiterId)
      )
    ).returning();

    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const recruiterId = await getRecruiterId();
  if (!recruiterId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    // 1. Delete associated schedules first
    await db.delete(schema.schedules).where(eq(schema.schedules.jobId, id));

    // 2. Delete the job
    const result = await db.delete(schema.jobs).where(
      and(
        eq(schema.jobs.id, id),
        eq(schema.jobs.recruiterId, recruiterId)
      )
    ).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
