'use strict';

/**
 * Wind River Studio bearer-token authentication — the second app.
 *
 * Deliberately isolated from the platform cookie/CSRF scheme in `../auth.js`:
 * a different credential, different accounts, different failure bodies, and no
 * shared state. A session cookie minted by the on-prem app is not a credential
 * here, and a bearer token from here is not a credential there. The two apps
 * only share a hostname.
 *
 * Three headers carry a request, and they are the only three needed:
 *
 *   accept:        application/json, text/plain, *\/*
 *   authorization: Bearer <token>
 *   cookie:        authCookiePart0=<token>; languageCookie=en-US
 *
 * `Authorization` is the primary credential. The chunked `authCookiePart*`
 * cookie is the same JWT by another route — the SPA sets it client-side so the
 * sibling apps on the domain share one session — and is accepted on its own,
 * which is what `security: [bearerAuth, authCookie]` in the spec means. When
 * both are present the header wins.
 *
 * The three tokens below are CONSTANTS. They never rotate, never expire (the
 * `exp` claim is year 2100) and carry no refresh: a test client can hard-code
 * them for the life of the service. They are unsigned stand-ins shaped like the
 * Tozny ID (Keycloak) access tokens the real gateway issues — no signature is
 * verified, the token is matched by value.
 */

/* ------------------------------------------------------------------ *
 * Accounts
 * ------------------------------------------------------------------ */

/** admin of Studio-Org-A: owner of the org-A objects. */
const ADMIN_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IndGM3FrOHRaMm1KNW5SeExiWXMwUSJ9.eyJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTc4ODg4NDQwMCwianRpIjoiMDJkYTJhZDgtNjQ0YS00ODBmLWI2ZDItYWM1YTg2OTFkM2E5IiwiaXNzIjoiaHR0cHM6Ly90b3pueS5pZC5kYXN0Lndyc3R1ZGlvLmNsb3VkL3JlYWxtcy93cmFpIiwiYXVkIjoid3Itc3R1ZGlvLXNzbyIsInN1YiI6IjAyZGEyYWQ4LTY0NGEtNDgwZi1iNmQyLWFjNWE4NjkxZDNhOSIsInR5cCI6IkJlYXJlciIsImF6cCI6IndyLXN0dWRpby1zc28iLCJzZXNzaW9uX3N0YXRlIjoiN2Q5MmNiOTEtODk1Zi00NGFjLWE1NDItYzhjZmRjZWE3ODgwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtd3JhaSIsInRhZkFkbWluIiwiaGl2ZUFkbWluIiwidmF1bHRBZG1pbiIsInVzcEFkbWluIiwic2xjQWRtaW4iLCJsaWNlbnNlQWRtaW4iLCJwbGF0Zm9ybWhlYWx0aEFkbWluIl19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ0ZXN0IGFkbWluMDEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZXN0YWRtaW4wMSIsImdpdmVuX25hbWUiOiJ0ZXN0IiwiZmFtaWx5X25hbWUiOiJhZG1pbjAxIiwiZW1haWwiOiJ0ZXN0YWRtaW4wMUB3aW5kcml2ZXIuY29tIiwiZ3JvdXBzIjpbInRhZi1hZG1pbi1ncm91cCIsImhpdmUtYWRtaW4tZ3JvdXAiLCJ2YXVsdC1hZG1pbi1ncm91cCJdfQ.K7nQxJ2mVrTbZ9LpYc4Hs1WdEgAoFuNi3RkXvB6MyCzPaSj0QlDtGeHfIrUnOwXbVmKpZcYsLqAjTdNgEuFvRhBiMoCxWyJkPnQzSaDlTgUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLq';

/** Non-owner peer inside the same org — the same-tenant comparison case. */
const USER_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IndGM3FrOHRaMm1KNW5SeExiWXMwUSJ9.eyJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTc4ODg4NDQwMCwianRpIjoiYjMxZjBjNDctMmU1ZC00YTE5LTljNjgtNWYwZDdhMmI0ZTEzIiwiaXNzIjoiaHR0cHM6Ly90b3pueS5pZC5kYXN0Lndyc3R1ZGlvLmNsb3VkL3JlYWxtcy93cmFpIiwiYXVkIjoid3Itc3R1ZGlvLXNzbyIsInN1YiI6ImIzMWYwYzQ3LTJlNWQtNGExOS05YzY4LTVmMGQ3YTJiNGUxMyIsInR5cCI6IkJlYXJlciIsImF6cCI6IndyLXN0dWRpby1zc28iLCJzZXNzaW9uX3N0YXRlIjoiMWM4YjVhMDMtNmQyNC00ZjkxLWI3ZTUtM2E5YzBkODFmNjJiIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtd3JhaSIsInRhZkVkaXRvciIsInZsYWJTdGFydGVyIl19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ0ZXN0IHVzZXIwMSIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R1c2VyMDEiLCJnaXZlbl9uYW1lIjoidGVzdCIsImZhbWlseV9uYW1lIjoidXNlcjAxIiwiZW1haWwiOiJ0ZXN0dXNlcjAxQHdpbmRyaXZlci5jb20iLCJncm91cHMiOlsidGFmLWVkaXRvci1ncm91cCIsInZsYWItc3RhcnRlci1ncm91cCJdfQ.K7nQxJ2mVrTbZ9LpYc4Hs1WdEgAoFuNi3RkXvB6MyCzPaSj0QlDtGeHfIrUnOwXbVmKpZcYsLqAjTdNgEuFvRhBiMoCxWyJkPnQzSaDlTgUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLq';

/** Low privilege, and in a DIFFERENT org — the cross-tenant case. */
const VIEWER_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IndGM3FrOHRaMm1KNW5SeExiWXMwUSJ9.eyJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTc4ODg4NDQwMCwianRpIjoiNmU0YTlkMTItOGMzNy00YjU2LWEwZjktMmQxNWU3YzgzYjQwIiwiaXNzIjoiaHR0cHM6Ly90b3pueS5pZC5kYXN0Lndyc3R1ZGlvLmNsb3VkL3JlYWxtcy93cmFpIiwiYXVkIjoid3Itc3R1ZGlvLXNzbyIsInN1YiI6IjZlNGE5ZDEyLThjMzctNGI1Ni1hMGY5LTJkMTVlN2M4M2I0MCIsInR5cCI6IkJlYXJlciIsImF6cCI6IndyLXN0dWRpby1zc28iLCJzZXNzaW9uX3N0YXRlIjoiOWEyZjdlNjEtNGIwOC00ZDNjLThlNTctNmMxYjBmMjlhNGQ4IiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtd3JhaSIsInRhZlZpZXdlciJdfSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoidGVzdCB2aWV3ZXIwMSIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R2aWV3ZXIwMSIsImdpdmVuX25hbWUiOiJ0ZXN0IiwiZmFtaWx5X25hbWUiOiJ2aWV3ZXIwMSIsImVtYWlsIjoidGVzdHZpZXdlcjAxQHdpbmRyaXZlci5jb20iLCJncm91cHMiOlsidGFmLXZpZXdlci1ncm91cCIsImRmbC12aWV3ZXItZ3JvdXAiXX0.K7nQxJ2mVrTbZ9LpYc4Hs1WdEgAoFuNi3RkXvB6MyCzPaSj0QlDtGeHfIrUnOwXbVmKpZcYsLqAjTdNgEuFvRhBiMoCxWyJkPnQzSaDlTgUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLqAjSdTgNuEvFhRiBoMxCyWkJpQnZzSaDlGtUfHeIrXvKmOwBcYpZnLq';

/**
 * token -> account. The three cover what an authorization scan needs: an owner,
 * a non-owner peer in the same org, and a low-privilege account in another org.
 */
const ACCOUNTS = {
  [ADMIN_TOKEN]: {
    username: 'testadmin01',
    role: 'admin',
    org: 'org-a',
    session: '7d92cb91-895f-44ac-a542-c8cfdcea7880',
  },
  [USER_TOKEN]: {
    username: 'testuser01',
    role: 'user',
    org: 'org-a',
    session: '1c8b5a03-6d24-4f91-b7e5-3a9c0d81f62b',
  },
  [VIEWER_TOKEN]: {
    username: 'testviewer01',
    role: 'viewer',
    org: 'org-b',
    session: '9a2f7e61-4b08-4d3c-8e57-6c1b0f29a4d8',
  },
};

/** The token each account is advertised with, in login order. */
const TOKENS = {
  testadmin01: ADMIN_TOKEN,
  testuser01: USER_TOKEN,
  testviewer01: VIEWER_TOKEN,
};

/** The low-privilege role may read but not write. */
const READ_ONLY_ROLES = ['viewer'];

/** Paths only an org admin may reach. Listing the whole RBAC directory is one. */
const ADMIN_ONLY_PATHS = ['/um/api/auth/groups'];

/* ------------------------------------------------------------------ *
 * Cookie transport
 * ------------------------------------------------------------------ */

const COOKIE = {
  count: 'authCookieCount',
  part: 'authCookiePart',
  language: 'languageCookie',
  oidc: 'oidcCookie',
};

/** The SPA splits the JWT at this width before writing the cookie parts. */
const CHUNK_SIZE = 3800;

/**
 * Minimal cookie parser. Kept local rather than imported from the on-prem app
 * so that neither app can change the other's credential handling.
 */
function parseCookies(cookieHeader) {
  const jar = {};
  if (!cookieHeader) return jar;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) jar[key] = value;
  }
  return jar;
}

/**
 * Reassembles the chunked cookie, following the app's own `getAuthCookie()`:
 * read `authCookieCount`, then concatenate `authCookiePart0..n-1`. A missing
 * count means one part, which is the shape a client hand-builds.
 */
function tokenFromCookies(jar) {
  const declared = parseInt(jar[COOKIE.count], 10);
  const parts = Number.isFinite(declared) && declared > 0 ? declared : 1;
  let token = '';
  for (let i = 0; i < parts; i += 1) token += jar[`${COOKIE.part}${i}`] || '';
  return token;
}

/** Splits a token into the cookie parts that carry it. */
function toCookieParts(token) {
  const parts = [];
  for (let i = 0; i < token.length; i += CHUNK_SIZE) {
    parts.push(token.slice(i, i + CHUNK_SIZE));
  }
  return parts.length ? parts : [''];
}

/** The `cookie` header value a client should send for a token. */
function cookieHeaderFor(token) {
  const parts = toCookieParts(token);
  const jar = parts.map((value, i) => `${COOKIE.part}${i}=${value}`);
  // authCookieCount is only meaningful past one part; a single-part token is
  // what the reassembler assumes by default.
  if (parts.length > 1) jar.unshift(`${COOKIE.count}=${parts.length}`);
  jar.push(`${COOKIE.language}=en-US`);
  return jar.join('; ');
}

/* ------------------------------------------------------------------ *
 * Middleware
 * ------------------------------------------------------------------ */

/** Every failure from this app uses the User Management error envelope. */
function fail(res, status, message) {
  return res.status(status).json({ success: false, data: null, correlationId: null, message });
}

/**
 * Reads the bearer token from `Authorization`, falling back to the chunked
 * cookie. Returns `''` when neither carries one.
 */
function tokenFrom(req) {
  const raw = req.get('authorization');
  if (raw) {
    const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
    if (match) return match[1].trim();
    return '';
  }
  return tokenFromCookies(parseCookies(req.headers.cookie));
}

/**
 * Resolves the caller, then applies the role rules that do not depend on a
 * particular object: the admin-only paths, and read-only for the viewer role.
 */
function authenticate(req, res, next) {
  const raw = req.get('authorization');
  if (raw && !/^Bearer\s+/i.test(raw.trim())) {
    return fail(res, 401, "Header 'Authorization' must use the Bearer scheme.");
  }

  const token = tokenFrom(req);
  if (!token) {
    return fail(
      res,
      401,
      "Header 'Authorization: Bearer <token>' is required, or the equivalent authCookiePart0 cookie."
    );
  }

  const account = ACCOUNTS[token];
  if (!account) {
    return fail(res, 401, 'The bearer token is not valid for this realm.');
  }

  req.studio = { ...account, token };

  if (account.role !== 'admin' && ADMIN_ONLY_PATHS.includes(req.path)) {
    return fail(res, 403, `Role '${account.role}' is not permitted to access ${req.path}.`);
  }

  if (READ_ONLY_ROLES.includes(account.role) && req.method !== 'GET' && req.method !== 'HEAD') {
    return fail(res, 403, `Role '${account.role}' is read-only and may not ${req.method} ${req.path}.`);
  }

  return next();
}

/**
 * Object-level check. An object belongs to an org; a caller scoped to another
 * org is refused even when its role would otherwise allow the call. This is the
 * case a BOLA probe is looking for.
 *
 * `getOwnerOrg` returns the owning org key, or `undefined` when no such object
 * exists — which answers 404, not 403, so a probe cannot enumerate ids.
 */
function requireSameOrg(getOwnerOrg, describe) {
  return (req, res, next) => {
    const owner = getOwnerOrg(req);
    if (owner === undefined) {
      return fail(res, 404, `No such ${describe || 'object'}: ${req.path}`);
    }
    if (owner !== req.studio.org) {
      return fail(res, 403, `That ${describe || 'object'} belongs to another organisation.`);
    }
    return next();
  };
}

module.exports = {
  ACCOUNTS,
  ADMIN_ONLY_PATHS,
  ADMIN_TOKEN,
  CHUNK_SIZE,
  COOKIE,
  READ_ONLY_ROLES,
  TOKENS,
  USER_TOKEN,
  VIEWER_TOKEN,
  authenticate,
  cookieHeaderFor,
  fail,
  parseCookies,
  requireSameOrg,
  toCookieParts,
  tokenFrom,
};
