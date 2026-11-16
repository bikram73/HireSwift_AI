import React, { useState } from 'react';
import {
  CANDIDATES_DATA,
  PIPELINE_CANDIDATES,
  JOBS_DATA,
  CandidateProfile,
  JobPosting,
  WorkspaceRoute,
} from '../../data/atsData';

interface ViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

/* -------------------------------------------------------------------------- */
/* 1. AI MATCHING VIEW (Strictly modeled after screen_630d9ae4.png)          */
/* -------------------------------------------------------------------------- */
export const AIMatchingView: React.FC<ViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const [selectedSpotlight, setSelectedSpotlight] = useState<CandidateProfile>(
    PIPELINE_CANDIDATES[0]
  );
  const [activeStageFilter, setActiveStageFilter] = useState<string>('All');

  const stageCounts = [
    { name: 'Sourced', count: 49, icon: 'radar' },
    { name: 'Screening', count: 28, icon: 'fact_check' },
    { name: 'Interview', count: 19, icon: 'record_voice_over' },
    { name: 'Offer', count: 6, icon: 'description' },
    { name: 'Hired', count: 3, icon: 'verified' },
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 font-mono-code text-mono-code text-tertiary mb-1">
            <span>NEURAL_MATCHING</span>
            <span className="text-outline">/</span>
            <span>TALENT_PIPELINE_V2.4</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Talent Pipeline &amp; Matching
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Semantic candidate-JD alignment with multi-axis competency radar scoring.
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => onNavigate('compare-candidates')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-primary">
              compare_arrows
            </span>
            <span>Compare Top Picks</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
            <span>Re-Score Batch</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split matching screen_630d9ae4.png */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left Spotlight Card + Radar + Pipeline Tiles */}
        <div className="xl:col-span-5 rounded-xl bg-surface-container-low p-space-lg shadow-md flex flex-col gap-space-lg relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

          {/* Candidate Header */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-headline-md font-bold text-lg shrink-0 ring-2 ring-emerald-400/50 ${selectedSpotlight.avatarTone}`}
              >
                {selectedSpotlight.initials}
              </div>
              <div>
                <h2 className="font-headline-md text-on-surface font-semibold">
                  {selectedSpotlight.name}
                </h2>
                <p className="font-body-sm text-on-surface-variant">
                  {selectedSpotlight.role}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="font-mono-code text-[11px] text-emerald-400 font-semibold">
                    AI Match: {selectedSpotlight.matchScore}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary-container/30 border border-primary/30 font-mono-code text-[11px] text-primary">
                    Score: {selectedSpotlight.matchScore}% [High Match]
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectCandidate(selectedSpotlight)}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface cursor-pointer"
              title="Open Full Dossier"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          </div>

          <div className="text-xs text-on-surface-variant">
            <span className="text-on-surface font-medium">Current Stack:</span>{' '}
            {selectedSpotlight.skills.join(', ')}
          </div>

          {/* Skills Chips */}
          <div>
            <span className="font-label-sm text-outline uppercase tracking-wider block mb-2">
              Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedSpotlight.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-md bg-surface-container-high border border-outline-variant/30 font-mono-code text-xs text-on-surface"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Competency Radar Chart */}
          <div className="py-2 flex flex-col items-center">
            <div className="relative w-64 h-52 flex items-center justify-center">
              <svg viewBox="0 0 260 210" className="w-full h-full">
                {/* Concentric Pentagons / Diamonds */}
                <polygon
                  points="130,30 210,95 180,175 80,175 50,95"
                  fill="none"
                  stroke="#2f3446"
                  strokeWidth="1"
                />
                <polygon
                  points="130,55 185,100 164,158 96,158 75,100"
                  fill="none"
                  stroke="#2f3446"
                  strokeWidth="1"
                />
                <polygon
                  points="130,80 160,106 149,140 111,140 100,106"
                  fill="none"
                  stroke="#2f3446"
                  strokeWidth="1"
                />
                {/* Axes */}
                <line x1="130" y1="30" x2="130" y2="108" stroke="#2f3446" strokeWidth="1" />
                <line x1="210" y1="95" x2="130" y2="108" stroke="#2f3446" strokeWidth="1" />
                <line x1="180" y1="175" x2="130" y2="108" stroke="#2f3446" strokeWidth="1" />
                <line x1="80" y1="175" x2="130" y2="108" stroke="#2f3446" strokeWidth="1" />
                <line x1="50" y1="95" x2="130" y2="108" stroke="#2f3446" strokeWidth="1" />

                {/* Data Polygon */}
                <polygon
                  points={`130,${108 - selectedSpotlight.radar.communication * 0.72} ${
                    130 + selectedSpotlight.radar.problemSolving * 0.75
                  },${108 - 10} ${130 + selectedSpotlight.radar.culturalFit * 0.52},${
                    108 + selectedSpotlight.radar.culturalFit * 0.65
                  } ${130 - selectedSpotlight.radar.technicalSkills * 0.52},${
                    108 + selectedSpotlight.radar.technicalSkills * 0.65
                  } ${130 - selectedSpotlight.radar.architecture * 0.75},${108 - 10}`}
                  fill="rgba(139, 92, 246, 0.35)"
                  stroke="#c3c0ff"
                  strokeWidth="2"
                />
                <text x="130" y="18" textAnchor="middle" fill="#c7c4d8" fontSize="11">
                  Communication
                </text>
                <text x="218" y="96" textAnchor="start" fill="#c7c4d8" fontSize="11">
                  Problem Solving
                </text>
                <text x="184" y="194" textAnchor="middle" fill="#c7c4d8" fontSize="11">
                  Cultural Fit
                </text>
                <text x="74" y="194" textAnchor="middle" fill="#c7c4d8" fontSize="11">
                  Technical Skills
                </text>
                <text x="42" y="96" textAnchor="end" fill="#c7c4d8" fontSize="11">
                  Architecture
                </text>
              </svg>
            </div>
          </div>

          {/* Talent Pipeline Mini-Tiles */}
          <div>
            <span className="font-headline-sm text-on-surface font-semibold block mb-3">
              Talent Pipeline
            </span>
            <div className="grid grid-cols-3 gap-2.5 tabular-nums">
              {stageCounts.map((st) => {
                const isSelected = activeStageFilter === st.name;
                return (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() =>
                      setActiveStageFilter(isSelected ? 'All' : st.name)
                    }
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary-container/25 border-primary text-on-surface shadow-sm'
                        : 'bg-surface-container border-outline-variant/25 hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body-sm font-medium text-on-surface">
                        {st.name}
                      </span>
                      <span className="material-symbols-outlined text-[15px] text-primary">
                        {st.icon}
                      </span>
                    </div>
                    <span className="font-mono-code text-xs text-tertiary block mt-1">
                      ({st.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Active Candidates List */}
        <div className="xl:col-span-7 flex flex-col gap-space-md">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-headline-md text-on-surface font-semibold">
              Active Candidates
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStageFilter('All')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">filter_list</span>
                <span>{activeStageFilter === 'All' ? 'All Stages' : activeStageFilter}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('hiring-pipeline')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">view_kanban</span>
                <span>Kanban View</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 tabular-nums">
            {PIPELINE_CANDIDATES.map((cand) => {
              const isSpotlight = selectedSpotlight.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedSpotlight(cand)}
                  className={`rounded-xl p-4 transition-all cursor-pointer border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSpotlight
                      ? 'bg-surface-container border-primary/60 shadow-md'
                      : 'bg-surface-container-low border-outline-variant/25 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-headline-sm font-bold shrink-0 ${cand.avatarTone}`}
                    >
                      {cand.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-on-surface font-semibold">
                          {cand.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary font-mono-code text-[11px] font-semibold">
                          AI Match: {cand.matchScore}%
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-label-sm text-[11px]">
                          {cand.status}
                        </span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant mt-0.5">
                        {cand.role} ·{' '}
                        <span className="text-emerald-400 font-mono-code">
                          Score: {cand.matchScore}%
                        </span>{' '}
                        <span className="text-tertiary">[High Match]</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('email-center');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">mail</span>
                      <span>Message</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        visibility
                      </span>
                      <span>View Profile</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. HIRING PIPELINE (Kanban Board)                                          */
/* -------------------------------------------------------------------------- */
export const HiringPipelineView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const initialCols: {
    id: CandidateProfile['status'];
    title: string;
    cards: CandidateProfile[];
  }[] = [
    {
      id: 'Applied',
      title: 'Sourced / Applied',
      cards: CANDIDATES_DATA.filter((c) => c.status === 'Applied'),
    },
    {
      id: 'Screening',
      title: 'Screening',
      cards: CANDIDATES_DATA.filter((c) => c.status === 'Screening' || c.status === 'Reviewing'),
    },
    {
      id: 'Shortlisted',
      title: 'Shortlisted',
      cards: CANDIDATES_DATA.filter((c) => c.status === 'Shortlisted'),
    },
    {
      id: 'Interview',
      title: 'Interview',
      cards: [CANDIDATES_DATA[1], PIPELINE_CANDIDATES[0]],
    },
    {
      id: 'Offer',
      title: 'Offer',
      cards: [PIPELINE_CANDIDATES[1]],
    },
  ];

  const [columns, setColumns] = useState(initialCols);

  const moveCard = (cardId: string, fromColIdx: number, direction: 1 | -1) => {
    const targetIdx = fromColIdx + direction;
    if (targetIdx < 0 || targetIdx >= columns.length) return;
    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const cardIdx = next[fromColIdx].cards.findIndex((c) => c.id === cardId);
      if (cardIdx === -1) return prev;
      const [card] = next[fromColIdx].cards.splice(cardIdx, 1);
      next[targetIdx].cards.unshift(card);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Hiring Pipeline
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Move applicants across stages with live semantic scorecards and stage timers.
          </p>
        </div>
        <span className="font-mono-code text-xs px-3 py-1.5 rounded-lg bg-surface-container-low text-tertiary">
          5 Active Stages · {columns.reduce((acc, c) => acc + c.cards.length, 0)} Cards
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="rounded-xl bg-[#0F172A] border border-[#263449] p-3 flex flex-col gap-3 min-h-[440px]"
          >
            <div className="flex items-center justify-between px-1 py-1">
              <span className="font-label-sm uppercase tracking-wider text-on-surface font-semibold">
                {col.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-mono-code text-[11px] text-tertiary tabular-nums">
                {col.cards.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onSelectCandidate(card)}
                  className="rounded-xl bg-[#151E32] border border-[#263449] hover:border-[#3B82F6] hover:bg-[#1B2740] p-3.5 transition-all cursor-pointer flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${card.avatarTone}`}
                      >
                        {card.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-sm font-semibold text-on-surface truncate">
                          {card.name}
                        </p>
                        <p className="text-[11px] text-outline truncate">{card.role}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-[10px] font-bold shrink-0 tabular-nums">
                      {card.matchScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {card.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px] text-on-surface-variant"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#263449]/70">
                    <span className="font-mono-code text-[10px] text-outline">
                      {card.experience}
                    </span>
                    <div className="flex items-center gap-1">
                      {colIdx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCard(card.id, colIdx, -1);
                          }}
                          className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface-variant cursor-pointer"
                          title="Move back"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            chevron_left
                          </span>
                        </button>
                      )}
                      {colIdx < columns.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCard(card.id, colIdx, 1);
                          }}
                          className="p-1 rounded bg-primary-container/30 hover:bg-primary-container text-primary hover:text-white cursor-pointer"
                          title="Advance stage"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            chevron_right
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. JOB MANAGEMENT VIEW                                                     */
/* -------------------------------------------------------------------------- */
export const JobManagementView: React.FC<{ onNavigate: (r: WorkspaceRoute) => void }> = ({
  onNavigate,
}) => {
  const [jobs, setJobs] = useState<JobPosting[]>(JOBS_DATA);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSkills, setNewSkills] = useState('TypeScript, React, Node.js');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: JobPosting = {
      id: `job-${Date.now()}`,
      title: newTitle.trim(),
      department: newDept,
      location: newLocation,
      type: 'Full-Time',
      priority: 'High',
      applicants: 0,
      shortlisted: 0,
      avgMatch: 0,
      status: 'Active',
      skills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      salaryRange: '$130k – $160k',
      postedAgo: 'Just now',
    };
    setJobs((prev) => [created, ...prev]);
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Job Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage open requisitions, AI matching rubrics, and applicant yield.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg tabular-nums">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl bg-surface-container-low border border-outline-variant/25 p-5 flex flex-col justify-between gap-4 hover:bg-surface-container transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-on-surface font-semibold">
                      {job.title}
                    </h3>
                    {job.priority === 'Urgent' && (
                      <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-mono-code text-[10px]">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    {job.department} · {job.location} · {job.salaryRange}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-[11px]">
                  {job.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded bg-surface-container-high font-mono-code text-[11px] text-on-surface-variant"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 font-mono-code text-xs text-on-surface-variant">
                <span>
                  <strong className="text-on-surface">{job.applicants}</strong> Applicants
                </span>
                <span>
                  <strong className="text-secondary">{job.shortlisted}</strong> Shortlisted
                </span>
                <span>
                  <strong className="text-tertiary">{job.avgMatch}%</strong> Avg Match
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('candidates')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
                >
                  View Applicants
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('ai-matching')}
                  className="px-3 py-1.5 rounded-lg bg-primary-container/25 hover:bg-primary-container text-xs text-primary hover:text-white cursor-pointer transition-colors"
                >
                  AI Match
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          />
          <form
            onSubmit={handleCreateJob}
            className="relative w-full max-w-lg rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl p-6 z-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-on-surface">Create New Job Requisition</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>
              <label className="font-label-sm text-outline block mb-1">Role Title</label>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Staff Backend Engineer"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label-sm text-outline block mb-1">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-label-sm text-outline block mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-label-sm text-outline block mb-1">
                Required Skills (comma separated)
              </label>
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-xs text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer"
              >
                Publish Job
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. CANDIDATE RANKING VIEW                                                  */
/* -------------------------------------------------------------------------- */
export const CandidateRankingView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const ranked = [...PIPELINE_CANDIDATES, ...CANDIDATES_DATA].sort(
    (a, b) => b.matchScore - a.matchScore
  );

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Candidate Ranking
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Global leaderboard ordered by composite AI semantic alignment, academic score, and tenure.
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-low overflow-hidden shadow-sm">
        <table className="w-full text-left tabular-nums">
          <thead>
            <tr className="bg-surface-container-high/60 text-outline font-label-sm uppercase tracking-wider">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Target Role</th>
              <th className="py-3 px-4">AI Fit Score</th>
              <th className="py-3 px-4">Architecture</th>
              <th className="py-3 px-4">CGPA</th>
              <th className="py-3 px-4 text-right">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-sm">
            {ranked.map((cand, idx) => (
              <tr key={cand.id} className="hover:bg-surface-container/60 transition-colors">
                <td className="py-3.5 px-4 font-mono-code font-bold text-primary">
                  #{idx + 1}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cand.avatarTone}`}
                    >
                      {cand.initials}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{cand.name}</p>
                      <p className="font-mono-code text-[11px] text-outline">{cand.location}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">{cand.role}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-xs font-bold">
                    {cand.matchScore}%
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono-code text-tertiary">
                  {cand.radar.architecture}%
                </td>
                <td className="py-3.5 px-4 font-mono-code text-on-surface-variant">
                  {cand.cgpa}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectCandidate(cand)}
                    className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-white text-xs text-on-surface cursor-pointer transition-colors"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. COMPARE CANDIDATES VIEW                                                 */
/* -------------------------------------------------------------------------- */
export const CompareCandidatesView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const compared = [CANDIDATES_DATA[0], CANDIDATES_DATA[1], PIPELINE_CANDIDATES[0]];

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Compare Candidates
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Side-by-side competency matrix to eliminate evaluation bias among finalists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg tabular-nums">
        {compared.map((cand) => (
          <div
            key={cand.id}
            className="rounded-xl bg-surface-container-low border border-outline-variant/25 p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${cand.avatarTone}`}
                >
                  {cand.initials}
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-semibold">
                    {cand.name}
                  </h3>
                  <p className="text-xs text-outline">{cand.role}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container/30 text-primary font-mono-code text-xs font-bold">
                {cand.matchScore}%
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-outline-variant/20">
              {[
                { label: 'Technical Skills', v: cand.radar.technicalSkills },
                { label: 'System Architecture', v: cand.radar.architecture },
                { label: 'Problem Solving', v: cand.radar.problemSolving },
                { label: 'Communication', v: cand.radar.communication },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{m.label}</span>
                    <span className="font-mono-code text-on-surface font-bold">{m.v}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container"
                      style={{ width: `${m.v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-on-surface-variant space-y-1 pt-2 border-t border-outline-variant/20">
              <div className="flex justify-between">
                <span className="text-outline">Education:</span>
                <span className="text-on-surface">
                  {cand.education} ({cand.cgpa})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Experience:</span>
                <span className="text-on-surface">{cand.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Stage:</span>
                <span className="text-tertiary">{cand.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectCandidate(cand)}
              className="mt-auto w-full py-2 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-white text-xs font-medium text-on-surface transition-colors cursor-pointer"
            >
              Open Full Dossier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
