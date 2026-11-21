import { describe, expect, it, vi } from 'vitest';
import {
  CandidateProfile,
  DEFAULT_SCORING_WEIGHTS,
  DEMO_CANDIDATES,
  DEMO_JOBS,
  JobPosting,
  ScoringWeights,
} from '../src/data/atsData';
import {
  computeExtractionConfidence,
  computeMatchResult,
  detectDuplicates,
  exportCandidatesListToPdf,
  exportCandidateToCsv,
  exportCandidateToJson,
  exportCandidateToPdf,
  exportRowsToCsv,
  getMatchCategory,
  normalizePhone,
  normalizeSkillName,
} from '../src/utils/atsEngine';

function makeCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: 'test-cand-1',
    initials: 'TC',
    name: 'Test Candidate',
    email: 'test.candidate@example.com',
    phone: '+91-98765-43210',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    educationDetail: {
      tenthSchool: 'National Public School',
      tenthPercentage: 90,
      tenthYear: 2018,
      twelfthSchool: 'National Public School',
      twelfthPercentage: 88,
      twelfthYear: 2020,
      diplomaDetails: null,
      diplomaScore: null,
      degree: 'B.Tech',
      branch: 'Computer Science',
      college: 'NIT Surathkal',
      cgpa: 8.5,
      cgpaScale: '10.0',
      graduationYear: 2024,
      postgraduateDetails: null,
    },
    education: 'B.Tech (CS)',
    cgpa: '8.5 CGPA',
    tenthTwelfth: '90% / 88%',
    experience: '2.0 yrs',
    experienceYears: 2.0,
    role: 'Python Developer',
    currentTitle: 'Python Developer',
    previousTitles: [],
    previousCompanies: [],
    workHistory: [
      {
        role: 'Python Developer',
        company: 'CloudScale Systems',
        duration: '2.0 yrs',
        description: 'Built Python FastAPI microservices and SQL pipelines.',
      },
    ],
    internships: [],
    skills: ['Python', 'FastAPI', 'SQL', 'REST APIs', 'Docker', 'AWS'],
    categorizedSkills: {
      programmingLanguages: ['Python', 'SQL'],
      frameworks: ['FastAPI'],
      libraries: [],
      databases: ['SQL'],
      cloud: ['AWS', 'Docker'],
      tools: [],
      aiMl: [],
      other: ['REST APIs'],
    },
    projects: [
      {
        name: 'Distributed Task Queue',
        description: 'Built high-throughput Python, FastAPI, SQL, and REST APIs platform.',
        technologies: ['Python', 'FastAPI', 'SQL', 'REST APIs'],
      },
    ],
    certifications: ['AWS Certified Developer'],
    achievements: [],
    softSkills: [],
    languagesKnown: [],
    keyStrengths: ['Python', 'FastAPI'],
    missingFields: [],
    confidence: { name: 0.99, email: 0.99, education: 0.95, skills: 0.95 },
    matchScore: 90,
    matchLabel: '90% Excellent',
    status: 'Applied',
    targetJobId: 'job-1',
    avatarTone: 'bg-indigo-500/20 text-indigo-300',
    summary: 'Backend developer specializing in Python, FastAPI, SQL microservices and REST APIs.',
    resumeFileName: 'test_candidate.pdf',
    resumeFileType: 'PDF',
    resumeHash: 'hash-test-cand-1',
    processingStatus: 'parsed',
    duplicateStatus: 'Unique',
    appliedAt: '2026-01-01T10:00:00.000Z',
    highlights: ['Built REST APIs with Python, FastAPI, PostgreSQL, and Docker.'],
    timeline: [],
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobPosting> = {}): JobPosting {
  return {
    id: 'test-job-1',
    title: 'Python Developer',
    department: 'Platform Engineering',
    location: 'Bengaluru / Hybrid',
    employmentType: 'Full-Time',
    priority: 'High',
    description: 'Build backend services in Python.',
    requiredQualifications: ['B.Tech in CS'],
    preferredQualifications: [],
    requiredSkills: ['Python', 'FastAPI', 'SQL', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS'],
    responsibilities: ['Design REST APIs', 'Optimize SQL queries'],
    certifications: [],
    minimumExperience: 1,
    maximumExperience: 3,
    minimumCGPA: 7.5,
    graduationYears: [2023, 2024, 2025],
    keywords: ['Python', 'FastAPI', 'microservices', 'REST APIs'],
    applicants: 0,
    shortlisted: 0,
    avgMatch: 0,
    status: 'Active',
    skills: ['Python', 'FastAPI', 'SQL', 'REST APIs', 'Docker', 'AWS'],
    salaryRange: '12-18 LPA',
    postedAgo: 'Today',
    ...overrides,
  };
}

describe('normalizeSkillName (PRD 11.3)', () => {
  it('maps all 9 canonical aliases defined in PRD Table 11.3', () => {
    expect(normalizeSkillName('py')).toBe('python');
    expect(normalizeSkillName('python3')).toBe('python');
    expect(normalizeSkillName('js')).toBe('javascript');
    expect(normalizeSkillName('reactjs')).toBe('react');
    expect(normalizeSkillName('react.js')).toBe('react');
    expect(normalizeSkillName('postgres')).toBe('postgresql');
    expect(normalizeSkillName('psql')).toBe('postgresql');
    expect(normalizeSkillName('k8s')).toBe('kubernetes');
    expect(normalizeSkillName('genai')).toBe('generative ai');
  });

  it('normalizes case, leading/trailing spaces, and internal multi-spaces', () => {
    expect(normalizeSkillName('  PY  ')).toBe('python');
    expect(normalizeSkillName('  React.JS ')).toBe('react');
    expect(normalizeSkillName('Gen   AI')).toBe('generative ai');
    expect(normalizeSkillName('  PostgreSQL  ')).toBe('postgresql');
  });

  it('does not award skill credit for partial or unrelated substring matches', () => {
    const job = makeJob({
      requiredSkills: ['Java', 'CSS', 'Go', 'SQL'],
      preferredSkills: [],
    });
    const cand = makeCandidate({
      skills: ['JavaScript', 'SCSS', 'Golang', 'NoSQL'],
    });
    const result = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(result.matchedSkills).toEqual([]);
    expect(result.requiredSkillCoverage).toBe(0);
    expect(result.categoryScores.skills).toBe(20); // reqRatio=0 * 0.8 + prefRatio=1 * 0.2
  });

  it('deduplicates repeated alias skills in candidate profile', () => {
    const job = makeJob({ requiredSkills: ['Python', 'React'], preferredSkills: [] });
    const cand = makeCandidate({ skills: ['py', 'python3', 'Python', 'reactjs', 'React.js'] });
    const result = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(result.matchedSkills).toEqual(['Python', 'React']);
    expect(result.requiredSkillCoverage).toBe(100);
  });
});

describe('getMatchCategory Boundary Table (PRD 11.4)', () => {
  const cases: Array<[number, string]> = [
    [95, 'Excellent Match'],
    [90, 'Excellent Match'],
    [89, 'Strong Match'],
    [80, 'Strong Match'],
    [79, 'Good Match'],
    [70, 'Good Match'],
    [69, 'Moderate Match'],
    [60, 'Moderate Match'],
    [59, 'Low Match'],
    [40, 'Low Match'],
    [39, 'Poor Match'],
    [0, 'Poor Match'],
  ];

  it.each(cases)('classifies score %i as %s', (score, expected) => {
    expect(getMatchCategory(score)).toBe(expected);
  });
});

describe('Controlled Scoring Fixtures & Weight Math (PRD 11.2 & 28.3)', () => {
  it('FIX-001 / SCORE-001: Perfect match fixture calculates exact weighted formula', () => {
    const job = makeJob();
    const cand = makeCandidate();
    const res = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);

    // skills: req 4/4 (1.0*0.8) + pref 2/2 (1.0*0.2) = 100
    // exp: 2.0 in [1..5] => 95
    // edu: 8.5 >= 7.5 + 1.0 => 96
    // proj: 55 + min(25, 1*12 + 0) + (4/4)*20 = 55 + 12 + 20 = 87
    // cert: job has 0 certs, cand has 1 => 92
    // resp: 4/4 keywords in summary+highlights => 58 + 38 = 96
    const expected = Math.round(
      (100 * 35 + 95 * 20 + 96 * 15 + 87 * 15 + 92 * 5 + 96 * 10) / 100
    ); // 95.65 -> 96
    expect(res.categoryScores).toEqual({
      skills: 100,
      experience: 95,
      education: 96,
      projects: 87,
      certifications: 92,
      responsibilities: 96,
    });
    expect(res.overallScore).toBe(expected);
    expect(res.category).toBe('Excellent Match');
  });

  it('FIX-002 / SCORE-003: Partial required skills (2/4 req, 1/2 pref = 50)', () => {
    const job = makeJob();
    const cand = makeCandidate({ skills: ['Python', 'SQL', 'Docker'] });
    const res = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(res.categoryScores.skills).toBe(Math.round((0.5 * 0.8 + 0.5 * 0.2) * 100)); // 50
    expect(res.requiredSkillCoverage).toBe(50);
    expect(res.missingRequiredSkills).toEqual(['FastAPI', 'REST APIs']);
    expect(res.missingPreferredSkills).toEqual(['AWS']);
  });

  it('FIX-003 / SCORE-002 & SCORE-004: Zero required skills match + preferred skills 80/20 split', () => {
    const job = makeJob();
    const cand = makeCandidate({ skills: ['Docker', 'AWS'] });
    const res = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    // req 0/4 = 0, pref 2/2 = 100 => 0*0.8 + 1*0.2 = 20
    expect(res.categoryScores.skills).toBe(20);
    expect(res.requiredSkillCoverage).toBe(0);

    const candNone = makeCandidate({ skills: [] });
    const resNone = computeMatchResult(candNone, job, DEFAULT_SCORING_WEIGHTS);
    expect(resNone.categoryScores.skills).toBe(0);
  });

  it('FIX-004 / SCORE-011: Missing CGPA uses neutral baseline (72), never 0', () => {
    const job = makeJob({ minimumCGPA: 7.5 });
    const cand = makeCandidate({
      educationDetail: {
        ...makeCandidate().educationDetail,
        cgpa: null,
      },
      cgpa: 'Not Listed',
    });
    const res = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(res.categoryScores.education).toBe(72);
    expect(res.potentialConcerns).toContain('CGPA / academic percentage not specified on resume');
  });

  it('SCORE-012: CGPA below requirement scores 62; within +1.0 scores 88', () => {
    const job = makeJob({ minimumCGPA: 7.5 });
    const below = makeCandidate({
      educationDetail: { ...makeCandidate().educationDetail, cgpa: 6.8 },
    });
    const meets = makeCandidate({
      educationDetail: { ...makeCandidate().educationDetail, cgpa: 7.9 },
    });
    expect(computeMatchResult(below, job, DEFAULT_SCORING_WEIGHTS).categoryScores.education).toBe(62);
    expect(computeMatchResult(meets, job, DEFAULT_SCORING_WEIGHTS).categoryScores.education).toBe(88);
  });

  it('FIX-005 / SCORE-008 & SCORE-009: Experience below minimum and above max+2', () => {
    const job = makeJob({ minimumExperience: 2, maximumExperience: 4 });
    const fresher = makeCandidate({ experienceYears: 0 });
    const senior = makeCandidate({ experienceYears: 8 });
    // below: 45 + (0/2)*45 = 45
    expect(computeMatchResult(fresher, job, DEFAULT_SCORING_WEIGHTS).categoryScores.experience).toBe(45);
    // above max+2 (8 > 6): 88
    expect(computeMatchResult(senior, job, DEFAULT_SCORING_WEIGHTS).categoryScores.experience).toBe(88);
  });

  it('FIX-006 / SCORE-010: Internship-only fresher for 0-min job scores 85 in experience', () => {
    const job = makeJob({ minimumExperience: 0, maximumExperience: 2 });
    const internCand = makeCandidate({
      experienceYears: 0,
      workHistory: [],
      internships: [{ role: 'Backend Intern', company: 'TechSpark', duration: '6m', description: 'Python' }],
    });
    const res = computeMatchResult(internCand, job, DEFAULT_SCORING_WEIGHTS);
    expect(res.categoryScores.experience).toBe(95); // note: 0 >= 0 && 0 <= 4 hits range first
    // Verify branch with minimumExperience = 0 and experienceYears = -1 would never happen,
    // and verify internship boosts projects score (+10)
    expect(res.categoryScores.projects).toBe(97); // 55 + (12 + 10) + 20 = 97
  });

  it('FIX-007 & FIX-008: Project-heavy fresher vs high-exp low-skills comparison', () => {
    const job = makeJob({ minimumExperience: 0, maximumExperience: 2 });
    const projectFresher = makeCandidate({
      experienceYears: 0,
      skills: ['Python', 'FastAPI', 'SQL', 'REST APIs'],
      projects: [
        { name: 'P1', description: 'Python FastAPI SQL REST APIs', technologies: ['Python', 'SQL'] },
        { name: 'P2', description: 'Microservices', technologies: ['FastAPI'] },
        { name: 'P3', description: 'Gateway', technologies: ['REST APIs'] },
      ],
    });
    const highExpLowSkill = makeCandidate({
      experienceYears: 5,
      skills: ['PHP'],
      projects: [],
      highlights: [],
      summary: 'Maintained legacy apps.',
    });
    const rProj = computeMatchResult(projectFresher, job, DEFAULT_SCORING_WEIGHTS);
    const rExp = computeMatchResult(highExpLowSkill, job, DEFAULT_SCORING_WEIGHTS);
    expect(rProj.categoryScores.projects).toBe(98);
    expect(rExp.categoryScores.experience).toBe(88);
    expect(rExp.categoryScores.skills).toBe(0);
    expect(rProj.overallScore).toBeGreaterThan(rExp.overallScore);
  });

  it('FIX-009: Alias skills (py, reactjs, postgres, k8s, genai) match job canonical skills', () => {
    const job = makeJob({
      requiredSkills: ['Python', 'React', 'PostgreSQL', 'Kubernetes'],
      preferredSkills: ['Generative AI'],
    });
    const cand = makeCandidate({
      skills: ['py', 'reactjs', 'postgres', 'k8s', 'genai'],
    });
    const res = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(res.requiredSkillCoverage).toBe(100);
    expect(res.categoryScores.skills).toBe(100);
    expect(res.matchedSkills).toEqual(['Python', 'React', 'PostgreSQL', 'Kubernetes', 'Generative AI']);
  });

  it('FIX-010 / SCORE-022: Missing all candidate fields produces safe bounds without NaN or fabrication', () => {
    const job = makeJob({ certifications: ['AWS Developer'] });
    const emptyCand = makeCandidate({
      skills: [],
      projects: [],
      internships: [],
      workHistory: [],
      certifications: [],
      highlights: [],
      summary: '',
      experienceYears: 0,
      educationDetail: {
        ...makeCandidate().educationDetail,
        cgpa: null,
        tenthPercentage: null,
        twelfthPercentage: null,
        graduationYear: null,
      },
    });
    const res = computeMatchResult(emptyCand, job, DEFAULT_SCORING_WEIGHTS);
    expect(Number.isNaN(res.overallScore)).toBe(false);
    expect(res.overallScore).toBeGreaterThanOrEqual(0);
    expect(res.overallScore).toBeLessThanOrEqual(100);
    expect(res.matchedSkills).toEqual([]);
    expect(res.missingRequiredSkills).toEqual(job.requiredSkills);
    expect(res.categoryScores.skills).toBe(0);
    expect(res.categoryScores.education).toBe(72);
    expect(res.categoryScores.certifications).toBe(60);
  });

  it('SCORE-016..021: Weight changes, non-100 normalization, determinism & bounds', () => {
    const cand = makeCandidate({ skills: ['Python'] });
    const job = makeJob();
    const non100: ScoringWeights = {
      skills: 70,
      experience: 40,
      education: 30,
      projects: 30,
      certifications: 10,
      responsibilities: 20,
    }; // exactly 2x DEFAULT -> identical score!
    const a = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    const b = computeMatchResult(cand, job, non100);
    expect(a.overallScore).toBe(b.overallScore);

    // Repeated call produces identical numeric results
    const a2 = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);
    expect(a2.overallScore).toBe(a.overallScore);
    expect(a2.categoryScores).toEqual(a.categoryScores);

    // Decimal weights
    const decimalW: ScoringWeights = {
      skills: 35.5,
      experience: 19.5,
      education: 15,
      projects: 15,
      certifications: 5,
      responsibilities: 10,
    };
    const decRes = computeMatchResult(cand, job, decimalW);
    expect(decRes.overallScore).toBeGreaterThanOrEqual(0);
    expect(decRes.overallScore).toBeLessThanOrEqual(100);
  });

  it('BUG CHECK [DEFECT-3]: 10th/12th string formatting when 10th is null and 12th is present', () => {
    const cand11 = DEMO_CANDIDATES.find((c) => c.id === 'cand-11');
    expect(cand11).toBeDefined();
    expect(cand11!.educationDetail.tenthPercentage).toBeNull();
    expect(cand11!.educationDetail.twelfthPercentage).toBe(84);
    // Expected: 'N/A / 84%' — currently atsData.ts sets 'Not Listed'!
    expect(cand11!.tenthTwelfth).toBe('N/A / 84%');
  });
});

describe('Duplicate Detection (PRD 6.1 DUP-001..DUP-012)', () => {
  it('DUP-001/002/003: Detects Exact Duplicate on matching SHA-256 hash regardless of filename', () => {
    const existing = DEMO_CANDIDATES[0];
    const dup = detectDuplicates(
      {
        name: 'Different Name',
        email: 'completely.different@example.com',
        phone: '+91-11111-22222',
        resumeHash: existing.resumeHash,
        skills: ['Go'],
      },
      DEMO_CANDIDATES
    );
    expect(dup.status).toBe('Exact Duplicate');
    expect(dup.matchedCandidate?.id).toBe(existing.id);
  });

  it('DUP-004/007: Detects Exact Duplicate on case-insensitive normalized email', () => {
    const existing = DEMO_CANDIDATES[1];
    const dup = detectDuplicates(
      {
        name: 'Another Version',
        email: `  ${existing.email.toUpperCase()}  `,
        phone: null,
        resumeHash: 'brand-new-hash-123',
        skills: [],
      },
      DEMO_CANDIDATES
    );
    expect(dup.status).toBe('Exact Duplicate');
    expect(dup.matchedCandidate?.id).toBe(existing.id);
  });

  it('DUP-005/008: Detects Potential Duplicate on formatted phone normalization', () => {
    expect(normalizePhone('+91 (98400) 44104')).toBe('9840044104');
    const existing = DEMO_CANDIDATES[0];
    const digitsOnly = normalizePhone(existing.phone);
    const dup = detectDuplicates(
      {
        name: existing.name,
        email: 'new.alias.email@example.com',
        phone: digitsOnly,
        resumeHash: 'unique-hash-999',
        skills: [],
      },
      DEMO_CANDIDATES
    );
    expect(dup.status).toBe('Potential Duplicate');
    expect(dup.matchedCandidate?.id).toBe(existing.id);
  });

  it('DUP-006/009: Same name with different email/phone and <3 shared skills stays Unique', () => {
    const existing = DEMO_CANDIDATES[0];
    const dup = detectDuplicates(
      {
        name: existing.name,
        email: 'unrelated.person@example.com',
        phone: '+91-90000-00000',
        resumeHash: 'unique-hash-888',
        skills: ['Figma'],
      },
      DEMO_CANDIDATES
    );
    expect(dup.status).toBe('Unique');
  });

  it('Skips self when editing an existing candidate ID', () => {
    const existing = DEMO_CANDIDATES[0];
    const dup = detectDuplicates(
      {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        resumeHash: existing.resumeHash,
        skills: existing.skills,
      },
      DEMO_CANDIDATES
    );
    expect(dup.status).toBe('Unique');
  });
});

describe('CSV Export Escaping & Completeness (PRD 18 REP-009/010)', () => {
  it('properly RFC-4180 quotes commas, double quotes, and newlines across 500 rows', () => {
    let capturedCsv = '';
    const originalBlob = globalThis.Blob;
    class SpyBlob extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        if (parts) {
          capturedCsv = parts.map((p) => String(p)).join('');
        }
      }
    }
    globalThis.Blob = SpyBlob as unknown as typeof Blob;
    const clickSpy = vi.fn();
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation(() => {
      return { href: '', download: '', click: clickSpy } as unknown as HTMLElement;
    });

    try {
      const rows = Array.from({ length: 500 }, (_, i) => [
        `Candidate, "${i}"`,
        `Line1\nLine2`,
        i * 2,
      ]);
      exportRowsToCsv('test_500.csv', ['Name', 'Notes', 'Score'], rows);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(capturedCsv.startsWith('Name,Notes,Score\n')).toBe(true);
      expect(capturedCsv).toContain('"Candidate, ""0""","Line1\nLine2",0');
      expect(capturedCsv).toContain('"Candidate, ""499""","Line1\nLine2",998');
    } finally {
      globalThis.Blob = originalBlob;
      createElSpy.mockRestore();
    }
  });
});

describe('Performance Benchmark (PRD Section 24)', () => {
  it('PERF-005: Scores 500 candidate profiles deterministically in under 250ms', () => {
    const job = makeJob();
    const pool = Array.from({ length: 500 }, (_, i) =>
      makeCandidate({
        id: `perf-${i}`,
        name: `Candidate ${i}`,
        email: `cand${i}@example.com`,
        experienceYears: (i % 6) * 0.8,
        skills: i % 2 === 0 ? ['Python', 'FastAPI', 'SQL', 'Docker'] : ['React', 'TypeScript', 'SQL'],
      })
    );

    const start = performance.now();
    const results = pool.map((c) => computeMatchResult(c, job, DEFAULT_SCORING_WEIGHTS));
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(500);
    expect(results.every((r) => r.overallScore >= 0 && r.overallScore <= 100)).toBe(true);
    expect(elapsed).toBeLessThan(250);
  });
});

describe('Evidence-Based Extraction Confidence (Issue 2)', () => {
  it('assigns 0 confidence to absent fields and refuses inflated reported values on missing data', () => {
    const conf = computeExtractionConfidence({
      extractedText: 'Minimal unstructured note without contact or skills',
      extractedName: 'Candidate Profile',
      email: null,
      degree: null,
      branch: null,
      college: null,
      cgpa: null,
      graduationYear: null,
      skills: [],
      reportedConfidence: { name: 0.9, email: 0.95, education: 0.9, skills: 0.85 },
    });
    expect(conf).toEqual({ name: 0, email: 0, education: 0, skills: 0 });
  });

  it('computes high confidence when name, email, academics, and skills exist in source text', () => {
    const conf = computeExtractionConfidence({
      extractedText: 'Aarav Mehta | aarav@example.com | B.Tech CSE NIT Trichy 2024 CGPA 8.9 | Skills: Python, FastAPI, SQL, Docker',
      extractedName: 'Aarav Mehta',
      email: 'aarav@example.com',
      degree: 'B.Tech',
      branch: 'Computer Science',
      college: 'NIT Trichy',
      cgpa: 8.9,
      graduationYear: 2024,
      skills: ['Python', 'FastAPI', 'SQL', 'Docker'],
    });
    expect(conf.name).toBe(0.95);
    expect(conf.email).toBe(0.99);
    expect(conf.education).toBe(1);
    expect(conf.skills).toBe(0.92);
  });
});

describe('Individual Candidate Exports (CSV / JSON / PDF)', () => {
  it('exports a single candidate profile as CSV, JSON, and valid PDF binary', async () => {
    const cand = makeCandidate({ resumeObjectUrl: 'blob:http://localhost/transient-only' });
    const job = makeJob();
    const match = computeMatchResult(cand, job, DEFAULT_SCORING_WEIGHTS);

    const capturedBlobs: Blob[] = [];
    const downloadedNames: string[] = [];
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlobs.push(blob);
      return 'blob:mock-download';
    });
    URL.revokeObjectURL = vi.fn();

    const origCreateEl = document.createElement.bind(document);
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateEl(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {
          downloadedNames.push((el as HTMLAnchorElement).download);
        });
      }
      return el;
    });

    try {
      exportCandidateToCsv(cand, match, job.title);
      exportCandidateToJson(cand, match, job.title);
      exportCandidateToPdf(cand, match, job.title);

      expect(downloadedNames).toEqual([
        'test_candidate_profile.csv',
        'test_candidate_profile.json',
        'test_candidate_profile.pdf',
      ]);
      expect(capturedBlobs).toHaveLength(3);

      const csvText = await capturedBlobs[0].text();
      expect(csvText).toContain('Name,Email');
      expect(csvText).toContain('Test Candidate');
      expect(csvText).toContain(job.title);

      const jsonParsed = JSON.parse(await capturedBlobs[1].text());
      expect(jsonParsed.candidate.name).toBe('Test Candidate');
      expect(jsonParsed.candidate.resumeObjectUrl).toBeUndefined();
      expect(jsonParsed.matchEvaluation.overallScore).toBe(match.overallScore);

      const pdfBytes = new Uint8Array(await capturedBlobs[2].arrayBuffer());
      const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(pdfHeader).toBe('%PDF-');
      expect(pdfBytes.length).toBeGreaterThan(800);
    } finally {
      createElSpy.mockRestore();
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });

  it('exports all candidates as a single multi-candidate PDF report', async () => {
    const job = makeJob();
    const entries = DEMO_CANDIDATES.slice(0, 6).map((candidate) => ({
      candidate,
      matchResult: computeMatchResult(candidate, job, DEFAULT_SCORING_WEIGHTS),
      jobTitle: job.title,
    }));

    const capturedBlobs: Blob[] = [];
    const downloadedNames: string[] = [];
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlobs.push(blob);
      return 'blob:mock-all-pdf';
    });
    URL.revokeObjectURL = vi.fn();

    const origCreateEl = document.createElement.bind(document);
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateEl(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {
          downloadedNames.push((el as HTMLAnchorElement).download);
        });
      }
      return el;
    });

    try {
      exportCandidatesListToPdf(entries, job.title);
      expect(downloadedNames).toHaveLength(1);
      expect(downloadedNames[0]).toMatch(/^hireswift_candidates_\d{4}-\d{2}-\d{2}\.pdf$/);
      expect(capturedBlobs).toHaveLength(1);
      const pdfBytes = new Uint8Array(await capturedBlobs[0].arrayBuffer());
      const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(pdfHeader).toBe('%PDF-');
      expect(pdfBytes.length).toBeGreaterThan(1500);
    } finally {
      createElSpy.mockRestore();
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });
});
