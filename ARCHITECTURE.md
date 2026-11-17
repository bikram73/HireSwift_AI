# 🏗️ HireSwift AI — System Architecture Document

<div align="center">

**End-to-End Frontend, Shared API Layer, Document Processing Pipeline & Deployment Architecture**

<a href="./README.md"><img src="https://img.shields.io/badge/⬅️%20Back%20to%20README-4F46E5?style=for-the-badge" /></a>
<a href="./TECHNICAL_REPORT.md"><img src="https://img.shields.io/badge/📊%20Technical%20Report-2563EB?style=for-the-badge" /></a>
<a href="./QA_TEST_REPORT.md"><img src="https://img.shields.io/badge/🧪%20QA%20Test%20Report-16A34A?style=for-the-badge" /></a>

</div>

---

## 1. Architectural Overview

HireSwift AI uses a **Client-Heavy SPA + Thin Stateless AI Proxy** architecture designed to run identically across **local Node/Express** (`server.ts`) and **Netlify Static + Serverless Functions** (`netlify/functions/api.ts`).

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          Browser Client (React 19)                      │
│                                                                         │
│  LandingPage ──► WorkspaceShell (14 Views + CandidateDrawer + Cmd+K)    │
│                         │                                               │
│                         ▼                                               │
│             AtsContext (State Store + localStorage + Cache)             │
│               ├── fileExtractor.ts (PDF.js Worker + Mammoth + SHA-256)  │
│               └── atsEngine.ts (Alias Normalizer + Weighted Scoring)    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS JSON (/api/*)
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│  Local / Node Server  │                       │  Netlify Deployment   │
│      server.ts        │                       │  dist/ + netlify.toml │
│ Express + Vite Dev/SS │                       │ functions/api.ts (v2) │
└───────────┬───────────┘                       └───────────┬───────────┘
            └───────────────────────┬───────────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │     lib/atsApi.ts     │
                        │ Shared Route Handlers │
                        ├───────────────────────┤
                        │ 1. Tier 1: Gemini     │
                        │ 2. Tier 2: OpenRouter │
                        │ 3. Tier 3: Groq       │
                        │ 4. Heuristic Fallback │
                        └───────────────────────┘
```

---

## 2. Module Breakdown

### 🎨 Presentation Layer (`src/components/`)
- **`LandingPage.tsx`**: Marketing entry experience with animated ambient canvas, interactive capability cards, and direct module deep-links.
- **`WorkspaceShell.tsx`**: Persistent responsive sidebar (`250px` fixed on desktop, slide drawer on mobile), top breadcrumb bar, `+ Analyze Resumes` quick CTA, and `⌘K` Command Search modal.
- **View Modules (`src/components/views/`)**:
  - `DashboardView.tsx` — Recharts analytics & executive overview.
  - `CandidatesView.tsx` — Tabular directory, bulk actions, CSV export, and slide-in Precision Filters drawer.
  - `ResumeUploadView.tsx` — Drag-and-drop multi-file queue, live progress tracking, deduplication, and inline draft review.
  - `TalentWorkflowViews.tsx` — Job CRUD + JD Analyzer, AI Matching deep dive, Candidate Ranking, Kanban Pipeline, and 4-up Candidate Comparison.
  - `OperationsViews.tsx` — Skill Gap Analysis, Email Center, Reports, Settings, and Help Center.
- **`CandidateDrawer.tsx`**: Slide-over modal dossier synced with live `AtsContext` state.

### 🧠 State & Domain Layer (`src/context/`, `src/data/`, `src/utils/`)
- **`AtsContext.tsx`**: Central React Context managing `candidates`, `jobs`, `activities`, `scoringWeights`, `aiMatchCache`, `compareIds`, toast notifications, and `localStorage` persistence.
- **`fileExtractor.ts`**: Executes client-side binary parsing (`pdfjs-dist` Web Worker & `mammoth`), computes SHA-256 checksums, validates extensions/sizes, and detects scanned image PDFs requiring OCR fallback.
- **`atsEngine.ts`**: Performs deterministic alias normalization (`normalizeSkillName`), duplicate matching (`detectDuplicates`), and 6-factor weighted match calculation (`computeMatchResult`).

### 🌐 Backend Proxy & Serverless Layer (`lib/atsApi.ts`, `server.ts`, `netlify/functions/api.ts`)
- **`lib/atsApi.ts`**: Framework-agnostic handlers accepting JSON payloads and cascading across the 3-tier AI provider chain (**Google Gemini** via `@google/genai`, **OpenRouter**, **Groq**) before falling back to deterministic regex/keyword analyzers.
- **`server.ts`**: Express HTTP server mounting `/api/*` routes plus Vite middleware in dev (`npm run dev`) or static `dist/` serving in production (`npm start`).
- **`netlify/functions/api.ts`**: Standard Web `Request` / `Response` handler paired with `netlify.toml` rewrites (`/api/* -> /.netlify/functions/api/:splat`) so all API calls work natively on Netlify without CORS or server management.
