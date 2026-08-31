# MoonSun On-Prem Mock API

A runnable mock of every endpoint in [onpremtest.yaml](onpremtest.yaml). Paths, HTTP
methods and query/body parameters are exactly as the spec describes them — nothing
was renamed, added to, or dropped from the contract.

## Authentication

Platform cookie/CSRF auth. **Three headers are mandatory on every endpoint** —
a request missing any one of them never reaches the handler:

| Header | Requirement |
| ------ | ----------- |
| `Cookie` | must carry `platformsessionid` and `platformcsrftoken` (plus `login_region` / `login_domain`) |
| `X-CSRFToken` | must equal the `platformcsrftoken` cookie (double-submit) |
| `X-Requested-With` | must be the literal string `XMLHttpRequest` |

```js
const response = await fetch('https://<host>/api/fm/alarm_list', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cookie': 'login_region=default; login_domain=""; platformcsrftoken=<csrf>; platformsessionid=<session>',
    'X-CSRFToken': '<csrf>',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
});
```

### Login flow

1. **`GET /login`** — CSRF bootstrap. No session needed (but `X-Requested-With`
   still is). Sets `platformcsrftoken`, `login_region`, `login_domain` and
   returns the token in the body.
2. **`POST /login`** — send `username` + `password` (form-encoded or JSON) with
   the bootstrap cookie, a matching `X-CSRFToken`, and `X-Requested-With`.
   Returns the `platformsessionid` cookie, a rotated CSRF token, and a
   `required_headers` object you can replay verbatim on every later call.

| Username   | Password            | Role     | Tenant   | Purpose in an authorization scan |
| ---------- | ------------------- | -------- | -------- | -------------------------------- |
| `admin`    | `admin-password`    | admin    | Tenant-A | Owner |
| `user`     | `user-password`     | user     | Tenant-A | Non-owner peer, same tenant |
| `readonly` | `readonly-password` | readonly | Tenant-B | Low privilege, **different tenant** |

### Static sessions

Two sessions are seeded and never rotate or expire, so a test client can skip
the login flow and hard-code them:

| Role     | `platformsessionid`             | `platformcsrftoken` / `X-CSRFToken` |
| -------- | ------------------------------- | ----------------------------------- |
| admin    | `admin-static-session-token`    | `admin-static-csrf-token`           |
| user     | `user-static-session-token`     | `user-static-csrf-token`            |
| readonly | `readonly-static-session-token` | `readonly-static-csrf-token`        |

### Failure codes

| Condition | Status |
| --------- | ------ |
| `Cookie` header or `platformsessionid` missing, session unknown | `401` |
| `X-Requested-With` missing or not `XMLHttpRequest` | `403 missing_required_header` / `invalid_header` |
| `X-CSRFToken` missing, or not equal to the `platformcsrftoken` cookie | `403 csrf_failure` |
| CSRF cookie does not belong to the session | `403 csrf_failure` |
| Role not permitted on the path | `403 forbidden` |

## Access control

Three independent rules, so an authorization scan has something to find:

1. **Admin-only paths** — `user` and `readonly` get `403` on `/admin/datanets/`,
   `/admin/storage_overview/` and `/admin/system_config/`. Both the slashed and
   unslashed forms are covered.
2. **Read-only role** — `readonly` gets `403` on every non-GET, whatever the path.
3. **Tenant ownership** — the id-bearing paths `/identity/{project_id}/update/`
   and `/identity/users/{user_id}/detail/` return `403` when the object belongs
   to another tenant, and `404` when it does not exist.
   `/identity/application_credentials/` lists only the caller's tenant.

Tenant-owned object ids (taken from the HAR captures):

| Object          | Tenant-A                           | Tenant-B                           |
| --------------- | ---------------------------------- | ---------------------------------- |
| project         | `0388e7d480314c3c82b408e49c471ed9` | `b0e38d0e2b864874b9c2715218c95f74` |
| user            | `452c18fd6dec4b298942ab0e4f571036` | `7b4e2c9a1f6d40538e2a6c4b9d1f0003` |

Every other endpoint works for all three roles.

## Endpoints

| Method | Path | Params | admin | user |
| ------ | ---- | ------ | ----- | ---- |
| GET  | `/login` | `region`, `domain` (query) | no session required | no session required |
| POST | `/login` | form/JSON: `username`, `password`, `region`, `domain` | ✅ | ✅ |
| GET  | `/admin/datanets` | — | ✅ | ⛔ 403 |
| GET  | `/admin/host_topology/json` | `_` (query, cache-buster) | ✅ | ✅ |
| GET  | `/admin/software_management` | — | ✅ | ✅ |
| GET  | `/admin/software_management/releaseupload` | — | ✅ | ✅ |
| GET  | `/admin/storage_overview` | `loaded` (query) | ✅ | ⛔ 403 |
| GET  | `/admin/system_config` | — | ✅ | ⛔ 403 |
| GET  | `/api/fm/alarm_list` | — | ✅ | ✅ |
| GET  | `/api/fm/event_log_list` | — | ✅ | ✅ |
| GET  | `/api/fm/events_suppression_list` | — | ✅ | ✅ |
| GET  | `/api/keystone/roles` | — | ✅ | ✅ |
| POST | `/api/policy` | JSON body (optional) | ✅ | ✅ |
| GET  | `/api/settings` | — | ✅ | ✅ |
| GET  | `/header` | — | ✅ | ✅ |
| GET  | `/identity` | — | ✅ | ✅ |
| GET  | `/identity/create` | — | ✅ | ✅ |
| GET  | `/identity/groups` | — | ✅ | ✅ |
| POST | `/identity/groups/create` | form: `csrfmiddlewaretoken`, `name`, `description` | ✅ | ✅ |
| POST | `/identity/users/create` | form: `csrfmiddlewaretoken`, `name`, `description`, `email`, `password`, `confirm_password`, `domain_id`, `domain_name`, `project`, `role_id`, `enabled`, `fake_email`, `fake_password` | ✅ | ✅ |
| GET  | `/project/api_access/view_credentials` | — | ✅ | ✅ |

`GET /login` and `POST /login` are described in the spec. Two extras are not:
`GET /` (service index + credentials, used as the Render health check) and
`GET /openapi.yaml` (serves the spec file). Both are unauthenticated and both
skip the three-header requirement.

`/header` returns an HTML fragment; every other endpoint returns JSON.

## Run locally

```bash
npm install
npm start                     # listens on $PORT, default 8443
```

Log in and reuse the returned cookies:

```bash
# 1. CSRF bootstrap
curl -c jar.txt -H 'X-Requested-With: XMLHttpRequest' http://localhost:8443/login

# 2. Log in (CSRF token comes from step 1)
curl -b jar.txt -c jar.txt -X POST http://localhost:8443/login \
  -H 'X-Requested-With: XMLHttpRequest' -H "X-CSRFToken: $CSRF" \
  -d 'username=admin' -d 'password=admin-password'

# 3. Call anything, replaying all three headers
curl -b jar.txt -H 'X-Requested-With: XMLHttpRequest' -H "X-CSRFToken: $CSRF" \
  http://localhost:8443/admin/system_config
```

Or skip the flow with a static session:

```bash
ADMIN='Cookie: login_region=default; login_domain=""; platformcsrftoken=admin-static-csrf-token; platformsessionid=admin-static-session-token'
USER='Cookie: login_region=default; login_domain=""; platformcsrftoken=user-static-csrf-token; platformsessionid=user-static-session-token'
AJAX='X-Requested-With: XMLHttpRequest'

curl -H "$ADMIN" -H "$AJAX" -H 'X-CSRFToken: admin-static-csrf-token' http://localhost:8443/admin/system_config
curl -H "$USER"  -H "$AJAX" -H 'X-CSRFToken: user-static-csrf-token'  http://localhost:8443/admin/system_config  # 403
curl -H "$USER"  -H "$AJAX" -H 'X-CSRFToken: user-static-csrf-token'  http://localhost:8443/api/fm/alarm_list    # 200
curl -H "$ADMIN" -H "$AJAX" http://localhost:8443/api/fm/alarm_list                                              # 403, no X-CSRFToken
```

## Deploy on Render

1. Push this directory to a Git repo (GitHub/GitLab).
2. In Render: **New → Web Service**, point it at the repo. [render.yaml](render.yaml)
   is picked up automatically — otherwise set Runtime `Node`, Build `npm install`,
   Start `npm start`.
3. Render injects `PORT`; the server binds to it. No other environment variables
   are needed.

Your base URL becomes `https://<service>.onrender.com`. To point a client that
was written against the spec at the deployment, change only the `servers[0].url`
in [onpremtest.yaml](onpremtest.yaml) — the paths below it are unchanged.

Note: the free plan sleeps after inactivity, so the first request after an idle
period takes a few seconds.
