'use strict';

/**
 * Wind River Studio mock — the second app.
 *
 * Serves every path item in `second_app_oas.yaml` (20 paths / 22 operations)
 * across the three prefixes the real Kong gateway fronts: `/um/api`,
 * `/portal/api` and `/taf/api`. Nothing was renamed, added to, or dropped from
 * that contract.
 *
 * This is an Express Router, mounted by ../server.js ahead of the on-prem app's
 * own middleware so the two surfaces never share an authentication step. The
 * three prefixes above do not collide with any path in `onpremtest.yaml`, so
 * both apps can answer on one host and one base path while staying isolated.
 */

const express = require('express');

const data = require('./data');
const { ACCOUNTS, TOKENS, authenticate, fail, requireSameOrg } = require('./auth');

const router = express.Router();

/**
 * The gateway prefixes this app answers on. A request for anything else is
 * handed straight back to the on-prem app mounted behind this router, so the
 * two surfaces never see each other's traffic — or each other's credentials.
 */
const PREFIXES = ['/um/api', '/portal/api', '/taf/api'];

router.use((req, res, next) => {
  const mine = PREFIXES.some((p) => req.path === p || req.path.startsWith(p + '/'));
  return mine ? next() : next('router');
});

/* ------------------------------------------------------------------ *
 * Envelopes
 * ------------------------------------------------------------------ */

/** The `/um` and `/portal` services wrap everything in this. */
const um = (payload, message) => ({ success: true, data: payload, message });

/** Pagination wrapper used by the `/um` list endpoints. */
function umPage(rows, limit) {
  const size = Number.isFinite(limit) && limit > 0 ? limit : 0;
  return {
    rows,
    limit: size,
    page: 1,
    totalRows: rows.length,
    totalPage: size > 0 ? Math.max(1, Math.ceil(rows.length / size)) : 1,
  };
}

/** TAF v3 uses its own envelope, with the caller's effective role attached. */
const taf3 = (payload, account) => ({
  status: 'success',
  data: payload,
  // The capture shows `lead` for a project the caller can act on and `unknown`
  // for the list endpoints; the read-only role never reaches `lead`.
  rbacRole: account && account.role !== 'viewer' ? 'lead' : 'unknown',
});

/** TAF v4 drops the envelope entirely and returns a bare `{data}`. */
const taf4 = (payload) => ({ data: payload });

/** The validation error TAF answers with, matching the captured body. */
function tafValidationError(res, message, field) {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: [{ message, field }],
    },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Strips the bookkeeping markers the fixtures carry but the wire format does not. */
function toWire(row) {
  const { org, owner, ...rest } = row;
  return rest;
}

const intOr = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * A synthetic id for a create. Version and variant bits are set, so an id this
 * mock hands out passes the same UUID check the TAF routes apply to ids coming
 * back in.
 */
function uuid() {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 32; i += 1) out += hex[Math.floor(Math.random() * 16)];
  out = out.slice(0, 12) + '4' + out.slice(13, 16) + hex[8 + Math.floor(Math.random() * 4)] + out.slice(17);
  return [out.slice(0, 8), out.slice(8, 12), out.slice(12, 16), out.slice(16, 20), out.slice(20)].join('-');
}

const nowIso = () => new Date().toISOString();

/* ------------------------------------------------------------------ *
 * Unauthenticated: SSO verification
 * ------------------------------------------------------------------ */

/**
 * The only operation the spec marks `security: []` — the refresh token in the
 * body is the credential. This mock treats each account's bearer token as its
 * own refresh token, so the call is a self-refresh that hands back the same
 * JWT together with the session bundle.
 */
router.post('/um/api/auth/users/signIn/verification', (req, res) => {
  const refreshToken = (req.body || {}).refreshToken;
  if (!refreshToken) {
    return fail(res, 401, "Field 'refreshToken' is required.");
  }

  const account = ACCOUNTS[String(refreshToken).trim()];
  if (!account) {
    return fail(res, 401, 'error @ verification: refresh token is not valid');
  }

  const profile = data.PROFILES[account.username];
  return res.json(
    um(
      {
        user: {
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: `${profile.firstName} ${profile.lastName}`,
          picture: null,
          position: profile.position,
          location: profile.location,
          department: profile.department,
        },
        // The static tokens do not expire; the claim mirrors the JWT's own exp.
        expiry: '2100-01-01T00:00:00.000Z',
        jwt: TOKENS[account.username],
        roles: data.ROLES[account.username],
        settings: data.SETTINGS[account.username],
        permissions: [],
        entitlements: data.ENTITLEMENTS,
        session: account.session,
        userId: profile.userId,
        domain: 'dast.wrstudio.cloud',
      },
      'SSO Successful'
    )
  );
});

/* ------------------------------------------------------------------ *
 * Everything below requires the bearer token
 * ------------------------------------------------------------------ */

router.use(authenticate);

/* ---- User ---------------------------------------------------------- */

router.get('/um/api/auth/users/me/profile', (req, res) => {
  res.json(um(data.PROFILES[req.studio.username], 'success'));
});

router.get('/um/api/auth/users/me/profile/picture', (req, res) => {
  // No account in the capture had a picture set, and none does here: the
  // service answers 200 with a `success: false` envelope rather than a 404.
  res.json({
    success: false,
    data: null,
    message: 'error @ getProfilePicture: user does not have a picture',
  });
});

router.get('/um/api/auth/users/me/roles', (req, res) => {
  res.json(um(data.ROLES[req.studio.username], 'success'));
});

router.put('/um/api/auth/users/me/change/setting', (req, res) => {
  const settings = (req.body || {}).settings;
  if (!Array.isArray(settings) || settings.length === 0) {
    return fail(res, 400, 'settings must contain at least 1 elements');
  }

  const unknown = settings.find((entry) => !entry || !data.SETTING_IDS[entry.settingId]);
  if (unknown) {
    return fail(res, 400, 'settingId must be a valid UUID');
  }

  // Applied to a copy: the fixtures stay pristine for the next caller.
  const effective = { ...data.SETTINGS[req.studio.username] };
  for (const entry of settings) {
    effective[data.SETTING_IDS[entry.settingId]] = String(entry.settingValue);
  }

  return res.json(um(effective, 'User settings updated successfully'));
});

/**
 * A user may read their own memberships; an org admin may read those of any
 * account in their own org. Anything else is somebody else's object.
 */
router.get('/um/api/auth/users/:username/groups', (req, res) => {
  const target = req.params.username;
  const profile = data.PROFILES[target];

  if (!profile) {
    return fail(res, 404, `No such user: ${target}`);
  }
  if (target !== req.studio.username) {
    const sameOrg = data.ORGS[req.studio.org].id === profile.tenantId;
    if (!sameOrg || req.studio.role !== 'admin') {
      return fail(res, 403, `Not permitted to read the group membership of '${target}'.`);
    }
  }

  return res.json(um(data.MEMBERSHIP[target], 'Group membership obtained successfully'));
});

/* ---- Groups -------------------------------------------------------- */

/** Admin-only — the full directory is enforced in auth.js's ADMIN_ONLY_PATHS. */
router.get('/um/api/auth/groups', (req, res) => {
  res.json(um(umPage(data.GROUPS, intOr(req.query.limit, 0)), 'Successful'));
});

/* ---- Components ---------------------------------------------------- */

router.get('/um/api/components', (req, res) => {
  const name = req.query.name;
  const rows = name
    ? data.COMPONENTS.filter((c) => c.name.toLowerCase().includes(String(name).toLowerCase()))
    : data.COMPONENTS;
  // The capture shows the service defaulting to a page size of 5 here.
  res.json(um(umPage(rows, intOr(req.query.limit, 5)), 'Successful'));
});

router.get('/um/api/components/categories', (req, res) => {
  res.json(um(data.COMPONENT_CATEGORIES, 'Components categories obtained successfully'));
});

/* ---- Resources ----------------------------------------------------- */

/**
 * SQL-style `%` wildcard, as the `name` filter accepts. `%` alone — what the
 * SPA sends — matches everything.
 */
function nameMatches(pattern, value) {
  if (pattern === undefined || pattern === '') return true;
  const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.split('%').join('.*')}$`, 'i').test(value);
}

router.get('/um/api/resources', (req, res) => {
  const { type, category, username, name, toolId } = req.query;

  const rows = data.RESOURCES.filter((r) => r.org === req.studio.org)
    .filter((r) => !type || r.type === type)
    .filter((r) => !category || r.category === category)
    .filter((r) => !username || r.owner === username)
    .filter((r) => !toolId || r.toolId === toolId)
    .filter((r) => nameMatches(name, r.name))
    .map(toWire);

  res.json(um(umPage(rows, intOr(req.query.limit, 0)), 'Successful'));
});

router.post('/um/api/resources', (req, res) => {
  const body = req.body || {};

  const missing = ['name', 'category', 'type', 'componentWrrn'].filter((f) => !body[f]);
  if (missing.length) {
    return fail(res, 400, missing.map((f) => `${f} must be at least 1 characters`).join(' // '));
  }
  // The 400 the capture recorded twice, when the SPA sent groupId: "".
  if (!body.groupId || !UUID.test(String(body.groupId))) {
    return fail(res, 400, 'groupId must be at least 1 characters // groupId must be a valid UUID');
  }

  return res.json({
    success: true,
    data: `${body.componentWrrn}::${body.type}:${uuid()}`,
    message: 'Resource was registered successfully or already exist',
    error: null,
  });
});

const resourceOwner = (req) => {
  const row = data.RESOURCES.find((r) => r.wrrn === req.params.wrrn);
  return row && row.org;
};

router.put(
  '/um/api/resources/:wrrn',
  requireSameOrg(resourceOwner, 'resource'),
  (req, res) => {
    const row = data.RESOURCES.find((r) => r.wrrn === req.params.wrrn);
    const body = req.body || {};

    // Partial update, and not persisted: the fixture is left as it was so a
    // repeated scan sees the same state.
    const updated = {
      ...toWire(row),
      description: body.description !== undefined ? body.description : row.description,
      uniqueData: body.uniqueData
        ? { ...row.uniqueData, ...body.uniqueData, updatedDate: String(Date.now()) }
        : row.uniqueData,
    };

    res.json({ success: true, data: updated, message: 'Resource Updated', error: null });
  }
);

/* ---- Portal -------------------------------------------------------- */

router.get('/portal/api/component-management/components', (req, res) => {
  res.json(um(data.PORTAL_COMPONENTS, 'Entitlement list returned successfully'));
});

/* ------------------------------------------------------------------ *
 * Test Automation Framework
 * ------------------------------------------------------------------ */

/* ---- TAF v3: projects ---------------------------------------------- */

const projectsFor = (account) => data.TAF_PROJECTS.filter((p) => p.org === account.org);

router.get(['/taf/api/v3/projects', '/taf/api/v3/projects/'], (req, res) => {
  const offset = intOr(req.query.offset, 0);
  const count = intOr(req.query.count, 10);
  const filter = String(req.query.filter || '').toLowerCase();
  const column = req.query.column === 'name' ? 'name' : 'modifiedDate';
  const direction = intOr(req.query.direction, -1);

  const all = projectsFor(req.studio)
    .filter((p) => !filter || p.name.toLowerCase().includes(filter))
    .sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (direction < 0 ? -1 : 1));

  res.json(
    taf3({ totalRows: all.length, projects: all.slice(offset, offset + count).map(toWire) })
  );
});

router.post(['/taf/api/v3/projects', '/taf/api/v3/projects/'], (req, res) => {
  const body = req.body || {};
  if (!body.name) return tafValidationError(res, 'name must be at least 1 characters', 'body.name');
  if (!body.projectCode) {
    return tafValidationError(res, 'projectCode must be at least 1 characters', 'body.projectCode');
  }

  const email = data.PROFILES[req.studio.username].email;
  const created = nowIso();

  // Creation answers 201 here, unlike the UM service's 200 — the difference is
  // in the contract, so it is reproduced rather than smoothed over.
  res.status(201).json(
    taf3(
      {
        id: uuid(),
        projectCode: String(body.projectCode),
        name: body.name,
        description: body.description || '',
        targetRetention: body.targetRetention || 'release',
        targetRetentionDuration: body.targetRetentionDuration ?? 8,
        isDeleted: false,
        modifiedByUserName: req.studio.username,
        artifactStorage: null,
        createdBy: email,
        createdDate: created,
        modifiedBy: email,
        modifiedDate: created,
        secretPath: null,
        ramResourceName: null,
      },
      req.studio
    )
  );
});

const projectOwner = (req) => {
  const row = data.TAF_PROJECTS.find((p) => p.id === req.params.projectId);
  return row && row.org;
};

/** 400 before 403: an id that is not a UUID never identified an object. */
function requireProjectId(req, res, next) {
  if (!UUID.test(req.params.projectId)) {
    return tafValidationError(res, 'projectId must be a valid UUID', 'params.projectId');
  }
  return next();
}

router.get(
  '/taf/api/v3/projects/:projectId',
  requireProjectId,
  requireSameOrg(projectOwner, 'project'),
  (req, res) => {
    res.json(taf3(toWire(data.TAF_PROJECTS.find((p) => p.id === req.params.projectId)), req.studio));
  }
);

/* ---- TAF v3: executions -------------------------------------------- */

/** Every observed response was an empty page; none is invented here. */
const emptyExecutions = (req, res) =>
  res.json(taf3({ executions: data.TAF_EXECUTIONS, totalRows: 0 }));

router.get(
  '/taf/api/v3/projects/:projectId/test-plans/:testPlanId/executions',
  requireProjectId,
  requireSameOrg(projectOwner, 'project'),
  (req, res, next) => {
    const plan = data.TAF_TEST_PLANS.find((p) => p.id === req.params.testPlanId);
    if (!plan || plan.projectId !== req.params.projectId) {
      return fail(res, 404, `No such test plan: ${req.params.testPlanId}`);
    }
    return next();
  },
  emptyExecutions
);

router.get(['/taf/api/v3/executions', '/taf/api/v3/executions/'], emptyExecutions);

/* ---- TAF v4: test plans -------------------------------------------- */

const planProject = (plan) => {
  const project = data.TAF_PROJECTS.find((p) => p.id === plan.projectId);
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    projectCode: project.projectCode,
    createdBy: project.createdBy,
    createdDate: project.createdDate,
    modifiedBy: project.modifiedBy,
    modifiedByUserName: project.modifiedByUserName,
    modifiedDate: project.modifiedDate,
    isDeleted: project.isDeleted,
    isDisabled: false,
    targetRetention: project.targetRetention,
    targetRetentionDuration: project.targetRetentionDuration,
  };
};

/**
 * The literal `test-plans` sits where the sibling routes put a project id. It
 * is registered before them so Express cannot read it as one, and it pages with
 * `skip`/`limit` rather than v3's `offset`/`count`.
 */
router.get('/taf/api/v4/projects/test-plans', (req, res) => {
  const skip = intOr(req.query.skip, 0);
  const limit = intOr(req.query.limit, 10);
  const filter = String(req.query.filter || '').toLowerCase();

  const all = data.TAF_TEST_PLANS.filter((p) => p.org === req.studio.org).filter(
    (p) => !filter || p.name.toLowerCase().includes(filter)
  );

  res.json({
    data: all.slice(skip, skip + limit).map((plan) => ({
      ...toWire(plan),
      project: planProject(plan),
    })),
    totalRows: all.length,
  });
});

router.get(
  '/taf/api/v4/projects/:projectId/plugins',
  requireProjectId,
  requireSameOrg(projectOwner, 'project'),
  (req, res) => {
    // Only empty arrays were ever observed, so the element shape is unknown.
    res.json(taf4([]));
  }
);

router.post(
  '/taf/api/v4/projects/:projectId/test-plans',
  requireProjectId,
  requireSameOrg(projectOwner, 'project'),
  (req, res) => {
    const body = req.body || {};
    if (!body.name) return tafValidationError(res, 'name must be at least 1 characters', 'body.name');

    const email = data.PROFILES[req.studio.username].email;
    const created = nowIso();
    const testPlanId = uuid();

    // The Location header the service returns omits the /taf/api gateway
    // prefix, exactly as captured — it is not resolvable by the client as-is.
    res
      .status(201)
      .location(`/v4/projects/${req.params.projectId}/test-plans/${testPlanId}`)
      .json(
        taf4({
          id: testPlanId,
          name: body.name,
          description: body.description ?? null,
          projectId: req.params.projectId,
          targetRetention: body.targetRetention || 'release',
          isDisabled: false,
          createdDate: created,
          modifiedDate: created,
          createdBy: email,
          modifiedBy: email,
        })
      );
  }
);

router.get(
  '/taf/api/v4/projects/:projectId/test-plans/:testPlanId',
  requireProjectId,
  requireSameOrg(projectOwner, 'project'),
  (req, res) => {
    const plan = data.TAF_TEST_PLANS.find(
      (p) => p.id === req.params.testPlanId && p.projectId === req.params.projectId
    );
    if (!plan) {
      return fail(res, 404, `No such test plan: ${req.params.testPlanId}`);
    }

    const { totalEnvironments, totalTestCases, totalTestSuites, ...rest } = toWire(plan);
    return res.json(taf4({ ...rest, testSuites: [] }));
  }
);

/* ------------------------------------------------------------------ *
 * Fallback
 * ------------------------------------------------------------------ */

router.use((req, res) => {
  fail(res, 404, `No route for ${req.method} ${req.originalUrl}.`);
});

router.PREFIXES = PREFIXES;

module.exports = router;
