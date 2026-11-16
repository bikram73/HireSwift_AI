export type WorkspaceRoute =
  | 'dashboard'
  | 'candidates'
  | 'resume-upload'
  | 'job-management'
  | 'ai-matching'
  | 'candidate-ranking'
  | 'hiring-pipeline'
  | 'compare-candidates'
  | 'skill-gap-analysis'
  | 'email-center'
  | 'reports'
  | 'settings'
  | 'help-center';

export interface CandidateProfile {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  location: string;
  education: string;
  cgpa: string;
  tenthTwelfth: string;
  experience: string;
  experienceYears: number;
  skills: string[];
  matchScore: number;
  matchLabel: string;
  status: 'Shortlisted' | 'Interview' | 'Reviewing' | 'Applied' | 'Screening' | 'Offer' | 'Hired';
  avatarTone: string;
  summary: string;
  radar: {
    communication: number;
    problemSolving: number;
    culturalFit: number;
    technicalSkills: number;
    architecture: number;
  };
  highlights: string[];
  timeline: { time: string; event: string; detail: string }[];
}

export interface QueuedResumeFile {
  id: string;
  docId: string;
  fileName: string;
  hashOrNote: string;
  type: 'PDF' | 'DOCX';
  size: string;
  uploadProgress: number;
  parsingStatus: 'parsed' | 'processing' | 'duplicate' | 'failed' | 'waiting';
  parsingProgress?: number;
  duplicateMatch?: string;
  errorDetail?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  priority: 'Urgent' | 'High' | 'Normal';
  applicants: number;
  shortlisted: number;
  avgMatch: number;
  status: 'Active' | 'Paused' | 'Draft';
  skills: string[];
  salaryRange: string;
  postedAgo: string;
}

export const CANDIDATES_DATA: CandidateProfile[] = [
  {
    id: 'cand-1',
    initials: 'RS',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'Senior Python Dev',
    location: 'Bengaluru, IN',
    education: 'B.Tech CS',
    cgpa: '8.8 CGPA',
    tenthTwelfth: '92% / 90%',
    experience: '4.5 yrs',
    experienceYears: 4.5,
    skills: ['Python', 'FastAPI', 'Docker', 'AWS'],
    matchScore: 92,
    matchLabel: '92% Excellent',
    status: 'Shortlisted',
    avatarTone: 'bg-primary-container/30 text-primary',
    summary:
      'Backend architect specializing in distributed FastAPI microservices, async event pipelines, and containerized AWS EKS deployments.',
    radar: {
      communication: 88,
      problemSolving: 94,
      culturalFit: 86,
      technicalSkills: 95,
      architecture: 91,
    },
    highlights: [
      'Reduced API p99 latency by 46% across high-throughput billing services.',
      'Designed zero-downtime migration from monolith to Python FastAPI + Kafka.',
      'Maintained 99.98% SLA across 14 production microservices on AWS.',
    ],
    timeline: [
      { time: '10m ago', event: 'Resume Parsed', detail: 'Rahul_Sharma_Resume.pdf extracted via Gemini 1.5 Pro' },
      { time: '8m ago', event: 'AI Score Generated', detail: '92% match against Senior Python Developer JD' },
      { time: '5m ago', event: 'Auto-Shortlisted', detail: 'Passed 8.5+ CGPA & dense vector > 0.85 threshold' },
    ],
  },
  {
    id: 'cand-2',
    initials: 'PV',
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    role: 'Full Stack Engineer',
    location: 'Pune, IN',
    education: 'M.Tech CS',
    cgpa: '9.1 CGPA',
    tenthTwelfth: '94% / 93%',
    experience: '5.0 yrs',
    experienceYears: 5.0,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    matchScore: 89,
    matchLabel: '89% Strong',
    status: 'Interview',
    avatarTone: 'bg-tertiary-container/40 text-tertiary',
    summary:
      'Staff-track Full Stack Engineer leading React 19, TypeScript design systems, and federated GraphQL API layers.',
    radar: {
      communication: 92,
      problemSolving: 90,
      culturalFit: 91,
      technicalSkills: 92,
      architecture: 87,
    },
    highlights: [
      'Led frontend platform rewrite serving 2.4M monthly active enterprise users.',
      'Built federated GraphQL gateway reducing client payload sizes by 52%.',
      'Mentored team of 6 mid-level engineers with weekly architecture reviews.',
    ],
    timeline: [
      { time: '2h ago', event: 'Interview Scheduled', detail: 'Technical Round 1 booked for tomorrow 11:00 AM' },
      { time: '1d ago', event: 'Shortlisted', detail: '89% semantic alignment confirmed by Hiring Lead' },
    ],
  },
  {
    id: 'cand-3',
    initials: 'AK',
    name: 'Arjun Kumar',
    email: 'arjun.k@example.com',
    role: 'Machine Learning Lead',
    location: 'Hyderabad, IN',
    education: 'B.Tech AI',
    cgpa: '8.5 CGPA',
    tenthTwelfth: '89% / 88%',
    experience: '3.5 yrs',
    experienceYears: 3.5,
    skills: ['PyTorch', 'LLMs', 'NLP', 'Python'],
    matchScore: 86,
    matchLabel: '86% Strong',
    status: 'Reviewing',
    avatarTone: 'bg-secondary-container/30 text-secondary',
    summary:
      'Applied ML Engineer focused on RAG retrieval pipelines, domain-specific embedding fine-tuning, and low-latency vLLM inference.',
    radar: {
      communication: 84,
      problemSolving: 91,
      culturalFit: 85,
      technicalSkills: 90,
      architecture: 83,
    },
    highlights: [
      'Fine-tuned domain embedding models improving semantic recall by 19%.',
      'Deployed quantized LLM inference clusters cutting GPU compute spend by 38%.',
    ],
    timeline: [
      { time: '42m ago', event: 'Shortlisted', detail: '86% match score for AI/ML Engineer requisition' },
      { time: '3h ago', event: 'OCR & Vector Indexed', detail: 'DOCX tokens normalized across 42k taxonomy nodes' },
    ],
  },
  {
    id: 'cand-4',
    initials: 'SR',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    role: 'Data Analyst',
    location: 'Mumbai, IN',
    education: 'B.Sc Stats',
    cgpa: '8.2 CGPA',
    tenthTwelfth: '88% / 86%',
    experience: '2.5 yrs',
    experienceYears: 2.5,
    skills: ['SQL', 'Tableau', 'Python', 'Pandas'],
    matchScore: 82,
    matchLabel: '82% Strong',
    status: 'Applied',
    avatarTone: 'bg-surface-container-high text-on-surface',
    summary:
      'Product & Growth Data Analyst skilled in dbt modeling, cohort retention telemetry, and executive BI dashboards.',
    radar: {
      communication: 87,
      problemSolving: 83,
      culturalFit: 89,
      technicalSkills: 81,
      architecture: 76,
    },
    highlights: [
      'Automated weekly funnel attribution models saving 12 analyst hours/week.',
      'Built churn early-warning scorecard deployed across Customer Success.',
    ],
    timeline: [
      { time: '1h ago', event: 'Duplicate Alert', detail: '98.4% vector match with existing DB record' },
      { time: '4h ago', event: 'Application Received', detail: 'Uploaded via Q3 Senior Eng Batch' },
    ],
  },
  {
    id: 'cand-5',
    initials: 'KP',
    name: 'Karan Patel',
    email: 'karan.p@example.com',
    role: 'Full Stack Engineer',
    location: 'Delhi, IN',
    education: 'B.Tech IT',
    cgpa: '7.9 CGPA',
    tenthTwelfth: '84% / 82%',
    experience: '3.0 yrs',
    experienceYears: 3.0,
    skills: ['React', 'CSS', 'Next.js', 'Redux'],
    matchScore: 76,
    matchLabel: '76% Good',
    status: 'Applied',
    avatarTone: 'bg-surface-container-high text-on-surface',
    summary:
      'UI-focused Frontend Engineer building accessible SaaS dashboards with Next.js App Router, Tailwind CSS, and motion choreography.',
    radar: {
      communication: 80,
      problemSolving: 77,
      culturalFit: 84,
      technicalSkills: 79,
      architecture: 72,
    },
    highlights: [
      'Delivered WCAG AA compliant component library used across 4 product squads.',
      'Improved Core Web Vitals LCP from 3.4s to 1.2s on marketing and portal surfaces.',
    ],
    timeline: [
      { time: '6h ago', event: 'AI Scored', detail: '76% match — strong UI, lighter backend Node experience' },
    ],
  },
  {
    id: 'cand-6',
    initials: 'AD',
    name: 'Ananya Das',
    email: 'ananya.das@example.com',
    role: 'Backend Platform Dev',
    location: 'Kolkata, IN',
    education: 'MCA',
    cgpa: '8.0 CGPA',
    tenthTwelfth: '85% / 83%',
    experience: '4.0 yrs',
    experienceYears: 4.0,
    skills: ['Java', 'Spring Boot', 'Microservices'],
    matchScore: 71,
    matchLabel: '71% Good',
    status: 'Screening',
    avatarTone: 'bg-surface-container-high text-on-surface',
    summary:
      'Enterprise Java & Spring Boot developer experienced in distributed ledger settlements, PostgreSQL tuning, and Redis caching.',
    radar: {
      communication: 79,
      problemSolving: 81,
      culturalFit: 82,
      technicalSkills: 78,
      architecture: 80,
    },
    highlights: [
      'Architected idempotent payment reconciliation engine handling 80k tx/day.',
      'Migrated legacy SOAP integrations to RESTful Spring Boot 3 services.',
    ],
    timeline: [
      { time: '5h ago', event: 'Moved to Screening', detail: 'Recruiter phone screen pending confirmation' },
    ],
  },
];

export const PIPELINE_CANDIDATES: CandidateProfile[] = [
  {
    id: 'pipe-1',
    initials: 'SC',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'Senior Software Engineer',
    location: 'San Francisco, US',
    education: 'M.S. CS, Stanford',
    cgpa: '9.4 CGPA',
    tenthTwelfth: '96% / 95%',
    experience: '7.5 yrs',
    experienceYears: 7.5,
    skills: ['React', 'Python', 'AWS', 'Node.js'],
    matchScore: 94,
    matchLabel: '94% High Match',
    status: 'Interview',
    avatarTone: 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white',
    summary:
      'Sarah has directed 3 microservice transformations at scale with verifiable metrics (reduced latency by 42%). Meets 9/10 core JD requirements with verified production Kubernetes mastery.',
    radar: {
      communication: 92,
      problemSolving: 95,
      culturalFit: 89,
      technicalSkills: 96,
      architecture: 93,
    },
    highlights: [
      'Directed 3 microservice transformations reducing p95 latency by 42%.',
      'Verified production Kubernetes, AWS ECS, and React/Python full-stack ownership.',
      'Led cross-functional squad of 8 engineers through SOC-2 compliance launch.',
    ],
    timeline: [
      { time: '20m ago', event: 'AI Semantic Match', detail: '94% fit score computed with citation links' },
      { time: '2h ago', event: 'Interview Stage', detail: 'System Design panel scheduled with CTO' },
    ],
  },
  {
    id: 'pipe-2',
    initials: 'AR',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'Data Scientist',
    location: 'Austin, US',
    education: 'M.S. Data Science',
    cgpa: '9.0 CGPA',
    tenthTwelfth: '92% / 91%',
    experience: '5.5 yrs',
    experienceYears: 5.5,
    skills: ['Python', 'PyTorch', 'SQL', 'Spark'],
    matchScore: 94,
    matchLabel: '94% High Match',
    status: 'Offer',
    avatarTone: 'bg-emerald-500/20 text-emerald-300',
    summary:
      'Applied Data Scientist specializing in causal inference, ranking models, and real-time feature stores.',
    radar: {
      communication: 90,
      problemSolving: 94,
      culturalFit: 92,
      technicalSkills: 93,
      architecture: 88,
    },
    highlights: [
      'Increased search conversion by 11.4% via multi-stage neural ranker.',
      'Built streaming feature store on Kafka + Redis.',
    ],
    timeline: [
      { time: '1h ago', event: 'Offer Extended', detail: 'Compensation package sent via DocuSign' },
    ],
  },
  {
    id: 'pipe-3',
    initials: 'MG',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'Product Designer',
    location: 'New York, US',
    education: 'B.F.A. Design',
    cgpa: '8.9 CGPA',
    tenthTwelfth: '91% / 90%',
    experience: '6.0 yrs',
    experienceYears: 6.0,
    skills: ['Figma', 'Design Systems', 'Prototyping', 'UX Research'],
    matchScore: 91,
    matchLabel: '91% High Match',
    status: 'Reviewing',
    avatarTone: 'bg-secondary-container/40 text-secondary',
    summary:
      'Staff Product Designer crafting enterprise SaaS workflows, dark-mode design systems, and data visualization interfaces.',
    radar: {
      communication: 95,
      problemSolving: 89,
      culturalFit: 93,
      technicalSkills: 91,
      architecture: 86,
    },
    highlights: [
      'Authored token-driven dark-mode design system adopted by 14 teams.',
      'Increased onboarding completion rate from 54% to 82%.',
    ],
    timeline: [
      { time: '3h ago', event: 'Portfolio Review', detail: 'Design Critique scored 4.8/5.0' },
    ],
  },
  {
    id: 'pipe-4',
    initials: 'BC',
    name: 'Ben Carter',
    email: 'ben.carter@example.com',
    role: 'DevOps Engineer',
    location: 'Seattle, US',
    education: 'B.S. Computer Eng',
    cgpa: '8.7 CGPA',
    tenthTwelfth: '90% / 88%',
    experience: '6.5 yrs',
    experienceYears: 6.5,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Go'],
    matchScore: 95,
    matchLabel: '95% High Match',
    status: 'Reviewing',
    avatarTone: 'bg-tertiary-container/40 text-tertiary',
    summary:
      'Principal SRE / DevOps Engineer automating multi-region Kubernetes clusters, Terraform IaC, and zero-trust observability.',
    radar: {
      communication: 86,
      problemSolving: 95,
      culturalFit: 88,
      technicalSkills: 97,
      architecture: 96,
    },
    highlights: [
      'Achieved 99.995% availability across multi-region EKS deployments.',
      'Automated SOC-2 infrastructure controls using Open Policy Agent.',
    ],
    timeline: [
      { time: '45m ago', event: 'Technical Review', detail: 'Shortlisted for urgent DevOps requisition' },
    ],
  },
];

export const INITIAL_QUEUE_FILES: QueuedResumeFile[] = [
  {
    id: 'q-1',
    docId: '#DOC-8921',
    fileName: 'Rahul_Sharma_Resume.pdf',
    hashOrNote: 'ID: #DOC-8921 • Hash: 9f2c...4a',
    type: 'PDF',
    size: '1.8 MB',
    uploadProgress: 100,
    parsingStatus: 'parsed',
  },
  {
    id: 'q-2',
    docId: '#DOC-8922',
    fileName: 'Priya_Verma_Senior_FullStack.pdf',
    hashOrNote: 'ID: #DOC-8922 • Hash: c3a1...7e',
    type: 'PDF',
    size: '2.4 MB',
    uploadProgress: 100,
    parsingStatus: 'parsed',
  },
  {
    id: 'q-3',
    docId: '#DOC-8923',
    fileName: 'Arjun_Kumar_AIML_CV.docx',
    hashOrNote: 'ID: #DOC-8923 • Parsing tokens...',
    type: 'DOCX',
    size: '940 KB',
    uploadProgress: 100,
    parsingStatus: 'processing',
    parsingProgress: 78,
  },
  {
    id: 'q-4',
    docId: '#DOC-8924',
    fileName: 'Sneha_Reddy_Analyst.pdf',
    hashOrNote: 'ID: #DOC-8924 • High vector similarity',
    type: 'PDF',
    size: '1.2 MB',
    uploadProgress: 100,
    parsingStatus: 'duplicate',
    duplicateMatch: 'Matches Sneha R. in DB (98.4%)',
  },
  {
    id: 'q-5',
    docId: '#DOC-8925',
    fileName: 'John_Doe_Corrupted.pdf',
    hashOrNote: 'CRC_ERROR: 0x8004115',
    type: 'PDF',
    size: '450 KB',
    uploadProgress: 100,
    parsingStatus: 'failed',
    errorDetail: 'Unreadable scan / zero text layer',
  },
  {
    id: 'q-6',
    docId: '#DOC-8926',
    fileName: 'Ananya_Das_Java_Dev.pdf',
    hashOrNote: 'ID: #DOC-8926 • Standby slot #3',
    type: 'PDF',
    size: '1.6 MB',
    uploadProgress: 100,
    parsingStatus: 'waiting',
  },
];

export const JOBS_DATA: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Python Developer',
    department: 'Platform Engineering',
    location: 'Bengaluru / Hybrid',
    type: 'Full-Time',
    priority: 'Urgent',
    applicants: 148,
    shortlisted: 18,
    avgMatch: 87,
    status: 'Active',
    skills: ['Python', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL'],
    salaryRange: '$135k – $165k',
    postedAgo: '3d ago',
  },
  {
    id: 'job-2',
    title: 'Senior Full Stack Engineer',
    department: 'Core Product',
    location: 'Remote (Global)',
    type: 'Full-Time',
    priority: 'Urgent',
    applicants: 212,
    shortlisted: 24,
    avgMatch: 85,
    status: 'Active',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind'],
    salaryRange: '$140k – $175k',
    postedAgo: '5d ago',
  },
  {
    id: 'job-3',
    title: 'AI / ML Infrastructure Lead',
    department: 'Applied AI',
    location: 'Hyderabad / Hybrid',
    type: 'Full-Time',
    priority: 'High',
    applicants: 94,
    shortlisted: 11,
    avgMatch: 83,
    status: 'Active',
    skills: ['PyTorch', 'LLMs', 'vLLM', 'Python', 'Kubernetes'],
    salaryRange: '$165k – $210k',
    postedAgo: '1w ago',
  },
  {
    id: 'job-4',
    title: 'Senior DevOps Engineer',
    department: 'Cloud Infrastructure',
    location: 'Seattle / Remote',
    type: 'Full-Time',
    priority: 'Urgent',
    applicants: 68,
    shortlisted: 7,
    avgMatch: 89,
    status: 'Active',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Go', 'Prometheus'],
    salaryRange: '$150k – $185k',
    postedAgo: '4h ago',
  },
  {
    id: 'job-5',
    title: 'Product Data Analyst',
    department: 'Growth & BI',
    location: 'Mumbai / Hybrid',
    type: 'Full-Time',
    priority: 'Normal',
    applicants: 184,
    shortlisted: 14,
    avgMatch: 79,
    status: 'Active',
    skills: ['SQL', 'Python', 'Tableau', 'dbt', 'Pandas'],
    salaryRange: '$95k – $120k',
    postedAgo: '2w ago',
  },
];
