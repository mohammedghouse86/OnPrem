# MoonSun On-Prem Mock API

A runnable mock of every endpoint in [onpremtest.yaml](onpremtest.yaml). Paths, HTTP
methods and query/body parameters are exactly as the spec describes them — nothing
was renamed, added to, or dropped from the contract.

## Two apps, one service

One deployment serves two unrelated mocks from the same host and the same base path.
They are kept apart by path prefix and by credential, and each keeps its own spec file:

| App | Spec | Paths | Credential |
| --- | ---- | ----- | ---------- |
| On-prem (this document) | [onpremtest.yaml](onpremtest.yaml), served at `/openapi.yaml` | everything except the prefixes opposite | session cookie + `X-CSRFToken` + `X-Requested-With` |
| Studio ("second app") | [second app/second_app_oas.yaml](second%20app/second_app_oas.yaml), served at `/second-app-openapi.yaml` | `/um/api`, `/portal/api`, `/taf/api`, `/vlab/api` | `Authorization: Bearer <token>` |

No path in either spec begins with a prefix belonging to the other, so no request is
ambiguous. Neither app recognises the other's credential: a Studio token on an on-prem
path fails, and an on-prem session cookie on a Studio path fails. A test run driven by
one spec therefore never touches the other's surface. The second app is documented
under [Second app](#second-app--wind-river-studio) below; everything until then
describes the on-prem app.

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

Tenant-owned object ids (synthetic — the real ids are not kept in this repo):

| Object          | Tenant-A                           | Tenant-B                           |
| --------------- | ---------------------------------- | ---------------------------------- |
| project         | `0000aaaa0000bbbb0000cccc00000001` | `0000aaaa0000bbbb0000cccc00000002` |
| user            | `0000dddd0000eeee0000ffff00000001` | `0000dddd0000eeee0000ffff00000003` |

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

## Second app — Wind River Studio

A runnable mock of every endpoint in
[second app/second_app_oas.yaml](second%20app/second_app_oas.yaml) — 20 paths, 22
operations, reconstructed from the `dast.wrstudio.cloud` HAR captures. Same rule as
above: nothing renamed, added, or dropped. The code lives beside the spec in
[second app/](second%20app/) — [auth.js](second%20app/auth.js) (bearer tokens),
[data.js](second%20app/data.js) (fixtures taken from the captured responses) and
[routes.js](second%20app/routes.js) (the router that [server.js](server.js) mounts).

### Authentication

Bearer tokens, with no relationship to the on-prem app's cookie/CSRF scheme — separate
accounts, separate credentials, separate error bodies, no shared state. **Three headers
carry a request, and they are the only three needed:**

```js
var url = 'https://<service>.onrender.com/um/api/resources?type=dashboard&category=dashboard&username=&limit=0&name=%25';
var token = 'PASTE_YOUR_TOKEN_HERE';

fetch(url, {
  method: 'GET',
  headers: {
    accept: 'application/json, text/plain, */*',
    authorization: 'Bearer ' + token,
    cookie: 'authCookiePart0=' + token + '; languageCookie=en-US'
  }
})
  .then(function (res) { console.log('status:', res.status); return res.text(); })
  .then(function (b) { console.log('body:', b); })
  .catch(function (e) { console.error('fetch error:', e); });
```

`Authorization` is the credential. The `authCookiePart*` cookie is the same token by
another route — the real SPA sets it client-side so sibling apps share one session — and
is accepted on its own, which is what `security: [bearerAuth, authCookie]` in the spec
means. When both are present, the header wins. The real service chunks the cookie at
3800 characters and records the count in `authCookieCount`; these tokens fit in one
part, so `authCookiePart0` alone carries them.

Note that `Cookie` is a forbidden header name in browser `fetch()` — a browser silently
drops it and sends its own cookies instead. Only a non-browser client (Node, curl,
Postman) actually transmits a hand-built `Cookie` header. Since the bearer header is
enough on its own, this does not matter in practice.

### Accounts

Three, seeded and never rotated: the tokens carry an `exp` claim in the year 2100, no
signature is verified, and nothing expires or refreshes. Run
`npm run accounts:second-app` to write `second app/ACCOUNTS.txt` with the three headers
per account, ready to paste. That file holds working tokens, so it is gitignored.

| Account | Role | Org | Purpose in an authorization scan |
| ------- | ---- | --- | -------------------------------- |
| `testadmin01` | admin | Studio-Org-A | Owner |
| `testuser01` | user | Studio-Org-A | Non-owner peer, same org |
| `testviewer01` | viewer | Studio-Org-B | Low privilege, **different org** |

### Failure codes

| Condition | Status |
| --------- | ------ |
| No `Authorization` header and no `authCookiePart0` cookie | `401` |
| `Authorization` present but not the Bearer scheme | `401` |
| Token unknown | `401` |
| Role not permitted on the path, or read-only role on a write | `403` |
| Object belongs to another org | `403` |
| Object does not exist | `404` |

Every one of these uses the `UmEnvelope` error shape —
`{"success": false, "data": null, "correlationId": null, "message": "…"}`. The TAF
routes answer `400` with their own `{"error": {"code": "VALIDATION_ERROR", …}}` body,
as the contract specifies.

### Access control

The same three rules as the on-prem app, so both surfaces are probed the same way:

1. **Admin-only paths** — `403` for `user` and `viewer`:
   - `GET /um/api/auth/groups`, the full RBAC directory.
   - **the entire `/vlab/api/v4/target-manager` subtree** — all 14 paths. The refusal
     is applied by prefix in [second app/auth.js](second%20app/auth.js)
     (`ADMIN_ONLY_PREFIXES`) before any handler runs, so it cannot be missed off one
     route by accident, and no payload leaks with the `403`.
2. **Read-only role** — `viewer` gets `403` on every non-GET, whatever the path.
3. **Org ownership** — the id-bearing TAF paths and `PUT /um/api/resources/{wrrn}`
   return `403` when the object belongs to another org and `404` when it does not
   exist, so a probe cannot enumerate ids. `GET /um/api/resources` and
   `GET /taf/api/v4/projects/test-plans` list only the caller's own org, and
   `GET /um/api/auth/users/{username}/groups` is restricted to the caller unless the
   caller is an admin of the target's org.

Org-owned object ids:

| Object    | Studio-Org-A                           | Studio-Org-B                           |
| --------- | -------------------------------------- | -------------------------------------- |
| project   | `7b00367e-46fd-4d54-acd7-cc07923d14bb` | `a4e81c72-3f65-4d09-b8a1-77c2e5940db3` |
| test plan | `0f6ba250-3a07-4858-9aee-1621fcd5392c` | `d1b93f57-6c20-4a88-9e34-08fa5c71b6e2` |
| dashboard | WRRN ending `dashboard:61ccb06b-…`     | WRRN ending `dashboard:2c7f4b81-…`     |

### Endpoints

| Method | Path | Params | admin | viewer |
| ------ | ---- | ------ | ----- | ------ |
| POST | `/um/api/auth/users/signIn/verification` | JSON: `refreshToken` | no token required | no token required |
| GET  | `/um/api/auth/users/me/profile` | — | ✅ | ✅ |
| GET  | `/um/api/auth/users/me/profile/picture` | — | ✅ | ✅ |
| GET  | `/um/api/auth/users/me/roles` | — | ✅ | ✅ |
| PUT  | `/um/api/auth/users/me/change/setting` | JSON: `settings[]` | ✅ | ⛔ 403 |
| GET  | `/um/api/auth/users/{username}/groups` | — | ✅ own org | ✅ self only |
| GET  | `/um/api/auth/groups` | `limit` | ✅ | ⛔ 403 |
| GET  | `/um/api/components` | `name` | ✅ | ✅ |
| GET  | `/um/api/components/categories` | — | ✅ | ✅ |
| GET  | `/um/api/resources` | `type`, `category`, `username`, `limit`, `name`, `toolId` | ✅ | ✅ own org |
| POST | `/um/api/resources` | JSON: `name`, `category`, `type`, `componentWrrn`, `groupId`, … | ✅ | ⛔ 403 |
| PUT  | `/um/api/resources/{wrrn}` | JSON: `description`, `uniqueData` | ✅ own org | ⛔ 403 |
| GET  | `/portal/api/component-management/components` | — | ✅ | ✅ |
| GET  | `/taf/api/v3/projects` | `offset`, `count`, `filter`, `column`, `direction`, `getFromTAF` | ✅ | ✅ own org |
| POST | `/taf/api/v3/projects` | JSON: `name`, `projectCode`, … | ✅ | ⛔ 403 |
| GET  | `/taf/api/v3/projects/{projectId}` | `getFromTAF` | ✅ own org | ✅ own org |
| GET  | `/taf/api/v3/projects/{projectId}/test-plans/{testPlanId}/executions` | `executionStatus`, `offset`, `count`, `filter`, `column`, `direction` | ✅ own org | ✅ own org |
| GET  | `/taf/api/v3/executions` | same as above | ✅ | ✅ |
| GET  | `/taf/api/v4/projects/test-plans` | `skip`, `limit`, `filter`, `column`, `direction` | ✅ | ✅ own org |
| GET  | `/taf/api/v4/projects/{projectId}/plugins` | — | ✅ own org | ✅ own org |
| POST | `/taf/api/v4/projects/{projectId}/test-plans` | JSON: `name`, `projectId`, … | ✅ own org | ⛔ 403 |
| GET  | `/taf/api/v4/projects/{projectId}/test-plans/{testPlanId}` | — | ✅ own org | ✅ own org |
| GET  | `/vlab/api/v4/target-manager/bsps` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/checkrbac` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/cities/{cityId}` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/connection-types` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/countries` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/cpus` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/info-architectures` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/kvm` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/labs` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/labs-locations` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/locations` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/locations-city/{locationsCityId}` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/network-interfaces` | — | ✅ | ⛔ 403 |
| GET  | `/vlab/api/v4/target-manager/pdus` | — | ✅ | ⛔ 403 |

The `user` account gets the same `403` as `viewer` on every `/vlab` row — the subtree is
admin-only, not org-scoped, so both non-admin roles are refused identically. Two of the
paths take an id: `/cities/{cityId}` is passed a **state** id and returns that state's
cities (the platform's naming, kept as observed), while `/locations-city/{id}` really is
a city id. Both answer `400` when the id is not a UUID.

`POST /um/api/auth/users/signIn/verification` is the one operation the spec marks
`security: []` — the refresh token in the body is the credential. Each account's bearer
token doubles as its own refresh token, so the call is a self-refresh that returns the
same JWT along with the session bundle.

Responses reproduce the platform's quirks rather than tidying them: three different
envelopes across the three services, `200` (not `201`) from `POST /um/api/resources`,
a `Location` header on the TAF create that omits the `/taf/api` gateway prefix, and
dashboard timestamps as epoch-millisecond **strings**. Writes are not persisted — a
create or update returns the object it would have made and leaves the fixtures alone,
so a repeated scan sees the same state. Conditional requests work: `ETag` is set on
every response and a matching `If-None-Match` answers `304`, which is what over half
the captured traffic did.

### Try it locally

```bash
npm start                            # same server, both apps
npm run accounts:second-app          # writes second app/ACCOUNTS.txt

TOKEN=$(grep -m1 'authorization: Bearer' "second app/ACCOUNTS.txt" | sed 's/.*Bearer //')

curl -H 'accept: application/json, text/plain, */*' -H "authorization: Bearer $TOKEN" \
  "http://localhost:8443/um/api/resources?type=dashboard&category=dashboard&username=&limit=0&name=%25"

curl -H "authorization: Bearer $TOKEN" http://localhost:8443/taf/api/v3/projects
curl -H "authorization: Bearer $TOKEN" http://localhost:8443/um/api/auth/groups          # 200 for admin
curl http://localhost:8443/um/api/resources                                              # 401, no token
```

The admin-only rule, with the static cookie as the only credential — no `Authorization`
header at all, which is the form a scanner registers:

```bash
ADMIN="cookie: authCookiePart0=$TOKEN; languageCookie=en-US"
USER="cookie: authCookiePart0=$USER_TOKEN; languageCookie=en-US"

curl -s -o /dev/null -w '%{http_code}\n' -H "$ADMIN" http://localhost:8443/vlab/api/v4/target-manager/labs   # 200
curl -s -o /dev/null -w '%{http_code}\n' -H "$USER"  http://localhost:8443/vlab/api/v4/target-manager/labs   # 403
```

## Deploy on Render

1. Push this directory to a Git repo (GitHub/GitLab).
2. In Render: **New → Web Service**, point it at the repo. [render.yaml](render.yaml)
   is picked up automatically — otherwise set Runtime `Node`, Build `npm install`,
   Start `npm start`.
3. Render injects `PORT`; the server binds to it. No other environment variables
   are needed.

Your base URL becomes `https://<service>.onrender.com`, and it serves both apps. To
point a client that was written against either spec at the deployment, change only
`servers[0].url` — in [onpremtest.yaml](onpremtest.yaml) for the on-prem app, or in
[second app/second_app_oas.yaml](second%20app/second_app_oas.yaml) for the second one.
The paths below it are unchanged in both. Keep the two files separate: they describe
two different surfaces and merging them would defeat the isolation the split exists
for.

Note: the free plan sleeps after inactivity, so the first request after an idle
period takes a few seconds.
