# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hireswift.spec.ts >> HireSwift AI End-to-End Browser Verification >> LAND-001..009 & NAV-001..018: Landing Page, 14 Workspace Views & Cmd+K Navigation without Runtime Errors
- Location: e2e/hireswift.spec.ts:29:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3500
Received:   3634
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "HireSwift AI Logo HireSwiftAI" [ref=e6] [cursor=pointer]:
        - /url: "#top"
        - img "HireSwift AI Logo" [ref=e8]
        - generic [ref=e14]: HireSwiftAI
      - navigation [ref=e16]:
        - link "Features" [ref=e17] [cursor=pointer]:
          - /url: "#features"
        - link "How It Works" [ref=e18] [cursor=pointer]:
          - /url: "#how-it-works"
        - link "AI Matching" [ref=e19] [cursor=pointer]:
          - /url: "#pipeline"
        - link "Testimonials" [ref=e20] [cursor=pointer]:
          - /url: "#testimonials"
      - button "Open Workspace" [ref=e22] [cursor=pointer]
  - generic [ref=e27]:
    - generic [ref=e29]:
      - generic [ref=e31]: Smart AI ATS Parser Engine
      - generic [ref=e32]: •
      - generic [ref=e33]: 99.4% Extraction Accuracy
    - generic [ref=e34]:
      - heading "Hire Smarter. Shortlist Faster. Find the Right Talent." [level=1] [ref=e35]
      - paragraph [ref=e36]: HireSwift AI is the intelligent ATS built for high-growth startups and small teams. Ingest hundreds of resumes in seconds, score semantic fit automatically, and eliminate hiring bias without the enterprise bloat.
    - generic [ref=e37]:
      - button "Launch Workspace" [ref=e38] [cursor=pointer]
      - button "Watch 2-Min Interactive Demo" [ref=e43] [cursor=pointer]
    - generic [ref=e48]:
      - paragraph [ref=e49]: Trusted by 1,200+ forward-thinking teams worldwide
      - generic [ref=e50]:
        - generic [ref=e51]: VERCEL
        - generic [ref=e54]: RETOOL
        - generic [ref=e58]: SUPABASE
        - generic [ref=e61]: LOOM
        - generic [ref=e65]: RAMP
        - generic [ref=e68]: LINEAR
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e81]: app.hireswift.ai/pipeline/senior-fullstack
        - button "Refresh interactive preview" [ref=e86] [cursor=pointer]
      - generic [ref=e92] [cursor=pointer]:
        - img "HireSwift AI Interactive Talent Pipeline & Semantic Matching Dashboard" [ref=e93]
        - generic [ref=e98]:
          - paragraph [ref=e99]: Bulk Parser Stream
          - paragraph [ref=e100]: 150 resumes parsed in 34s • 0 duplicates
        - generic [ref=e107]:
          - generic [ref=e108]:
            - generic [ref=e109]: AI Semantic Match
            - generic [ref=e110]: 94% Fit
          - paragraph [ref=e111]: Sarah Chen • Senior Software Engineer
  - generic [ref=e113]:
    - generic [ref=e114]:
      - generic [ref=e120]:
        - paragraph [ref=e121]: Traditional ATS Slogging
        - paragraph [ref=e122]: 18 Hours / Week spent manual screening
      - generic [ref=e123]: vs
      - generic [ref=e129]:
        - paragraph [ref=e130]: With HireSwift AI Engine
        - paragraph [ref=e131]: 45 Minutes / Week automated shortlists
    - generic [ref=e132]:
      - generic [ref=e133]:
        - paragraph [ref=e134]: 10x
        - paragraph [ref=e135]: Faster Screening
      - generic [ref=e136]:
        - paragraph [ref=e137]: 99.4%
        - paragraph [ref=e138]: Parsing Accuracy
      - generic [ref=e139]:
        - paragraph [ref=e140]: "0"
        - paragraph [ref=e141]: Duplicate Resumes
      - generic [ref=e142]:
        - paragraph [ref=e143]: 64%
        - paragraph [ref=e144]: Lower Time-to-Hire
  - generic [ref=e146]:
    - generic [ref=e147]:
      - text: High Performance Architecture
      - heading "Everything You Need to Hire Top 1% Engineers & Leaders" [level=2] [ref=e148]
      - paragraph [ref=e149]: Ditch clunky 2012 enterprise systems. HireSwift AI gives your lean team sovereign superpower recruiting workflows.
    - generic [ref=e150]:
      - button [ref=e151] [cursor=pointer]:
        - heading "Bulk AI Resume Parsing & OCR" [level=3] [ref=e156]
        - paragraph [ref=e157]: Drag & drop hundreds of PDF, DOCX, or scanned portfolios. Our smart AI parser extracts deep vector tokens, cleans noisy text, and automatically resolves identity duplicates in seconds.
      - button [ref=e158] [cursor=pointer]:
        - heading "Semantic Resume-JD Matching" [level=3] [ref=e172]
        - paragraph [ref=e173]: Move far beyond rigid keywords. Evaluates architectural nuance, tech stacks, problem-solving scope, and company pedigree with explicit reasoning you can trust.
      - button [ref=e174] [cursor=pointer]:
        - heading "Precision Academic & Skill Filtering" [level=3] [ref=e177]
        - paragraph [ref=e178]: "Dial in exact constraints: CGPA cutoffs, tier-1 universities, graduation batches, specific cloud certifications, and minimum production experience thresholds with a slider."
      - button [ref=e179] [cursor=pointer]:
        - heading "Kanban Hiring Pipeline" [level=3] [ref=e185]
        - paragraph [ref=e186]: Fluid, drag-and-drop applicant stages with automated triggers. Move candidates seamlessly from Sourced to Tech Interview, with audit-logged feedback and notes.
      - button [ref=e187] [cursor=pointer]:
        - heading "Side-by-Side Comparison" [level=3] [ref=e191]
        - paragraph [ref=e192]: Eliminate bias with instant candidate side-by-side matrices. Compare radar charts across system design, past longevity, communication scores, and salary expectations.
      - button [ref=e193] [cursor=pointer]:
        - heading "Smart Email Center & Sequences" [level=3] [ref=e199]
        - paragraph [ref=e200]: Trigger dynamic emails with Cal.com/Calendly self-schedule links, gentle reminders, polite rejection feedback letters, and 1-click offer generation.
  - generic [ref=e202]:
    - generic [ref=e203]:
      - text: Zero Operational Friction
      - heading "How HireSwift AI Delivers in 3 Simple Steps" [level=2] [ref=e204]
    - generic [ref=e205]:
      - generic [ref=e206]:
        - generic [ref=e207]: "01"
        - heading "Ingest & Bulk Parse" [level=3] [ref=e212]
        - paragraph [ref=e213]: Drop your zip archives, Google Drive folder links, or LinkedIn exports. Our multi-threaded parser ingests up to 500 files per minute.
      - generic [ref=e214]:
        - generic [ref=e215]: "02"
        - heading "Neural JD Alignment" [level=3] [ref=e220]
        - paragraph [ref=e221]: HireSwift AI compares applicant technical histories against your role's specific tech stack, assigning a clear % fit score with itemized reasoning.
      - generic [ref=e222]:
        - generic [ref=e223]: "03"
        - heading "Decision Support & Offer" [level=3] [ref=e228]
        - paragraph [ref=e229]: Review your auto-ranked shortlist, trigger automated interview invites, compare final finalists, and close your dream hire in half the time.
  - generic [ref=e232]:
    - generic [ref=e233]:
      - generic [ref=e234]: Explainable AI Scoring
      - heading "Stop Guessing. See Exactly Why A Candidate Matches." [level=2] [ref=e238]
      - paragraph [ref=e239]: Unlike legacy black-box keyword matchers that reject candidates for missing synonyms, HireSwift evaluates true experience depth, project complexity, and engineering leadership signals.
      - list [ref=e240]:
        - listitem [ref=e241]:
          - generic [ref=e244]: "Multi-axis radar scoring: Skills, Architecture, Communication, Leadership."
        - listitem [ref=e245]:
          - generic [ref=e248]: Direct citation links to relevant bullet points in original resume PDF.
        - listitem [ref=e249]:
          - generic [ref=e252]: Automated flags for resume exaggerations or timeline inconsistencies.
      - button "Explore Candidate Scorecard" [ref=e254] [cursor=pointer]
    - generic [ref=e259]:
      - generic [ref=e260]:
        - generic [ref=e261]:
          - generic [ref=e262]: SC
          - generic [ref=e263]:
            - heading "Sarah Chen" [level=4] [ref=e264]
            - paragraph [ref=e265]: Senior Fullstack / Cloud Architect • 7.5 Yrs Exp
        - generic [ref=e266]: 94% Match
      - generic [ref=e271]:
        - generic [ref=e273]:
          - generic [ref=e274]: Technical Stack Alignment (React, Go, AWS, Docker)
          - generic [ref=e275]: 96%
        - generic [ref=e279]:
          - generic [ref=e280]: System Design & High-Load Scale
          - generic [ref=e281]: 91%
        - generic [ref=e285]:
          - generic [ref=e286]: Academic & Foundation Credential
          - generic [ref=e287]: 88%
      - generic [ref=e290]:
        - generic [ref=e291]: AI ATS Rationale Summary
        - paragraph [ref=e296]: "\"Sarah has directed 3 microservice transformations at scale with verifiable metrics (reduced latency by 42%). Meets 9/10 core JD requirements with verified production Kubernetes mastery.\""
      - generic [ref=e297]:
        - button "Schedule 45-Min Interview" [ref=e298] [cursor=pointer]
        - button "View Full Dossier" [ref=e301] [cursor=pointer]
  - generic [ref=e303]:
    - generic [ref=e304]:
      - text: Loved By Talent Teams
      - heading "From Chaos to 1-Click Shortlists" [level=2] [ref=e305]
    - generic [ref=e306]:
      - generic [ref=e307]:
        - paragraph [ref=e308]: "\"HireSwift cut our screening time by 80%. When we posted our Senior Backend role, we got 420 resumes. In 4 minutes, the AI highlighted the top 12 matches with spot-on reasoning. We closed the hire in 8 days.\""
        - generic [ref=e309]:
          - generic [ref=e310]: EV
          - generic [ref=e311]:
            - paragraph [ref=e312]: Elena Volkoy
            - paragraph [ref=e313]: Head of Talent @ SynapticLabs
      - generic [ref=e314]:
        - paragraph [ref=e315]: "\"Standard ATS tools are clunky databases. HireSwift feels like a sports car designed by Linear and Stripe engineers. It's lightning-fast, and the radar scoring has zero hallucinations.\""
        - generic [ref=e316]:
          - generic [ref=e317]: MC
          - generic [ref=e318]:
            - paragraph [ref=e319]: Marcus Chen
            - paragraph [ref=e320]: Co-founder & CTO @ NodeCraft
      - generic [ref=e321]:
        - paragraph [ref=e322]: "\"The side-by-side comparison tool resolved disagreements between hiring managers and founders instantly. The candidate scorecards provide indisputable clarity on who actually has production scale.\""
        - generic [ref=e323]:
          - generic [ref=e324]: DR
          - generic [ref=e325]:
            - paragraph [ref=e326]: Devon Ross
            - paragraph [ref=e327]: VP of People @ CloudSpire
  - generic [ref=e330]:
    - heading "Ready to Modernize Your Recruitment Pipeline?" [level=2] [ref=e331]
    - paragraph [ref=e332]: Join 1,200+ recruiters and founders who hire 10x faster with AI precision. Launch your team workspace right now.
    - generic [ref=e333]:
      - button "Launch Workspace" [ref=e334] [cursor=pointer]
      - button "Explore AI Matching" [ref=e339] [cursor=pointer]
    - paragraph [ref=e343]: Instant workspace provisioning • Full feature access • Setup in 90 seconds
  - contentinfo [ref=e344]:
    - generic [ref=e345]:
      - generic [ref=e346]:
        - generic [ref=e347]:
          - generic [ref=e348]:
            - img "HireSwift AI Logo" [ref=e350]
            - generic [ref=e356]: HireSwiftAI
          - paragraph [ref=e357]: The intelligent Applicant Tracking System built to eliminate hiring friction, auto-score candidates semantically, and build world-class engineering teams.
        - generic [ref=e358]:
          - paragraph [ref=e359]: Product
          - list [ref=e360]:
            - listitem [ref=e361]:
              - button "Resume Parser OCR" [ref=e362] [cursor=pointer]
            - listitem [ref=e363]:
              - button "Semantic Matching" [ref=e364] [cursor=pointer]
            - listitem [ref=e365]:
              - button "Kanban Pipeline" [ref=e366] [cursor=pointer]
            - listitem [ref=e367]:
              - button "Candidate Comparison" [ref=e368] [cursor=pointer]
            - listitem [ref=e369]:
              - button "API & Integrations" [ref=e370] [cursor=pointer]
        - generic [ref=e371]:
          - paragraph [ref=e372]: Resources
          - list [ref=e373]:
            - listitem [ref=e374]:
              - button "Documentation" [ref=e375] [cursor=pointer]
            - listitem [ref=e376]:
              - button "ATS Migration Guide" [ref=e377] [cursor=pointer]
            - listitem [ref=e378]:
              - button "Hiring Benchmarks 2026" [ref=e379] [cursor=pointer]
            - listitem [ref=e380]:
              - button "Engineering Rubrics" [ref=e381] [cursor=pointer]
            - listitem [ref=e382]:
              - link "Customer Stories" [ref=e383] [cursor=pointer]:
                - /url: "#testimonials"
        - generic [ref=e384]:
          - paragraph [ref=e385]: Company
          - list [ref=e386]:
            - listitem [ref=e387]:
              - link "About Us" [ref=e388] [cursor=pointer]:
                - /url: "#features"
            - listitem [ref=e389]:
              - button "Careers (We're Hiring)" [ref=e390] [cursor=pointer]
            - listitem [ref=e391]:
              - button "Privacy Policy" [ref=e392] [cursor=pointer]
            - listitem [ref=e393]:
              - button "Terms of Service" [ref=e394] [cursor=pointer]
            - listitem [ref=e395]:
              - button "Security & SOC2" [ref=e396] [cursor=pointer]
      - generic [ref=e397]:
        - paragraph [ref=e398]: © 2026 HireSwift AI, Inc. Built for modern high-velocity recruitment.
        - generic [ref=e399]:
          - link "HireSwift AI on GitHub" [ref=e400] [cursor=pointer]:
            - /url: https://github.com/bikram73/HireSwift_AI
            - generic [ref=e403]: GitHub
          - link "HireSwift AI on YouTube" [ref=e404] [cursor=pointer]:
            - /url: https://www.youtube.com/@bikramtechzzz
            - generic [ref=e407]: YouTube
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | function buildRealPdfBuffer(text: string): Buffer {
  4   |   const safe = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  5   |   const streamContent = `BT\n/F1 12 Tf\n72 720 Td\n(${safe}) Tj\nET`;
  6   |   const objects = [
  7   |     '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  8   |     '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  9   |     '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n',
  10  |     '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  11  |     `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  12  |   ];
  13  |   let pdf = '%PDF-1.4\n';
  14  |   const offsets: number[] = [0];
  15  |   for (const obj of objects) {
  16  |     offsets.push(pdf.length);
  17  |     pdf += obj;
  18  |   }
  19  |   const xrefPos = pdf.length;
  20  |   pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  21  |   for (let i = 1; i < offsets.length; i++) {
  22  |     pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  23  |   }
  24  |   pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  25  |   return Buffer.from(pdf, 'utf8');
  26  | }
  27  | 
  28  | test.describe('HireSwift AI End-to-End Browser Verification', () => {
  29  |   test('LAND-001..009 & NAV-001..018: Landing Page, 14 Workspace Views & Cmd+K Navigation without Runtime Errors', async ({
  30  |     page,
  31  |   }) => {
  32  |     const pageErrors: string[] = [];
  33  |     page.on('pageerror', (err) => pageErrors.push(err.message));
  34  | 
  35  |     const loadStart = Date.now();
  36  |     await page.goto('/');
  37  |     await expect(page.getByText(/HireSwift/i).first()).toBeVisible();
  38  |     await expect(page.locator('svg[aria-label="HireSwift AI Logo"]').first()).toBeVisible();
  39  |     const landingLoadMs = Date.now() - loadStart;
> 40  |     expect(landingLoadMs).toBeLessThan(3500);
      |                           ^ Error: expect(received).toBeLessThan(expected)
  41  | 
  42  |     // Enter workspace via primary CTA
  43  |     await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
  44  |     await expect(page.getByRole('heading', { name: /Good Morning, Recruiter|Recruitment Dashboard|Dashboard/i }).first()).toBeVisible();
  45  | 
  46  |     const navLabels = [
  47  |       'Candidates',
  48  |       'Resume Upload',
  49  |       'Job Management',
  50  |       'AI Matching',
  51  |       'Candidate Ranking',
  52  |       'Hiring Pipeline',
  53  |       'Compare Candidates',
  54  |       'Skill Gap Analysis',
  55  |       'Email Center',
  56  |       'Reports',
  57  |       'Settings',
  58  |       'Help Center',
  59  |       'Dashboard',
  60  |     ];
  61  | 
  62  |     for (const label of navLabels) {
  63  |       await page.locator('aside button', { hasText: label }).first().click();
  64  |       await page.waitForTimeout(80);
  65  |       const box = await page.locator('main h1').first().boundingBox();
  66  |       expect(box, `${label} h1 missing`).not.toBeNull();
  67  |       expect(box!.y, `${label} h1 overlaps fixed header`).toBeGreaterThanOrEqual(72);
  68  |       expect(box!.x, `${label} h1 overlaps fixed sidebar`).toBeGreaterThanOrEqual(250);
  69  |     }
  70  | 
  71  |     // Job Details via Job Management card
  72  |     await page.locator('aside button', { hasText: 'Job Management' }).first().click();
  73  |     await page.getByRole('button', { name: 'Details' }).first().click();
  74  |     await expect(page.getByText(/Job Requirements/i)).toBeVisible();
  75  | 
  76  |     // Ctrl+K Command Modal
  77  |     await page.keyboard.press('Control+k');
  78  |     const cmdInput = page.getByPlaceholder(/Jump to candidate/i);
  79  |     await expect(cmdInput).toBeVisible();
  80  |     await cmdInput.fill('Rahul');
  81  |     await expect(page.getByText('Rahul Sharma').first()).toBeVisible();
  82  |     await page.keyboard.press('Escape');
  83  |     await expect(cmdInput).not.toBeVisible();
  84  | 
  85  |     // Reload returns to Landing Page as designed (LAND-009)
  86  |     await page.reload();
  87  |     await expect(page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first()).toBeVisible();
  88  | 
  89  |     expect(pageErrors).toEqual([]);
  90  |   });
  91  | 
  92  |   test('UI-001..007 & NAV-020: Responsive Viewports Render Without Horizontal Overflow', async ({ page }) => {
  93  |     const viewports = [
  94  |       { width: 1920, height: 1080 },
  95  |       { width: 1440, height: 900 },
  96  |       { width: 1366, height: 768 },
  97  |       { width: 768, height: 1024 },
  98  |       { width: 430, height: 932 },
  99  |       { width: 375, height: 812 },
  100 |       { width: 320, height: 700 },
  101 |     ];
  102 | 
  103 |     await page.goto('/');
  104 |     for (const vp of viewports) {
  105 |       await page.setViewportSize(vp);
  106 |       const overflow = await page.evaluate(
  107 |         () => document.documentElement.scrollWidth - window.innerWidth
  108 |       );
  109 |       expect(overflow, `Landing overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(4);
  110 |     }
  111 | 
  112 |     await page.setViewportSize({ width: 375, height: 812 });
  113 |     await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
  114 | 
  115 |     // Verify mobile quick search button opens Quick Search modal cleanly
  116 |     await expect(page.getByLabel('Open quick search')).toBeVisible();
  117 |     await page.getByLabel('Open quick search').click();
  118 |     await expect(page.getByPlaceholder(/Jump to candidate/i)).toBeVisible();
  119 |     await page.keyboard.press('Escape');
  120 | 
  121 |     await expect(page.getByLabel('Open navigation menu')).toBeVisible();
  122 |     await page.getByLabel('Open navigation menu').click();
  123 |     await expect(page.locator('aside button:visible', { hasText: 'Candidates' }).first()).toBeVisible();
  124 |     await page.locator('aside button:visible', { hasText: 'Candidates' }).first().click();
  125 | 
  126 |     // Verify horizontal overflow safety inside workspace views at desktop, tablet & mobile
  127 |     const responsiveViewLabels = [
  128 |       'Dashboard',
  129 |       'Candidates',
  130 |       'Resume Upload',
  131 |       'Job Management',
  132 |       'AI Matching',
  133 |       'Candidate Ranking',
  134 |       'Hiring Pipeline',
  135 |       'Compare Candidates',
  136 |       'Skill Gap Analysis',
  137 |       'Email Center',
  138 |       'Reports',
  139 |       'Settings',
  140 |       'Help Center',
```