const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_ACCESS_TOKEN = process.env.ADMIN_ACCESS_TOKEN;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function queryTable(table, limit) {
  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to query ${table}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_ACCESS_TOKEN) {
    return json(res, 500, { error: 'Missing server environment variables' });
  }

  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_ACCESS_TOKEN) {
    return json(res, 401, { error: 'Unauthorized' });
  }

  const rawLimit = Number(req.query.limit || '100');
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 500) : 100;

  try {
    const [
      candidateSubmissions,
      referenceSubmissions,
      bsrSubmissions,
      applicationSubmissions
    ] = await Promise.all([
      queryTable('candidate_submissions', limit),
      queryTable('reference_submissions', limit),
      queryTable('bsr_submissions', limit),
      queryTable('application_submissions', limit)
    ]);

    return json(res, 200, {
      candidateSubmissions,
      referenceSubmissions,
      bsrSubmissions,
      applicationSubmissions
    });
  } catch (error) {
    return json(res, 500, {
      error: 'Failed to load submissions',
      details: error.message
    });
  }
}
