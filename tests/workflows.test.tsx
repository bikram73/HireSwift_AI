import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CandidateDrawer } from '../src/components/CandidateDrawer';
import { LandingPage } from '../src/components/LandingPage';
import { CandidatesView } from '../src/components/views/CandidatesView';
import { DashboardView } from '../src/components/views/DashboardView';
import { EmailCenterView, HelpCenterView, SettingsView } from '../src/components/views/OperationsViews';
import { ResumeUploadView } from '../src/components/views/ResumeUploadView';
import {
  CompareCandidatesView,
  HiringPipelineView,
  JobManagementView,
} from '../src/components/views/TalentWorkflowViews';
import { AtsProvider, useAts } from '../src/context/AtsContext';
import { CandidateProfile, DEMO_CANDIDATES } from '../src/data/atsData';
import { buildRealDocxBytes } from './fixtures';

describe('UI Integration & Defect Verification (PRD Modules 4–23)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('SET-012 / ERR-008: Safely recovers when localStorage contains corrupted JSON', () => {
    localStorage.setItem('hireswift_ats_session_v2', '{corrupt-not-json');
    render(
      <AtsProvider>
        <DashboardView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );
    expect(screen.getAllByText('30').length).toBeGreaterThanOrEqual(2);
  });

  it('DASH-002..008: Dashboard counts exactly match underlying AtsContext candidate/job arrays', () => {
    const expectedTotal = DEMO_CANDIDATES.length;
    const expectedShortlisted = DEMO_CANDIDATES.filter((c) => c.status === 'Shortlisted').length;

    render(
      <AtsProvider>
        <DashboardView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    expect(screen.getAllByText(String(expectedTotal)).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(String(expectedShortlisted))).toBeInTheDocument();
  });

  it('DEFECT-1 / EXT-016 REGRESSION: Parsed resume with empty skills must NOT fabricate "Communication"', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          source: 'fallback-parser',
          parsed: {
            personal_information: { full_name: 'Neha Blank', email: 'neha.blank@example.com' },
            education: { cgpa: null, tenth_percentage: null, twelfth_percentage: 86 },
            experience: { total_years: 0, internships: [], work_history: [] },
            skills: {
              programming_languages: [],
              frameworks: [],
              libraries: [],
              databases: [],
              cloud_technologies: [],
              developer_tools: [],
              ai_ml_technologies: [],
              other_skills: [],
            },
            missing_fields: ['skills', 'cgpa'],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const docxBytes = await buildRealDocxBytes('Neha Blank neha.blank@example.com 12th: 86%');
    const file = new File(
      [new Uint8Array(docxBytes)],
      'neha_blank.docx',
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => docxBytes.buffer.slice(docxBytes.byteOffset, docxBytes.byteOffset + docxBytes.byteLength),
    });

    let capturedCandidate: CandidateProfile | undefined;
    const Inspector = () => {
      const { candidates } = useAts();
      capturedCandidate = candidates.find((c) => c.name === 'Neha Blank');
      return null;
    };

    const { container } = render(
      <AtsProvider>
        <ResumeUploadView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
        <Inspector />
      </AtsProvider>
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Start AI Resume Parsing'));

    await waitFor(() => {
      expect(capturedCandidate).toBeDefined();
    });
    expect(capturedCandidate!.skills).toEqual([]);
    expect(capturedCandidate!.tenthTwelfth).toBe('N/A / 86%');
  });

  it('DEFECT-4 / SCORE-018 / SET-003 REGRESSION: Settings prevents applying all-zero weights', () => {
    render(
      <AtsProvider>
        <SettingsView />
      </AtsProvider>
    );

    const sliders = screen.getAllByRole('slider');
    for (const s of sliders) {
      fireEvent.change(s, { target: { value: '0' } });
    }
    expect(screen.getByText('Total: 0%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Apply Scoring Weights/i }));
    expect(screen.getByText(/greater than 0/i)).toBeInTheDocument();
  });

  it('DEFECT-5 / SET-008..010 REGRESSION: Clear Session Data requires confirmation & supports cancel', () => {
    render(
      <AtsProvider>
        <SettingsView />
      </AtsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Clear Session Data/i }));
    expect(screen.getByRole('button', { name: /Confirm Clear All/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText(/30 Candidates, 6 Jobs/i)).toBeInTheDocument();
  });

  it('DEFECT-5 / JOB-014 & JOB-015 REGRESSION: Deleting a job requires confirmation & can be canceled', () => {
    render(
      <AtsProvider>
        <JobManagementView onNavigate={vi.fn()} />
      </AtsProvider>
    );

    const initialDeleteBtns = screen.getAllByTitle('Delete job');
    const initialCount = initialDeleteBtns.length;
    fireEvent.click(initialDeleteBtns[0]);
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Applicants/i).length).toBe(initialCount);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getAllByTitle('Delete job').length).toBe(initialCount);
  });

  it('DEFECT-6 / CAN-012 & CAN-007 REGRESSION: Candidates directory provides selectable page size, Name A-Z sort, & Max 12th%', () => {
    render(
      <AtsProvider>
        <CandidatesView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    const pageSizeSelect = screen.getByLabelText(/Rows per page/i);
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    expect(screen.getByText(/Showing 1–20 of 30 candidates/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Max 12th %')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Name \(A–Z\)/i })).toBeInTheDocument();
  });

  it('DEFECT-7 / MAIL REGRESSION: Email Center supports .eml draft download', () => {
    const clickSpy = vi.fn();
    const createElOrig = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = createElOrig(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    try {
      render(
        <AtsProvider>
          <EmailCenterView />
        </AtsProvider>
      );

      const emlBtn = screen.getByRole('button', { name: /Download \.eml/i });
      fireEvent.click(emlBtn);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it('FIL-001..018: Candidate filters (CGPA, Grad Year, AND/OR skills, Missing CGPA) + Reset work cleanly', () => {
    render(
      <AtsProvider>
        <CandidatesView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Min CGPA'), { target: { value: '9.2' } });
    expect(screen.getByText(/matching filters/i).textContent).not.toContain('30 matching filters');
    expect(screen.queryByText('Vikram Singh')).not.toBeInTheDocument(); // null CGPA excluded

    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    expect(screen.getByText(/30 matching filters/i)).toBeInTheDocument();
  });

  it('COMP-004: Compare Candidates enforces max 4 candidates limit', () => {
    render(
      <AtsProvider>
        <CompareCandidatesView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    expect(screen.getByText('3 / 4 Selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sneha Reddy' }));
    expect(screen.getByText('4 / 4 Selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Vikram Singh' }));
    expect(screen.getByText('4 / 4 Selected')).toBeInTheDocument();
    expect(screen.getByText(/Maximum of 4 candidates/i)).toBeInTheDocument();
  });

  it('PIPE-004..011: Hiring Pipeline schedules interview cleanly', () => {
    render(
      <AtsProvider>
        <HiringPipelineView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    const card = screen.getByText('Rahul Sharma').closest('div[draggable="true"]')!;
    const forwardBtn = within(card as HTMLElement).getByTitle(/Move to Interview/i);
    fireEvent.click(forwardBtn);

    expect(screen.getByText(/Move Rahul Sharma to Interview/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Friday 2:00 PM/i);
    fireEvent.change(input, { target: { value: 'Monday 3:00 PM Panel A' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Stage Update/i }));

    expect(screen.getByText('Monday 3:00 PM Panel A')).toBeInTheDocument();
  });

  it('PROF-001..012: CandidateDrawer displays tabs, allows edit/save, and updates profile', () => {
    const target: CandidateProfile = DEMO_CANDIDATES[0];
    render(
      <AtsProvider>
        <CandidateDrawer candidate={target} onClose={vi.fn()} />
      </AtsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Education & Exp/i }));
    expect(screen.getByText(target.educationDetail.college)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    const roleInput = screen.getByDisplayValue(target.role);
    fireEvent.change(roleInput, { target: { value: 'Staff Python Architect' } });
    fireEvent.click(screen.getByRole('button', { name: /Save & Recalculate Match/i }));
    expect(screen.getByText(/Staff Python Architect/i)).toBeInTheDocument();
  });

  it('DATA-009 / ISSUE-3: localStorage excludes raw resumeTextPreview and resumeObjectUrl', () => {
    render(
      <AtsProvider>
        <DashboardView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );
    const raw = localStorage.getItem('hireswift_ats_session_v2') || '';
    expect(raw).not.toBe('');
    expect(raw).not.toContain('"resumeTextPreview"');
    expect(raw).not.toContain('"resumeObjectUrl"');
  });

  it('SET-014 / ERR: Safely handles localStorage QuotaExceededError without crashing UI', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    render(
      <AtsProvider>
        <SettingsView />
      </AtsProvider>
    );
    expect(screen.getByText('Workspace Settings')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('LAND-FOOTER: All footer buttons, social links, and Privacy/Terms/Security modal tabs work', () => {
    const onEnterWorkspace = vi.fn();
    render(<LandingPage onEnterWorkspace={onEnterWorkspace} />);

    // Social links: GitHub + YouTube only (Twitter/X and LinkedIn removed)
    expect(screen.queryByText(/Twitter \/ X/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^LinkedIn$/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /HireSwift AI on GitHub/i })).toHaveAttribute(
      'href',
      'https://github.com/bikram73/HireSwift_AI'
    );
    expect(screen.getByRole('link', { name: /HireSwift AI on YouTube/i })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@bikramtechzzz'
    );

    // Product / Resources / Company workspace buttons
    fireEvent.click(screen.getByRole('button', { name: 'Resume Parser OCR' }));
    expect(onEnterWorkspace).toHaveBeenCalledWith('resume-upload');
    fireEvent.click(screen.getByRole('button', { name: 'API & Integrations' }));
    expect(onEnterWorkspace).toHaveBeenCalledWith('settings');
    fireEvent.click(screen.getByRole('button', { name: 'ATS Migration Guide' }));
    expect(onEnterWorkspace).toHaveBeenCalledWith('help-center');

    // Privacy Policy -> Terms -> Security modal
    fireEvent.click(screen.getByRole('button', { name: 'Privacy Policy' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Volatile Raw Resume Text/i)).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Terms of Service' }));
    expect(screen.getByText(/Transparent Scoring Responsibility/i)).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Security & Controls/i }));
    expect(screen.getByText(/Server-Side AI Key Isolation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // HelpCenter & Settings API reference destination content
    render(
      <AtsProvider>
        <HelpCenterView onNavigate={onEnterWorkspace} />
        <SettingsView />
      </AtsProvider>
    );
    expect(screen.getByText('Documentation, Migration & Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('POST /api/resumes/parse')).toBeInTheDocument();
  });

  it('CUSTOM-ROLE: ResumeUploadView allows adding Custom Target Job Role via Text Description or DOCX/PDF upload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/api/jobs/analyze')) {
        const parsedBody = JSON.parse(String(init?.body || '{}')) as { description?: string };
        return new Response(
          JSON.stringify({
            source: 'fallback-analyzer',
            analysis: {
              title: parsedBody.description?.includes('Rust')
                ? 'Senior Rust Engineer'
                : 'Cloud Platform Architect',
              requiredSkills: parsedBody.description?.includes('Rust')
                ? ['Rust', 'Tokio', 'PostgreSQL']
                : ['Kubernetes', 'Terraform', 'AWS'],
              preferredSkills: ['Docker'],
              minimumExperience: 2,
              maximumExperience: 5,
              minimumCGPA: 7.5,
              responsibilities: ['Design resilient distributed systems'],
              location: 'Remote',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('{}', { status: 404 });
    });

    render(
      <AtsProvider>
        <ResumeUploadView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    // 1) Open Custom Target Job Role modal via "Add Custom Role" button and test Text Description + AI extraction
    fireEvent.click(screen.getByRole('button', { name: /Add Custom Role/i }));
    const modal = screen.getByRole('dialog');
    expect(within(modal).getByText('Add Custom Target Job Role')).toBeInTheDocument();

    fireEvent.change(within(modal).getByPlaceholderText(/Paste job description here/i), {
      target: { value: 'Looking for a Rust developer with Tokio, PostgreSQL and Docker experience.' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: /Analyze JD with AI/i }));

    await waitFor(() => {
      expect(within(modal).getByDisplayValue('Senior Rust Engineer')).toBeInTheDocument();
    });
    expect(within(modal).getByDisplayValue('Rust, Tokio, PostgreSQL')).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('button', { name: /Publish Job/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const targetSelect = screen.getByLabelText('Target Job Role') as HTMLSelectElement;
    expect(targetSelect.selectedOptions[0].textContent).toBe('Senior Rust Engineer');

    // 2) Open via dropdown "+ Add Custom Target Job Role..." option and upload a DOCX JD file
    fireEvent.change(targetSelect, { target: { value: '__ADD_CUSTOM__' } });
    const modal2 = screen.getByRole('dialog');
    fireEvent.click(within(modal2).getByRole('button', { name: /Upload DOC \/ PDF/i }));

    const docxBytes = await buildRealDocxBytes(
      'Hiring Cloud Platform Architect with Kubernetes, Terraform, AWS and Docker expertise. Min 2 years experience.'
    );
    const jdFile = new File([new Uint8Array(docxBytes).buffer], 'Platform_Architect_JD.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const jdInput = within(modal2).getByLabelText('Upload Job Description Document');
    fireEvent.change(jdInput, { target: { files: [jdFile] } });

    await waitFor(() => {
      expect(within(modal2).getByDisplayValue('Cloud Platform Architect')).toBeInTheDocument();
    });
    expect(within(modal2).getByText(/Loaded \(DOCX\): Platform_Architect_JD\.docx/i)).toBeInTheDocument();

    fireEvent.click(within(modal2).getByRole('button', { name: /Publish Job/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(targetSelect.selectedOptions[0].textContent).toBe('Cloud Platform Architect');

    fetchSpy.mockRestore();
  });

  it('LOCALSTORAGE-DELETE: Persists candidates across reloads until user explicitly grants permission to delete individual or all candidates', async () => {
    // 1. Seed a custom uploaded candidate via localStorage / addCandidate and verify persistence across unmount/remount
    const SeedHelper = () => {
      const { addCandidate } = useAts();
      return (
        <button
          type="button"
          onClick={() =>
            addCandidate({
              ...DEMO_CANDIDATES[0],
              id: 'cand-custom-persist',
              name: 'Aarav Persisted',
              email: 'aarav.persisted@example.com',
              duplicateStatus: 'Exact Duplicate',
              duplicateOfId: DEMO_CANDIDATES[0].id,
            })
          }
        >
          Seed Custom Candidate
        </button>
      );
    };

    const { unmount } = render(
      <AtsProvider>
        <SeedHelper />
        <CandidatesView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Seed Custom Candidate' }));
    expect(screen.getByText('Aarav Persisted')).toBeInTheDocument();

    // Unmount and remount to simulate browser reload -> candidate must still be in localStorage
    unmount();

    const remount1 = render(
      <AtsProvider>
        <CandidatesView onNavigate={vi.fn()} onSelectCandidate={vi.fn()} />
      </AtsProvider>
    );
    expect(screen.getByText('Aarav Persisted')).toBeInTheDocument();

    // 2. Duplicate modal Delete Duplicate must ask permission first
    fireEvent.click(screen.getByRole('button', { name: 'Exact Duplicate' }));
    expect(screen.getByText('Duplicate Profile Review')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Duplicate' }));
    expect(screen.getByText('Permission to Delete Candidate?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getAllByText('Aarav Persisted').length).toBeGreaterThanOrEqual(1);
    // Close duplicate review modal
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.getByText('Aarav Persisted')).toBeInTheDocument();

    // 3. Individual delete asks permission; Cancel preserves candidate & localStorage; Yes deletes only that candidate
    fireEvent.click(screen.getByRole('button', { name: 'Delete Aarav Persisted' }));
    const singleDialog = screen.getByRole('dialog');
    expect(within(singleDialog).getByText('Permission to Delete Candidate?')).toBeInTheDocument();
    fireEvent.click(within(singleDialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Aarav Persisted')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Aarav Persisted' }));
    const confirmSingleDialog = screen.getByRole('dialog');
    fireEvent.click(within(confirmSingleDialog).getByRole('button', { name: 'Yes, Delete Candidate' }));
    expect(screen.queryByText('Aarav Persisted')).not.toBeInTheDocument();

    const afterSingleRaw = JSON.parse(localStorage.getItem('hireswift_ats_session_v2') || '{}');
    expect(afterSingleRaw.candidates.some((c: CandidateProfile) => c.id === 'cand-custom-persist')).toBe(false);
    expect(afterSingleRaw.candidates.length).toBe(DEMO_CANDIDATES.length);

    // 4. Delete All Candidates asks permission; Cancel keeps all; Yes deletes all candidates from localStorage
    fireEvent.click(screen.getByRole('button', { name: /Delete All Candidates/i }));
    const allDialogCancel = screen.getByRole('dialog');
    expect(within(allDialogCancel).getByText('Delete All Candidates from Local Storage?')).toBeInTheDocument();
    fireEvent.click(within(allDialogCancel).getByRole('button', { name: 'Cancel' }));
    expect(JSON.parse(localStorage.getItem('hireswift_ats_session_v2') || '{}').candidates.length).toBe(
      DEMO_CANDIDATES.length
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete All Candidates/i }));
    const allDialogConfirm = screen.getByRole('dialog');
    fireEvent.click(within(allDialogConfirm).getByRole('button', { name: 'Yes, Delete All Candidates' }));

    const afterAllRaw = JSON.parse(localStorage.getItem('hireswift_ats_session_v2') || '{}');
    expect(afterAllRaw.candidates).toEqual([]);
    expect(afterAllRaw.jobs.length).toBeGreaterThan(0); // Jobs remain intact

    // Unmount and remount again -> deleted candidates must stay deleted (not auto-reset to demo data)
    remount1.unmount();

    render(
      <AtsProvider>
        <SettingsView />
      </AtsProvider>
    );
    expect(screen.getByText(/0 Candidates, 6 Jobs/i)).toBeInTheDocument();
  });

  it('DRAWER-DELETE-PERMISSION: CandidateDrawer asks permission before deleting individual candidate', () => {
    const target: CandidateProfile = DEMO_CANDIDATES[0];
    const onClose = vi.fn();
    render(
      <AtsProvider>
        <CandidateDrawer candidate={target} onClose={onClose} />
      </AtsProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: `Delete ${target.name}` }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Permission to Delete Candidate?')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: `Delete ${target.name}` }));
    const confirmDialog = screen.getByRole('dialog');
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Yes, Delete Candidate' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(localStorage.getItem('hireswift_ats_session_v2') || '{}');
    expect(stored.candidates.some((c: CandidateProfile) => c.id === target.id)).toBe(false);
  });
});
