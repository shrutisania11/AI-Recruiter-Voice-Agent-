import { db } from '@/db';

export async function GET() {
  try {
    await db.execute('SELECT 1');
    return Response.json({ ok: true, message: 'Neon DB connected' });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: 'Neon DB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
