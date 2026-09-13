'use strict';

/**
 * Writes `second app/ACCOUNTS.txt` — the three required headers for each seeded
 * Studio account, and nothing else.
 *
 * Kept separate from `accounts.js` on purpose: the two apps have separate
 * accounts and separate credentials, so they get separate files. The output
 * holds working tokens, so it is gitignored; regenerate it with
 * `npm run accounts:second-app`.
 */

const fs = require('fs');
const path = require('path');

const auth = require('../second app/auth');

const OUT = path.join(__dirname, '..', 'second app', 'ACCOUNTS.txt');

const LABEL = {
  testadmin01: 'Studio-Org-A Admin',
  testuser01: 'Studio-Org-A User',
  testviewer01: 'Studio-Org-B Viewer',
};

const blocks = Object.entries(auth.TOKENS).map(([username, token]) =>
  [
    LABEL[username],
    'accept: application/json, text/plain, */*',
    `authorization: Bearer ${token}`,
    `cookie: ${auth.cookieHeaderFor(token)}`,
  ].join('\n')
);

fs.writeFileSync(OUT, blocks.join('\n\n\n') + '\n', 'utf8');
console.log('wrote ' + OUT);
