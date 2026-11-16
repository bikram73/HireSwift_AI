import React, { useState } from 'react';
import { CANDIDATES_DATA, CandidateProfile, WorkspaceRoute } from '../../data/atsData';

interface DashboardViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const [showLogsModal, setShowLogsModal] = useState(false);

  const topMatching = CANDIDATES_DATA.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Top Level Header and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg mb-space-xl">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-mono-code text-mono-code text-tertiary uppercase tracking-wider">
              Recruiter Workspace • Live Telemetry
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Good Morning, Recruiter
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Here&apos;s what&apos;s happening with your hiring activities today.
          </p>
        </div>

        <div className="flex items-center gap-space-md flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="flex items-center gap-space-xs px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-xl font-label-md text-label-md transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">upload_file</span>
            <span>Upload Resumes</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('job-management')}
            className="flex items-center gap-space-xs px-4 py-2 bg-primary-container hover:bg-inverse-primary text-on-primary-container rounded-xl font-label-md text-label-md transition-all shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Job</span>
          </button>
        </div>
      </div>

      {/* Hero Spotlight / AI Engine Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg mb-space-xl shadow-md">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg relative z-10">
          <div className="flex items-center gap-space-lg">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0 flex items-center justify-center border border-outline-variant/30">
              <img
                alt="AI Engine Visualization"
                className="w-full h-full object-cover"
                src="/assets/aistudio/screen_630d9ae4.png"
              />
              <div className="absolute inset-0 bg-primary-container/15 mix-blend-overlay" />
            </div>
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-code text-label-sm">
                  v2.4 PRO
                </span>
                <span className="font-label-sm text-label-sm text-tertiary">
                  Neural Matching Pipeline
                </span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                AI Talent Matching Engine v2.4 Active • 148 candidates parsed with 94% precision matching
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Semantic graph clustering identified 19 high-velocity matches for priority roles across backend and data engineering.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-md shrink-0 w-full md:w-auto justify-end">
            <div className="flex flex-col items-end">
              <span className="font-mono-code text-label-sm text-on-surface-variant">Throughput</span>
              <span className="font-mono-code text-body-md text-primary font-bold">1.4s / Resume</span>
            </div>
            <div className="h-8 w-px bg-surface-container-highest" />
            <button
              type="button"
              onClick={() => setShowLogsModal(true)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-bright text-tertiary rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Engine Logs</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Statistics Cards (4x2 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl tabular-nums">
        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">482</span>
            <span className="font-mono-code text-label-sm text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+14% mo
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full w-[72%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Active Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">work</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">12</span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-code text-label-sm">
              4 urgent
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary-container h-full w-[60%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Applications Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">1,280</span>
            <span className="font-mono-code text-label-sm text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">north_east</span>+28% wk
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full w-[85%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-fixed">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">64</span>
            <span className="font-mono-code text-label-sm text-on-surface-variant">5 pending review</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-fixed h-full w-[45%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary-fixed-dim">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">18</span>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono-code text-label-sm">
              Today: 4
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary h-full w-[55%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Offers Released
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">6</span>
            <span className="font-mono-code text-label-sm text-tertiary">4 accepted</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary-container h-full w-[66%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Rejected Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">142</span>
            <span className="font-mono-code text-label-sm text-on-surface-variant">Auto feedback</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-error h-full w-[30%]" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Average Match Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg text-on-surface">84.6%</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-mono-code text-label-sm">
              Top Tier
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full w-[84%]" />
          </div>
        </div>
      </div>

      {/* Charts Section (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-xl">
        {/* Chart 1: Application Trends */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Application Trends
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Inflow volume across active requisition boards
              </p>
            </div>
            <div className="flex items-center gap-space-xs font-mono-code text-label-sm bg-surface-container px-2 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="text-on-surface">Past 30 Days</span>
            </div>
          </div>
          <div className="relative w-full h-56 pt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line stroke="#2f3446" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="500" y1="40" y2="40" />
              <line stroke="#2f3446" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="500" y1="90" y2="90" />
              <line stroke="#2f3446" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="500" y1="140" y2="140" />
              <path
                d="M 0 170 Q 70 140 120 110 T 240 80 T 360 40 T 500 25 L 500 190 L 0 190 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M 0 170 Q 70 140 120 110 T 240 80 T 360 40 T 500 25"
                fill="none"
                stroke="#c3c0ff"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle cx="120" cy="110" fill="#4f46e5" r="4" stroke="#dee1f9" strokeWidth="2" />
              <circle cx="240" cy="80" fill="#4f46e5" r="4" stroke="#dee1f9" strokeWidth="2" />
              <circle cx="360" cy="40" fill="#4f46e5" r="4" stroke="#dee1f9" strokeWidth="2" />
              <circle cx="500" cy="25" fill="#c3c0ff" r="5" stroke="#4f46e5" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-mono-code text-label-sm pt-3">
            <span>Oct 01</span>
            <span>Oct 08</span>
            <span>Oct 15</span>
            <span>Oct 22</span>
            <span>Oct 29</span>
            <span>Nov 05</span>
          </div>
        </div>

        {/* Chart 2: Recruitment Funnel */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Recruitment Funnel
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Conversion stages through hiring workflow
              </p>
            </div>
            <span className="font-mono-code text-label-sm text-tertiary">9.3% Overall Yield</span>
          </div>
          <div className="flex flex-col gap-3 py-1">
            {[
              { label: 'Applied', count: '1,280', pct: '(100%)', width: '100%', dot: 'bg-primary', bar: 'bg-primary-container' },
              { label: 'Shortlisted', count: '340', pct: '(26.5%)', width: '26.5%', dot: 'bg-secondary', bar: 'bg-secondary-container' },
              { label: 'Interview', count: '84', pct: '(6.5%)', width: '6.5%', dot: 'bg-tertiary', bar: 'bg-tertiary-container' },
              { label: 'Offer', count: '18', pct: '(1.4%)', width: '3.2%', dot: 'bg-tertiary-fixed', bar: 'bg-primary' },
              { label: 'Hired', count: '12', pct: '(0.9%)', width: '2%', dot: 'bg-inverse-primary', bar: 'bg-inverse-primary', bold: true },
            ].map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between font-label-md text-label-md text-on-surface mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                    {stage.label}
                  </span>
                  <span className={`font-mono-code ${stage.bold ? 'text-tertiary font-bold' : 'text-on-surface-variant'}`}>
                    {stage.count} <span className="text-outline text-label-sm">{stage.pct}</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div
                    className={`${stage.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: stage.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Stage Distribution Donut Chart */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Stage Distribution
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Candidate inventory categorized by status
              </p>
            </div>
            <span className="font-mono-code text-label-sm text-on-surface-variant">482 Active</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-space-lg">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="38" stroke="#25293a" strokeWidth="12" />
                <circle cx="50" cy="50" fill="none" r="38" stroke="#4f46e5" strokeDasharray="107 238" strokeDashoffset="0" strokeWidth="12" />
                <circle cx="50" cy="50" fill="none" r="38" stroke="#571bc1" strokeDasharray="60 238" strokeDashoffset="-107" strokeWidth="12" />
                <circle cx="50" cy="50" fill="none" r="38" stroke="#adc6ff" strokeDasharray="36 238" strokeDashoffset="-167" strokeWidth="12" />
                <circle cx="50" cy="50" fill="none" r="38" stroke="#d0bcff" strokeDasharray="24 238" strokeDashoffset="-203" strokeWidth="12" />
                <circle cx="50" cy="50" fill="none" r="38" stroke="#c3c0ff" strokeDasharray="11 238" strokeDashoffset="-227" strokeWidth="12" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline-md text-headline-md text-on-surface">482</span>
                <span className="font-mono-code text-label-sm text-on-surface-variant">Candidates</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary-container" />
                <span className="text-on-surface">
                  Sourced <span className="font-mono-code text-on-surface-variant">216</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-secondary-container" />
                <span className="text-on-surface">
                  Screening <span className="font-mono-code text-on-surface-variant">120</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-tertiary" />
                <span className="text-on-surface">
                  Interview <span className="font-mono-code text-on-surface-variant">72</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-secondary" />
                <span className="text-on-surface">
                  Offer <span className="font-mono-code text-on-surface-variant">48</span>
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-on-surface">
                  Hired <span className="font-mono-code text-tertiary">26</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Top In-Demand Skills */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Top In-Demand Skills
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Synthesized from open technical job specs
              </p>
            </div>
            <span className="font-mono-code text-label-sm text-tertiary">Weighted AI Index</span>
          </div>
          <div className="flex flex-col gap-3 py-1">
            {[
              { name: 'Python', val: '88%', textClass: 'text-primary', barClass: 'bg-primary-container' },
              { name: 'React / Next.js', val: '82%', textClass: 'text-secondary', barClass: 'bg-secondary-container' },
              { name: 'AWS / Cloud Architecture', val: '74%', textClass: 'text-tertiary', barClass: 'bg-tertiary-container' },
              { name: 'AI / ML Infrastructure', val: '69%', textClass: 'text-primary-fixed', barClass: 'bg-primary-fixed' },
              { name: 'Node.js / Express', val: '61%', textClass: 'text-on-surface-variant', barClass: 'bg-surface-variant' },
            ].map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between font-label-md text-label-md text-on-surface mb-1">
                  <span>{skill.name}</span>
                  <span className={`font-mono-code ${skill.textClass}`}>{skill.val}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className={`${skill.barClass} h-full rounded-full`} style={{ width: skill.val }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: 2-Column Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">
        {/* Left Column: Top Matching Candidates Table */}
        <div className="xl:col-span-2 p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Top Matching Candidates
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ranked via semantic profile scoring
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('candidate-ranking')}
                className="font-label-md text-label-md text-primary hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All Rankings</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left tabular-nums">
                <thead>
                  <tr className="bg-surface-container-lowest/50 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Candidate</th>
                    <th className="py-2.5 px-3">Job Role</th>
                    <th className="py-2.5 px-3">Match Score</th>
                    <th className="py-2.5 px-3">Experience</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {topMatching.map((cand, index) => {
                    const avatarStyles = [
                      'bg-primary-container text-on-primary-container',
                      'bg-secondary-container text-on-secondary-container',
                      'bg-tertiary-container text-on-tertiary-container',
                      'bg-surface-variant text-on-surface',
                    ];
                    const roleTitles = [
                      'Python Developer',
                      'Full Stack Developer',
                      'AI/ML Engineer',
                      'Data Analyst',
                    ];
                    const scoreColors = [
                      'text-tertiary bg-tertiary',
                      'text-secondary bg-secondary',
                      'text-tertiary-fixed-dim bg-tertiary-fixed-dim',
                      'text-on-surface-variant bg-on-surface-variant',
                    ];
                    const [textC, dotC] = scoreColors[index].split(' ');

                    return (
                      <tr key={cand.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full font-headline-sm text-label-md flex items-center justify-center shrink-0 ${avatarStyles[index]}`}
                            >
                              {cand.initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                                {cand.name}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                                {cand.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-body-sm text-body-sm text-on-surface">
                            {roleTitles[index]}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest font-mono-code text-label-sm font-semibold ${textC}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotC}`} />
                            {cand.matchScore}% Match
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono-code text-body-sm text-on-surface-variant">
                          {cand.experience}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm">
                            Shortlisted
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(cand)}
                            className="px-3 py-1 bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface rounded-lg font-label-md text-label-md transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span>Showing 4 of 64 shortlisted profiles</span>
            <div className="flex gap-1">
              <button
                className="px-2 py-1 rounded bg-surface-container hover:bg-surface-variant transition-colors text-on-surface disabled:opacity-40"
                disabled
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('candidates')}
                className="px-2 py-1 rounded bg-surface-container hover:bg-surface-variant transition-colors text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Hiring Activity Timeline */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Recent Activity
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Live audit log of recruitment events
                  </p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-4 ring-surface-container-low">
                  <span className="material-symbols-outlined text-[12px]">upload</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                    New resume uploaded{' '}
                    <span className="font-mono-code text-[11px] text-primary">
                      (Rahul_Sharma_CV.pdf)
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      10m ago
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-label-sm text-label-sm text-tertiary">
                      Parsed Successfully
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center ring-4 ring-surface-container-low">
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                    Arjun Kumar shortlisted for{' '}
                    <span className="text-tertiary font-medium">AI/ML Engineer</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      42m ago
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-mono-code text-label-sm text-secondary">86% Score</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center ring-4 ring-surface-container-low">
                  <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                    Interview scheduled with{' '}
                    <span className="text-on-surface font-medium">Priya Verma</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      2h ago
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      Technical Round 1
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-bright text-on-surface flex items-center justify-center ring-4 ring-surface-container-low">
                  <span className="material-symbols-outlined text-[12px]">work</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                    New job created:{' '}
                    <span className="text-on-surface font-medium">Senior DevOps Engineer</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      4h ago
                    </span>
                    <span className="text-outline">•</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container text-error font-mono-code text-[10px]">
                      Urgent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-mono-code text-[11px] text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Stream Connected
            </span>
            <button
              type="button"
              onClick={() => setShowLogsModal(true)}
              className="text-tertiary font-label-md text-label-md hover:underline cursor-pointer"
            >
              View Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Engine Logs / Audit Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setShowLogsModal(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div>
                <h3 className="font-headline-md text-on-surface">
                  AI Matching Engine Logs (v2.4 Pro)
                </h3>
                <p className="font-body-sm text-on-surface-variant">
                  Real-time semantic indexing &amp; recruitment audit stream
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2 font-mono-code text-[11px] bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 max-h-72 overflow-y-auto">
              <div className="text-emerald-400">
                [19:14:02] PARSER_OK :: Rahul_Sharma_Resume.pdf · 1.4s · 92% Python Dev alignment
              </div>
              <div className="text-tertiary">
                [19:12:48] VECTOR_INDEX :: Clustered 148 candidates across 42,000 taxonomy nodes
              </div>
              <div className="text-amber-300">
                [19:09:11] DEDUP_WARN :: Sneha_Reddy_Analyst.pdf matched DB record #441 (98.4%)
              </div>
              <div className="text-on-surface-variant">
                [18:55:20] STAGE_UPDATE :: Priya Verma moved to Technical Round 1
              </div>
              <div className="text-primary">
                [18:30:04] JOB_SYNC :: Senior DevOps Engineer indexed (Urgent priority)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
