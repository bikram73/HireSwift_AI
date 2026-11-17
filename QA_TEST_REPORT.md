# HireSwift AI — End-to-End QA & Test Report

**Application:** HireSwift AI (AI-Powered Applicant Tracking System)  
**Specification Reference:** `HireSwift AI – Complete End-to-End Testing PRD (v1.0)`  
**Runtime Tested:** Node.js `v22.23.2` (with compiled JS `dist/server.mjs` compatible with Node `20+`), React `19.0.1`, Vite `8.3.8`, TypeScript `5.x`, Express `4.21.2`, Playwright Chromium, Vitest `5.x`  
**Architecture Preserved:** In-memory state + `localStorage` persistence (no database, no authentication)  

---

## 1. Executive Project Testing Summary

Testing was executed across the live development server (`http://localhost:3000`), compiled production server (`NODE_ENV=production node dist/server.mjs` and `node server.ts`), Express API routes via Supertest, Netlify Function handler parity (`netlify/functions/api.ts`), Vitest unit & React Testing Library component integration suites, and headless Chromium Playwright E2E browser workflows.

| Metric | Observed Result |
|---|---|
| **Vitest Automated Suites Executed** | 5 test files (`tests/*.test.ts`, `tests/*.test.tsx`) |
| **Vitest Test Cases** | 71 executed — **71 Passed**, **0 Failed** (`8.47s`) |
| **Playwright Chromium E2E Specs** | 4 multi-module specs (`e2e/hireswift.spec.ts`) — **4 Passed**, **0 Failed** (`49.3s`) |
| **Total Automated Checks Executed** | **75 Passed / 75 Executed (100% Pass Rate)** |
| **TypeScript Static Check (`npm run lint`)** | **PASS** (`tsc --noEmit` — 0 errors) |
| **Production Build (`npm run build`)** | **PASS** (`vite build` in `1.37s` + `dist/server.mjs` `34.6kb` in `9ms`; client secret scan clean) |
| **Compiled Server Startup (`node dist/server.mjs`)** | **PASS** (`HTTP 200` on `/api/health`, compatible with Node `20+` and `22+`) |
| **Pre-Fix Defects & Audit Issues Resolved** | **15 Total** (10 original PRD defects + 5 post-audit production/privacy/deployment fixes) |
| **Open Unresolved Defects Remaining** | **0** (all resolved in source code and verified via regression tests) |
| **Not Applicable / Scope-Limited Items** | `NAV-019` (no dark/light toggle); see Section 7 for exact test scope boundaries |

---

## 2. Environment Modes Verified

### Mode A — Live Multi-Model AI Server (`http://localhost:3000`)
- Verified via `GET http://localhost:3000/api/health` (`HTTP 200`):
  - `fallbackOrder: ["gemini", "openrouter", "groq", "deterministic"]`
  - Configured primary model: `gemini-3.5-flash-lite` (matching `.env.example`, `lib/atsApi.ts`, and `README.md`)
- Executed live Job Description Analysis (`POST /api/jobs/analyze`) and live Resume Parsing (`POST /api/resumes/parse`) inside Playwright Chromium (`E2E-001` & `E2E-002`).

### Mode B — Zero-Key Deterministic Fallback (`tests/api.test.ts` & Compiled Production Server)
- Verified with `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, and `GROQ_API_KEY` unset on both `node dist/server.mjs` and Express/Netlify handler parity:
  - `/api/health` returns `200 OK` with `aiConfigured: false`
  - `/api/resumes/parse` (`fallback-parser`), `/api/jobs/analyze` (`fallback-analyzer`), `/api/matching/analyze` (`fallback-rubric`), and `/api/matching/skill-gap` operate without credentials or crashes.
- Verified multi-provider cascade (`gemini` -> `openrouter` -> `groq` -> `deterministic`) in `tests/api.test.ts` using mocked HTTP responses (`HTTP 429` from OpenRouter cleanly cascades to `groq-ai`).

---

## 3. Module-Wise Test Summary

| Module (PRD Section) | Evidence / Suite Coverage | Executed | Passed | Failed | Status |
|---|---|---|---|---|---|
| **Landing Page** (Sec 4.1 `LAND-001..010`) | `e2e/hireswift.spec.ts` Test 1 & Test 2 (brand logo, CTA, reload reset, 7 viewports) | Covered | All | 0 | **PASS** |
| **Workspace Navigation** (Sec 4.2 `NAV-001..020`) | `e2e/hireswift.spec.ts` Test 1 & Test 2 (14 views, `Ctrl+K`, `Escape`, mobile drawer; `NAV-019` N/A) | Covered | All | 0 | **PASS** *(NAV-019 N/A)* |
| **Resume Upload** (Sec 5.1–5.3 `UP/PDF/DOCX`) | `tests/fileExtractor.test.ts` (7), `tests/pdfPassword.test.ts` (2), `e2e/hireswift.spec.ts` (PDF + DOCX + corrupted PDF rejection) | Covered | All | 0 | **PASS** |
| **Resume Extraction** (Sec 5.4–5.5 `EXT/REV`) | `tests/api.test.ts`, `tests/atsEngine.test.ts`, `e2e/hireswift.spec.ts` (`DEFECT-1,3,8,9` + `ISSUE-2` evidence confidence) | Covered | All | 0 | **PASS** |
| **Duplicate Detection** (Sec 6.1 `DUP-001..012`) | `tests/atsEngine.test.ts` (5 unit specs), `e2e/hireswift.spec.ts` Test 3 (SHA-256 live upload) | Covered | All | 0 | **PASS** |
| **Candidate Management** (Sec 7 `CAN/FIL`) | `tests/workflows.test.tsx`, `e2e/hireswift.spec.ts` Test 4 (`DEFECT-5,6` fixed: pageSize, Name sort, Max 12th%) | Covered | All | 0 | **PASS** |
| **Candidate Profiles** (Sec 8 `PROF-001..014`) | `tests/workflows.test.tsx` (`CandidateDrawer`), `e2e/hireswift.spec.ts` Test 3 | Covered | All | 0 | **PASS** |
| **Job Management & JD AI** (Sec 9 `JOB/JD`) | `tests/api.test.ts`, `tests/workflows.test.tsx`, `e2e/hireswift.spec.ts` (`DEFECT-2,5` fixed) | Covered | All | 0 | **PASS** |
| **Gemini & Fallback Chain** (Sec 10 `AI/FALL`) | Live Mode A + `tests/api.test.ts` Mode B + simulated `429` OpenRouter->Groq failover (`ISSUE-4` model alignment) | Covered | All | 0 | **PASS** |
| **AI Matching & Scoring** (Sec 11 `SCORE/EXPL`) | `tests/atsEngine.test.ts` (9 aliases, 12 tier boundaries, `FIX-001..010`, weights, determinism) | Covered | All | 0 | **PASS** |
| **Candidate Ranking** (Sec 12 `RANK-001..014`) | `tests/atsEngine.test.ts`, `e2e/hireswift.spec.ts` Test 2 & Test 4 (`Name (A-Z)` sort, overflow check) | Covered | All | 0 | **PASS** |
| **Hiring Pipeline** (Sec 13 `PIPE-001..016`) | `tests/workflows.test.tsx` (interview schedule modal), `e2e/hireswift.spec.ts` Test 2 & Test 3 | Covered | All | 0 | **PASS** |
| **Candidate Comparison** (Sec 14 `COMP-001..012`) | `tests/workflows.test.tsx` (`COMP-004` max-4 limit verified) | Covered | All | 0 | **PASS** |
| **Skill Gap Analysis** (Sec 15 `GAP-001..012`) | `tests/api.test.ts` (`400` on `{}` + Groq failover), `e2e/hireswift.spec.ts` Test 4 | Covered | All | 0 | **PASS** |
| **Email Center** (Sec 16 `MAIL-001..016`) | `tests/workflows.test.tsx` + `e2e/hireswift.spec.ts` Test 4 (`.eml` RFC-2822 draft download added) | Covered | All | 0 | **PASS** |
| **Dashboard** (Sec 17 `DASH-001..019`) | `tests/workflows.test.tsx` (`DASH-002..008` exact context count consistency) + `e2e/hireswift.spec.ts` Test 2 | Covered | All | 0 | **PASS** |
| **Reports & Exports** (Sec 18 `REP-001..012`) | `tests/atsEngine.test.ts` (RFC-4180 CSV escaping across 500 rows with commas, quotes, newlines) | Covered | All | 0 | **PASS** |
| **Settings & Persistence** (Sec 19–20 `SET/DATA`) | `tests/workflows.test.tsx` (`DEFECT-4,5`, `ISSUE-3` privacy, `QuotaExceededError`, corrupted JSON recovery) | Covered | All | 0 | **PASS** |
| **Backend APIs** (Sec 21 `API-001..033`) | `tests/api.test.ts` (all 5 routes + `400`/`404`/`413`/`422`/Mode B/cascade) | Covered | All | 0 | **PASS** |
| **Netlify & Node Production** (Sec 22 `NET-001..013`) | `tests/api.test.ts` (CORS `OPTIONS`, `405`, `404`, `413`, `POST`) + `dist/server.mjs` (`34.6kb`) + `NODE_VERSION = "22"` | Covered | All | 0 | **PASS** *(local parity)* |
| **Responsive UI** (Sec 24 `UI-001..007`) | `e2e/hireswift.spec.ts` Test 2 (Landing page 7 widths `320`–`1920`; Dashboard/Candidates/Pipeline/Ranking at desktop, tablet & mobile) | Covered | All | 0 | **PASS** |
| **Performance** (Sec 23 `PERF-001..012`) | `tests/atsEngine.test.ts` (`PERF-005` 500 candidates), Playwright timing assertions | Covered | All | 0 | **PASS** |
| **Security & Privacy** (Sec 20 `DATA-009..014`) | `grep` scan on `dist/assets` (`NO_SECRETS_IN_DIST`), Playwright `localStorage` secret & `resumeTextPreview` audit | Covered | All | 0 | **PASS** |

---

## 4. Defect & Audit Issue Log (Identified, Fixed & Verified)

### A. Original PRD Defects (Fixed & Regression Tested)

| Defect ID | Severity | Location (`File : Symbol`) | Original Behavior / Root Cause | Fix Applied | Verification |
|---|---|---|---|---|---|
| **DEFECT-1** | **High** | `src/components/views/ResumeUploadView.tsx` | Uploaded resumes with zero extracted skills were assigned a fabricated `['Communication']` skill. | Removed hardcoded `'Communication'` fallback; empty extractions preserve `skills: []`. | **PASS** (`tests/workflows.test.tsx`) |
| **DEFECT-2** | **High** | `lib/atsApi.ts` (`heuristicAnalyzeJd`) | Deterministic JD fallback fabricated `minimumCGPA: 7.0`, `location: 'Bengaluru / Hybrid'`, `minimumExperience: 3`, and degree assumptions. | Returned `minimumCGPA: null`, `location: 'Not Specified'`, `minimumExperience: 0`, and `[]` qualifications when omitted. | **PASS** (`tests/api.test.ts`) |
| **DEFECT-3** | **Medium** | `src/data/atsData.ts`, `ResumeUploadView.tsx`, `CandidateDrawer.tsx` | `tenthTwelfth` displayed `'Not Listed'` when 10th percentage was `null` even when 12th percentage was present, and manual edits risked `NaN`. | Fixed formatting helper (`'N/A / XX%'`) and added `NaN` guards in `CandidateDrawer.tsx`. | **PASS** (`tests/atsEngine.test.ts`, `tests/workflows.test.tsx`) |
| **DEFECT-4** | **Medium** | `src/components/views/OperationsViews.tsx`, `src/context/AtsContext.tsx` | Applying all-zero scoring weights (`Total: 0%`) was permitted cleanly. | Added `totalWeight <= 0` validation in `SettingsView` and `AtsContext`. | **PASS** (`tests/workflows.test.tsx`) |
| **DEFECT-5** | **Medium** | `TalentWorkflowViews.tsx`, `CandidatesView.tsx`, `OperationsViews.tsx` | Destructive actions (`Delete job`, `Delete candidate`, `Clear Session Data`) executed immediately without confirmation. | Added two-step inline `Confirm` / `Cancel` guards on all three destructive workflows. | **PASS** (`tests/workflows.test.tsx`, `e2e/hireswift.spec.ts`) |
| **DEFECT-6** | **Low** | `CandidatesView.tsx`, `TalentWorkflowViews.tsx` | Fixed `PAGE_SIZE = 10`, missing alphabetical `Name (A–Z)` sort, and missing `Max 12th %` filter. | Added `Rows per page` (`10 / 20 / 50`), `Name (A–Z)` sort in Directory & Ranking, and `Max 12th %` filter input. | **PASS** (`tests/workflows.test.tsx`, `e2e/hireswift.spec.ts`) |
| **DEFECT-7** | **Medium** | `src/components/views/OperationsViews.tsx` (`EmailCenterView`) | `.eml` draft export documented in workflow specs had no UI handler. | Added RFC-2822 `.eml` file download (`Download .eml`). | **PASS** (`tests/workflows.test.tsx`, `e2e/hireswift.spec.ts`) |
| **DEFECT-8** | **High** | `lib/atsApi.ts` (`parseResumePayload`, `analyzeSkillGapPayload`) | Scanned image-only PDFs without AI threw an unhandled `500` error; empty `{}` requests bypassed validation. | Added `ApiValidationError(422, ...)` for scanned PDFs when AI is disabled/unavailable and `400` payload validation. | **PASS** (`tests/api.test.ts`) |
| **DEFECT-9** | **Medium** | `lib/atsApi.ts` (`heuristicParseResume`) | Substring regex `/intern/i` matched unrelated words such as `"international"`. | Tightened boundary regex to `/\bintern(?:ship)?s?\b/i`. | **PASS** (`tests/api.test.ts`) |
| **DEFECT-10** | **Medium** | `src/utils/fileExtractor.ts` (`validateAndExtractResume`) | `mammoth.extractRawText({ arrayBuffer })` failed in Node CJS/Vitest contexts requiring `{ buffer }`. | Passed `{ arrayBuffer, ...(typeof Buffer !== 'undefined' ? { buffer: Buffer.from(buffer) } : {}) }`. | **PASS** (`tests/fileExtractor.test.ts`, `e2e/hireswift.spec.ts`) |

### B. Post-Audit Production, Privacy & Configuration Fixes

| Issue ID | Severity | Location | Root Cause Found in Audit | Fix Applied & Verified | Verification |
|---|---|---|---|---|---|
| **ISSUE-1** | **High** | `package.json`, `netlify.toml`, `README.md` | README cited Node 20+, whereas `"start": "node server.ts"` requires Node 22.18+ native TS execution. | Added `esbuild` compilation of `server.ts` into `dist/server.mjs` during `npm run build`, added `"start:compiled": "node dist/server.mjs"` and `"start:tsx": "tsx server.ts"` (preserving `"start": "node server.ts"`), set `NODE_VERSION = "22"` in `netlify.toml`, and updated `README.md`. | **PASS** (`node dist/server.mjs` `/api/health` 200) |
| **ISSUE-2** | **High** | `ResumeUploadView.tsx`, `atsEngine.ts`, `atsData.ts`, `lib/atsApi.ts` | Fallback confidence values (`0.9`, `0.2`, `0.5`, `0.4`) and dead `candidate.radar` object fabricated metrics even when fields were absent. | Added evidence-based `computeExtractionConfidence(...)` returning `0` when name/email/education/skills are absent or placeholders, updated `heuristicParseResume` confidence accordingly, and removed dead `candidate.radar` property. | **PASS** (`tests/atsEngine.test.ts`, `tests/api.test.ts`) |
| **ISSUE-3** | **Medium (Privacy)** | `src/context/AtsContext.tsx`, `CandidateDrawer.tsx` | Raw `resumeTextPreview` strings were persisted in `localStorage` and session JSON exports alongside candidate records. | Excluded `resumeTextPreview` (along with `resumeObjectUrl`) from `localStorage` serialization (`hireswift_ats_session_v2`) and `exportSessionJson`; raw preview stays in volatile memory only with explicit UI notice after reload. | **PASS** (`tests/workflows.test.tsx`, `e2e/hireswift.spec.ts`) |
| **ISSUE-4** | **Medium (Config)** | `lib/atsApi.ts`, `.env.example`, `README.md` | Default Gemini model string in `lib/atsApi.ts` (`gemini-4-hydrogen`) disagreed with `.env.example` / `README.md` (`gemini-3.5-flash-lite`). | Aligned `getGeminiModel()` default in `lib/atsApi.ts`, `.env.example`, and `README.md` to `gemini-3.5-flash-lite`. | **PASS** (`tests/api.test.ts`, code audit) |
| **ISSUE-5** | **Medium (Deploy)** | `AtsContext.tsx`, `fileExtractor.ts`, `lib/atsApi.ts`, `OperationsViews.tsx` | Base64 JSON encoding expands a scanned PDF by ~33%, letting a 5 MB+ file breach Netlify's 6 MB payload ceiling. | Lowered default `maxFileSizeMb` to `4` MB, added client-side `MAX_SCANNED_PDF_BASE64_CHARS = 5_800_000` check in `fileExtractor.ts`, and enforced server-side `HTTP 413` on oversized `base64Pdf` payloads in `lib/atsApi.ts`. | **PASS** (`tests/pdfPassword.test.ts`, `tests/api.test.ts`) |

---

## 5. Recorded Performance & Security Measurements

- **Initial Landing Page Load (Chromium E2E Test 1):** `< 3,500 ms` asserted; full Landing + 14 workspace views + Job Details + `Ctrl+K` walkthrough completed in **`8.6s`**.
- **Responsive Overflow Check (Test 2):** Landing Page (7 widths `320px`–`1920px`) + `Dashboard`, `Candidates`, `Hiring Pipeline`, `Candidate Ranking` at `1440px`, `768px`, `375px`, and `320px` passed with scroll overflow `<= 4px` in **`11.9s`**.
- **Deterministic 500-Candidate Scoring Benchmark (`PERF-005`):** **`< 250 ms`** for all 500 candidates (`0–100` bounds enforced, `0` NaN results).
- **Filter Responsiveness (Playwright Test 4):** Switching page size to `20` and re-rendering table completed under **`500 ms`**.
- **Client Bundle Secret Scan (`grep -rnE "AIzaSy|sk-or-|gsk_" dist/assets`):** Returned **`NO_SECRETS_IN_DIST`** (`0` API key literals in client build).
- **Browser Storage Secret & Privacy Scan (`e2e/hireswift.spec.ts` Test 3):** Verified `localStorage` contains **zero** leaked API keys and **zero** `resumeTextPreview` / `resumeObjectUrl` keys.

---

## 6. Added Automated Testing Infrastructure

- `vitest.config.ts` & `playwright.config.ts`
- `npm test` (`vitest run`) & `npm run test:e2e` (`playwright test`) in `package.json`
- `tests/atsEngine.test.ts` (37 tests: scoring fixtures, evidence-based `computeExtractionConfidence`, aliases, categories, deduplication, CSV escaping, 500-row perf)
- `tests/api.test.ts` (11 tests: Express + Netlify handler parity, Mode B, `400`/`404`/`413`/`422` errors, `0`-confidence bare notes, provider failover)
- `tests/fileExtractor.test.ts` (7 tests: DOCX/PDF validation, corrupt PDF handling, size limits) & `tests/pdfPassword.test.ts` (2 tests: `PasswordException` & >5.8 MB scanned PDF OCR payload limit)
- `tests/workflows.test.tsx` (14 React Testing Library workflow & regression tests including `localStorage` privacy exclusion & `QuotaExceededError` handling)
- `e2e/hireswift.spec.ts` (4 Playwright Chromium end-to-end specs covering PDF + DOCX + malformed PDF failure isolation, live AI endpoints, duplicate detection, persistence, and responsive layouts)

---

## 7. Scope & Qualification Boundaries

To keep this report strictly evidence-based, the following boundaries apply to the executed test runs:
1. **Browser & Environment Matrix:** Browser E2E checks ran on local **headless Chromium** via Playwright. Safari/WebKit, Firefox, Edge, and the remote live URL (`https://hireswift-ai.netlify.app/`) were not directly executed from this sandbox; Netlify Functions compatibility was verified locally via Supertest/handler invocation against `netlify/functions/api.ts` and compiled CJS/ESM output.
2. **External Provider Failover Calls:** Live Gemini JD analysis and resume parsing ran against configured credentials in Playwright Test 3 (`15.7s`) and Test 4 (`11.8s`). Specific `429` rate-limit cascades (`OpenRouter -> Groq`) were tested deterministically using mocked `fetch` responses (`tests/api.test.ts`) rather than exhausting live external API quotas.
3. **Responsive Workspace Matrix:** All 7 viewports (`1920`, `1440`, `1366`, `768`, `430`, `375`, `320`) were checked on the Landing Page, and responsive mobile/tablet/desktop layout checks (`1440`, `768`, `375`, `320`) were run on `Dashboard`, `Candidates`, `Hiring Pipeline`, and `Candidate Ranking`. Other secondary tabs were exercised at standard desktop width (`1280x720`).
4. **Intentionally Not Applicable (`NAV-019`):** Light/dark theme switcher tests are marked **Not Applicable** because HireSwift AI enforces a single dark-studio theme by project design.

---

## 8. Final Project Verdict

### **PASS – READY FOR SUBMISSION**

**Verification Summary:** After resolving all 10 PRD defects and all 5 post-audit issues (`dist/server.mjs` Node 20+ startup compatibility, evidence-based confidence without fabricated radar/scores, exclusion of `resumeTextPreview` from `localStorage`, uniform `gemini-3.5-flash-lite` defaults, and `4 MB` / `5.8 MB base64` scanned-PDF payload limits), all **71/71 Vitest unit/API/component tests**, **4/4 Playwright Chromium E2E specs**, `tsc --noEmit`, `vite build`, `dist/server.mjs`, and bundle/storage privacy scans passed with **0 open defects**.

