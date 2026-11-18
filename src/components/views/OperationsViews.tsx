import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAts } from '../../context/AtsContext';
import { DEFAULT_SCORING_WEIGHTS, ScoringWeights, WorkspaceRoute } from '../../data/atsData';
import { exportObjectToJson, exportRowsToCsv, normalizeSkillName } from '../../utils/atsEngine';
import { CustomJobRoleModal } from '../CustomJobRoleModal';

/* -------------------------------------------------------------------------- */
/* 1. SKILL GAP ANALYSIS VIEW (Page 11)                                       */
/* -------------------------------------------------------------------------- */
export const SkillGapAnalysisView: React.FC = () => {
  const { candidates, jobs, selectedJobId, setSelectedJobId, getMatchFor, showToast } = useAts();
  const [candidateId, setCandidateId] = useState<string>(candidates[0]?.id || '');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showCustomJobModal, setShowCustomJobModal] = useState(false);
  const [aiGapResult, setAiGapResult] = useState<{
    transferableSkills: string[];
    recommendedLearningAreas: string[];
    practicalProjectRecommendations: string[];
    summary: string;
  } | null>(null);

  const activeJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0];
  const activeCand = candidates.find((c) => c.id === candidateId) ?? candidates[0];

  useEffect(() => {
    setAiGapResult(null);
  }, [candidateId, selectedJobId]);

  const match = useMemo(() => {
    if (!activeCand || !activeJob) return null;
    return getMatchFor(activeCand, activeJob.id);
  }, [activeCand, activeJob, getMatchFor]);

  const cohortSkillStats = useMemo(() => {
    if (!activeJob || candidates.length === 0) return [];
    const allJobSkills = [
      ...activeJob.requiredSkills.map((s) => ({ skill: s, mandatory: true })),
      ...activeJob.preferredSkills.map((s) => ({ skill: s, mandatory: false })),
    ];
    return allJobSkills.map(({ skill, mandatory }) => {
      const norm = normalizeSkillName(skill);
      const count = candidates.filter((c) =>
        c.skills.some((cs) => normalizeSkillName(cs) === norm)
      ).length;
      const pct = Math.round((count / candidates.length) * 100);
      return { skill, mandatory, count, pct };
    });
  }, [activeJob, candidates]);

  const handleGenerateRecommendations = async () => {
    if (!activeCand || !activeJob) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/matching/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: activeCand.name,
          candidateSkills: activeCand.skills,
          requiredSkills: activeJob.requiredSkills,
          preferredSkills: activeJob.preferredSkills,
          jobTitle: activeJob.title,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          gapAnalysis?: {
            transferableSkills: string[];
            recommendedLearningAreas: string[];
            practicalProjectRecommendations: string[];
            summary: string;
          };
        };
        if (data.gapAnalysis) {
          setAiGapResult(data.gapAnalysis);
          showToast(`Generated skill gap insights for ${activeCand.name}`);
        }
      }
    } catch {
      showToast('Failed to generate AI skill gap recommendations.', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  if (!activeCand || !activeJob) {
    return (
      <div className="rounded-2xl glass-card p-10 text-center text-xs text-outline">
        Add at least one candidate and one job opening to run skill gap analysis.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Skill Gap Analysis
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Distinguish mandatory required gaps from optional preferred gaps and generate AI upskilling paths.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={activeCand.id}
            onChange={(e) => setCandidateId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                Candidate: {c.name}
              </option>
            ))}
          </select>
          <select
            value={activeJob.id}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                Job: {j.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCustomJobModal(true)}
            className="h-9 flex items-center gap-1 px-3 rounded-xl bg-[#4F46E5]/20 hover:bg-[#4F46E5]/35 border border-[#8B5CF6]/40 text-primary text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Custom Role</span>
          </button>
          <button
            type="button"
            disabled={loadingAi}
            onClick={handleGenerateRecommendations}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingAi ? 'animate-spin' : ''}`}>
              {loadingAi ? 'refresh' : 'auto_awesome'}
            </span>
            <span>{loadingAi ? 'Analyzing...' : 'AI Recommendations'}</span>
          </button>
        </div>
      </div>

      {match && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl glass-card p-5 space-y-2.5 border border-emerald-500/30">
            <span className="font-label-sm text-emerald-400 uppercase tracking-wider block">
              Matched Skills ({match.matchedSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.matchedSkills.length === 0 ? (
                <span className="text-xs text-outline">None matched yet</span>
              ) : (
                match.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 font-mono-code text-xs"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 space-y-2.5 border border-rose-500/30">
            <span className="font-label-sm text-rose-400 uppercase tracking-wider block">
              Missing Required (Mandatory)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.missingRequiredSkills.length === 0 ? (
                <span className="text-xs text-emerald-300">All mandatory skills covered</span>
              ) : (
                match.missingRequiredSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 font-mono-code text-xs"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 space-y-2.5 border border-amber-500/30">
            <span className="font-label-sm text-amber-400 uppercase tracking-wider block">
              Missing Preferred (Optional)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.missingPreferredSkills.length === 0 ? (
                <span className="text-xs text-emerald-300">All optional skills covered</span>
              ) : (
                match.missingPreferredSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 font-mono-code text-xs"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 space-y-2.5 border border-[#8B5CF6]/30">
            <span className="font-label-sm text-[#c3c0ff] uppercase tracking-wider block">
              Transferable Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(aiGapResult?.transferableSkills ?? match.transferableSkills).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded bg-[#8B5CF6]/20 text-[#c3c0ff] font-mono-code text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {aiGapResult && (
        <div className="rounded-2xl glass-card p-5 border border-primary/40 space-y-4">
          <div className="flex items-center gap-2 text-primary font-headline-sm font-semibold">
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Improvement &amp; Upskilling Roadmap</span>
          </div>
          <p className="text-xs text-on-surface-variant">{aiGapResult.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-container space-y-2">
              <span className="font-label-sm text-tertiary uppercase block">
                Recommended Learning Areas
              </span>
              <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
                {aiGapResult.recommendedLearningAreas.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-surface-container space-y-2">
              <span className="font-label-sm text-secondary uppercase block">
                Practical Project Suggestions
              </span>
              <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
                {aiGapResult.practicalProjectRecommendations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cohort Coverage Matrix */}
      <div className="rounded-2xl glass-card p-space-lg shadow-sm space-y-4 tabular-nums">
        <h3 className="font-headline-sm text-on-surface font-semibold">
          Applicant Cohort Skill Coverage for {activeJob.title}
        </h3>
        {cohortSkillStats.map((row) => (
          <div
            key={`${row.skill}-${row.mandatory}`}
            className="p-3.5 rounded-xl bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="min-w-[220px]">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-on-surface text-sm">{row.skill}</p>
                <span
                  className={`px-2 py-0.5 rounded font-mono-code text-[10px] ${
                    row.mandatory
                      ? 'bg-primary-container/25 text-primary'
                      : 'bg-surface-container-high text-outline'
                  }`}
                >
                  {row.mandatory ? 'Required' : 'Preferred'}
                </span>
              </div>
              <span className="font-mono-code text-xs text-outline">
                {row.count} of {candidates.length} candidates ({row.pct}%)
              </span>
            </div>
            <div className="flex-1 max-w-md">
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    row.pct >= 60 ? 'bg-emerald-400' : row.pct >= 30 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <CustomJobRoleModal
        isOpen={showCustomJobModal}
        onClose={() => setShowCustomJobModal(false)}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. EMAIL CENTER VIEW (Page 12: 6 Templates + Multi-Select + Mailto/Copy)   */
/* -------------------------------------------------------------------------- */
type TemplateKey =
  | 'ack'
  | 'shortlist'
  | 'invite'
  | 'reminder'
  | 'offer'
  | 'reject';

const EMAIL_TEMPLATES: Record<
  TemplateKey,
  { label: string; subject: string; body: string }
> = {
  ack: {
    label: 'Application Acknowledgement',
    subject: 'Application Received: {{job_title}} @ HireSwift Partner',
    body: 'Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} position. Our recruitment team has received your resume and will review your qualifications shortly.\n\n{{recruiter_message}}\n\nBest regards,\nRecruitment Team',
  },
  shortlist: {
    label: 'Shortlisting Notification',
    subject: 'Good News! Shortlisted for {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nWe are pleased to share that your profile has been shortlisted for the {{job_title}} opening.\n\n{{recruiter_message}}\n\nWe will reach out shortly with interview scheduling options.\n\nBest regards,\nRecruitment Team',
  },
  invite: {
    label: 'Interview Invitation',
    subject: 'Interview Invitation: {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nOur hiring team was impressed with your background and would like to invite you to an interview for the {{job_title}} role.\n\n{{recruiter_message}}\n\nPlease reply with your preferred time slots.\n\nBest regards,\nRecruitment Team',
  },
  reminder: {
    label: 'Interview Reminder',
    subject: 'Reminder: Upcoming Interview for {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nThis is a friendly reminder regarding your upcoming interview for {{job_title}}.\n\n{{recruiter_message}}\n\nLooking forward to speaking with you!\n\nBest regards,\nRecruitment Team',
  },
  offer: {
    label: 'Offer Notification',
    subject: 'Official Offer: {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nCongratulations! Following our final evaluation, we are delighted to extend a formal offer for the {{job_title}} position.\n\n{{recruiter_message}}\n\nWelcome to the team!\n\nBest regards,\nRecruitment Team',
  },
  reject: {
    label: 'Rejection Notification',
    subject: 'Application Update: {{job_title}}',
    body: 'Hi {{candidate_name}},\n\nThank you for taking the time to apply for the {{job_title}} role. After careful consideration, we are moving forward with other candidates whose experience aligns more closely with our current needs.\n\n{{recruiter_message}}\n\nWe appreciate your interest and wish you every success ahead.\n\nBest regards,\nRecruitment Team',
  },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const EmailCenterView: React.FC = () => {
  const { candidates, jobs, selectedJobId, showToast } = useAts();
  const shortlistedIds = candidates
    .filter((c) => c.status === 'Shortlisted')
    .map((c) => c.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    shortlistedIds.length > 0 ? shortlistedIds.slice(0, 3) : candidates.slice(0, 2).map((c) => c.id)
  );
  const [templateKey, setTemplateKey] = useState<TemplateKey>('invite');
  const [jobTitleVar, setJobTitleVar] = useState<string>(
    jobs.find((j) => j.id === selectedJobId)?.title || jobs[0]?.title || 'Software Engineer'
  );
  const [recruiterMsgVar, setRecruiterMsgVar] = useState<string>(
    'Please share your availability for a 45-minute technical discussion this week.'
  );
  const [subjectTpl, setSubjectTpl] = useState(EMAIL_TEMPLATES.invite.subject);
  const [bodyTpl, setBodyTpl] = useState(EMAIL_TEMPLATES.invite.body);
  const [previewId, setPreviewId] = useState<string>(selectedIds[0] || '');
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>({});
  const [preparedIds, setPreparedIds] = useState<Record<string, boolean>>({});

  const applyTemplate = (key: TemplateKey) => {
    setTemplateKey(key);
    setSubjectTpl(EMAIL_TEMPLATES[key].subject);
    setBodyTpl(EMAIL_TEMPLATES[key].body);
    setCustomDrafts({});
  };

  const selectedCandidates = candidates.filter((c) => selectedIds.includes(c.id));
  const activePreview =
    selectedCandidates.find((c) => c.id === previewId) ?? selectedCandidates[0] ?? null;

  const renderDraft = (name: string, rawTpl: string) =>
    rawTpl
      .replace(/\{\{candidate_name\}\}/g, name)
      .replace(/\{\{job_title\}\}/g, jobTitleVar)
      .replace(/\{\{recruiter_message\}\}/g, recruiterMsgVar);

  const activeSubject = activePreview ? renderDraft(activePreview.name, subjectTpl) : subjectTpl;
  const activeBody = activePreview
    ? customDrafts[activePreview.id] ?? renderDraft(activePreview.name, bodyTpl)
    : bodyTpl;

  const handlePrepareAll = () => {
    const next: Record<string, boolean> = {};
    selectedCandidates.forEach((c) => {
      if (isValidEmail(c.email)) next[c.id] = true;
    });
    setPreparedIds(next);
    showToast(
      `Prepared ${Object.keys(next).length} personalized draft(s). Copy or open in your mail client.`
    );
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${activeSubject}\n\n${activeBody}`);
      showToast('Copied personalized email draft to clipboard');
    } catch {
      showToast('Clipboard permission unavailable in browser', 'warning');
    }
  };

  const handleDownloadEml = () => {
    if (!activePreview) return;
    const safeSlug = activePreview.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const emlContent = [
      `To: ${activePreview.email}`,
      `Subject: ${activeSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      activeBody,
    ].join('\r\n');
    const blob = new Blob([emlContent], { type: 'message/rfc822;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireswift_${safeSlug}.eml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded hireswift_${safeSlug}.eml`);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="font-heading font-extrabold text-headline-lg text-white">Email Center</h1>
        <p className="font-body-md text-body-md text-[#94A3B8]">
          Select shortlisted or pipeline candidates, apply templates with dynamic variables, and preview personalized drafts.
        </p>
      </div>

      {/* Clear Notice per Spec Section 17 */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
        <span className="material-symbols-outlined text-[18px] text-amber-400">info</span>
        <span>
          Direct bulk SMTP sending is not configured in this local workspace. Drafts are personalized per recipient and marked <strong>Prepared</strong> for clipboard copy or opening in your default email application via <code>mailto:</code>.
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Left: Recipients & Templates */}
        <div className="xl:col-span-4 space-y-5">
          <div className="rounded-2xl glass-card p-4 space-y-2">
            <h3 className="font-label-sm text-outline uppercase tracking-wider px-1 pb-1">
              Email Templates (6)
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(EMAIL_TEMPLATES) as TemplateKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTemplate(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    templateKey === key
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {EMAIL_TEMPLATES[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-label-sm text-outline uppercase tracking-wider">
                Recipients ({selectedCandidates.length})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedIds(shortlistedIds)}
                className="text-[11px] text-primary hover:underline cursor-pointer"
              >
                Select Shortlisted ({shortlistedIds.length})
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {candidates.map((c) => {
                const checked = selectedIds.includes(c.id);
                const valid = isValidEmail(c.email);
                return (
                  <label
                    key={c.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            checked ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                          if (!checked) setPreviewId(c.id);
                        }}
                        className="accent-[#8B5CF6]"
                      />
                      <div className="min-w-0">
                        <div className="text-on-surface font-medium truncate">{c.name}</div>
                        <div className="text-[10px] text-outline truncate">{c.email}</div>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono-code text-[10px] shrink-0 ${
                        !valid
                          ? 'bg-rose-500/20 text-rose-300'
                          : preparedIds[c.id]
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-surface-container-high text-outline'
                      }`}
                    >
                      {!valid ? 'Invalid' : preparedIds[c.id] ? 'Prepared' : c.status}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Template Variables + Live Personalized Preview */}
        <div className="xl:col-span-8 space-y-5">
          <div className="rounded-2xl glass-card p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-outline block mb-1">Job Title Variable ({'{{job_title}}'})</label>
                <select
                  value={jobTitleVar}
                  onChange={(e) => setJobTitleVar(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.title}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-outline block mb-1">
                  Recruiter Note ({'{{recruiter_message}}'})
                </label>
                <input
                  value={recruiterMsgVar}
                  onChange={(e) => setRecruiterMsgVar(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-outline block mb-1">Subject Template</label>
              <input
                value={subjectTpl}
                onChange={(e) => setSubjectTpl(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
              />
            </div>

            {/* Recipient Preview Switcher */}
            {selectedCandidates.length > 0 && (
              <div className="pt-2 border-t border-[#263449]">
                <span className="text-outline block mb-2">
                  Preview &amp; Individually Edit Draft for Recipient:
                </span>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedCandidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPreviewId(c.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                        activePreview?.id === c.id
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-surface-container text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePreview ? (
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-mono-code text-[11px] text-tertiary">
                    To: {activePreview.email} · Subject: {activeSubject}
                  </div>
                  <span className="font-mono-code text-[10px] text-outline">
                    Status: {preparedIds[activePreview.id] ? 'Prepared' : 'Draft'}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={activeBody}
                  onChange={(e) =>
                    setCustomDrafts((prev) => ({
                      ...prev,
                      [activePreview.id]: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg bg-[#0B1020] border border-[#263449] text-on-surface text-xs outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-white font-medium cursor-pointer"
                    >
                      Copy Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadEml}
                      className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-tertiary font-medium cursor-pointer"
                    >
                      Download .eml
                    </button>
                    {isValidEmail(activePreview.email) && (
                      <a
                        href={`mailto:${encodeURIComponent(activePreview.email)}?subject=${encodeURIComponent(activeSubject)}&body=${encodeURIComponent(activeBody)}`}
                        className="px-3.5 py-2 rounded-lg bg-primary-container/30 text-primary hover:bg-primary-container hover:text-white font-medium transition-colors"
                      >
                        Open in Mail App
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePrepareAll}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold cursor-pointer"
                  >
                    Mark {selectedCandidates.length} Draft(s) Prepared
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-outline">
                Select one or more recipients on the left to preview personalized email drafts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. REPORTS VIEW (Page 13: Dynamic Analytics + CSV/JSON Exports)            */
/* -------------------------------------------------------------------------- */
export const ReportsView: React.FC = () => {
  const { candidates, jobs, getMatchFor, showToast } = useAts();

  const total = candidates.length;
  const shortlistedPct = total
    ? Math.round((candidates.filter((c) => c.status === 'Shortlisted').length / total) * 100)
    : 0;
  const interviewPct = total
    ? Math.round((candidates.filter((c) => c.status === 'Interview').length / total) * 100)
    : 0;
  const offerPct = total
    ? Math.round((candidates.filter((c) => c.status === 'Offer').length / total) * 100)
    : 0;
  const rejectedPct = total
    ? Math.round((candidates.filter((c) => c.status === 'Rejected').length / total) * 100)
    : 0;

  const jobSummaryData = useMemo(
    () =>
      jobs.map((j) => {
        const assigned = candidates.filter((c) => c.targetJobId === j.id);
        const avg =
          assigned.length > 0
            ? Math.round(
                assigned.reduce(
                  (acc, c) => acc + (getMatchFor(c, j.id)?.overallScore ?? c.matchScore),
                  0
                ) / assigned.length
              )
            : 0;
        return {
          title: j.title,
          applicants: assigned.length,
          shortlisted: assigned.filter((c) => c.status === 'Shortlisted').length,
          avgScore: avg,
        };
      }),
    [jobs, candidates, getMatchFor]
  );

  const exportCandidatesCsv = () => {
    exportRowsToCsv(
      'hireswift_candidates_report.csv',
      ['ID', 'Name', 'Email', 'Location', 'Education', 'CGPA', 'Experience', 'Skills', 'Stage', 'Match Score'],
      candidates.map((c) => [
        c.id,
        c.name,
        c.email,
        c.location,
        c.education,
        c.cgpa,
        c.experience,
        c.skills.join('; '),
        c.status,
        getMatchFor(c)?.overallScore ?? c.matchScore,
      ])
    );
    showToast('Exported candidates report (CSV)');
  };

  const exportJobsCsv = () => {
    exportRowsToCsv(
      'hireswift_jobs_report.csv',
      ['ID', 'Title', 'Department', 'Location', 'Status', 'Required Skills', 'Preferred Skills', 'Min CGPA'],
      jobs.map((j) => [
        j.id,
        j.title,
        j.department,
        j.location,
        j.status,
        j.requiredSkills.join('; '),
        j.preferredSkills.join('; '),
        j.minimumCGPA ?? 'None',
      ])
    );
    showToast('Exported jobs report (CSV)');
  };

  const exportSummaryJson = () => {
    exportObjectToJson('hireswift_recruitment_summary.json', {
      generatedAt: new Date().toISOString(),
      totals: {
        candidates: total,
        jobs: jobs.length,
        shortlistedPct,
        interviewPct,
        offerPct,
        rejectedPct,
      },
      jobBreakdown: jobSummaryData,
    });
    showToast('Exported full recruitment summary (JSON)');
  };

  return (
    <div className="flex flex-col w-full gap-space-xl tabular-nums">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white">
            Recruitment Reports &amp; Exports
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Real-time funnel conversion metrics and downloadable CSV/JSON reports.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportCandidatesCsv}
            className="px-3.5 py-2 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs cursor-pointer hover:bg-[#1B2740]"
          >
            Export Candidates CSV
          </button>
          <button
            type="button"
            onClick={exportJobsCsv}
            className="px-3.5 py-2 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs cursor-pointer hover:bg-[#1B2740]"
          >
            Export Jobs CSV
          </button>
          <button
            type="button"
            onClick={exportSummaryJson}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-xs font-semibold cursor-pointer"
          >
            Export Summary JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Shortlist Rate</span>
          <p className="font-headline-xl text-on-surface mt-1">{shortlistedPct}%</p>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Interview Conversion</span>
          <p className="font-headline-xl text-tertiary mt-1">{interviewPct}%</p>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Offer Rate</span>
          <p className="font-headline-xl text-emerald-400 mt-1">{offerPct}%</p>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Rejection Rate</span>
          <p className="font-headline-xl text-rose-400 mt-1">{rejectedPct}%</p>
        </div>
      </div>

      <div className="rounded-2xl glass-card p-5 space-y-4">
        <h3 className="font-headline-sm text-on-surface font-semibold">
          Applicants &amp; Average Match by Job Opening
        </h3>
        {jobSummaryData.length === 0 ? (
          <div className="py-10 text-center text-xs text-outline">
            No jobs available for reporting.
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobSummaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
                <XAxis dataKey="title" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #263449',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="applicants" name="Applicants" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgScore" name="Avg Match %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. SETTINGS VIEW (Scoring Weights, Upload Limits, Session Data Control)    */
/* -------------------------------------------------------------------------- */
export const SettingsView: React.FC = () => {
  const {
    scoringWeights,
    updateScoringWeights,
    maxFileSizeMb,
    setMaxFileSizeMb,
    resetDemoData,
    clearSessionData,
    importDemoDataset,
    exportSessionJson,
    showToast,
    candidates,
    jobs,
  } = useAts();

  const [draftWeights, setDraftWeights] = useState<ScoringWeights>(scoringWeights);
  const [confirmClearSession, setConfirmClearSession] = useState(false);

  useEffect(() => {
    setDraftWeights(scoringWeights);
  }, [scoringWeights]);

  const totalWeight =
    draftWeights.skills +
    draftWeights.experience +
    draftWeights.education +
    draftWeights.projects +
    draftWeights.certifications +
    draftWeights.responsibilities;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight <= 0) {
      showToast('Total scoring weight must be greater than 0%.', 'error');
      return;
    }
    updateScoringWeights(draftWeights);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl max-w-4xl">
      <div>
        <h1 className="font-heading font-extrabold text-headline-lg text-white">
          Workspace Settings
        </h1>
        <p className="font-body-md text-body-md text-[#94A3B8]">
          Configure weighted matching formula, upload limits, and local session data.
        </p>
      </div>

      {/* Upload Config */}
      <div className="rounded-2xl glass-card p-5 space-y-4">

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body-md text-on-surface font-semibold">Max Resume File Size</p>
            <p className="font-body-sm text-on-surface-variant text-xs">
              Validation limit per PDF/DOCX file (4 MB keeps scanned PDFs under the 6 MB Netlify OCR limit after +33% base64 encoding).
            </p>
          </div>
          <select
            value={maxFileSizeMb}
            onChange={(e) => setMaxFileSizeMb(parseInt(e.target.value, 10))}
            className="h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface text-xs outline-none"
          >
            <option value={4}>4 MB (Serverless OCR Safe · Default)</option>
            <option value={6}>6 MB (Text PDFs / DOCX)</option>
            <option value={10}>10 MB (Express Local)</option>
            <option value={15}>15 MB (Express Local)</option>
          </select>
        </div>
      </div>

      {/* Configurable Weighted Scoring Matrix */}
      <form onSubmit={handleSaveWeights} className="rounded-2xl glass-card p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-headline-sm text-on-surface font-semibold">
              AI Matching Score Weights
            </h3>
            <p className="text-on-surface-variant">
              Adjust category importance. Scores are normalized automatically if sum differs from 100%.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full font-mono-code font-bold ${
              totalWeight === 100
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-300'
            }`}
          >
            Total: {totalWeight}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
          {(
            [
              ['skills', 'Technical Skills'],
              ['experience', 'Relevant Experience'],
              ['education', 'Education & Qualifications'],
              ['projects', 'Projects & Practical Work'],
              ['certifications', 'Certifications'],
              ['responsibilities', 'Job Responsibilities Alignment'],
            ] as [keyof ScoringWeights, string][]
          ).map(([key, label]) => (
            <div key={key} className="p-3 rounded-xl bg-surface-container space-y-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface font-medium">{label}</span>
                <span className="font-mono-code text-primary font-bold">{draftWeights[key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={draftWeights[key]}
                onChange={(e) =>
                  setDraftWeights((prev) => ({ ...prev, [key]: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-[#8B5CF6]"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setDraftWeights(DEFAULT_SCORING_WEIGHTS);
              updateScoringWeights(DEFAULT_SCORING_WEIGHTS);
            }}
            className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface cursor-pointer"
          >
            Reset Defaults (35/20/15/15/5/10)
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold cursor-pointer"
          >
            Apply Scoring Weights
          </button>
        </div>
      </form>

      {/* Session Data Management (No Database) */}
      <div className="rounded-2xl glass-card p-5 space-y-4 text-xs">
        <div>
          <h3 className="font-headline-sm text-on-surface font-semibold">
            Session Data Management ({candidates.length} Candidates, {jobs.length} Jobs)
          </h3>
          <p className="text-on-surface-variant mt-1">
            All data lives in in-memory application state and browser localStorage (no external database). Uploaded binary file previews clear on full browser reload; export JSON anytime to keep a backup.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={resetDemoData}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-medium cursor-pointer"
          >
            Reset Demo Data
          </button>
          <button
            type="button"
            onClick={importDemoDataset}
            className="px-3.5 py-2 rounded-xl bg-primary-container/25 text-primary hover:bg-primary-container hover:text-white font-medium cursor-pointer"
          >
            Import Demo Dataset
          </button>
          <button
            type="button"
            onClick={exportSessionJson}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-medium cursor-pointer"
          >
            Export Session JSON
          </button>
          {confirmClearSession ? (
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearSessionData();
                  setConfirmClearSession(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
              >
                Confirm Clear All
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearSession(false)}
                className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
              <button
                type="button"
                onClick={() => setConfirmClearSession(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 font-medium cursor-pointer"
              >
                Clear Session Data
              </button>
            )}
        </div>
      </div>

      {/* API & Model Pipeline Reference (for Footer "API & Integrations") */}
      <div className="rounded-2xl glass-card p-5 space-y-3 text-xs">
        <div>
          <h3 className="font-headline-sm text-on-surface font-semibold">
            API &amp; Multi-Model Fallback Integration
          </h3>
          <p className="text-on-surface-variant mt-1">
            Server-side endpoints route AI extraction requests sequentially through Gemini, OpenRouter, Groq, and deterministic fallback logic so API keys remain isolated on the backend.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-code text-[11px]">
          <div className="p-3 rounded-xl bg-surface-container border border-[#263449]/70">
            <span className="text-primary font-semibold block">POST /api/resumes/parse</span>
            <span className="text-outline">Structured PDF/DOCX &amp; scanned OCR parsing</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-[#263449]/70">
            <span className="text-primary font-semibold block">POST /api/jobs/analyze</span>
            <span className="text-outline">Automated JD skill, CGPA &amp; experience extraction</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-[#263449]/70">
            <span className="text-primary font-semibold block">POST /api/matching/analyze</span>
            <span className="text-outline">Weighted candidate-to-job scoring breakdown</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-[#263449]/70">
            <span className="text-primary font-semibold block">POST /api/matching/skill-gap</span>
            <span className="text-outline">Transferable skills &amp; upskilling recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. HELP CENTER VIEW                                                        */
/* -------------------------------------------------------------------------- */
export const HelpCenterView: React.FC<{ onNavigate: (r: WorkspaceRoute) => void }> = ({
  onNavigate,
}) => {
  return (
    <div className="flex flex-col w-full gap-space-xl max-w-4xl">
      <div>
        <h1 className="font-heading font-extrabold text-headline-lg text-white">
          Documentation, Migration &amp; Shortcuts
        </h1>
        <p className="font-body-md text-body-md text-[#94A3B8]">
          Quick guide to using HireSwift AI across resume parsing, ATS migration, weighted scoring, and pipeline tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <div className="rounded-2xl glass-card p-5 space-y-2">
          <span className="material-symbols-outlined text-primary">keyboard</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">Global Command Search</h3>
          <p className="font-body-sm text-on-surface-variant text-xs">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-code">⌘K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-code">Ctrl+K</kbd> anywhere to jump directly to candidates, jobs, or modules.
          </p>
        </div>

        <div className="rounded-2xl glass-card p-5 space-y-2">
          <span className="material-symbols-outlined text-tertiary">upload_file</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">Bulk Resume Upload</h3>
          <p className="font-body-sm text-on-surface-variant text-xs">
            Drop multiple PDF or DOCX resumes into Resume Upload for automatic text extraction, smart entity parsing, and duplicate checks.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="text-xs text-primary hover:underline cursor-pointer pt-1"
          >
            Go to Resume Upload →
          </button>
        </div>

        <div className="rounded-2xl glass-card p-5 space-y-2">
          <span className="material-symbols-outlined text-emerald-400">move_up</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">ATS Migration Guide</h3>
          <p className="font-body-sm text-on-surface-variant text-xs">
            Migrate existing talent pools in minutes: batch-upload legacy PDF/DOCX packets with SHA-256 deduplication, configure weighted scoring rubrics, and export structured CSV or JSON reports.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('resume-upload')}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Start Bulk Import →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="text-xs text-tertiary hover:underline cursor-pointer"
            >
              Session JSON Backup →
            </button>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-5 space-y-2">
          <span className="material-symbols-outlined text-amber-400">tune</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">Weighted Scoring &amp; Rubrics</h3>
          <p className="font-body-sm text-on-surface-variant text-xs">
            Candidates are scored dynamically across Technical Skills (35%), Experience (20%), Education (15%), Projects (15%), Responsibilities (10%), and Certifications (5%). Customize weights anytime in Settings.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('ai-matching')}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Open AI Matching →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('skill-gap-analysis')}
              className="text-xs text-tertiary hover:underline cursor-pointer"
            >
              View Skill Gap Rubrics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
