import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  Zap,
  Layers,
  Lock,
  RefreshCw,
  Target,
  Clock,
  FileText,
  BrainCircuit,
  Sliders,
  Trello,
  Columns,
  MailCheck,
  UploadCloud,
  Cpu,
  CheckCircle2,
  Check,
  ArrowRight,
  ShieldCheck,
  Bot,
  Calendar,
  X,
  Database,
} from 'lucide-react';
import { WorkspaceRoute } from '../data/atsData';
import { BrandLogo } from './BrandLogo';
import { AmbientBackground } from './AmbientBackground';

interface LandingPageProps {
  onEnterWorkspace: (route?: WorkspaceRoute) => void;
}

type FooterInfoTab = 'privacy' | 'terms' | 'security';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  const [infoModal, setInfoModal] = useState<FooterInfoTab | null>(null);

  useEffect(() => {
    if (!infoModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInfoModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [infoModal]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-[#F8FAFC] antialiased subtle-grid overflow-x-hidden">
      <AmbientBackground />
      {/* MainHeader */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0B1020]/80 border-b border-[#263449]/70 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <a className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink-0" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <BrandLogo className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">
                HireSwift<span className="text-[#8B5CF6]">AI</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#94A3B8]">
            <a className="hover:text-white transition-colors duration-150 whitespace-nowrap" href="#features">
              Features
            </a>
            <a className="hover:text-white transition-colors duration-150 whitespace-nowrap" href="#how-it-works">
              How It Works
            </a>
            <a className="hover:text-white transition-colors duration-150 whitespace-nowrap" href="#pipeline">
              AI Matching
            </a>
            <a className="hover:text-white transition-colors duration-150 whitespace-nowrap" href="#testimonials">
              Guarantees
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onEnterWorkspace('dashboard')}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] hover:from-[#4338CA] hover:to-[#2563EB] shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 border border-white/10 cursor-pointer whitespace-nowrap"
            >
              <span>Open Workspace</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* HeroSection */}
      <section className="relative z-10 pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[720px] h-[360px] sm:h-[500px] glow-conic pointer-events-none blur-3xl opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 page-enter">
          {/* Announcement Pill Badge */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#151E32]/90 border border-[#263449] shadow-inner text-[11px] sm:text-sm font-medium text-[#F8FAFC] text-center">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse shrink-0" />
              <span>3-Tier AI + Heuristic ATS Engine</span>
              <span className="hidden sm:inline text-[#263449]">•</span>
              <span className="text-[#8B5CF6] font-semibold">PDF, DOCX &amp; Scanned OCR</span>
            </div>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight leading-[1.12] mb-4 sm:mb-6 text-balance">
              Hire Smarter. Shortlist Faster. <br className="hidden sm:inline" />
              <span className="gradient-hero-text">Find the Right Talent.</span>
            </h1>
            <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-3xl mx-auto font-normal">
              HireSwift AI is an intelligent ATS workspace built for fast-moving recruiting teams. Parse PDF and DOCX resumes locally, score candidate-JD fit across 6 weighted dimensions, and manage your hiring pipeline in one browser-persisted workspace.
            </p>
          </div>

          {/* Dual Call To Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={() => onEnterWorkspace('dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 transition-all duration-200 border border-white/20 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Launch Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => onEnterWorkspace('ai-matching')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] bg-[#151E32] hover:bg-[#1B2740] border border-[#263449] transition-all duration-200 hover:border-[#3B82F6]/50 cursor-pointer"
            >
              <Target className="w-5 h-5 text-[#3B82F6]" />
              <span>Explore AI Matching</span>
            </button>
          </div>

          {/* Technology & AI Stack Bar */}
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-[#94A3B8]/80 font-semibold mb-6">
              Powered by a 3-Tier AI &amp; Client-Side Extraction Stack
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-75 transition-all duration-300">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> GEMINI AI
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <Cpu className="w-4 h-4 text-[#3B82F6]" /> OPENROUTER
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <Zap className="w-4 h-4 text-emerald-400" /> GROQ
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <FileText className="w-4 h-4 text-indigo-300" /> PDF.JS
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <Layers className="w-4 h-4 text-sky-300" /> MAMMOTH DOCX
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-300">
                <Database className="w-4 h-4 text-violet-300" /> LOCAL STORAGE
              </div>
            </div>
          </div>

          {/* Hero Visual Display Mockup */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#3B82F6] rounded-2xl blur-xl opacity-40 group-hover:opacity-75 transition duration-1000" />
            <div className="relative rounded-2xl bg-[#0B1020] border border-[#263449] shadow-2xl overflow-hidden">
              {/* Mockup Window Bar */}
              <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#151E32]/90 border-b border-[#263449]">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="text-[11px] sm:text-xs font-mono text-[#94A3B8] bg-[#0B1020] px-2.5 sm:px-4 py-1 rounded-md border border-[#263449] flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[175px] sm:max-w-sm md:max-w-none">
                  <Lock className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                  <span className="truncate">hireswift-ai.netlify.app/#/ai-matching</span>
                </div>
                <button
                  type="button"
                  onClick={() => onEnterWorkspace('ai-matching')}
                  className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer shrink-0 p-1"
                  title="Open Interactive Workspace"
                  aria-label="Refresh interactive preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Screenshot Asset */}
              <div
                onClick={() => onEnterWorkspace('ai-matching')}
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#0B1020] cursor-pointer"
              >
                <img
                  alt="HireSwift AI Interactive Talent Pipeline & Semantic Matching Dashboard"
                  className="w-full h-full object-cover object-top"
                  src="/screen_630d9ae4.png"
                />
                {/* Floating Badge 1 (Top Left) */}
                <div className="hidden sm:flex absolute top-5 left-5 items-center gap-3 p-3 rounded-xl bg-[#151E32]/90 backdrop-blur-md border border-[#263449] shadow-xl animate-float-slow">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Bulk Resume Parser</p>
                    <p className="text-[11px] text-[#94A3B8]">PDF &amp; DOCX extraction • SHA-256 duplicate check</p>
                  </div>
                </div>
                {/* Floating Badge 2 (Bottom Right) */}
                <div className="hidden sm:flex absolute bottom-5 right-5 items-center gap-3 p-3.5 rounded-xl bg-[#151E32]/95 backdrop-blur-md border border-[#8B5CF6]/50 shadow-2xl animate-float-slow-reverse">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] text-white flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">AI Weighted Match</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        94% Fit
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">Sarah Chen • Senior Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MetricComparisonStrip */}
      <section className="border-y border-[#263449] bg-[#151E32]/40 py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-6 lg:p-8 mb-10 border border-[#263449] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                  Manual Resume Screening
                </p>
                <p className="text-lg font-heading font-semibold text-white">
                  Unstructured PDFs, keyword guesswork &amp; duplicate files
                </p>
              </div>
            </div>
            <div className="hidden md:block text-[#94A3B8] font-bold text-lg">vs</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/20 border border-[#4F46E5]/40 flex items-center justify-center text-[#8B5CF6] font-bold shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  With HireSwift AI Engine
                </p>
                <p className="text-lg font-heading font-semibold text-white">
                  Structured parsing, 6-axis weighted scoring &amp; SHA-256 deduplication
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center tabular-nums">
            <div className="p-3.5 sm:p-4 rounded-xl border border-[#263449]/60 bg-[#151E32]/20">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8B5CF6]">
                14
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#94A3B8] mt-1">Workspace Modules</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border border-[#263449]/60 bg-[#151E32]/20">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#3B82F6]">
                6 Axes
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#94A3B8] mt-1">Customizable Scoring</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border border-[#263449]/60 bg-[#151E32]/20">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                3-Tier
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#94A3B8] mt-1">AI + Local Fallback</p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl border border-[#263449]/60 bg-[#151E32]/20">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#4F46E5]">
                100%
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#94A3B8] mt-1">Browser-Local Privacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CoreFeaturesSection */}
      <section className="py-16 sm:py-24 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold tracking-widest text-[#8B5CF6] uppercase">
              Full-Cycle Recruitment Workspace
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mt-3 mb-4 text-balance">
              Everything You Need to Parse, Score, and Shortlist Candidates
            </h2>
            <p className="text-[#94A3B8] text-sm sm:text-lg">
              Zero external database setup. HireSwift AI runs a complete, auditable recruiting workflow right in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <button
              type="button"
              onClick={() => onEnterWorkspace('resume-upload')}
              className="text-left glass-card rounded-2xl p-5 sm:p-7 border border-[#263449] hover:border-[#4F46E5]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center text-[#8B5CF6] mb-4 sm:mb-5 group-hover:bg-[#4F46E5] group-hover:text-white transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-white mb-2">
                Bulk AI Resume Parsing &amp; OCR
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Drag &amp; drop digital PDF, DOCX, or scanned PDF resumes. Extracts structured academics, categorized skills, and work history while flagging exact or potential duplicates via SHA-256 hashing.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('ai-matching')}
              className="text-left glass-card rounded-2xl p-7 border border-[#263449] hover:border-[#8B5CF6]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-5 group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2.5">
                Weighted &amp; AI Resume-JD Matching
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Evaluates normalized skill aliases, experience bounds, academic CGPA, projects, certifications, and responsibilities with transparent 0–100 scores, grounded AI rationale, and interview prompts.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('candidates')}
              className="text-left glass-card rounded-2xl p-7 border border-[#263449] hover:border-[#3B82F6]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mb-5 group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2.5">
                Precision Academic &amp; Skill Filtering
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Filter cohorts by CGPA cutoffs, 10th &amp; 12th percentages, degree, branch, college, graduation year, experience range, location/remote availability, and AND/OR technical skills.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('hiring-pipeline')}
              className="text-left glass-card rounded-2xl p-7 border border-[#263449] hover:border-[#4F46E5]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center text-[#8B5CF6] mb-5 group-hover:bg-[#4F46E5] group-hover:text-white transition-all">
                <Trello className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2.5">
                Kanban Hiring Pipeline
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Drag-and-drop 5-stage board (Applied, Shortlisted, Interview, Offer, Rejected) with quick stage transitions, interview schedule tracking, rejection reasons, and recruiter notes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('compare-candidates')}
              className="text-left glass-card rounded-2xl p-7 border border-[#263449] hover:border-[#8B5CF6]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-5 group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                <Columns className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2.5">
                Side-by-Side Comparison
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Compare up to 4 finalists side-by-side across overall match score, skill overlap, CGPA, 10th/12th scores, experience, education, key strengths, and hiring recommendations.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('email-center')}
              className="text-left glass-card rounded-2xl p-7 border border-[#263449] hover:border-[#3B82F6]/60 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mb-5 group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
                <MailCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2.5">
                Smart Email Center &amp; Templates
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Draft Interview Invites, Shortlist Updates, Offer Letters, and Rejection Feedback with auto-populated candidate and job variables, clipboard copy, and .eml file export.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* WorkflowSection */}
      <section className="py-20 bg-[#151E32]/30 border-y border-[#263449] relative z-10" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#3B82F6] uppercase">
              Zero Operational Friction
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mt-2">
              How HireSwift AI Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="relative glass-card rounded-2xl p-8 border border-[#263449]">
              <span className="text-5xl font-extrabold text-[#263449] select-none block mb-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-[#8B5CF6] flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ingest &amp; Deduplicate</h3>
              <p className="text-sm text-[#94A3B8]">
                Drop PDF or DOCX resumes (including scanned PDFs). Client-side extraction checks file signatures, runs SHA-256 duplicate checks, and parses structured fields.
              </p>
            </div>

            <div className="relative glass-card rounded-2xl p-8 border border-[#263449]">
              <span className="text-5xl font-extrabold text-[#263449] select-none block mb-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Weighted JD Alignment</h3>
              <p className="text-sm text-[#94A3B8]">
                Paste a JD or upload a PDF/DOCX role spec to extract requirements, then score candidates across 6 customizable categories with grounded AI explanations.
              </p>
            </div>

            <div className="relative glass-card rounded-2xl p-8 border border-[#263449]">
              <span className="text-5xl font-extrabold text-[#263449] select-none block mb-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Compare, Advance &amp; Export</h3>
              <p className="text-sm text-[#94A3B8]">
                Inspect ranked leaderboards, compare up to 4 finalists, analyze skill gaps, move stages on the Kanban board, and export .eml invites or CSV/JSON reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* InteractiveScorecardPreview */}
      <section className="py-24 relative" id="pipeline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2740] border border-[#263449] text-xs font-semibold text-[#8B5CF6] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Explainable AI Scoring
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-6 leading-tight">
                Stop Guessing. See Exactly Why A Candidate Matches.
              </h2>
              <p className="text-base text-[#94A3B8] mb-6 leading-relaxed">
                Every candidate score combines a deterministic 6-category weighted rubric with grounded AI rationale—leaving unverified fields null rather than fabricating details.
              </p>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>6-axis weighted scoring: Skills, Experience, Education, Projects, Certifications, Responsibilities.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Matched, missing, and transferable skill chips plus extracted resume text preview.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic flags for missing profile fields, potential concerns, and duplicate resumes.</span>
                </li>
              </ul>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace('ai-matching')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Explore Candidate Scorecard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card rounded-2xl p-5 sm:p-8 border border-[#263449] shadow-2xl relative">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263449] pb-4 sm:pb-5 mb-5 sm:mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0">
                      SC
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-white text-base sm:text-lg truncate">Sarah Chen</h4>
                      <p className="text-xs text-[#94A3B8]">
                        Full Stack Developer • 5.5 Yrs Exp
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tabular-nums">
                      <ShieldCheck className="w-3.5 h-3.5" /> 94% Match
                    </div>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="space-y-4 mb-6 tabular-nums">
                  <div>
                    <div className="flex justify-between gap-2 text-xs font-medium mb-1.5">
                      <span className="text-slate-300">
                        Technical Skills Alignment (React, TypeScript, Node.js, AWS, Docker)
                      </span>
                      <span className="text-white font-semibold shrink-0">96%</span>
                    </div>
                    <div className="w-full bg-[#1B2740] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] h-2 rounded-full"
                        style={{ width: '96%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between gap-2 text-xs font-medium mb-1.5">
                      <span className="text-slate-300">Experience &amp; Microservices Scale</span>
                      <span className="text-white font-semibold shrink-0">92%</span>
                    </div>
                    <div className="w-full bg-[#1B2740] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-2 rounded-full"
                        style={{ width: '92%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between gap-2 text-xs font-medium mb-1.5">
                      <span className="text-slate-300">Education &amp; Academics (M.S. CS • 9.4 CGPA)</span>
                      <span className="text-white font-semibold shrink-0">94%</span>
                    </div>
                    <div className="w-full bg-[#1B2740] rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>

                {/* AI Summary Box */}
                <div className="p-4 rounded-xl bg-[#0B1020]/90 border border-[#263449] mb-5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#8B5CF6]">
                    <Bot className="w-4 h-4" />
                    <span>AI ATS Rationale Summary</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    &quot;Sarah has directed 3 microservice transformations reducing p95 latency by 42%. Strong alignment across React, TypeScript, Node.js, Python, AWS, and Docker.&quot;
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onEnterWorkspace('email-center')}
                    className="flex-1 min-h-[44px] sm:min-h-0 py-2.5 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" /> Draft Interview Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterWorkspace('ai-matching')}
                    className="min-h-[44px] sm:min-h-0 py-2.5 px-4 rounded-lg bg-[#1B2740] hover:bg-[#263449] text-xs font-medium text-[#94A3B8] hover:text-white transition-colors border border-[#263449] cursor-pointer text-center"
                  >
                    Open AI Matching
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CoreGuaranteesSection */}
      <section className="py-24 bg-[#151E32]/30 border-y border-[#263449] relative" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#3B82F6] uppercase">
              Engineering &amp; Privacy Guarantees
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mt-2">
              Transparent, Resilient, and Local-First
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-7 border border-[#263449] flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Unverified resume fields stay <span className="font-mono text-white">null</span> instead of being fabricated, missing CGPA scores receive a neutral baseline rather than zero, and common tech aliases normalize automatically.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-sm">
                  01
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Strict Factual Grounding</p>
                  <p className="text-[11px] text-[#94A3B8]">Deterministic Weighted Rubric</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-7 border border-[#263449] flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                AI requests cascade sequentially from Gemini to OpenRouter and Groq, with a built-in deterministic heuristic parser ensuring uninterrupted parsing and matching even without API keys.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/30 text-violet-300 font-bold flex items-center justify-center text-sm">
                  02
                </div>
                <div>
                  <p className="text-xs font-bold text-white">3-Tier AI + Local Fallback</p>
                  <p className="text-[11px] text-[#94A3B8]">Server-Side Key Isolation</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-7 border border-[#263449] flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Candidates, jobs, and scoring weights persist in browser <span className="font-mono text-white">localStorage</span> until you choose to remove them—with explicit confirmation dialogs for individual and bulk deletions.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-sm">
                  03
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Browser-Local Control</p>
                  <p className="text-[11px] text-[#94A3B8]">Zero External DB • Safe Delete Flows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FinalCallToAction */}
      <section className="py-16 sm:py-20 relative overflow-hidden" id="get-started">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card rounded-3xl p-6 sm:p-14 border border-[#4F46E5]/40 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#4F46E5]/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#8B5CF6]/20 blur-3xl pointer-events-none" />
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-4 tracking-tight">
              Ready to Explore the HireSwift AI Workspace?
            </h2>
            <p className="text-[#94A3B8] text-sm sm:text-lg max-w-2xl mx-auto mb-8 font-normal">
              Launch the 14-view ATS workspace with 30 sample candidates and 6 active roles preloaded, or upload your own PDF and DOCX resumes immediately.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onEnterWorkspace('dashboard')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 whitespace-nowrap transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => onEnterWorkspace('ai-matching')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#151E32] hover:bg-[#1B2740] border border-[#263449] text-white font-semibold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer"
              >
                <span>Explore AI Matching</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]/70 mt-4">
              Zero external database • Browser localStorage persistence • 3-Tier AI + Heuristic fallback
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#263449] bg-[#0B1020]/90 backdrop-blur-xs pt-12 sm:pt-16 pb-10 sm:pb-12 text-[#94A3B8] text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-10 sm:mb-12">
            <div className="col-span-2 sm:col-span-3 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <BrandLogo className="w-8 h-8" />
                </div>
                <span className="font-heading font-bold text-lg text-white">
                  HireSwift<span className="text-[#8B5CF6]">AI</span>
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
                The intelligent Applicant Tracking System built to eliminate hiring friction, auto-score candidates semantically, and build world-class engineering teams.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('resume-upload')} className="hover:text-white transition-colors cursor-pointer">
                    Resume Parser OCR
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('ai-matching')} className="hover:text-white transition-colors cursor-pointer">
                    Semantic Matching
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('hiring-pipeline')} className="hover:text-white transition-colors cursor-pointer">
                    Kanban Pipeline
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('compare-candidates')} className="hover:text-white transition-colors cursor-pointer">
                    Candidate Comparison
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('settings')} className="hover:text-white transition-colors cursor-pointer">
                    API &amp; Integrations
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('help-center')} className="hover:text-white transition-colors cursor-pointer">
                    Documentation
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('help-center')} className="hover:text-white transition-colors cursor-pointer">
                    ATS Migration Guide
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('reports')} className="hover:text-white transition-colors cursor-pointer">
                    Hiring Reports &amp; Exports
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('skill-gap-analysis')} className="hover:text-white transition-colors cursor-pointer">
                    Skill Gap Analysis
                  </button>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#testimonials"
                    onClick={(e) => scrollToSection(e, 'testimonials')}
                  >
                    System Guarantees
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">Workspace</p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#features"
                    onClick={(e) => scrollToSection(e, 'features')}
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <button type="button" onClick={() => onEnterWorkspace('job-management')} className="hover:text-white transition-colors cursor-pointer">
                    Manage Job Roles
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setInfoModal('privacy')} className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setInfoModal('terms')} className="hover:text-white transition-colors cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setInfoModal('security')} className="hover:text-white transition-colors cursor-pointer">
                    Security &amp; Controls
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#263449] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]/60">
            <p>© 2026 HireSwift AI. Licensed under Apache-2.0.</p>
            <div className="flex items-center gap-6">
              <a
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
                href="https://github.com/bikram73/HireSwift_AI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HireSwift AI on GitHub"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
                href="https://www.youtube.com/@bikramtechzzz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HireSwift AI on YouTube"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Footer Info / Policy / Security Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-info-modal-title"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl bg-[#0F172A] border border-[#263449] shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#263449] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className="w-5 h-5 text-[#8B5CF6] shrink-0" />
                <h2 id="footer-info-modal-title" className="font-heading font-bold text-sm sm:text-base text-white truncate">
                  {infoModal === 'privacy'
                    ? 'Privacy Policy & Data Handling'
                    : infoModal === 'terms'
                      ? 'Terms of Service'
                      : 'Security Controls & Architecture'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pt-4 flex flex-wrap gap-2">
              {(
                [
                  ['privacy', 'Privacy Policy'],
                  ['terms', 'Terms of Service'],
                  ['security', 'Security & Controls'],
                ] as [FooterInfoTab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInfoModal(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    infoModal === tab
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#151E32] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4 text-xs text-[#CBD5E1] leading-relaxed max-h-[60vh] overflow-y-auto">
              {infoModal === 'privacy' && (
                <>
                  <p>
                    <strong className="text-white">Zero External Database Persistence:</strong> HireSwift AI stores structured recruitment workspace state (jobs, parsed candidate summaries, match scores, and pipeline stages) strictly within your browser session and localStorage.
                  </p>
                  <p>
                    <strong className="text-white">Volatile Raw Resume Text:</strong> Raw extracted resume text previews and uploaded file object URLs stay in volatile memory during your active tab session only and are automatically excluded from browser localStorage and exported session JSON files.
                  </p>
                  <p>
                    <strong className="text-white">Controlled Data Portability:</strong> You can export structured candidate reports (CSV/JSON) or permanently purge all local workspace state at any time from Workspace Settings.
                  </p>
                </>
              )}

              {infoModal === 'terms' && (
                <>
                  <p>
                    <strong className="text-white">Permitted Use:</strong> HireSwift AI is provided as an intelligent applicant tracking and candidate-evaluation workspace to assist recruiting and engineering hiring teams.
                  </p>
                  <p>
                    <strong className="text-white">Transparent Scoring Responsibility:</strong> Automated keyword matching, weighted category rubrics, and AI-extracted summaries are decision-support aids. Final shortlisting, interview, and hiring determinations remain the responsibility of authorized reviewers.
                  </p>
                  <p>
                    <strong className="text-white">Document Limits:</strong> Supported uploads include digital PDF and DOCX resumes (default 4 MB cap for serverless OCR payload compatibility) and exclude encrypted/password-locked documents unless unlocked prior to upload.
                  </p>
                </>
              )}

              {infoModal === 'security' && (
                <>
                  <p>
                    <strong className="text-white">Server-Side AI Key Isolation:</strong> All AI provider credentials (Gemini, OpenRouter, Groq) reside strictly on server endpoints (`/api/*`) and serverless functions, never in the browser bundle or client storage.
                  </p>
                  <p>
                    <strong className="text-white">Resilient Multi-Model & Deterministic Fallback:</strong> Extraction requests execute sequentially across configured AI providers with automatic deterministic rule-based fallback so hiring workflows stay available even without external model connectivity.
                  </p>
                  <p>
                    <strong className="text-white">Integrity & Validation Controls:</strong> SHA-256 content hashing detects duplicate resume submissions, uploaded binaries are validated by header/format signature, and base64 OCR payloads enforce strict size bounds.
                  </p>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#263449] bg-[#0B1020]/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setInfoModal(null);
                  onEnterWorkspace('settings');
                }}
                className="text-xs font-medium text-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
              >
                Manage Data in Settings →
              </button>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 rounded-lg bg-[#151E32] hover:bg-[#1E293B] border border-[#263449] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
