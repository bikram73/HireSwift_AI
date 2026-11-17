import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityEvent,
  CandidateProfile,
  DEFAULT_SCORING_WEIGHTS,
  DEMO_ACTIVITIES,
  DEMO_CANDIDATES,
  DEMO_JOBS,
  HiringStage,
  JobPosting,
  MatchResult,
  ScoringWeights,
} from '../data/atsData';
import { computeMatchResult, exportObjectToJson } from '../utils/atsEngine';

const STORAGE_KEY = 'hireswift_ats_session_v2';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}

interface PersistedSession {
  candidates: CandidateProfile[];
  jobs: JobPosting[];
  activities: ActivityEvent[];
  scoringWeights: ScoringWeights;
  maxFileSizeMb: number;
  selectedJobId: string;
  compareIds: string[];
  aiMatchCache: Record<string, Partial<MatchResult>>;
}

interface AtsContextValue {
  candidates: CandidateProfile[];
  jobs: JobPosting[];
  activities: ActivityEvent[];
  scoringWeights: ScoringWeights;
  maxFileSizeMb: number;
  selectedJobId: string;
  selectedJob: JobPosting | null;
  compareIds: string[];
  stageFilterPreset: string | null;
  setStageFilterPreset: (stage: string | null) => void;
  setSelectedJobId: (jobId: string) => void;
  toast: ToastMessage | null;
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
  getMatchFor: (candidate: CandidateProfile, jobId?: string) => MatchResult | null;
  runGeminiMatchForCandidate: (candidateId: string, jobId: string) => Promise<MatchResult | null>;
  runBulkMatchForJob: (jobId: string) => void;
  addCandidate: (cand: CandidateProfile) => void;
  updateCandidate: (cand: CandidateProfile) => void;
  deleteCandidate: (id: string) => void;
  mergeDuplicateCandidate: (incoming: CandidateProfile, targetId: string) => void;
  moveCandidateStage: (
    candidateId: string,
    stage: HiringStage,
    meta?: { rejectionReason?: string; interviewSchedule?: string; notes?: string }
  ) => void;
  bulkUpdateStage: (ids: string[], stage: HiringStage) => void;
  addJob: (job: JobPosting) => void;
  updateJob: (job: JobPosting) => void;
  deleteJob: (jobId: string) => void;
  toggleCompareCandidate: (candidateId: string) => void;
  setCompareIds: (ids: string[]) => void;
  updateScoringWeights: (weights: ScoringWeights) => void;
  setMaxFileSizeMb: (mb: number) => void;
  resetDemoData: () => void;
  clearSessionData: () => void;
  importDemoDataset: () => void;
  exportSessionJson: () => void;
  aiLoadingKey: string | null;
}

const AtsContext = createContext<AtsContextValue | null>(null);

function loadInitialSession(): PersistedSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedSession>;
      if (Array.isArray(parsed.candidates) && Array.isArray(parsed.jobs)) {
        return {
          candidates: parsed.candidates,
          jobs: parsed.jobs,
          activities: Array.isArray(parsed.activities) ? parsed.activities : DEMO_ACTIVITIES,
          scoringWeights: parsed.scoringWeights ?? DEFAULT_SCORING_WEIGHTS,
          maxFileSizeMb: parsed.maxFileSizeMb ?? 10,
          selectedJobId: parsed.selectedJobId ?? (parsed.jobs[0]?.id || ''),
          compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : ['cand-1', 'cand-2', 'cand-7'],
          aiMatchCache: parsed.aiMatchCache ?? {},
        };
      }
    }
  } catch {
    // Fallback to clean demo state
  }
  return {
    candidates: DEMO_CANDIDATES,
    jobs: DEMO_JOBS,
    activities: DEMO_ACTIVITIES,
    scoringWeights: DEFAULT_SCORING_WEIGHTS,
    maxFileSizeMb: 10,
    selectedJobId: DEMO_JOBS[0].id,
    compareIds: ['cand-1', 'cand-2', 'cand-7'],
    aiMatchCache: {},
  };
}

export const AtsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadInitialSession(), []);

  const [candidates, setCandidates] = useState<CandidateProfile[]>(initial.candidates);
  const [jobs, setJobs] = useState<JobPosting[]>(initial.jobs);
  const [activities, setActivities] = useState<ActivityEvent[]>(initial.activities);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(initial.scoringWeights);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<number>(initial.maxFileSizeMb);
  const [selectedJobId, setSelectedJobId] = useState<string>(initial.selectedJobId);
  const [compareIds, setCompareIds] = useState<string[]>(initial.compareIds);
  const [aiMatchCache, setAiMatchCache] = useState<Record<string, Partial<MatchResult>>>(
    initial.aiMatchCache
  );
  const [stageFilterPreset, setStageFilterPreset] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light-mode');
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedSession = {
        // Strip transient objectUrls on storage write
        candidates: candidates.map((c) => ({ ...c, resumeObjectUrl: undefined })),
        jobs,
        activities: activities.slice(0, 25),
        scoringWeights,
        maxFileSizeMb,
        selectedJobId,
        compareIds,
        aiMatchCache,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [
    candidates,
    jobs,
    activities,
    scoringWeights,
    maxFileSizeMb,
    selectedJobId,
    compareIds,
    aiMatchCache,
  ]);

  const showToast = (text: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `${Date.now()}`;
    setToast({ id, text, tone });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3200);
  };

  const pushActivity = (event: Omit<ActivityEvent, 'id' | 'time'>) => {
    setActivities((prev) => [
      { id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: 'Just now', ...event },
      ...prev,
    ]);
  };

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId]
  );

  const getMatchFor = (candidate: CandidateProfile, jobId?: string): MatchResult | null => {
    const targetId = jobId ?? candidate.targetJobId ?? selectedJob?.id;
    const job = jobs.find((j) => j.id === targetId) ?? selectedJob;
    if (!job) return null;
    const key = `${candidate.id}::${job.id}`;
    return computeMatchResult(candidate, job, scoringWeights, aiMatchCache[key]);
  };

  const runGeminiMatchForCandidate = async (
    candidateId: string,
    jobId: string
  ): Promise<MatchResult | null> => {
    const cand = candidates.find((c) => c.id === candidateId);
    const job = jobs.find((j) => j.id === jobId);
    if (!cand || !job) return null;

    const deterministic = computeMatchResult(cand, job, scoringWeights);
    const key = `${candidateId}::${jobId}`;
    setAiLoadingKey(key);

    try {
      const res = await fetch('/api/matching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: {
            name: cand.name,
            role: cand.role,
            education: cand.education,
            cgpa: cand.educationDetail.cgpa,
            experienceYears: cand.experienceYears,
            skills: cand.skills,
            projects: cand.projects,
            certifications: cand.certifications,
            summary: cand.summary,
          },
          job: {
            title: job.title,
            requiredSkills: job.requiredSkills,
            preferredSkills: job.preferredSkills,
            minimumExperience: job.minimumExperience,
            maximumExperience: job.maximumExperience,
            minimumCGPA: job.minimumCGPA,
            responsibilities: job.responsibilities,
          },
          deterministicScore: {
            overallScore: deterministic.overallScore,
            matchedSkills: deterministic.matchedSkills,
            missingRequiredSkills: deterministic.missingRequiredSkills,
            missingPreferredSkills: deterministic.missingPreferredSkills,
          },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          insights?: {
            explanation?: string;
            decisionRationale?: string;
            strongestAreas?: string[];
            potentialConcerns?: string[];
            interviewQuestions?: string[];
          };
        };
        if (data.insights) {
          const patch: Partial<MatchResult> = {
            explanation: data.insights.explanation || deterministic.explanation,
            decisionRationale: data.insights.decisionRationale || deterministic.decisionRationale,
            strongestAreas: data.insights.strongestAreas || deterministic.strongestAreas,
            potentialConcerns: data.insights.potentialConcerns || deterministic.potentialConcerns,
            interviewQuestions: data.insights.interviewQuestions || deterministic.interviewQuestions,
            evaluatedAt: new Date().toISOString(),
            aiEnhanced: true,
          };
          setAiMatchCache((prev) => ({ ...prev, [key]: patch }));
          showToast(`AI evaluation completed for ${cand.name}`);
          return { ...deterministic, ...patch };
        }
      }
      showToast(`Evaluated ${cand.name} using deterministic rubric`, 'info');
      return deterministic;
    } catch {
      showToast(`Evaluated ${cand.name} using deterministic rubric`, 'info');
      return deterministic;
    } finally {
      setAiLoadingKey(null);
    }
  };

  const runBulkMatchForJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setCandidates((prev) =>
      prev.map((c) => {
        const m = computeMatchResult(c, job, scoringWeights, aiMatchCache[`${c.id}::${job.id}`]);
        return {
          ...c,
          matchScore: m.overallScore,
          matchLabel: `${m.overallScore}% ${m.category.replace(' Match', '')}`,
        };
      })
    );
    pushActivity({
      type: 'job',
      title: `Matched ${candidates.length} candidates against ${job.title}`,
      detail: 'Deterministic weighted scores recalculated across cohort',
    });
    showToast(`Recalculated scores for ${candidates.length} candidates against ${job.title}`);
  };

  const addCandidate = (cand: CandidateProfile) => {
    setCandidates((prev) => [cand, ...prev]);
    pushActivity({
      type: 'upload',
      title: `New resume added (${cand.resumeFileName})`,
      detail: `${cand.name} • ${cand.matchScore}% match score`,
    });
  };

  const updateCandidate = (updated: CandidateProfile) => {
    const targetJob = jobs.find((j) => j.id === (updated.targetJobId || selectedJob?.id)) ?? selectedJob;
    let recalculated = updated;
    if (targetJob) {
      const m = computeMatchResult(updated, targetJob, scoringWeights);
      recalculated = {
        ...updated,
        matchScore: m.overallScore,
        matchLabel: `${m.overallScore}% ${m.category.replace(' Match', '')}`,
      };
    }
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? recalculated : c)));
    // Invalidate AI cache for edited candidate so explanations reflect updated fields
    setAiMatchCache((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${updated.id}::`)) delete next[k];
      });
      return next;
    });
    pushActivity({
      type: 'edit',
      title: `Profile updated: ${updated.name}`,
      detail: 'Candidate fields saved and match score recalculated',
    });
    showToast(`Saved profile updates for ${updated.name}`);
  };

  const deleteCandidate = (id: string) => {
    const target = candidates.find((c) => c.id === id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setCompareIds((prev) => prev.filter((cid) => cid !== id));
    if (target) {
      pushActivity({
        type: 'reject',
        title: `Removed candidate: ${target.name}`,
        detail: 'Removed from active session list',
      });
      showToast(`Removed ${target.name} from candidates`, 'info');
    }
  };

  const mergeDuplicateCandidate = (incoming: CandidateProfile, targetId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== targetId) return c;
        const mergedSkills = Array.from(new Set([...c.skills, ...incoming.skills]));
        const merged: CandidateProfile = {
          ...c,
          phone: c.phone || incoming.phone,
          skills: mergedSkills,
          duplicateStatus: 'Unique',
          duplicateOfId: undefined,
          timeline: [
            {
              time: 'Just now',
              event: 'Duplicate Merged',
              detail: `Merged details from ${incoming.resumeFileName}`,
            },
            ...c.timeline,
          ],
        };
        return merged;
      })
    );
    showToast('Duplicate profile merged cleanly');
  };

  const moveCandidateStage = (
    candidateId: string,
    stage: HiringStage,
    meta?: { rejectionReason?: string; interviewSchedule?: string; notes?: string }
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          status: stage,
          rejectionReason: meta?.rejectionReason ?? (stage === 'Rejected' ? c.rejectionReason : undefined),
          interviewSchedule: meta?.interviewSchedule ?? c.interviewSchedule,
          notes: meta?.notes ?? c.notes,
          timeline: [
            {
              time: 'Just now',
              event: `Moved to ${stage}`,
              detail: meta?.rejectionReason || meta?.interviewSchedule || meta?.notes || `Stage updated to ${stage}`,
            },
            ...c.timeline,
          ],
        };
      })
    );

    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      const actType: ActivityEvent['type'] =
        stage === 'Shortlisted'
          ? 'shortlist'
          : stage === 'Interview'
            ? 'interview'
            : stage === 'Offer'
              ? 'offer'
              : 'reject';
      pushActivity({
        type: actType,
        title: `${cand.name} moved to ${stage}`,
        detail: meta?.rejectionReason || meta?.interviewSchedule || `${cand.role} • ${cand.matchScore}% Match`,
      });
      showToast(`${cand.name} moved to ${stage}`);
    }
  };

  const bulkUpdateStage = (ids: string[], stage: HiringStage) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setCandidates((prev) =>
      prev.map((c) =>
        idSet.has(c.id)
          ? {
              ...c,
              status: stage,
              timeline: [
                { time: 'Just now', event: `Bulk moved to ${stage}`, detail: `Updated via batch action` },
                ...c.timeline,
              ],
            }
          : c
      )
    );
    pushActivity({
      type: stage === 'Rejected' ? 'reject' : 'shortlist',
      title: `Updated ${ids.length} candidate(s) to ${stage}`,
      detail: 'Batch pipeline update applied',
    });
    showToast(`Updated ${ids.length} candidate(s) to ${stage}`);
  };

  const addJob = (job: JobPosting) => {
    setJobs((prev) => [job, ...prev]);
    setSelectedJobId(job.id);
    pushActivity({
      type: 'job',
      title: `New job created: ${job.title}`,
      detail: `${job.department} • ${job.requiredSkills.slice(0, 3).join(', ')}`,
    });
    showToast(`Published job requisition: ${job.title}`);
  };

  const updateJob = (job: JobPosting) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
    setAiMatchCache((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.endsWith(`::${job.id}`)) delete next[k];
      });
      return next;
    });
    showToast(`Updated job: ${job.title}`);
  };

  const deleteJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) {
      const remaining = jobs.filter((j) => j.id !== jobId);
      setSelectedJobId(remaining[0]?.id ?? '');
    }
    if (job) showToast(`Deleted job: ${job.title}`, 'info');
  };

  const toggleCompareCandidate = (candidateId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= 4) {
        showToast('Maximum of 4 candidates can be compared side-by-side. Deselect one first.', 'warning');
        return prev;
      }
      showToast('Added candidate to side-by-side comparison');
      return [...prev, candidateId];
    });
  };

  const updateScoringWeights = (weights: ScoringWeights) => {
    const sum =
      weights.skills +
      weights.experience +
      weights.education +
      weights.projects +
      weights.certifications +
      weights.responsibilities;
    if (sum <= 0) {
      showToast('Total scoring weight must be greater than 0%.', 'error');
      return;
    }
    setScoringWeights(weights);
    showToast('Updated matching score weights and recalculated rankings');
  };

  const resetDemoData = () => {
    setCandidates(DEMO_CANDIDATES);
    setJobs(DEMO_JOBS);
    setActivities(DEMO_ACTIVITIES);
    setScoringWeights(DEFAULT_SCORING_WEIGHTS);
    setSelectedJobId(DEMO_JOBS[0].id);
    setCompareIds(['cand-1', 'cand-2', 'cand-7']);
    setAiMatchCache({});
    showToast('Demo dataset restored to initial state (30 candidates, 6 jobs)');
  };

  const clearSessionData = () => {
    setCandidates([]);
    setJobs([]);
    setActivities([]);
    setCompareIds([]);
    setAiMatchCache({});
    setSelectedJobId('');
    showToast('Session data cleared. Upload resumes or import demo data to begin.', 'info');
  };

  const importDemoDataset = () => {
    resetDemoData();
  };

  const exportSessionJson = () => {
    exportObjectToJson(`hireswift_session_${new Date().toISOString().slice(0, 10)}.json`, {
      exportedAt: new Date().toISOString(),
      candidates: candidates.map((c) => ({ ...c, resumeObjectUrl: undefined })),
      jobs,
      scoringWeights,
    });
    showToast('Exported current session JSON');
  };

  return (
    <AtsContext.Provider
      value={{
        candidates,
        jobs,
        activities,
        scoringWeights,
        maxFileSizeMb,
        selectedJobId,
        selectedJob,
        compareIds,
        stageFilterPreset,
        setStageFilterPreset,
        setSelectedJobId,
        toast,
        showToast,
        getMatchFor,
        runGeminiMatchForCandidate,
        runBulkMatchForJob,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        mergeDuplicateCandidate,
        moveCandidateStage,
        bulkUpdateStage,
        addJob,
        updateJob,
        deleteJob,
        toggleCompareCandidate,
        setCompareIds,
        updateScoringWeights,
        setMaxFileSizeMb,
        resetDemoData,
        clearSessionData,
        importDemoDataset,
        exportSessionJson,
        aiLoadingKey,
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[70] px-4 py-3 rounded-xl glass-card border border-[#8B5CF6]/50 shadow-2xl text-xs font-medium text-white flex items-center gap-2.5 max-w-md"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              toast.tone === 'error'
                ? 'text-rose-400'
                : toast.tone === 'warning'
                  ? 'text-amber-400'
                  : toast.tone === 'info'
                    ? 'text-blue-400'
                    : 'text-emerald-400'
            }`}
          >
            {toast.tone === 'error'
              ? 'error'
              : toast.tone === 'warning'
                ? 'warning'
                : toast.tone === 'info'
                  ? 'info'
                  : 'check_circle'}
          </span>
          <span>{toast.text}</span>
        </div>
      )}
    </AtsContext.Provider>
  );
};

export function useAts(): AtsContextValue {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error('useAts must be used inside AtsProvider');
  return ctx;
}
