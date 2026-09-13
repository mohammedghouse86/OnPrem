'use strict';

/**
 * Wind River Studio mock — the second app.
 *
 * Serves every path item in `second_app_oas.yaml` — every API call present in
 * the HAR captures, across the eight gateway prefixes the real Kong instance
 * fronts. Four are the platform's own services (`/um/api`, `/portal/api`,
 * `/taf/api`, `/vlab/api`); four are third-party products bundled with it
 * (`/grafana/api`, `/kiali/api`, `/prometheus/api`, `/tracing/api`), which
 * answer on the same host and accept the same bearer token. Nothing was
 * renamed, added to, or dropped from that contract.
 *
 * This is an Express Router, mounted by ../server.js ahead of the on-prem app's
 * own middleware so the two surfaces never share an authentication step. None
 * of the prefixes above collides with any path in `onpremtest.yaml`, so both
 * apps can answer on one host and one base path while staying isolated.
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
const PREFIXES = [
  '/um/api',
  '/portal/api',
  '/taf/api',
  '/vlab/api',
  // Third-party services bundled behind the same gateway.
  '/grafana/api',
  '/kiali/api',
  '/prometheus/api',
  '/tracing/api',
];

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

/**
 * Two per-project collections that were empty in every observed call, so their
 * element shape is unknown. Both are org-scoped like the rest of TAF.
 */
for (const segment of ['targets', 'test-code-collections']) {
  router.get(
    `/taf/api/v3/projects/:projectId/${segment}`,
    requireProjectId,
    requireSameOrg(projectOwner, 'project'),
    (req, res) => res.json(taf3([]))
  );
}

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
 * Virtual Lab — target manager
 *
 * Admin-only, the whole subtree. The 403 for every other role is applied in
 * auth.js via ADMIN_ONLY_PREFIXES, before any of these handlers runs, so the
 * rule cannot be missed off one route by accident.
 * ------------------------------------------------------------------ */

const TM = '/vlab/api/v4/target-manager';

/**
 * The list envelope: a count/offset/total wrapper in which `offset` is a
 * string, not a number. That is what the service returns.
 */
const vlabList = (rows) => ({
  status: 'success',
  count: rows.length,
  offset: '0',
  total: rows.length,
  data: rows,
});

/** The hierarchy reads answer with a bare `{status, data}` and no paging. */
const vlabData = (payload) => ({ status: 'success', data: payload });

const VLAB_LISTS = {
  bsps: 'VLAB_BSPS',
  'connection-types': 'VLAB_CONNECTION_TYPES',
  countries: 'VLAB_COUNTRIES',
  cpus: 'VLAB_CPUS',
  'info-architectures': 'VLAB_INFO_ARCHITECTURES',
  kvm: 'VLAB_KVM',
  labs: 'VLAB_LABS',
  locations: 'VLAB_LOCATIONS',
  'network-interfaces': 'VLAB_NETWORK_INTERFACES',
  pdus: 'VLAB_PDUS',
};

for (const [segment, fixture] of Object.entries(VLAB_LISTS)) {
  router.get(`${TM}/${segment}`, (req, res) => res.json(vlabList(data[fixture])));
}

/**
 * Reports whether the caller has any lab resource assigned. The captured
 * response is a refusal — `check: false` with the "contact your administrator"
 * message — which is what an account with no assignment sees.
 */
router.get(`${TM}/checkrbac`, (req, res) => {
  res.json(vlabData(data.VLAB_CHECKRBAC));
});

router.get(`${TM}/labs-locations`, (req, res) => {
  res.json(vlabData(data.VLAB_LABS_LOCATIONS));
});

/**
 * Despite the name, the path parameter is a STATE id and the response is the
 * cities under it — the platform's naming, kept as observed. An id that is not
 * a UUID is rejected before it can be looked up.
 */
router.get(`${TM}/cities/:cityId`, (req, res) => {
  if (!UUID.test(req.params.cityId)) {
    return fail(res, 400, 'cityId must be a valid UUID');
  }
  return res.json(vlabData(data.VLAB_CITIES));
});

/** Locations within a city. Here the parameter really is a city id. */
router.get(`${TM}/locations-city/:locationsCityId`, (req, res) => {
  if (!UUID.test(req.params.locationsCityId)) {
    return fail(res, 400, 'locationsCityId must be a valid UUID');
  }
  return res.json(vlabData(data.VLAB_LOCATIONS_BY_CITY));
});

/* ---- target manager: the remaining reads ---------------------------- */

/**
 * `offset` and `count` are typed inconsistently across these services and the
 * inconsistency is the contract, so each list below states which form it uses
 * rather than sharing one helper.
 */
router.get(`${TM}/state`, (req, res) => res.json(vlabList(data.VLAB_STATES)));
router.get(`${TM}/targets`, (req, res) => res.json(vlabList(data.VLAB_EMPTY)));
router.get(`${TM}/boot-servers`, (req, res) => res.json(vlabList(data.VLAB_EMPTY)));
router.get(`${TM}/terminal-server`, (req, res) => res.json(vlabList(data.VLAB_TERMINAL_SERVERS)));

/** Returns `{stateId, name}` pairs — not the `id` key the sibling reads use. */
router.get(`${TM}/states/:stateId`, (req, res) => {
  if (!UUID.test(req.params.stateId)) {
    return fail(res, 400, 'stateId must be a valid UUID');
  }
  return res.json(vlabData(data.VLAB_STATE_BY_ID));
});

/**
 * The unversioned city routes. `/vlab/api/target-manager/city` has no `/v4`
 * segment — the SPA calls this older path alongside the v4 ones, so both are
 * served.
 */
const TM_V0 = '/vlab/api/target-manager';

router.get(`${TM_V0}/city`, (req, res) => res.json(vlabList(data.VLAB_CITY_LIST)));

/* ---- target manager: writes ---------------------------------------- */

/**
 * Creates answer in one of two shapes. The TypeORM-style insert result — with
 * `identifiers`, `generatedMaps` and a snake_case `raw` — comes back from the
 * BSP, architecture, lab, network-interface and terminal-server creates; the
 * plain `{id}` comes back from country, state, city, location and KVM. Which
 * endpoint uses which is not predictable from the resource, so each is wired to
 * the one it was observed returning.
 */
function insertResult(extra) {
  const id = uuid();
  const created = nowIso();
  return vlabData({
    identifiers: [{ id }],
    generatedMaps: [{ id, ...(extra || {}), createdDate: created, modifiedDate: created }],
    raw: [{ id, ...(extra || {}), created_date: created, modified_date: created }],
  });
}

const idResult = () => vlabData({ id: uuid() });

/** What an update returns: a row count, and empty maps. */
const updateResult = () => vlabData({ generatedMaps: [], raw: [], affected: 1 });

/** `name` is the one field every one of these creates requires. */
function requireName(req, res, next) {
  if (!req.body || !req.body.name) {
    return fail(res, 400, 'name must be at least 1 characters');
  }
  return next();
}

/** Rejects an id that is not a UUID before the update is attempted. */
const requireUuid = (param) => (req, res, next) => {
  if (!UUID.test(req.params[param])) {
    return fail(res, 400, `${param} must be a valid UUID`);
  }
  return next();
};

// Creates returning the insert result. 201 in every observed case.
for (const segment of ['bsp', 'info-architecture', 'lab', 'network-interface']) {
  router.post(`${TM}/${segment}`, requireName, (req, res) => res.status(201).json(insertResult()));
}

// Creates returning a bare id.
for (const segment of ['country', 'state', 'location', 'kvm']) {
  router.post(`${TM}/${segment}`, requireName, (req, res) => res.status(201).json(idResult()));
}

router.post(`${TM_V0}/city`, requireName, (req, res) => res.status(201).json(idResult()));

/** The terminal server echoes `portCount` back in the insert result. */
router.post(`${TM}/terminal-server`, requireName, (req, res) => {
  res.status(201).json(insertResult({ portCount: String(req.body.portCount ?? '') }));
});

/**
 * The one create observed failing. The service answers **HTTP 200** carrying a
 * `statusCode: 500` error envelope — the status line and the body disagree, and
 * that is reproduced rather than corrected. Only the four listed names are
 * accepted.
 */
const CONNECTION_TYPES = ['ssh', 'serial', 'telnet', 'android'];

router.post(`${TM}/connection-type`, requireName, (req, res) => {
  if (!CONNECTION_TYPES.includes(String(req.body.name).toLowerCase())) {
    return res.json(data.VLAB_CONNECTION_TYPE_ERROR);
  }
  return res.status(201).json(insertResult());
});

/**
 * Updates. The status codes differ per resource for no reason visible in the
 * traffic — 202 for BSP, KVM and network interface, 200 for architecture and
 * terminal server — so each is pinned to what it returned.
 */
const UPDATE_STATUS = {
  bsp: 202,
  'network-interface': 202,
  'info-architecture': 200,
  'terminal-server': 200,
};

for (const [segment, status] of Object.entries(UPDATE_STATUS)) {
  router.put(`${TM}/${segment}/:id`, requireUuid('id'), requireName, (req, res) =>
    res.status(status).json(updateResult())
  );
}

/** KVM's update is the odd one out: 202, and a body with no `data` at all. */
router.put(`${TM}/kvm/:id`, requireUuid('id'), requireName, (req, res) => {
  res.status(202).json({ status: 'success' });
});

/* ---- reservations --------------------------------------------------- */

const RES = '/vlab/api/v4/reservation';

/** This one returns `count` as a STRING; its two siblings return a number. */
router.get(`${RES}/physical-reservations`, (req, res) => {
  res.json({
    status: 'success',
    count: String(intOr(req.query.count, 50)),
    offset: String(intOr(req.query.offset, 0)),
    total: 0,
    data: data.VLAB_EMPTY,
  });
});

for (const segment of ['reservations', 'virtual-reservations']) {
  router.get(`${RES}/${segment}`, (req, res) => {
    res.json({
      status: 'success',
      count: intOr(req.query.count, 50),
      offset: intOr(req.query.offset, 0),
      total: 0,
      data: data.VLAB_EMPTY,
    });
  });
}

router.get('/vlab/api/reservation/queue/list', (req, res) => {
  res.json(vlabData(data.VLAB_EMPTY));
});

/* ---- target control ------------------------------------------------- */

/**
 * The caller's own lab groups. Unlike the target manager this is not admin-only
 * — it reports on the caller, so every account may read its own.
 */
router.get('/vlab/api/v4/target-control/user/groups', (req, res) => {
  res.json(vlabData(data.MEMBERSHIP[req.studio.username]));
});

router.post('/vlab/api/v4/target-control/targets/search', (req, res) => {
  res.json({
    status: 'success',
    count: intOr(req.query.count, 50),
    offset: intOr(req.query.offset, 0),
    total: 0,
    data: data.VLAB_EMPTY,
  });
});

router.get('/vlab/api/v1/target-manager/target-action-collections', (req, res) => {
  res.json({
    status: 'success',
    count: 0,
    offset: intOr(req.query.offset, 0),
    total: 0,
    data: data.VLAB_EMPTY,
  });
});

/** Virtual target templates. Note `offset` is a string and there is no `total`. */
router.post('/vlab/api/v4/virtual-target-manager/virtual-targets/search', (req, res) => {
  res.json({
    status: 'success',
    offset: String(intOr(req.query.offset, 0)),
    count: data.VLAB_VIRTUAL_TARGETS.length,
    data: data.VLAB_VIRTUAL_TARGETS,
  });
});

/* ------------------------------------------------------------------ *
 * Third-party services behind the same gateway
 *
 * Grafana, Kiali/Istio, Prometheus and Jaeger ship with the platform and answer
 * on the same host with the same bearer token. They are open to both roles:
 * they are observability tools an ordinary account uses, and nothing in the
 * capture suggests the gateway treats them as admin-only.
 *
 * Payloads are the captured ones, trimmed — see data-thirdparty.js.
 * ------------------------------------------------------------------ */

const third = require('./data-thirdparty');

/* ---- Grafana (25) ------------------------------------------- */

router.get('/grafana/api/dashboard/snapshots', (req, res) => res.json(third.GRAFANA_DASHBOARD_SNAPSHOTS));

router.get('/grafana/api/dashboards/home', (req, res) => res.json(third.GRAFANA_DASHBOARDS_HOME));

router.get('/grafana/api/dashboards/public-dashboards', (req, res) => res.json(third.GRAFANA_DASHBOARDS_PUBLIC_DASHBOARDS));

router.get('/grafana/api/dashboards/tags', (req, res) => res.json(third.GRAFANA_DASHBOARDS_TAGS));

router.get('/grafana/api/datasources', (req, res) => res.json(third.GRAFANA_DATASOURCES));

router.get('/grafana/api/datasources/correlations', (req, res) => res.json(third.GRAFANA_DATASOURCES_CORRELATIONS));

router.get('/grafana/api/datasources/uid/:uid/resources/api/v1/label/__name__/values', (req, res) => res.json(third.GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABEL_NAME_VALUES));

router.get('/grafana/api/datasources/uid/:uid/resources/api/v1/labels', (req, res) => res.json(third.GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABELS));

router.get('/grafana/api/datasources/uid/:uid/resources/api/v1/metadata', (req, res) => res.json(third.GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_METADATA));

router.get('/grafana/api/datasources/uid/:uid/resources/api/v1/query_exemplars', (req, res) => res.json(third.GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_QUERY_EXEMPLARS));

router.get('/grafana/api/datasources/uid/:uid/resources/api/v1/rules', (req, res) => res.json(third.GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_RULES));

router.get('/grafana/api/folders', (req, res) => res.json(third.GRAFANA_FOLDERS));

router.get('/grafana/api/folders/general', (req, res) => res.json(third.GRAFANA_FOLDERS_GENERAL));

router.post('/grafana/api/frontend-metrics', (req, res) => res.status(200).end());

router.get('/grafana/api/gnet/plugins', (req, res) => res.json(third.GRAFANA_GNET_PLUGINS));

router.get('/grafana/api/gnet/plugins/:pluginId/versions/:version/logos/small', (req, res) => {
  res.type('image/svg+xml').send(third.GRAFANA_PLUGIN_LOGO);
});

router.get('/grafana/api/library-elements', (req, res) => res.json(third.GRAFANA_LIBRARY_ELEMENTS));

router.get('/grafana/api/plugins', (req, res) => res.json(third.GRAFANA_PLUGINS));

router.get('/grafana/api/plugins/:pluginId/settings', (req, res) => res.json(third.GRAFANA_PLUGINS_BY_SETTINGS));

router.get('/grafana/api/plugins/errors', (req, res) => res.json(third.GRAFANA_PLUGINS_ERRORS));

router.get('/grafana/api/prometheus/grafana/api/v1/rules', (req, res) => res.json(third.GRAFANA_PROMETHEUS_GRAFANA_API_V1_RULES));

router.get('/grafana/api/search', (req, res) => res.json(third.GRAFANA_SEARCH));

router.get('/grafana/api/search/sorting', (req, res) => res.json(third.GRAFANA_SEARCH_SORTING));

router.get('/grafana/api/user/orgs', (req, res) => res.json(third.GRAFANA_USER_ORGS));

router.get('/grafana/api/user/preferences', (req, res) => res.json(third.GRAFANA_USER_PREFERENCES));

/* ---- Kiali / Istio (17) ------------------------------------------- */

router.get('/kiali/api/auth/info', (req, res) => res.json(third.KIALI_AUTH_INFO));

router.get('/kiali/api/clusters/apps', (req, res) => res.json(third.KIALI_CLUSTERS_APPS));

router.get('/kiali/api/clusters/health', (req, res) => res.json(third.KIALI_CLUSTERS_HEALTH));

router.get('/kiali/api/clusters/services', (req, res) => res.json(third.KIALI_CLUSTERS_SERVICES));

router.get('/kiali/api/clusters/tls', (req, res) => res.json(third.KIALI_CLUSTERS_TLS));

router.get('/kiali/api/clusters/workloads', (req, res) => res.json(third.KIALI_CLUSTERS_WORKLOADS));

router.get('/kiali/api/config', (req, res) => res.json(third.KIALI_CONFIG));

router.get('/kiali/api/crippled', (req, res) => {
  res.status(200).type('text/plain').send(third.KIALI_CRIPPLED);
});

router.get('/kiali/api/grafana', (req, res) => res.json(third.KIALI_GRAFANA));

router.get('/kiali/api/istio/config', (req, res) => res.json(third.KIALI_ISTIO_CONFIG));

router.get('/kiali/api/istio/status', (req, res) => res.json(third.KIALI_ISTIO_STATUS));

router.get('/kiali/api/istio/validations', (req, res) => res.json(third.KIALI_ISTIO_VALIDATIONS));

router.get('/kiali/api/mesh/controlplanes', (req, res) => res.json(third.KIALI_MESH_CONTROLPLANES));

router.get('/kiali/api/mesh/graph', (req, res) => res.json(third.KIALI_MESH_GRAPH));

router.get('/kiali/api/namespaces', (req, res) => res.json(third.KIALI_NAMESPACES));

router.get('/kiali/api/status', (req, res) => res.json(third.KIALI_STATUS));

router.get('/kiali/api/tracing', (req, res) => res.json(third.KIALI_TRACING));

/* ---- Prometheus (11) ------------------------------------------- */

router.get('/prometheus/api/v1/alertmanagers', (req, res) => res.json(third.PROMETHEUS_V1_ALERTMANAGERS));

router.get('/prometheus/api/v1/label/__name__/values', (req, res) => res.json(third.PROMETHEUS_V1_LABEL_NAME_VALUES));

router.get('/prometheus/api/v1/query', (req, res) => res.json(third.PROMETHEUS_V1_QUERY));

router.get('/prometheus/api/v1/rules', (req, res) => res.json(third.PROMETHEUS_V1_RULES));

router.get('/prometheus/api/v1/scrape_pools', (req, res) => res.json(third.PROMETHEUS_V1_SCRAPE_POOLS));

router.get('/prometheus/api/v1/status/buildinfo', (req, res) => res.json(third.PROMETHEUS_V1_STATUS_BUILDINFO));

router.get('/prometheus/api/v1/status/config', (req, res) => res.json(third.PROMETHEUS_V1_STATUS_CONFIG));

router.get('/prometheus/api/v1/status/flags', (req, res) => res.json(third.PROMETHEUS_V1_STATUS_FLAGS));

router.get('/prometheus/api/v1/status/runtimeinfo', (req, res) => res.json(third.PROMETHEUS_V1_STATUS_RUNTIMEINFO));

router.get('/prometheus/api/v1/status/tsdb', (req, res) => res.json(third.PROMETHEUS_V1_STATUS_TSDB));

router.get('/prometheus/api/v1/targets', (req, res) => res.json(third.PROMETHEUS_V1_TARGETS));

/* ---- Jaeger tracing (7) ------------------------------------------- */

router.get('/tracing/api/dependencies', (req, res) => res.json(third.TRACING_DEPENDENCIES));

router.get('/tracing/api/metrics/calls', (req, res) => {
  res.status(501).type('text/plain').send(third.TRACING_METRICS_CALLS);
});

router.get('/tracing/api/metrics/errors', (req, res) => {
  res.status(501).type('text/plain').send(third.TRACING_METRICS_ERRORS);
});

router.get('/tracing/api/metrics/latencies', (req, res) => {
  res.status(501).type('text/plain').send(third.TRACING_METRICS_LATENCIES);
});

router.get('/tracing/api/services', (req, res) => res.json(third.TRACING_SERVICES));

router.get('/tracing/api/services/:service/operations', (req, res) => res.json(third.TRACING_SERVICES_BY_OPERATIONS));

router.get('/tracing/api/traces', (req, res) => res.json(third.TRACING_TRACES));

/* ------------------------------------------------------------------ *
 * Fallback
 * ------------------------------------------------------------------ */

router.use((req, res) => {
  fail(res, 404, `No route for ${req.method} ${req.originalUrl}.`);
});

router.PREFIXES = PREFIXES;

module.exports = router;
