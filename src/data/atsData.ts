export type WorkspaceRoute =
  | 'dashboard'
  | 'candidates'
  | 'resume-upload'
  | 'job-management'
  | 'job-details'
  | 'ai-matching'
  | 'candidate-ranking'
  | 'hiring-pipeline'
  | 'compare-candidates'
  | 'skill-gap-analysis'
  | 'email-center'
  | 'reports'
  | 'settings'
  | 'help-center';

export type HiringStage = 'Applied' | 'Shortlisted' | 'Interview' | 'Offer' | 'Rejected';

export type DuplicateStatus = 'Unique' | 'Exact Duplicate' | 'Potential Duplicate' | 'Requires Review';

export type MatchCategory =
  | 'Excellent Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Low Match'
  | 'Poor Match';

export interface CandidateEducation {
  tenthSchool: string | null;
  tenthPercentage: number | null;
  tenthYear: number | null;
  twelfthSchool: string | null;
  twelfthPercentage: number | null;
  twelfthYear: number | null;
  diplomaDetails: string | null;
  diplomaScore: string | null;
  degree: string;
  branch: string;
  college: string;
  cgpa: number | null;
  cgpaScale: string;
  graduationYear: number | null;
  postgraduateDetails: string | null;
}

export interface CandidateExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface CandidateProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface CategorizedSkills {
  programmingLanguages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  cloud: string[];
  tools: string[];
  aiMl: string[];
  other: string[];
}

export interface CandidateProfile {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  remoteAvailable: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  educationDetail: CandidateEducation;
  /** Compact display label for table */
  education: string;
  cgpa: string;
  tenthTwelfth: string;
  experience: string;
  experienceYears: number;
  role: string;
  currentTitle: string | null;
  previousTitles: string[];
  previousCompanies: string[];
  workHistory: CandidateExperienceItem[];
  internships: CandidateExperienceItem[];
  skills: string[];
  categorizedSkills: CategorizedSkills;
  projects: CandidateProject[];
  certifications: string[];
  achievements: string[];
  softSkills: string[];
  languagesKnown: string[];
  keyStrengths: string[];
  missingFields: string[];
  confidence: {
    name: number;
    email: number;
    education: number;
    skills: number;
  };
  matchScore: number;
  matchLabel: string;
  status: HiringStage;
  targetJobId: string;
  avatarTone: string;
  summary: string;
  resumeFileName: string;
  resumeFileType: 'PDF' | 'DOCX';
  resumeHash: string;
  resumeObjectUrl?: string;
  resumeTextPreview?: string;
  processingStatus: 'parsed' | 'needs-review';
  duplicateStatus: DuplicateStatus;
  duplicateOfId?: string;
  notes?: string;
  interviewSchedule?: string;
  rejectionReason?: string;
  appliedAt: string;
  highlights: string[];
  timeline: { time: string; event: string; detail: string }[];
  isDemo?: boolean;
}

export interface QueuedResumeFile {
  id: string;
  docId: string;
  fileName: string;
  hashOrNote: string;
  type: 'PDF' | 'DOCX' | 'OTHER';
  size: string;
  sizeBytes: number;
  uploadProgress: number;
  parsingStatus: 'parsed' | 'processing' | 'duplicate' | 'failed' | 'waiting';
  parsingProgress?: number;
  duplicateMatch?: string;
  duplicateCandidateId?: string;
  parsedCandidateDraft?: CandidateProfile;
  errorDetail?: string;
  errorAction?: string;
  fileRef?: File;
}

export type EmploymentType =
  | 'Full-Time'
  | 'Part-Time'
  | 'Internship'
  | 'Contract'
  | 'Remote'
  | 'Hybrid'
  | 'On-Site';

export type JobStatus = 'Active' | 'Paused' | 'Closed' | 'Draft';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  priority: 'Urgent' | 'High' | 'Normal';
  description: string;
  requiredQualifications: string[];
  preferredQualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  certifications: string[];
  minimumExperience: number;
  maximumExperience: number;
  minimumCGPA: number | null;
  graduationYears: number[];
  keywords: string[];
  applicants: number;
  shortlisted: number;
  avgMatch: number;
  status: JobStatus;
  skills: string[];
  salaryRange: string;
  postedAgo: string;
}

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  projects: number;
  certifications: number;
  responsibilities: number;
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  overallScore: number;
  category: MatchCategory;
  categoryScores: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
    responsibilities: number;
  };
  requiredSkillCoverage: number;
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  transferableSkills: string[];
  strongestAreas: string[];
  potentialConcerns: string[];
  explanation: string;
  decisionRationale: string;
  interviewQuestions: string[];
  evaluatedAt: string;
  aiEnhanced: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'upload' | 'shortlist' | 'interview' | 'offer' | 'reject' | 'job' | 'edit';
  title: string;
  detail: string;
  time: string;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skills: 35,
  experience: 20,
  education: 15,
  projects: 15,
  certifications: 5,
  responsibilities: 10,
};

export const DEMO_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Python Developer',
    department: 'Platform Engineering',
    location: 'Bengaluru / Hybrid',
    employmentType: 'Hybrid',
    priority: 'Urgent',
    description:
      'Build scalable backend APIs, data services, and async task pipelines using Python, Flask/FastAPI, REST APIs, and SQL. Containerize services with Docker on AWS.',
    requiredQualifications: ['B.Tech / B.E. in Computer Science or related field'],
    preferredQualifications: ['Cloud deployment experience with AWS'],
    requiredSkills: ['Python', 'Flask', 'REST APIs', 'SQL', 'Git'],
    preferredSkills: ['Docker', 'AWS'],
    responsibilities: [
      'Design and ship reliable RESTful backend endpoints',
      'Optimize relational SQL queries and schema migrations',
      'Write automated unit and integration tests',
    ],
    certifications: ['AWS Cloud Practitioner'],
    minimumExperience: 0,
    maximumExperience: 3,
    minimumCGPA: 7.0,
    graduationYears: [2022, 2023, 2024, 2025, 2026],
    keywords: ['Python', 'Flask', 'FastAPI', 'REST APIs', 'SQL', 'Docker'],
    applicants: 8,
    shortlisted: 3,
    avgMatch: 84,
    status: 'Active',
    skills: ['Python', 'Flask', 'REST APIs', 'SQL', 'Git', 'Docker', 'AWS'],
    salaryRange: '$95k – $135k',
    postedAgo: '2d ago',
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    department: 'Core Product',
    location: 'Remote',
    employmentType: 'Remote',
    priority: 'Urgent',
    description:
      'Develop end-to-end web features across React, TypeScript, JavaScript, Node.js, and REST APIs with MongoDB and Docker.',
    requiredQualifications: ['Bachelor degree in Computer Science or equivalent'],
    preferredQualifications: ['Production TypeScript design systems'],
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST APIs'],
    preferredSkills: ['MongoDB', 'Docker'],
    responsibilities: [
      'Build responsive, accessible React + TypeScript interfaces',
      'Architect scalable Node.js APIs and service integrations',
      'Collaborate closely with product and design on rapid iterations',
    ],
    certifications: [],
    minimumExperience: 0,
    maximumExperience: 4,
    minimumCGPA: 7.0,
    graduationYears: [2021, 2022, 2023, 2024, 2025, 2026],
    keywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'MongoDB'],
    applicants: 7,
    shortlisted: 3,
    avgMatch: 82,
    status: 'Active',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST APIs', 'MongoDB', 'Docker'],
    salaryRange: '$110k – $155k',
    postedAgo: '3d ago',
  },
  {
    id: 'job-3',
    title: 'AI/ML Engineer',
    department: 'Applied AI',
    location: 'Hyderabad / Hybrid',
    employmentType: 'Hybrid',
    priority: 'High',
    description:
      'Train, evaluate, and deploy predictive ML and Generative AI pipelines with Python, Machine Learning, TensorFlow/PyTorch, NumPy, and Pandas.',
    requiredQualifications: ['B.Tech / M.Tech in AI, CS, or Data Science'],
    preferredQualifications: ['Production NLP or Computer Vision deployments'],
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas'],
    preferredSkills: ['Computer Vision', 'NLP', 'Generative AI'],
    responsibilities: [
      'Develop feature engineering and model training pipelines',
      'Evaluate retrieval and generative AI models against benchmarks',
      'Deploy optimized inference endpoints',
    ],
    certifications: ['TensorFlow Developer'],
    minimumExperience: 0,
    maximumExperience: 3,
    minimumCGPA: 7.5,
    graduationYears: [2022, 2023, 2024, 2025, 2026],
    keywords: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Generative AI'],
    applicants: 5,
    shortlisted: 2,
    avgMatch: 83,
    status: 'Active',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas', 'NLP', 'Generative AI'],
    salaryRange: '$130k – $180k',
    postedAgo: '5d ago',
  },
  {
    id: 'job-4',
    title: 'Data Analyst',
    department: 'Growth & BI',
    location: 'Mumbai / Hybrid',
    employmentType: 'Hybrid',
    priority: 'Normal',
    description:
      'Transform product and business data into actionable executive dashboards using SQL, Python, Excel, Power BI, and Data Visualization.',
    requiredQualifications: ['Degree in Statistics, Economics, CS, or Engineering'],
    preferredQualifications: ['Tableau & statistical A/B experimentation'],
    requiredSkills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization'],
    preferredSkills: ['Tableau', 'Statistics'],
    responsibilities: [
      'Build automated KPI dashboards and funnel attribution reports',
      'Perform cohort and retention analysis using SQL and Python',
      'Partner with product managers on experiment readouts',
    ],
    certifications: ['Microsoft Power BI Data Analyst'],
    minimumExperience: 0,
    maximumExperience: 3,
    minimumCGPA: 7.0,
    graduationYears: [2022, 2023, 2024, 2025, 2026],
    keywords: ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Statistics'],
    applicants: 4,
    shortlisted: 1,
    avgMatch: 80,
    status: 'Active',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization', 'Tableau', 'Statistics'],
    salaryRange: '$85k – $115k',
    postedAgo: '1w ago',
  },
  {
    id: 'job-5',
    title: 'Frontend Developer',
    department: 'Design Engineering',
    location: 'Pune / Remote',
    employmentType: 'Full-Time',
    priority: 'High',
    description:
      'Craft crisp, accessible web applications using HTML, CSS, JavaScript, React, and Responsive Design with TypeScript and Tailwind CSS.',
    requiredQualifications: ['Strong portfolio of responsive React applications'],
    preferredQualifications: ['Tailwind CSS & TypeScript proficiency'],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
    preferredSkills: ['TypeScript', 'Tailwind CSS'],
    responsibilities: [
      'Implement pixel-accurate UI components with accessible keyboard navigation',
      'Optimize bundle performance and Core Web Vitals',
      'Integrate frontend state with backend REST APIs',
    ],
    certifications: [],
    minimumExperience: 0,
    maximumExperience: 3,
    minimumCGPA: 6.5,
    graduationYears: [2022, 2023, 2024, 2025, 2026],
    keywords: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
    applicants: 4,
    shortlisted: 1,
    avgMatch: 81,
    status: 'Active',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'TypeScript', 'Tailwind CSS'],
    salaryRange: '$90k – $130k',
    postedAgo: '4d ago',
  },
  {
    id: 'job-6',
    title: 'Junior Java Developer',
    department: 'Enterprise Services',
    location: 'Kolkata / On-Site',
    employmentType: 'On-Site',
    priority: 'Normal',
    description:
      'Develop reliable backend modules in Java using OOP principles, Data Structures, SQL, REST APIs, and Spring Boot.',
    requiredQualifications: ['B.Tech / MCA / B.Sc in Computer Science or IT'],
    preferredQualifications: ['Hands-on Spring Boot microservices experience'],
    requiredSkills: ['Java', 'OOP', 'SQL', 'Data Structures', 'REST APIs'],
    preferredSkills: ['Spring Boot', 'Git'],
    responsibilities: [
      'Implement clean object-oriented backend services in Java',
      'Maintain relational database schemas and query performance',
      'Participate in code reviews and sprint delivery',
    ],
    certifications: ['Oracle Certified Java Programmer'],
    minimumExperience: 0,
    maximumExperience: 2,
    minimumCGPA: 7.0,
    graduationYears: [2023, 2024, 2025, 2026],
    keywords: ['Java', 'OOP', 'SQL', 'Data Structures', 'Spring Boot', 'Git'],
    applicants: 4,
    shortlisted: 1,
    avgMatch: 77,
    status: 'Active',
    skills: ['Java', 'OOP', 'SQL', 'Data Structures', 'REST APIs', 'Spring Boot', 'Git'],
    salaryRange: '$80k – $105k',
    postedAgo: '6d ago',
  },
];

const AVATAR_TONES = [
  'bg-indigo-500/25 text-indigo-300',
  'bg-violet-500/25 text-violet-300',
  'bg-blue-500/25 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-cyan-500/20 text-cyan-300',
];

interface SeedCandidateInput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  remoteAvailable: boolean;
  degree: string;
  branch: string;
  college: string;
  cgpa: number | null;
  tenth: number | null;
  twelfth: number | null;
  gradYear: number | null;
  expYears: number;
  role: string;
  targetJobId: string;
  skills: string[];
  certifications: string[];
  status: HiringStage;
  matchScore: number;
  fileType: 'PDF' | 'DOCX';
  summary: string;
  highlights: string[];
  internships?: CandidateExperienceItem[];
  workHistory?: CandidateExperienceItem[];
  projects?: CandidateProject[];
  duplicateStatus?: DuplicateStatus;
  duplicateOfId?: string;
  rejectionReason?: string;
  interviewSchedule?: string;
}

function buildSeedCandidate(seed: SeedCandidateInput, idx: number): CandidateProfile {
  const parts = seed.name.split(' ');
  const initials = ((parts[0]?.[0] ?? 'C') + (parts[1]?.[0] ?? '')).toUpperCase();
  const cgpaStr = seed.cgpa !== null ? `${seed.cgpa.toFixed(1)} CGPA` : 'Not Listed';
  const tenthTwelfthStr =
    seed.tenth !== null && seed.twelfth !== null
      ? `${seed.tenth}% / ${seed.twelfth}%`
      : seed.tenth !== null
        ? `${seed.tenth}% / N/A`
        : seed.twelfth !== null
          ? `N/A / ${seed.twelfth}%`
          : 'Not Listed';
  const expStr = seed.expYears === 0 ? 'Fresher (0 yrs)' : `${seed.expYears.toFixed(1)} yrs`;
  const matchLabel =
    seed.matchScore >= 90
      ? `${seed.matchScore}% Excellent`
      : seed.matchScore >= 80
        ? `${seed.matchScore}% Strong`
        : seed.matchScore >= 70
          ? `${seed.matchScore}% Good`
          : `${seed.matchScore}% Moderate`;

  const internships =
    seed.internships ??
    (seed.expYears <= 1.5
      ? [
          {
            role: `${seed.role} Intern`,
            company: 'TechSpark Labs',
            duration: '6 months',
            description: `Built production features using ${seed.skills.slice(0, 3).join(', ')}.`,
          },
        ]
      : []);

  const workHistory =
    seed.workHistory ??
    (seed.expYears > 0
      ? [
          {
            role: seed.role,
            company: idx % 2 === 0 ? 'CloudScale Systems' : 'NexaByte Technologies',
            duration: `${seed.expYears.toFixed(1)} yrs`,
            description: seed.highlights[0] || `Delivered core software modules with ${seed.skills.slice(0, 3).join(', ')}.`,
          },
        ]
      : []);

  const projects =
    seed.projects ??
    [
      {
        name: `${seed.skills[0] || 'Full Stack'} Automation Suite`,
        description: seed.highlights[0] || `End-to-end architecture built with ${seed.skills.slice(0, 3).join(', ')}.`,
        technologies: seed.skills.slice(0, 4),
      },
    ];

  const missingFields: string[] = [];
  if (seed.cgpa === null) missingFields.push('cgpa');
  if (seed.tenth === null) missingFields.push('tenthPercentage');
  if (seed.twelfth === null) missingFields.push('twelfthPercentage');
  if (!seed.phone) missingFields.push('phone');

  const baseSlug = seed.name.toLowerCase().replace(/\s+/g, '_');

  return {
    id: seed.id,
    initials,
    name: seed.name,
    email: seed.email,
    phone: seed.phone,
    location: seed.location,
    remoteAvailable: seed.remoteAvailable,
    linkedinUrl: `https://linkedin.com/in/${baseSlug.replace(/_/g, '-')}`,
    githubUrl: `https://github.com/${baseSlug}`,
    portfolioUrl: idx % 3 === 0 ? `https://${baseSlug.replace(/_/g, '')}.dev` : null,
    educationDetail: {
      tenthSchool: seed.tenth !== null ? 'National Public School' : null,
      tenthPercentage: seed.tenth,
      tenthYear: seed.gradYear ? seed.gradYear - 6 : null,
      twelfthSchool: seed.twelfth !== null ? 'Delhi Senior Secondary' : null,
      twelfthPercentage: seed.twelfth,
      twelfthYear: seed.gradYear ? seed.gradYear - 4 : null,
      diplomaDetails: null,
      diplomaScore: null,
      degree: seed.degree,
      branch: seed.branch,
      college: seed.college,
      cgpa: seed.cgpa,
      cgpaScale: '10.0',
      graduationYear: seed.gradYear,
      postgraduateDetails: seed.degree.startsWith('M.') ? `${seed.degree} (${seed.branch})` : null,
    },
    education: `${seed.degree} ${seed.branch}`,
    cgpa: cgpaStr,
    tenthTwelfth: tenthTwelfthStr,
    experience: expStr,
    experienceYears: seed.expYears,
    role: seed.role,
    currentTitle: seed.expYears > 0 ? seed.role : null,
    previousTitles: seed.expYears > 1 ? ['Software Engineer'] : [],
    previousCompanies: workHistory.map((w) => w.company),
    workHistory,
    internships,
    skills: seed.skills,
    categorizedSkills: {
      programmingLanguages: seed.skills.filter((s) =>
        ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'HTML', 'CSS', 'Go', 'C++'].includes(s)
      ),
      frameworks: seed.skills.filter((s) =>
        ['React', 'Next.js', 'Node.js', 'Flask', 'FastAPI', 'Spring Boot', 'Tailwind CSS'].includes(s)
      ),
      libraries: seed.skills.filter((s) => ['Pandas', 'NumPy', 'Redux', 'GraphQL'].includes(s)),
      databases: seed.skills.filter((s) => ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL'].includes(s)),
      cloud: seed.skills.filter((s) => ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GCP'].includes(s)),
      tools: seed.skills.filter((s) => ['Git', 'Figma', 'Power BI', 'Tableau', 'Excel'].includes(s)),
      aiMl: seed.skills.filter((s) =>
        ['PyTorch', 'TensorFlow', 'Machine Learning', 'NLP', 'Generative AI', 'Computer Vision', 'LLMs'].includes(s)
      ),
      other: seed.skills.filter((s) => ['REST APIs', 'OOP', 'Data Structures', 'Responsive Design', 'Data Visualization', 'Statistics'].includes(s)),
    },
    projects,
    certifications: seed.certifications,
    achievements: ['Top 5% departmental academic rank', 'Published technical architecture notes'],
    softSkills: ['Technical Ownership', 'Cross-functional Communication', 'Agile Collaboration'],
    languagesKnown: ['English', 'Hindi'],
    keyStrengths: seed.skills.slice(0, 3),
    missingFields,
    confidence: {
      name: seed.name ? 0.99 : 0,
      email: seed.email ? 0.99 : 0,
      education: Number(
        Math.min(
          1,
          (seed.cgpa !== null ? 0.35 : 0) +
            (seed.degree ? 0.25 : 0) +
            (seed.college ? 0.2 : 0) +
            (seed.branch ? 0.1 : 0) +
            (seed.gradYear ? 0.1 : 0)
        ).toFixed(2)
      ),
      skills:
        seed.skills.length > 0
          ? Number(Math.min(0.98, 0.45 + Math.min(seed.skills.length, 8) * 0.065).toFixed(2))
          : 0,
    },
    matchScore: seed.matchScore,
    matchLabel,
    status: seed.status,
    targetJobId: seed.targetJobId,
    avatarTone: AVATAR_TONES[idx % AVATAR_TONES.length],
    summary: seed.summary,
    resumeFileName: `${seed.name.replace(/\s+/g, '_')}_Resume.${seed.fileType.toLowerCase()}`,
    resumeFileType: seed.fileType,
    resumeHash: `hash-${seed.id}-${seed.name.length * 17}`,
    resumeTextPreview: `${seed.name}\n${seed.email} | ${seed.location}\nEducation: ${seed.degree} in ${seed.branch}, ${seed.college} (${cgpaStr})\nSkills: ${seed.skills.join(', ')}\nSummary: ${seed.summary}`,
    processingStatus: 'parsed',
    duplicateStatus: seed.duplicateStatus ?? 'Unique',
    duplicateOfId: seed.duplicateOfId,
    interviewSchedule: seed.interviewSchedule,
    rejectionReason: seed.rejectionReason,
    appliedAt: `2026-11-${String(Math.max(1, 15 - (idx % 14))).padStart(2, '0')}T10:30:00Z`,
    highlights: seed.highlights,
    timeline: [
      {
        time: `${(idx % 9) + 1}h ago`,
        event: 'Resume Parsed',
        detail: `${seed.name.replace(/\s+/g, '_')}_Resume.${seed.fileType.toLowerCase()} extracted cleanly`,
      },
      {
        time: `${(idx % 6) + 1}h ago`,
        event: 'AI Match Evaluated',
        detail: `${seed.matchScore}% suitability calculated for target requisition`,
      },
    ],
    isDemo: true,
  };
}

const RAW_SEEDS: SeedCandidateInput[] = [
  {
    id: 'cand-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91-98100-11201',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'RV College of Engineering',
    cgpa: 8.8,
    tenth: 92,
    twelfth: 90,
    gradYear: 2023,
    expYears: 2.0,
    role: 'Python Developer',
    targetJobId: 'job-1',
    skills: ['Python', 'Flask', 'REST APIs', 'SQL', 'Git', 'Docker', 'AWS'],
    certifications: ['AWS Cloud Practitioner'],
    status: 'Shortlisted',
    matchScore: 95,
    fileType: 'PDF',
    summary: 'Backend developer specializing in Python, Flask REST APIs, PostgreSQL optimization, and Docker deployments on AWS.',
    highlights: [
      'Reduced API response time by 46% across billing microservices.',
      'Built automated Flask + SQL pipeline handling 120k daily requests.',
    ],
  },
  {
    id: 'cand-2',
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    phone: '+91-98200-22102',
    location: 'Pune, IN',
    remoteAvailable: true,
    degree: 'M.Tech',
    branch: 'CS',
    college: 'COEP Technological University',
    cgpa: 9.1,
    tenth: 94,
    twelfth: 93,
    gradYear: 2022,
    expYears: 3.0,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'REST APIs', 'MongoDB', 'Docker'],
    certifications: ['Meta Front-End Developer'],
    status: 'Interview',
    interviewSchedule: 'Tomorrow • 11:00 AM IST (Technical Round 1)',
    matchScore: 94,
    fileType: 'PDF',
    summary: 'Full Stack Engineer building scalable React + TypeScript interfaces and Node.js REST services backed by MongoDB.',
    highlights: [
      'Led frontend platform rewrite serving 2.4M monthly enterprise users.',
      'Containerized Node.js + MongoDB backend cutting deploy times by 55%.',
    ],
  },
  {
    id: 'cand-3',
    name: 'Arjun Kumar',
    email: 'arjun.k@example.com',
    phone: '+91-98300-33103',
    location: 'Hyderabad, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'AI',
    college: 'IIIT Hyderabad',
    cgpa: 8.6,
    tenth: 89,
    twelfth: 88,
    gradYear: 2024,
    expYears: 1.5,
    role: 'AI/ML Engineer',
    targetJobId: 'job-3',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas', 'NLP', 'Generative AI'],
    certifications: ['TensorFlow Developer'],
    status: 'Shortlisted',
    matchScore: 93,
    fileType: 'DOCX',
    summary: 'Applied ML Engineer experienced in TensorFlow, NLP retrieval models, and Generative AI evaluation workflows.',
    highlights: [
      'Fine-tuned domain embedding models improving semantic recall by 19%.',
      'Built TensorFlow + Pandas feature store processing 5M records daily.',
    ],
  },
  {
    id: 'cand-4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '+91-98400-44104',
    location: 'Mumbai, IN',
    remoteAvailable: false,
    degree: 'B.Sc',
    branch: 'Stats',
    college: 'St. Xavier’s College Mumbai',
    cgpa: 8.2,
    tenth: 88,
    twelfth: 86,
    gradYear: 2023,
    expYears: 2.0,
    role: 'Data Analyst',
    targetJobId: 'job-4',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization', 'Tableau', 'Statistics'],
    certifications: ['Microsoft Power BI Data Analyst'],
    status: 'Shortlisted',
    matchScore: 92,
    fileType: 'PDF',
    summary: 'Data Analyst skilled in SQL modeling, cohort retention analysis, Power BI, Tableau, and executive BI dashboards.',
    highlights: [
      'Automated weekly funnel attribution models saving 12 analyst hours/week.',
      'Built churn early-warning scorecard deployed across Customer Success.',
    ],
  },
  {
    id: 'cand-5',
    name: 'Karan Patel',
    email: 'karan.p@example.com',
    phone: '+91-98500-55105',
    location: 'Delhi, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'IT',
    college: 'NSUT Delhi',
    cgpa: 7.9,
    tenth: 84,
    twelfth: 82,
    gradYear: 2024,
    expYears: 1.5,
    role: 'Frontend Developer',
    targetJobId: 'job-5',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'TypeScript', 'Tailwind CSS'],
    certifications: [],
    status: 'Interview',
    interviewSchedule: 'Friday • 3:30 PM IST (UI Architecture)',
    matchScore: 91,
    fileType: 'PDF',
    summary: 'UI-focused Frontend Developer crafting accessible SaaS dashboards with React, TypeScript, and Tailwind CSS.',
    highlights: [
      'Delivered WCAG AA compliant component library used across 4 product squads.',
      'Improved Core Web Vitals LCP from 3.4s to 1.2s.',
    ],
  },
  {
    id: 'cand-6',
    name: 'Ananya Das',
    email: 'ananya.das@example.com',
    phone: '+91-98600-66106',
    location: 'Kolkata, IN',
    remoteAvailable: false,
    degree: 'MCA',
    branch: 'CS',
    college: 'Jadavpur University',
    cgpa: 8.3,
    tenth: 86,
    twelfth: 84,
    gradYear: 2023,
    expYears: 1.8,
    role: 'Junior Java Developer',
    targetJobId: 'job-6',
    skills: ['Java', 'OOP', 'SQL', 'Data Structures', 'REST APIs', 'Spring Boot', 'Git'],
    certifications: ['Oracle Certified Java Programmer'],
    status: 'Offer',
    matchScore: 92,
    fileType: 'PDF',
    summary: 'Java & Spring Boot developer experienced in object-oriented microservices, SQL tuning, and REST APIs.',
    highlights: [
      'Built idempotent payment reconciliation service handling 80k tx/day.',
      'Migrated legacy SOAP integrations to RESTful Spring Boot services.',
    ],
  },
  {
    id: 'cand-7',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+1-415-555-0142',
    location: 'San Francisco, US',
    remoteAvailable: true,
    degree: 'M.S.',
    branch: 'CS',
    college: 'Stanford University',
    cgpa: 9.4,
    tenth: 96,
    twelfth: 95,
    gradYear: 2020,
    expYears: 5.5,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'REST APIs', 'Python', 'AWS', 'Docker'],
    certifications: ['AWS Solutions Architect'],
    status: 'Interview',
    interviewSchedule: 'Thursday • 10:00 AM PST (System Design)',
    matchScore: 94,
    fileType: 'PDF',
    summary: 'Senior software engineer who has directed 3 microservice transformations at scale while leading React and Node.js teams.',
    highlights: [
      'Directed 3 microservice transformations reducing p95 latency by 42%.',
      'Verified production Kubernetes, AWS ECS, and React/Python ownership.',
    ],
  },
  {
    id: 'cand-8',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1-512-555-0198',
    location: 'Austin, US',
    remoteAvailable: true,
    degree: 'M.S.',
    branch: 'Data Science',
    college: 'UT Austin',
    cgpa: 9.0,
    tenth: 92,
    twelfth: 91,
    gradYear: 2021,
    expYears: 4.0,
    role: 'AI/ML Engineer',
    targetJobId: 'job-3',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NumPy', 'Pandas', 'SQL'],
    certifications: ['AWS Machine Learning Specialty'],
    status: 'Offer',
    matchScore: 92,
    fileType: 'PDF',
    summary: 'Applied ML scientist specializing in ranking models, TensorFlow pipelines, and feature stores.',
    highlights: [
      'Increased search conversion by 11.4% via multi-stage ranker.',
      'Built real-time feature pipelines using Python and SQL.',
    ],
  },
  {
    id: 'cand-9',
    name: 'Meera Nair',
    email: 'meera.nair@example.com',
    phone: '+91-98711-22009',
    location: 'Kochi, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'CUSAT',
    cgpa: 8.7,
    tenth: 91,
    twelfth: 89,
    gradYear: 2025,
    expYears: 0,
    role: 'Python Developer',
    targetJobId: 'job-1',
    skills: ['Python', 'Flask', 'REST APIs', 'SQL', 'Git'],
    certifications: ['Python for Everybody'],
    status: 'Applied',
    matchScore: 84,
    fileType: 'PDF',
    summary: '2025 Computer Science fresher with two backend internships building Flask REST APIs and PostgreSQL schemas.',
    highlights: [
      'Built student placement portal using Flask, SQL, and Git.',
      'Completed 6-month Python backend internship at FinGrid.',
    ],
    workHistory: [],
  },
  {
    id: 'cand-10',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91-98711-22010',
    location: 'Ahmedabad, IN',
    remoteAvailable: true,
    degree: 'B.E.',
    branch: 'IT',
    college: 'LD College of Engineering',
    cgpa: 7.8,
    tenth: 85,
    twelfth: 82,
    gradYear: 2024,
    expYears: 1.0,
    role: 'Python Developer',
    targetJobId: 'job-1',
    skills: ['Python', 'Django', 'SQL', 'Git', 'Docker'],
    certifications: [],
    status: 'Applied',
    matchScore: 79,
    fileType: 'DOCX',
    summary: 'Backend developer transitioning from Django to Flask APIs with strong SQL and Docker fundamentals.',
    highlights: ['Automated ETL jobs in Python reducing manual reporting by 6 hours weekly.'],
  },
  {
    id: 'cand-11',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91-98711-22011',
    location: 'Jaipur, IN',
    remoteAvailable: false,
    degree: 'B.Tech',
    branch: 'ECE',
    college: 'MNIT Jaipur',
    cgpa: null,
    tenth: null,
    twelfth: 84,
    gradYear: 2024,
    expYears: 1.2,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'HTML', 'CSS'],
    certifications: [],
    status: 'Applied',
    matchScore: 75,
    fileType: 'PDF',
    summary: 'MERN stack developer experienced in React SPAs and Node.js API development. Academic CGPA not listed on resume.',
    highlights: ['Built real-time inventory dashboard with React and MongoDB.'],
  },
  {
    id: 'cand-12',
    name: 'Ishita Banerjee',
    email: 'ishita.b@example.com',
    phone: '+91-98711-22012',
    location: 'Kolkata, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'Heritage Institute of Technology',
    cgpa: 8.9,
    tenth: 93,
    twelfth: 92,
    gradYear: 2025,
    expYears: 0,
    role: 'Frontend Developer',
    targetJobId: 'job-5',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'Tailwind CSS'],
    certifications: ['Responsive Web Design'],
    status: 'Shortlisted',
    matchScore: 86,
    fileType: 'PDF',
    summary: '2025 Computer Science fresher specializing in responsive React UI systems and Tailwind CSS.',
    highlights: ['Won Smart India Hackathon frontend track with accessible React app.'],
    workHistory: [],
  },
  {
    id: 'cand-13',
    name: 'Aditya Joshi',
    email: 'aditya.joshi@example.com',
    phone: '+91-98711-22013',
    location: 'Pune, IN',
    remoteAvailable: true,
    degree: 'B.E.',
    branch: 'CS',
    college: 'MIT WPU Pune',
    cgpa: 8.4,
    tenth: 89,
    twelfth: 87,
    gradYear: 2023,
    expYears: 2.2,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'REST APIs', 'PostgreSQL'],
    certifications: [],
    status: 'Shortlisted',
    matchScore: 88,
    fileType: 'DOCX',
    summary: 'Full Stack TypeScript engineer building B2B SaaS portals with React and Node.js.',
    highlights: ['Shipped role-based analytics workflow serving 400+ SMB customers.'],
  },
  {
    id: 'cand-14',
    name: 'Neha Kulkarni',
    email: 'neha.k@example.com',
    phone: '+91-98711-22014',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    degree: 'M.Tech',
    branch: 'AI & Data',
    college: 'PES University',
    cgpa: 9.2,
    tenth: 95,
    twelfth: 92,
    gradYear: 2024,
    expYears: 1.0,
    role: 'AI/ML Engineer',
    targetJobId: 'job-3',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas', 'Computer Vision'],
    certifications: ['Deep Learning Specialization'],
    status: 'Interview',
    interviewSchedule: 'Monday • 2:00 PM IST (ML Modeling)',
    matchScore: 90,
    fileType: 'PDF',
    summary: 'Computer Vision and Machine Learning engineer with research publications in medical imaging.',
    highlights: ['Trained CNN segmentation pipeline achieving 94.2% F1 score.'],
  },
  {
    id: 'cand-15',
    name: 'Siddharth Rao',
    email: 'siddharth.rao@example.com',
    phone: '+91-98711-22015',
    location: 'Hyderabad, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'VNR VJIET',
    cgpa: 7.4,
    tenth: 82,
    twelfth: 80,
    gradYear: 2024,
    expYears: 0.8,
    role: 'Junior Java Developer',
    targetJobId: 'job-6',
    skills: ['Java', 'OOP', 'SQL', 'Data Structures', 'Git'],
    certifications: [],
    status: 'Applied',
    matchScore: 78,
    fileType: 'PDF',
    summary: 'Java developer with solid OOP, Data Structures, and SQL foundations.',
    highlights: ['Developed inventory tracking module in Java & MySQL during internship.'],
  },
  {
    id: 'cand-16',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@example.com',
    phone: '+91-98711-22016',
    location: 'Chennai, IN',
    remoteAvailable: true,
    degree: 'B.Sc',
    branch: 'Mathematics',
    college: 'Loyola College',
    cgpa: 8.5,
    tenth: 90,
    twelfth: 91,
    gradYear: 2024,
    expYears: 1.0,
    role: 'Data Analyst',
    targetJobId: 'job-4',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization', 'Statistics'],
    certifications: ['Google Data Analytics'],
    status: 'Applied',
    matchScore: 85,
    fileType: 'DOCX',
    summary: 'Quantitative Data Analyst building Power BI executive scorecards and SQL reporting views.',
    highlights: ['Reduced monthly finance reconciliation time by 40% via Power BI & SQL.'],
  },
  {
    id: 'cand-17',
    name: 'Devansh Kapoor',
    email: 'devansh.kapoor@example.com',
    phone: '+91-98711-22017',
    location: 'Gurugram, IN',
    remoteAvailable: true,
    degree: 'BCA',
    branch: 'Computer Applications',
    college: 'GGSIPU',
    cgpa: 7.6,
    tenth: 79,
    twelfth: 81,
    gradYear: 2025,
    expYears: 0,
    role: 'Frontend Developer',
    targetJobId: 'job-5',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
    certifications: [],
    status: 'Applied',
    matchScore: 76,
    fileType: 'PDF',
    summary: 'Frontend fresher focused on interactive React dashboards and responsive layouts.',
    highlights: ['Created 5 open-source responsive landing page templates in React.'],
    workHistory: [],
  },
  {
    id: 'cand-18',
    name: 'Tanvi Deshmukh',
    email: 'tanvi.d@example.com',
    phone: '+91-98711-22018',
    location: 'Nagpur, IN',
    remoteAvailable: true,
    degree: 'B.E.',
    branch: 'CS',
    college: 'VNIT Nagpur',
    cgpa: 8.9,
    tenth: 93,
    twelfth: 90,
    gradYear: 2023,
    expYears: 2.0,
    role: 'Python Developer',
    targetJobId: 'job-1',
    skills: ['Python', 'Flask', 'FastAPI', 'REST APIs', 'SQL', 'Git', 'Docker'],
    certifications: [],
    status: 'Shortlisted',
    matchScore: 91,
    fileType: 'PDF',
    summary: 'Python backend specialist building containerized Flask & FastAPI APIs.',
    highlights: ['Engineered async webhook dispatcher handling 50k events/hour.'],
  },
  {
    id: 'cand-19',
    name: 'Kabir Malhotra',
    email: 'kabir.m@example.com',
    phone: '+91-98711-22019',
    location: 'Chandigarh, IN',
    remoteAvailable: false,
    degree: 'B.Tech',
    branch: 'Mechanical',
    college: 'PEC Chandigarh',
    cgpa: 7.2,
    tenth: 81,
    twelfth: 78,
    gradYear: 2022,
    expYears: 1.5,
    role: 'Data Analyst',
    targetJobId: 'job-4',
    skills: ['Excel', 'SQL', 'Power BI'],
    certifications: [],
    status: 'Rejected',
    rejectionReason: 'Missing Python and statistical experimentation background for target BI scope.',
    matchScore: 61,
    fileType: 'DOCX',
    summary: 'Operations analyst working primarily with Excel and SQL reporting.',
    highlights: ['Maintained weekly supply-chain KPI trackers in Excel & Power BI.'],
  },
  {
    id: 'cand-20',
    name: 'Riya Chatterjee',
    email: 'riya.c@example.com',
    phone: '+91-98711-22020',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'BMS College of Engineering',
    cgpa: 8.4,
    tenth: 91,
    twelfth: 89,
    gradYear: 2024,
    expYears: 1.0,
    role: 'AI/ML Engineer',
    targetJobId: 'job-3',
    skills: ['Python', 'Machine Learning', 'NumPy', 'Pandas', 'NLP', 'Generative AI'],
    certifications: [],
    status: 'Applied',
    matchScore: 81,
    fileType: 'PDF',
    summary: 'ML engineer developing RAG chatbots and NLP classification workflows in Python.',
    highlights: ['Built document QA prototype using vector search and generative AI.'],
  },
  {
    id: 'cand-21',
    name: 'Manish Tiwari',
    email: 'manish.t@example.com',
    phone: '+91-98711-22021',
    location: 'Lucknow, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'IT',
    college: 'IET Lucknow',
    cgpa: 7.1,
    tenth: 77,
    twelfth: 75,
    gradYear: 2024,
    expYears: 0.5,
    role: 'Junior Java Developer',
    targetJobId: 'job-6',
    skills: ['Java', 'OOP', 'Data Structures', 'SQL'],
    certifications: [],
    status: 'Rejected',
    rejectionReason: 'Lacks REST APIs and Spring Boot project depth compared to shortlist cohort.',
    matchScore: 63,
    fileType: 'PDF',
    summary: 'Entry-level Java programmer practicing data structures and core SQL.',
    highlights: ['Solved 350+ algorithmic coding problems in Java.'],
  },
  {
    id: 'cand-22',
    name: 'Aarav Gupta',
    email: 'aarav.g@example.com',
    phone: '+91-98711-22022',
    location: 'Noida, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'JIIT Noida',
    cgpa: 8.1,
    tenth: 88,
    twelfth: 87,
    gradYear: 2023,
    expYears: 2.5,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST APIs', 'Docker'],
    certifications: [],
    status: 'Shortlisted',
    matchScore: 89,
    fileType: 'PDF',
    summary: 'Full stack developer experienced with React, TypeScript, Node.js, and Docker Compose.',
    highlights: ['Built multi-tenant CRM workspace with TypeScript and Node.js.'],
  },
  {
    id: 'cand-23',
    name: 'Shruti Menon',
    email: 'shruti.menon@example.com',
    phone: '+91-98711-22023',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    degree: 'M.S.',
    branch: 'Data Analytics',
    college: 'Christ University',
    cgpa: 8.9,
    tenth: 92,
    twelfth: 90,
    gradYear: 2024,
    expYears: 1.5,
    role: 'Data Analyst',
    targetJobId: 'job-4',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Statistics', 'Data Visualization'],
    certifications: ['Tableau Desktop Specialist'],
    status: 'Interview',
    interviewSchedule: 'Wednesday • 4:00 PM IST (Case Study)',
    matchScore: 91,
    fileType: 'PDF',
    summary: 'Analytics specialist merging SQL warehousing with Tableau and Power BI storytelling.',
    highlights: ['Designed A/B experimentation dashboard driving 8% checkout uplift.'],
  },
  {
    id: 'cand-24',
    name: 'Nikhil Verma',
    email: 'nikhil.v@example.com',
    phone: '+91-98711-22024',
    location: 'Indore, IN',
    remoteAvailable: true,
    degree: 'B.E.',
    branch: 'CS',
    college: 'SGSITS Indore',
    cgpa: null,
    tenth: null,
    twelfth: null,
    gradYear: 2022,
    expYears: 3.2,
    role: 'Python Developer',
    targetJobId: 'job-1',
    skills: ['Python', 'Flask', 'REST APIs', 'SQL', 'Git', 'AWS'],
    certifications: ['AWS Developer Associate'],
    status: 'Applied',
    matchScore: 86,
    fileType: 'DOCX',
    summary: 'Experienced Python backend engineer; academic percentages omitted from resume.',
    highlights: ['Scaled AWS Lambda + Flask data ingestion services to 1M events/day.'],
  },
  {
    id: 'cand-25',
    name: 'Divya Krishnan',
    email: 'divya.k@example.com',
    phone: '+91-98711-22025',
    location: 'Chennai, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'IT',
    college: 'SSN College of Engineering',
    cgpa: 9.0,
    tenth: 94,
    twelfth: 93,
    gradYear: 2025,
    expYears: 0,
    role: 'Frontend Developer',
    targetJobId: 'job-5',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS', 'Responsive Design'],
    certifications: [],
    status: 'Applied',
    matchScore: 88,
    fileType: 'PDF',
    summary: '2025 grad with internship experience building TypeScript + Tailwind CSS component libraries.',
    highlights: ['Built accessible design system during 6-month frontend internship.'],
    workHistory: [],
  },
  {
    id: 'cand-26',
    name: 'Pranav Kulkarni',
    email: 'pranav.k@example.com',
    phone: '+91-98711-22026',
    location: 'Pune, IN',
    remoteAvailable: false,
    degree: 'B.E.',
    branch: 'CS',
    college: 'PICT Pune',
    cgpa: 8.6,
    tenth: 91,
    twelfth: 89,
    gradYear: 2024,
    expYears: 1.0,
    role: 'Junior Java Developer',
    targetJobId: 'job-6',
    skills: ['Java', 'OOP', 'SQL', 'Data Structures', 'REST APIs', 'Spring Boot', 'Git'],
    certifications: [],
    status: 'Shortlisted',
    matchScore: 89,
    fileType: 'PDF',
    summary: 'Java & Spring Boot engineer focused on clean REST API design and PostgreSQL queries.',
    highlights: ['Developed Spring Boot microservices with JWT auth and JUnit coverage.'],
  },
  {
    id: 'cand-27',
    name: 'Zoya Khan',
    email: 'zoya.khan@example.com',
    phone: '+91-98711-22027',
    location: 'Mumbai, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'CS',
    college: 'DJ Sanghvi College',
    cgpa: 8.3,
    tenth: 89,
    twelfth: 88,
    gradYear: 2023,
    expYears: 2.0,
    role: 'Full Stack Developer',
    targetJobId: 'job-2',
    skills: ['React', 'JavaScript', 'Node.js', 'REST APIs', 'MongoDB'],
    certifications: [],
    status: 'Applied',
    matchScore: 83,
    fileType: 'DOCX',
    summary: 'Full stack JavaScript developer shipping customer-facing SaaS dashboards.',
    highlights: ['Delivered checkout flow redesign increasing conversion by 9%.'],
  },
  {
    id: 'cand-28',
    name: 'Harshvardhan Jain',
    email: 'harsh.jain@example.com',
    phone: '+91-98711-22028',
    location: 'Bengaluru, IN',
    remoteAvailable: true,
    degree: 'B.Tech',
    branch: 'AI & ML',
    college: 'RV College of Engineering',
    cgpa: 8.8,
    tenth: 92,
    twelfth: 90,
    gradYear: 2026,
    expYears: 0,
    role: 'AI/ML Engineer',
    targetJobId: 'job-3',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas', 'Computer Vision'],
    certifications: ['NVIDIA Deep Learning'],
    status: 'Applied',
    matchScore: 82,
    fileType: 'PDF',
    summary: 'Final-year AI/ML student with Kaggle medal and computer vision research internship.',
    highlights: ['Published defect-detection vision pipeline achieving 96% precision.'],
    workHistory: [],
  },
  {
    id: 'cand-29',
    name: 'Sneha R.',
    email: 'sneha.reddy.alt@example.com',
    phone: '+91-98400-44104',
    location: 'Mumbai, IN',
    remoteAvailable: false,
    degree: 'B.Sc',
    branch: 'Stats',
    college: 'St. Xavier’s College Mumbai',
    cgpa: 8.2,
    tenth: 88,
    twelfth: 86,
    gradYear: 2023,
    expYears: 2.0,
    role: 'Data Analyst',
    targetJobId: 'job-4',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization'],
    certifications: [],
    status: 'Applied',
    matchScore: 80,
    fileType: 'PDF',
    summary: 'Secondary submission matching Sneha Reddy phone number and academic profile.',
    highlights: ['Built retention scorecard and weekly BI metrics.'],
    duplicateStatus: 'Potential Duplicate',
    duplicateOfId: 'cand-4',
  },
  {
    id: 'cand-30',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '+1-212-555-0167',
    location: 'New York, US',
    remoteAvailable: true,
    degree: 'B.S.',
    branch: 'HCI & CS',
    college: 'NYU',
    cgpa: 8.9,
    tenth: 91,
    twelfth: 90,
    gradYear: 2021,
    expYears: 3.5,
    role: 'Frontend Developer',
    targetJobId: 'job-5',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'TypeScript', 'Tailwind CSS', 'Figma'],
    certifications: [],
    status: 'Shortlisted',
    matchScore: 92,
    fileType: 'PDF',
    summary: 'Design Engineer bridging Figma design systems with TypeScript, React, and Tailwind CSS.',
    highlights: ['Authored token-driven design system adopted by 14 product teams.'],
  },
];

export const DEMO_CANDIDATES: CandidateProfile[] = RAW_SEEDS.map((s, idx) => buildSeedCandidate(s, idx));

export const INITIAL_QUEUE_FILES: QueuedResumeFile[] = [
  {
    id: 'q-1',
    docId: '#DOC-8921',
    fileName: 'Rahul_Sharma_Resume.pdf',
    hashOrNote: 'Uploaded • Profile Ready',
    type: 'PDF',
    size: '1.8 MB',
    sizeBytes: 1887436,
    uploadProgress: 100,
    parsingStatus: 'parsed',
  },
  {
    id: 'q-2',
    docId: '#DOC-8922',
    fileName: 'Priya_Verma_Senior_FullStack.pdf',
    hashOrNote: 'Uploaded • Profile Ready',
    type: 'PDF',
    size: '2.4 MB',
    sizeBytes: 2516582,
    uploadProgress: 100,
    parsingStatus: 'parsed',
  },
  {
    id: 'q-3',
    docId: '#DOC-8924',
    fileName: 'Sneha_Reddy_Analyst.pdf',
    hashOrNote: 'Matches existing Sneha Reddy profile',
    type: 'PDF',
    size: '1.2 MB',
    sizeBytes: 1258291,
    uploadProgress: 100,
    parsingStatus: 'duplicate',
    duplicateMatch: 'Matches Sneha Reddy (Phone & Profile Overlap)',
    duplicateCandidateId: 'cand-4',
  },
];

export const DEMO_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'upload',
    title: 'New resume uploaded (Rahul_Sharma_Resume.pdf)',
    detail: 'Parsed Successfully • 95% match for Python Developer',
    time: '10m ago',
  },
  {
    id: 'act-2',
    type: 'shortlist',
    title: 'Arjun Kumar shortlisted for AI/ML Engineer',
    detail: '93% Score • Required skills covered',
    time: '42m ago',
  },
  {
    id: 'act-3',
    type: 'interview',
    title: 'Interview scheduled with Priya Verma',
    detail: 'Technical Round 1 • Tomorrow 11:00 AM',
    time: '2h ago',
  },
  {
    id: 'act-4',
    type: 'offer',
    title: 'Offer extended to Ananya Das',
    detail: 'Junior Java Developer • 92% Match',
    time: '4h ago',
  },
  {
    id: 'act-5',
    type: 'job',
    title: 'New job opened: Python Developer',
    detail: 'Platform Engineering • 8 applicants',
    time: '1d ago',
  },
];
