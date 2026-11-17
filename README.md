<div align="center">

# ⚡ HireSwift AI — Smart Applicant Tracking System

**High-Velocity Resume Parsing, Deterministic Weighted Matching & End-to-End Recruitment Workspace**

![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Serverless_Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

<br />

<a href="https://hireswift-ai.netlify.app/" target="_blank"><img src="https://img.shields.io/badge/🚀%20Live%20Demo-hireswift--ai.netlify.app-4F46E5?style=for-the-badge" /></a>
<a href="https://github.com/bikram73/HireSwift_AI" target="_blank"><img src="https://img.shields.io/badge/💻%20GitHub-bikram73%2FHireSwift__AI-181717?style=for-the-badge&logo=github" /></a>

</div>

---

# 📑 Table of Contents

<div align="center">

| **📖 Description** | **🚀 Section** |
|:---|:---:|
| Explore the project overview, purpose, and key capabilities of HireSwift AI. 👉 | <a href="#-about-the-project"><img src="https://img.shields.io/badge/📖%20About%20the%20Project-4F46E5?style=for-the-badge" /></a> |
| Discover all the features and functionalities available in the recruitment platform. 👉 | <a href="#-features"><img src="https://img.shields.io/badge/✨%20Features-4F46E5?style=for-the-badge" /></a> |
| Understand the complete resume processing, AI extraction, and candidate matching workflow. 👉 | <a href="#-how-it-works"><img src="https://img.shields.io/badge/⚙️%20How%20It%20Works-0891B2?style=for-the-badge" /></a> |
| Explore the AI-powered candidate evaluation, matching criteria, scoring weights, and ranking methodology. 👉 | <a href="#-ai-matching--scoring-system"><img src="https://img.shields.io/badge/🤖%20AI%20Matching%20%26%20Scoring-8B5CF6?style=for-the-badge" /></a> |
| View the technologies, frameworks, libraries, and programming languages used in the project. 👉 | <a href="#-tech-stack"><img src="https://img.shields.io/badge/🛠️%20Tech%20Stack-0891B2?style=for-the-badge" /></a> |
| Explore the complete project folder structure and organization of frontend and backend files. 👉 | <a href="#-file-structure"><img src="https://img.shields.io/badge/📂%20File%20Structure-10B981?style=for-the-badge" /></a> |
| Follow the prerequisites, environment configuration, installation steps, and local development setup. 👉 | <a href="#-installation--setup"><img src="https://img.shields.io/badge/🚀%20Installation%20%26%20Setup-F97316?style=for-the-badge" /></a> |
| Learn how to configure the Gemini API and integrate AI-powered resume analysis. 👉 | <a href="#-gemini-api-configuration"><img src="https://img.shields.io/badge/🔑%20Gemini%20API%20Configuration-7C3AED?style=for-the-badge" /></a> |
| Understand the REST API endpoints, request parameters, response formats, and usage examples. 👉 | <a href="#-api-documentation"><img src="https://img.shields.io/badge/🌐%20API%20Documentation-0EA5E9?style=for-the-badge" /></a> |
| Explore the system architecture, application modules, AI integration, processing pipeline, and technical design. 👉 | <a href="./ARCHITECTURE.md"><img src="https://img.shields.io/badge/🏗️%20Architecture%20Document-DC2626?style=for-the-badge" /></a> |
| Review the detailed technical implementation, AI processing methodology, validation strategy, and engineering decisions. 👉 | <a href="./TECHNICAL_REPORT.md"><img src="https://img.shields.io/badge/📊%20Technical%20Report-2563EB?style=for-the-badge" /></a> |
| Understand candidate profile fields, resume extraction, job requirements, and application data handling. 👉 | <a href="#-candidate-data-management"><img src="https://img.shields.io/badge/👥%20Candidate%20Data%20Management-0D9488?style=for-the-badge" /></a> |
| Learn how candidates are filtered, compared, ranked, and managed throughout the recruitment pipeline. 👉 | <a href="#-recruitment-workflow"><img src="https://img.shields.io/badge/📋%20Recruitment%20Workflow-2563EB?style=for-the-badge" /></a> |
| Review application performance, resume processing time, AI response latency, and optimization strategies. 👉 | <a href="#-performance"><img src="https://img.shields.io/badge/⚡%20Performance-F59E0B?style=for-the-badge" /></a> |
| Explore the testing approach, test scenarios, validation procedures, and quality assurance results. 👉 | <a href="#-testing--quality-assurance"><img src="https://img.shields.io/badge/🧪%20Testing%20%26%20QA-16A34A?style=for-the-badge" /></a> |
| Understand session-based storage, temporary file handling, privacy considerations, and API key security. 👉 | <a href="#-data-storage--security"><img src="https://img.shields.io/badge/🔒%20Data%20Storage%20%26%20Security-0F766E?style=for-the-badge" /></a> |
| Review supported file formats, processing constraints, known limitations, and possible failure scenarios. 👉 | <a href="#-supported-formats--limitations"><img src="https://img.shields.io/badge/⚠️%20Supported%20Formats%20%26%20Limitations-EF4444?style=for-the-badge" /></a> |
| Explore future improvements, planned features, and potential project enhancements. 👉 | <a href="#-future-enhancements"><img src="https://img.shields.io/badge/🔮%20Future%20Enhancements-8B5CF6?style=for-the-badge" /></a> |
| Learn how to contribute, report issues, and suggest improvements to the project. 👉 | <a href="#-contributing"><img src="https://img.shields.io/badge/🤝%20Contributing-0891B2?style=for-the-badge" /></a> |
| Review the project's licensing information and usage permissions. 👉 | <a href="#-license"><img src="https://img.shields.io/badge/📜%20License-64748B?style=for-the-badge" /></a> |
| Find contact information, project links, and acknowledgements. 👉 | <a href="#-contact--acknowledgements"><img src="https://img.shields.io/badge/📬%20Contact%20%26%20Acknowledgements-4F46E5?style=for-the-badge" /></a> |

</div>

---

## 📖 About the Project

**HireSwift AI** is an end-to-end **Smart Applicant Tracking System (ATS)** built for high-velocity technical recruiting teams, talent partners, and hiring managers. It combines client-side document extraction (`PDF.js` & `Mammoth`), SHA-256 duplicate detection, structured AI entity extraction, and a transparent weighted scoring rubric inside a sleek dark-navy & indigo workspace.

### 🎯 Core Objectives
- **Eliminate manual resume screening bottlenecks** by parsing PDF and DOCX resumes into structured candidate profiles in seconds.
- **Keep scoring transparent and auditable** by pairing a deterministic 6-category scoring engine with grounded AI rationale and custom interview questions.
- **Unify the entire recruitment lifecycle**—from ingestion, JD creation, candidate ranking, side-by-side comparison, skill gap diagnostics, and Kanban hiring stages to candidate email drafting and executive exports.
- **Run seamlessly anywhere** with zero external database setup required—using local session persistence (`localStorage`) plus dual deployment support for **Node/Express** and **Netlify Serverless Functions**.

---

## ✨ Features

### 🌐 Landing Page & Navigation
- **Modern Dark Indigo Showcase (`LandingPage`)**: Always loads first on browser refresh, showcasing live pipeline previews, problem-vs-solution metrics, 6 core capability cards, 3-step workflow, explainable candidate scorecard preview, and instant one-click entry into any ATS workspace module.
- **Global Command Search (`⌘K` / `Ctrl+K`)**: Instant keyboard-driven modal to jump directly to candidates, active job requisitions, or workspace views.

### 📊 Workspace Modules (14 Views)
- **📈 Dashboard (`dashboard`)**: 8 live KPI cards (total candidates, active jobs, applications received, shortlisted, interviews scheduled, offers released, rejected, avg match score), Application Trends chart, Conversion Funnel, Stage Distribution donut chart, Top In-Demand Skills breakdown, Top Matching Candidates table, Recent Activity stream, and quick dataset load/reset controls.
- **👥 Candidates Directory (`candidates`)**: Searchable, sortable, paginated repository with bulk shortlist/stage/compare/CSV-export actions plus a slide-in **Precision Filters Drawer** (min/max CGPA, 10th/12th percentage cutoffs, degree level, branch, college, graduation year, experience range, location/remote availability, match score range, hiring stage, AND/OR technical skills toggle).
- **📤 Bulk Resume Upload (`resume-upload`)**: Multi-file drag-and-drop uploader for `.pdf` and `.docx` resumes with per-file validation, SHA-256 content hashing, exact/potential duplicate detection & merge workflow, scanned PDF OCR fallback, real-time progress telemetry, and editable candidate review before saving.
- **💼 Job Management & Job Details (`job-management`, `job-details`)**: Create, edit, pause, close, or delete job requisitions, featuring an **AI JD Analyzer** that extracts required vs. preferred skills, experience bounds, minimum CGPA, qualifications, and responsibilities straight from raw job descriptions.
- **🧠 AI Matching (`ai-matching`)**: Interactive radar & bar breakdown across all 6 evaluation dimensions, matched/missing skill chips, transferable skills, interview questions generator, and on-demand deep AI rationale evaluation.
- **🏆 Candidate Ranking (`candidate-ranking`)**: Job-scoped leaderboard with live adjustable scoring weight sliders, instant rank recalculation, CSV export, and one-click stage advancement.
- **🗂️ Hiring Pipeline (`hiring-pipeline`)**: 5-column interactive Kanban board (`Applied` → `Shortlisted` → `Interview` → `Offer` → `Rejected`) with drag-and-drop & quick stage transitions, interview schedule timestamps, rejection reason capture, and recruiter notes.
- **⚖️ Compare Candidates (`compare-candidates`)**: Side-by-side matrix for up to 4 candidates comparing match score, skill overlap, CGPA, 10th/12th scores, experience, education, strengths, and hiring recommendation.
- **🔍 Skill Gap Analysis (`skill-gap-analysis`)**: Distinguishes mandatory vs. optional skill gaps, highlights transferable strengths, and generates targeted learning areas & practical project recommendations.
- **✉️ Email Center (`email-center`)**: Dynamic recruiter templates (Interview Invite, Shortlist Update, Offer Letter, Rejection Feedback) with auto-populated candidate/job variables, custom editing, `.eml` / clipboard export, and activity tracking.
- **📉 Reports (`reports`)**: Visual analytics across hiring funnel conversion, source/skill distribution, and downloadable CSV / JSON executive summaries.
- **⚙️ Settings & ❓ Help Center (`settings`, `help-center`)**: Configurable scoring rubric weights, max upload file size limit, demo dataset import/reset, session JSON export/clear, and interactive documentation.
- **🪪 Slide-Over Candidate Profile Drawer (`CandidateDrawer`)**: Full candidate dossier with tabs for Overview, Academics (10th/12th/UG/PG), Work & Projects, Resume Preview, and Timeline + quick stage actions.

---

## ⚙️ How It Works

```text
  [1. Upload PDF / DOCX]
           │
           ▼
  [2. Client Validation & Extraction]
   ├── File extension & size limit check
   ├── SHA-256 hash generation (Exact & Potential Duplicate check)
   ├── PDF.js text layer extraction (or base64 handoff for scanned PDFs)
   └── Mammoth DOCX raw text extraction
           │
           ▼
  [3. Structured Entity Parsing (/api/resumes/parse)]
   ├── Live Gemini AI structured JSON extraction (when GEMINI_API_KEY is configured)
   └── Automatic Deterministic Regex/NLP Parser fallback (zero downtime without key)
           │
           ▼
  [4. Weighted Matching & Ranking Engine (atsEngine.ts)]
   ├── Alias normalization (e.g., js → javascript, k8s → kubernetes, py → python)
   ├── 6-Category Weighted Rubric Scoring (0–100)
   └── Grounded AI Matching Rationale & Skill Gap Recommendations
           │
           ▼
  [5. Interactive ATS Workflow]
   └── Filter ──► Rank ──► Compare ──► Kanban Stage ──► Email Candidate ──► Export Reports
```

1. **Client-Side Pre-Processing**: Resumes never upload blindly—`fileExtractor.ts` checks file type/size, computes a SHA-256 digest in the browser via `window.crypto.subtle`, and extracts text locally using `pdfjs-dist` or `mammoth`.
2. **Structured AI / Heuristic Extraction**: Extracted text (or base64 PDF for image-only scans) is sent to `/api/resumes/parse` to produce clean personal details, multi-tier academics, internships vs. full-time work history, categorized technical skills, projects, and missing-field alerts.
3. **Deterministic Scoring + AI Insights**: `computeMatchResult()` calculates objective sub-scores across 6 weighted dimensions, while `/api/matching/analyze` and `/api/matching/skill-gap` generate grounded explanations and tailored interview questions.

---

## 🤖 AI Matching & Scoring System

HireSwift AI enforces **strict factual grounding**: unverified fields stay `null` (never hallucinated), missing CGPA is scored neutrally rather than penalized as `0`, and skill matching normalizes common aliases (`py` → `python`, `reactjs` → `react`, `k8s` → `kubernetes`, `genai` → `generative ai`).

### ⚖️ Default Weighted Scoring Formula

| Dimension | Default Weight | Scoring Logic |
|:---|:---:|:---|
| **💻 Technical Skills** | `35%` | `80%` required skills coverage + `20%` preferred skills coverage |
| **💼 Experience** | `20%` | Evaluates years against job min/max bounds & distinguishes internships from full-time |
| **🎓 Education & Academics** | `15%` | Compares verified CGPA against job cutoff (neutral `72` baseline if unstated) |
| **🛠️ Projects & Practical Work** | `15%` | Measures project/internship volume and required tech stack overlap in deliverables |
| **📜 Certifications** | `5%` | Checks alignment with target certifications or bonus industry credentials |
| **📋 Responsibilities Fit** | `10%` | Evaluates domain keyword alignment across candidate summary & highlights |

> 💡 All weights can be customized live in **Settings** or **Candidate Ranking**, dynamically normalizing to 100% and recalculating every leaderboard in real time.

### 🏷️ Match Fit Tiers

| Score Range | Classification |
|:---:|:---|
| `90 – 100` | 🟢 **Excellent Match** |
| `80 – 89` | 🔵 **Strong Match** |
| `70 – 79` | 🟣 **Good Match** |
| `60 – 69` | 🟡 **Moderate Match** |
| `40 – 59` | 🟠 **Low Match** |
| `0 – 39` | 🔴 **Poor Match** |

---

## 🛠️ Tech Stack

### 💻 Programming Languages
- **TypeScript (`7.0.2`)** — Full-stack type safety across React frontend, Express server, and Netlify serverless functions
- **HTML5 & CSS3** — Semantic markup & modern CSS custom properties / theme tokens
- **JavaScript (ES2022 / ESM)** — Runtime & build tooling

### 🎨 Frontend
- **React `19.0.1`** & **React DOM `19.0.1`** — Component architecture, hooks & Context API state store
- **Tailwind CSS `4.3.3`** (`@tailwindcss/vite`) — Dark-navy glassmorphism UI design system
- **Recharts `3.10.1`** — Application trend area charts, conversion funnels, and distribution donuts
- **Lucide React `0.546.0`** & **Material Symbols** — Crisp vector iconography
- **Motion `12.23.24`** — Smooth UI transitions
- **PDF.js (`pdfjs-dist 6.5.438`)** — Client-side PDF text layer parsing & scanned-document detection
- **Mammoth (`1.13.0`)** — Client-side `.docx` text extraction

### ⚙️ Backend & AI
- **Node.js `20+`** & **Express `4.21.2`** — Local/cloud full-stack server with Vite dev middleware
- **Google GenAI SDK (`@google/genai 3.3.0`)** — Structured JSON schema extraction & analysis
- **Netlify Functions (`netlify/functions/api.ts`)** — Zero-config serverless API deployment bundled via `esbuild`
- **Vite `8.3.0`**, **TSX `4.21.0`**, **Dotenv `17.2.3`** — Fast dev server, bundling & environment management

---

## 📂 File Structure

```text
hireswift-ai/
├── lib/
│   └── atsApi.ts                   # Shared AI + deterministic fallback handlers (Express & Netlify)
├── netlify/
│   └── functions/
│       └── api.ts                  # Netlify Functions v2 serverless entry point (/api/*)
├── public/                         # Static public assets & UI reference screenshots
│   └── screen_630d9ae4.png         # Hero dashboard showcase asset
├── src/
│   ├── components/
│   │   ├── views/
│   │   │   ├── CandidatesView.tsx      # Searchable directory, bulk actions & Precision Filters drawer
│   │   │   ├── DashboardView.tsx       # Executive KPIs, charts, top candidates & activity feed
│   │   │   ├── OperationsViews.tsx     # Skill Gap Analysis, Email Center, Reports, Settings, Help Center
│   │   │   ├── ResumeUploadView.tsx    # Drag-and-drop uploader, deduplication & parser telemetry
│   │   │   └── TalentWorkflowViews.tsx # AI Matching, Ranking, Jobs, Job Details, Kanban, Compare
│   │   ├── BrandLogo.tsx           # HireSwift AI geometric brand identity
│   │   ├── CandidateDrawer.tsx     # Slide-over multi-tab candidate dossier & stage controls
│   │   ├── LandingPage.tsx         # Marketing/product showcase & module launchpad
│   │   └── WorkspaceShell.tsx      # Sidebar nav, top breadcrumb/search header & ⌘K modal
│   ├── context/
│   │   └── AtsContext.tsx          # Global state store, localStorage persistence & AI cache
│   ├── data/
│   │   └── atsData.ts              # Strict TypeScript interfaces, default weights & sample dataset
│   ├── utils/
│   │   ├── atsEngine.ts            # Weighted scoring engine, alias normalizer & duplicate detector
│   │   └── fileExtractor.ts        # PDF.js, Mammoth DOCX & Web Crypto SHA-256 extractor
│   ├── App.tsx                     # Root router (Landing-first + workspace hash navigation)
│   ├── index.css                   # Tailwind v4 setup, glassmorphism tokens & theme variables
│   └── main.tsx                    # React 19 DOM entry point
├── .env.example                    # Environment variable template
├── index.html                      # HTML entry point & Google Fonts / Material Symbols
├── metadata.json                   # Applet metadata & capability manifest
├── netlify.toml                    # Netlify build, redirects & esbuild function configuration
├── package.json                    # Dependencies & npm scripts
├── server.ts                       # Express + Vite server entry point (Port 3000)
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite bundler configuration
├── ARCHITECTURE.md                 # System & pipeline architecture guide
├── TECHNICAL_REPORT.md             # Engineering design, scoring & QA report
└── README.md                       # Complete project documentation
```

---

## 🚀 Installation & Setup

### ✅ Prerequisites
- **Node.js `v20+`** (recommended LTS)
- **npm** (or **bun**)
- *(Optional)* A **Gemini API key** for live LLM extraction (app runs cleanly with deterministic heuristics even without a key)

### 📥 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bikram73/HireSwift_AI.git
   cd HireSwift_AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your API key (see [Gemini API Configuration](#-gemini-api-configuration)).

4. **Start the full-stack development server**
   ```bash
   npm run dev
   ```
   The app and backend API will be running at **`http://localhost:3000`**.

5. **Type-check and build for production**
   ```bash
   npm run lint
   npm run build
   ```

6. **Run production Node server locally**
   ```bash
   NODE_ENV=production npm start
   ```

### ☁️ Deploying to Netlify
**Live Deployment**: [https://hireswift-ai.netlify.app/](https://hireswift-ai.netlify.app/)

This repository is pre-configured with `netlify.toml` and `netlify/functions/api.ts`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **Environment Variable**: Set `GEMINI_API_KEY` inside **Netlify Site Configuration → Environment Variables**.

---

## 🔑 Gemini API Configuration

HireSwift AI keeps API keys **strictly on the server side** (`server.ts` / `netlify/functions/api.ts`)—never exposed to browser bundles or local storage.

### 📝 Environment Variables (`.env`)

HireSwift AI implements a **3-tier automatic AI fallback chain**: **Gemini → OpenRouter → Groq → Deterministic Local Parser**.

| Variable | Required | Description |
|:---|:---:|:---|
| `GEMINI_API_KEY` | Tier 1 (Primary) | Server-side key for primary AI resume OCR/parsing, JD analysis, matching rationales, and skill-gap coaching. |
| `GEMINI_MODEL` | Optional | Override default Tier 1 Gemini model (`gemini-4-hydrogen`). |
| `OPENROUTER_API_KEY` | Tier 2 (Fallback) | Automatically used when Tier 1 fails or is unconfigured (`https://openrouter.ai/api/v1/chat/completions`). |
| `OPENROUTER_MODEL` | Optional | Override default Tier 2 OpenRouter model (`openai/gpt-4o-mini`). |
| `GROQ_API_KEY` | Tier 3 (Final AI Fallback) | Automatically used when Tier 2 fails (`https://api.groq.com/openai/v1/chat/completions`). |
| `GROQ_MODEL` | Optional | Override default Tier 3 Groq model (`llama-3.3-70b-versatile`). |
| `PORT` | Optional | Local Express port (defaults to `3000`). |

> 🛡️ **Zero-Downtime Fallback**: If a provider returns an error, rate limit (`429`), timeout, or missing key, requests cascade smoothly **Gemini → OpenRouter → Groq**, with a deterministic heuristic parser as the final safety net.

---

## 🌐 API Documentation

All endpoints are served identically by **Express** (`server.ts`) and **Netlify Functions** (`netlify/functions/api.ts` via `/api/*` rewrite).

### `GET /api/health`
Returns server readiness and whether a live Gemini key is configured.
```json
{
  "ok": true,
  "aiConfigured": true
}
```

### `POST /api/resumes/parse`
Extracts structured candidate profile entities from extracted document text or base64 PDF data (for scanned PDFs).
- **Request Body**:
  ```json
  {
    "fileName": "Priya_Verma_Resume.pdf",
    "mimeType": "application/pdf",
    "extractedText": "Priya Verma ... React TypeScript Node.js CGPA 9.1 ...",
    "base64Pdf": "<optional base64 string for scanned PDFs>"
  }
  ```
- **Response (`200 OK`)**: `{ "parsed": { ...structuredCandidateSchema }, "source": "gemini-ai" | "deterministic-parser" | "fallback-parser" }`

### `POST /api/jobs/analyze`
Parses raw job description text into structured hiring requirements.
- **Request Body**:
  ```json
  {
    "description": "Senior Full-Stack Engineer (3-5 yrs). Required: React, TypeScript, Node.js, PostgreSQL. Minimum CGPA 7.5..."
  }
  ```
- **Response (`200 OK`)**: `{ "analysis": { "title": "...", "requiredSkills": [...], "preferredSkills": [...], "minimumExperience": 3, "maximumExperience": 5, "minimumCGPA": 7.5, ... }, "source": "gemini-ai" }`

### `POST /api/matching/analyze`
Generates grounded matching rationale, strengths, potential concerns, and tailored interview questions.
- **Request Body**: `{ "candidate": { ... }, "job": { ... }, "deterministicScore": { ... } }`
- **Response (`200 OK`)**: `{ "insights": { "explanation": "...", "decisionRationale": "...", "strongestAreas": [...], "potentialConcerns": [...], "interviewQuestions": [...] }, "source": "gemini-ai" }`

### `POST /api/matching/skill-gap`
Produces actionable learning paths and portfolio project recommendations based on missing skills.
- **Request Body**: `{ "candidateName": "...", "candidateSkills": [...], "requiredSkills": [...], "preferredSkills": [...], "jobTitle": "..." }`
- **Response (`200 OK`)**: `{ "gapAnalysis": { "transferableSkills": [...], "recommendedLearningAreas": [...], "practicalProjectRecommendations": [...], "summary": "..." }, "source": "gemini-ai" }`

---

## 👥 Candidate Data Management

Every candidate profile (`CandidateProfile` in `src/data/atsData.ts`) captures comprehensive structured data without fabricating missing metrics:
- **Identity & Links**: Full name, email, phone, location, remote availability, LinkedIn, GitHub, and portfolio URLs.
- **Multi-Level Academics**: 10th school/percentage/year, 12th school/percentage/year, diploma details, undergraduate degree/branch/college/CGPA/scale/graduation year, and postgraduate details.
- **Separated Experience**: Total years, current & previous titles/companies, structured full-time `workHistory`, and dedicated `internships` array.
- **8-Bucket Categorized Skills**: Programming languages, frameworks, libraries, databases, cloud technologies, developer tools, AI/ML technologies, and other technical skills.
- **Provenance & Confidence**: Resume filename, format (`PDF` / `DOCX`), SHA-256 `resumeHash`, duplicate status (`Unique`, `Exact Duplicate`, `Potential Duplicate`, `Requires Review`), confidence scores (`name`, `email`, `education`, `skills`), missing fields list, and full recruitment activity timeline.

---

## 📋 Recruitment Workflow

1. **Publish Job Specs** → Paste a JD in **Job Management** and auto-extract required/preferred skills & academic thresholds.
2. **Ingest & Deduplicate Resumes** → Drop PDFs/DOCX files into **Resume Upload**; review parsed fields and resolve any duplicate alerts.
3. **Precision Filter** → Narrow large talent pools in **Candidates** using CGPA, 10th/12th scores, graduation year, and AND/OR skill combinations.
4. **Rank & Evaluate Fit** → Inspect sorted leaderboards in **Candidate Ranking** & drill into sub-scores or AI interview prompts in **AI Matching**.
5. **Compare Finalists** → Pin up to 4 candidates in **Compare Candidates** to contrast academic scores, skills, and project depth side-by-side.
6. **Advance Pipeline & Communicate** → Drag or move candidates across **Hiring Pipeline** stages, log interview slots/notes, and dispatch formatted messages from **Email Center**.

---

## ⚡ Performance

- **Zero-Latency Local Filtering & Scoring**: Candidate filtering, weighted score recalculation, and Kanban transitions execute synchronously in memory (`O(n)`), updating 30–500+ profiles instantaneously.
- **Client-Side Offloading**: PDF.js Web Workers and Mammoth unpack binary documents in the browser, transferring compact text strings rather than multi-megabyte payloads for text-searchable files.
- **AI Result Caching & Retry Backoff**: `aiMatchCache` memoizes evaluated `(candidateId, jobId)` pairs per session to avoid redundant API calls, while `withRetry` applies exponential backoff across transient network errors.
- **Serverless Cold-Start Optimization**: `esbuild` bundles Netlify functions cleanly with `@google/genai` kept external for minimal package overhead.

---

## 🧪 Testing & Quality Assurance

Verified continuously across the codebase:
- **Static Type Checking**: `npm run lint` runs `tsc --noEmit` across frontend, shared API handlers, Express server, and Netlify functions with zero errors.
- **Production Bundle Verification**: `npm run build` validates Vite asset compilation, CSS bundling, and PDF.js worker resolution into `dist/`.
- **API & Fallback Verification**: All REST endpoints (`/api/health`, `/api/resumes/parse`, `/api/jobs/analyze`, `/api/matching/analyze`, `/api/matching/skill-gap`) are verified for both live Gemini AI JSON schema output and deterministic offline fallback behavior.
- **Edge Case Validation**: Tested against empty files, oversized files (configurable MB limit), password-protected PDFs, image-only scanned PDFs, duplicate SHA-256 uploads, and missing academic fields.

---

## 🔒 Data Storage & Security

- **Session & Browser Storage**: Candidate profiles, jobs, scoring weights, and activity events are stored cleanly in React state and persisted locally in browser `localStorage`—no external user accounts or remote databases store PII.
- **Zero Client-Side Secret Exposure**: `GEMINI_API_KEY` is read strictly by server-side Node/serverless handlers (`lib/atsApi.ts`) and never prefixed with `VITE_` or included in frontend JavaScript bundles.
- **Transient Document Processing**: Uploaded files stay in browser memory (`URL.createObjectURL` for local preview); only extracted text (or temporary base64 for OCR fallback) is transmitted over `/api/*` during parsing.

---

## ⚠️ Supported Formats & Limitations

- **Supported Resume Formats**: `.pdf` (text-based and scanned image PDFs) and `.docx` (Word OpenXML). Legacy binary `.doc` files are rejected with clear guidance.
- **File Size Limit**: Configurable in **Settings** (safe default under serverless body limits; up to `6 MB` on Netlify synchronous functions / `16 MB` on Express).
- **Email Center**: Generates ready-to-send email drafts, `.eml` downloads, and clipboard copies rather than connecting directly to an SMTP server.
- **Persistence Scope**: Because data is session/browser-scoped (`localStorage`), clearing browser site data resets local records unless exported via **Settings → Export Session JSON**.

---

## 🔮 Future Enhancements

- 🔌 Direct SMTP / Google Workspace / Microsoft Graph email dispatch from Email Center
- 📅 Two-way calendar sync for automated interview slot booking
- 🗄️ Optional multi-user cloud database synchronization & team audit trails
- 📊 Custom PDF scorecard export per candidate dossier
- 🔗 Webhook triggers for external job boards and referral portals

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository and create a feature branch (`git checkout -b feature/your-feature`).
2. Follow TypeScript strictness and Tailwind CSS conventions across components.
3. Run `npm run lint` and `npm run build` before committing to ensure zero regressions.
4. Open a pull request describing your changes clearly.

---

## 📜 License

This project uses the **Apache License 2.0** (`SPDX-License-Identifier: Apache-2.0`). See repository headers for license terms.

---

## 📬 Contact & Acknowledgements

- **Project**: **HireSwift AI — Smart Applicant Tracking System**
- **Live App**: [https://hireswift-ai.netlify.app/](https://hireswift-ai.netlify.app/)
- **GitHub Repository**: [https://github.com/bikram73/HireSwift_AI](https://github.com/bikram73/HireSwift_AI)
- **Maintainer**: Bikram (`bikram8548@gmail.com`)
- **Acknowledgements**: Built with **React 19**, **Tailwind CSS**, **Recharts**, **PDF.js**, **Mammoth**, **Express**, **Netlify Functions**, and the **Google GenAI SDK**.
