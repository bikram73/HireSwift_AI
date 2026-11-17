# 📊 HireSwift AI — Technical Engineering Report

<div align="center">

**AI Extraction Methodology, Deterministic Scoring Mathematics, Validation Strategy & QA Summary**

<a href="./README.md"><img src="https://img.shields.io/badge/⬅️%20Back%20to%20README-4F46E5?style=for-the-badge" /></a>
<a href="./ARCHITECTURE.md"><img src="https://img.shields.io/badge/🏗️%20Architecture%20Document-DC2626?style=for-the-badge" /></a>
<a href="./QA_TEST_REPORT.md"><img src="https://img.shields.io/badge/🧪%20QA%20Test%20Report-16A34A?style=for-the-badge" /></a>

</div>

---

## 1. Extraction & Hallucination-Prevention Strategy

Resume parsing combines **client-side binary decoding** with **schema-constrained backend extraction**:

1. **Client Pre-Extraction (`src/utils/fileExtractor.ts`)**:
   - **DOCX**: Unpacked locally via `mammoth.extractRawText()`. Rejects archives containing zero text nodes.
   - **PDF**: Decoded locally via `pdfjs-dist` page-by-page. Detects `PasswordException` and corrupted headers with actionable error messages.
   - **Scanned PDF Detection**: When `extractedText.length < 40`, the file is flagged as a scanned PDF and encoded as `base64Pdf` so the backend AI multimodal pipeline can perform OCR directly on the document layers.
2. **Strict Schema Enforcement (`lib/atsApi.ts`)**:
   - Calls `ai.models.generateContent` with `responseMimeType: 'application/json'` and an explicit `responseSchema` defining scalar fields as `nullable: true`.
   - System instructions enforce factual grounding: unavailable scalar values return `null`, absent lists return `[]`, and `missing_fields` flags omitted contact or academic items rather than inventing estimates.
3. **3-Tier AI Chain & Deterministic Fallback Guarantee**:
   - Requests execute across **Gemini → OpenRouter → Groq** with retry backoff (`withRetry`, 1 retry per upstream request; 25s timeout on OpenRouter/Groq). If all configured AI keys are absent or fail, `heuristicParseResume` and `heuristicAnalyzeJd` extract contact regexes, academic metrics, and canonical skills from `KNOWN_SKILLS` without fabricating unstated CGPA, location, or skills. Scanned image-only PDFs without AI OCR return HTTP `422`.

---

## 2. Deterministic Scoring & Alias Normalization

All candidate rankings in `src/utils/atsEngine.ts` remain **100% reproducible** and explainable:

### Skill Alias Canonicalization
Before computing set intersection between candidate skills and job requirements, `normalizeSkillName()` maps common variations to canonical tokens (e.g., `py` / `python3` → `python`, `reactjs` / `react.js` → `react`, `postgres` / `psql` → `postgresql`, `k8s` → `kubernetes`, `genai` → `generative ai`).

### Weighted Sub-Score Formula
$$\text{Overall Score} = \text{round}\left(\frac{\sum_{i=1}^{6} S_i \cdot W_i}{\sum_{i=1}^{6} W_i}\right)$$

| Factor $i$ | Score $S_i$ Range | Neutral / Missing Handling | Default $W_i$ |
|:---|:---:|:---|:---:|
| **Technical Skills** | `0 – 100` | `80%` required match ratio + `20%` preferred match ratio | `35` |
| **Experience** | `45 – 95` | Recognizes internships separately when `minimumExperience === 0` | `20` |
| **Education** | `62 – 96` | Unstated CGPA defaults to neutral baseline `72` (never `0`) | `15` |
| **Projects** | `55 – 98` | Combines project/internship count and required skill overlap | `15` |
| **Certifications** | `60 – 95` | Checks job-specific certs or gives credit for verified credentials | `5` |
| **Responsibilities** | `58 – 96` | Keyword overlap across candidate executive summary & highlights | `10` |

---

## 3. Deduplication Logic

When ingesting batches in `ResumeUploadView.tsx`:
1. **Hash & Email Match (`Exact Duplicate`)**: Matches SHA-256 digest of the raw file bytes OR case-insensitive trimmed email address against existing session candidates.
2. **Phone & Academic Identity Match (`Potential Duplicate`)**: Matches normalized 10-digit phone numbers combined with matching name, OR matching name + college + `>= 3` shared canonical skills across distinct files.
3. **Resolution Options**: Recruiters can inspect flagged items and merge non-empty skills/contact metadata into the canonical record (`mergeDuplicateCandidate`), skip, or add for review without losing pipeline integrity.

---

## 4. Verification & Build Assurance

- **TypeScript Strictness**: Verified via `npm run lint` (`tsc --noEmit`) covering `src/`, `lib/`, `server.ts`, `netlify/functions/`, `tests/`, and `e2e/`.
- **Bundling & Serverless Compilation**: Production frontend compiles via `npm run build` into `dist/`, and `netlify/functions/api.ts` compiles via `esbuild` with `@google/genai` kept external.
- **Automated Unit, API & Browser E2E Suites**: Executed via `npm test` (Vitest + Supertest + React Testing Library + Netlify Function handler tests) and `npm run test:e2e` (Playwright headless Chromium across responsive viewports, real PDF/DOCX uploads, persistence, and zero-error navigation). See [QA_TEST_REPORT.md](./QA_TEST_REPORT.md) for the full audit trail.
