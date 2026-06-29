import { db } from './index';
import { sql } from 'drizzle-orm';

const globalRef = global as any;

export async function initializeDatabase(recruiterEmail: string) {
  if (globalRef.dbInitialized) {
    return;
  }

  // Always run self-healing user plan and clerk_id column check first
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;`);
  } catch (e: any) {
    console.error('Self-healing users column alter failed:', e);
  }


  try {
    // 1. Create tables if they do not exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruiter_id UUID,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        skills TEXT NOT NULL,
        location TEXT NOT NULL,
        experience TEXT NOT NULL,
        salary TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruiter_id UUID,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT,
        score TEXT,
        skills TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        notes TEXT,
        is_qualified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID,
        job_id UUID,
        recruiter_id UUID,
        invited_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Invited',
        interview_type TEXT NOT NULL DEFAULT 'Screening',
        score INTEGER,
        duration TEXT,
        interview_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 2. Self-healing columns: Ensure candidates and users tables have the newer columns
    try {
      await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS role TEXT;`);
      await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS score TEXT;`);
      await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills TEXT;`);
    } catch (e) {
      console.log('Columns might already exist in candidates table:', e);
    }

    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';`);

    // Get current recruiter's user record to associate with foreign keys
    const recruiterUser = await db.execute(sql`
      SELECT id FROM users WHERE email = ${recruiterEmail} LIMIT 1;
    `);
    const recruiterId = recruiterUser.rows[0]?.id as string;

    if (!recruiterId) {
      console.warn('Recruiter user not found in database, skipping seed checks.');
      return;
    }

    // 3. Seeding Jobs if empty
    const jobsCount = await db.execute(sql`SELECT count(*) FROM jobs;`);
    const totalJobs = Number(jobsCount.rows[0]?.count || 0);
    let seededJobIds: string[] = [];

    if (totalJobs === 0) {
      console.log('Seeding initial jobs table...');
      const seedJobs = [
        {
          title: 'Senior Software Engineer',
          description: 'Lead development of core cloud-native microservices, scale user-facing web applications using React/Next.js, and maintain robust API systems.',
          skills: 'React, Next.js, TypeScript, Node.js',
          location: 'Remote',
          experience: '5+ years',
          salary: '$140,000 - $190,000 / yr',
          status: 'Active'
        },
        {
          title: 'Product Manager',
          description: 'Own the roadmap definitions, align cross-functional stakeholder pipelines, direct feature scoping, and analyze product discovery metrics.',
          skills: 'Roadmapping, Jira, Agile, SQL, Analytics',
          location: 'Hybrid (New York, NY)',
          experience: '3+ years',
          salary: '$120,000 - $165,000 / yr',
          status: 'Active'
        },
        {
          title: 'Frontend Developer',
          description: 'Design beautiful, highly interactive landing portals and layout structures using HTML, CSS, TailwindCSS, and state-management utilities.',
          skills: 'HTML, CSS, TailwindCSS, React, Javascript',
          location: 'Remote',
          experience: '2+ years',
          salary: '$95,000 - $130,000 / yr',
          status: 'Draft'
        }
      ];

      for (const job of seedJobs) {
        const result = await db.execute(sql`
          INSERT INTO jobs (recruiter_id, title, description, skills, location, experience, salary, status)
          VALUES (${recruiterId}, ${job.title}, ${job.description}, ${job.skills}, ${job.location}, ${job.experience}, ${job.salary}, ${job.status})
          RETURNING id;
        `);
        seededJobIds.push(result.rows[0]?.id as string);
      }
    } else {
      const existingJobs = await db.execute(sql`SELECT id FROM jobs LIMIT 3;`);
      seededJobIds = existingJobs.rows.map(r => r.id as string);
    }

    // 4. Seeding Candidates if empty
    const candidatesCount = await db.execute(sql`SELECT count(*) FROM candidates;`);
    const totalCandidates = Number(candidatesCount.rows[0]?.count || 0);
    let seededCandidateIds: string[] = [];

    if (totalCandidates === 0) {
      console.log('Seeding initial candidates table...');
      const seedCandidates = [
        { name: 'Sarah Johnson', role: 'Senior Software Engineer', score: '94%', status: 'Qualified', email: 'sarah.johnson@example.com', skills: 'React, Next.js, TypeScript, Node.js', isQualified: true },
        { name: 'Mark Davis', role: 'Product Manager', score: '88%', status: 'Scheduled', email: 'mark.davis@example.com', skills: 'Product Roadmap, Jira, Agile, SQL', isQualified: false },
        { name: 'Alex Thompson', role: 'Frontend Developer', score: '91%', status: 'Qualified', email: 'alex.thompson@example.com', skills: 'HTML, CSS, Tailwind, Javascript', isQualified: true },
        { name: 'Jessica Miller', role: 'UX Designer', score: '78%', status: 'Needs Review', email: 'jessica.miller@example.com', skills: 'Figma, Wireframing, User Testing', isQualified: false }
      ];

      for (const cand of seedCandidates) {
        const result = await db.execute(sql`
          INSERT INTO candidates (recruiter_id, full_name, email, role, score, status, skills, is_qualified)
          VALUES (${recruiterId}, ${cand.name}, ${cand.email}, ${cand.role}, ${cand.score}, ${cand.status}, ${cand.skills}, ${cand.isQualified})
          RETURNING id;
        `);
        seededCandidateIds.push(result.rows[0]?.id as string);
      }
    } else {
      const existingCandidates = await db.execute(sql`SELECT id FROM candidates LIMIT 4;`);
      seededCandidateIds = existingCandidates.rows.map(r => r.id as string);
    }

    // 5. Seeding Schedules/Interviews if empty
    const schedulesCount = await db.execute(sql`SELECT count(*) FROM schedules;`);
    const totalSchedules = Number(schedulesCount.rows[0]?.count || 0);

    if (totalSchedules === 0 && seededJobIds.length >= 3 && seededCandidateIds.length >= 4) {
      console.log('Seeding initial schedules table...');
      
      const seedSchedules = [
        {
          candidateId: seededCandidateIds[0], // Sarah Johnson
          jobId: seededJobIds[0], // Senior Software Engineer
          invitedAt: 'Mon, Jun 23',
          status: 'Completed',
          interviewType: 'Technical Interview',
          score: 88,
          duration: '24 min',
          interviewUrl: `/interview/sarah-johnson-${seededJobIds[0]}`
        },
        {
          candidateId: seededCandidateIds[1], // Mark Davis
          jobId: seededJobIds[1], // Product Manager
          invitedAt: 'Wed, Jun 25',
          status: 'Completed',
          interviewType: 'HR Final Interview',
          score: 91,
          duration: '29 min',
          interviewUrl: `/interview/mark-davis-${seededJobIds[1]}`
        },
        {
          candidateId: seededCandidateIds[2], // Alex Thompson
          jobId: seededJobIds[1], // Product Manager
          invitedAt: 'Thu, Jun 26',
          status: 'Expired',
          interviewType: 'Screening',
          score: null,
          duration: null,
          interviewUrl: `/interview/alex-thompson-${seededJobIds[1]}`
        },
        {
          candidateId: seededCandidateIds[3], // Jessica Miller
          jobId: seededJobIds[1], // Product Manager
          invitedAt: 'Wed, Jun 25',
          status: 'Invited',
          interviewType: 'Screening',
          score: null,
          duration: null,
          interviewUrl: `/interview/jessica-miller-${seededJobIds[1]}`
        }
      ];

      for (const sch of seedSchedules) {
        await db.execute(sql`
          INSERT INTO schedules (candidate_id, job_id, recruiter_id, invited_at, status, interview_type, score, duration, interview_url)
          VALUES (${sch.candidateId}, ${sch.jobId}, ${recruiterId}, ${sch.invitedAt}, ${sch.status}, ${sch.interviewType}, ${sch.score}, ${sch.duration}, ${sch.interviewUrl});
        `);
      }
    }

    console.log('Database initialized successfully.');
    globalRef.dbInitialized = true;
  } catch (error) {
    console.error('Error in database initialization:', error);
  }
}
