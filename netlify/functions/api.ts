import {
  ApiValidationError,
  analyzeJobPayload,
  analyzeMatchingPayload,
  analyzeSkillGapPayload,
  getHealthPayload,
  parseResumePayload,
} from '../../lib/atsApi';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function normalizeRoute(urlStr: string): string {
  const { pathname } = new URL(urlStr);
  const stripped = pathname
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  const route = normalizeRoute(req.url);

  try {
    if (req.method === 'GET' && (route === '/health' || route === '/')) {
      return jsonResponse(getHealthPayload(), 200);
    }

    if (req.method !== 'POST') {
      return jsonResponse({ error: `Method ${req.method} not allowed for ${route}` }, 405);
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (route === '/resumes/parse') {
      const result = await parseResumePayload(body as Parameters<typeof parseResumePayload>[0]);
      return jsonResponse(result, 200);
    }

    if (route === '/jobs/analyze') {
      const result = await analyzeJobPayload(body as Parameters<typeof analyzeJobPayload>[0]);
      return jsonResponse(result, 200);
    }

    if (route === '/matching/analyze') {
      const result = await analyzeMatchingPayload(body as Parameters<typeof analyzeMatchingPayload>[0]);
      return jsonResponse(result, 200);
    }

    if (route === '/matching/skill-gap') {
      const result = await analyzeSkillGapPayload(body as Parameters<typeof analyzeSkillGapPayload>[0]);
      return jsonResponse(result, 200);
    }

    return jsonResponse({ error: `Unknown API route: ${route}` }, 404);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return jsonResponse({ error: error.message }, error.status);
    }
    console.error('Netlify API function error:', error);
    return jsonResponse({ error: 'Internal server error processing ATS request.' }, 500);
  }
}
