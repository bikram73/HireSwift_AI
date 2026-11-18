import React, { useEffect, useRef, useState } from 'react';
import { useAts } from '../context/AtsContext';
import { EmploymentType, JobPosting, JobStatus } from '../data/atsData';
import { DocumentValidationError, validateAndExtractJobDocument } from '../utils/fileExtractor';

interface CustomJobRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: JobPosting | null;
  onSaved?: (job: JobPosting) => void;
}

type InputMode = 'text' | 'file';

const SAMPLE_JD_EXAMPLE = `Role Title: Full Stack Software Engineer
Department: Engineering
Location: Bengaluru / Hybrid (Full-Time)
Experience: 1–3 Years
Minimum Qualification: B.Tech / B.E. in Computer Science or related field (Min CGPA: 7.5)

Required Skills: TypeScript, React, Node.js, PostgreSQL, REST APIs
Preferred Skills: Docker, AWS, Tailwind CSS, Redis

Responsibilities:
- Design and build responsive React + TypeScript web applications and scalable Node.js microservices.
- Optimize PostgreSQL schemas, queries, and API latency under production load.
- Collaborate with product and QA engineers to ship tested, CI/CD-verified releases.`;

export const CustomJobRoleModal: React.FC<CustomJobRoleModalProps> = ({
  isOpen,
  onClose,
  editingJob = null,
  onSaved,
}) => {
  const { addJob, updateJob, setSelectedJobId, maxFileSizeMb, showToast } = useAts();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [analyzingJd, setAnalyzingJd] = useState(false);
  const [extractingFile, setExtractingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'PDF' | 'DOCX' | 'TXT' | null>(null);
  const [pendingBase64Pdf, setPendingBase64Pdf] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<{ reason: string; action: string } | null>(null);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [status, setStatus] = useState<JobStatus>('Active');
  const [description, setDescription] = useState('');
  const [reqSkills, setReqSkills] = useState('');
  const [prefSkills, setPrefSkills] = useState('');
  const [minExp, setMinExp] = useState('0');
  const [maxExp, setMaxExp] = useState('3');
  const [minCgpa, setMinCgpa] = useState('');
  const [gradYears, setGradYears] = useState('2024, 2025, 2026');
  const [responsibilities, setResponsibilities] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFileError(null);
    setUploadedFileName(null);
    setUploadedFileType(null);
    setPendingBase64Pdf(undefined);
    setInputMode('text');

    if (editingJob) {
      setTitle(editingJob.title);
      setDepartment(editingJob.department);
      setLocation(editingJob.location);
      setEmploymentType(editingJob.employmentType);
      setStatus(editingJob.status);
      setDescription(editingJob.description);
      setReqSkills(editingJob.requiredSkills.join(', '));
      setPrefSkills(editingJob.preferredSkills.join(', '));
      setMinExp(String(editingJob.minimumExperience));
      setMaxExp(String(editingJob.maximumExperience));
      setMinCgpa(editingJob.minimumCGPA !== null ? String(editingJob.minimumCGPA) : '');
      setGradYears(editingJob.graduationYears.join(', '));
      setResponsibilities(editingJob.responsibilities.join('\n'));
    } else {
      setTitle('');
      setDepartment('Engineering');
      setLocation('Remote / Hybrid');
      setEmploymentType('Full-Time');
      setStatus('Active');
      setDescription('');
      setReqSkills('');
      setPrefSkills('');
      setMinExp('0');
      setMaxExp('3');
      setMinCgpa('');
      setGradYears('2024, 2025, 2026');
      setResponsibilities('');
    }
  }, [isOpen, editingJob]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const runAnalyzeRequest = async (descText: string, base64Pdf?: string) => {
    if (descText.trim().length < 15 && !base64Pdf) {
      showToast('Paste a job description (15+ chars) or upload a DOC/PDF to analyze.', 'warning');
      return;
    }
    setAnalyzingJd(true);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: descText, ...(base64Pdf ? { base64Pdf } : {}) }),
      });
      const data = (await res.json()) as {
        error?: string;
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
          extractedSummary?: string;
        };
      };

      if (!res.ok) {
        showToast(data.error || 'Could not analyze job description.', 'error');
        return;
      }

      const a = data.analysis;
      if (a) {
        if (a.title && !title.trim()) setTitle(a.title);
        if (a.requiredSkills?.length) setReqSkills(a.requiredSkills.join(', '));
        if (a.preferredSkills?.length) setPrefSkills(a.preferredSkills.join(', '));
        if (typeof a.minimumExperience === 'number') setMinExp(String(a.minimumExperience));
        if (typeof a.maximumExperience === 'number') setMaxExp(String(a.maximumExperience));
        setMinCgpa(typeof a.minimumCGPA === 'number' ? String(a.minimumCGPA) : '');
        if (a.location && a.location !== 'Not Specified') setLocation(a.location);
        if (a.responsibilities?.length) setResponsibilities(a.responsibilities.join('\n'));
        if (a.extractedSummary && descText.trim().length < 15) {
          setDescription(a.extractedSummary);
        }
        showToast('JD requirements extracted! Review and edit before saving.');
      }
    } catch {
      showToast('Could not analyze JD automatically.', 'error');
    } finally {
      setAnalyzingJd(false);
    }
  };

  const handleDocumentSelected = async (file: File | undefined) => {
    if (!file) return;
    setFileError(null);
    setExtractingFile(true);
    try {
      const extracted = await validateAndExtractJobDocument(file, maxFileSizeMb);
      setUploadedFileName(extracted.fileName);
      setUploadedFileType(extracted.fileType);
      setPendingBase64Pdf(extracted.base64Pdf);

      if (extracted.extractedText.trim().length > 0) {
        setDescription(extracted.extractedText);
      } else {
        setDescription(
          `Uploaded scanned PDF: ${extracted.fileName}. Click "Analyze JD with AI" to extract requirements via OCR.`
        );
      }

      if (!title.trim()) {
        const cleanFileTitle = extracted.fileName
          .replace(/\.(pdf|docx|txt|md)$/i, '')
          .replace(/[_-]+/g, ' ')
          .replace(/\b(jd|job description|role)\b/gi, '')
          .trim();
        if (cleanFileTitle.length >= 3 && cleanFileTitle.length <= 60) {
          setTitle(cleanFileTitle);
        }
      }

      await runAnalyzeRequest(extracted.extractedText, extracted.base64Pdf);
    } catch (err) {
      if (err instanceof DocumentValidationError) {
        setFileError({ reason: err.reason, action: err.action });
        showToast(err.message, 'error');
      } else {
        const msg = err instanceof Error ? err.message : 'Unable to read job document.';
        setFileError({ reason: msg, action: 'Upload a valid PDF, DOCX, or TXT file.' });
        showToast(msg, 'error');
      }
    } finally {
      setExtractingFile(false);
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a Target Job Role title.', 'warning');
      return;
    }

    const reqArr = reqSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const prefArr = prefSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const yrsArr = gradYears
      .split(',')
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => !Number.isNaN(y));
    const respArr = responsibilities
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const payload: JobPosting = {
      id: editingJob?.id || `job-${Date.now()}`,
      title: title.trim(),
      department: department.trim() || 'Engineering',
      location: location.trim() || 'Remote',
      employmentType,
      priority: editingJob?.priority ?? 'High',
      description:
        description.trim() ||
        (uploadedFileName ? `${title.trim()} (imported from ${uploadedFileName})` : `${title.trim()} requisition.`),
      requiredQualifications: editingJob?.requiredQualifications ?? [
        'B.Tech / B.E. or equivalent technical background',
      ],
      preferredQualifications: editingJob?.preferredQualifications ?? [],
      requiredSkills: reqArr,
      preferredSkills: prefArr,
      responsibilities:
        respArr.length > 0 ? respArr : [`Deliver core engineering milestones for ${title.trim()}`],
      certifications: editingJob?.certifications ?? [],
      minimumExperience: parseFloat(minExp) || 0,
      maximumExperience: parseFloat(maxExp) || 4,
      minimumCGPA: minCgpa.trim() ? parseFloat(minCgpa) : null,
      graduationYears: yrsArr.length > 0 ? yrsArr : [2024, 2025, 2026],
      keywords: Array.from(new Set([...reqArr, ...prefArr])),
      applicants: editingJob?.applicants ?? 0,
      shortlisted: editingJob?.shortlisted ?? 0,
      avgMatch: editingJob?.avgMatch ?? 0,
      status,
      skills: Array.from(new Set([...reqArr, ...prefArr])),
      salaryRange: editingJob?.salaryRange ?? 'Competitive',
      postedAgo: editingJob?.postedAgo ?? 'Just now',
    };

    if (editingJob) {
      updateJob(payload);
    } else {
      addJob(payload);
      setSelectedJobId(payload.id);
    }
    onSaved?.(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-3 sm:px-4 overflow-y-auto py-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={editingJob ? 'Edit Job Description' : 'Add Custom Target Job Role'}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <form
        onSubmit={handleSaveJob}
        className="relative w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#263449] shadow-2xl p-4 sm:p-6 z-10 space-y-4 text-xs max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-headline-md text-white font-semibold">
              {editingJob ? 'Edit Job Description' : 'Add Custom Target Job Role'}
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Paste a text description or upload a PDF / DOCX job spec to extract matching requirements.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-outline hover:text-white hover:bg-[#1E293B] shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Input Mode Switcher: Text Description vs PDF / DOCX Document */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex flex-wrap rounded-xl bg-surface-container-highest p-1 gap-1">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-outline hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">description</span>
              <span>Text Description</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                inputMode === 'file'
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-outline hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              <span>Upload DOC / PDF</span>
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              disabled={analyzingJd || extractingFile}
              onClick={async () => {
                setInputMode('text');
                setFileError(null);
                setPendingBase64Pdf(undefined);
                setDescription(SAMPLE_JD_EXAMPLE);
                await runAnalyzeRequest(SAMPLE_JD_EXAMPLE);
              }}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-surface-container-highest hover:bg-[#1E293B] border border-[#263449] text-tertiary font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              <span>Load Sample JD</span>
            </button>
            <button
              type="button"
              disabled={analyzingJd || extractingFile}
              onClick={() => runAnalyzeRequest(description, pendingBase64Pdf)}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
            >
              <span
                className={`material-symbols-outlined text-[14px] ${
                  analyzingJd || extractingFile ? 'animate-spin' : ''
                }`}
              >
                {analyzingJd || extractingFile ? 'refresh' : 'auto_awesome'}
              </span>
              <span>{analyzingJd ? 'Analyzing JD...' : 'Analyze JD with AI'}</span>
            </button>
          </div>
        </div>

        {inputMode === 'file' ? (
          <div className="space-y-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              aria-label="Upload Job Description Document"
              className="hidden"
              onChange={(e) => {
                handleDocumentSelected(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
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
                handleDocumentSelected(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border border-dashed p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#8B5CF6] bg-[#4F46E5]/15'
                  : 'border-[#263449] bg-surface-container-highest/60 hover:border-[#8B5CF6]/70'
              }`}
            >
              <span className="material-symbols-outlined text-[28px] text-[#8B5CF6] mb-1 block">
                cloud_upload
              </span>
              <p className="text-white font-semibold text-xs">
                {extractingFile
                  ? 'Reading & extracting document text...'
                  : 'Drop a PDF, DOCX, or TXT Job Description here, or click to browse'}
              </p>
              <p className="text-[11px] text-outline mt-1">
                Max {maxFileSizeMb} MB • Automatically extracts skills, CGPA, experience &amp; role details
              </p>
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    check_circle
                  </span>
                  <span className="truncate font-medium">
                    Loaded ({uploadedFileType}): {uploadedFileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className="text-[11px] text-primary hover:underline shrink-0 cursor-pointer"
                >
                  Edit Extracted Text →
                </button>
              </div>
            )}

            {fileError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[11px]">
                <strong className="block text-rose-300">{fileError.reason}</strong>
                <span>{fileError.action}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="text-outline block mb-1">
              Full Job Description (Paste to Auto-Extract)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPendingBase64Pdf(undefined);
              }}
              placeholder="Paste job description here and click 'Analyze JD with AI' to extract required/preferred skills, experience, and qualifications..."
              className="w-full p-3 rounded-lg bg-surface-container-highest text-on-surface outline-none resize-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-outline block mb-1">Target Job Role Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Python Engineer"
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
                {['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote', 'Hybrid', 'On-Site'].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
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
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-outline block mb-1">Required Skills (comma separated)</label>
            <input
              value={reqSkills}
              onChange={(e) => setReqSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, PostgreSQL"
              className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
            />
          </div>
          <div>
            <label className="text-outline block mb-1">Preferred / Optional Skills</label>
            <input
              value={prefSkills}
              onChange={(e) => setPrefSkills(e.target.value)}
              placeholder="e.g. Docker, AWS, Redis"
              className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              placeholder="Optional"
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

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-surface-container-high text-on-surface cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 min-h-[40px] rounded-lg bg-primary-container text-white font-semibold cursor-pointer"
          >
            {editingJob ? 'Save Job Updates' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};
