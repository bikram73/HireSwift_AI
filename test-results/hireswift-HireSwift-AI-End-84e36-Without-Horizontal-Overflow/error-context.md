# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hireswift.spec.ts >> HireSwift AI End-to-End Browser Verification >> UI-001..007 & NAV-020: Responsive Viewports Render Without Horizontal Overflow
- Location: e2e/hireswift.spec.ts:92:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('aside button:visible').filter({ hasText: 'Skill Gap Analysis' }).first()
    - locator resolved to <button type="button" aria-current="page" class="w-full flex items-center gap-space-md px-space-md py-2.5 lg:py-2 rounded-xl transition-all text-left cursor-pointer bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white font-semibold shadow-lg shadow-indigo-600/25 border border-white/15">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic "Back to HireSwift AI Landing Page" [ref=e9] [cursor=pointer]:
            - img "HireSwift AI Logo" [ref=e11]
            - generic [ref=e17]:
              - generic [ref=e18]: HireSwiftAI
              - generic [ref=e20]: AI Recruitment
          - button "Close navigation menu" [ref=e21] [cursor=pointer]:
            - generic [ref=e22]: close
        - navigation [ref=e23]:
          - generic [ref=e24]: Workspace
          - button "dashboard Dashboard" [ref=e25] [cursor=pointer]:
            - generic [ref=e26]: dashboard
            - generic [ref=e27]: Dashboard
          - button "group Candidates" [ref=e28] [cursor=pointer]:
            - generic [ref=e29]: group
            - generic [ref=e30]: Candidates
          - button "upload_file Resume Upload" [ref=e31] [cursor=pointer]:
            - generic [ref=e32]: upload_file
            - generic [ref=e33]: Resume Upload
          - button "work Job Management" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: work
            - generic [ref=e36]: Job Management
          - button "psychology AI Matching" [ref=e37] [cursor=pointer]:
            - generic [ref=e38]: psychology
            - generic [ref=e39]: AI Matching
          - button "leaderboard Candidate Ranking" [ref=e40] [cursor=pointer]:
            - generic [ref=e41]: leaderboard
            - generic [ref=e42]: Candidate Ranking
          - button "view_kanban Hiring Pipeline" [ref=e43] [cursor=pointer]:
            - generic [ref=e44]: view_kanban
            - generic [ref=e45]: Hiring Pipeline
          - button "compare_arrows Compare Candidates" [ref=e46] [cursor=pointer]:
            - generic [ref=e47]: compare_arrows
            - generic [ref=e48]: Compare Candidates
          - button "troubleshoot Skill Gap Analysis" [ref=e49] [cursor=pointer]:
            - generic [ref=e50]: troubleshoot
            - generic [ref=e51]: Skill Gap Analysis
          - button "mark_email_unread Email Center" [ref=e52] [cursor=pointer]:
            - generic [ref=e53]: mark_email_unread
            - generic [ref=e54]: Email Center
          - button "insights Reports" [ref=e55] [cursor=pointer]:
            - generic [ref=e56]: insights
            - generic [ref=e57]: Reports
      - navigation [ref=e59]:
        - button "settings Settings" [ref=e60] [cursor=pointer]:
          - generic [ref=e61]: settings
          - generic [ref=e62]: Settings
        - button "help Help Center" [ref=e63] [cursor=pointer]:
          - generic [ref=e64]: help
          - generic [ref=e65]: Help Center
    - generic [ref=e66]:
      - banner [ref=e67]:
        - generic [ref=e68]:
          - button "Open navigation menu" [active] [ref=e69] [cursor=pointer]:
            - generic [ref=e70]: menu
          - generic [ref=e71]: Skill Gap Analysis
        - generic [ref=e73]:
          - button "Open quick search" [ref=e74] [cursor=pointer]:
            - generic [ref=e75]: search
          - button "auto_awesome Analyze" [ref=e76] [cursor=pointer]:
            - generic [ref=e77]: auto_awesome
            - generic [ref=e78]: Analyze
      - main [ref=e79]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]:
              - heading "Skill Gap Analysis" [level=1] [ref=e84]
              - paragraph [ref=e85]: Distinguish mandatory required gaps from optional preferred gaps and generate AI upskilling paths.
            - generic [ref=e86]:
              - combobox [ref=e87]:
                - 'option "Candidate: Rahul Sharma" [selected]'
                - 'option "Candidate: Priya Verma"'
                - 'option "Candidate: Arjun Kumar"'
                - 'option "Candidate: Sneha Reddy"'
                - 'option "Candidate: Karan Patel"'
                - 'option "Candidate: Ananya Das"'
                - 'option "Candidate: Sarah Chen"'
                - 'option "Candidate: Alex Rivera"'
                - 'option "Candidate: Meera Nair"'
                - 'option "Candidate: Rohan Mehta"'
                - 'option "Candidate: Vikram Singh"'
                - 'option "Candidate: Ishita Banerjee"'
                - 'option "Candidate: Aditya Joshi"'
                - 'option "Candidate: Neha Kulkarni"'
                - 'option "Candidate: Siddharth Rao"'
                - 'option "Candidate: Pooja Iyer"'
                - 'option "Candidate: Devansh Kapoor"'
                - 'option "Candidate: Tanvi Deshmukh"'
                - 'option "Candidate: Kabir Malhotra"'
                - 'option "Candidate: Riya Chatterjee"'
                - 'option "Candidate: Manish Tiwari"'
                - 'option "Candidate: Aarav Gupta"'
                - 'option "Candidate: Shruti Menon"'
                - 'option "Candidate: Nikhil Verma"'
                - 'option "Candidate: Divya Krishnan"'
                - 'option "Candidate: Pranav Kulkarni"'
                - 'option "Candidate: Zoya Khan"'
                - 'option "Candidate: Harshvardhan Jain"'
                - 'option "Candidate: Sneha R."'
                - 'option "Candidate: Maria Garcia"'
              - combobox [ref=e88]:
                - 'option "Job: Python Developer" [selected]'
                - 'option "Job: Full Stack Developer"'
                - 'option "Job: AI/ML Engineer"'
                - 'option "Job: Data Analyst"'
                - 'option "Job: Frontend Developer"'
                - 'option "Job: Junior Java Developer"'
              - button "add_circle Custom Role" [ref=e89] [cursor=pointer]:
                - generic [ref=e90]: add_circle
                - generic [ref=e91]: Custom Role
              - button "auto_awesome AI Recommendations" [ref=e92] [cursor=pointer]:
                - generic [ref=e93]: auto_awesome
                - generic [ref=e94]: AI Recommendations
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]: Matched Skills (7)
              - generic [ref=e98]:
                - generic [ref=e99]: Python
                - generic [ref=e100]: Flask
                - generic [ref=e101]: REST APIs
                - generic [ref=e102]: SQL
                - generic [ref=e103]: Git
                - generic [ref=e104]: Docker
                - generic [ref=e105]: AWS
            - generic [ref=e106]:
              - generic [ref=e107]: Missing Required (Mandatory)
              - generic [ref=e108]: All mandatory skills covered
            - generic [ref=e110]:
              - generic [ref=e111]: Missing Preferred (Optional)
              - generic [ref=e112]: All optional skills covered
            - generic [ref=e114]: Transferable Skills
          - generic [ref=e116]:
            - heading "Applicant Cohort Skill Coverage for Python Developer" [level=3] [ref=e117]
            - generic [ref=e119]:
              - generic [ref=e120]:
                - paragraph [ref=e121]: Python
                - generic [ref=e122]: Required
              - generic [ref=e123]: 15 of 30 candidates (50%)
            - generic [ref=e128]:
              - generic [ref=e129]:
                - paragraph [ref=e130]: Flask
                - generic [ref=e131]: Required
              - generic [ref=e132]: 4 of 30 candidates (13%)
            - generic [ref=e137]:
              - generic [ref=e138]:
                - paragraph [ref=e139]: REST APIs
                - generic [ref=e140]: Required
              - generic [ref=e141]: 11 of 30 candidates (37%)
            - generic [ref=e146]:
              - generic [ref=e147]:
                - paragraph [ref=e148]: SQL
                - generic [ref=e149]: Required
              - generic [ref=e150]: 15 of 30 candidates (50%)
            - generic [ref=e155]:
              - generic [ref=e156]:
                - paragraph [ref=e157]: Git
                - generic [ref=e158]: Required
              - generic [ref=e159]: 8 of 30 candidates (27%)
            - generic [ref=e164]:
              - generic [ref=e165]:
                - paragraph [ref=e166]: Docker
                - generic [ref=e167]: Preferred
              - generic [ref=e168]: 6 of 30 candidates (20%)
            - generic [ref=e173]:
              - generic [ref=e174]:
                - paragraph [ref=e175]: AWS
                - generic [ref=e176]: Preferred
              - generic [ref=e177]: 3 of 30 candidates (10%)
  - generic [aria-hidden] [ref=e181]: 11-14
```

# Test source

```ts
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
  141 |     ];
  142 |     for (const viewLabel of responsiveViewLabels) {
  143 |       for (const vp of [
  144 |         { width: 1440, height: 900 },
  145 |         { width: 768, height: 1024 },
  146 |         { width: 375, height: 812 },
  147 |         { width: 320, height: 700 },
  148 |       ]) {
  149 |         await page.setViewportSize(vp);
  150 |         if (vp.width < 1024) {
  151 |           const menuBtn = page.getByLabel('Open navigation menu');
  152 |           if (await menuBtn.isVisible()) {
  153 |             await menuBtn.click();
  154 |           }
  155 |         }
> 156 |         await page.locator('aside button:visible', { hasText: viewLabel }).first().click();
      |                                                                                    ^ Error: locator.click: Test timeout of 45000ms exceeded.
  157 |         await page.waitForTimeout(60);
  158 |         const overflow = await page.evaluate(
  159 |           () => document.documentElement.scrollWidth - window.innerWidth
  160 |         );
  161 |         expect(overflow, `${viewLabel} overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(4);
  162 |       }
  163 |     }
  164 |   });
  165 | 
  166 |   test('E2E-001 / E2E-003 / E2E-007: Job Creation, Real PDF Upload, Duplicate Detection, Pipeline & Persistence', async ({
  167 |     page,
  168 |   }) => {
  169 |     await page.goto('/');
  170 |     await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
  171 | 
  172 |     // 1. Job Management -> Create New Job + Analyze JD
  173 |     await page.locator('aside button', { hasText: 'Job Management' }).first().click();
  174 |     await page.getByRole('button', { name: /Create New Job/i }).click();
  175 |     await page
  176 |       .getByPlaceholder(/Paste job description here/i)
  177 |       .fill('Backend Python Engineer (1-3 yrs). Required: Python, FastAPI, SQL. Preferred: Docker, AWS. Min CGPA 7.5.');
  178 |     await page.getByRole('button', { name: /Analyze JD with AI/i }).click();
  179 |     await expect(page.getByText(/JD requirements extracted/i)).toBeVisible({ timeout: 25000 });
  180 |     await page.getByRole('button', { name: /Publish Job/i }).click();
  181 | 
  182 |     // 2. Resume Upload -> Real PDF upload + parsing + Duplicate detection
  183 |     await page.locator('aside button', { hasText: 'Resume Upload' }).first().click();
  184 |     const pdfBuf = buildRealPdfBuffer(
  185 |       'Karan Malhotra | karan.malhotra@example.com | +91-9876501234 | B.Tech CSE 2024 | CGPA: 8.7 | Skills: Python, FastAPI, SQL, Docker'
  186 |     );
  187 | 
  188 |     const fileInput = page.locator('input[type="file"]');
  189 |     await fileInput.setInputFiles({
  190 |       name: 'Karan_Malhotra_Resume.pdf',
  191 |       mimeType: 'application/pdf',
  192 |       buffer: pdfBuf,
  193 |     });
  194 |     await page.getByRole('button', { name: /Start AI Resume Parsing/i }).click();
  195 |     await expect(page.getByText(/Successfully Parsed/i)).toBeVisible({ timeout: 30000 });
  196 |     await expect(page.getByText(/Karan Malhotra/i).first()).toBeVisible();
  197 | 
  198 |     // Upload identical PDF again -> Exact Duplicate detected
  199 |     await fileInput.setInputFiles({
  200 |       name: 'Karan_Malhotra_Copy.pdf',
  201 |       mimeType: 'application/pdf',
  202 |       buffer: pdfBuf,
  203 |     });
  204 |     await page.getByRole('button', { name: /Start AI Resume Parsing/i }).click();
  205 |     await expect(page.getByText(/Duplicate Detected/i)).toBeVisible({ timeout: 30000 });
  206 | 
  207 |     // 3. Candidates Directory + Drawer + Stage Move + Reload Persistence
  208 |     await page.locator('aside button', { hasText: 'Candidates' }).first().click();
  209 |     await page.getByPlaceholder(/Search name, email/i).fill('Karan Malhotra');
  210 |     await expect(page.getByText('Karan Malhotra').first()).toBeVisible();
  211 |     await page.getByText('Karan Malhotra').first().click();
  212 |     await page.getByRole('button', { name: /Shortlist/i }).first().click();
  213 |     await page.getByLabel('Close candidate details').click();
  214 | 
  215 |     // 4. Reload persistence check (persists in localStorage even when landing reloads first)
  216 |     await page.reload();
  217 |     await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
  218 |     await page.locator('aside button', { hasText: 'Candidates' }).first().click();
  219 |     await page.getByPlaceholder(/Search name, email/i).fill('Karan Malhotra');
  220 |     await expect(page.getByText('Karan Malhotra').first()).toBeVisible();
  221 | 
  222 |     // 5. Security & privacy check: no API key literals and no raw resumeTextPreview in localStorage
  223 |     const privacyAudit = await page.evaluate(() => {
  224 |       const storage = JSON.stringify(localStorage);
  225 |       return {
  226 |         hasSecret: /AIzaSy|sk-or-|gsk_/.test(storage),
  227 |         hasRawResumeText: /"resumeTextPreview"/.test(storage) || /"resumeObjectUrl"/.test(storage),
  228 |       };
  229 |     });
  230 |     expect(privacyAudit.hasSecret).toBe(false);
  231 |     expect(privacyAudit.hasRawResumeText).toBe(false);
  232 |   });
  233 | 
  234 |   test('E2E-002 / DEFECT-4..7 / COMP / RANK / SKILL / MAIL / SET: Real DOCX upload & interactive workflow regression', async ({
  235 |     page,
  236 |   }) => {
  237 |     const pageErrors: string[] = [];
  238 |     page.on('pageerror', (err) => pageErrors.push(err.message));
  239 | 
  240 |     await page.goto('/');
  241 |     await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
  242 | 
  243 |     // Verify DOCX extraction AND malformed/unsupported file failure isolation in real Chromium
  244 |     const { buildRealDocxBytes } = await import('../tests/fixtures');
  245 |     const docxBytes = await buildRealDocxBytes(
  246 |       'Sneha Iyer | sneha.iyer.qa@example.com | +91-98111-22334 | B.Tech CS 2025 | CGPA: 9.1 | Skills: React, TypeScript, Tailwind CSS'
  247 |     );
  248 |     await page.locator('aside button', { hasText: 'Resume Upload' }).first().click();
  249 |     await page.locator('input[type="file"]').setInputFiles([
  250 |       {
  251 |         name: 'Sneha_Iyer_Resume.docx',
  252 |         mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253 |         buffer: Buffer.from(docxBytes),
  254 |       },
  255 |       {
  256 |         name: 'corrupt_resume.pdf',
```