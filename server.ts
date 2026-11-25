import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ApiValidationError,
  analyzeJobPayload,
  analyzeMatchingPayload,
  analyzeSkillGapPayload,
  getHealthPayload,
  parseResumePayload,
} from './lib/atsApi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCliArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  const prefix = `${flag}=`;
  const eqArg = process.argv.find((arg) => arg.startsWith(prefix));
  return eqArg ? eqArg.slice(prefix.length) : undefined;
}

const PORT = Number(getCliArg('--port') ?? process.env.PORT) || 3000;
const HOST = getCliArg('--host') ?? process.env.HOST ?? '0.0.0.0';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req, res) => {
    res.json(getHealthPayload());
  });

  /* 1. Resume Parsing API */
  app.post('/api/resumes/parse', async (req, res) => {
    try {
      const result = await parseResumePayload(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error('Resume parse error:', error);
      res.status(500).json({
        error: 'Unable to extract structured fields from this document. Please ensure the file is readable and not password-protected.',
      });
    }
  });

  /* 2. Job Description Analyzer API */
  app.post('/api/jobs/analyze', async (req, res) => {
    try {
      const result = await analyzeJobPayload(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error('JD analyze error:', error);
      res.status(500).json({ error: 'Unable to analyze job description.' });
    }
  });

  /* 3. Candidate Matching Explanation & Interview Question Generation API */
  app.post('/api/matching/analyze', async (req, res) => {
    try {
      const result = await analyzeMatchingPayload(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error('Matching analyze error:', error);
      res.status(500).json({ error: 'Failed to generate AI matching insights.' });
    }
  });

  /* 4. Skill Gap Analysis Recommendations API */
  app.post('/api/matching/skill-gap', async (req, res) => {
    try {
      const result = await analyzeSkillGapPayload(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error('Skill gap API error:', error);
      res.status(500).json({ error: 'Unable to generate AI skill gap recommendations.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        ...(disableHmr ? { hmr: false, ws: false } : {}),
      },
      appType: 'spa',
    });
    vitePromise.catch((err) => {
      console.error('Vite dev middleware initialization failed:', err);
    });
    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`HireSwift AI server running at http://${HOST}:${PORT}`);
  });
}

startServer();
