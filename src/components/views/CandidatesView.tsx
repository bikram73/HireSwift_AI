import React, { useEffect, useMemo, useState } from 'react';
import { useAts } from '../../context/AtsContext';
import { CandidateProfile, HiringStage, MatchCategory, WorkspaceRoute } from '../../data/atsData';
import { exportObjectToJson, exportRowsToCsv, normalizeSkillName } from '../../utils/atsEngine';
import { CUSTOM_JOB_OPTION_VALUE, CustomTargetJobModal } from '../CustomTargetJobModal';

interface CandidatesViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const {
    candidates,
    jobs,
    selectedJobId,
    setSelectedJobId,
    getMatchFor,
    moveCandidateStage,
    bulkUpdateStage,
    deleteCandidate,
    deleteSelectedCandidates,
    deleteAllCandidates,
    mergeDuplicateCandidate,
    updateCandidate,
    toggleCompareCandidate,
    compareIds,
    stageFilterPreset,
    setStageFilterPreset,
    showToast,
  } = useAts();

  const [searchQuery, setSearchQuery] = useState('');
  const [matchJobId, setMatchJobId] = useState<string>('target');
  const [customJobModalOpen, setCustomJobModalOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('All Stages');
  const [matchCatFilter, setMatchCatFilter] = useState<string>('All Categories');
  const [expFilter, setExpFilter] = useState<string>('All Experience');
  const [minExp, setMinExp] = useState<string>('');
  const [maxExp, setMaxExp] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  // Academic Filters
  const [minCgpa, setMinCgpa] = useState<string>('');
  const [maxCgpa, setMaxCgpa] = useState<string>('');
  const [minTenth, setMinTenth] = useState<string>('');
  const [maxTenth, setMaxTenth] = useState<string>('');
  const [minTwelfth, setMinTwelfth] = useState<string>('');
  const [maxTwelfth, setMaxTwelfth] = useState<string>('');
  const [gradYearFilter, setGradYearFilter] = useState<string>('');
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [branchQuery, setBranchQuery] = useState<string>('');
  const [collegeQuery, setCollegeQuery] = useState<string>('');

  // Professional & Skills Filters
  const [techStack, setTechStack] = useState<string[]>([]);
  const [skillLogic, setSkillLogic] = useState<'AND' | 'OR'>('AND');
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [hasInternshipOnly, setHasInternshipOnly] = useState(false);
  const [hasCertsOnly, setHasCertsOnly] = useState(false);
  const [hasProjectsOnly, setHasProjectsOnly] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState<string>('');
  const [maxScoreFilter, setMaxScoreFilter] = useState<string>('');

  // Sorting & Pagination & Selection
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'cgpa' | 'gradYear' | 'recent' | 'name'>('score');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(true);
  const [duplicateReviewCand, setDuplicateReviewCand] = useState<CandidateProfile | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<
    | { kind: 'single'; candidate: CandidateProfile }
    | { kind: 'selected'; ids: string[] }
    | { kind: 'all' }
    | { kind: 'duplicate-delete'; candidate: CandidateProfile }
    | { kind: 'duplicate-merge'; candidate: CandidateProfile; targetId: string }
    | null
  >(null);

  useEffect(() => {
    if (stageFilterPreset) {
      setStageFilter(stageFilterPreset);
      setStageFilterPreset(null);
      setPage(1);
    }
  }, [stageFilterPreset, setStageFilterPreset]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (stageFilter !== 'All Stages') count++;
    if (matchCatFilter !== 'All Categories') count++;
    if (expFilter !== 'All Experience') count++;
    if (minExp || maxExp) count++;
    if (locationQuery.trim() || remoteOnly) count++;
    if (minCgpa || maxCgpa) count++;
    if (minTenth || maxTenth) count++;
    if (minTwelfth || maxTwelfth) count++;
    if (gradYearFilter) count++;
    if (selectedDegrees.length > 0) count++;
    if (branchQuery.trim() || collegeQuery.trim()) count++;
    if (techStack.length > 0) count++;
    if (hasInternshipOnly || hasCertsOnly || hasProjectsOnly) count++;
    if (minScoreFilter || maxScoreFilter) count++;
    return count;
  }, [
    searchQuery,
    stageFilter,
    matchCatFilter,
    expFilter,
    minExp,
    maxExp,
    locationQuery,
    remoteOnly,
    minCgpa,
    maxCgpa,
    minTenth,
    maxTenth,
    minTwelfth,
    maxTwelfth,
    gradYearFilter,
    selectedDegrees,
    branchQuery,
    collegeQuery,
    techStack,
    hasInternshipOnly,
    hasCertsOnly,
    hasProjectsOnly,
    minScoreFilter,
    maxScoreFilter,
  ]);

  const toggleDegree = (deg: string) => {
    setPage(1);
    setSelectedDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStageFilter('All Stages');
    setMatchCatFilter('All Categories');
    setExpFilter('All Experience');
    setMinExp('');
    setMaxExp('');
    setLocationQuery('');
    setRemoteOnly(false);
    setMinCgpa('');
    setMaxCgpa('');
    setMinTenth('');
    setMaxTenth('');
    setMinTwelfth('');
    setMaxTwelfth('');
    setGradYearFilter('');
    setSelectedDegrees([]);
    setBranchQuery('');
    setCollegeQuery('');
    setTechStack([]);
    setHasInternshipOnly(false);
    setHasCertsOnly(false);
    setHasProjectsOnly(false);
    setMinScoreFilter('');
    setMaxScoreFilter('');
    setPage(1);
    showToast('Cleared all active filters', 'info');
  };

  const enrichedCandidates = useMemo(() => {
    return candidates.map((cand) => {
      const targetJobId = matchJobId === 'target' ? cand.targetJobId : matchJobId;
      const match = getMatchFor(cand, targetJobId);
      return {
        cand,
        score: match?.overallScore ?? cand.matchScore,
        category: match?.category ?? ('Good Match' as MatchCategory),
      };
    });
  }, [candidates, matchJobId, getMatchFor]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const locQ = locationQuery.trim().toLowerCase();
    const brQ = branchQuery.trim().toLowerCase();
    const colQ = collegeQuery.trim().toLowerCase();

    const filtered = enrichedCandidates.filter(({ cand, score, category }) => {
      if (q) {
        const hay = `${cand.name} ${cand.email} ${cand.role} ${cand.educationDetail.college} ${cand.educationDetail.branch} ${cand.skills.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (stageFilter !== 'All Stages' && cand.status !== stageFilter) return false;
      if (matchCatFilter !== 'All Categories' && category !== matchCatFilter) return false;

      if (expFilter === 'Fresher (0 yrs)' && cand.experienceYears > 0.5) return false;
      if (expFilter === '0 - 2 years' && cand.experienceYears > 2) return false;
      if (expFilter === '2 - 5 years' && (cand.experienceYears < 2 || cand.experienceYears > 5))
        return false;
      if (expFilter === '5+ years' && cand.experienceYears < 5) return false;

      if (minExp && cand.experienceYears < parseFloat(minExp)) return false;
      if (maxExp && cand.experienceYears > parseFloat(maxExp)) return false;

      if (locQ && !cand.location.toLowerCase().includes(locQ)) return false;
      if (remoteOnly && !cand.remoteAvailable) return false;

      // Missing Academic Info rule: exclude null when academic filter is active!
      if (minCgpa) {
        if (cand.educationDetail.cgpa === null || cand.educationDetail.cgpa < parseFloat(minCgpa))
          return false;
      }
      if (maxCgpa) {
        if (cand.educationDetail.cgpa === null || cand.educationDetail.cgpa > parseFloat(maxCgpa))
          return false;
      }
      if (minTenth) {
        if (
          cand.educationDetail.tenthPercentage === null ||
          cand.educationDetail.tenthPercentage < parseFloat(minTenth)
        )
          return false;
      }
      if (maxTenth) {
        if (
          cand.educationDetail.tenthPercentage === null ||
          cand.educationDetail.tenthPercentage > parseFloat(maxTenth)
        )
          return false;
      }
      if (minTwelfth) {
        if (
          cand.educationDetail.twelfthPercentage === null ||
          cand.educationDetail.twelfthPercentage < parseFloat(minTwelfth)
        )
          return false;
      }
      if (maxTwelfth) {
        if (
          cand.educationDetail.twelfthPercentage === null ||
          cand.educationDetail.twelfthPercentage > parseFloat(maxTwelfth)
        )
          return false;
      }
      if (gradYearFilter) {
        if (
          cand.educationDetail.graduationYear === null ||
          cand.educationDetail.graduationYear !== parseInt(gradYearFilter, 10)
        )
          return false;
      }

      if (selectedDegrees.length > 0) {
        const degLower = cand.educationDetail.degree.toLowerCase();
        const matchesDeg = selectedDegrees.some((d) => degLower.includes(d.toLowerCase()));
        if (!matchesDeg) return false;
      }

      if (brQ && !cand.educationDetail.branch.toLowerCase().includes(brQ)) return false;
      if (colQ && !cand.educationDetail.college.toLowerCase().includes(colQ)) return false;

      if (techStack.length > 0) {
        const candSkillsNorm = new Set(cand.skills.map(normalizeSkillName));
        if (skillLogic === 'AND') {
          if (!techStack.every((req) => candSkillsNorm.has(normalizeSkillName(req)))) return false;
        } else {
          if (!techStack.some((req) => candSkillsNorm.has(normalizeSkillName(req)))) return false;
        }
      }

      if (hasInternshipOnly && cand.internships.length === 0) return false;
      if (hasCertsOnly && cand.certifications.length === 0) return false;
      if (hasProjectsOnly && cand.projects.length === 0) return false;

      if (minScoreFilter && score < parseFloat(minScoreFilter)) return false;
      if (maxScoreFilter && score > parseFloat(maxScoreFilter)) return false;

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'experience') return b.cand.experienceYears - a.cand.experienceYears;
      if (sortBy === 'cgpa')
        return (b.cand.educationDetail.cgpa ?? -1) - (a.cand.educationDetail.cgpa ?? -1);
      if (sortBy === 'gradYear')
        return (b.cand.educationDetail.graduationYear ?? 0) - (a.cand.educationDetail.graduationYear ?? 0);
      if (sortBy === 'name') return a.cand.name.localeCompare(b.cand.name);
      return b.cand.appliedAt.localeCompare(a.cand.appliedAt);
    });

    return filtered;
  }, [
    enrichedCandidates,
    searchQuery,
    stageFilter,
    matchCatFilter,
    expFilter,
    minExp,
    maxExp,
    locationQuery,
    remoteOnly,
    minCgpa,
    maxCgpa,
    minTenth,
    maxTenth,
    minTwelfth,
    maxTwelfth,
    gradYearFilter,
    selectedDegrees,
    branchQuery,
    collegeQuery,
    techStack,
    skillLogic,
    hasInternshipOnly,
    hasCertsOnly,
    hasProjectsOnly,
    minScoreFilter,
    maxScoreFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = paginatedRows.map((r) => r.cand.id);
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allChecked) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      `hireswift_candidates_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Name',
        'Email',
        'Location',
        'Degree',
        'Branch',
        'College',
        'CGPA',
        '10th/12th',
        'Grad Year',
        'Experience (Yrs)',
        'Skills',
        'Match Score (%)',
        'Stage',
        'Duplicate Status',
      ],
      filteredCandidates.map(({ cand, score }) => [
        cand.name,
        cand.email,
        cand.location,
        cand.educationDetail.degree,
        cand.educationDetail.branch,
        cand.educationDetail.college,
        cand.educationDetail.cgpa ?? 'Not Listed',
        cand.tenthTwelfth,
        cand.educationDetail.graduationYear ?? 'N/A',
        cand.experienceYears,
        cand.skills.join('; '),
        score,
        cand.status,
        cand.duplicateStatus,
      ])
    );
    showToast(`Exported ${filteredCandidates.length} candidate(s) to CSV`);
  };

  const avgScore =
    filteredCandidates.length > 0
      ? Math.round(
          (filteredCandidates.reduce((acc, r) => acc + r.score, 0) / filteredCandidates.length) * 10
        ) / 10
      : 0;
  const duplicateAlerts = candidates.filter((c) => c.duplicateStatus !== 'Unique').length;

  return (
    <div className="flex flex-col w-full">
      {/* Top Command Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-mono-code text-[11px] tracking-wide">
              CANDIDATE DIRECTORY
            </span>
            {duplicateAlerts > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono-code text-[11px]">
                {duplicateAlerts} Duplicate Review(s)
              </span>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-headline-xl text-white tracking-tight">
            Candidates
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Search, filter by academic &amp; technical criteria, resolve duplicates, and manage hiring stages.
          </p>
        </div>

        <div className="flex items-center gap-space-md flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-[#151E32] border border-[#263449] text-white font-label-md text-label-md hover:bg-[#1B2740] transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#94A3B8]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              exportObjectToJson(
                'hireswift_candidates.json',
                filteredCandidates.map((f) => f.cand)
              );
              showToast(`Exported ${filteredCandidates.length} profiles as JSON`);
            }}
            className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-[#151E32] border border-[#263449] text-white font-label-md text-label-md hover:bg-[#1B2740] transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#94A3B8]">code</span>
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setDeletePrompt({ kind: 'all' })}
            disabled={candidates.length === 0}
            className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-label-md text-label-md hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
              delete_sweep
            </span>
            <span>Delete All Candidates</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('resume-upload')}
            className="flex items-center gap-space-xs px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-label-md text-label-md font-semibold hover:opacity-95 shadow-lg shadow-indigo-600/25 border border-white/15 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* Live Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-xl tabular-nums">
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Total Candidates</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg font-bold text-on-surface">{candidates.length}</span>
            <span className="font-mono-code text-xs text-tertiary">
              {filteredCandidates.length} matching filters
            </span>
          </div>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Shortlisted</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg font-bold text-on-surface">
              {candidates.filter((c) => c.status === 'Shortlisted').length}
            </span>
            <span className="font-mono-code text-xs text-secondary">
              {candidates.filter((c) => c.status === 'Interview').length} in Interview
            </span>
          </div>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Duplicate Alerts</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg font-bold text-amber-400">{duplicateAlerts}</span>
            <span className="font-mono-code text-xs text-outline">Flagged for review</span>
          </div>
        </div>
        <div className="rounded-2xl glass-card p-5">
          <span className="font-label-sm text-outline uppercase">Filtered Avg Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg font-bold text-emerald-400">{avgScore}%</span>
            <span className="font-mono-code text-xs text-primary">Weighted Rubric</span>
          </div>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="flex flex-col xl:flex-row gap-space-xl items-start">
        {/* Left Main Content (Table + Top Toolbar) */}
        <div className="flex-1 w-full flex flex-col gap-space-md min-w-0">
          {/* Quick Toolbar */}
          <div className="p-4 rounded-2xl glass-card shadow-sm flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-2.5">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, college, skills, or role..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-highest text-on-surface text-xs outline-none border border-[#263449]"
                />
              </div>

              <select
                value={matchJobId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === CUSTOM_JOB_OPTION_VALUE) {
                    setCustomJobModalOpen(true);
                    return;
                  }
                  setMatchJobId(val);
                  if (val !== 'target') setSelectedJobId(val);
                }}
                className="h-10 px-3 rounded-xl bg-surface-container-highest text-on-surface text-xs outline-none border border-[#263449]"
              >
                <option value="target">Match vs Candidate Target Job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    Score vs: {j.title}
                  </option>
                ))}
                <option value={CUSTOM_JOB_OPTION_VALUE}>+ Add Custom Target Job Role...</option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 rounded-xl bg-surface-container-highest text-on-surface text-xs outline-none border border-[#263449]"
              >
                <option value="All Stages">All Stages</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-10 px-3 rounded-xl bg-surface-container-highest text-on-surface text-xs outline-none border border-[#263449]"
              >
                <option value="score">Sort: Match Score</option>
                <option value="name">Sort: Name (A–Z)</option>
                <option value="experience">Sort: Experience</option>
                <option value="cgpa">Sort: CGPA</option>
                <option value="gradYear">Sort: Graduation Year</option>
                <option value="recent">Sort: Application Date</option>
              </select>

              <button
                type="button"
                onClick={() => setDrawerVisible((v) => !v)}
                className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-primary-container/25 border border-primary/40 text-primary text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="pt-2 border-t border-[#263449] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-primary">
                  {selectedIds.length} candidate(s) selected
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStage(selectedIds, 'Shortlisted');
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer"
                  >
                    Bulk Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStage(selectedIds, 'Interview');
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold cursor-pointer"
                  >
                    Move to Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      bulkUpdateStage(selectedIds, 'Rejected');
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('email-center')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs cursor-pointer"
                  >
                    Prepare Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletePrompt({ kind: 'selected', ids: [...selectedIds] })}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/25 border border-rose-500/30 text-rose-300 hover:bg-rose-600/35 text-xs font-semibold cursor-pointer"
                  >
                    Delete Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-2 py-1 text-xs text-outline hover:text-white cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Table */}
          <div className="rounded-2xl glass-card shadow-sm overflow-hidden">
            {filteredCandidates.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  No candidates match your active criteria
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {activeFilterCount > 0
                    ? 'Note: Candidates with unavailable CGPA/10th/12th values are excluded when academic cutoffs are active.'
                    : 'Upload resumes or import the sample dataset to populate candidates.'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm tabular-nums">
                  <thead>
                    <tr className="bg-surface-container-lowest/60 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={
                            paginatedRows.length > 0 &&
                            paginatedRows.every((r) => selectedIds.includes(r.cand.id))
                          }
                          onChange={toggleAllVisible}
                          className="w-4 h-4 accent-[#8B5CF6]"
                        />
                      </th>
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Qualification &amp; Academics</th>
                      <th className="py-3 px-3">Experience</th>
                      <th className="py-3 px-3">Primary Skills</th>
                      <th className="py-3 px-3">Match Score</th>
                      <th className="py-3 px-3">Stage</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263449]/60">
                    {paginatedRows.map(({ cand, score, category }) => {
                      const isCompared = compareIds.includes(cand.id);
                      return (
                        <tr
                          key={cand.id}
                          onClick={() => onSelectCandidate(cand)}
                          className="hover:bg-surface-container/50 transition-colors cursor-pointer"
                        >
                          <td
                            className="py-3.5 px-4"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(cand.id)}
                              onChange={() => toggleSelect(cand.id)}
                              className="w-4 h-4 accent-[#8B5CF6]"
                            />
                          </td>
                          <td className="py-3.5 px-3 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${cand.avatarTone}`}
                              >
                                {cand.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-on-surface truncate">
                                    {cand.name}
                                  </span>
                                  {cand.duplicateStatus !== 'Unique' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDuplicateReviewCand(cand);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-code text-[10px] hover:bg-amber-500/30 cursor-pointer"
                                    >
                                      {cand.duplicateStatus}
                                    </button>
                                  )}
                                </div>
                                <div className="text-[11px] text-outline truncate">
                                  {cand.email} · {cand.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-xs">
                            <div className="text-on-surface font-medium">{cand.education}</div>
                            <div className="font-mono-code text-[11px] text-tertiary">
                              {cand.cgpa} · Class of {cand.educationDetail.graduationYear ?? 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono-code text-xs text-on-surface-variant whitespace-nowrap">
                            {cand.experience}
                          </td>
                          <td className="py-3.5 px-3 max-w-[210px]">
                            <div className="flex flex-wrap gap-1">
                              {cand.skills.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px] text-on-surface-variant"
                                >
                                  {s}
                                </span>
                              ))}
                              {cand.skills.length > 3 && (
                                <span className="text-[10px] font-mono-code text-outline">
                                  +{cand.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span
                                className={`font-mono-code text-xs font-bold ${
                                  score >= 85
                                    ? 'text-emerald-400'
                                    : score >= 70
                                      ? 'text-blue-400'
                                      : 'text-amber-400'
                                }`}
                              >
                                {score}%
                              </span>
                              <span className="text-[10px] text-outline">{category}</span>
                            </div>
                          </td>
                          <td
                            className="py-3.5 px-3 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={cand.status}
                              onChange={(e) =>
                                moveCandidateStage(cand.id, e.target.value as HiringStage)
                              }
                              className="h-7 px-2 rounded-lg bg-surface-container-high border border-[#263449] text-[11px] text-on-surface outline-none cursor-pointer"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td
                            className="py-3.5 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleCompareCandidate(cand.id)}
                                title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isCompared
                                    ? 'bg-[#8B5CF6]/25 text-[#c3c0ff]'
                                    : 'text-outline hover:text-white hover:bg-surface-container-high'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  compare_arrows
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectCandidate(cand)}
                                title="View Profile"
                                className="p-1.5 rounded-lg text-outline hover:text-white hover:bg-surface-container-high cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  visibility
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletePrompt({ kind: 'single', candidate: cand })}
                                title={`Delete ${cand.name}`}
                                aria-label={`Delete ${cand.name}`}
                                className="p-1.5 rounded-lg text-outline hover:text-rose-400 hover:bg-surface-container-high cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredCandidates.length > 0 && (
              <div className="px-4 py-3 border-t border-[#263449] bg-surface-container-low/40 flex items-center justify-between flex-wrap gap-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, filteredCandidates.length)} of{' '}
                    {filteredCandidates.length} candidates
                  </span>
                  <select
                    aria-label="Rows per page"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="h-7 px-2 rounded-lg bg-surface-container-high border border-[#263449] text-xs text-on-surface outline-none cursor-pointer"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-lg font-mono-code cursor-pointer ${
                        pNum === currentPage
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-bold'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Advanced Filtering Drawer */}
        {drawerVisible && (
          <aside className="w-full xl:w-[340px] shrink-0 rounded-2xl glass-card p-5 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#263449]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#8B5CF6]">
                  filter_alt
                </span>
                <h3 className="font-headline-sm font-semibold text-on-surface">
                  Precision Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-code text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-primary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Academic Filters */}
            <div className="space-y-2.5">
              <span className="font-label-sm text-outline uppercase tracking-wider block">
                Academic Criteria
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Min CGPA"
                  value={minCgpa}
                  onChange={(e) => {
                    setMinCgpa(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Max CGPA"
                  value={maxCgpa}
                  onChange={(e) => {
                    setMaxCgpa(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Min 10th %"
                  value={minTenth}
                  onChange={(e) => {
                    setMinTenth(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Max 10th %"
                  value={maxTenth}
                  onChange={(e) => {
                    setMaxTenth(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Min 12th %"
                  value={minTwelfth}
                  onChange={(e) => {
                    setMinTwelfth(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Max 12th %"
                  value={maxTwelfth}
                  onChange={(e) => {
                    setMaxTwelfth(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Grad Year (2025)"
                  value={gradYearFilter}
                  onChange={(e) => {
                    setGradYearFilter(e.target.value);
                    setPage(1);
                  }}
                  className="col-span-2 h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Branch (CS, IT...)"
                  value={branchQuery}
                  onChange={(e) => {
                    setBranchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="text"
                  placeholder="College name"
                  value={collegeQuery}
                  onChange={(e) => {
                    setCollegeQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['B.Tech', 'B.E.', 'M.Tech', 'MCA', 'B.Sc'].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => toggleDegree(deg)}
                    className={`px-2 py-1 rounded-md font-mono-code text-[10px] cursor-pointer border ${
                      selectedDegrees.includes(deg)
                        ? 'bg-primary-container text-white border-primary'
                        : 'bg-surface-container-high text-outline border-transparent'
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Skills Multi-select with AND / OR toggle */}
            <div className="space-y-2 pt-3 border-t border-[#263449]">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-outline uppercase tracking-wider">
                  Technical Skills
                </span>
                <button
                  type="button"
                  onClick={() => setSkillLogic((l) => (l === 'AND' ? 'OR' : 'AND'))}
                  className="px-2 py-0.5 rounded bg-surface-container-high font-mono-code text-[10px] text-tertiary cursor-pointer"
                >
                  Match: {skillLogic}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'React', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Java'].map((preset) => {
                  const active = techStack.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setTechStack((prev) =>
                          active ? prev.filter((s) => s !== preset) : [...prev, preset]
                        );
                      }}
                      className={`px-2 py-1 rounded font-mono-code text-[10px] cursor-pointer ${
                        active
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
                {techStack
                  .filter(
                    (s) => !['Python', 'React', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Java'].includes(s)
                  )
                  .map((custom) => (
                    <button
                      key={custom}
                      type="button"
                      onClick={() => setTechStack((prev) => prev.filter((s) => s !== custom))}
                      className="px-2 py-1 rounded bg-[#8B5CF6] text-white font-mono-code text-[10px] cursor-pointer"
                    >
                      {custom} ×
                    </button>
                  ))}
                {addingSkill ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newSkill.trim() && !techStack.includes(newSkill.trim())) {
                        setTechStack((prev) => [...prev, newSkill.trim()]);
                        setPage(1);
                      }
                      setNewSkill('');
                      setAddingSkill(false);
                    }}
                  >
                    <input
                      autoFocus
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Custom skill..."
                      className="w-24 h-6 px-2 rounded bg-surface-container-highest text-on-surface text-[10px] outline-none"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingSkill(true)}
                    className="px-2 py-1 rounded bg-surface-container text-outline hover:text-white font-mono-code text-[10px] cursor-pointer"
                  >
                    + Custom
                  </button>
                )}
              </div>
            </div>

            {/* Experience & Credentials */}
            <div className="space-y-2.5 pt-3 border-t border-[#263449]">
              <span className="font-label-sm text-outline uppercase tracking-wider block">
                Experience &amp; Location
              </span>
              <select
                value={expFilter}
                onChange={(e) => {
                  setExpFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
              >
                <option value="All Experience">All Experience</option>
                <option value="Fresher (0 yrs)">Fresher (0 yrs)</option>
                <option value="0 - 2 years">0 - 2 years</option>
                <option value="2 - 5 years">2 - 5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Min Exp (yrs)"
                  value={minExp}
                  onChange={(e) => {
                    setMinExp(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Max Exp (yrs)"
                  value={maxExp}
                  onChange={(e) => {
                    setMaxExp(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="City / State / Country"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
              />
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-on-surface-variant">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="accent-[#8B5CF6]"
                  />
                  <span>Remote Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInternshipOnly}
                    onChange={(e) => setHasInternshipOnly(e.target.checked)}
                    className="accent-[#8B5CF6]"
                  />
                  <span>Has Internship</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertsOnly}
                    onChange={(e) => setHasCertsOnly(e.target.checked)}
                    className="accent-[#8B5CF6]"
                  />
                  <span>Certified</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasProjectsOnly}
                    onChange={(e) => setHasProjectsOnly(e.target.checked)}
                    className="accent-[#8B5CF6]"
                  />
                  <span>Has Projects</span>
                </label>
              </div>
            </div>

            {/* Matching Score Filters */}
            <div className="space-y-2 pt-3 border-t border-[#263449]">
              <span className="font-label-sm text-outline uppercase tracking-wider block">
                Match Score Filter
              </span>
              <select
                value={matchCatFilter}
                onChange={(e) => {
                  setMatchCatFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
              >
                <option value="All Categories">All Match Categories</option>
                <option value="Excellent Match">Excellent Match (90–100)</option>
                <option value="Strong Match">Strong Match (80–89)</option>
                <option value="Good Match">Good Match (70–79)</option>
                <option value="Moderate Match">Moderate Match (60–69)</option>
                <option value="Low Match">Low Match (40–59)</option>
                <option value="Poor Match">Poor Match (0–39)</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Score %"
                  value={minScoreFilter}
                  onChange={(e) => {
                    setMinScoreFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Score %"
                  value={maxScoreFilter}
                  onChange={(e) => {
                    setMaxScoreFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-on-surface outline-none"
                />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Duplicate Review Modal */}
      {duplicateReviewCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setDuplicateReviewCand(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111827] border border-[#263449] shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-white font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">content_copy</span>
                <span>Duplicate Profile Review</span>
              </h3>
              <button
                type="button"
                onClick={() => setDuplicateReviewCand(null)}
                className="text-outline hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              <strong>{duplicateReviewCand.name}</strong> ({duplicateReviewCand.email}) is marked as{' '}
              <span className="text-amber-300 font-semibold">
                {duplicateReviewCand.duplicateStatus}
              </span>
              . Never auto-merged without recruiter review.
            </p>
            {(() => {
              const target = candidates.find((c) => c.id === duplicateReviewCand.duplicateOfId);
              if (!target) return null;
              return (
                <div className="p-3.5 rounded-xl bg-surface-container border border-[#263449] text-xs space-y-1">
                  <div className="text-outline uppercase font-label-sm">Matched Existing Record</div>
                  <div className="text-white font-semibold">{target.name}</div>
                  <div className="text-on-surface-variant">
                    {target.email} · {target.phone || 'No phone'} · {target.resumeFileName}
                  </div>
                </div>
              );
            })()}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  updateCandidate({
                    ...duplicateReviewCand,
                    duplicateStatus: 'Unique',
                    duplicateOfId: undefined,
                  });
                  setDuplicateReviewCand(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs text-white cursor-pointer"
              >
                Keep as Unique
              </button>
              {duplicateReviewCand.duplicateOfId && (
                <button
                  type="button"
                  onClick={() =>
                    setDeletePrompt({
                      kind: 'duplicate-merge',
                      candidate: duplicateReviewCand,
                      targetId: duplicateReviewCand.duplicateOfId!,
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold cursor-pointer"
                >
                  Merge &amp; Remove Duplicate
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setDeletePrompt({
                    kind: 'duplicate-delete',
                    candidate: duplicateReviewCand,
                  })
                }
                className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-permission-title"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setDeletePrompt(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-rose-500/40 shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-rose-400">warning</span>
              </div>
              <div className="space-y-1">
                <h3 id="delete-permission-title" className="font-headline-md text-white font-semibold">
                  {deletePrompt.kind === 'all'
                    ? 'Delete All Candidates from Local Storage?'
                    : deletePrompt.kind === 'selected'
                      ? `Delete ${deletePrompt.ids.length} Selected Candidate(s)?`
                      : deletePrompt.kind === 'duplicate-merge'
                        ? 'Permission to Merge & Delete Duplicate?'
                        : 'Permission to Delete Candidate?'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {deletePrompt.kind === 'all' ? (
                    <>
                      Do you give permission to permanently delete all{' '}
                      <strong className="text-white">{candidates.length}</strong> candidate(s) from
                      browser <code className="text-rose-300">localStorage</code>? Job postings will
                      remain saved, and deleted candidates will not be restored on reload.
                    </>
                  ) : deletePrompt.kind === 'selected' ? (
                    <>
                      Do you give permission to permanently delete{' '}
                      <strong className="text-white">{deletePrompt.ids.length}</strong> selected
                      candidate(s) from browser <code className="text-rose-300">localStorage</code>?
                      This action cannot be undone.
                    </>
                  ) : deletePrompt.kind === 'duplicate-merge' ? (
                    <>
                      Do you give permission to merge profile details from{' '}
                      <strong className="text-white">{deletePrompt.candidate.name}</strong> and
                      permanently delete the duplicate record from browser{' '}
                      <code className="text-rose-300">localStorage</code>?
                    </>
                  ) : (
                    <>
                      Do you give permission to permanently delete{' '}
                      <strong className="text-white">{deletePrompt.candidate.name}</strong> (
                      {deletePrompt.candidate.email}) from browser{' '}
                      <code className="text-rose-300">localStorage</code>? Candidates stay saved in
                      your browser until you delete them.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletePrompt(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-medium text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletePrompt.kind === 'all') {
                    deleteAllCandidates();
                    setSelectedIds([]);
                  } else if (deletePrompt.kind === 'selected') {
                    deleteSelectedCandidates(deletePrompt.ids);
                    setSelectedIds([]);
                  } else if (deletePrompt.kind === 'duplicate-merge') {
                    mergeDuplicateCandidate(deletePrompt.candidate, deletePrompt.targetId);
                    deleteCandidate(deletePrompt.candidate.id);
                    setDuplicateReviewCand(null);
                  } else {
                    deleteCandidate(deletePrompt.candidate.id);
                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== deletePrompt.candidate.id)
                    );
                    if (deletePrompt.kind === 'duplicate-delete') {
                      setDuplicateReviewCand(null);
                    }
                  }
                  setDeletePrompt(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white cursor-pointer"
              >
                {deletePrompt.kind === 'all'
                  ? 'Yes, Delete All Candidates'
                  : deletePrompt.kind === 'selected'
                    ? 'Yes, Delete Selected'
                    : deletePrompt.kind === 'duplicate-merge'
                      ? 'Yes, Merge & Delete'
                      : 'Yes, Delete Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomTargetJobModal
        open={customJobModalOpen}
        onClose={() => setCustomJobModalOpen(false)}
        onCreated={(newJob) => setMatchJobId(newJob.id)}
      />
    </div>
  );
};
