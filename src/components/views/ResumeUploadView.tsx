import React, { useState } from 'react';
import {
  INITIAL_QUEUE_FILES,
  QueuedResumeFile,
  CANDIDATES_DATA,
  CandidateProfile,
  WorkspaceRoute,
} from '../../data/atsData';

interface ResumeUploadViewProps {
  onNavigate: (route: WorkspaceRoute) => void;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  onNavigate,
  onSelectCandidate,
}) => {
  const [files, setFiles] = useState<QueuedResumeFile[]>(INITIAL_QUEUE_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: QueuedResumeFile[] = Array.from(fileList).map((f, idx) => {
      const ext = f.name.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF';
      const mb = (f.size / (1024 * 1024)).toFixed(2);
      return {
        id: `q-${Date.now()}-${idx}`,
        docId: `#DOC-${8930 + idx}`,
        fileName: f.name,
        hashOrNote: 'Queued for AI parsing',
        type: ext,
        size: f.size > 1024 * 1024 ? `${mb} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
        uploadProgress: 100,
        parsingStatus: 'waiting',
      };
    });
    setFiles((prev) => [...added, ...prev]);
    showToast(`Added ${added.length} file(s) to parsing queue`);
  };

  const handleStartParsing = () => {
    setFiles((prev) =>
      prev.map((f) =>
        f.parsingStatus === 'waiting' || f.parsingStatus === 'processing'
          ? {
              ...f,
              parsingStatus: 'parsed',
              hashOrNote: 'Profile built successfully',
            }
          : f
      )
    );
    showToast('AI Resume Parsing completed across active queue');
  };

  const handleRetryFailed = () => {
    setFiles((prev) =>
      prev.map((f) =>
        f.parsingStatus === 'failed'
          ? {
              ...f,
              parsingStatus: 'parsed',
              hashOrNote: 'Document recovered successfully',
              errorDetail: undefined,
            }
          : f
      )
    );
    showToast('Recovered failed resume file');
  };

  const handleResolveDuplicate = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              parsingStatus: 'parsed',
              hashOrNote: 'Merged with existing candidate profile',
              duplicateMatch: undefined,
            }
          : f
      )
    );
    showToast('Duplicate candidate profile merged cleanly');
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearInactive = () => {
    setFiles((prev) =>
      prev.filter((f) => f.parsingStatus === 'processing' || f.parsingStatus === 'waiting')
    );
    showToast('Cleared completed and flagged rows');
  };

  const parsedCount = files.filter((f) => f.parsingStatus === 'parsed').length;
  const duplicateCount = files.filter((f) => f.parsingStatus === 'duplicate').length;
  const failedCount = files.filter((f) => f.parsingStatus === 'failed').length;
  const overallPct = files.length > 0 ? Math.min(100, Math.round(((parsedCount + 1.5) / files.length) * 100)) : 100;

  return (
    <div className="flex flex-col w-full">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-surface-container border border-primary-container/50 shadow-2xl text-xs font-medium text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">
            auto_awesome
          </span>
          <span>{toastMsg}</span>
        </div>
      )}

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
            Upload multiple resumes and let AI extract candidate information automatically.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              folder_zip
            </span>
            <span>
              Auto-assign to:{' '}
              <strong className="text-primary font-medium">Q3 Senior Eng Batch</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Parser Config</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Google Drive batch connector synced (14 new files)')}
            className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Drive Connect</span>
          </button>
        </div>
      </div>

      {/* Primary Ingestion & Diagnostics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left Column: Upload Zone & Queue Ledger (8 Cols Desktop) */}
        <div className="xl:col-span-8 flex flex-col gap-space-xl min-w-0">
          {/* Upload Zone */}
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
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-container/10 blur-3xl pointer-events-none group-hover:bg-primary-container/20 transition-all" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none group-hover:bg-secondary-container/20 transition-all" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-space-md">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all duration-300 shadow-lg">
                  <span className="material-symbols-outlined text-[34px]">
                    cloud_upload
                  </span>
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shadow">
                  <span className="material-symbols-outlined text-[14px]">
                    auto_awesome
                  </span>
                </div>
              </div>

              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                Drag and drop resumes here, or browse files
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-space-lg">
                Supported formats: PDF, DOCX • Up to 10 MB per file • Multi-file upload supported
              </p>

              <div className="flex items-center gap-space-md flex-wrap justify-center">
                <label className="inline-flex items-center gap-space-xs px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-medium hover:bg-secondary-container transition-all shadow-md cursor-pointer hover:shadow-primary-container/25">
                  <span className="material-symbols-outlined text-[18px]">
                    add_circle
                  </span>
                  <span>Browse Files from Computer</span>
                  <input
                    accept=".pdf,.docx"
                    className="hidden"
                    multiple
                    type="file"
                    onChange={(e) => handleFilesAdded(e.target.files)}
                  />
                </label>
                <span className="font-mono-code text-[11px] text-outline uppercase tracking-wider hidden sm:inline">
                  Or paste direct URLs
                </span>
              </div>

              <div className="mt-space-lg pt-space-md flex flex-wrap items-center justify-center gap-space-sm text-on-surface-variant font-mono-code text-[11px]">
                <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    check
                  </span>{' '}
                  OCR Enriched
                </span>
                <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    check
                  </span>{' '}
                  Entity Recognition
                </span>
                <span className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    check
                  </span>{' '}
                  Deduplication Active
                </span>
              </div>
            </div>
          </div>

          {/* Upload Queue Ledger Table */}
          <div className="rounded-2xl glass-card shadow-sm overflow-hidden flex flex-col">
            <div className="p-space-lg bg-surface-container flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Files in Queue
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-bright text-on-surface font-mono-code text-mono-code tabular-nums">
                    {files.length} Files
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/15 text-primary text-[11px] font-mono-code">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span>Queue Active</span>
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setFiles(INITIAL_QUEUE_FILES)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="Reset Demo Queue"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    filter_list
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearInactive}
                  className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-surface-container-high transition-colors font-label-sm text-label-sm flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    clear_all
                  </span>
                  <span className="hidden md:inline">Clear Inactive</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm text-on-surface tabular-nums">
                <thead>
                  <tr className="bg-surface-container-lowest/60 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-4">Upload Status</th>
                    <th className="py-3 px-4">AI Parsing Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {files.map((file, idx) => (
                    <tr
                      key={file.id}
                      className={`hover:bg-surface-container/50 transition-colors ${
                        idx % 2 === 1 ? 'bg-surface-container-low/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2.5 min-w-[220px]">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            file.type === 'DOCX'
                              ? 'text-tertiary-container'
                              : 'text-error'
                          }`}
                        >
                          {file.type === 'DOCX' ? 'description' : 'picture_as_pdf'}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-semibold">{file.fileName}</span>
                          <span
                            className={`font-mono-code text-[10px] truncate ${
                              file.parsingStatus === 'failed'
                                ? 'text-error'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {file.hashOrNote}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono-code text-mono-code px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                          {file.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono-code text-mono-code text-on-surface-variant whitespace-nowrap">
                        {file.size}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">
                            check_circle
                          </span>
                          <span className="font-mono-code text-[12px] text-on-surface">
                            {file.uploadProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {file.parsingStatus === 'parsed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-label-sm text-label-sm font-medium whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Successfully Parsed</span>
                          </span>
                        )}

                        {file.parsingStatus === 'processing' && (
                          <div className="flex flex-col gap-1.5 min-w-[180px]">
                            <div className="flex items-center justify-between font-mono-code text-[11px]">
                              <span className="text-primary font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] animate-spin">
                                  refresh
                                </span>
                                Processing Entities
                              </span>
                              <span className="text-tertiary font-bold">
                                {file.parsingProgress ?? 78}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container transition-all duration-500"
                                style={{ width: `${file.parsingProgress ?? 78}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {file.parsingStatus === 'duplicate' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-label-sm text-label-sm font-medium w-fit">
                              <span className="material-symbols-outlined text-[13px]">
                                warning
                              </span>
                              <span>Duplicate Detected</span>
                            </span>
                            <span className="font-mono-code text-[10px] text-amber-200/80">
                              {file.duplicateMatch}
                            </span>
                          </div>
                        )}

                        {file.parsingStatus === 'failed' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-error-container/40 text-error font-label-sm text-label-sm font-medium w-fit">
                              <span className="material-symbols-outlined text-[13px]">
                                error
                              </span>
                              <span>Parsing Failed</span>
                            </span>
                            <span className="font-mono-code text-[10px] text-error/90">
                              {file.errorDetail}
                            </span>
                          </div>
                        )}

                        {file.parsingStatus === 'waiting' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            <span>Waiting in Queue</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {file.parsingStatus === 'parsed' && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectCandidate(
                                CANDIDATES_DATA[idx % CANDIDATES_DATA.length]
                              )
                            }
                            className="text-tertiary hover:text-on-surface font-label-md text-label-md inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>View Details</span>
                            <span className="material-symbols-outlined text-[14px]">
                              arrow_forward
                            </span>
                          </button>
                        )}
                        {file.parsingStatus === 'processing' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-on-surface-variant hover:text-error font-label-md text-label-md transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        {file.parsingStatus === 'duplicate' && (
                          <button
                            type="button"
                            onClick={() => handleResolveDuplicate(file.id)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 font-label-md text-label-md transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                        {file.parsingStatus === 'failed' && (
                          <button
                            type="button"
                            onClick={handleRetryFailed}
                            className="px-2.5 py-1 rounded bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-md text-label-md inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              refresh
                            </span>
                            <span>Retry</span>
                          </button>
                        )}
                        {file.parsingStatus === 'waiting' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-on-surface-variant hover:text-error font-label-md text-label-md transition-colors cursor-pointer"
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

            <div className="p-space-md bg-surface-container/60 flex items-center justify-between text-on-surface-variant font-mono-code text-mono-code">
              <div className="flex items-center gap-4">
                <span>Parallel Processing Active</span>
              </div>
              <span className="text-tertiary font-medium">
                {files.filter((f) => f.parsingStatus === 'processing').length} In-flight,{' '}
                {files.filter((f) => f.parsingStatus === 'waiting').length} Pending
              </span>
            </div>
          </div>

          {/* Quick Feature Callout: Auto-Skill Mapping */}
          <div className="rounded-2xl glass-card p-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Semantic Taxonomy Normalization
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Resumes are automatically normalized against 42,000+ standardized technical competencies.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs font-mono-code text-mono-code text-tertiary whitespace-nowrap bg-surface-container-high px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
              <span>STANDARDIZED SKILLS</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Processing Intelligence Panel & Diagnostics (4 Cols Desktop) */}
        <div className="xl:col-span-4 flex flex-col gap-space-xl">
          <div className="rounded-2xl glass-card p-space-lg shadow-md flex flex-col gap-space-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono-code text-mono-code text-tertiary tracking-wide uppercase">
                    AI Parser Ready
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  Parsing Intelligence
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-mono-code text-[11px] font-bold">
                AI PARSER
              </span>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  psychology
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">
                    Active Parser Model
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    Gemini 1.5 ATS Parser
                  </span>
                </div>
              </div>
              <span className="font-mono-code text-[11px] text-tertiary bg-surface-container-high px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="flex flex-col gap-space-xs tabular-nums">
              <div className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant font-medium">
                  Batch Overall Progress
                </span>
                <span className="font-mono-code text-on-surface font-bold text-headline-sm">
                  {overallPct}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-container via-secondary-container to-secondary transition-all duration-700 shadow-sm"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono-code text-[11px] text-outline mt-1">
                <span>Matching extracted skills &amp; experience</span>
                <span>{overallPct === 100 ? 'Complete' : '4.5s remaining'}</span>
              </div>
            </div>

            {/* High-Density Metric Grid */}
            <div className="grid grid-cols-2 gap-space-sm tabular-nums">
              <div className="p-space-md rounded-lg bg-surface-container flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total Uploaded
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    {files.length}
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    resumes
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-code text-tertiary">
                  <span className="material-symbols-outlined text-[13px]">
                    inbox
                  </span>
                  <span>100% Ingested</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-emerald-300">
                  Successfully Parsed
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-emerald-400">
                    {parsedCount}
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    profiles
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-code text-emerald-400">
                  <span className="material-symbols-outlined text-[13px]">
                    verified
                  </span>
                  <span>Profiles Built</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-amber-300">
                  Duplicates Flagged
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-amber-400">
                    {duplicateCount}
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    conflict
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-code text-amber-300">
                  <span className="material-symbols-outlined text-[13px]">
                    content_copy
                  </span>
                  <span>Requires Merge</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-error">
                  Parsing Failures
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-error">
                    {failedCount}
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    unreadable
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-code text-error">
                  <span className="material-symbols-outlined text-[13px]">
                    broken_image
                  </span>
                  <span>Unreadable File</span>
                </div>
              </div>
            </div>

            {/* Processing Speed Sparkline */}
            <div className="p-space-md rounded-lg bg-surface-container-high/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Processing Speed
                </span>
                <span className="font-mono-code text-[11px] text-primary">
                  Fast Batch Mode
                </span>
              </div>
              <div className="h-10 w-full flex items-end">
                <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 280 40">
                  <path
                    d="M0 32 L35 24 L70 28 L105 14 L140 18 L175 6 L210 12 L245 4 L280 16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 32 L35 24 L70 28 L105 14 L140 18 L175 6 L210 12 L245 4 L280 16 L280 40 L0 40 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                </svg>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleStartParsing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-white/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                auto_awesome
              </span>
              <span>Start AI Resume Parsing</span>
            </button>
          </div>

          {/* Downstream Operations */}
          <div className="rounded-2xl glass-card p-space-lg shadow-sm flex flex-col gap-space-md">
            <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Downstream Operations
            </h4>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onNavigate('candidates')}
                className="w-full py-2.5 px-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">
                    badge
                  </span>
                  <span>View Parsed Candidates</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-bright font-mono-code text-[11px] text-tertiary font-bold">
                  {parsedCount} Ready
                </span>
              </button>

              <button
                type="button"
                onClick={handleRetryFailed}
                className="w-full py-2.5 px-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    restart_alt
                  </span>
                  <span>Retry Failed Files</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-bright font-mono-code text-[11px] text-error font-bold">
                  {failedCount} Item
                </span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Downloaded extraction_summary.csv')}
                className="w-full py-2.5 px-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    download_for_offline
                  </span>
                  <span>Download Extraction Summary (CSV)</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">
                  file_download
                </span>
              </button>
            </div>

            <div className="mt-2 pt-3 flex items-start gap-2 text-on-surface-variant font-mono-code text-[10px] leading-relaxed">
              <span className="material-symbols-outlined text-[14px] text-tertiary shrink-0 mt-0.5">
                lock
              </span>
              <span>
                Encrypted resume processing with privacy protection enabled by default.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
