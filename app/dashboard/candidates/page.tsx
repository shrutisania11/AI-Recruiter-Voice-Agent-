'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileUser, 
  Search, 
  Grid, 
  List as ListIcon, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  score: string;
  status: 'Qualified' | 'Scheduled' | 'Needs Review';
  email: string;
  skills: string;
  time: string;
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 0) return 'just now';
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' yr ago';
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' mo ago';
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' d ago';
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hr ago';
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' min ago';
  return 'just now';
}

const mapDbCandidate = (dbCand: any): Candidate => ({
  id: dbCand.id,
  name: dbCand.fullName,
  role: dbCand.role || 'General Position',
  score: dbCand.score || '80%',
  status: dbCand.status as any,
  email: dbCand.email || '',
  skills: dbCand.skills || 'N/A',
  time: formatTimeAgo(new Date(dbCand.createdAt))
});

// Helper functions to load external libraries for document parsing dynamically
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(pdfjs);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadMammoth = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).mammoth) {
      resolve((window as any).mammoth);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    script.onload = () => resolve((window as any).mammoth);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Mock parsed candidates list rotation to simulate AI extraction
const mockParsedCandidates = [
  { name: 'David Miller', role: 'Cloud Platform Engineer', email: 'david.miller@example.com', skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD', score: '89%' },
  { name: 'Emily Watson', role: 'Senior Frontend Lead', email: 'emily.watson@example.com', skills: 'Next.js, TailwindCSS, React Query, Webpack', score: '93%' },
  { name: 'Ryan Clark', role: 'Full Stack Engineer', email: 'ryan.clark@example.com', skills: 'Node.js, PostgreSQL, Express, React, Redis', score: '85%' },
  { name: 'Sophia Martinez', role: 'QA Automation Engineer', email: 'sophia.martinez@example.com', skills: 'Selenium, Cypress, Jest, CI/CD, Python', score: '81%' }
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 4; // 4 candidates per page so pagination activates easily for testing

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [parserIndex, setParserIndex] = React.useState(0);

  // Form Fields
  const [candidateName, setCandidateName] = React.useState('');
  const [candidateRole, setCandidateRole] = React.useState('');
  const [candidateEmail, setCandidateEmail] = React.useState('');
  const [candidateSkills, setCandidateSkills] = React.useState('');
  const [candidateScore, setCandidateScore] = React.useState('80%');
  const [candidateStatus, setCandidateStatus] = React.useState<'Qualified' | 'Scheduled' | 'Needs Review'>('Needs Review');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load from API on mount
  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCandidates(data.map(mapDbCandidate));
        }
      } catch (err) {
        console.error('Error loading candidates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter candidates by search query
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

  // Reset pagination page if filtered results count decreases
  React.useEffect(() => {
    const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCandidates, currentPage]);

  // Paginated chunk
  const paginatedCandidates = React.useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIdx, startIdx + pageSize);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;

  // Handle Resume File Upload (Simulates AI Parsing using file name data & content crawler)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    
    // Extract metadata from file name
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    // Clean up file name (replace hyphens, underscores, dots, etc.)
    let cleaned = fileNameWithoutExt
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Strip common words like 'resume', 'cv', 'profile', 'portfolio', 'final'
    const wordsToStrip = ['resume', 'cv', 'profile', 'portfolio', 'final', 'draft', 'latest', 'v1', 'v2', 'v3', '2026', '2025', '2024'];
    
    // Split cleaned name into parts
    let parts = cleaned.split(' ');
    
    // Filter out metadata keywords case-insensitively
    parts = parts.filter(p => !wordsToStrip.includes(p.toLowerCase()));
    
    // Reconstruct name and identify possible role parts
    let parsedName = 'John Doe';
    let parsedRole = 'Software Engineer';
    
    if (parts.length >= 2) {
      parsedName = parts.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      if (parts.length > 2) {
        parsedRole = parts.slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    } else if (parts.length === 1) {
      parsedName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() + ' Smith';
    }

    // Dynamic Role Deductions for skills
    const lowerRole = parsedRole.toLowerCase();
    let detectedSkills = 'React, Next.js, Node.js, TypeScript, SQL';
    
    if (lowerRole.includes('frontend') || lowerRole.includes('web') || lowerRole.includes('react') || lowerRole.includes('angular')) {
      detectedSkills = 'HTML5, CSS3, TailwindCSS, React, Next.js, TypeScript, Webpack, Jest';
    } else if (lowerRole.includes('backend') || lowerRole.includes('node') || lowerRole.includes('python') || lowerRole.includes('java')) {
      detectedSkills = 'Node.js, Express, PostgreSQL, MongoDB, Redis, REST APIs, Microservices, Jest';
    } else if (lowerRole.includes('devops') || lowerRole.includes('cloud') || lowerRole.includes('aws') || lowerRole.includes('kubernetes')) {
      detectedSkills = 'AWS, Kubernetes, Docker, Terraform, Jenkins, Linux, CI/CD pipelines, Prometheus';
    } else if (lowerRole.includes('product') || lowerRole.includes('manager') || lowerRole.includes('pm')) {
      detectedSkills = 'Product Strategy, Agile / Scrum, Jira, Roadmapping, SQL, Stakeholder Communication';
    } else if (lowerRole.includes('design') || lowerRole.includes('ux') || lowerRole.includes('ui') || lowerRole.includes('figma')) {
      detectedSkills = 'Figma, Wireframing, High-Fidelity Mockups, User Research, Design Systems, Adobe CC';
    } else if (lowerRole.includes('full') || lowerRole.includes('stack')) {
      detectedSkills = 'React, Next.js, Node.js, Express, PostgreSQL, TailwindCSS, REST APIs, Docker';
    }

    // Default Email: generate prefix from name
    const emailPrefix = parsedName.toLowerCase().replace(/\s+/g, '.');
    let parsedEmail = `${emailPrefix}@example.com`;

    // Try to extract email from the filename first
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const filenameEmailMatch = file.name.match(emailRegex);
    if (filenameEmailMatch) {
      parsedEmail = filenameEmailMatch[0];
    }

    // Generate randomized match score
    const scoreVal = Math.floor(Math.random() * (97 - 82 + 1)) + 82;
    const parsedScore = `${scoreVal}%`;

    let emailFoundFromContent = '';

    // Create a Promise to wrap PDF/DOCX/Text parsing
    const extractEmailFromContent = (): Promise<string> => {
      return new Promise((resolve) => {
        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
              resolve('');
              return;
            }

            let textContent = '';

            if (file.name.toLowerCase().endsWith('.pdf')) {
              try {
                const pdfjs = await loadPdfJs();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                let extracted = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const pageContent = await page.getTextContent();
                  const pageText = pageContent.items.map((item: any) => item.str).join(' ');
                  extracted += pageText + ' ';
                }
                textContent = extracted;
              } catch (pdfErr) {
                console.error('PDF.js parsing failed, trying text extraction:', pdfErr);
                // Fallback to text reading
                const decoder = new TextDecoder('utf-8');
                textContent = decoder.decode(arrayBuffer);
              }
            } else if (file.name.toLowerCase().endsWith('.docx')) {
              try {
                const mammoth = await loadMammoth();
                const result = await mammoth.extractRawText({ arrayBuffer });
                textContent = result.value || '';
              } catch (docxErr) {
                console.error('Mammoth DOCX parsing failed:', docxErr);
              }
            } else {
              // Standard text files
              const decoder = new TextDecoder('utf-8');
              textContent = decoder.decode(arrayBuffer);
            }

            if (textContent) {
              const contentEmailMatch = textContent.match(emailRegex);
              if (contentEmailMatch) {
                resolve(contentEmailMatch[0]);
                return;
              }
            }
          } catch (err) {
            console.warn('Error reading resume text:', err);
          }
          resolve('');
        };

        fileReader.onerror = () => resolve('');
        fileReader.readAsArrayBuffer(file);
      });
    };

    emailFoundFromContent = await extractEmailFromContent();

    // Simulate AI parsing delay of 1.5 seconds
    setTimeout(() => {
      setCandidateName(parsedName);
      setCandidateRole(parsedRole);
      
      // If we found an email inside the resume file content, use it! Otherwise fallback.
      setCandidateEmail(emailFoundFromContent || parsedEmail);
      
      setCandidateSkills(detectedSkills);
      setCandidateScore(parsedScore);
      setCandidateStatus('Qualified');
      setIsParsing(false);
    }, 1500);
  };

  // Add Candidate Submit
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateRole.trim()) return;

    const payload = {
      fullName: candidateName,
      role: candidateRole,
      email: candidateEmail || 'no-email@example.com',
      skills: candidateSkills || 'N/A',
      score: candidateScore,
      status: candidateStatus,
    };

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.id) {
        setCandidates(prev => [mapDbCandidate(data), ...prev]);
        toast.success(`Candidate "${candidateName}" saved successfully!`);
      } else {
        toast.error(data.error || 'Failed to save candidate to database.');
      }
    } catch (err: any) {
      console.error('Error saving candidate to database:', err);
      toast.error(err.message || 'An error occurred while saving the candidate.');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  // Delete Candidate
  const handleDeleteCandidate = async (id: string) => {
    try {
      const res = await fetch(`/api/candidates?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
        toast.success('Candidate deleted successfully.');
      } else {
        toast.error(data.error || 'Failed to delete candidate.');
      }
    } catch (err: any) {
      console.error('Error deleting candidate from database:', err);
      toast.error(err.message || 'An error occurred while deleting the candidate.');
    }
  };

  const resetForm = () => {
    setCandidateName('');
    setCandidateRole('');
    setCandidateEmail('');
    setCandidateSkills('');
    setCandidateScore('80%');
    setCandidateStatus('Needs Review');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 bg-zinc-950 p-6 flex flex-col min-h-0 text-slate-200">
        
        {/* Compact Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              Candidate Screening
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Manage, search, and screen recruiter candidates.</p>
          </div>
          
          <Button 
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
        </div>

        {/* Directory Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-zinc-900 mb-4">
          
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search by name, role, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-purple-500 text-white placeholder-zinc-500 pl-9 h-9 text-xs rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          </div>

          {/* Grid/List View Toggles */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-8 w-8 rounded-md p-0 ${viewMode === 'list' ? 'bg-purple-600/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 rounded-md p-0 ${viewMode === 'grid' ? 'bg-purple-600/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Blank Slate */}
        {filteredCandidates.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-xl my-4">
            <FileUser className="h-10 w-10 text-zinc-650 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No candidates found</h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-xs">
              No results match your search query. Try clearing filters or add a new candidate.
            </p>
          </div>
        )}

        {/* Directory Layout: List View */}
        {filteredCandidates.length > 0 && viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {paginatedCandidates.map((c) => (
              <Card key={c.id} className="bg-zinc-900/40 border-zinc-900 hover:border-purple-500/20 transition-colors shadow-sm">
                <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                      <FileUser className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {c.name}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-zinc-500 hover:text-purple-400" title={c.email}>
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{c.role} · <span className="text-zinc-600">Added {c.time}</span></p>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex-1 max-w-md hidden md:block">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-600 mb-1">Skills Profile</p>
                    <div className="flex flex-wrap gap-1">
                      {c.skills.split(',').map((skill, index) => (
                        <Badge key={index} className="bg-zinc-950 border-zinc-800/80 text-zinc-400 text-[9px] py-0 px-1.5 font-normal rounded-md">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Right hand controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-zinc-900 pt-2 sm:pt-0 sm:border-0">
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">AI Match</p>
                      <p className="text-xs font-black text-purple-400 mt-0.5">{c.score}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      c.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      c.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {c.status}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCandidate(c.id)}
                      className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      title="Delete Candidate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Directory Layout: Grid View */}
        {filteredCandidates.length > 0 && viewMode === 'grid' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCandidates.map((c) => (
                <Card key={c.id} className="bg-zinc-900/40 border-zinc-900 hover:border-purple-500/20 transition-colors shadow-sm flex flex-col justify-between">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                          <FileUser className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {c.name}
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="text-zinc-500 hover:text-purple-400">
                                <Mail className="h-3 w-3" />
                              </a>
                            )}
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{c.role}</p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCandidate(c.id)}
                        className="h-7 w-7 text-zinc-650 hover:text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer"
                        title="Delete Candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="border-t border-zinc-900/60 pt-2">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-600 mb-1">Skills Profile</p>
                      <div className="flex flex-wrap gap-1">
                        {c.skills.split(',').slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} className="bg-zinc-950 border-zinc-800/80 text-zinc-400 text-[9px] py-0 px-1.5 font-normal rounded-md">
                            {skill.trim()}
                          </Badge>
                        ))}
                        {c.skills.split(',').length > 3 && (
                          <Badge className="bg-zinc-950 border-zinc-800/80 text-zinc-500 text-[9px] py-0 px-1.5 font-normal rounded-md">
                            +{c.skills.split(',').length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 text-[10px]">
                      <div>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase block">Status</span>
                        <span className={`inline-block mt-0.5 font-bold uppercase text-[9px] ${
                          c.status === 'Qualified' ? 'text-emerald-400' :
                          c.status === 'Scheduled' ? 'text-blue-400' :
                          'text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase block">AI Match</span>
                        <span className="text-xs font-black text-purple-400">{c.score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Strip */}
        {filteredCandidates.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-900/80 pt-4 mt-4 shrink-0">
            <span className="text-[10px] text-zinc-500">
              Showing <span className="text-zinc-300 font-semibold">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
              <span className="text-zinc-300 font-semibold">
                {Math.min(currentPage * pageSize, filteredCandidates.length)}
              </span>{' '}
              of <span className="text-zinc-300 font-semibold">{filteredCandidates.length}</span> candidates
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 h-8 text-[11px] font-semibold text-zinc-300 rounded-lg"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 h-8 text-[11px] font-semibold text-zinc-300 rounded-lg"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Add Candidate Dialog Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="h-4.5 w-4.5" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Candidate</h3>
                </div>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 rounded-lg p-1 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                
                {/* AI Resume Upload Panel */}
                <div className="bg-zinc-950/60 border border-dashed border-zinc-800/80 rounded-xl p-4 text-center">
                  <input 
                    type="file" 
                    id="resume-file" 
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  
                  {isParsing ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <div className="h-6 w-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      <p className="text-xs text-purple-400 font-semibold animate-pulse">AI extracting resume data...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="h-6 w-6 text-purple-400 mb-2" />
                      <p className="text-xs font-bold text-zinc-300">AI Resume Parser Autocomplete</p>
                      <p className="text-[10px] text-zinc-500 mt-1 mb-3">Upload candidate resume (.pdf, .docx) to auto-fill form details</p>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-300 font-semibold text-[10px] px-3.5 h-8 rounded-lg cursor-pointer"
                      >
                        Upload Resume File
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800/60" />
                  </div>
                  <span className="relative px-3 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Or Manual Entry</span>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="modal-name" className="text-[9px] uppercase font-bold text-zinc-400">Full Name *</label>
                      <Input
                        id="modal-name"
                        type="text"
                        placeholder="John Smith"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="modal-role" className="text-[9px] uppercase font-bold text-zinc-400">Target Role *</label>
                      <Input
                        id="modal-role"
                        type="text"
                        placeholder="Senior Software Engineer"
                        value={candidateRole}
                        onChange={(e) => setCandidateRole(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="modal-email" className="text-[9px] uppercase font-bold text-zinc-400">Email Address</label>
                      <Input
                        id="modal-email"
                        type="email"
                        placeholder="john.smith@example.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="modal-score" className="text-[9px] uppercase font-bold text-zinc-400">AI Match Score (%)</label>
                      <Input
                        id="modal-score"
                        type="text"
                        placeholder="e.g. 88%"
                        value={candidateScore}
                        onChange={(e) => setCandidateScore(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="modal-skills" className="text-[9px] uppercase font-bold text-zinc-400">Key Skills Profile</label>
                    <Input
                      id="modal-skills"
                      type="text"
                      placeholder="React, Redux, Node.js, Express (comma-separated)"
                      value={candidateSkills}
                      onChange={(e) => setCandidateSkills(e.target.value)}
                      className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-700 h-9 text-xs rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="modal-status" className="text-[9px] uppercase font-bold text-zinc-400">Initial Screening Status</label>
                    <select
                      id="modal-status"
                      value={candidateStatus}
                      onChange={(e) => setCandidateStatus(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:ring-1 focus:ring-purple-500 outline-none text-white h-9 px-3 text-xs rounded-lg cursor-pointer"
                    >
                      <option value="Needs Review">Needs Review</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>

                  {/* Modal Footer Controls */}
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
                      disabled={!candidateName.trim() || !candidateRole.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 h-9 rounded-lg cursor-pointer border-0 shadow-lg shadow-purple-500/10 active:scale-[0.98]"
                    >
                      Save Candidate
                    </Button>
                  </div>
                </form>

              </div>

            </div>
          </div>
        )}

      </main>
    </>
  );
}
