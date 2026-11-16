import React, { useState } from 'react';
import { CANDIDATES_DATA, WorkspaceRoute } from '../../data/atsData';

/* -------------------------------------------------------------------------- */
/* 1. SKILL GAP ANALYSIS VIEW                                                 */
/* -------------------------------------------------------------------------- */
export const SkillGapAnalysisView: React.FC = () => {
  const skillsMatrix = [
    { skill: 'Python / AsyncIO', required: 90, cohortAvg: 88, gap: '-2%', status: 'Covered' },
    { skill: 'Kubernetes / EKS', required: 85, cohortAvg: 64, gap: '-21%', status: 'Gap Flagged' },
    { skill: 'React 19 / TypeScript', required: 85, cohortAvg: 84, gap: '-1%', status: 'Covered' },
    { skill: 'Distributed System Design', required: 90, cohortAvg: 76, gap: '-14%', status: 'Moderate Gap' },
    { skill: 'LLM / RAG Pipelines', required: 80, cohortAvg: 71, gap: '-9%', status: 'Moderate Gap' },
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Skill Gap Analysis
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cohort competency coverage against open requisition requirements (42,000+ taxonomy nodes).
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm space-y-4 tabular-nums">
        {skillsMatrix.map((row) => (
          <div
            key={row.skill}
            className="p-4 rounded-xl bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="min-w-[220px]">
              <p className="font-headline-sm text-on-surface font-semibold">{row.skill}</p>
              <span className="font-mono-code text-xs text-outline">
                JD Target: {row.required}% · Cohort Avg: {row.cohortAvg}%
              </span>
            </div>
            <div className="flex-1 max-w-md">
              <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    row.status === 'Covered'
                      ? 'bg-emerald-400'
                      : row.status === 'Gap Flagged'
                        ? 'bg-error'
                        : 'bg-amber-400'
                  }`}
                  style={{ width: `${row.cohortAvg}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono-code text-xs text-on-surface-variant">{row.gap}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs ${
                  row.status === 'Covered'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : row.status === 'Gap Flagged'
                      ? 'bg-error-container/40 text-error'
                      : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. EMAIL CENTER VIEW                                                       */
/* -------------------------------------------------------------------------- */
export const EmailCenterView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<'invite' | 'followup' | 'offer'>('invite');
  const [recipient, setRecipient] = useState(CANDIDATES_DATA[0].email);
  const [subject, setSubject] = useState('Interview Invitation: Senior Python Developer @ Acme Corp');
  const [body, setBody] = useState(
    'Hi Rahul,\n\nOur engineering team reviewed your profile and would love to invite you to a 45-minute technical interview.\n\nPlease pick a slot that works best on our calendar link below:\nhttps://cal.com/acmecorp/tech-round-1\n\nBest regards,\nAcme Corp Talent Team'
  );
  const [sentNotice, setSentNotice] = useState(false);

  const applyTemplate = (tpl: 'invite' | 'followup' | 'offer') => {
    setSelectedTemplate(tpl);
    if (tpl === 'invite') {
      setSubject('Interview Invitation: Senior Python Developer @ Acme Corp');
      setBody(
        'Hi Rahul,\n\nOur engineering team reviewed your profile and would love to invite you to a 45-minute technical interview.\n\nPlease pick a slot that works best on our calendar link below:\nhttps://cal.com/acmecorp/tech-round-1\n\nBest regards,\nAcme Corp Talent Team'
      );
    } else if (tpl === 'followup') {
      setSubject('Quick Check-In: Next Steps with Acme Corp');
      setBody(
        'Hi Rahul,\n\nThank you for completing Technical Round 1. Our panel is finalizing feedback and will share next steps within 24 hours.\n\nBest,\nAcme Corp Talent Team'
      );
    } else {
      setSubject('Official Offer Letter: Senior Python Developer');
      setBody(
        'Hi Rahul,\n\nCongratulations! Following our final architecture review, we are thrilled to extend a formal offer to join Acme Corp.\n\nReview and sign your offer packet in the candidate portal.\n\nWelcome aboard,\nAcme Corp Talent Team'
      );
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Email Center</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Automated interview scheduling sequences, reminders, and 1-click offer outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-4 rounded-xl bg-surface-container-low p-4 space-y-2">
          <h3 className="font-label-sm text-outline uppercase tracking-wider px-2 pb-1">
            Sequence Templates
          </h3>
          {[
            { id: 'invite' as const, label: 'Technical Interview Invite', meta: 'Cal.com link attached' },
            { id: 'followup' as const, label: 'Post-Interview Update', meta: '24h SLA trigger' },
            { id: 'offer' as const, label: 'Formal Offer Dispatch', meta: 'DocuSign ready' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer ${
                selectedTemplate === t.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <p className="font-body-sm font-semibold">{t.label}</p>
              <p className="font-mono-code text-[11px] opacity-80 mt-0.5">{t.meta}</p>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSentNotice(true);
            setTimeout(() => setSentNotice(false), 3000);
          }}
          className="lg:col-span-8 rounded-xl bg-surface-container-low p-space-lg space-y-4"
        >
          <div>
            <label className="font-label-sm text-outline block mb-1">Recipient</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
            />
          </div>
          <div>
            <label className="font-label-sm text-outline block mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none"
            />
          </div>
          <div>
            <label className="font-label-sm text-outline block mb-1">Message Body</label>
            <textarea
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 rounded-lg bg-surface-container-highest text-on-surface text-sm outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            {sentNotice ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Email queued and dispatched to {recipient}
              </span>
            ) : (
              <span className="font-mono-code text-[11px] text-outline">
                Dynamic variables &amp; self-scheduling active
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. REPORTS VIEW                                                            */
/* -------------------------------------------------------------------------- */
export const ReportsView: React.FC = () => {
  return (
    <div className="flex flex-col w-full gap-space-xl tabular-nums">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Hiring Reports &amp; Benchmarks
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Velocity telemetry, source quality breakdown, and funnel conversion benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
        <div className="rounded-xl bg-surface-container-low p-5">
          <span className="font-label-sm text-outline uppercase">Median Time-to-Hire</span>
          <p className="font-headline-xl text-on-surface mt-2">11.4 Days</p>
          <span className="font-mono-code text-xs text-emerald-400">64% faster than industry</span>
        </div>
        <div className="rounded-xl bg-surface-container-low p-5">
          <span className="font-label-sm text-outline uppercase">Offer Acceptance Rate</span>
          <p className="font-headline-xl text-on-surface mt-2">88.2%</p>
          <span className="font-mono-code text-xs text-tertiary">+6.4% QoQ improvement</span>
        </div>
        <div className="rounded-xl bg-surface-container-low p-5">
          <span className="font-label-sm text-outline uppercase">AI Shortlist Precision</span>
          <p className="font-headline-xl text-on-surface mt-2">94.1%</p>
          <span className="font-mono-code text-xs text-primary">1,280 resumes evaluated</span>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low p-space-lg space-y-4">
        <h3 className="font-headline-sm text-on-surface font-semibold">
          Source Channel Effectiveness
        </h3>
        {[
          { source: 'Direct Career Portal', hires: '42%', match: '87% avg match' },
          { source: 'Employee Referrals', hires: '29%', match: '92% avg match' },
          { source: 'LinkedIn Inbound', hires: '19%', match: '81% avg match' },
          { source: 'University / Campus Drives', hires: '10%', match: '84% avg match' },
        ].map((item) => (
          <div key={item.source} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface">{item.source}</span>
              <span className="font-mono-code text-xs text-tertiary">
                {item.hires} · {item.match}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: item.hires }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. SETTINGS VIEW                                                           */
/* -------------------------------------------------------------------------- */
export const SettingsView: React.FC = () => {
  const [dedupEnabled, setDedupEnabled] = useState(true);
  const [piiMasking, setPiiMasking] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col w-full gap-space-xl max-w-4xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Workspace Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Configure AI parser strictness, PII redaction, and organization preferences.
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-low p-space-lg space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div>
            <p className="font-body-md text-on-surface font-semibold">
              Automatic Vector Deduplication
            </p>
            <p className="font-body-sm text-on-surface-variant">
              Flag applicants matching &gt;95% embedding similarity in existing database.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDedupEnabled((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-mono-code text-xs cursor-pointer ${
              dedupEnabled
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-high text-outline'
            }`}
          >
            {dedupEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div>
            <p className="font-body-md text-on-surface font-semibold">
              SOC-2 PII Redaction Layer
            </p>
            <p className="font-body-sm text-on-surface-variant">
              Mask personal phone numbers and home addresses during unbiased initial scoring.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPiiMasking((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-mono-code text-xs cursor-pointer ${
              piiMasking
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-high text-outline'
            }`}
          >
            {piiMasking ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-emerald-400">Settings saved cleanly.</span>
          ) : (
            <span className="font-mono-code text-xs text-outline">Plan: Acme Corp (Pro Plan)</span>
          )}
          <button
            type="button"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer"
          >
            Save Preferences
          </button>
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
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Help Center &amp; Shortcuts
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Documentation and keyboard-first shortcuts for high-velocity recruitment teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <div className="rounded-xl bg-surface-container-low p-5 space-y-2">
          <span className="material-symbols-outlined text-primary">keyboard</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">Global Command Search</h3>
          <p className="font-body-sm text-on-surface-variant">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-code text-xs">⌘K</kbd> anywhere in the workspace to jump directly to candidates, jobs, or tools.
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-5 space-y-2">
          <span className="material-symbols-outlined text-tertiary">upload_file</span>
          <h3 className="font-headline-sm text-on-surface font-semibold">Bulk Resume Ingestion</h3>
          <p className="font-body-sm text-on-surface-variant">
            Drag &amp; drop PDF or DOCX files up to 10 MB each into the Resume Upload queue for parallel OCR extraction.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="text-xs text-primary hover:underline cursor-pointer pt-1"
          >
            Go to Resume Upload →
          </button>
        </div>
      </div>
    </div>
  );
};
