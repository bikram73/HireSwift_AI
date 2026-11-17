import React, { useRef, useState } from 'react';
import { useAts } from '../../context/AtsContext';
import { CandidateProfile, QueuedResumeFile, WorkspaceRoute } from '../../data/atsData';
import { computeMatchResult, detectDuplicates, exportRowsToCsv } from '../../utils/atsEngine';
import { DocumentValidationError, validateAndExtractResume } from '../../utils/fileExtractor';

interface ResumeUploadViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

interface ParsedApiResponse {
  parsed?: {
    personal_information?: {
      full_name?: string | null;
      email?: string | null;
      phone?: string | null;
      location?: string | null;
      linkedin_url?: string | null;
      github_url?: string | null;
      portfolio_url?: string | null;
    };
    education?: {
      tenth_school?: string | null;
      tenth_percentage?: number | null;
      tenth_year?: number | null;
      twelfth_school?: string | null;
      twelfth_percentage?: number | null;
      twelfth_year?: number | null;
      diploma_details?: string | null;
      diploma_score?: string | null;
      degree?: string | null;
      branch?: string | null;
      college?: string | null;
      cgpa?: number | null;
      graduation_year?: number | null;
      postgraduate_details?: string | null;
    };
    experience?: {
      total_years?: number | null;
      current_title?: string | null;
      previous_titles?: string[];
      previous_companies?: string[];
      internships?: Array<{ role: string; company: string; duration: string; description: string }>;
      work_history?: Array<{ role: string; company: string; duration: string; description: string }>;
    };
    skills?: {
      programming_languages?: string[];
      frameworks?: string[];
      libraries?: string[];
      databases?: string[];
      cloud_technologies?: string[];
      developer_tools?: string[];
      ai_ml_technologies?: string[];
      other_skills?: string[];
    };
    projects?: Array<{ name: string; description: string; technologies: string[] }>;
    certifications?: string[];
    achievements?: string[];
    soft_skills?: string[];
    languages_known?: string[];
    resume_summary?: string | null;
    key_strengths?: string[];
    missing_fields?: string[];
    confidence?: {
      name?: number;
      email?: number;
      education?: number;
      skills?: number;
    };
  };
  source?: string;
}

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const {
    candidates,
    jobs,
    selectedJobId,
    maxFileSizeMb,
    scoringWeights,
    addCandidate,
    mergeDuplicateCandidate,
    showToast,
  } = useAts();

  const [files, setFiles] = useState<QueuedResumeFile[]>([]);
  const [targetJobId, setTargetJobId] = useState<string>(selectedJobId || jobs[0]?.id || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchSummary, setBatchSummary] = useState<{
    total: number;
    parsed: number;
    duplicates: number;
    failed: number;
  } | null>(null);
  const [resolveTarget, setResolveTarget] = useState<QueuedResumeFile | null>(null);

  // Keep a mutable pool reference so simultaneous files in the same batch detect intra-batch duplicates
  const runningPoolRef = useRef<CandidateProfile[]>(candidates);
  runningPoolRef.current = candidates;

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: QueuedResumeFile[] = Array.from(fileList).map((f, idx) => {
      const lower = f.name.toLowerCase();
      const ext: QueuedResumeFile['type'] = lower.endsWith('.docx')
        ? 'DOCX'
        : lower.endsWith('.pdf')
          ? 'PDF'
          : 'OTHER';
      const mb = (f.size / (1024 * 1024)).toFixed(2);
      return {
        id: `q-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        docId: `#DOC-${Math.floor(1000 + Math.random() * 8999)}`,
        fileName: f.name,
        hashOrNote: 'Ready in queue',
        type: ext,
        size:
          f.size >= 1024 * 1024
            ? `${mb} MB`
            : `${Math.max(0, Math.round(f.size / 1024))} KB`,
        sizeBytes: f.size,
        uploadProgress: 100,
        parsingStatus: 'waiting',
        fileRef: f,
      };
    });
    setFiles((prev) => [...added, ...prev]);
    setBatchSummary(null);
    showToast(`Added ${added.length} document(s) to queue`);
  };

  const buildCandidateFromParsed = (
    item: QueuedResumeFile,
    extractedText: string,
    sha256Hash: string,
    objectUrl: string,
    data: NonNullable<ParsedApiResponse['parsed']>
  ): CandidateProfile => {
    const pInfo = data.personal_information ?? {};
    const edu = data.education ?? {};
    const exp = data.experience ?? {};
    const sk = data.skills ?? {};

    const fullName =
      pInfo.full_name?.trim() ||
      item.fileName.replace(/\.(pdf|docx)$/i, '').replace(/[_-]+/g, ' ').trim() ||
      'Candidate Profile';
    const parts = fullName.split(/\s+/);
    const initials = ((parts[0]?.[0] ?? 'C') + (parts[1]?.[0] ?? '')).toUpperCase();

    const allSkills = Array.from(
      new Set([
        ...(sk.programming_languages ?? []),
        ...(sk.frameworks ?? []),
        ...(sk.libraries ?? []),
        ...(sk.databases ?? []),
        ...(sk.cloud_technologies ?? []),
        ...(sk.developer_tools ?? []),
        ...(sk.ai_ml_technologies ?? []),
        ...(sk.other_skills ?? []),
      ])
    ).filter(Boolean);

    const totalExp = typeof exp.total_years === 'number' && !Number.isNaN(exp.total_years) ? exp.total_years : 0;
    const cgpaVal = typeof edu.cgpa === 'number' && !Number.isNaN(edu.cgpa) ? edu.cgpa : null;
    const tenthVal =
      typeof edu.tenth_percentage === 'number' && !Number.isNaN(edu.tenth_percentage)
        ? edu.tenth_percentage
        : null;
    const twelfthVal =
      typeof edu.twelfth_percentage === 'number' && !Number.isNaN(edu.twelfth_percentage)
        ? edu.twelfth_percentage
        : null;

    const assignedJob = jobs.find((j) => j.id === targetJobId) ?? jobs[0];
    const id = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const draft: CandidateProfile = {
      id,
      initials,
      name: fullName,
      email: pInfo.email?.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@unavailable.local`,
      phone: pInfo.phone ?? null,
      location: pInfo.location || 'Not Specified',
      remoteAvailable: /remote/i.test(extractedText),
      linkedinUrl: pInfo.linkedin_url ?? null,
      githubUrl: pInfo.github_url ?? null,
      portfolioUrl: pInfo.portfolio_url ?? null,
      educationDetail: {
        tenthSchool: edu.tenth_school ?? null,
        tenthPercentage: tenthVal,
        tenthYear: edu.tenth_year ?? null,
        twelfthSchool: edu.twelfth_school ?? null,
        twelfthPercentage: twelfthVal,
        twelfthYear: edu.twelfth_year ?? null,
        diplomaDetails: edu.diploma_details ?? null,
        diplomaScore: edu.diploma_score ?? null,
        degree: edu.degree || 'Degree Not Listed',
        branch: edu.branch || 'General',
        college: edu.college || 'Institution Not Listed',
        cgpa: cgpaVal,
        cgpaScale: '10.0',
        graduationYear: edu.graduation_year ?? null,
        postgraduateDetails: edu.postgraduate_details ?? null,
      },
      education: `${edu.degree || 'Degree Not Listed'} ${edu.branch ? `(${edu.branch})` : ''}`.trim(),
      cgpa: cgpaVal !== null ? `${cgpaVal.toFixed(1)} CGPA` : 'Not Listed',
      tenthTwelfth:
        tenthVal !== null && twelfthVal !== null
          ? `${tenthVal}% / ${twelfthVal}%`
          : tenthVal !== null
            ? `${tenthVal}% / N/A`
            : 'Not Listed',
      experience: totalExp === 0 ? 'Fresher (0 yrs)' : `${totalExp.toFixed(1)} yrs`,
      experienceYears: totalExp,
      role: exp.current_title || assignedJob?.title || 'Applicant',
      currentTitle: exp.current_title ?? null,
      previousTitles: exp.previous_titles ?? [],
      previousCompanies: exp.previous_companies ?? [],
      workHistory: exp.work_history ?? [],
      internships: exp.internships ?? [],
      skills: allSkills.length > 0 ? allSkills : ['Communication'],
      categorizedSkills: {
        programmingLanguages: sk.programming_languages ?? [],
        frameworks: sk.frameworks ?? [],
        libraries: sk.libraries ?? [],
        databases: sk.databases ?? [],
        cloud: sk.cloud_technologies ?? [],
        tools: sk.developer_tools ?? [],
        aiMl: sk.ai_ml_technologies ?? [],
        other: sk.other_skills ?? [],
      },
      projects: data.projects ?? [],
      certifications: data.certifications ?? [],
      achievements: data.achievements ?? [],
      softSkills: data.soft_skills ?? [],
      languagesKnown: data.languages_known ?? [],
      keyStrengths: data.key_strengths ?? allSkills.slice(0, 3),
      missingFields: data.missing_fields ?? [],
      confidence: {
        name: data.confidence?.name ?? 0.9,
        email: data.confidence?.email ?? (pInfo.email ? 0.95 : 0.2),
        education: data.confidence?.education ?? (cgpaVal !== null ? 0.9 : 0.5),
        skills: data.confidence?.skills ?? (allSkills.length > 0 ? 0.9 : 0.4),
      },
      matchScore: 70,
      matchLabel: '70% Good',
      status: 'Applied', // Always default to Applied per spec
      targetJobId: assignedJob?.id || '',
      avatarTone: 'bg-indigo-500/25 text-indigo-300',
      summary:
        data.resume_summary ||
        `Extracted profile from ${item.fileName}. Stage initialized to Applied.`,
      resumeFileName: item.fileName,
      resumeFileType: item.type === 'DOCX' ? 'DOCX' : 'PDF',
      resumeHash: sha256Hash,
      resumeObjectUrl: objectUrl,
      resumeTextPreview: extractedText,
      processingStatus: (data.missing_fields?.length ?? 0) > 2 ? 'needs-review' : 'parsed',
      duplicateStatus: 'Unique',
      appliedAt: new Date().toISOString(),
      radar: {
        communication: 80,
        problemSolving: 82,
        culturalFit: 79,
        technicalSkills: 84,
        architecture: totalExp > 1 ? 82 : 72,
      },
      highlights: (data.key_strengths ?? allSkills.slice(0, 3)).map((s) => `Extracted strength: ${s}`),
      timeline: [
        {
          time: 'Just now',
          event: 'Resume Parsed via AI Engine',
          detail: `${item.fileName} converted to structured profile`,
        },
      ],
    };

    if (assignedJob) {
      const m = computeMatchResult(draft, assignedJob, scoringWeights);
      draft.matchScore = m.overallScore;
      draft.matchLabel = `${m.overallScore}% ${m.category.replace(' Match', '')}`;
    }

    return draft;
  };

  const processSingleQueueItem = async (
    item: QueuedResumeFile
  ): Promise<'parsed' | 'duplicate' | 'failed'> => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? { ...f, parsingStatus: 'processing', parsingProgress: 35, hashOrNote: 'Validating & reading document...' }
          : f
      )
    );

    try {
      if (!item.fileRef) {
        throw new DocumentValidationError(
          'Missing file reference',
          'File payload is no longer attached.',
          'Re-upload the file from your computer.'
        );
      }

      const payload = await validateAndExtractResume(item.fileRef, maxFileSizeMb);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                parsingProgress: 70,
                hashOrNote: payload.isScannedPdfFallback
                  ? `Scanned PDF detected · Sending to AI OCR...`
                  : `Hash ${payload.sha256Hash.slice(0, 10)}… · Extracting entities...`,
              }
            : f
        )
      );

      const res = await fetch('/api/resumes/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: payload.fileName,
          mimeType: payload.mimeType,
          extractedText: payload.extractedText,
          base64Pdf: payload.base64Pdf,
        }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new DocumentValidationError(
          'AI extraction failed',
          errBody.error || `Parser returned HTTP ${res.status}`,
          'Click Retry or check that the file contains readable resume content.'
        );
      }

      const json = (await res.json()) as ParsedApiResponse;
      if (!json.parsed) {
        throw new Error('Malformed JSON returned by parser.');
      }

      const cand = buildCandidateFromParsed(
        item,
        payload.extractedText || `[Scanned PDF: ${payload.fileName}]`,
        payload.sha256Hash,
        payload.objectUrl,
        json.parsed
      );

      const dupCheck = detectDuplicates(
        {
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          resumeHash: cand.resumeHash,
          college: cand.educationDetail.college,
          skills: cand.skills,
        },
        runningPoolRef.current
      );

      if (dupCheck.status !== 'Unique' && dupCheck.matchedCandidate) {
        cand.duplicateStatus = dupCheck.status;
        cand.duplicateOfId = dupCheck.matchedCandidate.id;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  parsingStatus: 'duplicate',
                  parsingProgress: 100,
                  duplicateMatch: `${dupCheck.matchedCandidate?.name} · ${dupCheck.reason}`,
                  duplicateCandidateId: dupCheck.matchedCandidate?.id,
                  parsedCandidateDraft: cand,
                  hashOrNote: dupCheck.reason || 'Potential duplicate detected',
                }
              : f
          )
        );
        return 'duplicate';
      }

      runningPoolRef.current = [cand, ...runningPoolRef.current];
      addCandidate(cand);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                parsingStatus: 'parsed',
                parsingProgress: 100,
                parsedCandidateDraft: cand,
                hashOrNote: `${cand.name} · ${cand.matchScore}% match (${json.source === 'gemini-ai' ? 'AI Engine' : 'Parser'})`,
              }
            : f
        )
      );
      return 'parsed';
    } catch (err) {
      const isDocErr = err instanceof DocumentValidationError;
      const reason = isDocErr
        ? err.reason
        : err instanceof Error
          ? err.message
          : 'Unexpected error reading document.';
      const action = isDocErr ? err.action : 'Verify the file is valid PDF/DOCX and click Retry.';

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                parsingStatus: 'failed',
                parsingProgress: 0,
                hashOrNote: action,
                errorDetail: reason,
                errorAction: action,
              }
            : f
        )
      );
      return 'failed';
    }
  };

  const handleStartParsing = async () => {
    const queue = files.filter(
      (f) => f.parsingStatus === 'waiting' || f.parsingStatus === 'failed'
    );
    if (queue.length === 0) {
      showToast('Add PDF or DOCX files first to begin parsing.', 'info');
      return;
    }

    setIsProcessing(true);
    let parsed = 0;
    let duplicates = 0;
    let failed = 0;

    // Process with bounded concurrency (2) so errors stay isolated per document
    const concurrency = 2;
    let cursor = 0;

    const worker = async () => {
      while (cursor < queue.length) {
        const nextItem = queue[cursor++];
        const outcome = await processSingleQueueItem(nextItem);
        if (outcome === 'parsed') parsed++;
        else if (outcome === 'duplicate') duplicates++;
        else failed++;
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, () => worker())
    );

    setIsProcessing(false);
    setBatchSummary({ total: queue.length, parsed, duplicates, failed });
    showToast(
      `Batch complete: ${parsed} parsed, ${duplicates} duplicate(s), ${failed} failed`,
      failed > 0 ? 'warning' : 'success'
    );
  };

  const handleRetrySingle = async (item: QueuedResumeFile) => {
    await processSingleQueueItem(item);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearInactive = () => {
    setFiles((prev) =>
      prev.filter((f) => f.parsingStatus === 'processing' || f.parsingStatus === 'waiting')
    );
    showToast('Cleared completed and flagged queue items', 'info');
  };

  const handleExportSummary = () => {
    exportRowsToCsv(
      'hireswift_upload_summary.csv',
      ['File Name', 'Type', 'Size', 'Status', 'Candidate / Note'],
      files.map((f) => [f.fileName, f.type, f.size, f.parsingStatus, f.hashOrNote])
    );
    showToast('Downloaded hireswift_upload_summary.csv');
  };

  const parsedCount = files.filter((f) => f.parsingStatus === 'parsed').length;
  const duplicateCount = files.filter((f) => f.parsingStatus === 'duplicate').length;
  const failedCount = files.filter((f) => f.parsingStatus === 'failed').length;
  const finishedCount = parsedCount + duplicateCount + failedCount;
  const overallPct = files.length > 0 ? Math.round((finishedCount / files.length) * 100) : 0;

  return (
    <div className="flex flex-col w-full">
      {/* Top Command Context Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-mono-code text-mono-code text-tertiary">
            <span>BULK RESUME UPLOAD</span>
          </div>
          <h1 className="font-heading font-extrabold text-headline-lg text-white tracking-tight">
            Resume Upload
          </h1>
          <p className="font-body-md text-body-md text-[#94A3B8]">
            Upload multiple PDF or DOCX resumes for real text extraction, smart AI parsing, and duplicate checks.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high text-xs shadow-sm">
            <span className="text-outline">Target Job:</span>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="bg-transparent text-primary font-semibold outline-none cursor-pointer"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id} className="bg-[#111827] text-white">
                  {j.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Limit: {maxFileSizeMb} MB</span>
          </button>
        </div>
      </div>

      {batchSummary && (
        <div className="mb-6 p-4 rounded-2xl glass-card border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-400">task_alt</span>
            <span className="text-on-surface">
              Batch processed <strong>{batchSummary.total}</strong> document(s):{' '}
              <span className="text-emerald-300 font-semibold">{batchSummary.parsed} added</span>,{' '}
              <span className="text-amber-300 font-semibold">{batchSummary.duplicates} duplicate(s)</span>,{' '}
              <span className="text-rose-400 font-semibold">{batchSummary.failed} failed</span>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('candidates')}
            className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-semibold cursor-pointer"
          >
            View Candidate List →
          </button>
        </div>
      )}

      {/* Primary Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left Column: Drop Zone + Queue */}
        <div className="xl:col-span-8 flex flex-col gap-space-xl min-w-0">
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFilesAdded(e.dataTransfer.files);
            }}
            className={`relative group rounded-2xl glass-card p-8 transition-all duration-300 shadow-md overflow-hidden ${
              isDragging ? 'ring-2 ring-[#8B5CF6] bg-[#1B2740]/80' : ''
            }`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[34px]">cloud_upload</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                Drag and drop resumes here, or browse files
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-5">
                Supported formats: PDF, DOCX • Up to {maxFileSizeMb} MB per file • Multi-file queue
              </p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-label-md font-semibold hover:opacity-95 shadow-lg cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Browse Files from Computer</span>
                <input
                  accept=".pdf,.docx"
                  className="hidden"
                  multiple
                  type="file"
                  onChange={(e) => {
                    handleFilesAdded(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-on-surface-variant font-mono-code text-[11px]">
                <span className="bg-surface-container px-2.5 py-1 rounded">✓ PDF.js + Smart AI OCR</span>
                <span className="bg-surface-container px-2.5 py-1 rounded">✓ Mammoth DOCX Parser</span>
                <span className="bg-surface-container px-2.5 py-1 rounded">✓ SHA-256 Deduplication</span>
              </div>
            </div>
          </div>

          {/* Queue Table */}
          <div className="rounded-2xl glass-card shadow-sm overflow-hidden flex flex-col">
            <div className="p-space-lg bg-surface-container flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-3">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Upload Queue
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-bright text-on-surface font-mono-code text-xs">
                  {files.length} Files
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearInactive}
                className="text-on-surface-variant hover:text-error px-2.5 py-1 rounded-lg hover:bg-surface-container-high font-label-sm text-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">clear_all</span>
                <span>Clear Completed</span>
              </button>
            </div>

            {files.length === 0 ? (
              <div className="p-10 text-center text-xs text-outline">
                No files queued yet. Drop PDF or DOCX resumes above to begin automated extraction.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm tabular-nums">
                  <thead>
                    <tr className="bg-surface-container-lowest/60 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-4">Processing Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#263449]/60">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                file.type === 'DOCX' ? 'text-blue-400' : 'text-rose-400'
                              }`}
                            >
                              {file.type === 'DOCX' ? 'description' : 'picture_as_pdf'}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-on-surface truncate">
                                {file.fileName}
                              </div>
                              <div
                                className={`font-mono-code text-[10px] truncate ${
                                  file.parsingStatus === 'failed'
                                    ? 'text-rose-400'
                                    : 'text-on-surface-variant'
                                }`}
                              >
                                {file.errorDetail || file.hashOrNote}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono-code text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                            {file.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono-code text-xs text-on-surface-variant whitespace-nowrap">
                          {file.size}
                        </td>
                        <td className="py-3.5 px-4">
                          {file.parsingStatus === 'parsed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Successfully Parsed
                            </span>
                          )}
                          {file.parsingStatus === 'processing' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/25 text-primary text-xs font-medium">
                              <span className="material-symbols-outlined text-[13px] animate-spin">
                                refresh
                              </span>
                              Processing ({file.parsingProgress ?? 50}%)
                            </span>
                          )}
                          {file.parsingStatus === 'duplicate' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium">
                              Duplicate Detected
                            </span>
                          )}
                          {file.parsingStatus === 'failed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-medium">
                              Failed
                            </span>
                          )}
                          {file.parsingStatus === 'waiting' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {file.parsingStatus === 'parsed' && file.parsedCandidateDraft && (
                            <button
                              type="button"
                              onClick={() => onSelectCandidate(file.parsedCandidateDraft!)}
                              className="text-tertiary hover:underline text-xs font-medium cursor-pointer"
                            >
                              View Profile →
                            </button>
                          )}
                          {file.parsingStatus === 'duplicate' && (
                            <button
                              type="button"
                              onClick={() => setResolveTarget(file)}
                              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer"
                            >
                              Resolve Duplicate
                            </button>
                          )}
                          {file.parsingStatus === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleRetrySingle(file)}
                              className="px-2.5 py-1 rounded bg-surface-container-high text-primary hover:bg-surface-bright text-xs cursor-pointer"
                            >
                              Retry
                            </button>
                          )}
                          {file.parsingStatus === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file.id)}
                              className="text-outline hover:text-rose-400 text-xs cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Processing Intelligence */}
        <div className="xl:col-span-4 flex flex-col gap-space-xl">
          <div className="rounded-2xl glass-card p-space-lg shadow-md flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono-code text-xs text-tertiary uppercase">
                    AI Parser Ready
                  </span>
                </div>
                <h3 className="font-headline-md text-on-surface font-semibold mt-1">
                  Parsing Intelligence
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-mono-code text-[11px] font-bold">
                Smart AI
              </span>
            </div>

            <div className="space-y-2 tabular-nums">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Batch Progress</span>
                <span className="font-mono-code text-white font-bold">{overallPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 tabular-nums text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container">
                <span className="text-outline block">Queued / Total</span>
                <span className="font-headline-lg font-bold text-white">{files.length}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container">
                <span className="text-emerald-300 block">Parsed</span>
                <span className="font-headline-lg font-bold text-emerald-400">{parsedCount}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container">
                <span className="text-amber-300 block">Duplicates</span>
                <span className="font-headline-lg font-bold text-amber-400">{duplicateCount}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container">
                <span className="text-rose-300 block">Failed</span>
                <span className="font-headline-lg font-bold text-rose-400">{failedCount}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartParsing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-white/15 hover:opacity-95 disabled:opacity-60 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[20px] ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'refresh' : 'auto_awesome'}
              </span>
              <span>{isProcessing ? 'Parsing Resumes...' : 'Start AI Resume Parsing'}</span>
            </button>
          </div>

          <div className="rounded-2xl glass-card p-5 space-y-2.5">
            <h4 className="font-label-sm text-outline uppercase tracking-wider">
              Downstream Actions
            </h4>
            <button
              type="button"
              onClick={() => onNavigate('candidates')}
              className="w-full py-2.5 px-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface flex items-center justify-between cursor-pointer"
            >
              <span>View Candidate List</span>
              <span className="font-mono-code text-tertiary">{candidates.length} Total</span>
            </button>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={files.length === 0}
              className="w-full py-2.5 px-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface flex items-center justify-between disabled:opacity-40 cursor-pointer"
            >
              <span>Download Upload Summary (CSV)</span>
              <span className="material-symbols-outlined text-[16px] text-outline">download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Resolution Modal */}
      {resolveTarget && resolveTarget.parsedCandidateDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setResolveTarget(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111827] border border-[#263449] shadow-2xl p-6 z-10 space-y-4">
            <h3 className="font-headline-md text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">warning</span>
              <span>Duplicate Resume Detected</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              <strong>{resolveTarget.parsedCandidateDraft.name}</strong> ({resolveTarget.fileName}) matched an existing candidate: <span className="text-amber-300">{resolveTarget.duplicateMatch}</span>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFiles((prev) => prev.filter((f) => f.id !== resolveTarget.id));
                  setResolveTarget(null);
                  showToast('Skipped duplicate resume upload', 'info');
                }}
                className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs text-white cursor-pointer"
              >
                Skip Duplicate
              </button>
              {resolveTarget.duplicateCandidateId && (
                <button
                  type="button"
                  onClick={() => {
                    mergeDuplicateCandidate(
                      resolveTarget.parsedCandidateDraft!,
                      resolveTarget.duplicateCandidateId!
                    );
                    setFiles((prev) =>
                      prev.map((f) =>
                        f.id === resolveTarget.id
                          ? { ...f, parsingStatus: 'parsed', hashOrNote: 'Merged cleanly into existing profile' }
                          : f
                      )
                    );
                    setResolveTarget(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold cursor-pointer"
                >
                  Merge Details
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const uniqueDraft: CandidateProfile = {
                    ...resolveTarget.parsedCandidateDraft!,
                    duplicateStatus: 'Requires Review',
                  };
                  addCandidate(uniqueDraft);
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.id === resolveTarget.id
                        ? { ...f, parsingStatus: 'parsed', hashOrNote: 'Added for manual review' }
                        : f
                    )
                  );
                  setResolveTarget(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold cursor-pointer"
              >
                Add as New Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
