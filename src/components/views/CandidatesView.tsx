import React, { useState } from 'react';
import { CANDIDATES_DATA, CandidateProfile, WorkspaceRoute } from '../../data/atsData';

interface CandidatesViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Jobs (8 Active)');
  const [scoreFilter, setScoreFilter] = useState('All Scores');
  const [expFilter, setExpFilter] = useState('All Experience');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [selectedIds, setSelectedIds] = useState<string[]>(['cand-1', 'cand-2']);
  const [drawerVisible, setDrawerVisible] = useState(true);
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [tenthCutoff, setTenthCutoff] = useState<'Any' | '80%+' | '90%+'>('80%+');
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([
    'B.Tech / B.E. (Computer Science)',
    'M.Tech / M.S.',
  ]);
  const [techStack, setTechStack] = useState<string[]>([
    'Python',
    'React',
    'AWS',
    'PyTorch',
    'Docker',
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleDegree = (deg: string) => {
    setSelectedDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
    );
  };

  const filteredCandidates = CANDIDATES_DATA.filter((cand) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      cand.name.toLowerCase().includes(q) ||
      cand.email.toLowerCase().includes(q) ||
      cand.skills.some((s) => s.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'All Jobs (8 Active)' || cand.role === roleFilter;

    const matchesScore =
      scoreFilter === 'All Scores' ||
      (scoreFilter === '90%+ Excellent' && cand.matchScore >= 90) ||
      (scoreFilter === '80% - 89% Strong' &&
        cand.matchScore >= 80 &&
        cand.matchScore < 90) ||
      (scoreFilter === '70% - 79% Good' &&
        cand.matchScore >= 70 &&
        cand.matchScore < 80) ||
      (scoreFilter === '< 70% Flagged' && cand.matchScore < 70);

    const matchesExp =
      expFilter === 'All Experience' ||
      (expFilter === '0 - 2 years' && cand.experienceYears <= 2) ||
      (expFilter === '3 - 5 years' &&
        cand.experienceYears >= 3 &&
        cand.experienceYears <= 5) ||
      (expFilter === '5+ years' && cand.experienceYears >= 5) ||
      (expFilter === 'Leadership (8+ yrs)' && cand.experienceYears >= 8);

    const matchesStage =
      stageFilter === 'All Stages' ||
      stageFilter.toLowerCase().startsWith(cand.status.toLowerCase());

    return (
      matchesSearch && matchesRole && matchesScore && matchesExp && matchesStage
    );
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All Jobs (8 Active)');
    setScoreFilter('All Scores');
    setExpFilter('All Experience');
    setStageFilter('All Stages');
    setMinCgpa(7.5);
    setTenthCutoff('80%+');
    setTechStack(['Python', 'React', 'AWS', 'PyTorch', 'Docker']);
    triggerToast('Precision filters reset to defaults');
  };

  return (
    <div className="flex flex-col w-full">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-surface-container border border-primary-container/50 shadow-2xl text-xs font-medium text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Command Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-mono-code text-[11px] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              CANDIDATE REPOSITORY • LIVE INGESTION
            </span>
            <span className="font-mono-code text-[11px] text-outline">
              AUTO-SYNC ACTIVE
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-headline-xl text-white tracking-tight">
            Candidates
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Manage, search, filter, and review all applicants across active roles with neural semantic scoring.
          </p>
        </div>

        <div className="flex items-center gap-space-md flex-wrap">
          <button
            type="button"
            onClick={() => triggerToast('Exported 482 candidate records to CSV')}
            className="flex items-center gap-space-xs px-space-lg py-2 rounded-xl bg-[#151E32] border border-[#263449] text-white font-label-md text-label-md hover:bg-[#1B2740] transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#94A3B8]">
              download
            </span>
            <span>Export Candidates</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="flex items-center gap-space-xs px-space-xl py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-label-md text-label-md font-semibold hover:opacity-95 shadow-lg shadow-indigo-600/25 border border-white/15 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* Performance & Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-xl tabular-nums">
        <div className="relative overflow-hidden rounded-2xl glass-card p-space-lg shadow-sm">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Total Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              482
            </span>
            <span className="font-mono-code text-mono-code text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">
                arrow_upward
              </span>
              +14.2%
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
            Aggregated across 8 open requisitions
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl glass-card p-space-lg shadow-sm">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-tertiary/5 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              New Applicants
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              38
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary font-mono-code text-[11px] font-semibold">
              Today
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
            Pending first-pass AI evaluation
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl glass-card p-space-lg shadow-sm">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary/5 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              64
            </span>
            <span className="font-mono-code text-mono-code text-secondary">
              13.2% yield
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
            Ready for hiring lead sign-off
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl glass-card p-space-lg shadow-sm">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Average Match Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                psychology
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              84.6%
            </span>
            <span className="font-mono-code text-mono-code text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              +3.1 pt
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
            High semantic alignment baseline
          </span>
        </div>
      </div>

      {/* Primary Workspace Content */}
      <div className="relative flex flex-col xl:flex-row gap-space-xl items-start">
        {/* Left Main Column */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-space-lg">
          {/* Search & Filters Toolbar */}
          <div className="rounded-2xl glass-card p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-space-md">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  search
                </span>
                <input
                  className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm outline-none focus:bg-surface-container transition-all"
                  placeholder="Search by candidate name, email, or skill keywords..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-space-xs self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setDrawerVisible((v) => !v)}
                  className="flex items-center gap-space-xs px-3 h-10 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-bright transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    tune
                  </span>
                  <span>Advanced Filters</span>
                  <span className="w-2 h-2 rounded-full bg-primary ml-1" />
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                  title="Reset filters"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    refresh
                  </span>
                </button>
              </div>
            </div>

            {/* Filter Selects Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline">
                  Job Role
                </label>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer outline-none"
                  >
                    <option>All Jobs (8 Active)</option>
                    <option>Senior Python Dev</option>
                    <option>Full Stack Engineer</option>
                    <option>Machine Learning Lead</option>
                    <option>Data Analyst</option>
                    <option>Backend Platform Dev</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline">
                  Match Score
                </label>
                <div className="relative">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer outline-none"
                  >
                    <option>All Scores</option>
                    <option>90%+ Excellent</option>
                    <option>80% - 89% Strong</option>
                    <option>70% - 79% Good</option>
                    <option>&lt; 70% Flagged</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline">
                  Experience
                </label>
                <div className="relative">
                  <select
                    value={expFilter}
                    onChange={(e) => setExpFilter(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer outline-none"
                  >
                    <option>All Experience</option>
                    <option>0 - 2 years</option>
                    <option>3 - 5 years</option>
                    <option>5+ years</option>
                    <option>Leadership (8+ yrs)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline">
                  Hiring Stage
                </label>
                <div className="relative">
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer outline-none"
                  >
                    <option>All Stages</option>
                    <option>Applied (184)</option>
                    <option>Screening (112)</option>
                    <option>Shortlisted (64)</option>
                    <option>Interview (42)</option>
                    <option>Reviewing (24)</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Actions Bar */}
          <div className="rounded-2xl glass-card p-space-md shadow-md flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container font-mono-code text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">
                  check_box
                </span>
                <span>{selectedIds.length} Selected</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
                Bulk candidate pipeline operations
              </span>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <button
                type="button"
                onClick={() =>
                  triggerToast(`Shortlisted ${selectedIds.length} selected candidates`)
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  star
                </span>
                <span>Bulk Shortlist</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('email-center')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  mail
                </span>
                <span>Send Email</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('compare-candidates')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  compare_arrows
                </span>
                <span>Compare Candidates</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Selected candidates exported to CSV')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-outline hover:text-on-surface font-label-sm text-label-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  file_download
                </span>
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Candidate Data Table Container */}
          <div className="rounded-2xl glass-card shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse tabular-nums">
                <thead>
                  <tr className="bg-surface-container-high/60 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredCandidates.length > 0 &&
                          selectedIds.length === filteredCandidates.length
                        }
                        onChange={toggleAll}
                        className="w-4 h-4 rounded bg-surface-container border-none cursor-pointer accent-primary-container"
                      />
                    </th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Education &amp; CGPA</th>
                    <th className="py-3 px-4">Exp</th>
                    <th className="py-3 px-4">Primary Skills</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
                  {filteredCandidates.map((cand) => {
                    const isSelected = selectedIds.includes(cand.id);
                    const scoreStyle =
                      cand.matchScore >= 89
                        ? 'bg-tertiary-container/30 text-tertiary'
                        : cand.matchScore >= 80
                          ? 'bg-tertiary-container/20 text-tertiary-fixed'
                          : 'bg-secondary-fixed/10 text-secondary-fixed-dim';
                    const dotStyle =
                      cand.matchScore >= 89
                        ? 'bg-tertiary'
                        : cand.matchScore >= 80
                          ? 'bg-tertiary-fixed'
                          : 'bg-secondary-fixed-dim';

                    const statusBadge =
                      cand.status === 'Shortlisted'
                        ? 'bg-secondary-container/40 text-secondary'
                        : cand.status === 'Interview'
                          ? 'bg-primary-container/30 text-primary'
                          : cand.status === 'Reviewing'
                            ? 'bg-surface-container-high text-on-surface-variant'
                            : cand.status === 'Screening'
                              ? 'bg-tertiary-container/30 text-tertiary'
                              : 'bg-surface-container-highest text-outline';

                    return (
                      <tr
                        key={cand.id}
                        className="hover:bg-surface-container/60 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(cand.id)}
                            className="w-4 h-4 rounded cursor-pointer accent-primary-container"
                          />
                        </td>
                        <td
                          className="py-3.5 px-4 min-w-[200px] cursor-pointer"
                          onClick={() => onSelectCandidate(cand)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm font-semibold ${cand.avatarTone}`}
                            >
                              {cand.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-medium group-hover:text-primary transition-colors">
                                {cand.name}
                              </span>
                              <span className="font-mono-code text-[11px] text-outline">
                                {cand.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-outline">
                              location_on
                            </span>
                            <span>{cand.location}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-on-surface">{cand.education}</span>
                            <span
                              className={`font-mono-code text-[11px] ${
                                parseFloat(cand.cgpa) >= 8.2
                                  ? 'text-tertiary'
                                  : 'text-on-surface-variant'
                              }`}
                            >
                              {cand.cgpa}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono-code text-on-surface">
                          {cand.experience}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {cand.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono-code text-[10px]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-code text-[11px] font-bold ${scoreStyle}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                            <span>{cand.matchLabel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm ${statusBadge}`}
                          >
                            {cand.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectCandidate(cand)}
                              className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer"
                              title="View Profile"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                triggerToast(`${cand.name} fast-tracked to Shortlisted`)
                              }
                              className="p-1.5 rounded-md hover:bg-surface-container-high text-primary hover:text-primary-fixed cursor-pointer"
                              title="Fast Action"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                verified
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectCandidate(cand)}
                              className="p-1.5 rounded-md hover:bg-surface-container-high text-outline hover:text-on-surface cursor-pointer"
                              title="More Options"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                more_vert
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                        <p className="font-headline-sm text-on-surface mb-1">
                          No candidates match the current filter criteria
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-xs text-primary hover:underline cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-space-md bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>
                  Showing <span className="font-medium text-on-surface">1</span> to{' '}
                  <span className="font-medium text-on-surface">
                    {filteredCandidates.length}
                  </span>{' '}
                  of <span className="font-medium text-on-surface">482</span> candidates
                </span>
                <span className="font-mono-code text-[11px] text-outline hidden md:inline">
                  • Latency 24ms
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button
                  className="flex items-center justify-center p-1.5 rounded-lg bg-surface-container-high text-outline opacity-40 cursor-not-allowed"
                  disabled
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-mono-code text-mono-code font-bold cursor-pointer"
                  type="button"
                >
                  1
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-code text-mono-code transition-all cursor-pointer"
                  type="button"
                >
                  2
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-code text-mono-code transition-all cursor-pointer"
                  type="button"
                >
                  3
                </button>
                <span className="px-1 font-mono-code text-outline">...</span>
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-code text-mono-code transition-all cursor-pointer"
                  type="button"
                >
                  41
                </button>
                <button
                  className="flex items-center justify-center p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filter Slide-Out / Persistent Preview Panel */}
        {drawerVisible && (
          <div className="w-full xl:w-80 shrink-0 rounded-2xl glass-card p-space-lg shadow-xl flex flex-col gap-space-lg transition-all duration-300">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  filter_alt
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Precision Filters
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-mono-code text-[11px] text-tertiary hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* CGPA Threshold Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-label-md text-label-md">
                <span className="text-on-surface font-medium">Minimum CGPA</span>
                <span className="font-mono-code text-[12px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-bold tabular-nums">
                  {minCgpa.toFixed(1)} / 10
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={minCgpa}
                onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between font-mono-code text-[10px] text-outline">
                <span>5.0</span>
                <span>7.5 (Standard)</span>
                <span>10.0</span>
              </div>
            </div>

            {/* 10th / 12th Academic Cutoff */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-label-md text-label-md">
                <span className="text-on-surface font-medium">10th / 12th Score</span>
                <span className="font-mono-code text-[12px] px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-bold">
                  ≥ {tenthCutoff === 'Any' ? '0%' : tenthCutoff.replace('+', '')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Any', '80%+', '90%+'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTenthCutoff(opt)}
                    className={`py-1.5 px-2 rounded-lg font-mono-code text-[11px] text-center transition-colors cursor-pointer ${
                      tenthCutoff === opt
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'bg-surface-container-high hover:bg-surface-bright text-on-surface-variant'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Degree Qualification */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface font-medium">
                Degree Level
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  'B.Tech / B.E. (Computer Science)',
                  'M.Tech / M.S.',
                  'B.Sc / BCA / MCA',
                  'Other Relevant STEM',
                ].map((deg) => (
                  <label
                    key={deg}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface cursor-pointer text-body-sm font-body-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDegrees.includes(deg)}
                      onChange={() => toggleDegree(deg)}
                      className="w-4 h-4 rounded bg-surface-container-highest accent-primary-container"
                    />
                    <span>{deg}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Multi-select Skills Tags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-medium">
                  Target Tech Stack
                </label>
                <span className="font-mono-code text-[10px] text-outline">
                  {techStack.length} SELECTED
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-mono-code text-[11px] font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setTechStack((prev) => prev.filter((s) => s !== skill))
                      }
                      className="material-symbols-outlined text-[12px] cursor-pointer hover:opacity-75"
                    >
                      close
                    </button>
                  </span>
                ))}

                {addingSkill ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newSkill.trim() && !techStack.includes(newSkill.trim())) {
                        setTechStack((prev) => [...prev, newSkill.trim()]);
                      }
                      setNewSkill('');
                      setAddingSkill(false);
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Skill..."
                      className="w-24 px-2 py-1 rounded bg-surface-container-highest text-xs text-on-surface outline-none"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingSkill(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface font-mono-code text-[11px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>{' '}
                    Add Skill
                  </button>
                )}
              </div>
            </div>

            {/* Semantic Matching Sensitivity */}
            <div className="flex flex-col gap-2 pt-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-medium flex items-center gap-1">
                <span>AI Embedding Strictness</span>
                <span className="material-symbols-outlined text-[14px] text-outline">
                  help
                </span>
              </label>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-high">
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    Dense Vector Threshold
                  </span>
                  <span className="font-mono-code text-[10px] text-outline">
                    Cosine similarity &gt; 0.82
                  </span>
                </div>
                <span className="font-mono-code text-[11px] text-tertiary font-bold">
                  Strict
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-auto pt-space-md flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerToast(
                    `Applied filters: CGPA ≥ ${minCgpa.toFixed(1)}, ${techStack.length} target skills`
                  )
                }
                className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  auto_awesome
                </span>
                <span>Apply {techStack.length + 1} Active Filters</span>
              </button>
              <span className="text-center font-mono-code text-[10px] text-outline">
                Yield estimation: ~46 candidates
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
