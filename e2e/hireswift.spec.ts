import { expect, test } from '@playwright/test';

function buildRealPdfBuffer(text: string): Buffer {
  const safe = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const streamContent = `BT\n/F1 12 Tf\n72 720 Td\n(${safe}) Tj\nET`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

test.describe('HireSwift AI End-to-End Browser Verification', () => {
  test('LAND-001..009 & NAV-001..018: Landing Page, 14 Workspace Views & Cmd+K Navigation without Runtime Errors', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const loadStart = Date.now();
    await page.goto('/');
    await expect(page.getByText(/HireSwift/i).first()).toBeVisible();
    await expect(page.locator('svg[aria-label="HireSwift AI Logo"]').first()).toBeVisible();
    const landingLoadMs = Date.now() - loadStart;
    expect(landingLoadMs).toBeLessThan(3500);

    // Enter workspace via primary CTA
    await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
    await expect(page.getByRole('heading', { name: /Good Morning, Recruiter|Recruitment Dashboard|Dashboard/i }).first()).toBeVisible();

    const navLabels = [
      'Candidates',
      'Resume Upload',
      'Job Management',
      'AI Matching',
      'Candidate Ranking',
      'Hiring Pipeline',
      'Compare Candidates',
      'Skill Gap Analysis',
      'Email Center',
      'Reports',
      'Settings',
      'Help Center',
      'Dashboard',
    ];

    for (const label of navLabels) {
      await page.locator('aside button', { hasText: label }).first().click();
      await page.waitForTimeout(80);
    }

    // Job Details via Job Management card
    await page.locator('aside button', { hasText: 'Job Management' }).first().click();
    await page.getByRole('button', { name: 'Details' }).first().click();
    await expect(page.getByText(/Job Requirements/i)).toBeVisible();

    // Ctrl+K Command Modal
    await page.keyboard.press('Control+k');
    const cmdInput = page.getByPlaceholder(/Jump to candidate/i);
    await expect(cmdInput).toBeVisible();
    await cmdInput.fill('Rahul');
    await expect(page.getByText('Rahul Sharma').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(cmdInput).not.toBeVisible();

    // Reload returns to Landing Page as designed (LAND-009)
    await page.reload();
    await expect(page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('UI-001..007 & NAV-020: Responsive Viewports Render Without Horizontal Overflow', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 430, height: 932 },
      { width: 375, height: 812 },
      { width: 320, height: 700 },
    ];

    await page.goto('/');
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow, `Landing overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(4);
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
    await expect(page.getByLabel('Open navigation menu')).toBeVisible();
    await page.getByLabel('Open navigation menu').click();
    await expect(page.locator('aside button:visible', { hasText: 'Candidates' }).first()).toBeVisible();
    await page.locator('aside button:visible', { hasText: 'Candidates' }).first().click();

    // Verify horizontal overflow safety inside workspace views at desktop, tablet & mobile
    for (const viewLabel of ['Dashboard', 'Candidates', 'Hiring Pipeline', 'Candidate Ranking']) {
      for (const vp of [
        { width: 1440, height: 900 },
        { width: 768, height: 1024 },
        { width: 375, height: 812 },
        { width: 320, height: 700 },
      ]) {
        await page.setViewportSize(vp);
        if (vp.width < 1024) {
          const menuBtn = page.getByLabel('Open navigation menu');
          if (await menuBtn.isVisible()) {
            await menuBtn.click();
          }
        }
        await page.locator('aside button:visible', { hasText: viewLabel }).first().click();
        await page.waitForTimeout(60);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow, `${viewLabel} overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(4);
      }
    }
  });

  test('E2E-001 / E2E-003 / E2E-007: Job Creation, Real PDF Upload, Duplicate Detection, Pipeline & Persistence', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();

    // 1. Job Management -> Create New Job + Analyze JD
    await page.locator('aside button', { hasText: 'Job Management' }).first().click();
    await page.getByRole('button', { name: /Create New Job/i }).click();
    await page
      .getByPlaceholder(/Paste job description here/i)
      .fill('Backend Python Engineer (1-3 yrs). Required: Python, FastAPI, SQL. Preferred: Docker, AWS. Min CGPA 7.5.');
    await page.getByRole('button', { name: /Analyze JD with AI/i }).click();
    await expect(page.getByText(/JD requirements extracted/i)).toBeVisible({ timeout: 25000 });
    await page.getByRole('button', { name: /Publish Job/i }).click();

    // 2. Resume Upload -> Real PDF upload + parsing + Duplicate detection
    await page.locator('aside button', { hasText: 'Resume Upload' }).first().click();
    const pdfBuf = buildRealPdfBuffer(
      'Karan Malhotra | karan.malhotra@example.com | +91-9876501234 | B.Tech CSE 2024 | CGPA: 8.7 | Skills: Python, FastAPI, SQL, Docker'
    );

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'Karan_Malhotra_Resume.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuf,
    });
    await page.getByRole('button', { name: /Start AI Resume Parsing/i }).click();
    await expect(page.getByText(/Successfully Parsed/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Karan Malhotra/i).first()).toBeVisible();

    // Upload identical PDF again -> Exact Duplicate detected
    await fileInput.setInputFiles({
      name: 'Karan_Malhotra_Copy.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuf,
    });
    await page.getByRole('button', { name: /Start AI Resume Parsing/i }).click();
    await expect(page.getByText(/Duplicate Detected/i)).toBeVisible({ timeout: 30000 });

    // 3. Candidates Directory + Drawer + Stage Move + Reload Persistence
    await page.locator('aside button', { hasText: 'Candidates' }).first().click();
    await page.getByPlaceholder(/Search name, email/i).fill('Karan Malhotra');
    await expect(page.getByText('Karan Malhotra').first()).toBeVisible();
    await page.getByText('Karan Malhotra').first().click();
    await page.getByRole('button', { name: /Shortlist/i }).first().click();
    await page.getByLabel('Close candidate details').click();

    // 4. Reload persistence check (persists in localStorage even when landing reloads first)
    await page.reload();
    await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();
    await page.locator('aside button', { hasText: 'Candidates' }).first().click();
    await page.getByPlaceholder(/Search name, email/i).fill('Karan Malhotra');
    await expect(page.getByText('Karan Malhotra').first()).toBeVisible();

    // 5. Security & privacy check: no API key literals and no raw resumeTextPreview in localStorage
    const privacyAudit = await page.evaluate(() => {
      const storage = JSON.stringify(localStorage);
      return {
        hasSecret: /AIzaSy|sk-or-|gsk_/.test(storage),
        hasRawResumeText: /"resumeTextPreview"/.test(storage) || /"resumeObjectUrl"/.test(storage),
      };
    });
    expect(privacyAudit.hasSecret).toBe(false);
    expect(privacyAudit.hasRawResumeText).toBe(false);
  });

  test('E2E-002 / DEFECT-4..7 / COMP / RANK / SKILL / MAIL / SET: Real DOCX upload & interactive workflow regression', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: /Enter Workspace|Launch Workspace|Open Workspace/i }).first().click();

    // Verify DOCX extraction AND malformed/unsupported file failure isolation in real Chromium
    const { buildRealDocxBytes } = await import('../tests/fixtures');
    const docxBytes = await buildRealDocxBytes(
      'Sneha Iyer | sneha.iyer.qa@example.com | +91-98111-22334 | B.Tech CS 2025 | CGPA: 9.1 | Skills: React, TypeScript, Tailwind CSS'
    );
    await page.locator('aside button', { hasText: 'Resume Upload' }).first().click();
    await page.locator('input[type="file"]').setInputFiles([
      {
        name: 'Sneha_Iyer_Resume.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from(docxBytes),
      },
      {
        name: 'corrupt_resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('NOT_A_VALID_PDF', 'utf8'),
      },
    ]);
    await page.getByRole('button', { name: /Start AI Resume Parsing/i }).click();
    await expect(page.getByText(/Successfully Parsed/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Failed/i).first()).toBeVisible();

    // Candidates: Sort Name A-Z & Rows per page 20
    await page.locator('aside button', { hasText: 'Candidates' }).first().click();
    const filterStart = Date.now();
    await page.getByLabel('Rows per page').selectOption('20');
    await expect(page.getByText(/Showing 1–20 of 31 candidates/i)).toBeVisible();
    expect(Date.now() - filterStart).toBeLessThan(500);

    // Candidate Ranking: Top 5 & Name (A-Z) sort
    await page.locator('aside button', { hasText: 'Candidate Ranking' }).first().click();
    await page.getByLabel('Ranking Sort Order').selectOption('name');
    await expect(page.getByRole('heading', { name: 'Candidate Ranking' })).toBeVisible();

    // Job Management: Delete confirmation + Cancel
    await page.locator('aside button', { hasText: 'Job Management' }).first().click();
    await page.getByTitle('Delete job').first().click();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Skill Gap Analysis
    await page.locator('aside button', { hasText: 'Skill Gap Analysis' }).first().click();
    await expect(page.getByText(/Missing Required \(Mandatory\)/i)).toBeVisible();

    // Email Center: Download .eml button present
    await page.locator('aside button', { hasText: 'Email Center' }).first().click();
    await expect(page.getByRole('button', { name: /Download \.eml/i })).toBeVisible();

    // Settings: Clear Session confirmation + Cancel
    await page.locator('aside button', { hasText: 'Settings' }).first().click();
    await page.getByRole('button', { name: /Clear Session Data/i }).click();
    await expect(page.getByRole('button', { name: /Confirm Clear All/i })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(pageErrors).toEqual([]);
  });
});
