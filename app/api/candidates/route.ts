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
    const list = await db.query.candidates.findMany({
      where: eq(schema.candidates.recruiterId, recruiterId),
      orderBy: [desc(schema.candidates.createdAt)],
    });
    return NextResponse.json(list);
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
    const { fullName, email, phone, role, score, skills, status, notes, isQualified } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const [inserted] = await db.insert(schema.candidates).values({
      recruiterId,
      fullName,
      email: email || null,
      phone: phone || null,
      role: role || null,
      score: score || '80%',
      skills: skills || 'N/A',
      status: status || 'Needs Review',
      notes: notes || null,
      isQualified: isQualified ?? false,
    }).returning();

    return NextResponse.json(inserted);
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

    // 1. Delete associated schedules first to maintain foreign key integrity
    await db.delete(schema.schedules).where(eq(schema.schedules.candidateId, id));

    // 2. Delete the candidate
    const result = await db.delete(schema.candidates).where(
      and(
        eq(schema.candidates.id, id),
        eq(schema.candidates.recruiterId, recruiterId)
      )
    ).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Candidate deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
