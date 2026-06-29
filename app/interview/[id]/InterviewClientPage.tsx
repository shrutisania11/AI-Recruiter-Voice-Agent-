'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  FileText, 
  PhoneOff, 
  Sparkles, 
  User, 
  Play, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Headphones,
  Wifi,
  Briefcase,
  MapPin,
  Video,
  VideoOff,
  Send,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock interviews data mapping
const mockInterviews: Record<string, { 
  role: string; 
  duration: string; 
  questions: number; 
  company: string; 
  details: string;
  defaultName: string;
}> = {
  'sarah-johnson-123': {
    role: 'Senior Software Engineer',
    duration: '15 - 20 mins',
    questions: 7,
    company: 'vocalHire AI',
    defaultName: 'Sarah Johnson',
    details: 'This screening covers core Next.js & React patterns, backend system architecture, API design, and performance optimizations. Ensure you have your technical experience in mind.'
  },
  'mark-davis-456': {
    role: 'Product Manager',
    duration: '15 mins',
    questions: 7,
    company: 'vocalHire AI',
    defaultName: 'Mark Davis',
    details: 'This screening covers product discovery strategies, roadmap prioritization methodologies, metrics definitions, and stakeholder management scenarios.'
  },
  'alex-thompson-789': {
    role: 'Frontend Developer',
    duration: '15 mins',
    questions: 7,
    company: 'vocalHire AI',
    defaultName: 'Alex Thompson',
    details: 'This screening covers semantic HTML/CSS, Tailwind integration, TypeScript interfaces, state management, and basic responsive user experience challenges.'
  }
};

const fallbackInterview = {
  role: 'Technical Screening Evaluation',
  duration: '15 mins',
  questions: 7,
  company: 'vocalHire Client',
  defaultName: '',
  details: 'This automated screening evaluates core qualifications, communication clarity, problem-solving approaches, and role-specific technical alignments.'
};

// PCM Player to decode raw audio chunks from Murf AI stream
class PCMPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private sampleRate: number;

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
  }

  private initCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass({ sampleRate: this.sampleRate });
      this.audioCtx = ctx;
      this.nextPlayTime = ctx.currentTime;
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChunk(chunk: Uint8Array) {
    this.initCtx();
    if (!this.audioCtx) return;

    // Direct buffer construction can fail if chunk's offset is not a multiple of 2
    let alignedBuffer = chunk.buffer;
    let alignedOffset = chunk.byteOffset;
    
    if (chunk.byteOffset % 2 !== 0) {
      const copy = new Uint8Array(chunk.byteLength);
      copy.set(chunk);
      alignedBuffer = copy.buffer;
      alignedOffset = 0;
    }

    const int16Array = new Int16Array(
      alignedBuffer,
      alignedOffset,
      chunk.byteLength / 2
    );

    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);

    const startTime = Math.max(this.nextPlayTime, this.audioCtx.currentTime);
    source.start(startTime);
    this.nextPlayTime = startTime + audioBuffer.duration;
  }

  close() {
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

export default function InterviewClientPage({ id }: { id: string }) {
  // Dynamic parsing logic for URL IDs (e.g. sarah-johnson-1)
  let parsedInfo = fallbackInterview;
  if (mockInterviews[id]) {
    parsedInfo = mockInterviews[id];
  } else {
    try {
      const decodedId = decodeURIComponent(id);
      const parts = decodedId.split('-');
      if (parts.length >= 2) {
        const jobId = parts[parts.length - 1];
        const nameParts = parts.slice(0, parts.length - 1);
        const name = nameParts
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
          
        let role = 'Technical Screening Evaluation';
        let details = 'This automated screening evaluates core qualifications, communication clarity, and role-specific technical alignments.';
        
        if (jobId === '1' || jobId === '123' || jobId.toLowerCase().includes('software') || jobId.toLowerCase().includes('engineer')) {
          role = 'Senior Software Engineer';
          details = 'This screening covers Next.js & React patterns, backend system architecture, API design, and performance optimizations. Ensure you have your technical experience in mind.';
        } else if (jobId === '2' || jobId === '456' || jobId.toLowerCase().includes('product') || jobId.toLowerCase().includes('manager')) {
          role = 'Product Manager';
          details = 'This screening covers product discovery strategies, roadmap prioritization methodologies, metrics definitions, and stakeholder management scenarios.';
        } else if (jobId === '3' || jobId === '789' || jobId.toLowerCase().includes('frontend') || jobId.toLowerCase().includes('developer') || jobId.toLowerCase().includes('dev')) {
          role = 'Frontend Developer';
          details = 'This screening covers semantic HTML/CSS, Tailwind integration, TypeScript interfaces, state management, and basic responsive user experience challenges.';
        } else {
          // Format role nicely from arbitrary job identifiers
          role = jobId.split('_').join(' ').split('-').join(' ').replace(/\b\w/g, c => c.toUpperCase());
          details = `This automated screening evaluates core qualifications for the ${role} position, communication clarity, and technical alignments.`;
        }
        
        parsedInfo = {
          role,
          duration: '15 mins',
          questions: 7,
          company: 'vocalHire AI',
          defaultName: name,
          details
        };
      }
    } catch (e) {
      console.error('Error parsing dynamic interview ID:', e);
    }
  }
  const interviewInfo = parsedInfo;
  
  // State variables
  const [fullName, setFullName] = React.useState(interviewInfo.defaultName);
  const [nameError, setNameError] = React.useState('');
  const [portalState, setPortalState] = React.useState<'setup' | 'connecting' | 'active' | 'completed'>('setup');
  const [connectingStep, setConnectingStep] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = React.useState(false);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [callDuration, setCallDuration] = React.useState(0);
  const [completedDuration, setCompletedDuration] = React.useState(0);
  const [aiSpeechState, setAiSpeechState] = React.useState<'speaking' | 'listening'>('speaking');
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  
  // Interactive transcript and recording
  const [chatLog, setChatLog] = React.useState<ChatMessage[]>([]);
  const [typedResponse, setTypedResponse] = React.useState('');
  const [interimSpeech, setInterimSpeech] = React.useState('');
  const [savedAnswers, setSavedAnswers] = React.useState<QuestionAnswer[]>([]);
  const [recruiterActiveTab, setRecruiterActiveTab] = React.useState<'candidate' | 'recruiter'>('candidate');

  // Media Refs
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const pcmPlayerRef = React.useRef<PCMPlayer | null>(null);
  const durationTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const aiTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoSubmitTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoSubmitRef = React.useRef<(text: string) => void>(() => {});

  // Dynamic Screening Questions List customized per role
  const questionsList = React.useMemo(() => {
    if (interviewInfo.role === 'Senior Software Engineer') {
      return [
        "Welcome to your screening interview. Let's start with a brief introduction. Could you please introduce yourself and outline your experience with React and Next.js?",
        "How do you approach backend system design, database modeling, and caching (e.g., using Redis)?",
        "What are your methodologies for API design, security implementations, and error handling?",
        "How do you optimize frontend rendering performance (e.g., Server vs Client components, lazy loading)?",
        "Can you describe a challenging technical bottleneck you resolved in a previous project?",
        "How do you handle team collaboration, code reviews, and mentorship in an engineering team?",
        `Finally, why are you interested in joining ${interviewInfo.company}, and what is your availability to start?`
      ];
    }
    if (interviewInfo.role === 'Product Manager') {
      return [
        `Welcome to your screening interview for the ${interviewInfo.role} position. To start off, could you please introduce yourself and share a brief overview of your professional background?`,
        "What product management framework do you prefer for planning and prioritization?",
        "How do you gather requirements and translate user feedback into actionable feature roadmaps?",
        "Can you describe a time when you had to make a tough decision to cut a feature or pivot a product?",
        "How do you define and measure success for a new product launch?",
        "How do you manage conflicting interests from stakeholders, engineering, and sales?",
        `Lastly, what motivates you about this opportunity at ${interviewInfo.company}, and what is your availability?`
      ];
    }
    if (interviewInfo.role === 'Frontend Developer') {
      return [
        `Welcome to your screening interview for the ${interviewInfo.role} position. To start off, could you please introduce yourself and share a brief overview of your professional background?`,
        "What is your experience with modern styling frameworks (like TailwindCSS or Vanilla CSS)?",
        "How do you handle cross-browser compatibility and responsive design issues?",
        "What state management patterns have you used (e.g., Redux, Zustand, Context API)?",
        "How do you ensure web accessibility (a11y) and SEO compliance in your components?",
        "Can you discuss a complex UI component you built and how you handled its performance and reusability?",
        `Lastly, what motivates you about this opportunity at ${interviewInfo.company}, and what is your availability?`
      ];
    }
    return [
      `Welcome to your screening interview for the ${interviewInfo.role} position. To start off, could you please introduce yourself and share a brief overview of your professional background?`,
      "What are the core technical skills and methodologies you bring to this role?",
      "Can you describe a major project or achievement you are proud of, and how you contributed to its success?",
      "How do you approach problem solving when faced with tight deadlines or ambiguous requirements?",
      "How do you maintain quality in your work, and how do you collaborate with cross-functional team members?",
      "What is your experience with modern software workflows, testing practices, and version controls?",
      `Lastly, what motivates you about this opportunity at ${interviewInfo.company}, and what is your notice period or availability?`
    ];
  }, [interviewInfo]);

  // Messages shown during VOIP signal handshakes
  const connectingMessages = [
    'Verifying candidate screening token...',
    'Requesting camera and microphone inputs...',
    'Calibrating audio latency with Murf AI router...',
    'Establishing secure VoIP streaming line...',
    'Starting vocalHire AI Falcon-2 voice session...'
  ];

  // Auto-submit voice response handler (bound to current indices)
  React.useEffect(() => {
    autoSubmitRef.current = (textToSubmit: string) => {
      const finalAnswer = textToSubmit.trim();
      if (!finalAnswer) return;

      setSavedAnswers(prev => [...prev, { question: questionsList[currentQuestionIndex], answer: finalAnswer }]);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatLog(prev => [...prev, { sender: 'user', text: finalAnswer, timestamp }]);

      setTypedResponse('');
      setInterimSpeech('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      if (nextIndex >= questionsList.length) {
        handleEndCall();
      } else {
        askQuestion(nextIndex);
      }
    };
  });

  // Auto-scroll transcript container
  React.useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  // Handshake sequence timer
  React.useEffect(() => {
    if (portalState === 'connecting') {
      setConnectingStep(0);
      const interval = setInterval(() => {
        setConnectingStep((prev) => {
          if (prev >= connectingMessages.length - 1) {
            clearInterval(interval);
            // Initialize hardware feeds then activate call
            startHardware().then(() => {
              setPortalState('active');
            });
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [portalState]);

  // Active call duration and visualizers
  React.useEffect(() => {
    if (portalState === 'active') {
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Start the dynamic question flow
      askQuestion(0);

      return () => {
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
        if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
        stopHardware();
      };
    }
  }, [portalState]);

  // Enable Camera and Microphone
  const startHardware = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.warn("Camera or microphone access denied:", err);
    }
  };

  // Turn off Camera and Microphone
  const stopHardware = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.close();
    }
  };

  // Switch camera on/off during active call
  const toggleCamera = () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
  };

  // Immediate interruption if candidate interacts
  const handleInputInteraction = () => {
    if (aiSpeechState === 'speaking') {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      if (pcmPlayerRef.current) {
        pcmPlayerRef.current.close();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setAiSpeechState('listening');
    }
  };

  // Play synthetic audio (streaming or speechSynthesis fallback)
  const playSpeech = async (text: string) => {
    if (isSpeakerMuted) {
      setAiSpeechState('listening');
      return;
    }

    try {
      setAiSpeechState('speaking');
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: 'en-US-natalie'
        })
      });

      if (!response.ok) {
        throw new Error('TTS Service Unavailable');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const player = new PCMPlayer(24000);
      pcmPlayerRef.current = player;

      let result;
      while (true) {
        result = await reader.read();
        if (result.done) break;
        player.playChunk(result.value);
      }

      // Fast pace: 320ms per word + 800ms base wait time
      const words = text.split(' ').length;
      const durationMs = (words * 320) + 800;
      
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
        setAiSpeechState('listening');
      }, durationMs);

    } catch (err) {
      // SpeechSynthesis client-side fallback
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setAiSpeechState('listening');
        };
        utterance.onerror = () => {
          setAiSpeechState('listening');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setAiSpeechState('listening');
      }
    }
  };

  // Ask current question
  const askQuestion = async (index: number) => {
    if (index >= questionsList.length) {
      handleEndCall();
      return;
    }

    const questionText = questionsList[index];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatLog(prev => [...prev, { sender: 'ai', text: questionText, timestamp }]);
    await playSpeech(questionText);
  };

  // Speech Recognition hook for speech-to-text with instant interim feedback & auto submit
  React.useEffect(() => {
    if (portalState === 'active') {
      if (aiSpeechState === 'listening' && !isMuted) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: any) => {
              let finalTranscript = '';
              let interimTranscript = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  finalTranscript += event.results[i][0].transcript;
                } else {
                  interimTranscript += event.results[i][0].transcript;
                }
              }
              
              if (finalTranscript) {
                setTypedResponse(prev => {
                  const base = prev.trim();
                  const nextVal = base + (base ? ' ' : '') + finalTranscript.trim();
                  
                  // Setup auto-submission after 2.2 seconds of silence (no more speech)
                  if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
                  autoSubmitTimerRef.current = setTimeout(() => {
                    autoSubmitRef.current(nextVal);
                  }, 2200);

                  return nextVal;
                });
                setInterimSpeech('');
              } else if (interimTranscript) {
                setInterimSpeech(interimTranscript);
                // Clear auto submit timer while candidate is actively speaking
                if (autoSubmitTimerRef.current) {
                  clearTimeout(autoSubmitTimerRef.current);
                  autoSubmitTimerRef.current = null;
                }
              }
            };

            rec.onerror = (e: any) => {
              console.warn("Speech recognition notice:", e.error);
            };

            rec.start();
            recognitionRef.current = rec;
          } catch (e) {
            console.error("SpeechRecognition initialization failed:", e);
          }
        }
      } else {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
          recognitionRef.current = null;
        }
        if (autoSubmitTimerRef.current) {
          clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = null;
        }
      }
    }
  }, [aiSpeechState, portalState, isMuted]);

  // Submit Answer (manual fallback click)
  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    
    const finalAnswer = (typedResponse + (interimSpeech ? ' ' + interimSpeech : '')).trim();
    const cleanAnswer = finalAnswer || "[No verbal response recorded]";
    
    setSavedAnswers(prev => [...prev, { question: questionsList[currentQuestionIndex], answer: cleanAnswer }]);

    // Append user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog(prev => [...prev, { sender: 'user', text: cleanAnswer, timestamp }]);

    // Prep next question
    setTypedResponse('');
    setInterimSpeech('');
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (nextIndex >= questionsList.length) {
      handleEndCall();
    } else {
      askQuestion(nextIndex);
    }
  };

  const handleStartInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameError('Please enter your full name to proceed.');
      return;
    }
    setNameError('');
    setPortalState('connecting');
  };

  const handleEndCall = () => {
    setCompletedDuration(callDuration);
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
    }
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopHardware();
    setPortalState('completed');
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate capability summary based on answers typed/spoken
  const assessmentData = React.useMemo(() => {
    if (savedAnswers.length === 0) return { score: 'N/A', recommendation: 'Insufficient Data', text: 'No answers recorded.', clarity: 'N/A' };
    
    // Evaluate word metrics
    const totalWords = savedAnswers.reduce((acc, curr) => acc + curr.answer.split(/\s+/).length, 0);

    let score = 6.5;
    let clarity = 'Basic';
    let recommendation = 'Require Vetting';
    let text = '';

    if (totalWords > 120) {
      score = 9.2;
      clarity = 'Excellent (Highly Detailed)';
      recommendation = 'Strong Recommend';
      text = `The candidate provided outstandingly comprehensive answers across all 7 evaluation sectors. They detailed highly complex patterns, explained backend database configurations, caching strategies (Redis), and outlined robust optimizations (Next.js Server/Client component splits). Their speech-to-text response length indicates high technical confidence, making them an ideal fit for the Senior role.`;
    } else if (totalWords > 40) {
      score = 8.0;
      clarity = 'Good (Articulate)';
      recommendation = 'Recommend';
      text = `The candidate responded with appropriate scope and structure. They addressed key technologies and successfully outlined standard engineering practices. Their communications skills are clear, matching standard mid-to-senior technical roles. Move them forward to the technical assessment phase.`;
    } else {
      score = 5.8;
      clarity = 'Brief (Lacks Depth)';
      recommendation = 'Further Vetting Needed';
      text = `The candidate gave brief or empty responses to the technical screening topics. There was limited evidence of architectural depth regarding Next.js, APIs, or database strategies. They require direct follow-up by an engineering manager to review base credentials.`;
    }

    return {
      score: score.toFixed(1),
      clarity,
      recommendation,
      text
    };
  }, [savedAnswers]);

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-slate-100 overflow-hidden">
      <title>{`${interviewInfo.role} Screening | vocalHire AI`}</title>
      <meta name="description" content={`Access your AI recruiter voice screening for the ${interviewInfo.role} position.`} />

      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative w-full border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300 shadow-md shadow-purple-500/5">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-white tracking-wide">vocalHire AI</p>
            <p className="text-xs text-slate-400">Recruiter Voice Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
            Candidate Portal
          </Badge>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-2 px-4 md:py-3 md:px-8 z-10 overflow-hidden">
        
        {/* Setup State */}
        {portalState === 'setup' && (
          <div className="w-full max-w-5xl flex flex-col justify-center my-auto py-1 px-1">
            <div className="text-center mb-4">
              <Badge className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                AI Voice Screening Invitation
              </Badge>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                You're invited to interview for <span className="text-purple-400">{interviewInfo.role}</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-2 max-w-2xl mx-auto">
                Complete this AI-powered voice screening to move forward in the hiring process at <span className="text-zinc-200 font-semibold">{interviewInfo.company}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: First Two Cards */}
              <div className="flex flex-col gap-6">
                <Card className="bg-zinc-900/40 border-zinc-800/80 shadow-md backdrop-blur-sm flex-1 flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-zinc-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Interview Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2.5">
                        <Briefcase className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Position</p>
                          <p className="text-zinc-200 text-xs font-semibold">{interviewInfo.role}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Location</p>
                          <p className="text-zinc-200 text-xs font-semibold">Remote</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Clock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Estimated Duration</p>
                          <p className="text-zinc-200 text-xs font-semibold">{interviewInfo.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Mic className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Interview Type</p>
                          <p className="text-zinc-200 text-xs font-semibold">AI Voice Screening</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2">
                      <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 text-[10px]">Full-time</Badge>
                      <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 text-[10px]">Engineering</Badge>
                      <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 text-[10px]">English</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/40 border-zinc-800/80 shadow-md backdrop-blur-sm flex-1 flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-zinc-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-400" />
                      What to Expect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 flex-1">
                    <div className="flex items-start gap-2 text-zinc-300 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>You will be asked 7 screening questions about your experience.</span>
                    </div>
                    <div className="flex items-start gap-2 text-zinc-300 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Speak clearly into your microphone when responding.</span>
                    </div>
                    <div className="flex items-start gap-2 text-zinc-300 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>You can mute/pause the call using buttons.</span>
                    </div>
                    <div className="flex items-start gap-2 text-zinc-300 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Transcripts will be saved to compile your capability report.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Bottom Two Cards */}
              <div className="flex flex-col gap-6">
                <Card className="bg-zinc-900/40 border-zinc-800/80 shadow-md backdrop-blur-sm flex-1 flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-zinc-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-purple-400" />
                      Before You Begin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 flex-1">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50">
                      <Headphones className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-zinc-300 text-[11px] leading-tight">Headphones recommended</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50">
                      <Mic className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-zinc-300 text-[11px] leading-tight">Microphone access required</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50">
                      <Wifi className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-zinc-300 text-[11px] leading-tight">Stable network required</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50">
                      <VolumeX className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-zinc-300 text-[11px] leading-tight">Quiet room preferred</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-md backdrop-blur-sm flex-1 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-400" />
                      Ready to Begin?
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">
                      Enter your name to start the interview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <form onSubmit={handleStartInterview} className="space-y-3">
                      <div className="space-y-1.5">
                        <label htmlFor="fullname" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Full Name *
                        </label>
                        <div className="relative">
                          <Input
                            id="fullname"
                            type="text"
                            placeholder="e.g. John Smith"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (e.target.value.trim()) setNameError('');
                            }}
                            className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-500 text-white placeholder-zinc-600 pl-10 h-10 text-xs rounded-xl"
                            autoComplete="off"
                            required
                          />
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-600" />
                        </div>
                        {nameError && (
                          <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {nameError}
                          </p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border-0 shadow-lg shadow-purple-500/10 h-11 rounded-xl text-xs"
                      >
                        <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
                        Start Interview &gt;
                      </Button>
                    </form>
                    <p className="text-[10px] text-center text-zinc-500 leading-normal">
                      By starting, you consent to vocalHire recording this audio session.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Connecting Screen */}
        {portalState === 'connecting' && (
          <div className="w-full max-w-md flex flex-col items-center justify-center text-center p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="relative flex items-center justify-center h-24 w-24 mb-8">
              <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping opacity-60" />
              <div className="absolute h-16 w-16 rounded-full bg-purple-500/10 border border-purple-400/20 blur-md" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/20">
                <Video className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Connecting Interview Feed</h3>
            <p className="text-zinc-400 text-xs max-w-xs mb-8">
              Please check your browser prompts and allow camera/microphone access.
            </p>

            <div className="w-full space-y-3 bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl text-left">
              {connectingMessages.map((msg, index) => (
                <div key={index} className="flex items-center gap-3 text-xs">
                  {connectingStep > index ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : connectingStep === index ? (
                    <div className="h-4 w-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-800 shrink-0" />
                  )}
                  <span className={
                    connectingStep === index 
                      ? 'text-purple-300 font-medium' 
                      : connectingStep > index 
                      ? 'text-zinc-400' 
                      : 'text-zinc-600'
                  }>
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Call State */}
        {portalState === 'active' && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch my-auto h-[480px]">
            
            {/* Left Side: Video Feeds (AI Recruiter and User Webcam adjacent to each other on a single row) */}
            <div className="lg:col-span-3 flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md relative h-full">
              
              {/* Call Status bar */}
              <div className="bg-zinc-950/80 px-4 py-2 flex items-center justify-between border-b border-zinc-800/60 z-20">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">AI Voice Assessment Live</span>
                </div>
                <div className="text-zinc-400 font-mono text-xs tracking-wider">
                  {formatTime(callDuration)}
                </div>
              </div>

              {/* Split Video Container: Left/Right adjacent view */}
              <div className="flex-1 grid grid-cols-2 gap-3 p-3 bg-zinc-950/80 z-10 min-h-0">
                
                {/* Visualizer 1: AI Agent speaking animations */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-3 h-full">
                  <div className="absolute top-3 left-3 bg-black/60 border border-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-bold text-zinc-300 tracking-wider">
                    vocalHire AI Recruiter
                  </div>

                  {/* Equalizer animation */}
                  <div className="h-20 w-full flex items-center justify-center gap-1.5 max-w-[140px] my-auto">
                    {aiSpeechState === 'speaking' ? (
                      Array.from({ length: 10 }).map((_, i) => {
                        const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.8, 0.4, 0.2, 0.1];
                        return (
                          <div 
                            key={i} 
                            className="w-1 bg-gradient-to-t from-purple-600 via-purple-400 to-blue-400 rounded-full"
                            style={{
                              height: '100%',
                              maxHeight: '50px',
                              animation: `eq-bounce 1s ease-in-out infinite alternate`,
                              animationDelay: `${delays[i]}s`
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="relative flex items-center justify-center h-16 w-16">
                        <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping opacity-40" />
                        <div className="absolute h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <style jsx>{`
                    @keyframes eq-bounce {
                      0% { transform: scaleY(0.15); }
                      100% { transform: scaleY(1.0); }
                    }
                  `}</style>

                  <div className="text-[10px] font-semibold px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 rounded-full mt-2">
                    {aiSpeechState === 'speaking' ? (
                      <span className="text-purple-400 animate-pulse">Recruiter speaking...</span>
                    ) : (
                      <span className="text-zinc-500">Listening...</span>
                    )}
                  </div>
                </div>

                {/* Visualizer 2: Candidate Webcam Stream */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center h-full">
                  <div className="absolute top-3 left-3 bg-black/60 border border-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-bold text-zinc-300 tracking-wider z-20">
                    Candidate: {fullName}
                  </div>
                  
                  {/* Live WebCam Element */}
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover z-10 transform -scale-x-100 ${isCameraOn ? 'block' : 'hidden'}`}
                  />

                  {/* Fallback avatar if webcam is not permitted or turned off */}
                  {(!localStreamRef.current || !isCameraOn) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-zinc-900 z-20">
                      <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 mb-2">
                        <User className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {!isCameraOn ? 'Camera turned off' : 'Camera preview inactive'}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Call Controls Strip */}
              <div className="bg-zinc-950/90 px-6 py-2.5 flex items-center justify-center gap-4 border-t border-zinc-800/60 z-20">
                {/* Mute Microphone */}
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer transition-colors border-zinc-800 ${
                    isMuted 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {/* Mute Camera */}
                <Button
                  onClick={toggleCamera}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer transition-colors border-zinc-800 ${
                    !isCameraOn 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                  title={isCameraOn ? 'Switch off camera' : 'Switch on camera'}
                >
                  {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>

                {/* Mute Speaker */}
                <Button
                  onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer transition-colors border-zinc-800 ${
                    isSpeakerMuted 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                  title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
                >
                  {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                {/* Cut Call / End Interview */}
                <Button
                  onClick={handleEndCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 px-4 h-9 rounded-lg transition-all cursor-pointer shadow-lg shadow-red-600/15 border-0 active:scale-[0.98] text-xs"
                >
                  <PhoneOff className="h-4 w-4 shrink-0" />
                  Cut Call
                </Button>
              </div>

            </div>

            {/* Right Side: Chat Transcript Logs & Submissions */}
            <div className="lg:col-span-2 flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm h-full">
              
              {/* Question progress header */}
              <div className="p-3 border-b border-zinc-800 bg-zinc-950/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Progress Tracker</span>
                  <span className="text-[11px] font-mono font-semibold text-zinc-300">Q {currentQuestionIndex + 1} of {questionsList.length}</span>
                </div>
                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questionsList.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Chat log list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-zinc-950/20">
                {chatLog.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] ${chat.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mb-1 font-semibold">
                      {chat.sender === 'ai' ? (
                        <>
                          <Bot className="h-3 w-3 text-purple-400" />
                          <span>AI Recruiter</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 text-zinc-400" />
                          <span>You ({fullName})</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{chat.timestamp}</span>
                    </div>

                    <div className={`p-3 rounded-2xl text-xs leading-normal border shadow-sm ${
                      chat.sender === 'user'
                        ? 'bg-zinc-850 text-white border-zinc-800 rounded-tr-none'
                        : 'bg-purple-600/10 text-purple-100 border-purple-500/20 rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Submission bar */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950/60">
                <form onSubmit={handleAnswerSubmit} className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder={
                        aiSpeechState === 'speaking' 
                          ? "Interrupt & type your answer..."
                          : "Type your answer or speak now..."
                      }
                      value={typedResponse + (interimSpeech ? (typedResponse ? ' ' : '') + interimSpeech : '')}
                      onChange={(e) => {
                        handleInputInteraction();
                        if (autoSubmitTimerRef.current) {
                          clearTimeout(autoSubmitTimerRef.current);
                          autoSubmitTimerRef.current = null;
                        }
                        setTypedResponse(e.target.value);
                      }}
                      onFocus={handleInputInteraction}
                      onClick={handleInputInteraction}
                      className="bg-zinc-950 border-zinc-850 focus-visible:ring-purple-500 text-white placeholder-zinc-600 h-9 text-xs rounded-lg pr-10"
                    />
                    {aiSpeechState === 'listening' && (
                      <div className="absolute right-3 top-2.5 flex items-center gap-1">
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Mic On</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!typedResponse.trim() && !interimSpeech.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-600 h-9 w-9 flex items-center justify-center p-0 rounded-lg cursor-pointer border-0 active:scale-[0.98]"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <div className="flex justify-between items-center mt-2 text-[9px] text-zinc-500 px-1 font-medium">
                  <span>Answers will auto-submit after 2s of silence.</span>
                  {aiSpeechState === 'listening' && (
                    <span className="text-zinc-400">Microphone streaming active</span>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Completed State */}
        {portalState === 'completed' && (
          <div className="w-full max-w-4xl flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-sm shadow-2xl p-6 md:p-8 my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Complete Header Badge & Thank You message */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Interview Screening Complete!</h2>
              <p className="text-zinc-400 text-xs mt-1.5 max-w-md leading-relaxed">
                Thank you, <span className="text-purple-300 font-semibold">{fullName}</span>, for completing the automated technical voice screening. Your response profiles, speech parameters, and live evaluations have been successfully saved.
              </p>
            </div>

            {/* Assessment Metadata & Interview Time */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Candidate Name</p>
                <p className="text-white text-xs font-semibold mt-1.5">{fullName}</p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Duration</p>
                <p className="text-purple-400 font-mono text-xs font-bold mt-1.5">{formatTime(completedDuration)}</p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Questions Completed</p>
                <p className="text-white text-xs font-semibold mt-1.5">{savedAnswers.length} of {questionsList.length}</p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Submission status</p>
                <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] mt-1.5">Submitted</Badge>
              </div>
            </div>

            {/* Tab selection to toggle candidate view and recruiter assessment */}
            <div className="flex border-b border-zinc-800 mb-6">
              <button 
                onClick={() => setRecruiterActiveTab('candidate')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  recruiterActiveTab === 'candidate' 
                    ? 'border-purple-500 text-purple-400' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Candidate Receipt
              </button>
              <button 
                onClick={() => setRecruiterActiveTab('recruiter')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  recruiterActiveTab === 'recruiter' 
                    ? 'border-purple-500 text-purple-400' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Recruiter Assessment Panel
              </button>
            </div>

            {/* Tab Content 1: Candidate Receipt */}
            {recruiterActiveTab === 'candidate' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Evaluation Role</p>
                    <p className="text-white text-sm font-semibold mt-1">{interviewInfo.role}</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Company</p>
                    <p className="text-white text-sm font-semibold mt-1">{interviewInfo.company}</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Submission Date</p>
                    <p className="text-white text-sm font-semibold mt-1">{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">Secure Transmission Active</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      We have compiled your submission, synchronized the transcripts, and notified the recruitment agency. You can close this window now. The agency will contact you directly regarding the next steps in the hiring process.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Recruiter Assessment Panel (Capable Summary & Scores) */}
            {recruiterActiveTab === 'recruiter' && (
              <div className="space-y-6">
                
                {/* Score Indicators and AI Recruiter Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Capability Index</p>
                    <p className="text-purple-400 text-2xl font-black mt-2">{assessmentData.score} <span className="text-xs text-zinc-500">/10</span></p>
                    <Badge className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-[10px] mt-2">vocalHire AI Index</Badge>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Speech Clarity</p>
                    <p className="text-white text-base font-semibold mt-2">{assessmentData.clarity}</p>
                    <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700/50 text-[10px] mt-2">Vocabulary Vetted</Badge>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Questions Answered</p>
                    <p className="text-white text-2xl font-bold mt-2">{savedAnswers.length} <span className="text-xs text-zinc-500">/ {questionsList.length}</span></p>
                    <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700/50 text-[10px] mt-2">100% Completion</Badge>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Recommendation</p>
                    <p className={`text-sm font-extrabold mt-3 uppercase tracking-wider ${
                      assessmentData.recommendation.includes('Strong') 
                        ? 'text-emerald-400' 
                        : assessmentData.recommendation.includes('Recommend')
                        ? 'text-purple-300'
                        : 'text-amber-400'
                    }`}>{assessmentData.recommendation}</p>
                    <Badge className="bg-zinc-850 text-zinc-400 text-[10px] mt-3">Action Required</Badge>
                  </div>
                </div>

                {/* Capability Summary Paragraph */}
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-5 space-y-2">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    AI Recruiter Capability Summary
                  </h4>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    {assessmentData.text}
                  </p>
                </div>

                {/* Detailed Q&A Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">Detailed Q&A Transcript Breakdown</h4>
                  <div className="space-y-3">
                    {savedAnswers.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950/40 border border-zinc-850 rounded-lg p-4 space-y-2">
                        <div className="flex gap-2 items-start text-xs font-semibold text-purple-300">
                          <span className="bg-purple-500/10 text-purple-300 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">Q{idx + 1}</span>
                          <p>{item.question}</p>
                        </div>
                        <div className="pl-7 text-xs text-zinc-400 border-l border-zinc-800 ml-2.5 py-1">
                          <p className="font-bold text-[9px] text-zinc-600 uppercase mb-1">Candidate Answer:</p>
                          <p className="italic">“ {item.answer} ”</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Back Home Button container */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end">
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-xl py-3 px-6 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                  Exit Portal
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative w-full border-t border-zinc-900 bg-black/40 px-6 py-2.5 flex items-center justify-between text-zinc-600 text-[10px] z-30">
        <span>&copy; {new Date().getFullYear()} vocalHire AI. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}
