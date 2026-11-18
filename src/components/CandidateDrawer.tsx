import React, { useEffect, useState } from 'react';
import { useAts } from '../context/AtsContext';
import { CandidateProfile, HiringStage } from '../data/atsData';
import { exportObjectToJson } from '../utils/atsEngine';

interface CandidateDrawerProps {
  candidate: CandidateProfile | null;
  onClose: () => void;
  onScheduleEmail?: (candidate: CandidateProfile) => void;
}

type DrawerTab = 'overview' | 'education' | 'ai-breakdown' | 'edit' | 'resume' | 'timeline';

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  onClose,
  onScheduleEmail,
}) => {
  const {
    candidates,
    jobs,
    selectedJobId,
    getMatchFor,
    runGeminiMatchForCandidate,
    updateCandidate,
    deleteCandidate,
    moveCandidateStage,
    toggleCompareCandidate,
    compareIds,
    aiLoadingKey,
  } = useAts();

  const liveCandidate = candidate
    ? candidates.find((c) => c.id === candidate.id) ?? candidate
    : null;

  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [evalJobId, setEvalJobId] = useState<string>(
    liveCandidate?.targetJobId || selectedJobId || jobs[0]?.id || ''
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);

  // Editable form fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editExp, setEditExp] = useState('');
  const [editCgpa, setEditCgpa] = useState('');
  const [editTenth, setEditTenth] = useState('');
  const [editTwelfth, setEditTwelfth] = useState('');
  const [editGradYear, setEditGradYear] = useState('');
  const [editDegree, setEditDegree] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editStage, setEditStage] = useState<HiringStage>('Applied');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (!liveCandidate) return;
    setEvalJobId(liveCandidate.targetJobId || selectedJobId || jobs[0]?.id || '');
    setConfirmDelete(false);
    setShowRejectPrompt(false);
    setEditName(liveCandidate.name);
    setEditEmail(liveCandidate.email);
    setEditPhone(liveCandidate.phone || '');
    setEditLocation(liveCandidate.location);
    setEditRole(liveCandidate.role);
    setEditExp(String(liveCandidate.experienceYears));
    setEditCgpa(
      liveCandidate.educationDetail.cgpa !== null
        ? String(liveCandidate.educationDetail.cgpa)
        : ''
    );
    setEditTenth(
      liveCandidate.educationDetail.tenthPercentage !== null
        ? String(liveCandidate.educationDetail.tenthPercentage)
        : ''
    );
    setEditTwelfth(
      liveCandidate.educationDetail.twelfthPercentage !== null
        ? String(liveCandidate.educationDetail.twelfthPercentage)
        : ''
    );
    setEditGradYear(
      liveCandidate.educationDetail.graduationYear !== null
        ? String(liveCandidate.educationDetail.graduationYear)
        : ''
    );
    setEditDegree(liveCandidate.educationDetail.degree);
    setEditBranch(liveCandidate.educationDetail.branch);
    setEditCollege(liveCandidate.educationDetail.college);
    setEditSkills(liveCandidate.skills.join(', '));
    setEditStage(liveCandidate.status);
    setEditNotes(liveCandidate.notes || '');
  }, [liveCandidate?.id, selectedJobId, jobs]);

  if (!liveCandidate) return null;

  const matchResult = getMatchFor(liveCandidate, evalJobId);
  const evalJob = jobs.find((j) => j.id === evalJobId) ?? jobs[0];
  const isEvaluating = aiLoadingKey === `${liveCandidate.id}::${evalJobId}`;
  const isCompared = compareIds.includes(liveCandidate.id);

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'education', label: 'Education & Exp' },
    { id: 'ai-breakdown', label: 'AI Match & Qs' },
    { id: 'edit', label: 'Edit Profile' },
    { id: 'resume', label: 'Original Resume' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCgpa = editCgpa.trim() ? parseFloat(editCgpa) : null;
    const parsedTenth = editTenth.trim() ? parseFloat(editTenth) : null;
    const parsedTwelfth = editTwelfth.trim() ? parseFloat(editTwelfth) : null;
    const parsedGrad = editGradYear.trim() ? parseInt(editGradYear, 10) : null;
    const parsedExp = Math.max(0, parseFloat(editExp) || 0);
    const updatedSkills = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const initials = editName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');

    const safeTenth = parsedTenth !== null && !Number.isNaN(parsedTenth) ? parsedTenth : null;
    const safeTwelfth =
      parsedTwelfth !== null && !Number.isNaN(parsedTwelfth) ? parsedTwelfth : null;

    const updated: CandidateProfile = {
      ...liveCandidate,
      name: editName.trim() || liveCandidate.name,
      initials: initials || liveCandidate.initials,
      email: editEmail.trim() || liveCandidate.email,
      phone: editPhone.trim() || null,
      location: editLocation.trim() || 'Remote',
      role: editRole.trim() || liveCandidate.role,
      currentTitle: parsedExp > 0 ? editRole.trim() || liveCandidate.currentTitle : null,
      experienceYears: parsedExp,
      experience: parsedExp === 0 ? 'Fresher (0 yrs)' : `${parsedExp.toFixed(1)} yrs`,
      education: `${editDegree.trim()} ${editBranch.trim()}`.trim(),
      cgpa: parsedCgpa !== null && !Number.isNaN(parsedCgpa) ? `${parsedCgpa.toFixed(1)} CGPA` : 'Not Listed',
      tenthTwelfth:
        safeTenth !== null && safeTwelfth !== null
          ? `${safeTenth}% / ${safeTwelfth}%`
          : safeTenth !== null
            ? `${safeTenth}% / N/A`
            : safeTwelfth !== null
              ? `N/A / ${safeTwelfth}%`
              : 'Not Listed',
      educationDetail: {
        ...liveCandidate.educationDetail,
        degree: editDegree.trim(),
        branch: editBranch.trim(),
        college: editCollege.trim(),
        cgpa: parsedCgpa !== null && !Number.isNaN(parsedCgpa) ? parsedCgpa : null,
        tenthPercentage: safeTenth,
        twelfthPercentage: safeTwelfth,
        graduationYear: parsedGrad !== null && !Number.isNaN(parsedGrad) ? parsedGrad : null,
      },
      skills: updatedSkills.length > 0 ? updatedSkills : liveCandidate.skills,
      status: editStage,
      notes: editNotes.trim() || undefined,
      timeline: [
        {
          time: 'Just now',
          event: 'Profile Manually Updated',
          detail: 'Recruiter edited fields and recalculated matching scores',
        },
        ...liveCandidate.timeline,
      ],
    };

    updateCandidate(updated);
    setActiveTab('overview');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <aside className="relative w-full sm:max-w-[600px] h-full bg-[#0B1020]/95 backdrop-blur-xl sm:border-l border-[#263449] shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#263449] flex items-start justify-between gap-3 sm:gap-4 bg-[#151E32]/85">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-headline-sm font-bold text-base shrink-0 ${liveCandidate.avatarTone}`}
            >
              {liveCandidate.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-md text-on-surface font-semibold truncate">
                  {liveCandidate.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {matchResult ? matchResult.overallScore : liveCandidate.matchScore}% Match
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono-code text-[10px]">
                  {liveCandidate.status}
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant truncate mt-0.5">
                {liveCandidate.role} · {liveCandidate.location} · {liveCandidate.experience}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
            aria-label="Close candidate details"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Job Selector for Matching Context */}
        {jobs.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 border-b border-[#263449] bg-[#111827]/70 flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto flex-1">
              <span className="font-mono-code text-[10px] uppercase text-outline shrink-0">Match Target:</span>
              <select
                value={evalJobId}
                onChange={(e) => setEvalJobId(e.target.value)}
                className="h-9 sm:h-8 px-2.5 rounded-lg bg-[#151E32] border border-[#263449] text-xs text-white outline-none w-full sm:w-auto max-w-full min-w-0"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={isEvaluating}
              onClick={() => runGeminiMatchForCandidate(liveCandidate.id, evalJobId)}
              className="w-full sm:w-auto justify-center px-3 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[14px] ${isEvaluating ? 'animate-spin' : ''}`}>
                {isEvaluating ? 'refresh' : 'auto_awesome'}
              </span>
              <span>{isEvaluating ? 'Analyzing...' : 'Evaluate with AI'}</span>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 sm:px-5 pt-1 border-b border-[#263449] flex items-center gap-1 overflow-x-auto bg-surface-container-lowest/40">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2.5 min-h-[42px] sm:min-h-0 shrink-0 font-label-md text-[12px] whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'border-[#8B5CF6] text-white font-semibold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'overview' && (
            <>
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-tertiary uppercase tracking-wider">
                    Candidate Executive Summary
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    Smart AI Parser
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  {liveCandidate.summary}
                </p>
              </div>

              {/* Contact & Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449] space-y-1">
                  <span className="font-label-sm text-outline block uppercase">Contact</span>
                  <div className="text-on-surface font-medium truncate">{liveCandidate.email}</div>
                  <div className="text-on-surface-variant font-mono-code">
                    {liveCandidate.phone || 'Phone not provided'}
                  </div>
                  <div className="text-tertiary text-[11px]">
                    {liveCandidate.remoteAvailable ? 'Open to Remote' : 'On-site / Hybrid'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449] space-y-1">
                  <span className="font-label-sm text-outline block uppercase">Academics Snapshot</span>
                  <div className="text-on-surface font-semibold">{liveCandidate.education}</div>
                  <div className="font-mono-code text-[11px] text-tertiary">
                    CGPA: {liveCandidate.cgpa} · Grad:{' '}
                    {liveCandidate.educationDetail.graduationYear ?? 'N/A'}
                  </div>
                  <div className="font-mono-code text-[11px] text-on-surface-variant">
                    10th / 12th: {liveCandidate.tenthTwelfth}
                  </div>
                </div>
              </div>

              {liveCandidate.missingFields.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
                  <span>
                    Missing fields on resume: <strong>{liveCandidate.missingFields.join(', ')}</strong> (not treated as zero)
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold shrink-0 cursor-pointer"
                  >
                    Fill Manually
                  </button>
                </div>
              )}

              <div>
                <h3 className="font-label-sm text-outline uppercase tracking-wider mb-2.5">
                  Categorized Technical Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {liveCandidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded bg-surface-container-high border border-[#263449] text-on-surface font-mono-code text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-label-sm text-outline uppercase tracking-wider mb-2.5">
                  Key Highlights &amp; Achievements
                </h3>
                <ul className="space-y-2">
                  {liveCandidate.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-lg bg-surface-container-low border border-[#263449] flex items-start gap-2.5 font-body-sm text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                        verified
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-2.5 text-xs">
                <h3 className="font-label-sm text-primary uppercase tracking-wider">
                  Education History
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-outline block">Undergraduate</span>
                    <span className="text-on-surface font-semibold">
                      {liveCandidate.educationDetail.degree} ({liveCandidate.educationDetail.branch})
                    </span>
                    <span className="block text-on-surface-variant mt-0.5">
                      {liveCandidate.educationDetail.college}
                    </span>
                    <span className="block font-mono-code text-tertiary mt-0.5">
                      {liveCandidate.cgpa} · Class of{' '}
                      {liveCandidate.educationDetail.graduationYear ?? 'Unknown'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-outline block">10th &amp; 12th Academics</span>
                    <span className="text-on-surface font-semibold block">
                      10th: {liveCandidate.educationDetail.tenthPercentage !== null ? `${liveCandidate.educationDetail.tenthPercentage}%` : 'Not Listed'}
                    </span>
                    <span className="text-on-surface font-semibold block mt-0.5">
                      12th: {liveCandidate.educationDetail.twelfthPercentage !== null ? `${liveCandidate.educationDetail.twelfthPercentage}%` : 'Not Listed'}
                    </span>
                    {liveCandidate.educationDetail.postgraduateDetails && (
                      <span className="text-secondary block mt-0.5">
                        PG: {liveCandidate.educationDetail.postgraduateDetails}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h3 className="font-label-sm text-tertiary uppercase tracking-wider">
                    Professional Employment ({liveCandidate.workHistory.length})
                  </h3>
                  <span className="font-mono-code text-[11px] text-outline">
                    {liveCandidate.experienceYears} yrs total
                  </span>
                </div>
                {liveCandidate.workHistory.length === 0 ? (
                  <p className="text-xs text-outline">No full-time employment listed (Fresher / Early Career).</p>
                ) : (
                  liveCandidate.workHistory.map((w, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-container-low text-xs">
                      <div className="flex justify-between flex-wrap gap-1 font-semibold text-on-surface">
                        <span>{w.role} · {w.company}</span>
                        <span className="font-mono-code text-tertiary">{w.duration}</span>
                      </div>
                      <p className="text-on-surface-variant mt-1">{w.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-2.5">
                <h3 className="font-label-sm text-secondary uppercase tracking-wider">
                  Internships ({liveCandidate.internships.length})
                </h3>
                {liveCandidate.internships.length === 0 ? (
                  <p className="text-xs text-outline">No internships listed.</p>
                ) : (
                  liveCandidate.internships.map((intern, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-container-low text-xs">
                      <div className="flex justify-between flex-wrap gap-1 font-semibold text-on-surface">
                        <span>{intern.role} · {intern.company}</span>
                        <span className="font-mono-code text-secondary">{intern.duration}</span>
                      </div>
                      <p className="text-on-surface-variant mt-1">{intern.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-2.5">
                <h3 className="font-label-sm text-outline uppercase tracking-wider">
                  Projects &amp; Certifications
                </h3>
                {liveCandidate.projects.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-container-low text-xs">
                    <p className="font-semibold text-on-surface">{p.name}</p>
                    <p className="text-on-surface-variant mt-0.5">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.technologies.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {liveCandidate.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {liveCandidate.certifications.map((cert) => (
                      <span key={cert} className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-mono-code">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai-breakdown' && matchResult && (
            <div className="space-y-4 tabular-nums">
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-tertiary uppercase">
                    Match Evaluation: {evalJob?.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-primary font-mono-code text-[11px] font-bold">
                    {matchResult.overallScore}% · {matchResult.category}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
                  {matchResult.explanation}
                </p>
                <p className="text-[11px] text-outline mt-2 font-mono-code">
                  {matchResult.decisionRationale}
                </p>
              </div>

              {[
                { label: 'Technical Skills', val: matchResult.categoryScores.skills },
                { label: 'Relevant Experience', val: matchResult.categoryScores.experience },
                { label: 'Education & Qualifications', val: matchResult.categoryScores.education },
                { label: 'Projects & Practical Work', val: matchResult.categoryScores.projects },
                { label: 'Certifications', val: matchResult.categoryScores.certifications },
                { label: 'Responsibilities Alignment', val: matchResult.categoryScores.responsibilities },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-surface-container-low border border-[#263449]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-on-surface font-medium">{item.label}</span>
                    <span className="font-mono-code text-primary font-bold">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-emerald-400 uppercase block mb-2">
                    Strongest Areas
                  </span>
                  <ul className="space-y-1 text-on-surface-variant list-disc pl-4">
                    {matchResult.strongestAreas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-amber-400 uppercase block mb-2">
                    Missing / Concerns
                  </span>
                  {matchResult.potentialConcerns.length === 0 ? (
                    <p className="text-emerald-300">All core job requirements covered.</p>
                  ) : (
                    <ul className="space-y-1 text-on-surface-variant list-disc pl-4">
                      {matchResult.potentialConcerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] space-y-2">
                <span className="font-label-sm text-primary uppercase block">
                  AI-Generated Interview Questions
                </span>
                <ol className="space-y-2 list-decimal pl-4 text-xs text-on-surface-variant">
                  {matchResult.interviewQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-primary-container/15 border border-primary/30 text-on-surface-variant">
                Manual corrections update the active session profile and immediately recalculate matching scores.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-outline block mb-1">Full Name</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Phone</label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Location</label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Target Role</label>
                  <input
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Degree</label>
                  <input
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Branch</label>
                  <input
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">CGPA (blank if unavailable)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editGradYear}
                    onChange={(e) => setEditGradYear(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">10th Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editTenth}
                    onChange={(e) => setEditTenth(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="text-outline block mb-1">12th Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editTwelfth}
                    onChange={(e) => setEditTwelfth(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-outline block mb-1">College / Institution</label>
                <input
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="text-outline block mb-1">Skills (comma separated)</label>
                <input
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-outline block mb-1">Hiring Stage</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as HiringStage)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-outline block mb-1">Recruiter Notes</label>
                  <input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add feedback or notes"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 min-h-[40px] rounded-lg bg-surface-container-high text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 min-h-[40px] rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold cursor-pointer"
                >
                  Save &amp; Recalculate Match
                </button>
              </div>
            </form>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-body-sm font-semibold text-on-surface">
                    {liveCandidate.resumeFileName}
                  </p>
                  <p className="font-mono-code text-[11px] text-outline">
                    Type: {liveCandidate.resumeFileType} · Confidence: Name{' '}
                    {Math.round(liveCandidate.confidence.name * 100)}% · Edu{' '}
                    {Math.round(liveCandidate.confidence.education * 100)}% · Skills{' '}
                    {Math.round(liveCandidate.confidence.skills * 100)}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {liveCandidate.resumeObjectUrl && (
                    <a
                      href={liveCandidate.resumeObjectUrl}
                      download={liveCandidate.resumeFileName}
                      className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Download File</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      exportObjectToJson(
                        `${liveCandidate.name.replace(/\s+/g, '_')}_profile.json`,
                        liveCandidate
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs text-on-surface cursor-pointer"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-[#263449] font-mono-code text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                {liveCandidate.resumeTextPreview ||
                  `[Raw full resume text is kept in volatile session memory only and omitted from localStorage across page reloads.]\n\nStructured Profile Summary:\n${liveCandidate.name}\n${liveCandidate.email}\n${liveCandidate.education} (${liveCandidate.cgpa})\nSkills: ${liveCandidate.skills.join(', ')}\n\n${liveCandidate.summary}`}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
              {liveCandidate.timeline.map((ev, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-4 ring-[#0F172A]">
                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                  </div>
                  <p className="font-body-sm text-on-surface font-medium">{ev.event}</p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">{ev.detail}</p>
                  <span className="font-mono-code text-[10px] text-outline mt-1 block">{ev.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Reject Reason Inline Bar */}
        {showRejectPrompt && (
          <div className="px-4 py-3 bg-rose-500/10 border-t border-rose-500/30 flex items-center flex-wrap gap-2">
            <input
              type="text"
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="Optional rejection reason..."
              className="flex-1 min-w-[180px] h-9 sm:h-8 px-3 rounded-lg bg-[#0B1020] border border-rose-500/30 text-xs text-white outline-none"
            />
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  moveCandidateStage(liveCandidate.id, 'Rejected', {
                    rejectionReason: rejectReasonInput.trim() || 'Skills mismatch for target role',
                  });
                  setShowRejectPrompt(false);
                  setRejectReasonInput('');
                }}
                className="px-3 py-1.5 min-h-[36px] rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => setShowRejectPrompt(false)}
                className="px-2 py-1.5 min-h-[36px] text-xs text-outline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-[#263449] bg-surface-container-low flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => moveCandidateStage(liveCandidate.id, 'Shortlisted')}
              className={`py-2 px-3 min-h-[40px] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                liveCandidate.status === 'Shortlisted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-primary-container hover:bg-inverse-primary text-on-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">star</span>
              <span>{liveCandidate.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <button
              type="button"
              onClick={() => moveCandidateStage(liveCandidate.id, 'Interview')}
              className="py-2 px-3 min-h-[40px] rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium cursor-pointer"
            >
              Interview
            </button>

            <button
              type="button"
              onClick={() => setShowRejectPrompt((v) => !v)}
              className="py-2 px-3 min-h-[40px] rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium cursor-pointer"
            >
              Reject
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleCompareCandidate(liveCandidate.id)}
              className={`py-2 px-3 min-h-[40px] rounded-lg text-xs font-medium cursor-pointer border ${
                isCompared
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#c3c0ff]'
                  : 'bg-surface-container-high border-transparent text-on-surface'
              }`}
            >
              {isCompared ? 'In Compare' : '+ Compare'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onScheduleEmail) onScheduleEmail(liveCandidate);
                onClose();
              }}
              className="py-2 px-3 min-h-[40px] rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">mail</span>
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg text-outline hover:text-rose-400 hover:bg-surface-container-high cursor-pointer"
              title="Delete candidate"
              aria-label={`Delete ${liveCandidate.name}`}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </aside>

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-delete-permission-title"
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-rose-500/40 shadow-2xl p-4 sm:p-6 z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-rose-400">warning</span>
              </div>
              <div className="space-y-1">
                <h3
                  id="drawer-delete-permission-title"
                  className="font-headline-md text-white font-semibold"
                >
                  Permission to Delete Candidate?
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Do you give permission to permanently delete{' '}
                  <strong className="text-white">{liveCandidate.name}</strong> ({liveCandidate.email})
                  from browser <code className="text-rose-300">localStorage</code>? Candidates stay
                  saved in your browser until you delete them.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-medium text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCandidate(liveCandidate.id);
                  setConfirmDelete(false);
                  onClose();
                }}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white cursor-pointer"
              >
                Yes, Delete Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
