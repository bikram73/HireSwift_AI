import React, { useEffect, useState } from 'react';
import { useAts } from '../context/AtsContext';
import { EmploymentType, JobPosting } from '../data/atsData';

interface CustomTargetJobModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (job: JobPosting) => void;
}

export const CUSTOM_JOB_OPTION_VALUE = '__custom_target_job__';

export const CustomTargetJobModal: React.FC<CustomTargetJobModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { addJob, showToast } = useAts();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [reqSkills, setReqSkills] = useState('');
  const [prefSkills, setPrefSkills] = useState('');
  const [minExp, setMinExp] = useState('0');
  const [minCgpa, setMinCgpa] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const resetForm = () => {
    setTitle('');
    setDepartment('Engineering');
    setLocation('Remote / Hybrid');
    setEmploymentType('Full-Time');
    setReqSkills('');
    setPrefSkills('');
    setMinExp('0');
    setMinCgpa('');
    setDescription('');
  };

  const handleAnalyzeDescription = async () => {
    if (!description.trim()) {
      showToast('Paste a role description first to auto-extract skills.', 'warning');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          analysis?: {
            title?: string;
            requiredSkills?: string[];
            preferredSkills?: string[];
            minimumExperience?: number;
            minimumCGPA?: number | null;
            location?: string;
          };
        };
        const a = data.analysis;
        if (a) {
          if (a.title && !title.trim()) setTitle(a.title);
          if (a.requiredSkills?.length) setReqSkills(a.requiredSkills.join(', '));
          if (a.preferredSkills?.length) setPrefSkills(a.preferredSkills.join(', '));
          if (typeof a.minimumExperience === 'number') setMinExp(String(a.minimumExperience));
          if (typeof a.minimumCGPA === 'number') setMinCgpa(String(a.minimumCGPA));
          if (a.location && a.location !== 'Not Specified') setLocation(a.location);
          showToast('Extracted skills and criteria from description.');
        }
      }
    } catch {
      showToast('Could not analyze description automatically.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      showToast('Please enter a custom target job role title.', 'warning');
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
    const parsedExp = Math.max(0, parseFloat(minExp) || 0);
    const parsedCgpa = minCgpa.trim() ? parseFloat(minCgpa) : null;

    const newJob: JobPosting = {
      id: `job-custom-${Date.now()}`,
      title: cleanTitle,
      department: department.trim() || 'Engineering',
      location: location.trim() || 'Remote / Hybrid',
      employmentType,
      priority: 'High',
      description: description.trim() || `${cleanTitle} custom target role requisition.`,
      requiredQualifications: ['B.Tech / B.E. or equivalent practical experience'],
      preferredQualifications: [],
      requiredSkills: reqArr,
      preferredSkills: prefArr,
      responsibilities: [`Deliver core technical milestones as ${cleanTitle}`],
      certifications: [],
      minimumExperience: parsedExp,
      maximumExperience: Math.max(parsedExp + 2, 4),
      minimumCGPA: parsedCgpa !== null && !Number.isNaN(parsedCgpa) ? parsedCgpa : null,
      graduationYears: [2024, 2025, 2026],
      keywords: Array.from(new Set([...reqArr, ...prefArr])),
      applicants: 0,
      shortlisted: 0,
      avgMatch: 0,
      status: 'Active',
      skills: Array.from(new Set([...reqArr, ...prefArr])),
      salaryRange: 'Competitive',
      postedAgo: 'Just now',
    };

    addJob(newJob);
    onCreated?.(newJob);
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-target-job-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0F172A] border border-[#263449] shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#263449] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B5CF6] text-[20px]">add_task</span>
            <h2 id="custom-target-job-title" className="font-heading font-bold text-base text-white">
              Add Custom Target Job Role
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close custom job modal"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[#94A3B8] block mb-1 font-medium">
                Target Job Role Title *
              </label>
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., DevOps & Kubernetes Engineer, QA Lead, AI Engineer"
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-[#94A3B8] block mb-1 font-medium">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering"
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-[#94A3B8] block mb-1 font-medium">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>

            <div>
              <label className="text-[#94A3B8] block mb-1 font-medium">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Hybrid"
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#94A3B8] block mb-1 font-medium">Min Exp (Yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-[#94A3B8] block mb-1 font-medium">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#94A3B8] block mb-1 font-medium">
                Required Skills (comma separated)
              </label>
              <input
                value={reqSkills}
                onChange={(e) => setReqSkills(e.target.value)}
                placeholder="e.g., Docker, Kubernetes, Terraform, AWS"
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#94A3B8] block mb-1 font-medium">
                Preferred Skills (comma separated, optional)
              </label>
              <input
                value={prefSkills}
                onChange={(e) => setPrefSkills(e.target.value)}
                placeholder="e.g., Prometheus, GitHub Actions, Go"
                className="w-full h-9 px-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#94A3B8] font-medium">
                  Role Notes / Job Description (optional)
                </label>
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={handleAnalyzeDescription}
                  className="text-[11px] font-semibold text-[#8B5CF6] hover:text-white cursor-pointer disabled:opacity-50"
                >
                  {analyzing ? 'Extracting...' : 'Auto-Fill Skills from Description'}
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionally paste role notes or JD text and click Auto-Fill..."
                className="w-full p-3 rounded-lg bg-[#151E32] border border-[#263449] text-white outline-none focus:border-[#8B5CF6] resize-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#263449] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#151E32] hover:bg-[#1E293B] border border-[#263449] text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] hover:opacity-95 text-white font-semibold cursor-pointer"
            >
              Save &amp; Select Target Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
