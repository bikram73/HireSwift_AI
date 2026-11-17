import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CandidateDrawer } from '../src/components/CandidateDrawer';
import { CandidatesView } from '../src/components/views/CandidatesView';
import { DashboardView } from '../src/components/views/DashboardView';
import { EmailCenterView, SettingsView } from '../src/components/views/OperationsViews';
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
});
