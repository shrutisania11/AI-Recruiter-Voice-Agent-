import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password'),
  role: text('role').notNull().default('user'),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recruiters = pgTable('recruiters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  company: text('company').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  recruiterId: uuid('recruiter_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  skills: text('skills').notNull(),
  location: text('location').notNull(),
  experience: text('experience').notNull(),
  salary: text('salary').notNull(),
  status: text('status').notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  recruiterId: uuid('recruiter_id').references(() => users.id),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: text('role'),
  score: text('score'),
  skills: text('skills'),
  status: text('status').notNull().default('new'),
  notes: text('notes'),
  isQualified: boolean('is_qualified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const schedules = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').references(() => candidates.id),
  jobId: uuid('job_id').references(() => jobs.id),
  recruiterId: uuid('recruiter_id').references(() => users.id),
  invitedAt: text('invited_at').notNull(),
  status: text('status').notNull().default('Invited'), // Invited, In Progress, Completed, Expired
  interviewType: text('interview_type').notNull().default('Screening'), // Screening, Technical Interview, HR Final Interview
  score: integer('score'),
  duration: text('duration'),
  interviewUrl: text('interview_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

