'use strict';

/**
 * Static credentials. These values are constants — they are never rotated,
 * regenerated or expired, so a test client can hard-code them.
 */
const SESSIONS = {
  'admin-static-session-token': { username: 'admin', role: 'admin' },
  'user-static-session-token': { username: 'user', role: 'user' },
};

const CSRF_TOKEN = 'static-csrf-token-value';

/** Paths that only the admin session may reach. */
const ADMIN_ONLY_PATHS = [
  '/admin/datanets',
  '/admin/storage_overview',
  '/admin/system_config',
];

function parseCookies(header) {
  const jar = {};
  if (!header) return jar;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) jar[key] = decodeURIComponent(value);
  }
  return jar;
}

/**
 * Resolves the caller from the `sessionid` cookie. An `X-Session-Id` header is
 * accepted as a fallback for clients that cannot set cookies.
 */
function identify(req) {
  const cookies = parseCookies(req.headers.cookie);
  req.cookies = cookies;
  const token = cookies.sessionid || req.get('X-Session-Id');
  return { token, session: token ? SESSIONS[token] : undefined };
}

function authenticate(req, res, next) {
  const { token, session } = identify(req);

  if (!session) {
    return res.status(401).json({
      error: 'unauthorized',
      message: token
        ? 'Unknown sessionid cookie.'
        : 'Missing sessionid cookie. Send Cookie: sessionid=<admin|user token>.',
    });
  }

  req.session = session;

  // Keep the cookies pinned on every response so a browser session sticks.
  res.cookie('sessionid', token, { path: '/', sameSite: 'Lax' });
  res.cookie('csrftoken', CSRF_TOKEN, { path: '/', sameSite: 'Lax' });

  if (session.role !== 'admin' && ADMIN_ONLY_PATHS.includes(req.path)) {
    return res.status(403).json({
      error: 'forbidden',
      message: `Role '${session.role}' is not permitted to access ${req.path}.`,
      required_role: 'admin',
    });
  }

  return next();
}

/**
 * Django-style CSRF check for the form posts described in the spec.
 * Any non-empty token is accepted so the endpoints stay easy to exercise.
 */
function requireCsrf(req, res, next) {
  const token =
    (req.body && req.body.csrfmiddlewaretoken) || req.get('X-CSRFToken');
  if (!token) {
    return res.status(403).json({
      error: 'csrf_failure',
      message: 'CSRF token missing or incorrect (csrfmiddlewaretoken).',
    });
  }
  return next();
}

module.exports = { SESSIONS, CSRF_TOKEN, ADMIN_ONLY_PATHS, authenticate, requireCsrf, parseCookies };
