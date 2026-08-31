'use strict';

/**
 * Writes ACCOUNTS.txt — the credentials and the three required headers for each
 * seeded account. The output file holds working credentials, so it is
 * gitignored; regenerate it with `npm run accounts` instead of committing it.
 */

const fs = require('fs');
const path = require('path');

const auth = require('../auth');
const data = require('../data');

const OUT = path.join(__dirname, '..', 'ACCOUNTS.txt');
const RULE = '-'.repeat(80);
const L = [];
const p = (s = '') => L.push(s);

p('='.repeat(80));
p('  OnPrem / StarlingX mock API — accounts and required headers');
p('='.repeat(80));
p();
p('  CONFIDENTIAL — NOT COMMITTED. This file is listed in .gitignore.');
p('  Generated from auth.js. Regenerate with:  npm run accounts');
p();
p('  NO EXPIRY. These tokens are constants: never rotated, never regenerated,');
p('  no TTL, no idle timeout, no refresh. Hard-code them.');
p();
p('  Every request to every endpoint must carry ALL THREE headers below.');
p();
p('    missing Cookie            -> 401 unauthorized');
p('    missing X-CSRFToken       -> 403 csrf_failure');
p('    missing X-Requested-With  -> 403 missing_required_header');
p();
p('  Extra headers beyond these three are ignored and do NOT fail the request:');
p('  Content-Type, Accept, Referer, Origin, Authorization, User-Agent, any');
p('  X-* of your own, and extra cookies in the Cookie header are all fine.');
p('  The one exception is a CONFLICTING X-CSRFToken (two different values in');
p('  one header), which is rejected with 403. An identical duplicate passes.');
p();
p('  Exception: GET /auth/login/ requires only X-Requested-With — it is what');
p('  issues the CSRF cookie the other two headers depend on.');
p();

const T = auth.TENANTS;

// One block per account, keyed on the opaque token; the readable token for the
// same account is listed underneath as an equivalent alternative.
const primaries = Object.entries(auth.PRIMARY_SESSION).map(([user, token]) => [token, auth.SESSIONS[token]]);

for (const [token, s] of primaries) {
  const cred = auth.CREDENTIALS[s.username];
  const legacy = Object.entries(auth.SESSIONS).find(
    ([t, v]) => v.username === s.username && t !== token
  );
  const cookie =
    `login_region=${s.region || 'default'}; login_domain="${s.domain}"; ` +
    `platformcsrftoken=${s.csrf}; platformsessionid=${token}`;

  p(RULE);
  p(`  ${s.username.toUpperCase()}   role=${s.role}   tenant=${T[s.tenant].name} (${T[s.tenant].id})`);
  p(RULE);
  p(`  login:  username=${s.username}   password=${cred ? cred.password : '(static session only)'}`);
  p();
  p('  [1] Cookie');
  p(`      Cookie: ${cookie}`);
  p();
  p('  [2] X-CSRFToken  (must equal the platformcsrftoken cookie above)');
  p(`      X-CSRFToken: ${s.csrf}`);
  p();
  p('  [3] X-Requested-With  (literal string, identical for every account)');
  p('      X-Requested-With: XMLHttpRequest');
  p();
  if (legacy) {
    p('  Also accepted for this same account (identical behaviour):');
    p(`      Cookie: login_region=default; login_domain=""; platformcsrftoken=${legacy[1].csrf}; platformsessionid=${legacy[0]}`);
    p(`      X-CSRFToken: ${legacy[1].csrf}`);
    p();
  }
  p('  curl:');
  p(`    curl -H 'Cookie: ${cookie}' \\`);
  p(`         -H 'X-CSRFToken: ${s.csrf}' \\`);
  p("         -H 'X-Requested-With: XMLHttpRequest' \\");
  p('         http://localhost:8443/api/fm/alarm_list/');
  p();
  p('  fetch:');
  p('    await fetch(`${BASE}/api/fm/alarm_list/`, {');
  p('      headers: {');
  p(`        'Cookie': '${cookie}',`);
  p(`        'X-CSRFToken': '${s.csrf}',`);
  p("        'X-Requested-With': 'XMLHttpRequest'");
  p('      },');
  p("      credentials: 'include'");
  p('    });');
  p();
}

p(RULE);
p('  ACCESS CONTROL MATRIX');
p(RULE);
p();
p('                                                 admin   user   readonly');
const rows = [
  ['GET  /admin/system_config/', '200', '403', '403', 'admin-only path'],
  ['GET  /admin/datanets/', '200', '403', '403', 'admin-only path'],
  ['GET  /admin/storage_overview/', '200', '403', '403', 'admin-only path'],
  ['POST /identity/groups/create/', '200', '200', '403', 'read-only role'],
  ['POST /identity/users/create/', '200', '200', '403', 'read-only role'],
  ['GET  /identity/{A project}/update/', '200', '200', '403', 'cross-tenant'],
  ['GET  /identity/{B project}/update/', '403', '403', '200', 'cross-tenant'],
  ['GET  /identity/users/{A user}/detail/', '200', '200', '403', 'cross-tenant'],
  ['GET  /identity/users/{B user}/detail/', '403', '403', '200', 'cross-tenant'],
  ['GET  /api/fm/alarm_list/', '200', '200', '200', 'shared read'],
  ['GET  (unknown object id)', '404', '404', '404', ''],
];
for (const [label, a, u, r, note] of rows) {
  p(`  ${label.padEnd(44)} ${a}     ${u}    ${r}${note ? '     ' + note : ''}`);
}
p();
p('  PerfAI auth slots:  ownerAuth = admin   nonOwnerAuth = user   lowPrivAuth = readonly');
p();
p('  Object ids (synthetic — the real ids from the capture are not in this repo):');
for (const t of Object.values(T)) {
  p(`    ${t.name} project : ${t.id}`);
}
for (const u of data.identityUsers.users) {
  p(`    user ${u.name.padEnd(9)}: ${u.id}  (${T[u.tenant].name})`);
}
p();

fs.writeFileSync(OUT, L.join('\n') + '\n', 'utf8');
console.log('wrote ' + OUT);
