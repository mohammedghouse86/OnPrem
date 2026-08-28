'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

const data = require('./data');
const {
  COOKIE,
  REQUESTED_WITH,
  SESSIONS,
  CREDENTIALS,
  ADMIN_ONLY_PATHS,
  authenticate,
  requireCsrf,
  requireRequestedWith,
  createSession,
  setAuthCookies,
  randomToken,
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 8443;

app.disable('x-powered-by');
app.set('json spaces', 2);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

/* ------------------------------------------------------------------ *
 * Unauthenticated helpers (not part of the OpenAPI surface)
 * ------------------------------------------------------------------ */

app.get('/', (req, res) => {
  res.json({
    service: 'MoonSun on-prem mock API',
    spec: 'onpremtest.yaml (OpenAPI 3.0.3)',
    openapi: '/openapi.yaml',
    authentication: {
      how: 'GET /login for the CSRF cookie, then POST /login for the session cookie.',
      mandatory_headers: {
        Cookie: `${COOKIE.region}=<region>; ${COOKIE.domain}="<domain>"; ${COOKIE.csrf}=<csrf>; ${COOKIE.session}=<session>`,
        'X-CSRFToken': `must equal the ${COOKIE.csrf} cookie`,
        'X-Requested-With': REQUESTED_WITH,
      },
      credentials: Object.entries(CREDENTIALS).map(([username, c]) => ({
        username,
        password: c.password,
        role: c.role,
      })),
      static_sessions: Object.entries(SESSIONS).map(([token, s]) => ({
        role: s.role,
        username: s.username,
        cookie: `${COOKIE.session}=${token}; ${COOKIE.csrf}=${s.csrf}`,
        'X-CSRFToken': s.csrf,
      })),
    },
    admin_only_paths: ADMIN_ONLY_PATHS,
    endpoints: [
      'GET  /login                                   (CSRF bootstrap, no session)',
      'POST /login                                   (form/JSON: username, password, region, domain)',
      'GET  /admin/datanets                          (admin only)',
      'GET  /admin/host_topology/json?_=<ts>',
      'GET  /admin/software_management',
      'GET  /admin/software_management/releaseupload',
      'GET  /admin/storage_overview?loaded=1         (admin only)',
      'GET  /admin/system_config                     (admin only)',
      'GET  /api/fm/alarm_list',
      'GET  /api/fm/event_log_list',
      'GET  /api/fm/events_suppression_list',
      'GET  /api/keystone/roles',
      'POST /api/policy',
      'GET  /api/settings',
      'GET  /header',
      'GET  /identity',
      'GET  /identity/create',
      'GET  /identity/groups',
      'POST /identity/groups/create',
      'POST /identity/users/create',
      'GET  /project/api_access/view_credentials',
    ],
  });
});

app.get('/openapi.yaml', (req, res) => {
  const specPath = path.join(__dirname, 'onpremtest.yaml');
  if (!fs.existsSync(specPath)) {
    return res.status(404).json({ error: 'not_found', message: 'onpremtest.yaml is not bundled with this deployment.' });
  }
  res.type('text/yaml').send(fs.readFileSync(specPath, 'utf8'));
});

/* ------------------------------------------------------------------ *
 * Everything below requires X-Requested-With: XMLHttpRequest
 * ------------------------------------------------------------------ */

app.use(requireRequestedWith);

/* ---- Login -------------------------------------------------------- */

/**
 * CSRF bootstrap. No session required: it hands back the `platformcsrftoken`
 * cookie that `POST /login` then expects to see echoed in `X-CSRFToken`.
 */
app.get('/login', (req, res) => {
  const csrf = randomToken(64);
  const region = req.query.region || 'default';
  const domain = req.query.domain || '';

  setAuthCookies(res, { csrf, region, domain });

  res.json({
    result: 'csrf_issued',
    csrf_token: csrf,
    region,
    domain,
    next: 'POST /login with Cookie + X-CSRFToken + X-Requested-With',
  });
});

app.post('/login', requireCsrf, (req, res) => {
  const body = req.body || {};
  const username = body.username;
  const password = body.password;

  const missing = ['username', 'password'].filter((f) => !body[f]);
  if (missing.length) {
    return res.status(400).json({
      error: 'validation_error',
      message: `Missing required field(s): ${missing.join(', ')}.`,
    });
  }

  const account = CREDENTIALS[username];
  if (!account || account.password !== password) {
    return res.status(401).json({
      error: 'invalid_credentials',
      message: 'Username or password is incorrect.',
    });
  }

  const region = body.region || req.cookies[COOKIE.region] || 'default';
  const domain = body.domain || req.cookies[COOKIE.domain] || '';

  const { sessionId, session } = createSession({
    username,
    role: account.role,
    region,
    domain,
  });

  // The session gets a fresh CSRF token; the bootstrap one is discarded.
  setAuthCookies(res, { sessionId, csrf: session.csrf, region, domain });

  return res.json({
    result: 'authenticated',
    username: session.username,
    role: session.role,
    region: session.region,
    domain: session.domain,
    session_id: sessionId,
    csrf_token: session.csrf,
    required_headers: {
      Cookie: `${COOKIE.region}=${session.region}; ${COOKIE.domain}="${session.domain}"; ${COOKIE.csrf}=${session.csrf}; ${COOKIE.session}=${sessionId}`,
      'X-CSRFToken': session.csrf,
      'X-Requested-With': REQUESTED_WITH,
    },
  });
});

/* ------------------------------------------------------------------ *
 * Everything below additionally requires the session + CSRF cookies
 * ------------------------------------------------------------------ */

app.use(authenticate);

/* ---- Admin ------------------------------------------------------- */

app.get('/admin/datanets', (req, res) => {
  res.json(data.datanets);
});

app.get('/admin/host_topology/json', (req, res) => {
  // `_` is the UI cache-buster; echoed back so callers can correlate.
  res.json({ ...data.hostTopology, _: req.query._ ?? null });
});

app.get('/admin/software_management', (req, res) => {
  res.json(data.softwareManagement);
});

app.get('/admin/software_management/releaseupload', (req, res) => {
  res.json(data.releaseUpload);
});

app.get('/admin/storage_overview', (req, res) => {
  res.json({ ...data.storageOverview, loaded: req.query.loaded ?? null });
});

app.get('/admin/system_config', (req, res) => {
  res.json(data.systemConfig);
});

/* ---- Fault Management -------------------------------------------- */

app.get('/api/fm/alarm_list', (req, res) => {
  res.json(data.alarmList);
});

app.get('/api/fm/event_log_list', (req, res) => {
  res.json(data.eventLogList);
});

app.get('/api/fm/events_suppression_list', (req, res) => {
  res.json(data.eventsSuppressionList);
});

/* ---- Identity ----------------------------------------------------- */

app.get('/api/keystone/roles', (req, res) => {
  res.json(data.keystoneRoles);
});

app.get('/identity', (req, res) => {
  res.json(data.identity);
});

app.get('/identity/create', (req, res) => {
  res.json(data.identityCreateForm);
});

app.get('/identity/groups', (req, res) => {
  res.json(data.identityGroups);
});

app.post('/identity/groups/create', requireCsrf, (req, res) => {
  const { name, description } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'validation_error', message: "Field 'name' is required." });
  }
  res.status(200).json({
    result: 'created',
    group: {
      id: 'g00000000000000000000000000003',
      name,
      description: description || '',
      domain_id: 'default',
      members: 0,
    },
    created_by: req.session.username,
  });
});

app.post('/identity/users/create', requireCsrf, (req, res) => {
  const body = req.body || {};
  const missing = ['name', 'email', 'password', 'confirm_password'].filter((f) => !body[f]);
  if (missing.length) {
    return res.status(400).json({
      error: 'validation_error',
      message: `Missing required field(s): ${missing.join(', ')}.`,
    });
  }
  if (body.password !== body.confirm_password) {
    return res.status(400).json({ error: 'validation_error', message: 'Passwords do not match.' });
  }
  res.status(200).json({
    result: 'created',
    user: {
      id: 'u0000000000000000000000000000004',
      name: body.name,
      description: body.description || '',
      email: body.email,
      domain_id: body.domain_id || 'default',
      domain_name: body.domain_name || 'Default',
      project: body.project || '',
      role_id: body.role_id || '',
      enabled: String(body.enabled ?? 'true') === 'true',
    },
    created_by: req.session.username,
  });
});

/* ---- Other -------------------------------------------------------- */

app.post('/api/policy', (req, res) => {
  res.json({
    result: 'evaluated',
    allowed: req.session.role === 'admin',
    role: req.session.role,
    request: req.body && Object.keys(req.body).length ? req.body : {},
    rules_evaluated: ['identity:list_users', 'admin_required'],
  });
});

app.get('/api/settings', (req, res) => {
  res.json({
    ...data.settings,
    session: { username: req.session.username, role: req.session.role },
  });
});

app.get('/header', (req, res) => {
  res.type('text/html').send(data.headerHtml(req.session.username, req.session.role));
});

app.get('/project/api_access/view_credentials', (req, res) => {
  res.json({
    ...data.viewCredentials,
    project: req.session.role === 'admin' ? 'admin' : 'services',
    user: req.session.username,
  });
});

/* ------------------------------------------------------------------ *
 * Fallbacks
 * ------------------------------------------------------------------ */

app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `No route for ${req.method} ${req.path}. See / for the endpoint list.`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Mock API listening on port ${PORT}`);
});

module.exports = app;
