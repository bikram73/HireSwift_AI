import React, { useMemo, useState } from 'react';
import { useAts } from '../../context/AtsContext';
import {
  CandidateProfile,
  EmploymentType,
  HiringStage,
  JobPosting,
  JobStatus,
  WorkspaceRoute,
} from '../../data/atsData';
import { exportObjectToJson, exportRowsToCsv, normalizeSkillName } from '../../utils/atsEngine';

interface ViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

/* -------------------------------------------------------------------------- */
/* 1. AI MATCHING VIEW (Preserves screen_630d9ae4.png Split Layout)           */
/* -------------------------------------------------------------------------- */
export const AIMatchingView: React.FC<ViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const {
    candidates,
    jobs,
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    getMatchFor,
    runGeminiMatchForCandidate,
    runBulkMatchForJob,
    aiLoadingKey,
  } = useAts();

  const activeJobId = selectedJob?.id || jobs[0]?.id || '';
  const [activeStageFilter, setActiveStageFilter] = useState<string>('All');
  const [spotlightId, setSpotlightId] = useState<string>(candidates[0]?.id || '');

  const rankedForJob = useMemo(() => {
    return candidates
      .filter((c) => activeStageFilter === 'All' || c.status === activeStageFilter)
      .map((cand) => ({
        cand,
        match: getMatchFor(cand, activeJobId),
      }))
      .sort((a, b) => (b.match?.overallScore ?? 0) - (a.match?.overallScore ?? 0));
  }, [candidates, activeJobId, activeStageFilter, getMatchFor]);

  const selectedEntry =
    rankedForJob.find((r) => r.cand.id === spotlightId) ?? rankedForJob[0] ?? null;

  const stageCounts = [
    { name: 'Applied', count: candidates.filter((c) => c.status === 'Applied').length, icon: 'radar' },
    { name: 'Shortlisted', count: candidates.filter((c) => c.status === 'Shortlisted').length, icon: 'fact_check' },
    { name: 'Interview', count: candidates.filter((c) => c.status === 'Interview').length, icon: 'record_voice_over' },
    { name: 'Offer', count: candidates.filter((c) => c.status === 'Offer').length, icon: 'description' },
    { name: 'Rejected', count: candidates.filter((c) => c.status === 'Rejected').length, icon: 'cancel' },
  ];

  const isEvaluating =
    selectedEntry && aiLoadingKey === `${selectedEntry.cand.id}::${activeJobId}`;

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 font-mono-code text-mono-code text-tertiary mb-1">
            <span>AI MATCHING</span>
            <span className="text-outline">/</span>
            <span>EXPLAINABLE SCORING</span>
          </div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white tracking-tight">
            Talent Pipeline &amp; Matching
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Select any open job to compute deterministic weighted fit scores and grounded Gemini explanations.
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          {jobs.length > 0 && (
            <select
              value={activeJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Job: {j.title}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => onNavigate('compare-candidates')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151E32] hover:bg-[#1B2740] border border-[#263449] text-white font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#8B5CF6]">
              compare_arrows
            </span>
            <span>Compare</span>
          </button>
          <button
            type="button"
            disabled={!activeJobId}
            onClick={() => runBulkMatchForJob(activeJobId)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white font-label-md font-semibold border border-white/15 shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
            <span>Re-Score All Candidates</span>
          </button>
        </div>
      </div>

      {!selectedEntry ? (
        <div className="rounded-2xl glass-card p-10 text-center text-xs text-outline">
          No candidates available for this filter. Clear the stage filter or upload resumes.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          {/* Left Spotlight Card + Radar + Pipeline Tiles */}
          <div className="xl:col-span-5 rounded-2xl glass-card p-space-lg shadow-xl flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-headline-md font-bold text-lg shrink-0 ring-2 ring-emerald-400/50 ${selectedEntry.cand.avatarTone}`}
                >
                  {selectedEntry.cand.initials}
                </div>
                <div>
                  <h2 className="font-headline-md text-on-surface font-semibold">
                    {selectedEntry.cand.name}
                  </h2>
                  <p className="font-body-sm text-on-surface-variant">{selectedEntry.cand.role}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-mono-code text-[11px] text-emerald-400 font-semibold">
                      AI Match: {selectedEntry.match?.overallScore ?? selectedEntry.cand.matchScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary-container/30 border border-primary/30 font-mono-code text-[11px] text-primary">
                      {selectedEntry.match?.category ?? 'Good Match'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectCandidate(selectedEntry.cand)}
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface cursor-pointer"
                title="Open Full Profile"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>

            {/* Weighted Category Breakdown */}
            {selectedEntry.match && (
              <div className="space-y-2.5 tabular-nums">
                {[
                  { label: 'Technical Skills', v: selectedEntry.match.categoryScores.skills },
                  { label: 'Experience', v: selectedEntry.match.categoryScores.experience },
                  { label: 'Education', v: selectedEntry.match.categoryScores.education },
                  { label: 'Projects', v: selectedEntry.match.categoryScores.projects },
                  { label: 'Certifications', v: selectedEntry.match.categoryScores.certifications },
                  { label: 'Responsibilities', v: selectedEntry.match.categoryScores.responsibilities },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-variant">{bar.label}</span>
                      <span className="font-mono-code text-primary font-semibold">{bar.v}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"
                        style={{ width: `${bar.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Explanation & Missing Requirements */}
            {selectedEntry.match && (
              <div className="p-3.5 rounded-xl bg-surface-container border border-[#263449] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-tertiary uppercase">AI Decision Rationale</span>
                  <button
                    type="button"
                    disabled={Boolean(isEvaluating)}
                    onClick={() => runGeminiMatchForCandidate(selectedEntry.cand.id, activeJobId)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isEvaluating ? 'animate-spin' : ''}`}>
                      {isEvaluating ? 'refresh' : 'auto_awesome'}
                    </span>
                    <span>{isEvaluating ? 'Generating...' : 'Deep AI Explanation'}</span>
                  </button>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  {selectedEntry.match.explanation}
                </p>
                {selectedEntry.match.missingRequiredSkills.length > 0 && (
                  <p className="text-rose-300 font-mono-code text-[11px]">
                    Missing Required: {selectedEntry.match.missingRequiredSkills.join(', ')}
                  </p>
                )}
                {selectedEntry.match.missingPreferredSkills.length > 0 && (
                  <p className="text-amber-300 font-mono-code text-[11px]">
                    Missing Preferred: {selectedEntry.match.missingPreferredSkills.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Talent Pipeline Mini-Tiles */}
            <div>
              <span className="font-headline-sm text-on-surface font-semibold block mb-2.5 text-sm">
                Filter by Hiring Stage
              </span>
              <div className="grid grid-cols-3 gap-2 tabular-nums">
                {stageCounts.map((st) => {
                  const isSelected = activeStageFilter === st.name;
                  return (
                    <button
                      key={st.name}
                      type="button"
                      onClick={() => setActiveStageFilter(isSelected ? 'All' : st.name)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary-container/25 border-primary text-on-surface'
                          : 'bg-surface-container border-outline-variant/25 hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-on-surface">{st.name}</span>
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          {st.icon}
                        </span>
                      </div>
                      <span className="font-mono-code text-xs text-tertiary block mt-0.5">
                        ({st.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Candidate Match List */}
          <div className="xl:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-headline-md text-on-surface font-semibold">
                Matched Candidates ({rankedForJob.length})
              </h2>
              <button
                type="button"
                onClick={() => setActiveStageFilter('All')}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-[#263449] text-xs text-on-surface-variant hover:text-white cursor-pointer"
              >
                {activeStageFilter === 'All' ? 'Showing All Stages' : `Reset Filter (${activeStageFilter})`}
              </button>
            </div>

            <div className="flex flex-col gap-3 tabular-nums">
              {rankedForJob.slice(0, 12).map(({ cand, match }) => {
                const isSpotlight = selectedEntry.cand.id === cand.id;
                const score = match?.overallScore ?? cand.matchScore;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSpotlightId(cand.id)}
                    className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSpotlight
                        ? 'bg-[#1B2740]/90 border-[#8B5CF6]/70 shadow-lg'
                        : 'glass-card hover:border-[#4F46E5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${cand.avatarTone}`}
                      >
                        {cand.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-on-surface font-semibold">
                            {cand.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary font-mono-code text-[11px] font-semibold">
                            AI Match: {score}%
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px]">
                            {cand.status}
                          </span>
                        </div>
                        <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                          {cand.role} · Required Skill Coverage:{' '}
                          <span className="text-tertiary font-mono-code">
                            {match?.requiredSkillCoverage ?? 0}%
                          </span>
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
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs cursor-pointer"
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(cand);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-white text-on-surface text-xs cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. HIRING PIPELINE (5-Stage Drag & Drop Kanban Board)                      */
/* -------------------------------------------------------------------------- */
const PIPELINE_STAGES: HiringStage[] = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

export const HiringPipelineView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const { candidates, jobs, moveCandidateStage } = useAts();
  const [jobFilterId, setJobFilterId] = useState<string>('all');
  const [draggedCandId, setDraggedCandId] = useState<string | null>(null);
  const [stagePrompt, setStagePrompt] = useState<{
    candidate: CandidateProfile;
    targetStage: HiringStage;
  } | null>(null);
  const [promptInput, setPromptInput] = useState('');

  const visibleCandidates = useMemo(
    () =>
      jobFilterId === 'all'
        ? candidates
        : candidates.filter((c) => c.targetJobId === jobFilterId),
    [candidates, jobFilterId]
  );

  const handleMove = (cand: CandidateProfile, nextStage: HiringStage) => {
    if (cand.status === nextStage) return;
    if (nextStage === 'Interview' || nextStage === 'Rejected') {
      setStagePrompt({ candidate: cand, targetStage: nextStage });
      setPromptInput(
        nextStage === 'Interview'
          ? cand.interviewSchedule || 'Technical Round 1 · Tomorrow 11:00 AM'
          : cand.rejectionReason || ''
      );
      return;
    }
    moveCandidateStage(cand.id, nextStage);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Hiring Pipeline
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Drag and drop candidates or step across Applied, Shortlisted, Interview, Offer, and Rejected stages.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={jobFilterId}
            onChange={(e) => setJobFilterId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
          >
            <option value="all">All Jobs ({candidates.length} Candidates)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <span className="font-mono-code text-xs px-3 py-1.5 rounded-xl glass-card text-[#3B82F6]">
            5 Stages · {visibleCandidates.length} Candidates
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {PIPELINE_STAGES.map((stage, colIdx) => {
          const cards = visibleCandidates.filter((c) => c.status === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggedCandId) return;
                const cand = candidates.find((c) => c.id === draggedCandId);
                if (cand) handleMove(cand, stage);
                setDraggedCandId(null);
              }}
              className="rounded-2xl bg-[#0B1020]/70 backdrop-blur-md border border-[#263449] p-3 flex flex-col gap-3 min-h-[460px]"
            >
              <div className="flex items-center justify-between px-1 py-1">
                <span
                  className={`font-label-sm uppercase tracking-wider font-semibold ${
                    stage === 'Rejected' ? 'text-rose-400' : 'text-on-surface'
                  }`}
                >
                  {stage}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-mono-code text-[11px] text-tertiary tabular-nums">
                  {cards.length}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {cards.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-outline border border-dashed border-[#263449] rounded-xl">
                    Drop candidate here
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedCandId(card.id)}
                      onClick={() => onSelectCandidate(card)}
                      className="rounded-xl bg-[#151E32] border border-[#263449] hover:border-[#3B82F6] hover:bg-[#1B2740] p-3.5 transition-all cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${card.avatarTone}`}
                          >
                            {card.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-on-surface truncate">
                              {card.name}
                            </p>
                            <p className="text-[10px] text-outline truncate">{card.role}</p>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-[10px] font-bold shrink-0">
                          {card.matchScore}%
                        </span>
                      </div>

                      {card.interviewSchedule && stage === 'Interview' && (
                        <div className="text-[10px] text-blue-300 font-mono-code truncate">
                          {card.interviewSchedule}
                        </div>
                      )}
                      {card.rejectionReason && stage === 'Rejected' && (
                        <div className="text-[10px] text-rose-300 truncate">
                          Reason: {card.rejectionReason}
                        </div>
                      )}

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
                                handleMove(card, PIPELINE_STAGES[colIdx - 1]);
                              }}
                              className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface-variant cursor-pointer"
                              title={`Move to ${PIPELINE_STAGES[colIdx - 1]}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                chevron_left
                              </span>
                            </button>
                          )}
                          {colIdx < PIPELINE_STAGES.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(card, PIPELINE_STAGES[colIdx + 1]);
                              }}
                              className="p-1 rounded bg-primary-container/30 hover:bg-primary-container text-primary hover:text-white cursor-pointer"
                              title={`Move to ${PIPELINE_STAGES[colIdx + 1]}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                chevron_right
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interview Schedule / Rejection Reason Modal */}
      {stagePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setStagePrompt(null)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              moveCandidateStage(
                stagePrompt.candidate.id,
                stagePrompt.targetStage,
                stagePrompt.targetStage === 'Interview'
                  ? { interviewSchedule: promptInput.trim() || 'Technical Interview Scheduled' }
                  : { rejectionReason: promptInput.trim() || 'Requirements mismatch' }
              );
              setStagePrompt(null);
            }}
            className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-[#263449] p-5 z-10 space-y-4"
          >
            <h3 className="font-headline-md text-white font-semibold">
              Move {stagePrompt.candidate.name} to {stagePrompt.targetStage}
            </h3>
            <div>
              <label className="text-xs text-outline block mb-1">
                {stagePrompt.targetStage === 'Interview'
                  ? 'Interview Schedule / Panel Notes'
                  : 'Rejection Reason (Preserved in Archive)'}
              </label>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  stagePrompt.targetStage === 'Interview'
                    ? 'e.g. Friday 2:00 PM with Platform Lead'
                    : 'e.g. Missing required Docker/AWS production experience'
                }
                className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-white text-xs outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStagePrompt(null)}
                className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Stage Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. JOB MANAGEMENT VIEW (With Gemini JD Analyzer + Edit/Pause/Close)        */
/* -------------------------------------------------------------------------- */
export const JobManagementView: React.FC<{ onNavigate: (r: WorkspaceRoute) => void }> = ({
  onNavigate,
}) => {
  const { jobs, candidates, addJob, updateJob, deleteJob, setSelectedJobId, showToast } = useAts();
  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [analyzingJd, setAnalyzingJd] = useState(false);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [status, setStatus] = useState<JobStatus>('Active');
  const [description, setDescription] = useState('');
  const [reqSkills, setReqSkills] = useState('Python, FastAPI, SQL');
  const [prefSkills, setPrefSkills] = useState('Docker, AWS');
  const [minExp, setMinExp] = useState('0');
  const [maxExp, setMaxExp] = useState('3');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [gradYears, setGradYears] = useState('2024, 2025, 2026');
  const [responsibilities, setResponsibilities] = useState('');

  const openCreateModal = () => {
    setEditingJobId(null);
    setTitle('');
    setDepartment('Engineering');
    setLocation('Bengaluru / Hybrid');
    setEmploymentType('Full-Time');
    setStatus('Active');
    setDescription('');
    setReqSkills('Python, REST APIs, SQL');
    setPrefSkills('Docker, AWS');
    setMinExp('0');
    setMaxExp('3');
    setMinCgpa('7.0');
    setGradYears('2024, 2025, 2026');
    setResponsibilities('');
    setShowModal(true);
  };

  const openEditModal = (job: JobPosting) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setEmploymentType(job.employmentType);
    setStatus(job.status);
    setDescription(job.description);
    setReqSkills(job.requiredSkills.join(', '));
    setPrefSkills(job.preferredSkills.join(', '));
    setMinExp(String(job.minimumExperience));
    setMaxExp(String(job.maximumExperience));
    setMinCgpa(job.minimumCGPA !== null ? String(job.minimumCGPA) : '');
    setGradYears(job.graduationYears.join(', '));
    setResponsibilities(job.responsibilities.join('\n'));
    setShowModal(true);
  };

  const handleAnalyzeJd = async () => {
    if (description.trim().length < 15) {
      showToast('Paste a job description (15+ chars) to analyze with AI.', 'warning');
      return;
    }
    setAnalyzingJd(true);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          analysis?: {
            title?: string;
            requiredSkills?: string[];
            preferredSkills?: string[];
            minimumExperience?: number;
            maximumExperience?: number;
            minimumCGPA?: number | null;
            responsibilities?: string[];
            location?: string;
            employmentType?: EmploymentType;
          };
        };
        const a = data.analysis;
        if (a) {
          if (a.title && !title.trim()) setTitle(a.title);
          if (a.requiredSkills?.length) setReqSkills(a.requiredSkills.join(', '));
          if (a.preferredSkills?.length) setPrefSkills(a.preferredSkills.join(', '));
          if (typeof a.minimumExperience === 'number') setMinExp(String(a.minimumExperience));
          if (typeof a.maximumExperience === 'number') setMaxExp(String(a.maximumExperience));
          if (typeof a.minimumCGPA === 'number') setMinCgpa(String(a.minimumCGPA));
          if (a.location) setLocation(a.location);
          if (a.responsibilities?.length) setResponsibilities(a.responsibilities.join('\n'));
          showToast('JD requirements extracted! Review and edit before saving.');
        }
      }
    } catch {
      showToast('Could not analyze JD automatically.', 'error');
    } finally {
      setAnalyzingJd(false);
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const reqArr = reqSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const prefArr = prefSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const yrsArr = gradYears
      .split(',')
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => !Number.isNaN(y));
    const respArr = responsibilities
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const existing = editingJobId ? jobs.find((j) => j.id === editingJobId) : null;
    const payload: JobPosting = {
      id: editingJobId || `job-${Date.now()}`,
      title: title.trim(),
      department: department.trim() || 'Engineering',
      location: location.trim() || 'Remote',
      employmentType,
      priority: existing?.priority ?? 'High',
      description: description.trim() || `${title.trim()} requisition.`,
      requiredQualifications: existing?.requiredQualifications ?? [
        'B.Tech / B.E. or equivalent technical background',
      ],
      preferredQualifications: existing?.preferredQualifications ?? [],
      requiredSkills: reqArr,
      preferredSkills: prefArr,
      responsibilities: respArr.length > 0 ? respArr : [`Deliver core engineering milestones for ${title.trim()}`],
      certifications: existing?.certifications ?? [],
      minimumExperience: parseFloat(minExp) || 0,
      maximumExperience: parseFloat(maxExp) || 4,
      minimumCGPA: minCgpa.trim() ? parseFloat(minCgpa) : null,
      graduationYears: yrsArr.length > 0 ? yrsArr : [2024, 2025, 2026],
      keywords: Array.from(new Set([...reqArr, ...prefArr])),
      applicants: existing?.applicants ?? 0,
      shortlisted: existing?.shortlisted ?? 0,
      avgMatch: existing?.avgMatch ?? 0,
      status,
      skills: Array.from(new Set([...reqArr, ...prefArr])),
      salaryRange: existing?.salaryRange ?? 'Competitive',
      postedAgo: existing?.postedAgo ?? 'Just now',
    };

    if (editingJobId) {
      updateJob(payload);
    } else {
      addJob(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Job Management
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Create, analyze, edit, pause, or close job openings with separated required and preferred skills.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white font-label-md font-semibold border border-white/15 shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg tabular-nums">
        {jobs.map((job) => {
          const applicantCands = candidates.filter((c) => c.targetJobId === job.id);
          const shortlistedCount = applicantCands.filter((c) => c.status === 'Shortlisted').length;
          return (
            <div
              key={job.id}
              className="rounded-2xl glass-card p-5 flex flex-col justify-between gap-4 hover:border-[#4F46E5]/50 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline-sm text-on-surface font-semibold">{job.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px] text-tertiary">
                        {job.employmentType}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                      {job.department} · {job.location} · Exp {job.minimumExperience}–{job.maximumExperience} yrs · Min CGPA {job.minimumCGPA ?? 'None'}
                    </p>
                  </div>
                  <select
                    value={job.status}
                    onChange={(e) => updateJob({ ...job, status: e.target.value as JobStatus })}
                    className={`h-7 px-2 rounded-full font-mono-code text-[11px] outline-none cursor-pointer ${
                      job.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : job.status === 'Paused'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-primary-container/25 border border-primary/30 font-mono-code text-[10px] text-primary"
                    >
                      {s} (Req)
                    </span>
                  ))}
                  {job.preferredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px] text-on-surface-variant"
                    >
                      {s} (Pref)
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#263449] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 font-mono-code text-xs text-on-surface-variant">
                  <span>
                    <strong className="text-on-surface">{applicantCands.length}</strong> Applicants
                  </span>
                  <span>
                    <strong className="text-secondary">{shortlistedCount}</strong> Shortlisted
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(job)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      onNavigate('job-details');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      onNavigate('ai-matching');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-primary-container/25 hover:bg-primary-container text-xs text-primary hover:text-white cursor-pointer"
                  >
                    Match
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteJob(job.id)}
                    className="p-1.5 rounded-lg text-outline hover:text-rose-400 cursor-pointer"
                    title="Delete job"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Job Modal with Gemini JD Analyzer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <form
            onSubmit={handleSaveJob}
            className="relative w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#263449] shadow-2xl p-6 z-10 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-white font-semibold">
                {editingJobId ? 'Edit Job Description' : 'Create Job Opening'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-outline hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-outline">Full Job Description (Paste to Auto-Extract)</label>
                <button
                  type="button"
                  disabled={analyzingJd}
                  onClick={handleAnalyzeJd}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-[14px] ${analyzingJd ? 'animate-spin' : ''}`}>
                    {analyzingJd ? 'refresh' : 'auto_awesome'}
                  </span>
                  <span>{analyzingJd ? 'Analyzing JD...' : 'Analyze JD with Gemini AI'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste job description here and click 'Analyze JD with Gemini AI' to extract required/preferred skills, experience, and qualifications..."
                className="w-full p-3 rounded-lg bg-surface-container-highest text-on-surface outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-outline block mb-1">Job Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Python Developer"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Department</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-outline block mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full h-9 px-2 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  >
                    {['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote', 'Hybrid', 'On-Site'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-outline block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full h-9 px-2 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  >
                    {['Active', 'Paused', 'Closed', 'Draft'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-outline block mb-1">Required Skills (comma separated)</label>
                <input
                  value={reqSkills}
                  onChange={(e) => setReqSkills(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Preferred / Optional Skills</label>
                <input
                  value={prefSkills}
                  onChange={(e) => setPrefSkills(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-outline block mb-1">Min Exp (yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Max Exp (yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Grad Years</label>
                <input
                  value={gradYears}
                  onChange={(e) => setGradYears(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-container text-white font-semibold cursor-pointer"
              >
                {editingJobId ? 'Save Job Updates' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. JOB DETAILS VIEW (Page 5)                                               */
/* -------------------------------------------------------------------------- */
export const JobDetailsView: React.FC<ViewProps> = ({ onNavigate, onSelectCandidate }) => {
  const { jobs, selectedJob, setSelectedJobId, candidates, getMatchFor, runBulkMatchForJob } = useAts();
  const job = selectedJob ?? jobs[0];

  if (!job) {
    return (
      <div className="rounded-2xl glass-card p-10 text-center space-y-3">
        <p className="text-on-surface">No job requisitions found.</p>
        <button
          type="button"
          onClick={() => onNavigate('job-management')}
          className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs cursor-pointer"
        >
          Go to Job Management
        </button>
      </div>
    );
  }

  const rankedForJob = candidates
    .map((c) => ({ cand: c, match: getMatchFor(c, job.id)! }))
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('job-management')}
            className="text-xs text-primary hover:underline mb-2 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to Job Management
          </button>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">{job.title}</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            {job.department} · {job.location} · {job.employmentType} · Status: {job.status}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={job.id}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => runBulkMatchForJob(job.id)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-xs font-semibold cursor-pointer"
          >
            Run Matching for All Candidates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl glass-card p-5 space-y-4">
          <h2 className="font-headline-sm text-on-surface font-semibold">
            Job Requirements &amp; Responsibilities
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">{job.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-outline uppercase font-label-sm block mb-2">
                Required Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-primary-container/25 text-primary font-mono-code">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-outline uppercase font-label-sm block mb-2">
                Preferred Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.preferredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-mono-code">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <span className="text-outline uppercase font-label-sm block mb-1.5">Responsibilities</span>
            <ul className="list-disc pl-5 text-xs text-on-surface-variant space-y-1">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-5 space-y-3 text-xs tabular-nums">
          <h2 className="font-headline-sm text-on-surface font-semibold">Criteria &amp; Stats</h2>
          <div className="flex justify-between py-2 border-b border-[#263449]">
            <span className="text-outline">Experience Range</span>
            <span className="text-white font-mono-code">
              {job.minimumExperience}–{job.maximumExperience} yrs
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#263449]">
            <span className="text-outline">Minimum CGPA</span>
            <span className="text-white font-mono-code">{job.minimumCGPA ?? 'Flexible'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#263449]">
            <span className="text-outline">Eligible Grad Years</span>
            <span className="text-white font-mono-code">{job.graduationYears.join(', ')}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-outline">Assigned Applicants</span>
            <span className="text-tertiary font-mono-code font-bold">
              {candidates.filter((c) => c.targetJobId === job.id).length}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="p-4 border-b border-[#263449] flex items-center justify-between">
          <h3 className="font-headline-sm text-white font-semibold">
            Top Candidates Matched to {job.title}
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('candidate-ranking')}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            Open Full Ranking →
          </button>
        </div>
        <table className="w-full text-left text-xs tabular-nums">
          <thead>
            <tr className="bg-surface-container-lowest/60 text-outline uppercase">
              <th className="py-2.5 px-4">Candidate</th>
              <th className="py-2.5 px-4">Match Score</th>
              <th className="py-2.5 px-4">Required Coverage</th>
              <th className="py-2.5 px-4">Missing Required</th>
              <th className="py-2.5 px-4">Stage</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263449]/60">
            {rankedForJob.slice(0, 8).map(({ cand, match }) => (
              <tr key={cand.id} className="hover:bg-surface-container/50">
                <td className="py-3 px-4 font-semibold text-on-surface">{cand.name}</td>
                <td className="py-3 px-4 font-mono-code text-emerald-400 font-bold">
                  {match.overallScore}%
                </td>
                <td className="py-3 px-4 font-mono-code text-tertiary">
                  {match.requiredSkillCoverage}%
                </td>
                <td className="py-3 px-4 text-rose-300">
                  {match.missingRequiredSkills.length > 0
                    ? match.missingRequiredSkills.join(', ')
                    : 'None'}
                </td>
                <td className="py-3 px-4">{cand.status}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectCandidate(cand)}
                    className="px-3 py-1 rounded bg-surface-container-high hover:bg-primary-container hover:text-white cursor-pointer"
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
/* 5. CANDIDATE RANKING VIEW (Job-Specific + Tie Breaking + Top N + Export)   */
/* -------------------------------------------------------------------------- */
export const CandidateRankingView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const { candidates, jobs, selectedJobId, setSelectedJobId, selectedJob, getMatchFor, showToast } =
    useAts();

  const activeJob = selectedJob ?? jobs[0];
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [topN, setTopN] = useState<number>(0); // 0 = All

  const ranked = useMemo(() => {
    if (!activeJob) return [];
    const list = candidates.map((cand) => ({
      cand,
      match: getMatchFor(cand, activeJob.id)!,
    }));
    list.sort((a, b) => {
      const diff =
        sortOrder === 'desc'
          ? b.match.overallScore - a.match.overallScore
          : a.match.overallScore - b.match.overallScore;
      if (diff !== 0) return diff;
      // Tie-breaker: required skill coverage then CGPA
      const covDiff = b.match.requiredSkillCoverage - a.match.requiredSkillCoverage;
      if (covDiff !== 0) return covDiff;
      return (b.cand.educationDetail.cgpa ?? 0) - (a.cand.educationDetail.cgpa ?? 0);
    });
    return topN > 0 ? list.slice(0, topN) : list;
  }, [candidates, activeJob, getMatchFor, sortOrder, topN]);

  const handleExportRanked = () => {
    if (!activeJob) return;
    exportRowsToCsv(
      `ranked_${activeJob.title.replace(/\s+/g, '_')}.csv`,
      ['Rank', 'Name', 'Email', 'Overall Score', 'Category', 'Required Skill Coverage %', 'CGPA', 'Experience', 'Explanation'],
      ranked.map(({ cand, match }, idx) => [
        idx + 1,
        cand.name,
        cand.email,
        match.overallScore,
        match.category,
        match.requiredSkillCoverage,
        cand.cgpa,
        cand.experience,
        match.explanation,
      ])
    );
    showToast(`Exported ranked candidates for ${activeJob.title}`);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Candidate Ranking
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Job-specific leaderboard ordered by weighted score and required skill coverage tie-breakers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {jobs.length > 0 && (
            <select
              value={activeJob?.id || ''}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Rank for: {j.title}
                </option>
              ))}
            </select>
          )}
          <select
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value, 10))}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
          >
            <option value={0}>All Candidates</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs cursor-pointer"
          >
            Order: {sortOrder === 'desc' ? 'Highest → Lowest' : 'Lowest → Highest'}
          </button>
          <button
            type="button"
            onClick={handleExportRanked}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-xs font-semibold cursor-pointer"
          >
            Export Ranked CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="bg-surface-container-high/60 text-outline font-label-sm uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Req Skill Coverage</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Rationale</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263449]/60 text-sm">
              {ranked.map(({ cand, match }, idx) => (
                <tr key={cand.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono-code font-bold text-primary">#{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cand.avatarTone}`}
                      >
                        {cand.initials}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{cand.name}</p>
                        <p className="font-mono-code text-[11px] text-outline">
                          {cand.experience} · {cand.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-xs font-bold">
                      {match.overallScore}% ({match.category.replace(' Match', '')})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-tertiary">
                    {match.requiredSkillCoverage}%
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-on-surface-variant">
                    {cand.cgpa}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-on-surface-variant max-w-xs truncate">
                    {match.explanation}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectCandidate(cand)}
                      className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-white text-xs text-on-surface cursor-pointer"
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
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. COMPARE CANDIDATES VIEW (2–4 Candidates + Shared vs Unique Highlight)   */
/* -------------------------------------------------------------------------- */
export const CompareCandidatesView: React.FC<ViewProps> = ({ onSelectCandidate }) => {
  const {
    candidates,
    jobs,
    selectedJobId,
    setSelectedJobId,
    compareIds,
    toggleCompareCandidate,
    getMatchFor,
  } = useAts();

  const comparedCandidates = candidates.filter((c) => compareIds.includes(c.id));
  const activeJobId = selectedJobId || jobs[0]?.id || '';

  // Identify shared skills across all selected candidates vs unique skills
  const skillFrequency = useMemo(() => {
    const map = new Map<string, number>();
    comparedCandidates.forEach((c) => {
      const uniqueNorms = new Set(c.skills.map(normalizeSkillName));
      uniqueNorms.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1));
    });
    return map;
  }, [comparedCandidates]);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Compare Candidates
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Select 2 to 4 candidates for unbiased side-by-side comparison of academics, skills, projects, and job fit.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {jobs.length > 0 && (
            <select
              value={activeJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Compare against: {j.title}
                </option>
              ))}
            </select>
          )}
          <span className="font-mono-code text-xs px-3 py-1.5 rounded-xl glass-card text-tertiary">
            {comparedCandidates.length} / 4 Selected
          </span>
        </div>
      </div>

      {/* Candidate Picker Bar */}
      <div className="rounded-2xl glass-card p-4 space-y-2">
        <span className="font-label-sm text-outline uppercase tracking-wider block">
          Select Candidates to Compare (2–4)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {candidates.slice(0, 16).map((c) => {
            const active = compareIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompareCandidate(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white border-transparent'
                    : 'bg-surface-container text-on-surface-variant border-[#263449] hover:text-white'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {comparedCandidates.length < 2 ? (
        <div className="rounded-2xl glass-card p-10 text-center text-xs text-amber-300">
          Select at least 2 candidates above to display the side-by-side comparison matrix.
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            comparedCandidates.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
          } gap-5 tabular-nums`}
        >
          {comparedCandidates.map((cand) => {
            const match = getMatchFor(cand, activeJobId);
            return (
              <div
                key={cand.id}
                className="rounded-2xl glass-card p-5 flex flex-col gap-4 border border-[#263449]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${cand.avatarTone}`}
                    >
                      {cand.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline-sm text-on-surface font-semibold truncate">
                        {cand.name}
                      </h3>
                      <p className="text-[11px] text-outline truncate">{cand.location}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary font-mono-code text-xs font-bold shrink-0">
                    {match?.overallScore ?? cand.matchScore}%
                  </span>
                </div>

                <div className="text-xs space-y-2 pt-2 border-t border-[#263449]">
                  <div className="flex justify-between">
                    <span className="text-outline">Education:</span>
                    <span className="text-on-surface text-right">{cand.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">College:</span>
                    <span className="text-on-surface text-right truncate max-w-[160px]">
                      {cand.educationDetail.college}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">10th / 12th / CGPA:</span>
                    <span className="text-tertiary font-mono-code">
                      {cand.tenthTwelfth} · {cand.cgpa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Experience:</span>
                    <span className="text-on-surface">{cand.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Required Coverage:</span>
                    <span className="text-emerald-400 font-mono-code font-bold">
                      {match?.requiredSkillCoverage ?? 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Stage:</span>
                    <span className="text-primary font-semibold">{cand.status}</span>
                  </div>
                </div>

                {/* Skills with Shared (Green) vs Unique (Violet) Highlight */}
                <div className="pt-2 border-t border-[#263449]">
                  <span className="text-[10px] text-outline uppercase block mb-1.5">
                    Skills (Green = Shared · Violet = Unique)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cand.skills.map((s) => {
                      const isShared = (skillFrequency.get(normalizeSkillName(s)) ?? 0) > 1;
                      return (
                        <span
                          key={s}
                          className={`px-2 py-0.5 rounded font-mono-code text-[10px] ${
                            isShared
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-[#8B5CF6]/20 text-[#c3c0ff] border border-[#8B5CF6]/30'
                          }`}
                        >
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#263449] text-xs space-y-1">
                  <span className="text-[10px] text-outline uppercase block">Missing Job Skills</span>
                  <p className="text-rose-300 font-mono-code text-[11px]">
                    {match && match.missingRequiredSkills.length > 0
                      ? `Req: ${match.missingRequiredSkills.join(', ')}`
                      : 'All required skills present'}
                  </p>
                  <p className="text-on-surface-variant text-[11px]">
                    Projects: {cand.projects.length} · Certifications: {cand.certifications.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCandidate(cand)}
                  className="mt-auto w-full py-2 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-white text-xs font-medium text-on-surface transition-colors cursor-pointer"
                >
                  Open Full Profile
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
