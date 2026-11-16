import React, { useState } from 'react';
import { CandidateProfile } from '../data/atsData';

interface CandidateDrawerProps {
  candidate: CandidateProfile | null;
  onClose: () => void;
  onScheduleEmail?: (candidate: CandidateProfile) => void;
}

type DrawerTab = 'overview' | 'resume-parse' | 'ai-breakdown' | 'scorecard' | 'timeline';

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  onClose,
  onScheduleEmail,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [shortlisted, setShortlisted] = useState(false);

  if (!candidate) return null;

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'resume-parse', label: 'Resume Parse' },
    { id: 'ai-breakdown', label: 'AI Score Breakdown' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="relative w-full max-w-[540px] h-full bg-[#0F172A] border-l border-[#263449] shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#263449] flex items-start justify-between gap-4 bg-surface-container-low/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-sm font-bold text-base shrink-0 ${candidate.avatarTone}`}
            >
              {candidate.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-md text-on-surface font-semibold truncate">
                  {candidate.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {candidate.matchScore}% Match
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant truncate mt-0.5">
                {candidate.role} · {candidate.location} · {candidate.experience}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Close candidate details"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-2 border-b border-[#263449] flex items-center gap-1 overflow-x-auto bg-surface-container-lowest/40">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2.5 font-label-md text-[12px] whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'border-primary-container text-primary font-semibold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <>
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-tertiary uppercase tracking-wider">
                    AI Executive Summary
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    Gemini 1.5 Pro ATS
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  {candidate.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-outline block">Education &amp; CGPA</span>
                  <span className="font-body-md text-on-surface font-semibold mt-1 block">
                    {candidate.education}
                  </span>
                  <span className="font-mono-code text-[11px] text-tertiary">{candidate.cgpa}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-outline block">10th / 12th Academics</span>
                  <span className="font-body-md text-on-surface font-semibold mt-1 block">
                    {candidate.tenthTwelfth}
                  </span>
                  <span className="font-mono-code text-[11px] text-emerald-400">
                    Cutoff Verified
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-label-sm text-outline uppercase tracking-wider mb-2.5">
                  Extracted Technical Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
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
                  Verified Resume Citations
                </h3>
                <ul className="space-y-2">
                  {candidate.highlights.map((h, i) => (
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

          {activeTab === 'resume-parse' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-sm text-primary uppercase tracking-wider">
                    Extracted Entity Layer
                  </span>
                  <span className="font-mono-code text-[11px] text-emerald-400">
                    99.4% Confidence
                  </span>
                </div>
                <p className="font-body-sm text-on-surface leading-relaxed">
                  Candidate{' '}
                  <span className="px-1.5 py-0.5 rounded bg-primary-container/25 text-primary font-medium">
                    {candidate.name}
                  </span>{' '}
                  holds{' '}
                  <span className="px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-medium">
                    {candidate.education} ({candidate.cgpa})
                  </span>{' '}
                  with{' '}
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                    {candidate.experience} production tenure
                  </span>{' '}
                  specializing in{' '}
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container/30 text-secondary font-medium">
                    {candidate.skills.join(', ')}
                  </span>
                  .
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-[#263449] font-mono-code text-[11px] text-on-surface-variant space-y-1.5">
                <div className="text-tertiary">CONTACT: {candidate.email}</div>
                <div>LOCATION: {candidate.location}</div>
                <div>STAGE: {candidate.status}</div>
                <div>DEDUP_HASH: sha256:9f2c81b0...44a1 (0 conflicts)</div>
              </div>
            </div>
          )}

          {activeTab === 'ai-breakdown' && (
            <div className="space-y-4 tabular-nums">
              {[
                { label: 'Technical Skills Alignment', val: candidate.radar.technicalSkills },
                { label: 'Problem Solving & Scale', val: candidate.radar.problemSolving },
                { label: 'System Architecture', val: candidate.radar.architecture },
                { label: 'Communication Clarity', val: candidate.radar.communication },
                { label: 'Cultural & Team Fit', val: candidate.radar.culturalFit },
              ].map((item) => (
                <div key={item.label} className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <div className="flex justify-between font-body-sm mb-2">
                    <span className="text-on-surface font-medium">{item.label}</span>
                    <span className="font-mono-code text-primary font-bold">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scorecard' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-[#263449]">
                <h4 className="font-headline-sm text-on-surface mb-1">Hiring Rubric Evaluation</h4>
                <p className="font-body-sm text-on-surface-variant">
                  Weighted evaluation across engineering rigor, academic baseline, and delivery ownership.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 tabular-nums">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-outline">Overall Score</span>
                  <p className="font-headline-lg text-emerald-400 font-bold mt-1">
                    {candidate.matchScore} / 100
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#263449]">
                  <span className="font-label-sm text-outline">Recommendation</span>
                  <p className="font-headline-sm text-primary font-bold mt-2">Strong Hire</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
              {candidate.timeline.map((ev, idx) => (
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#263449] bg-surface-container-low flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShortlisted((s) => !s)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-label-md font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              shortlisted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-primary-container hover:bg-inverse-primary text-on-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {shortlisted ? 'check_circle' : 'star'}
            </span>
            <span>{shortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onScheduleEmail) onScheduleEmail(candidate);
              onClose();
            }}
            className="py-2.5 px-4 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">mail</span>
            <span>Message</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
