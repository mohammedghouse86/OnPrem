'use strict';

/**
 * Writes ACCOUNTS.txt — the three required headers for each seeded account,
 * and nothing else. The output holds working session tokens, so it is
 * gitignored; regenerate it with `npm run accounts`.
 */

const fs = require('fs');
const path = require('path');

const auth = require('../auth');

const OUT = path.join(__dirname, '..', 'ACCOUNTS.txt');
const blocks = [];

for (const token of Object.values(auth.PRIMARY_SESSION)) {
  const s = auth.SESSIONS[token];
  const label = `${auth.TENANTS[s.tenant].name} ${s.role === 'admin' ? 'Admin' : 'User'}`;
  const cookie =
    `login_region=${s.region || 'default'}; login_domain="${s.domain}"; ` +
    `platformcsrftoken=${s.csrf}; platformsessionid=${token}`;

  blocks.push(
    [
      label,
      `Cookie: ${cookie}`,
      `X-CSRFToken: ${s.csrf}`,
      'X-Requested-With: XMLHttpRequest',
    ].join('\n')
  );
}

fs.writeFileSync(OUT, blocks.join('\n\n\n') + '\n', 'utf8');
console.log('wrote ' + OUT);
