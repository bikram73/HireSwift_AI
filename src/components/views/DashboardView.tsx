import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAts } from '../../context/AtsContext';
import { CandidateProfile, WorkspaceRoute } from '../../data/atsData';

interface DashboardViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

const CHART_COLORS = ['#4F46E5', '#8B5CF6', '#3B82F6', '#22C55E', '#EF4444'];

const TooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #263449',
  borderRadius: '12px',
  color: '#F8FAFC',
  fontSize: '12px',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const {
    candidates,
    jobs,
    activities,
    selectedJob,
    getMatchFor,
    setStageFilterPreset,
    setSelectedJobId,
    importDemoDataset,
  } = useAts();

  const metrics = useMemo(() => {
    const total = candidates.length;
    const activeJobs = jobs.filter((j) => j.status === 'Active');
    const urgentJobs = activeJobs.filter((j) => j.priority === 'Urgent').length;
    const shortlisted = candidates.filter((c) => c.status === 'Shortlisted').length;
    const interviews = candidates.filter((c) => c.status === 'Interview').length;
    const offers = candidates.filter((c) => c.status === 'Offer').length;
    const rejected = candidates.filter((c) => c.status === 'Rejected').length;
    const applied = candidates.filter((c) => c.status === 'Applied').length;

    const scores = candidates.map((c) => getMatchFor(c)?.overallScore ?? c.matchScore);
    const avgScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;

    return {
      total,
      activeJobsCount: activeJobs.length,
      urgentJobs,
      shortlisted,
      interviews,
      offers,
      rejected,
      applied,
      avgScore,
    };
  }, [candidates, jobs, getMatchFor]);

  // Chart 1: Application Trends over appliedAt dates
  const trendData = useMemo(() => {
    const countsByDay = new Map<string, number>();
    candidates.forEach((c) => {
      const day = (c.appliedAt || '2026-11-15').slice(5, 10);
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
    });
    return Array.from(countsByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, applications: count }));
  }, [candidates]);

  // Chart 2 & 3: Pipeline Stage Distribution
  const stageData = useMemo(
    () => [
      { stage: 'Applied', count: metrics.applied },
      { stage: 'Shortlisted', count: metrics.shortlisted },
      { stage: 'Interview', count: metrics.interviews },
      { stage: 'Offer', count: metrics.offers },
      { stage: 'Rejected', count: metrics.rejected },
    ],
    [metrics]
  );

  // Chart 4: Job-wise Applications
  const jobDistData = useMemo(() => {
    return jobs.map((job) => ({
      name: job.title.length > 16 ? `${job.title.slice(0, 15)}…` : job.title,
      applicants: candidates.filter((c) => c.targetJobId === job.id).length,
    }));
  }, [jobs, candidates]);

  // Chart 5: Top In-Demand Skills across candidates & jobs
  const skillsDistData = useMemo(() => {
    const freq = new Map<string, number>();
    jobs.forEach((j) =>
      [...j.requiredSkills, ...j.preferredSkills].forEach((s) =>
        freq.set(s, (freq.get(s) ?? 0) + 2)
      )
    );
    candidates.forEach((c) =>
      c.skills.forEach((s) => freq.set(s, (freq.get(s) ?? 0) + 1))
    );
    const maxVal = Math.max(1, ...Array.from(freq.values()));
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill, count]) => ({
        skill,
        count,
        pct: Math.round((count / maxVal) * 100),
      }));
  }, [candidates, jobs]);

  // Match Category Distribution
  const matchDistData = useMemo(() => {
    const buckets = [
      { label: '90-100', count: 0 },
      { label: '80-89', count: 0 },
      { label: '70-79', count: 0 },
      { label: '60-69', count: 0 },
      { label: '<60', count: 0 },
    ];
    candidates.forEach((c) => {
      const s = getMatchFor(c)?.overallScore ?? c.matchScore;
      if (s >= 90) buckets[0].count += 1;
      else if (s >= 80) buckets[1].count += 1;
      else if (s >= 70) buckets[2].count += 1;
      else if (s >= 60) buckets[3].count += 1;
      else buckets[4].count += 1;
    });
    return buckets;
  }, [candidates, getMatchFor]);

  const topMatching = useMemo(() => {
    return [...candidates]
      .filter((c) => c.status !== 'Rejected')
      .map((c) => ({
        cand: c,
        score: getMatchFor(c)?.overallScore ?? c.matchScore,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [candidates, getMatchFor]);

  const navigateWithStage = (stage: string) => {
    setStageFilterPreset(stage);
    onNavigate('candidates');
  };

  const highFitCount = candidates.filter(
    (c) => (getMatchFor(c)?.overallScore ?? c.matchScore) >= 85
  ).length;

  return (
    <div className="flex flex-col w-full">
      {/* Top Level Header and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg mb-space-xl">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="font-mono-code text-mono-code text-tertiary uppercase tracking-wider">
              Recruiter Workspace
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-headline-xl text-white tracking-tight">
            Good Morning, <span className="gradient-hero-text">Recruiter</span>
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8] mt-0.5">
            Live overview of candidate screening, job openings, and hiring progress.
          </p>
        </div>

        <div className="flex items-center gap-space-md flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="flex items-center gap-space-xs px-4 py-2 bg-[#151E32] hover:bg-[#1B2740] border border-[#263449] text-white rounded-xl font-label-md text-label-md transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">upload_file</span>
            <span>Upload Resumes</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('job-management')}
            className="flex items-center gap-space-xs px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white rounded-xl font-label-md text-label-md font-semibold transition-all shadow-lg shadow-indigo-600/25 border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Job</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner when session is cleared */}
      {candidates.length === 0 && (
        <div className="rounded-2xl glass-card p-8 mb-space-xl text-center space-y-4 border border-[#8B5CF6]/40">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[30px]">folder_open</span>
          </div>
          <h2 className="font-headline-md text-on-surface font-semibold">
            No candidates in current workspace session
          </h2>
          <p className="font-body-sm text-on-surface-variant max-w-lg mx-auto">
            Upload PDF or DOCX resumes to parse profiles with HireSwift AI, or load the sample recruitment dataset to explore filtering, matching, and pipeline workflows.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              onClick={() => onNavigate('resume-upload')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white text-xs font-semibold cursor-pointer"
            >
              Upload Resumes
            </button>
            <button
              type="button"
              onClick={importDemoDataset}
              className="px-4 py-2.5 rounded-xl bg-[#151E32] border border-[#263449] text-white text-xs font-semibold hover:bg-[#1B2740] cursor-pointer"
            >
              Import Demo Dataset (30 Candidates, 6 Jobs)
            </button>
          </div>
        </div>
      )}

      {/* Hero Spotlight / AI Engine Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-space-lg mb-space-xl shadow-xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg relative z-10">
          <div className="flex items-center gap-space-lg">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#0B1020] shrink-0 flex items-center justify-center border border-[#263449]">
              <img
                alt="AI Engine Visualization"
                className="w-full h-full object-cover"
                src="/screen_630d9ae4.png"
              />
              <div className="absolute inset-0 bg-primary-container/15 mix-blend-overlay" />
            </div>
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-code text-label-sm">
                  AI MATCHING
                </span>
                <span className="font-label-sm text-label-sm text-tertiary">
                  Smart Candidate Screening
                </span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {metrics.total} candidates evaluated across {jobs.length} jobs · {metrics.avgScore}% avg alignment
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {highFitCount} strong-fit applicants scored ≥ 85% for {selectedJob?.title || 'active roles'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-md shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => onNavigate('ai-matching')}
              className="px-3.5 py-2 bg-[#1B2740] hover:bg-[#263449] border border-[#263449] text-white rounded-xl font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Explore AI Matching</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Interactive Dynamic Statistics Cards (4x2 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl tabular-nums">
        <button
          type="button"
          onClick={() => navigateWithStage('All Stages')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">{metrics.total}</span>
            <span className="font-mono-code text-label-sm text-tertiary">Active Session</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full w-[78%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('job-management')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Job Openings
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">work</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">{jobs.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-code text-label-sm">
              {metrics.activeJobsCount} active · {metrics.urgentJobs} urgent
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary-container h-full w-[65%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigateWithStage('Applied')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Applications Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">{metrics.total}</span>
            <span className="font-mono-code text-label-sm text-tertiary">
              {metrics.applied} new
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full w-[85%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigateWithStage('Shortlisted')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Shortlisted Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-fixed">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {metrics.shortlisted}
            </span>
            <span className="font-mono-code text-label-sm text-on-surface-variant">
              {metrics.total ? Math.round((metrics.shortlisted / metrics.total) * 100) : 0}% rate
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary-fixed h-full"
              style={{
                width: `${metrics.total ? Math.round((metrics.shortlisted / metrics.total) * 100) : 0}%`,
              }}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigateWithStage('Interview')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Interview Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary-fixed-dim">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {metrics.interviews}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono-code text-label-sm">
              In Progress
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary h-full w-[55%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigateWithStage('Offer')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Offers Released
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {metrics.offers}
            </span>
            <span className="font-mono-code text-label-sm text-tertiary">Finalists</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary-container h-full w-[66%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigateWithStage('Rejected')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Rejected Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {metrics.rejected}
            </span>
            <span className="font-mono-code text-label-sm text-on-surface-variant">Retained in archive</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-error h-full w-[30%]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('candidate-ranking')}
          className="text-left p-5 rounded-2xl glass-card hover:border-[#4F46E5]/60 transition-all shadow-sm flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Average Match Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between w-full">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {metrics.avgScore}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-mono-code text-label-sm">
              Weighted
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full" style={{ width: `${metrics.avgScore}%` }} />
          </div>
        </button>
      </div>

      {/* Charts Section (Recharts, driven strictly by live data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-xl">
        {/* Chart 1: Application Trends (Recharts AreaChart) */}
        <div className="p-space-lg rounded-2xl glass-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Application Trends
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Candidate applications grouped by intake date
              </p>
            </div>
            <span className="font-mono-code text-label-sm bg-surface-container px-2.5 py-1 rounded-lg text-tertiary">
              {candidates.length} Total
            </span>
          </div>
          <div className="w-full h-56">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-outline">
                No application timeline data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Hiring Funnel & Stage Distribution */}
        <div className="p-space-lg rounded-2xl glass-card shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Recruitment Pipeline Funnel
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Live candidate distribution across all 5 hiring stages
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('hiring-pipeline')}
              className="font-mono-code text-label-sm text-tertiary hover:underline cursor-pointer"
            >
              Open Kanban →
            </button>
          </div>
          <div className="w-full h-56">
            {candidates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-outline">
                No pipeline candidates yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} layout="vertical" margin={{ left: 12, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="stage" type="category" stroke="#F8FAFC" fontSize={11} width={75} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {stageData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Stage Donut + Match Distribution */}
        <div className="p-space-lg rounded-2xl glass-card shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Stage &amp; Score Distribution
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Proportion by hiring status &amp; score tier
              </p>
            </div>
            <span className="font-mono-code text-label-sm text-on-surface-variant">
              {metrics.total} Candidates
            </span>
          </div>
          {candidates.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-outline">
              No candidate records to visualize.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData.filter((s) => s.count > 0)}
                      dataKey="count"
                      nameKey="stage"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {stageData
                        .filter((s) => s.count > 0)
                        .map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={TooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchDistData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={TooltipStyle} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Chart 4: Job-wise Applications + Top Skills */}
        <div className="p-space-lg rounded-2xl glass-card shadow-sm flex flex-col justify-between tabular-nums">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Job-wise Applications &amp; Top Skills
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Applicant volume per opening and highest-frequency skills
              </p>
            </div>
            <span className="font-mono-code text-label-sm text-tertiary">Live Index</span>
          </div>
          {jobs.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-outline">
              Create a job opening to inspect applicant distribution.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobDistData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#263449" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} hide />
                    <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={TooltipStyle} />
                    <Bar dataKey="applicants" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5">
                {skillsDistData.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex justify-between font-label-sm text-xs text-on-surface mb-1">
                      <span>{skill.skill}</span>
                      <span className="font-mono-code text-tertiary">{skill.count} mentions</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] h-full rounded-full"
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Top Matching Candidates + Recent Job Openings & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">
        {/* Left Column: Top Matching Candidates */}
        <div className="xl:col-span-2 p-space-lg rounded-2xl glass-card shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Top Matching Candidates
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Highest-scoring active profiles ranked by weighted suitability
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

            {topMatching.length === 0 ? (
              <div className="py-10 text-center text-xs text-outline">
                No active candidates available to rank.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left tabular-nums">
                  <thead>
                    <tr className="bg-surface-container-lowest/50 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-2.5 px-3 rounded-l-lg">Candidate</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Match Score</th>
                      <th className="py-2.5 px-3">Experience</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {topMatching.map(({ cand, score }) => (
                      <tr key={cand.id} className="hover:bg-surface-container/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full font-headline-sm text-label-md flex items-center justify-center shrink-0 ${cand.avatarTone}`}
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
                        <td className="py-3 px-3 text-xs text-on-surface">{cand.role}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-code text-label-sm font-semibold">
                            {score}% Match
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono-code text-xs text-on-surface-variant">
                          {cand.experience}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-xs">
                            {cand.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(cand)}
                            className="px-3 py-1 bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Job Openings Mini Strip */}
          {jobs.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#263449]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-label-sm text-outline uppercase tracking-wider">
                  Recent Job Openings
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('job-management')}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Manage All Jobs
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {jobs.slice(0, 3).map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      onNavigate('job-details');
                    }}
                    className="text-left p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-[#263449] transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-on-surface truncate">{job.title}</p>
                    <p className="text-[11px] text-outline truncate mt-0.5">
                      {candidates.filter((c) => c.targetJobId === job.id).length} applicants · {job.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Hiring Activity Timeline */}
        <div className="p-space-lg rounded-2xl glass-card shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Recent Activity
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Updates as candidates are uploaded, edited, or moved
                  </p>
                </div>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="py-10 text-center text-xs text-outline">
                No recent recruitment activity recorded in this session.
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-4 ring-surface-container-low">
                      <span className="material-symbols-outlined text-[12px]">
                        {act.type === 'upload'
                          ? 'upload'
                          : act.type === 'shortlist'
                            ? 'auto_awesome'
                            : act.type === 'interview'
                              ? 'calendar_today'
                              : act.type === 'job'
                                ? 'work'
                                : 'bolt'}
                      </span>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                        {act.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-label-sm text-[11px] text-on-surface-variant">
                          {act.time}
                        </span>
                        <span className="text-outline">•</span>
                        <span className="font-label-sm text-[11px] text-tertiary">
                          {act.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onNavigate('candidates')}
              className="text-tertiary font-label-md text-label-md hover:underline cursor-pointer"
            >
              View All Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
