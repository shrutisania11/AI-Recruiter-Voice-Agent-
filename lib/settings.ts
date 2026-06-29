// ── Types ──────────────────────────────────────────────────────────

export interface InterviewTypeConfig {
  questions: number;
  duration: number; // seconds per question
  enabled: boolean;
  scoringFocus: string;
}

export interface AppSettings {
  // Voice Agent
  agentName: string;
  voiceType: string;
  language: string;
  speakingRate: string;
  introMessage: string;
  outroMessage: string;
  silenceTimeout: number; // seconds before auto-submit

  // Interview configs (keyed by type name)
  interviewConfigs: Record<string, InterviewTypeConfig>;

  // Prompt / Question banks
  systemPrompt: string;
  screeningQs: string[];
  technicalQs: string[];
  hrQs: string[];

  // Automation
  autoInvite: boolean;
  autoInviteThreshold: number;
  autoSendResults: boolean;
  autoSchedule: boolean;
  autoExpireDays: string;
  autoShortlist: boolean;
  shortlistThreshold: number;

  // Notifications
  notifyOnComplete: boolean;
  notifyDailyDigest: boolean;
  notifyThreshold: boolean;
  digestTime: string;
}

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  agentName: 'Aria',
  voiceType: 'professional-female',
  language: 'en-US',
  speakingRate: 'normal',
  introMessage:
    "Hello! I'm Aria, your AI interviewer from the hiring team. Thank you so much for taking the time today. This interview will take approximately 15–30 minutes. Please speak clearly and take your time with each answer. Let's get started.",
  outroMessage:
    "Thank you for your time today! It was a pleasure learning more about you. We'll review your responses and our team will be in touch shortly. Have a wonderful day!",
  silenceTimeout: 8,

  interviewConfigs: {
    Screening: {
      questions: 5,
      duration: 60,
      enabled: true,
      scoringFocus: 'Communication, Culture Fit, Role Alignment',
    },
    'Technical Interview': {
      questions: 8,
      duration: 90,
      enabled: true,
      scoringFocus: 'Technical Depth, Problem Solving, System Design',
    },
    'HR Final Interview': {
      questions: 6,
      duration: 60,
      enabled: true,
      scoringFocus: 'Behavioural, Career Goals, Salary & Notice Period',
    },
  },

  systemPrompt:
    "You are Aria, a professional AI recruiter conducting structured interviews on behalf of a hiring team. Your tone is warm, professional, and encouraging. Ask one question at a time. Listen carefully to responses and ask clarifying follow-up questions when an answer is vague. Score each answer on communication clarity, technical accuracy, and culture alignment. Do not reveal your evaluation criteria to the candidate.",

  screeningQs: [
    'Tell me about yourself and your background.',
    'Why are you interested in this particular role?',
    'What do you consider your greatest professional strength?',
    'Describe a challenging situation at work and how you handled it.',
    "Where do you see yourself in 3–5 years?",
  ],
  technicalQs: [
    'Walk me through your experience with the core technologies listed in this role.',
    'Describe a complex system you designed or built from scratch.',
    'How do you approach debugging a production issue under pressure?',
    'What is your experience with code reviews and engineering standards?',
    'How do you handle technical debt and refactoring decisions?',
    'Describe your experience with CI/CD pipelines and deployment strategies.',
    'How do you ensure code quality and testing coverage?',
    'What architectural patterns do you prefer and why?',
  ],
  hrQs: [
    'What motivates you most in your work?',
    'How do you handle disagreements with your manager or team?',
    'Describe your ideal work environment and team culture.',
    'What is your current notice period?',
    'What are your salary expectations for this role?',
    'Do you have any questions for us about the company or this opportunity?',
  ],

  autoInvite: false,
  autoInviteThreshold: 75,
  autoSendResults: true,
  autoSchedule: false,
  autoExpireDays: '7',
  autoShortlist: true,
  shortlistThreshold: 80,

  notifyOnComplete: true,
  notifyDailyDigest: true,
  notifyThreshold: false,
  digestTime: '08:00',
};

// ── localStorage helpers ───────────────────────────────────────────

const STORAGE_KEY = 'vocalhire_settings_v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    // Deep-merge so new default keys are always present
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      interviewConfigs: {
        ...DEFAULT_SETTINGS.interviewConfigs,
        ...(parsed.interviewConfigs ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}
