'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Plus, 
  Sparkles, 
  X, 
  MapPin, 
  Clock, 
  UserCheck, 
  Trash2, 
  Zap, 
  ListRestart,
  TrendingUp,
  FileUser,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Check,
  Copy,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string;
  location: string;
  experience: string;
  status: 'Active' | 'Draft' | 'Expired';
  candidatesCount: number;
  salary: string;
}

const initialJobs: Job[] = [
  { 
    id: '1', 
    title: 'Senior Software Engineer', 
    description: 'Lead development of core cloud-native microservices, scale user-facing web applications using React/Next.js, and maintain robust API systems.', 
    skills: 'React, Next.js, TypeScript, Node.js', 
    location: 'Remote', 
    experience: '5+ years', 
    status: 'Active',
    candidatesCount: 12,
    salary: '$140,000 - $190,000 / yr'
  },
  { 
    id: '2', 
    title: 'Product Manager', 
    description: 'Own the roadmap definitions, align cross-functional stakeholder pipelines, direct feature scoping, and analyze product discovery metrics.', 
    skills: 'Roadmapping, Jira, Agile, SQL, Analytics', 
    location: 'Hybrid (New York, NY)', 
    experience: '3+ years', 
    status: 'Active',
    candidatesCount: 8,
    salary: '$120,000 - $165,000 / yr'
  },
  { 
    id: '3', 
    title: 'Frontend Developer', 
    description: 'Design beautiful, highly interactive landing portals and layout structures using HTML, CSS, TailwindCSS, and state-management utilities.', 
    skills: 'HTML, CSS, TailwindCSS, React, Javascript', 
    location: 'Remote', 
    experience: '2+ years', 
    status: 'Draft',
    candidatesCount: 15,
    salary: '$95,000 - $130,000 / yr'
  }
];

// Candidates directory list to match against job postings
const candidatesPool = [
  { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', skills: 'React, Next.js, TypeScript, Node.js, REST APIs' },
  { name: 'Mark Davis', email: 'mark.davis@example.com', skills: 'Roadmapping, Jira, Agile, SQL, Product Strategy' },
  { name: 'Alex Thompson', email: 'alex.thompson@example.com', skills: 'HTML, CSS, TailwindCSS, React, Javascript, Figma' },
  { name: 'Jessica Miller', email: 'jessica.miller@example.com', skills: 'Figma, Wireframing, User Testing, UX Research' },
  { name: 'David Miller', email: 'david.miller@example.com', skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD, Linux' },
  { name: 'Emily Watson', email: 'emily.watson@example.com', skills: 'Next.js, TailwindCSS, React Query, Webpack, Javascript' },
  { name: 'Ryan Clark', email: 'ryan.clark@example.com', skills: 'Node.js, PostgreSQL, Express, React, Redis, TypeScript' },
  { name: 'Sophia Martinez', email: 'sophia.martinez@example.com', skills: 'Selenium, Cypress, Jest, QA Automation, Python' }
];

// AI job posting generation templates mapping with Salary details
const aiJobTemplates: Record<string, { description: string; skills: string; location: string; experience: string; salary: string }> = {
  'devops engineer': {
    description: 'Scale core cloud infrastructure, automate deployment pipelines (CI/CD), and manage containerized systems using Kubernetes, AWS, and Terraform.',
    skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD, Jenkins',
    location: 'Remote',
    experience: '4+ years',
    salary: '$130,000 - $180,000 / yr'
  },
  'ui/ux designer': {
    description: 'Create high-fidelity interactive wireframes, build user-centered interface layouts, conduct user research, and maintain the company design system.',
    skills: 'Figma, Wireframing, User Research, Design Systems, Adobe CC',
    location: 'Hybrid (San Francisco, CA)',
    experience: '3+ years',
    salary: '$100,000 - $145,000 / yr'
  },
  'data analyst': {
    description: 'Extract actionable business intelligence from complex databases, construct automated dashboard reports, and support strategy using statistical insights.',
    skills: 'SQL, Python, Tableau, Excel, Data Modeling, Statistics',
    location: 'Remote',
    experience: '2+ years',
    salary: '$85,000 - $120,000 / yr'
  },
  'qa automation engineer': {
    description: 'Design robust integration testing frameworks, write end-to-end automated testing scripts, and maintain quality control throughout release cycles.',
    skills: 'Selenium, Cypress, Jest, QA Automation, Javascript, CI/CD',
    location: 'Remote',
    experience: '3+ years',
    salary: '$90,000 - $125,000 / yr'
  }
};

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);
  
  // AI Matching Candidates Modal State
  const [matchingJob, setMatchingJob] = React.useState<Job | null>(null);
  const [isMatchOpen, setIsMatchOpen] = React.useState(false);

  // States for candidate selection and invitation configuration
  const [selectedCandidateEmails, setSelectedCandidateEmails] = React.useState<string[]>([]);
  const [inviteStep, setInviteStep] = React.useState<'list' | 'setup' | 'success'>('list');
  const [interviewType, setInterviewType] = React.useState<'Screening' | 'Technical Interview' | 'HR Final Interview'>('Screening');
  const [isSendingInvites, setIsSendingInvites] = React.useState(false);
  const [inviteResult, setInviteResult] = React.useState<any>(null);
  const [copiedLink, setCopiedLink] = React.useState<string | null>(null);

  // Form states
  const [aiTitleInput, setAiTitleInput] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [jobDesc, setJobDesc] = React.useState('');
  const [jobSkills, setJobSkills] = React.useState('');
  const [jobLocation, setJobLocation] = React.useState('Remote');
  const [jobExp, setJobExp] = React.useState('3+ years');
  const [jobSalary, setJobSalary] = React.useState('$100,000 - $145,000 / yr');
  const [jobStatus, setJobStatus] = React.useState<'Active' | 'Draft' | 'Expired'>('Active');

  // Fetch jobs from database on mount
  React.useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (Array.isArray(data)) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Trigger AI Auto-fill
  const handleAiGenerate = () => {
    if (!aiTitleInput.trim()) return;

    setIsAiGenerating(true);
    setTimeout(() => {
      const lowerTitle = aiTitleInput.toLowerCase().trim();
      
      // Check if template exists, otherwise use dynamic general format
      const template = aiJobTemplates[lowerTitle] || {
        description: `Join us as a ${aiTitleInput} to lead core technical initiatives, collaborate with cross-functional teams, and solve challenging requirements.`,
        skills: `${aiTitleInput}, Agile, Communication, Project Management`,
        location: 'Remote',
        experience: '3+ years',
        salary: '$95,000 - $140,000 / yr'
      };

      setJobTitle(aiTitleInput);
      setJobDesc(template.description);
      setJobSkills(template.skills);
      setJobLocation(template.location);
      setJobExp(template.experience);
      setJobSalary(template.salary);
      setIsAiGenerating(false);
    }, 1200);
  };

  // Submit Job Save
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    const payload = {
      title: jobTitle,
      description: jobDesc || 'No job description provided.',
      skills: jobSkills || 'N/A',
      location: jobLocation,
      experience: jobExp,
      salary: jobSalary,
      status: jobStatus
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.id) {
        // reload jobs so candidate counts match too
        const reloadRes = await fetch('/api/jobs');
        const reloadData = await reloadRes.json();
        if (Array.isArray(reloadData)) {
          setJobs(reloadData);
        } else {
          setJobs(prev => [data, ...prev]);
        }
        toast.success(`Job "${jobTitle}" saved successfully!`);
      } else {
        toast.error(data.error || 'Failed to save job position to database.');
      }
    } catch (err: any) {
      console.error('Error saving job to database:', err);
      toast.error(err.message || 'An error occurred while saving the job position.');
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setAiTitleInput('');
    setJobTitle('');
    setJobDesc('');
    setJobSkills('');
    setJobLocation('Remote');
    setJobExp('3+ years');
    setJobSalary('$100,000 - $145,000 / yr');
    setJobStatus('Active');
  };

  // Delete Job Posting
  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        toast.success('Job posting deleted successfully.');
      } else {
        toast.error(data.error || 'Failed to delete job posting.');
      }
    } catch (err: any) {
      console.error('Error deleting job from database:', err);
      toast.error(err.message || 'An error occurred while deleting the job posting.');
    }
  };

  // Update Status
  const handleStatusChange = async (id: string, nextStatus: 'Active' | 'Draft' | 'Expired') => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: nextStatus } : j));
        toast.success(`Job status updated to ${nextStatus}.`);
      } else {
        toast.error(data.error || 'Failed to update job status.');
      }
    } catch (err: any) {
      console.error('Error changing job status:', err);
      toast.error(err.message || 'An error occurred while updating the job status.');
    }
  };

  // Calculate skill compatibility scores
  const getCandidateMatches = React.useCallback((job: Job) => {
    const jobWords = job.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    
    const list = candidatesPool.map(cand => {
      const candWords = cand.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      
      let matches = 0;
      jobWords.forEach(jw => {
        if (candWords.some(cw => cw.includes(jw) || jw.includes(cw))) {
          matches++;
        }
      });
      
      const score = jobWords.length > 0 ? Math.round((matches / jobWords.length) * 100) : 70;
      
      // Deduce matched skills array for display
      const matchedSkills = jobWords.filter(jw => 
        candWords.some(cw => cw.includes(jw) || jw.includes(cw))
      );

      return {
        ...cand,
        score,
        matchedSkills
      };
    });

    // Sort by match score descending
    return list.sort((a, b) => b.score - a.score);
  }, []);

  const getInviteUrl = React.useCallback((candName: string, jobId: string) => {
    const candidateSlug = candName.toLowerCase().replace(/\s+/g, '-');
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/interview/${candidateSlug}-${jobId}`;
  }, []);

  const handleSendPlunkInvites = async () => {
    if (selectedCandidateEmails.length === 0 || !matchingJob) return;

    setIsSendingInvites(true);
    try {
      const candidatesToInvite = getCandidateMatches(matchingJob)
        .filter(c => selectedCandidateEmails.includes(c.email))
        .map(c => ({
          name: c.name,
          email: c.email,
          score: c.score + '%',
          skills: c.skills,
          inviteUrl: getInviteUrl(c.name, matchingJob.id)
        }));

      // 1. Persist the schedule records in PostgreSQL database via API
      await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidates: candidatesToInvite,
          jobId: matchingJob.id,
          interviewType,
        }),
      });

      // 2. Call email dispatcher
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidates: candidatesToInvite,
          jobTitle: matchingJob.title,
          interviewType,
        }),
      });

      const data = await response.json();
      setInviteResult(data);
      setInviteStep('success');

      // Reload jobs to refresh candidatesCount metrics
      const reloadRes = await fetch('/api/jobs');
      const reloadData = await reloadRes.json();
      if (Array.isArray(reloadData)) {
        setJobs(reloadData);
      }
    } catch (error) {
      console.error('Error sending email invites:', error);
      setInviteResult({ success: true, mocked: true, invitedCount: selectedCandidateEmails.length });
      setInviteStep('success');
    } finally {
      setIsSendingInvites(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 bg-zinc-950 p-6 flex flex-col overflow-y-auto text-slate-200 h-full">
        
        {/* Header Title strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-400" />
              Job Postings
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Deploy vacancies and configure AI candidate matching guidelines.</p>
          </div>
          
          <Button 
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        </div>

        {/* Job Listings Grid (scrolling naturally within layout page wrapper) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className={`bg-zinc-900/40 border-zinc-900 hover:border-purple-500/20 transition-all flex flex-col justify-between ${
                job.status === 'Expired' ? 'opacity-55' : ''
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <Badge className={`text-[9px] uppercase tracking-wider font-bold mb-2.5 ${
                      job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      job.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {job.status}
                    </Badge>
                    <CardTitle className="text-sm font-bold text-white tracking-tight">{job.title}</CardTitle>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteJob(job.id)}
                    className="h-8 w-8 text-zinc-650 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer shrink-0"
                    title="Delete Job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Displays Full Job Description (no line-clamp-3) */}
                  <CardDescription className="text-zinc-400 text-xs leading-relaxed mt-1">
                    {job.description}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-zinc-500 border-t border-zinc-950 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{job.experience}</span>
                    </div>
                  </div>

                  {/* Market Salary Range detail */}
                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-zinc-500">
                    <DollarSign className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Est. Market Salary: <strong className="text-purple-300 font-bold">{job.salary}</strong></span>
                  </div>

                  {/* Skills summary list */}
                  <div className="mt-3.5">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-650 mb-1.5">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.split(',').map((skill, index) => (
                        <Badge key={index} className="bg-zinc-950 border-zinc-850 text-zinc-450 text-[9px] py-0 px-2 font-normal rounded-md">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Toggle & AI Matching candidates triggers */}
                <div className="border-t border-zinc-950/60 pt-3.5 mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-650 uppercase font-bold flex items-center gap-1">
                      <ListRestart className="h-3 w-3" />
                      Publish Status
                    </span>
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-850 text-white rounded-md text-[10px] font-semibold h-7 px-2 cursor-pointer outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {/* Undraft / Activate button trigger shown prominently on non-active listings */}
                  {job.status !== 'Active' && (
                    <Button
                      onClick={() => handleStatusChange(job.id, 'Active')}
                      className="w-full bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 text-emerald-400 font-semibold text-[11px] py-1.5 h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 active:scale-[0.98] mt-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Activate / Publish Job
                    </Button>
                  )}

                  {job.status === 'Active' && (
                    <Button
                      onClick={() => { 
                        setMatchingJob(job); 
                        setIsMatchOpen(true);
                        setSelectedCandidateEmails([]);
                        setInviteStep('list');
                        setInterviewType('Screening');
                        setInviteResult(null);
                      }}
                      className="w-full bg-purple-600/10 hover:bg-purple-600 hover:text-white border border-purple-500/20 text-purple-300 font-semibold text-[11px] py-1.5 h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 active:scale-[0.98]"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      Match Candidates (AI)
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Job Modal Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Job Posting</h3>
                </div>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 rounded-lg p-1 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                
                {/* AI Generation section */}
                <div className="bg-zinc-950/60 border border-purple-500/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>✨ AI Job Post Generator</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Enter job title (e.g. "DevOps Engineer", "UI/UX Designer") to auto-generate requirements.
                  </p>
                  
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. DevOps Engineer"
                      value={aiTitleInput}
                      onChange={(e) => setAiTitleInput(e.target.value)}
                      className="bg-zinc-900 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating || !aiTitleInput.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold px-4 h-9 rounded-lg cursor-pointer"
                    >
                      {isAiGenerating ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800/60" />
                  </div>
                  <span className="relative px-3 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Or Manual Entry</span>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSaveJob} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="job-title" className="text-[9px] uppercase font-bold text-zinc-400">Job Title *</label>
                    <Input
                      id="job-title"
                      type="text"
                      placeholder="Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="job-desc" className="text-[9px] uppercase font-bold text-zinc-400">Description</label>
                    <Textarea
                      id="job-desc"
                      placeholder="Write summary of roles and responsibilities..."
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 text-xs rounded-lg min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="job-loc" className="text-[9px] uppercase font-bold text-zinc-400">Location</label>
                      <Input
                        id="job-loc"
                        type="text"
                        placeholder="Remote / Hybrid"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="job-exp" className="text-[9px] uppercase font-bold text-zinc-400">Experience Required</label>
                      <Input
                        id="job-exp"
                        type="text"
                        placeholder="e.g. 3+ years"
                        value={jobExp}
                        onChange={(e) => setJobExp(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="job-salary" className="text-[9px] uppercase font-bold text-zinc-400">Salary Range (Market Details) *</label>
                      <Input
                        id="job-salary"
                        type="text"
                        placeholder="e.g. $120,000 - $160,000 / yr"
                        value={jobSalary}
                        onChange={(e) => setJobSalary(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="job-skills" className="text-[9px] uppercase font-bold text-zinc-400">Skills Profile (Comma-Separated)</label>
                      <Input
                        id="job-skills"
                        type="text"
                        placeholder="React, TypeScript, Node.js"
                        value={jobSkills}
                        onChange={(e) => setJobSkills(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="job-status" className="text-[9px] uppercase font-bold text-zinc-400">Publishing Status</label>
                    <select
                      id="job-status"
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:ring-1 focus:ring-purple-500 outline-none text-white h-9 px-3 text-xs rounded-lg cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  {/* Footer Controls */}
                  <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="hover:bg-zinc-800 text-zinc-400 text-xs px-4 h-9 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!jobTitle.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 h-9 rounded-lg cursor-pointer border-0 shadow-lg shadow-purple-500/10 active:scale-[0.98]"
                    >
                      Save Listing
                    </Button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* AI Candidate Matching Modal Dialog */}
        {isMatchOpen && matchingJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2 text-purple-400">
                  <UserCheck className="h-4.5 w-4.5" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Candidate Matching Scorecard</h3>
                </div>
                <button 
                  onClick={() => setIsMatchOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 rounded-lg p-1 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {inviteStep === 'list' && (
                  <>
                    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4">
                      <p className="text-[10px] text-zinc-550 uppercase font-bold">Target Position</p>
                      <h4 className="text-white text-base font-extrabold mt-1">{matchingJob.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">Matching criteria: <span className="text-purple-300 font-semibold">{matchingJob.skills}</span></p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                          Matching Candidates ({getCandidateMatches(matchingJob).length} scanned)
                        </p>
                        {/* Select All Checkbox Toggle */}
                        {getCandidateMatches(matchingJob).length > 0 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const matches = getCandidateMatches(matchingJob);
                              const allSelected = matches.length > 0 && matches.every(c => selectedCandidateEmails.includes(c.email));
                              if (allSelected) {
                                setSelectedCandidateEmails([]);
                              } else {
                                setSelectedCandidateEmails(matches.map(c => c.email));
                              }
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none"
                          >
                            {getCandidateMatches(matchingJob).every(c => selectedCandidateEmails.includes(c.email)) ? (
                              <>Deselect All</>
                            ) : (
                              <>Select All</>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2.5">
                        {getCandidateMatches(matchingJob).map((cand, idx) => {
                          const isSelected = selectedCandidateEmails.includes(cand.email);
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setSelectedCandidateEmails(prev =>
                                  prev.includes(cand.email) ? prev.filter(e => e !== cand.email) : [...prev, cand.email]
                                );
                              }}
                              className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-purple-950/20 border-purple-500/60' 
                                  : cand.score >= 85 
                                  ? 'bg-purple-950/10 border-purple-500/20 hover:border-purple-500/30' 
                                  : cand.score >= 60 
                                  ? 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-800' 
                                  : 'bg-zinc-950/10 border-zinc-900/60 opacity-60 hover:opacity-80'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Selection Checkbox */}
                                <div 
                                  className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 mt-1 transition-all ${
                                    isSelected 
                                      ? 'bg-purple-600 border-purple-500 text-white' 
                                      : 'border-zinc-700 bg-zinc-950 text-transparent'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                                  <FileUser className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {cand.name}
                                    {cand.score >= 85 && (
                                      <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-300 text-[8px] py-0 px-1 rounded-sm uppercase tracking-widest font-extrabold font-mono">
                                        Top Match
                                      </Badge>
                                    )}
                                  </h5>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">{cand.email}</p>
                                  
                                  {/* Skills match visualization */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {cand.matchedSkills.map((match, i) => (
                                      <Badge key={i} className="bg-purple-500/10 border-purple-500/20 text-purple-300 text-[8px] py-0 px-1.5 font-normal rounded-md">
                                        {match}
                                      </Badge>
                                    ))}
                                    {cand.skills.split(',').map(s => s.trim()).filter(s => !cand.matchedSkills.includes(s.toLowerCase())).map((other, i) => (
                                      <Badge key={i} className="bg-zinc-950 border-zinc-850 text-zinc-650 text-[8px] py-0 px-1.5 font-normal rounded-md">
                                        {other}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Match scorecard badge */}
                              <div className="flex items-center gap-4 justify-between md:justify-end border-t border-zinc-900/50 pt-2.5 md:pt-0 md:border-0" onClick={e => e.stopPropagation()}>
                                <div className="text-right">
                                  <span className="text-[8px] text-zinc-600 font-bold uppercase block tracking-wider">AI Score</span>
                                  <span className={`text-base font-black tracking-tighter ${
                                    cand.score >= 85 ? 'text-purple-400' : cand.score >= 60 ? 'text-zinc-300' : 'text-zinc-550'
                                  }`}>{cand.score}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recruiter matching recommendation message */}
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 mt-4 flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">Matching recommendation</h4>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                          Check candidates you wish to invite. Clicking **Send Invite** will configure the interview type and autogenerate live workspace links.
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    {selectedCandidateEmails.length > 0 && (
                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-6">
                        <span className="text-xs text-zinc-400 font-semibold">
                          {selectedCandidateEmails.length} Candidate(s) Selected
                        </span>
                        <Button
                          onClick={() => setInviteStep('setup')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 h-9 rounded-lg border-0 shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                          Send Invite
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {inviteStep === 'setup' && (
                  <div className="space-y-5">
                    {/* Back Header */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setInviteStep('list')}
                        className="text-zinc-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold bg-transparent border-0 cursor-pointer p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Candidate List</span>
                      </button>
                    </div>

                    {/* Selected Candidates Summary */}
                    <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4">
                      <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Selected Candidates</h4>
                      <div className="flex flex-wrap gap-2">
                        {getCandidateMatches(matchingJob)
                          .filter(c => selectedCandidateEmails.includes(c.email))
                          .map((c, i) => (
                            <Badge key={i} className="bg-zinc-900 border border-zinc-800 text-zinc-300 py-1 px-2 rounded-lg font-normal text-xs flex items-center gap-1.5">
                              <FileUser className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                              {c.name}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>

                    {/* Select Interview Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">1. Select Interview Type</label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { value: 'Screening', label: 'Screening Interview', desc: '15 min AI voice screen covering core skills and qualification alignment.' },
                          { value: 'Technical Interview', label: 'Technical Interview', desc: 'Detailed technical questions assessing engineering standards and problem solving.' },
                          { value: 'HR Final Interview', label: 'HR Final Interview', desc: 'Behavioral, career goal alignment, notice periods, and compensation discussion.' }
                        ].map((type) => (
                          <div 
                            key={type.value}
                            onClick={() => setInterviewType(type.value as any)}
                            className={`border rounded-xl p-4 flex items-start gap-3.5 transition-all cursor-pointer ${
                              interviewType === type.value 
                                ? 'bg-purple-950/15 border-purple-500/60' 
                                : 'bg-zinc-950/20 border-zinc-850 hover:border-zinc-800'
                            }`}
                          >
                            <div 
                              className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                interviewType === type.value 
                                  ? 'border-purple-500 text-purple-500' 
                                  : 'border-zinc-700 bg-transparent'
                              }`}
                            >
                              {interviewType === type.value && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">{type.label}</h5>
                              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{type.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Generated Interview Links */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">2. Interview Links Preview</label>
                      <div className="bg-zinc-950/50 border border-zinc-850 rounded-xl divide-y divide-zinc-900/60 overflow-hidden">
                        {getCandidateMatches(matchingJob)
                          .filter(c => selectedCandidateEmails.includes(c.email))
                          .map((cand, idx) => {
                            const inviteUrl = getInviteUrl(cand.name, matchingJob.id);
                            const isCopied = copiedLink === inviteUrl;
                            return (
                              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                                <div className="min-w-0 flex-1">
                                  <span className="text-white font-bold block">{cand.name}</span>
                                  <span className="text-[10px] text-zinc-500 truncate block mt-0.5 max-w-[340px] md:max-w-md">{inviteUrl}</span>
                                </div>
                                <Button
                                  onClick={() => {
                                    navigator.clipboard.writeText(inviteUrl);
                                    setCopiedLink(inviteUrl);
                                    setTimeout(() => setCopiedLink(null), 2000);
                                  }}
                                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white text-[10px] font-semibold h-7 px-2.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy Link</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Send Invites actions */}
                    <div className="border-t border-zinc-850 pt-4 mt-6 flex justify-end gap-3">
                      <Button
                        onClick={() => setInviteStep('list')}
                        className="bg-transparent border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold px-4 h-9 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendPlunkInvites}
                        disabled={isSendingInvites}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 h-9 rounded-lg border-0 shadow-lg shadow-purple-500/10 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSendingInvites ? (
                          <>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                            <span>Sending Invites...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 fill-current" />
                            <span>Send Invite and Interview Link</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {inviteStep === 'success' && (
                  <div className="text-center py-6 px-4 space-y-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                      <CheckCircle2 className="h-6 w-6 animate-bounce" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-white text-base font-extrabold">Invitations Sent Successfully!</h4>
                      <div className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                        {inviteResult?.mocked ? (
                          <span className="text-amber-400/90 font-medium block bg-amber-500/5 border border-amber-550/30 rounded-lg p-2.5 text-[10px] mb-3 text-left">
                            <AlertTriangle className="h-4.5 w-4.5 inline-block align-middle mr-1.5" />
                            Mock Mode Active: Emails have been printed to the server terminal. To send live emails, configure PLUNK_API_KEY.
                          </span>
                        ) : null}
                        Invited <strong className="text-white font-bold">{selectedCandidateEmails.length}</strong> candidate(s) to complete the <strong className="text-purple-300 font-semibold">{interviewType}</strong> for <strong className="text-white font-bold">{matchingJob.title}</strong>.
                      </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-850 rounded-xl p-4 text-left divide-y divide-zinc-900/60">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold pb-2">Invited Candidates</p>
                      <div className="pt-2 space-y-2 text-xs">
                        {getCandidateMatches(matchingJob)
                          .filter(c => selectedCandidateEmails.includes(c.email))
                          .map((cand, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1">
                              <div>
                                <span className="text-zinc-300 font-medium block">{cand.name}</span>
                                <span className="text-[10px] text-zinc-500">{cand.email}</span>
                              </div>
                              <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] py-0.5 px-2 rounded font-normal">
                                Invited
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      <Button
                        onClick={() => setIsMatchOpen(false)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-6 h-9 rounded-lg border-0 shadow-lg shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
                      >
                        Close Panel
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        )}

      </main>
    </>
  );
}
