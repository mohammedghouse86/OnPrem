'use strict';

/**
 * Platform cookie/CSRF authentication.
 *
 * Every authenticated request must carry all three of:
 *
 *   Cookie: login_region=<region>; login_domain="<domain>";
 *           platformcsrftoken=<csrf>; platformsessionid=<session>
 *   X-CSRFToken: <csrf>            (must equal the platformcsrftoken cookie)
 *   X-Requested-With: XMLHttpRequest
 *
 * Cookies are minted by `GET /login` (CSRF bootstrap) and `POST /login`
 * (session). The two seeded sessions below are static constants — they never
 * rotate and never expire — so a test client can hard-code them instead.
 */

const COOKIE = {
  session: 'platformsessionid',
  csrf: 'platformcsrftoken',
  region: 'login_region',
  domain: 'login_domain',
};

const REQUESTED_WITH = 'XMLHttpRequest';

/**
 * Tenants (Keystone projects). The ids are synthetic placeholders — the real
 * ones from the capture are deliberately kept out of this repo.
 */
const TENANTS = {
  'tenant-a': { id: '0000aaaa0000bbbb0000cccc00000001', name: 'Tenant-A' },
  'tenant-b': { id: '0000aaaa0000bbbb0000cccc00000002', name: 'Tenant-B' },
};

/**
 * Static sessions: token -> session. `POST /auth/login/` adds more at runtime.
 *
 * These values are CONSTANTS. They are never rotated, never regenerated and
 * carry no expiry: there is no TTL, no idle timeout and no refresh. A client
 * can hard-code them and they will keep working for the life of the service.
 *
 * The three accounts cover the roles an authorization scan needs: admin is the
 * owner, user is a non-owner peer inside the same tenant, and readonly is a
 * low-privilege account belonging to a DIFFERENT tenant.
 *
 * Each account has two session tokens that behave identically — an opaque one
 * that looks like real platform traffic, and the earlier readable one, kept so
 * existing clients keep working. Either may be used.
 */
const SESSIONS = {
  // ---- admin: owner, Tenant-A ----
  zfbn6gq6z4bg2cakt5qws465pltpz8h7: {
    username: 'admin',
    role: 'admin',
    tenant: 'tenant-a',
    csrf: 'jxDfPFHr9Gmm82SKKZrGYY1ccQwVPiB7Pj62a193EScUlXjIybrL48yCIAs9qMtE',
    region: 'default',
    domain: '',
  },
  'admin-static-session-token': {
    username: 'admin',
    role: 'admin',
    tenant: 'tenant-a',
    csrf: 'admin-static-csrf-token',
    region: 'default',
    domain: '',
  },

  // ---- user: non-owner peer, Tenant-A ----
  '5ezzptqpoof3mxzfarrbh1auktfjj199': {
    username: 'user',
    role: 'user',
    tenant: 'tenant-a',
    csrf: 'tGo3uOuQJcfOuQyKHJFMj3Td88A6MQesZ0AShoifAFLMD68zO2KKndFC90IC7YwH',
    region: 'default',
    domain: '',
  },
  'user-static-session-token': {
    username: 'user',
    role: 'user',
    tenant: 'tenant-a',
    csrf: 'user-static-csrf-token',
    region: 'default',
    domain: '',
  },

  // ---- readonly: low privilege, Tenant-B ----
  djuyx6gtzae4rweznb3aned1vba9cfnt: {
    username: 'readonly',
    role: 'readonly',
    tenant: 'tenant-b',
    csrf: 'EZVpHGxD2NauP8iKqFFOc2hKvSgcuAPwZk9QcIBFMWnVK2HS8qFtxaA07SF5GZj2',
    region: 'default',
    domain: '',
  },
  'readonly-static-session-token': {
    username: 'readonly',
    role: 'readonly',
    tenant: 'tenant-b',
    csrf: 'readonly-static-csrf-token',
    region: 'default',
    domain: '',
  },
};

/**
 * The token ACCOUNTS.txt advertises for each account. These are the readable
 * ones: they are the values verified working against the deployed service, so
 * they are what a client should use. The opaque tokens above are equally valid
 * and are listed as alternatives.
 */
const PRIMARY_SESSION = {
  admin: 'admin-static-session-token',
  user: 'user-static-session-token',
  readonly: 'readonly-static-session-token',
};

/** Login credentials for `POST /auth/login/`. */
const CREDENTIALS = {
  admin: { password: 'admin-password', role: 'admin', tenant: 'tenant-a' },
  user: { password: 'user-password', role: 'user', tenant: 'tenant-a' },
  readonly: { password: 'readonly-password', role: 'readonly', tenant: 'tenant-b' },
};

/** The low-privilege role may not write anything. */
const READ_ONLY_ROLES = ['readonly'];

/** Paths that only the admin session may reach. */
const ADMIN_ONLY_PATHS = [
  '/admin/datanets',
  '/admin/storage_overview',
  '/admin/system_config',
];

const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomToken(length) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
  }
  return out;
}

function parseCookies(cookieHeader) {
  const jar = {};
  if (!cookieHeader) return jar;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    let value = part.slice(idx + 1).trim();
    // The UI sends login_domain="" — unwrap the literal quotes.
    if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (key) jar[key] = decodeURIComponent(value);
  }
  return jar;
}

/** Parses cookies once and pins them on the request. */
function cookiesOf(req) {
  if (!req.cookies) req.cookies = parseCookies(req.headers.cookie);
  return req.cookies;
}

/**
 * Reads a header, collapsing the `a, a` form Node produces when a client sends
 * the same header twice with the same value — a spec that declares a header
 * both as a security scheme and as a required parameter can provoke exactly
 * that. Genuinely conflicting values are left alone so they still fail.
 */
function header(req, name) {
  const raw = req.get(name);
  if (!raw) return raw;
  const parts = raw.split(',').map((v) => v.trim()).filter(Boolean);
  const distinct = [...new Set(parts)];
  return distinct.length === 1 ? distinct[0] : raw;
}

/**
 * Drops a trailing slash so the admin-only list matches either form. The spec
 * documents the Django-canonical slashed paths (/admin/system_config/), while
 * Express routes match both.
 */
function normalizePath(p) {
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

function unauthorized(res, message) {
  return res.status(401).json({ error: 'unauthorized', message });
}

function csrfFailure(res, message) {
  return res.status(403).json({ error: 'csrf_failure', message });
}

/** Writes the four platform cookies onto the response. */
function setAuthCookies(res, { sessionId, csrf, region, domain }) {
  // Ten years: these credentials do not expire.
  const opts = { path: '/', sameSite: 'Lax', maxAge: 10 * 365 * 24 * 60 * 60 * 1000 };
  if (region !== undefined) res.cookie(COOKIE.region, region || 'default', opts);
  if (domain !== undefined) res.cookie(COOKIE.domain, `"${domain || ''}"`, opts);
  if (csrf) res.cookie(COOKIE.csrf, csrf, opts);
  if (sessionId) res.cookie(COOKIE.session, sessionId, { ...opts, httpOnly: true });
}

/** Mints a session for a successful login. */
function createSession({ username, role, tenant, region, domain }) {
  const sessionId = randomToken(32);
  const session = {
    username,
    role,
    tenant: tenant || 'tenant-a',
    csrf: randomToken(64),
    region: region || 'default',
    domain: domain || '',
  };
  SESSIONS[sessionId] = session;
  return { sessionId, session };
}

/** `X-Requested-With: XMLHttpRequest` — mandatory on every endpoint. */
function requireRequestedWith(req, res, next) {
  const value = header(req, 'X-Requested-With');
  if (!value) {
    return res.status(403).json({
      error: 'missing_required_header',
      message: `Header 'X-Requested-With: ${REQUESTED_WITH}' is required.`,
      required_header: 'X-Requested-With',
    });
  }
  if (value.toLowerCase() !== REQUESTED_WITH.toLowerCase()) {
    return res.status(403).json({
      error: 'invalid_header',
      message: `Header 'X-Requested-With' must be '${REQUESTED_WITH}', got '${value}'.`,
      required_header: 'X-Requested-With',
    });
  }
  return next();
}

/**
 * Double-submit CSRF: the `X-CSRFToken` header must be present and must equal
 * the `platformcsrftoken` cookie. Used standalone by `POST /login`, where no
 * session exists yet, and again inside `authenticate` for every other endpoint.
 */
function requireCsrfPair(req, res) {
  const cookies = cookiesOf(req);
  const cookieToken = cookies[COOKIE.csrf];
  const headerToken = header(req, 'X-CSRFToken');

  if (!cookieToken) {
    return csrfFailure(res, `Cookie '${COOKIE.csrf}' is missing. Call GET /login first.`);
  }
  if (!headerToken) {
    return csrfFailure(res, "Header 'X-CSRFToken' is required.");
  }
  if (headerToken !== cookieToken) {
    return csrfFailure(res, `Header 'X-CSRFToken' does not match the '${COOKIE.csrf}' cookie.`);
  }
  return null;
}

function requireCsrf(req, res, next) {
  const failure = requireCsrfPair(req, res);
  if (failure) return failure;
  return next();
}

/**
 * Full check for the authenticated surface: Cookie + X-CSRFToken +
 * X-Requested-With, then the per-role path rules.
 */
function authenticate(req, res, next) {
  if (!req.headers.cookie) {
    return unauthorized(
      res,
      `Cookie header is missing. Send '${COOKIE.session}' and '${COOKIE.csrf}' — call POST /login to obtain them.`
    );
  }

  const cookies = cookiesOf(req);
  const sessionId = cookies[COOKIE.session];
  if (!sessionId) {
    return unauthorized(res, `Cookie '${COOKIE.session}' is missing.`);
  }

  const session = SESSIONS[sessionId];
  if (!session) {
    return unauthorized(res, `Unknown '${COOKIE.session}' cookie.`);
  }

  const csrfFailed = requireCsrfPair(req, res);
  if (csrfFailed) return csrfFailed;

  if (cookies[COOKIE.csrf] !== session.csrf) {
    return csrfFailure(res, `The '${COOKIE.csrf}' cookie does not belong to this session.`);
  }

  req.session = session;
  req.sessionId = sessionId;

  // Keep the cookies pinned so a browser session sticks.
  setAuthCookies(res, {
    sessionId,
    csrf: session.csrf,
    region: session.region,
    domain: session.domain,
  });

  if (session.role !== 'admin' && ADMIN_ONLY_PATHS.includes(normalizePath(req.path))) {
    return res.status(403).json({
      error: 'forbidden',
      message: `Role '${session.role}' is not permitted to access ${req.path}.`,
      required_role: 'admin',
    });
  }

  // Low-privilege roles get read access only.
  if (READ_ONLY_ROLES.includes(session.role) && req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(403).json({
      error: 'forbidden',
      message: `Role '${session.role}' is read-only and may not ${req.method} ${req.path}.`,
      required_role: 'user',
    });
  }

  return next();
}

/**
 * Object-level check for the id-bearing paths. An object belongs to a tenant;
 * a session from another tenant is refused even when its role would otherwise
 * allow the call. This is the case a BOLA / cross-tenant probe is looking for.
 */
function requireSameTenant(getOwnerTenant) {
  return (req, res, next) => {
    const owner = getOwnerTenant(req);

    if (owner === undefined) {
      return res.status(404).json({
        error: 'not_found',
        message: `No such object: ${req.path}`,
      });
    }
    if (owner !== req.session.tenant) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Object belongs to ${TENANTS[owner].name}; this session is scoped to ${TENANTS[req.session.tenant].name}.`,
        required_tenant: TENANTS[owner].id,
      });
    }
    return next();
  };
}

module.exports = {
  COOKIE,
  PRIMARY_SESSION,
  TENANTS,
  READ_ONLY_ROLES,
  requireSameTenant,
  REQUESTED_WITH,
  SESSIONS,
  CREDENTIALS,
  ADMIN_ONLY_PATHS,
  authenticate,
  requireCsrf,
  requireRequestedWith,
  createSession,
  setAuthCookies,
  parseCookies,
  randomToken,
  normalizePath,
};
