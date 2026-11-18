import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
}

function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
}

function getGroqModel(): string {
  return process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
}

export type AiSource =
  | 'gemini-ai'
  | 'openrouter-ai'
  | 'groq-ai'
  | 'deterministic-parser'
  | 'fallback-parser'
  | 'deterministic-analyzer'
  | 'fallback-analyzer'
  | 'deterministic-rubric'
  | 'fallback-rubric'
  | 'deterministic-gap'
  | 'fallback-gap';

export class ApiValidationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getAiClient(): GoogleGenAI | null {
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

function getOpenRouterApiKey(): string | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'MY_OPENROUTER_API_KEY') {
    return null;
  }
  return apiKey;
}

function getGroqApiKey(): string | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    return null;
  }
  return apiKey;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 1): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 450 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function tryParseJsonObject<T extends Record<string, unknown>>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const jsonSlice =
      firstBrace !== -1 && lastBrace > firstBrace
        ? cleaned.slice(firstBrace, lastBrace + 1)
        : cleaned;
    const parsed = JSON.parse(jsonSlice);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as T;
    }
    return null;
  } catch {
    return null;
  }
}

function mergeWithFallback<T extends Record<string, unknown>>(parsed: Partial<T>, fallback: T): T {
  const result = { ...fallback };
  for (const key of Object.keys(parsed) as Array<keyof T>) {
    const val = parsed[key];
    if (val !== undefined) {
      if (
        val !== null &&
        typeof val === 'object' &&
        !Array.isArray(val) &&
        fallback[key] &&
        typeof fallback[key] === 'object' &&
        !Array.isArray(fallback[key])
      ) {
        result[key] = {
          ...(fallback[key] as Record<string, unknown>),
          ...(val as Record<string, unknown>),
        } as T[keyof T];
      } else {
        result[key] = val as T[keyof T];
      }
    }
  }
  return result;
}

async function callOpenAiCompatibleJson<T extends Record<string, unknown>>(params: {
  endpoint: string;
  apiKey: string;
  model: string;
  systemInstruction: string;
  userPrompt: string;
  extraHeaders?: Record<string, string>;
}): Promise<T> {
  const { endpoint, apiKey, model, systemInstruction, userPrompt, extraHeaders = {} } = params;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: `${systemInstruction}\nAlways reply with valid JSON only.` },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  const parsed = tryParseJsonObject<T>(content);
  if (!parsed) {
    throw new Error('Provider returned invalid or empty JSON.');
  }
  return parsed;
}

async function callOpenRouterJson<T extends Record<string, unknown>>(
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  return withRetry(() =>
    callOpenAiCompatibleJson<T>({
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      model: getOpenRouterModel(),
      systemInstruction,
      userPrompt,
      extraHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'https://hireswift-ai.netlify.app',
        'X-Title': 'HireSwift AI ATS',
      },
    })
  );
}

async function callGroqJson<T extends Record<string, unknown>>(
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }
  return withRetry(() =>
    callOpenAiCompatibleJson<T>({
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model: getGroqModel(),
      systemInstruction,
      userPrompt,
    })
  );
}

/**
 * Runs 3-tier AI model fallback chain:
 * 1. Gemini (@google/genai)
 * 2. OpenRouter API
 * 3. Groq API
 * Returns null if all configured AI providers fail or no keys are set.
 */
async function executeModelFallbackChain<T extends Record<string, unknown>>(options: {
  taskName: string;
  systemInstruction: string;
  openAiPrompt: string;
  fallback: T;
  allowOpenAiFallbacks?: boolean;
  runGemini: (ai: GoogleGenAI) => Promise<T | null>;
}): Promise<{ data: T; source: 'gemini-ai' | 'openrouter-ai' | 'groq-ai' } | null> {
  const {
    taskName,
    systemInstruction,
    openAiPrompt,
    fallback,
    allowOpenAiFallbacks = true,
    runGemini,
  } = options;

  // Tier 1: Gemini
  const geminiClient = getAiClient();
  if (geminiClient) {
    try {
      const parsed = await runGemini(geminiClient);
      if (parsed) {
        return { data: mergeWithFallback(parsed, fallback), source: 'gemini-ai' };
      }
      console.warn(`[${taskName}] Gemini returned empty JSON, falling back to OpenRouter.`);
    } catch (err) {
      console.warn(`[${taskName}] Gemini failed, falling back to OpenRouter:`, err);
    }
  }

  // Tier 2: OpenRouter (text-only fallback)
  if (allowOpenAiFallbacks && getOpenRouterApiKey()) {
    try {
      const parsed = await callOpenRouterJson<T>(systemInstruction, openAiPrompt);
      return { data: mergeWithFallback(parsed, fallback), source: 'openrouter-ai' };
    } catch (err) {
      console.warn(`[${taskName}] OpenRouter failed, falling back to Groq:`, err);
    }
  }

  // Tier 3: Groq (text-only fallback)
  if (allowOpenAiFallbacks && getGroqApiKey()) {
    try {
      const parsed = await callGroqJson<T>(systemInstruction, openAiPrompt);
      return { data: mergeWithFallback(parsed, fallback), source: 'groq-ai' };
    } catch (err) {
      console.warn(`[${taskName}] Groq failed, falling back to deterministic handler:`, err);
    }
  }

  return null;
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

export function heuristicParseResume(text: string, fileName: string) {
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

  const extractedDegree = /\bM\.?\s?Tech|M\.?\s?S\.?|Master/i.test(text)
    ? 'M.Tech / M.S.'
    : /\bB\.?\s?Tech|B\.?\s?E\.?|Bachelor/i.test(text)
      ? 'B.Tech / B.E.'
      : /\bMCA\b/i.test(text)
        ? 'MCA'
        : /\bB\.?\s?Sc|BCA\b/i.test(text)
          ? 'B.Sc / BCA'
          : null;
  const extractedBranch = /Computer Science|CSE/i.test(text) ? 'Computer Science' : null;
  const extractedCgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : null;
  const extractedGradYear = gradYearMatch ? parseInt(gradYearMatch[gradYearMatch.length - 1], 10) : null;
  const nameMatchedInLines = Boolean(
    lines[0] && lines[0].length < 48 && !lines[0].includes('@') && !/\d{4}/.test(lines[0])
  );
  const eduScore =
    (extractedCgpa !== null ? 0.35 : 0) +
    (extractedDegree ? 0.25 : 0) +
    (extractedBranch ? 0.15 : 0) +
    (extractedGradYear !== null ? 0.15 : 0);

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
      degree: extractedDegree,
      branch: extractedBranch,
      college: null,
      cgpa: extractedCgpa,
      graduation_year: extractedGradYear,
      postgraduate_details: null,
    },
    experience: {
      total_years: expMatch ? parseFloat(expMatch[1]) : 0,
      current_title: null,
      previous_titles: [],
      previous_companies: [],
      internships: /\bintern(?:ship)?s?\b/i.test(text)
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
      name: nameMatchedInLines ? 0.92 : guessedName !== 'Candidate Profile' ? 0.55 : 0,
      email: emailMatch ? 0.99 : 0,
      education: Number(Math.min(1, eduScore).toFixed(2)),
      skills:
        detectedSkills.length > 0
          ? Number(Math.min(0.98, 0.45 + Math.min(detectedSkills.length, 8) * 0.065).toFixed(2))
          : 0,
    },
  };
}

export function heuristicAnalyzeJd(description: string) {
  const lower = description.toLowerCase();
  const detected = KNOWN_SKILLS.filter((s) => lower.includes(s.toLowerCase()));
  const firstLine = description.split(/\r?\n/).find((l) => l.trim().length > 2)?.trim() || 'Software Engineer';
  const expMatch = description.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:years|yrs)/i);
  const singleExpMatch = description.match(/(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)/i);
  const cgpaMatch = description.match(/(?:CGPA|GPA)\s*(?:of|above|>=|>|:)?\s*(\d(?:\.\d)?)/i);
  const cityMatch = description.match(/\b(Bengaluru|Bangalore|Pune|Hyderabad|Mumbai|Delhi|Chennai|Noida|Gurgaon|Gurugram|Kolkata)\b/i);
  const splitIdx = detected.length > 0 ? Math.max(1, Math.ceil(detected.length * 0.7)) : 0;

  return {
    title: firstLine.slice(0, 70),
    requiredSkills: detected.slice(0, splitIdx),
    preferredSkills: detected.slice(splitIdx),
    educationalQualifications: /\bB\.?\s?Tech|B\.?\s?E\.?|Bachelor|M\.?\s?Tech|MCA|Degree\b/i.test(description)
      ? ['B.Tech / B.E. or equivalent technical degree']
      : [],
    minimumExperience: expMatch
      ? parseInt(expMatch[1], 10)
      : singleExpMatch
        ? parseFloat(singleExpMatch[1])
        : 0,
    maximumExperience: expMatch
      ? parseInt(expMatch[2], 10)
      : singleExpMatch
        ? Math.ceil(parseFloat(singleExpMatch[1]) + 2)
        : 0,
    minimumCGPA: cgpaMatch ? parseFloat(cgpaMatch[1]) : null,
    responsibilities: description
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
      .map((l) => l.replace(/^[-•]\s*/, '').trim())
      .slice(0, 5),
    certifications: [],
    location: /remote/i.test(description)
      ? 'Remote'
      : /hybrid/i.test(description)
        ? 'Hybrid'
        : cityMatch
          ? cityMatch[1]
          : 'Not Specified',
    employmentType: /\bintern(?:ship)?\b/i.test(description)
      ? 'Internship'
      : /remote/i.test(description)
        ? 'Remote'
        : /hybrid/i.test(description)
          ? 'Hybrid'
          : 'Full-Time',
    keywords: detected.slice(0, 8),
  };
}

/* -------------------------------------------------------------------------- */
/* ROUTE HANDLERS (Shared between Express server.ts and Netlify Functions)    */
/* -------------------------------------------------------------------------- */

export function getHealthPayload() {
  const geminiConfigured = Boolean(getAiClient());
  const openrouterConfigured = Boolean(getOpenRouterApiKey());
  const groqConfigured = Boolean(getGroqApiKey());

  return {
    ok: true,
    aiConfigured: geminiConfigured || openrouterConfigured || groqConfigured,
    providers: {
      gemini: geminiConfigured,
      openrouter: openrouterConfigured,
      groq: groqConfigured,
    },
    fallbackOrder: ['gemini', 'openrouter', 'groq', 'deterministic'],
  };
}

export async function parseResumePayload(body: {
  fileName?: string;
  mimeType?: string;
  extractedText?: string;
  base64Pdf?: string;
}) {
  const { fileName, mimeType, extractedText, base64Pdf } = body || {};

  if (typeof fileName !== 'string' || !fileName.trim() || (!extractedText && !base64Pdf)) {
    throw new ApiValidationError(400, 'Resume file content or extracted text is required.');
  }
  if (extractedText !== undefined && typeof extractedText !== 'string') {
    throw new ApiValidationError(400, 'extractedText must be a valid string.');
  }
  if (base64Pdf !== undefined) {
    if (typeof base64Pdf !== 'string') {
      throw new ApiValidationError(400, 'base64Pdf must be a valid base64 string.');
    }
    if (base64Pdf.length > 5_800_000) {
      throw new ApiValidationError(
        413,
        'Scanned PDF base64 payload exceeds the 6 MB serverless limit (+33% base64 encoding). Compress the file under 4 MB or upload a text-searchable PDF/DOCX.'
      );
    }
  }

  const safeText = (extractedText || '').trim();
  if (!safeText && !base64Pdf) {
    throw new ApiValidationError(400, 'Uploaded document appears empty or unreadable.');
  }

  const fallback = heuristicParseResume(safeText || fileName, fileName);

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

  const textPrompt = `File Name: ${fileName}\n\nExtracted Document Text:\n${safeText.slice(0, 28000) || '[Use attached PDF OCR/document layers]'}`;

  const openAiPrompt = `${textPrompt}\n\nReturn a single JSON object strictly matching this structure:\n${JSON.stringify(fallback)}`;

  const chainResult = await executeModelFallbackChain<typeof fallback>({
    taskName: 'parseResume',
    systemInstruction,
    openAiPrompt,
    fallback,
    runGemini: async (ai) => {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (base64Pdf && mimeType === 'application/pdf') {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        });
      }
      parts.push({ text: textPrompt });

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: getGeminiModel(),
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

      return tryParseJsonObject<typeof fallback>(response.text);
    },
  });

  if (chainResult) {
    return { parsed: chainResult.data, source: chainResult.source };
  }

  if (safeText.length > 10) {
    return { parsed: fallback, source: 'fallback-parser' as const };
  }

  if (!safeText && base64Pdf) {
    throw new ApiValidationError(
      422,
      'Scanned or image-only PDF requires AI OCR, which is currently unavailable. Please upload a text-searchable PDF/DOCX or configure an AI API key.'
    );
  }

  throw new ApiValidationError(
    400,
    'Unable to extract structured fields from this document. Ensure extractedText contains readable resume text.'
  );
}

export async function analyzeJobPayload(body: { description?: string; base64Pdf?: string }) {
  const { description, base64Pdf } = body || {};
  const safeDescription = typeof description === 'string' ? description.trim() : '';

  if (typeof base64Pdf === 'string' && base64Pdf.length > 5_800_000) {
    throw new ApiValidationError(
      413,
      'Scanned PDF job description exceeds the 5.8 MB base64 OCR payload limit. Compress under 4 MB or upload a text-searchable PDF/DOCX.'
    );
  }

  if (safeDescription.length < 15 && !base64Pdf) {
    throw new ApiValidationError(
      400,
      'Please provide a job description with at least 15 characters or upload a PDF/DOCX job description.'
    );
  }

  const fallback = heuristicAnalyzeJd(safeDescription || 'Custom Target Job Role');
  const systemInstruction =
    'You are an expert recruitment job description analyzer. Differentiate mandatory required skills from preferred optional skills. Return valid JSON only.';
  const openAiPrompt = `Analyze this job description and extract structured hiring requirements without inventing requirements not present in the text:\n\n${safeDescription.slice(0, 12000)}\n\nReturn JSON with exact keys: title, requiredSkills, preferredSkills, educationalQualifications, minimumExperience, maximumExperience, minimumCGPA, responsibilities, certifications, location, employmentType, keywords, extractedSummary.`;

  const chainResult = await executeModelFallbackChain<typeof fallback & { extractedSummary?: string }>({
    taskName: 'analyzeJob',
    systemInstruction,
    openAiPrompt,
    fallback,
    allowOpenAiFallbacks: safeDescription.length >= 15,
    runGemini: async (ai) => {
      const parts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];
      if (base64Pdf) {
        parts.push({
          inlineData: { mimeType: 'application/pdf', data: base64Pdf },
        });
      }
      parts.push(
        `Analyze this job description and extract structured hiring requirements without inventing requirements not present in the text:\n\n${safeDescription.slice(0, 12000)}`
      );

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: getGeminiModel(),
          contents: parts,
          config: {
            systemInstruction,
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
                extractedSummary: { type: Type.STRING },
              },
            },
          },
        })
      );

      return tryParseJsonObject<typeof fallback & { extractedSummary?: string }>(response.text);
    },
  });

  if (chainResult) {
    return { analysis: chainResult.data, source: chainResult.source };
  }

  if (safeDescription.length >= 15) {
    return { analysis: fallback, source: 'fallback-analyzer' as const };
  }

  throw new ApiValidationError(
    422,
    'Scanned or image-only PDF requires AI OCR, which is currently unavailable. Upload a text-searchable PDF/DOCX or paste the job description text.'
  );
}

export async function analyzeMatchingPayload(body: {
  candidate?: Record<string, unknown>;
  job?: Record<string, unknown>;
  deterministicScore?: Record<string, unknown>;
}) {
  const { candidate, job, deterministicScore } = body || {};

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) || !job || typeof job !== 'object' || Array.isArray(job)) {
    throw new ApiValidationError(400, 'Candidate profile object and job object are required.');
  }

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

  const payloadStr = JSON.stringify({ candidate, job, deterministicScore });
  const systemInstruction =
    'You are an AI recruitment analysis assistant. Provide evidence-based, unbiased matching explanations grounded strictly in the provided candidate and job data, plus 4 tailored technical and behavioral interview questions. Never invent credentials.';
  const openAiPrompt = `${payloadStr}\n\nReturn JSON with exact keys: explanation (string), decisionRationale (string), strongestAreas (string[]), potentialConcerns (string[]), interviewQuestions (string[]).`;

  const chainResult = await executeModelFallbackChain<typeof fallback>({
    taskName: 'analyzeMatching',
    systemInstruction,
    openAiPrompt,
    fallback,
    runGemini: async (ai) => {
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: getGeminiModel(),
          contents: payloadStr,
          config: {
            systemInstruction,
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

      return tryParseJsonObject<typeof fallback>(response.text);
    },
  });

  if (chainResult) {
    return { insights: chainResult.data, source: chainResult.source };
  }

  return { insights: fallback, source: 'fallback-rubric' as const };
}

export async function analyzeSkillGapPayload(body: {
  candidateName?: string;
  candidateSkills?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  jobTitle?: string;
}) {
  const { candidateName, candidateSkills, requiredSkills, preferredSkills, jobTitle } = body || {};

  const hasInputs =
    (typeof jobTitle === 'string' && jobTitle.trim().length > 0) ||
    (Array.isArray(requiredSkills) && requiredSkills.length > 0) ||
    (Array.isArray(preferredSkills) && preferredSkills.length > 0) ||
    (Array.isArray(candidateSkills) && candidateSkills.length > 0);

  if (!hasInputs) {
    throw new ApiValidationError(
      400,
      'Provide candidateSkills, requiredSkills/preferredSkills, or jobTitle to run skill gap analysis.'
    );
  }

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

  const payloadStr = JSON.stringify({
    candidateName,
    candidateSkills,
    requiredSkills,
    preferredSkills,
    jobTitle,
  });
  const systemInstruction =
    'You are a technical skill gap analysis assistant. Distinguish mandatory required gaps from optional preferred gaps, identify transferable skills, and suggest practical learning and project steps.';
  const openAiPrompt = `${payloadStr}\n\nReturn JSON with exact keys: transferableSkills (string[]), recommendedLearningAreas (string[]), practicalProjectRecommendations (string[]), summary (string).`;

  const chainResult = await executeModelFallbackChain<typeof fallback>({
    taskName: 'analyzeSkillGap',
    systemInstruction,
    openAiPrompt,
    fallback,
    runGemini: async (ai) => {
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: getGeminiModel(),
          contents: payloadStr,
          config: {
            systemInstruction,
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

      return tryParseJsonObject<typeof fallback>(response.text);
    },
  });

  if (chainResult) {
    return { gapAnalysis: chainResult.data, source: chainResult.source };
  }

  return { gapAnalysis: fallback, source: 'fallback-gap' as const };
}
