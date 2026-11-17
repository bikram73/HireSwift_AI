import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiValidationError,
  analyzeJobPayload,
  analyzeMatchingPayload,
  analyzeSkillGapPayload,
  getHealthPayload,
  heuristicParseResume,
  parseResumePayload,
} from '../lib/atsApi';
import netlifyHandler from '../netlify/functions/api';

function buildTestExpressApp() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));
  app.get('/api/health', (_req, res) => {
    res.json(getHealthPayload());
  });
  app.post('/api/resumes/parse', async (req, res) => {
    try {
      res.json(await parseResumePayload(req.body));
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Unable to parse resume' });
    }
  });
  app.post('/api/jobs/analyze', async (req, res) => {
    try {
      res.json(await analyzeJobPayload(req.body));
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Unable to analyze job' });
    }
  });
  app.post('/api/matching/analyze', async (req, res) => {
    try {
      res.json(await analyzeMatchingPayload(req.body));
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Unable to analyze match' });
    }
  });
  app.post('/api/matching/skill-gap', async (req, res) => {
    try {
      res.json(await analyzeSkillGapPayload(req.body));
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Unable to analyze skill gap' });
    }
  });
  return app;
}

describe('Backend API (Express & Netlify Function Parity - Mode B Fallback)', () => {
  const app = buildTestExpressApp();
  const savedEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    vi.restoreAllMocks();
  });

  it('API-001/003/005: Health reports unconfigured in Mode B and unknown route returns 404', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.aiConfigured).toBe(false);
    expect(res.body.providers).toEqual({ gemini: false, openrouter: false, groq: false });

    const notFound = await request(app).get('/api/unknown-route');
    expect(notFound.status).toBe(404);
  });

  it('API-006/008/009/013 & FALL-001..008: /api/resumes/parse validates empty & extracts text cleanly', async () => {
    const empty = await request(app).post('/api/resumes/parse').send({});
    expect(empty.status).toBe(400);

    const missingName = await request(app)
      .post('/api/resumes/parse')
      .send({ extractedText: 'Python Developer' });
    expect(missingName.status).toBe(400);

    const valid = await request(app).post('/api/resumes/parse').send({
      fileName: 'sample_resume.pdf',
      mimeType: 'application/pdf',
      extractedText:
        'Rahul Sharma\nrahul.sharma@example.com | +91 9876543210\nPython Developer. Skills: Python, React, SQL. B.E. Computer Science 2024 CGPA: 8.6',
    });
    expect(valid.status).toBe(200);
    expect(valid.body.source).toBe('fallback-parser');
    expect(valid.body.parsed.personal_information.full_name).toBe('Rahul Sharma');
    expect(valid.body.parsed.personal_information.email).toBe('rahul.sharma@example.com');
    expect(valid.body.parsed.education.cgpa).toBe(8.6);
    expect(valid.body.parsed.skills.programming_languages).toContain('Python');
  });

  it('BUG CHECK [DEFECT-9]: Heuristic internship regex should not trigger on word "international"', () => {
    const parsed = heuristicParseResume(
      'John Doe\njohn@example.com\nSenior Engineer working on international payments and React, TypeScript. 4 years experience.',
      'john.pdf'
    );
    expect(parsed.experience.internships).toEqual([]);
  });

  it('BUG CHECK [DEFECT-10]: Scanned PDF without AI returns 422 actionable OCR message instead of 500', async () => {
    const res = await request(app).post('/api/resumes/parse').send({
      fileName: 'scanned.pdf',
      mimeType: 'application/pdf',
      extractedText: '',
      base64Pdf: 'JVBERi0xLjQK',
    });
    expect(res.status).toBe(422);
    expect(res.body.error.toLowerCase()).toContain('scanned');
  });

  it('API-015..019 & JD-009/011: /api/jobs/analyze validates short/empty JD and extracts valid JD', async () => {
    const empty = await request(app).post('/api/jobs/analyze').send({});
    expect(empty.status).toBe(400);

    const short = await request(app).post('/api/jobs/analyze').send({ description: 'Too short' });
    expect(short.status).toBe(400);

    const valid = await request(app).post('/api/jobs/analyze').send({
      description:
        "We are looking for a Python Developer with 0-2 years of experience. Required skills: Python, Flask, SQL. Preferred skills: Docker, AWS. Bachelor's degree in Computer Science. Minimum CGPA 7.5.",
    });
    expect(valid.status).toBe(200);
    expect(valid.body.source).toBe('fallback-analyzer');
    expect(valid.body.analysis.minimumExperience).toBe(0);
    expect(valid.body.analysis.maximumExperience).toBe(2);
    expect(valid.body.analysis.minimumCGPA).toBe(7.5);
    expect(valid.body.analysis.requiredSkills.length).toBeGreaterThan(0);
  });

  it('BUG CHECK [DEFECT-2]: Unrelated text in heuristic JD analyzer must not fabricate CGPA 7.0 or location Bengaluru', async () => {
    const res = await request(app).post('/api/jobs/analyze').send({
      description: 'Looking for someone enthusiastic about teamwork and community operations.',
    });
    expect(res.status).toBe(200);
    expect(res.body.analysis.minimumCGPA).toBeNull();
    expect(res.body.analysis.location).not.toBe('Bengaluru / Hybrid');
  });

  it('API-021..025: /api/matching/analyze validates missing candidate/job and falls back safely', async () => {
    const missCand = await request(app).post('/api/matching/analyze').send({ job: { title: 'Dev' } });
    expect(missCand.status).toBe(400);

    const missJob = await request(app).post('/api/matching/analyze').send({ candidate: { name: 'A' } });
    expect(missJob.status).toBe(400);

    const valid = await request(app).post('/api/matching/analyze').send({
      candidate: { name: 'Aarav', skills: ['Python', 'SQL'] },
      job: { title: 'Python Dev', requiredSkills: ['Python', 'SQL'] },
      deterministicScore: { overallScore: 90, matchedSkills: ['Python', 'SQL'], missingRequiredSkills: [] },
    });
    expect(valid.status).toBe(200);
    expect(valid.body.source).toBe('fallback-rubric');
    expect(valid.body.insights.interviewQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it('BUG CHECK [DEFECT-10b / API-031]: /api/matching/skill-gap rejects completely empty {} request with 400', async () => {
    const empty = await request(app).post('/api/matching/skill-gap').send({});
    expect(empty.status).toBe(400);
  });

  it('AI-011/012/013: OpenRouter fails -> cascades cleanly to Groq -> succeeds with groq-ai', async () => {
    process.env.OPENROUTER_API_KEY = 'fake-or-key';
    process.env.GROQ_API_KEY = 'fake-groq-key';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes('openrouter.ai')) {
        return new Response('Rate limited', { status: 429 });
      }
      if (u.includes('api.groq.com')) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    transferableSkills: ['Python'],
                    recommendedLearningAreas: ['Learn FastAPI async patterns'],
                    practicalProjectRecommendations: ['Build a FastAPI service'],
                    summary: 'Groq evaluated summary',
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('Not Found', { status: 404 });
    });

    const res = await request(app).post('/api/matching/skill-gap').send({
      candidateName: 'Priya',
      candidateSkills: ['Python'],
      requiredSkills: ['Python', 'FastAPI'],
      preferredSkills: [],
      jobTitle: 'Backend Engineer',
    });

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('groq-ai');
    expect(res.body.gapAnalysis.summary).toBe('Groq evaluated summary');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('NET-003..008 & Security: Netlify function handler handles OPTIONS CORS, 405, 404, and all routes identically', async () => {
    const preflight = await netlifyHandler(
      new Request('https://hireswift-ai.netlify.app/api/health', { method: 'OPTIONS' })
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const health = await netlifyHandler(
      new Request('https://hireswift-ai.netlify.app/.netlify/functions/api/health', { method: 'GET' })
    );
    expect(health.status).toBe(200);
    expect((await health.json()).ok).toBe(true);

    const wrongMethod = await netlifyHandler(
      new Request('https://hireswift-ai.netlify.app/api/resumes/parse', { method: 'DELETE' })
    );
    expect(wrongMethod.status).toBe(405);

    const unknown = await netlifyHandler(
      new Request('https://hireswift-ai.netlify.app/api/does-not-exist', { method: 'POST', body: '{}' })
    );
    expect(unknown.status).toBe(404);

    const jdRes = await netlifyHandler(
      new Request('https://hireswift-ai.netlify.app/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Frontend Developer 1-3 years React, TypeScript, CSS, Tailwind CSS.',
        }),
      })
    );
    expect(jdRes.status).toBe(200);
    const jdJson = await jdRes.json();
    expect(jdJson.analysis.requiredSkills).toContain('React');
  });
});
