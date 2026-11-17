import {
  CandidateProfile,
  DuplicateStatus,
  JobPosting,
  MatchCategory,
  MatchResult,
  ScoringWeights,
} from '../data/atsData';

const SKILL_ALIASES: Record<string, string> = {
  py: 'python',
  python3: 'python',
  js: 'javascript',
  ecmascript: 'javascript',
  ts: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node.js',
  node: 'node.js',
  expressjs: 'express',
  postgres: 'postgresql',
  psql: 'postgresql',
  tailwind: 'tailwind css',
  tailwindcss: 'tailwind css',
  k8s: 'kubernetes',
  ml: 'machine learning',
  'gen ai': 'generative ai',
  genai: 'generative ai',
  'rest api': 'rest apis',
  restful: 'rest apis',
  oop: 'oop',
  'object oriented programming': 'oop',
  dsa: 'data structures',
  'data structures & algorithms': 'data structures',
  powerbi: 'power bi',
  cv: 'computer vision',
};

export function normalizeSkillName(skill: string): string {
  const cleaned = skill.trim().toLowerCase().replace(/\s+/g, ' ');
  return SKILL_ALIASES[cleaned] ?? cleaned;
}

export function getMatchCategory(score: number): MatchCategory {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Strong Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Moderate Match';
  if (score >= 40) return 'Low Match';
  return 'Poor Match';
}

export function computeExtractionConfidence(input: {
  extractedText: string;
  extractedName: string | null | undefined;
  isFilenameFallbackName?: boolean;
  email: string | null | undefined;
  degree: string | null | undefined;
  branch: string | null | undefined;
  college: string | null | undefined;
  cgpa: number | null;
  graduationYear: number | null;
  tenthPercentage?: number | null;
  twelfthPercentage?: number | null;
  skills: string[];
  reportedConfidence?: {
    name?: number;
    email?: number;
    education?: number;
    skills?: number;
  };
}): CandidateProfile['confidence'] {
  const lowerText = (input.extractedText || '').toLowerCase();
  const cleanName = (input.extractedName || '').trim();
  const validEmail =
    typeof input.email === 'string' &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input.email.trim()) &&
    !input.email.trim().endsWith('@unavailable.local');

  const nameInText =
    Boolean(cleanName) &&
    cleanName !== 'Candidate Profile' &&
    lowerText.includes(cleanName.toLowerCase());

  const computedName =
    !cleanName || cleanName === 'Candidate Profile'
      ? 0
      : nameInText
        ? 0.95
        : input.isFilenameFallbackName
          ? 0.55
          : 0.78;

  const computedEmail = !validEmail
    ? 0
    : lowerText.includes(input.email!.trim().toLowerCase())
      ? 0.99
      : 0.9;

  const schoolBoost =
    input.cgpa === null && (input.tenthPercentage != null || input.twelfthPercentage != null)
      ? 0.15
      : 0;
  const computedEducationRaw =
    (input.cgpa !== null ? 0.35 : 0) +
    (input.degree && input.degree !== 'Degree Not Listed' ? 0.25 : 0) +
    (input.college && input.college !== 'Institution Not Listed' ? 0.2 : 0) +
    (input.branch && input.branch !== 'General' ? 0.1 : 0) +
    (input.graduationYear !== null ? 0.1 : 0) +
    schoolBoost;
  const computedEducation = Number(Math.min(1, computedEducationRaw).toFixed(2));

  const skills = input.skills.filter(Boolean);
  let computedSkills = 0;
  if (skills.length > 0) {
    if (lowerText.length >= 20 && !lowerText.startsWith('[scanned pdf:')) {
      const verifiedCount = skills.filter((s) => lowerText.includes(s.toLowerCase())).length;
      const ratio = verifiedCount / skills.length;
      computedSkills = Number(
        Math.min(0.98, 0.35 + ratio * 0.45 + Math.min(skills.length, 6) * 0.03).toFixed(2)
      );
    } else {
      computedSkills = Number(Math.min(0.9, 0.4 + Math.min(skills.length, 5) * 0.1).toFixed(2));
    }
  }

  const clampReported = (val: unknown, fallback: number, hasEvidence: boolean): number => {
    if (!hasEvidence) return 0;
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0 && val <= 1) {
      return Number(val.toFixed(2));
    }
    return fallback;
  };

  return {
    name: clampReported(input.reportedConfidence?.name, computedName, Boolean(cleanName && cleanName !== 'Candidate Profile')),
    email: clampReported(input.reportedConfidence?.email, computedEmail, validEmail),
    education: clampReported(input.reportedConfidence?.education, computedEducation, computedEducation > 0),
    skills: clampReported(input.reportedConfidence?.skills, computedSkills, skills.length > 0),
  };
}

export function computeMatchResult(
  candidate: CandidateProfile,
  job: JobPosting,
  weights: ScoringWeights,
  existingAiInsights?: Partial<MatchResult>
): MatchResult {
  const candNormSkills = new Set(candidate.skills.map(normalizeSkillName));
  const reqNorm = job.requiredSkills.map((s) => ({ raw: s, norm: normalizeSkillName(s) }));
  const prefNorm = job.preferredSkills.map((s) => ({ raw: s, norm: normalizeSkillName(s) }));

  const matchedReq = reqNorm.filter((s) => candNormSkills.has(s.norm));
  const missingReq = reqNorm.filter((s) => !candNormSkills.has(s.norm)).map((s) => s.raw);
  const matchedPref = prefNorm.filter((s) => candNormSkills.has(s.norm));
  const missingPref = prefNorm.filter((s) => !candNormSkills.has(s.norm)).map((s) => s.raw);

  const matchedSkills = Array.from(
    new Set([...matchedReq.map((s) => s.raw), ...matchedPref.map((s) => s.raw)])
  );

  // 1. Technical Skills Score (0-100): 80% weight on required skills, 20% on preferred skills
  const reqRatio = reqNorm.length > 0 ? matchedReq.length / reqNorm.length : 1;
  const prefRatio = prefNorm.length > 0 ? matchedPref.length / prefNorm.length : 1;
  const skillsScore = Math.round((reqRatio * 0.8 + prefRatio * 0.2) * 100);

  // 2. Experience Score (0-100): distinguishes full-time work vs internships
  let experienceScore = 70;
  const exp = candidate.experienceYears;
  if (exp >= job.minimumExperience && exp <= job.maximumExperience + 2) {
    experienceScore = 95;
  } else if (exp > job.maximumExperience + 2) {
    experienceScore = 88;
  } else if (job.minimumExperience === 0 && candidate.internships.length > 0) {
    experienceScore = 85;
  } else if (job.minimumExperience > 0) {
    const gapRatio = Math.max(0, exp / Math.max(1, job.minimumExperience));
    experienceScore = Math.round(45 + gapRatio * 45);
  }

  // 3. Education Score (0-100): never treat missing CGPA as 0!
  let educationScore = 75;
  if (candidate.educationDetail.cgpa !== null) {
    if (job.minimumCGPA !== null) {
      if (candidate.educationDetail.cgpa >= job.minimumCGPA + 1.0) educationScore = 96;
      else if (candidate.educationDetail.cgpa >= job.minimumCGPA) educationScore = 88;
      else educationScore = 62;
    } else {
      educationScore = Math.min(95, Math.round(candidate.educationDetail.cgpa * 10));
    }
  } else {
    // Missing CGPA marked as unknown -> neutral baseline
    educationScore = 72;
  }

  // 4. Projects & Practical Work Score (0-100)
  const projText = `${candidate.projects.map((p) => `${p.name} ${p.description} ${p.technologies.join(' ')}`).join(' ')} ${candidate.highlights.join(' ')}`.toLowerCase();
  const projectOverlap = reqNorm.filter((s) => projText.includes(s.norm)).length;
  const projectsScore = Math.min(
    98,
    Math.round(
      55 +
        Math.min(25, candidate.projects.length * 12 + candidate.internships.length * 10) +
        (reqNorm.length > 0 ? (projectOverlap / reqNorm.length) * 20 : 10)
    )
  );

  // 5. Certifications Score (0-100)
  let certificationsScore = 70;
  if (job.certifications.length === 0) {
    certificationsScore = candidate.certifications.length > 0 ? 92 : 78;
  } else {
    const certText = candidate.certifications.join(' ').toLowerCase();
    const certHits = job.certifications.filter((c) => certText.includes(c.toLowerCase())).length;
    certificationsScore = certHits > 0 ? 95 : candidate.certifications.length > 0 ? 80 : 60;
  }

  // 6. Responsibilities Alignment (0-100)
  const summaryBlob = `${candidate.summary} ${candidate.highlights.join(' ')}`.toLowerCase();
  const kwHits = job.keywords.filter((k) => summaryBlob.includes(k.toLowerCase())).length;
  const responsibilitiesScore = Math.min(
    96,
    Math.round(58 + (job.keywords.length > 0 ? (kwHits / job.keywords.length) * 38 : 20))
  );

  const totalWeight =
    weights.skills +
    weights.experience +
    weights.education +
    weights.projects +
    weights.certifications +
    weights.responsibilities || 100;

  const weightedSum =
    (skillsScore * weights.skills +
      experienceScore * weights.experience +
      educationScore * weights.education +
      projectsScore * weights.projects +
      certificationsScore * weights.certifications +
      responsibilitiesScore * weights.responsibilities) /
    totalWeight;

  const overallScore = Math.max(0, Math.min(100, Math.round(weightedSum)));
  const category = getMatchCategory(overallScore);

  const transferableSkills = candidate.skills
    .filter((s) => !matchedSkills.some((m) => normalizeSkillName(m) === normalizeSkillName(s)))
    .slice(0, 4);

  const strongestAreas =
    existingAiInsights?.strongestAreas && existingAiInsights.strongestAreas.length > 0
      ? existingAiInsights.strongestAreas
      : [
          matchedReq.length > 0
            ? `Strong required skill coverage (${matchedReq.length}/${reqNorm.length}): ${matchedReq.map((m) => m.raw).join(', ')}`
            : 'Transferable engineering foundation',
          candidate.educationDetail.cgpa !== null
            ? `${candidate.education} (${candidate.educationDetail.cgpa} CGPA)`
            : `${candidate.education} (Academic score not listed)`,
          candidate.experienceYears > 0
            ? `${candidate.experienceYears} yrs professional experience`
            : candidate.internships.length > 0
              ? `${candidate.internships.length} verified internship(s)`
              : 'Practical project background',
        ];

  const potentialConcerns =
    existingAiInsights?.potentialConcerns && existingAiInsights.potentialConcerns.length > 0
      ? existingAiInsights.potentialConcerns
      : [
          ...missingReq.map((s) => `Missing required skill: ${s}`),
          ...(candidate.educationDetail.cgpa === null ? ['CGPA / academic percentage not specified on resume'] : []),
        ];

  const explanation =
    existingAiInsights?.explanation ||
    `${candidate.name} achieves a ${overallScore}% (${category}) fit for ${job.title}, matching ${matchedReq.length} of ${reqNorm.length} required skills and ${matchedPref.length} of ${prefNorm.length} preferred skills.`;

  const decisionRationale =
    existingAiInsights?.decisionRationale ||
    `Calculated deterministically from weighted scoring: Technical Skills (${skillsScore}% × ${weights.skills}%), Experience (${experienceScore}% × ${weights.experience}%), Education (${educationScore}% × ${weights.education}%), Projects (${projectsScore}% × ${weights.projects}%), Certifications (${certificationsScore}% × ${weights.certifications}%), and Responsibilities (${responsibilitiesScore}% × ${weights.responsibilities}%).`;

  return {
    candidateId: candidate.id,
    jobId: job.id,
    overallScore,
    category,
    categoryScores: {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      projects: projectsScore,
      certifications: certificationsScore,
      responsibilities: responsibilitiesScore,
    },
    requiredSkillCoverage: Math.round(reqRatio * 100),
    matchedSkills,
    missingRequiredSkills: missingReq,
    missingPreferredSkills: missingPref,
    transferableSkills,
    strongestAreas,
    potentialConcerns,
    explanation,
    decisionRationale,
    interviewQuestions:
      existingAiInsights?.interviewQuestions ?? [
        `Walk through how you applied ${matchedSkills.slice(0, 2).join(' and ') || candidate.skills.slice(0, 2).join(' and ')} in your recent projects.`,
        missingReq.length > 0
          ? `How would you ramp up on ${missingReq[0]} within your first 30 days in the ${job.title} role?`
          : `What architectural trade-offs have you made while scaling ${job.title} systems?`,
        'Tell us about a production bug or performance bottleneck you diagnosed end-to-end.',
      ],
    evaluatedAt: existingAiInsights?.evaluatedAt ?? new Date().toISOString(),
    aiEnhanced: Boolean(existingAiInsights?.aiEnhanced),
  };
}

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

export function detectDuplicates(
  candidate: {
    id?: string;
    name: string;
    email: string;
    phone: string | null;
    resumeHash: string;
    college?: string;
    skills: string[];
  },
  existing: CandidateProfile[]
): {
  status: DuplicateStatus;
  matchedCandidate?: CandidateProfile;
  reason?: string;
} {
  const normEmail = candidate.email.trim().toLowerCase();
  const normPhone = normalizePhone(candidate.phone);
  const normName = candidate.name.trim().toLowerCase();

  for (const other of existing) {
    if (candidate.id && other.id === candidate.id) continue;

    if (candidate.resumeHash && other.resumeHash && candidate.resumeHash === other.resumeHash) {
      return {
        status: 'Exact Duplicate',
        matchedCandidate: other,
        reason: 'Identical file fingerprint (SHA-256 hash match)',
      };
    }

    if (normEmail && other.email && normEmail === other.email.trim().toLowerCase()) {
      return {
        status: 'Exact Duplicate',
        matchedCandidate: other,
        reason: `Matching email address (${other.email})`,
      };
    }

    const otherPhone = normalizePhone(other.phone);
    if (normPhone && normPhone.length >= 8 && otherPhone && normPhone === otherPhone) {
      return {
        status: 'Potential Duplicate',
        matchedCandidate: other,
        reason: `Matching phone number (${other.phone})`,
      };
    }

    const otherName = other.name.trim().toLowerCase();
    const sameFirstLast =
      normName === otherName ||
      (normName.split(' ')[0] === otherName.split(' ')[0] &&
        normName.split(' ')[0].length > 3 &&
        candidate.college &&
        other.educationDetail.college &&
        candidate.college.toLowerCase() === other.educationDetail.college.toLowerCase());

    if (sameFirstLast) {
      const otherSkillSet = new Set(other.skills.map(normalizeSkillName));
      const overlap = candidate.skills.filter((s) => otherSkillSet.has(normalizeSkillName(s))).length;
      if (overlap >= 3) {
        return {
          status: 'Requires Review',
          matchedCandidate: other,
          reason: `Similar name & overlapping education/skill profile (${overlap} shared skills)`,
        };
      }
    }
  }

  return { status: 'Unique' };
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCell = (val: string | number | null | undefined) => {
    const s = val === null || val === undefined ? '' : String(val);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csvContent = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportObjectToJson(filename: string, data: unknown) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
