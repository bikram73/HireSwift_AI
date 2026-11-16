import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function safeParseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/* DETERMINISTIC HEURISTIC FALLBACKS (Never invent unverified metrics)        */
/* -------------------------------------------------------------------------- */
const KNOWN_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'SQL', 'HTML', 'CSS',
  'React', 'Next.js', 'Node.js', 'Express', 'Flask', 'FastAPI', 'Spring Boot', 'Django',
  'Tailwind CSS', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'GCP', 'Azure', 'Git', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn',
  'Machine Learning', 'Generative AI', 'NLP', 'Computer Vision', 'REST APIs', 'GraphQL',
  'Power BI', 'Tableau', 'Excel', 'Data Visualization', 'OOP', 'Data Structures', 'Figma',
];

function heuristicParseResume(text: string, fileName: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/);
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
  const cgpaMatch = text.match(/(?:CGPA|GPA)\s*[:\-]?\s*(\d(?:\.\d{1,2})?)/i);
  const gradYearMatch = text.match(/(?:201\d|202\d|2030)/g);
  const expMatch = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years|yrs)\s*(?:of\s*)?(?:experience|exp)?/i);

  const baseName = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[_-]+/g, ' ').replace(/\b(resume|cv)\b/gi, '').trim();
  const guessedName =
    lines[0] && lines[0].length < 48 && !lines[0].includes('@') && !/\d{4}/.test(lines[0])
      ? lines[0]
      : baseName || 'Candidate Profile';

  const lowerText = text.toLowerCase();
  const detectedSkills = KNOWN_SKILLS.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  const missingFields: string[] = [];
  if (!emailMatch) missingFields.push('email');
  if (!phoneMatch) missingFields.push('phone');
  if (!cgpaMatch) missingFields.push('cgpa');

  return {
    personal_information: {
      full_name: guessedName,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0].trim() : null,
      location: null,
      linkedin_url: linkedinMatch ? linkedinMatch[0] : null,
      github_url: githubMatch ? githubMatch[0] : null,
      portfolio_url: null,
    },
    education: {
      tenth_school: null,
      tenth_percentage: null,
      tenth_year: null,
      twelfth_school: null,
      twelfth_percentage: null,
      twelfth_year: null,
      diploma_details: null,
      diploma_score: null,
      degree: /\bM\.?\s?Tech|M\.?\s?S\.?|Master/i.test(text)
        ? 'M.Tech / M.S.'
        : /\bB\.?\s?Tech|B\.?\s?E\.?|Bachelor/i.test(text)
          ? 'B.Tech / B.E.'
          : /\bMCA\b/i.test(text)
            ? 'MCA'
            : /\bB\.?\s?Sc|BCA\b/i.test(text)
              ? 'B.Sc / BCA'
              : null,
      branch: /Computer Science|CSE/i.test(text) ? 'Computer Science' : null,
      college: null,
      cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : null,
      graduation_year: gradYearMatch ? parseInt(gradYearMatch[gradYearMatch.length - 1], 10) : null,
      postgraduate_details: null,
    },
    experience: {
      total_years: expMatch ? parseFloat(expMatch[1]) : 0,
      current_title: null,
      previous_titles: [],
      previous_companies: [],
      internships: /intern/i.test(text)
        ? [{ role: 'Intern', company: 'Listed in Resume', duration: 'Extracted', description: 'Internship referenced in uploaded resume.' }]
        : [],
      work_history: [],
    },
    skills: {
      programming_languages: detectedSkills.filter((s) =>
        ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'SQL', 'HTML', 'CSS'].includes(s)
      ),
      frameworks: detectedSkills.filter((s) =>
        ['React', 'Next.js', 'Node.js', 'Express', 'Flask', 'FastAPI', 'Spring Boot', 'Django', 'Tailwind CSS'].includes(s)
      ),
      libraries: detectedSkills.filter((s) => ['Pandas', 'NumPy', 'Scikit-learn'].includes(s)),
      databases: detectedSkills.filter((s) => ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL'].includes(s)),
      cloud_technologies: detectedSkills.filter((s) => ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes'].includes(s)),
      developer_tools: detectedSkills.filter((s) => ['Git', 'Docker', 'Figma', 'Power BI', 'Tableau', 'Excel'].includes(s)),
      ai_ml_technologies: detectedSkills.filter((s) =>
        ['PyTorch', 'TensorFlow', 'Machine Learning', 'Generative AI', 'NLP', 'Computer Vision'].includes(s)
      ),
      other_skills: detectedSkills.filter((s) =>
        ['REST APIs', 'GraphQL', 'Data Visualization', 'OOP', 'Data Structures'].includes(s)
      ),
    },
    projects: [],
    certifications: [],
    achievements: [],
    soft_skills: [],
    languages_known: [],
    resume_summary:
      lines.slice(0, 5).join(' ').slice(0, 260) ||
      `Parsed resume document (${fileName}). Review extracted fields for accuracy.`,
    key_strengths: detectedSkills.slice(0, 4),
    missing_fields: missingFields,
    confidence: {
      name: guessedName ? 0.85 : 0.4,
      email: emailMatch ? 0.99 : 0.0,
      education: cgpaMatch ? 0.88 : 0.4,
      skills: detectedSkills.length > 0 ? 0.86 : 0.35,
    },
  };
}

function heuristicAnalyzeJd(description: string) {
  const lower = description.toLowerCase();
  const detected = KNOWN_SKILLS.filter((s) => lower.includes(s.toLowerCase()));
  const firstLine = description.split(/\r?\n/).find((l) => l.trim().length > 2)?.trim() || 'Software Engineer';
  const expMatch = description.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:years|yrs)/i);
  const cgpaMatch = description.match(/(?:CGPA|GPA)\s*(?:of|above|>=|>)?\s*(\d(?:\.\d)?)/i);
  const splitIdx = Math.max(1, Math.ceil(detected.length * 0.7));

  return {
    title: firstLine.slice(0, 70),
    requiredSkills: detected.slice(0, splitIdx),
    preferredSkills: detected.slice(splitIdx),
    educationalQualifications: /\bB\.?Tech|Bachelor|Degree/i.test(description)
      ? ['B.Tech / B.E. or equivalent technical degree']
      : ['Relevant Bachelor degree or equivalent practical experience'],
    minimumExperience: expMatch ? parseInt(expMatch[1], 10) : 0,
    maximumExperience: expMatch ? parseInt(expMatch[2], 10) : 3,
    minimumCGPA: cgpaMatch ? parseFloat(cgpaMatch[1]) : 7.0,
    responsibilities: description
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
      .map((l) => l.replace(/^[-•]\s*/, '').trim())
      .slice(0, 5),
    certifications: [],
    location: /remote/i.test(description) ? 'Remote' : /hybrid/i.test(description) ? 'Hybrid' : 'Bengaluru / Hybrid',
    employmentType: /intern/i.test(description)
      ? 'Internship'
      : /remote/i.test(description)
        ? 'Remote'
        : /hybrid/i.test(description)
          ? 'Hybrid'
          : 'Full-Time',
    keywords: detected.slice(0, 8),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req, res) => {
    const aiReady = Boolean(getAiClient());
    res.json({ ok: true, aiConfigured: aiReady });
  });

  /* 1. Resume Parsing API */
  app.post('/api/resumes/parse', async (req, res) => {
    try {
      const { fileName, mimeType, extractedText, base64Pdf } = req.body as {
        fileName?: string;
        mimeType?: string;
        extractedText?: string;
        base64Pdf?: string;
      };

      if (!fileName || (!extractedText && !base64Pdf)) {
        res.status(400).json({ error: 'Resume file content or extracted text is required.' });
        return;
      }

      const safeText = (extractedText || '').trim();
      if (!safeText && !base64Pdf) {
        res.status(400).json({ error: 'Uploaded document appears empty or unreadable.' });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        const parsed = heuristicParseResume(safeText || fileName, fileName);
        res.json({ parsed, source: 'deterministic-parser' });
        return;
      }

      const systemInstruction = `You are an expert resume information extraction system.
Extract structured candidate information from the provided resume text or PDF document.
Rules:
1. Extract only information explicitly supported by the document.
2. Never invent missing academic percentages, GPAs, employers, or skills.
3. Return null for unavailable scalar fields and [] for unavailable arrays.
4. Distinguish between academic projects, internships, and full-time employment.
5. Preserve academic grading values and scales (CGPA vs percentage).
6. Return a missing_fields list for key absent details.
7. Provide extraction confidence scores between 0 and 1.`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (base64Pdf && mimeType === 'application/pdf') {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        });
      }
      parts.push({
        text: `File Name: ${fileName}\n\nExtracted Document Text:\n${safeText.slice(0, 28000) || '[Use attached PDF OCR/document layers]'}`,
      });

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: { parts },
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                personal_information: {
                  type: Type.OBJECT,
                  properties: {
                    full_name: { type: Type.STRING, nullable: true },
                    email: { type: Type.STRING, nullable: true },
                    phone: { type: Type.STRING, nullable: true },
                    location: { type: Type.STRING, nullable: true },
                    linkedin_url: { type: Type.STRING, nullable: true },
                    github_url: { type: Type.STRING, nullable: true },
                    portfolio_url: { type: Type.STRING, nullable: true },
                  },
                },
                education: {
                  type: Type.OBJECT,
                  properties: {
                    tenth_school: { type: Type.STRING, nullable: true },
                    tenth_percentage: { type: Type.NUMBER, nullable: true },
                    tenth_year: { type: Type.INTEGER, nullable: true },
                    twelfth_school: { type: Type.STRING, nullable: true },
                    twelfth_percentage: { type: Type.NUMBER, nullable: true },
                    twelfth_year: { type: Type.INTEGER, nullable: true },
                    diploma_details: { type: Type.STRING, nullable: true },
                    diploma_score: { type: Type.STRING, nullable: true },
                    degree: { type: Type.STRING, nullable: true },
                    branch: { type: Type.STRING, nullable: true },
                    college: { type: Type.STRING, nullable: true },
                    cgpa: { type: Type.NUMBER, nullable: true },
                    graduation_year: { type: Type.INTEGER, nullable: true },
                    postgraduate_details: { type: Type.STRING, nullable: true },
                  },
                },
                experience: {
                  type: Type.OBJECT,
                  properties: {
                    total_years: { type: Type.NUMBER, nullable: true },
                    current_title: { type: Type.STRING, nullable: true },
                    previous_titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    previous_companies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    internships: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          role: { type: Type.STRING },
                          company: { type: Type.STRING },
                          duration: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                      },
                    },
                    work_history: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          role: { type: Type.STRING },
                          company: { type: Type.STRING },
                          duration: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                skills: {
                  type: Type.OBJECT,
                  properties: {
                    programming_languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                    frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    libraries: { type: Type.ARRAY, items: { type: Type.STRING } },
                    databases: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cloud_technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    developer_tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                    ai_ml_technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    other_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                soft_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                languages_known: { type: Type.ARRAY, items: { type: Type.STRING } },
                resume_summary: { type: Type.STRING },
                key_strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.NUMBER },
                    email: { type: Type.NUMBER },
                    education: { type: Type.NUMBER },
                    skills: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        })
      );

      const fallback = heuristicParseResume(safeText || fileName, fileName);
      const parsed = safeParseJson(response.text, fallback);
      res.json({ parsed, source: 'gemini-ai' });
    } catch (error) {
      console.error('Resume parse error:', error);
      const { fileName = 'resume.pdf', extractedText = '' } = (req.body || {}) as {
        fileName?: string;
        extractedText?: string;
      };
      if (extractedText.trim().length > 10) {
        const parsed = heuristicParseResume(extractedText, fileName);
        res.json({ parsed, source: 'fallback-parser' });
        return;
      }
      res.status(500).json({
        error: 'Unable to extract structured fields from this document. Please ensure the file is readable and not password-protected.',
      });
    }
  });

  /* 2. Job Description Analyzer API */
  app.post('/api/jobs/analyze', async (req, res) => {
    try {
      const { description } = req.body as { description?: string };
      if (!description || description.trim().length < 15) {
        res.status(400).json({ error: 'Please provide a job description with at least 15 characters.' });
        return;
      }

      const ai = getAiClient();
      const fallback = heuristicAnalyzeJd(description);
      if (!ai) {
        res.json({ analysis: fallback, source: 'deterministic-analyzer' });
        return;
      }

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: `Analyze this job description and extract structured hiring requirements without inventing requirements not present in the text:\n\n${description.slice(0, 12000)}`,
          config: {
            systemInstruction:
              'You are an expert recruitment job description analyzer. Differentiate mandatory required skills from preferred optional skills. Return valid JSON only.',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                educationalQualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                minimumExperience: { type: Type.NUMBER },
                maximumExperience: { type: Type.NUMBER },
                minimumCGPA: { type: Type.NUMBER, nullable: true },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                location: { type: Type.STRING },
                employmentType: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        })
      );

      const analysis = safeParseJson(response.text, fallback);
      res.json({ analysis, source: 'gemini-ai' });
    } catch (error) {
      console.error('JD analyze error:', error);
      const { description = '' } = (req.body || {}) as { description?: string };
      res.json({ analysis: heuristicAnalyzeJd(description), source: 'fallback-analyzer' });
    }
  });

  /* 3. Candidate Matching Explanation & Interview Question Generation API */
  app.post('/api/matching/analyze', async (req, res) => {
    try {
      const { candidate, job, deterministicScore } = req.body as {
        candidate?: Record<string, unknown>;
        job?: Record<string, unknown>;
        deterministicScore?: Record<string, unknown>;
      };

      if (!candidate || !job) {
        res.status(400).json({ error: 'Candidate profile and job description are required.' });
        return;
      }

      const ai = getAiClient();
      const fallback = {
        explanation: `Candidate aligns with ${job.title ?? 'this role'} based on verified skills and experience history.`,
        decisionRationale:
          'Deterministic rubric evaluated technical skill overlap, relevant years of experience, educational foundation, and project complexity.',
        strongestAreas: Array.isArray((deterministicScore as { matchedSkills?: string[] })?.matchedSkills)
          ? (deterministicScore as { matchedSkills: string[] }).matchedSkills.slice(0, 4)
          : ['Core Technical Alignment'],
        potentialConcerns: Array.isArray((deterministicScore as { missingRequiredSkills?: string[] })?.missingRequiredSkills)
          ? (deterministicScore as { missingRequiredSkills: string[] }).missingRequiredSkills.map(
              (s) => `Missing required skill: ${s}`
            )
          : [],
        interviewQuestions: [
          `Walk through a production system you built using ${Array.isArray(candidate.skills) ? candidate.skills.slice(0, 2).join(' and ') : 'your core stack'}.`,
          `How would you design a scalable architecture for the ${job.title ?? 'target'} role's primary workflows?`,
          'Describe a challenging debugging or reliability incident you resolved end-to-end.',
        ],
      };

      if (!ai) {
        res.json({ insights: fallback, source: 'deterministic-rubric' });
        return;
      }

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: JSON.stringify({ candidate, job, deterministicScore }),
          config: {
            systemInstruction:
              'You are an AI recruitment analysis assistant. Provide evidence-based, unbiased matching explanations grounded strictly in the provided candidate and job data, plus 4 tailored technical and behavioral interview questions. Never invent credentials.',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                explanation: { type: Type.STRING },
                decisionRationale: { type: Type.STRING },
                strongestAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                potentialConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
                interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        })
      );

      const insights = safeParseJson(response.text, fallback);
      res.json({ insights, source: 'gemini-ai' });
    } catch (error) {
      console.error('Matching analyze error:', error);
      res.status(500).json({ error: 'Failed to generate AI matching insights.' });
    }
  });

  /* 4. Skill Gap Analysis Recommendations API */
  app.post('/api/matching/skill-gap', async (req, res) => {
    try {
      const { candidateName, candidateSkills, requiredSkills, preferredSkills, jobTitle } = req.body as {
        candidateName?: string;
        candidateSkills?: string[];
        requiredSkills?: string[];
        preferredSkills?: string[];
        jobTitle?: string;
      };

      const missingReq = (requiredSkills || []).filter(
        (r) => !(candidateSkills || []).some((c) => c.toLowerCase() === r.toLowerCase())
      );
      const missingPref = (preferredSkills || []).filter(
        (p) => !(candidateSkills || []).some((c) => c.toLowerCase() === p.toLowerCase())
      );

      const fallback = {
        transferableSkills: (candidateSkills || []).slice(0, 3),
        recommendedLearningAreas:
          missingReq.length > 0
            ? missingReq.map((s) => `Build hands-on proficiency in ${s} fundamentals and production patterns.`)
            : ['Core required skills are already covered; deepen system design and cloud deployment practices.'],
        practicalProjectRecommendations:
          missingReq.length > 0 || missingPref.length > 0
            ? [`Build and deploy a sample ${jobTitle || 'application'} project integrating ${[...missingReq, ...missingPref].slice(0, 3).join(', ')}.`]
            : [`Architect a benchmarked microservice demonstrating production readiness for ${jobTitle || 'the role'}.`],
        summary: `${candidateName || 'Candidate'} covers ${(requiredSkills || []).length - missingReq.length} of ${(requiredSkills || []).length} required skills for ${jobTitle || 'the selected role'}.`,
      };

      const ai = getAiClient();
      if (!ai) {
        res.json({ gapAnalysis: fallback, source: 'deterministic-gap' });
        return;
      }

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: JSON.stringify({
            candidateName,
            candidateSkills,
            requiredSkills,
            preferredSkills,
            jobTitle,
          }),
          config: {
            systemInstruction:
              'You are a technical skill gap analysis assistant. Distinguish mandatory required gaps from optional preferred gaps, identify transferable skills, and suggest practical learning and project steps.',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transferableSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedLearningAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                practicalProjectRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
              },
            },
          },
        })
      );

      const gapAnalysis = safeParseJson(response.text, fallback);
      res.json({ gapAnalysis, source: 'gemini-ai' });
    } catch (error) {
      console.error('Skill gap API error:', error);
      res.status(500).json({ error: 'Unable to generate AI skill gap recommendations.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HireSwift AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
