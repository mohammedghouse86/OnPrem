'use strict';

/**
 * Static fixtures. The source spec never captured any response bodies, so these
 * are plausible payloads shaped after the endpoint summaries. They are frozen
 * constants: identical on every request, on every instance.
 */

const ORG_ID = '6a68df8e793f44109c3f2f6c';
const APP_ID = '6a832657fe79c4b93a3804f1';
const RUN_ID = '6a88865d442ba0277bb14fdc';

const datanets = {
  datanets: [
    { id: 'dn-0001', name: 'physnet0', network_type: 'vlan', mtu: 1500, vlan_range: '100-199', status: 'active', ports: 12 },
    { id: 'dn-0002', name: 'physnet1', network_type: 'vxlan', mtu: 9000, vlan_range: '200-399', status: 'active', ports: 8 },
    { id: 'dn-0003', name: 'oam', network_type: 'flat', mtu: 1500, vlan_range: null, status: 'degraded', ports: 2 },
  ],
  total: 3,
};

const hostTopology = {
  cluster: 'moonsun-onprem',
  hosts: [
    {
      hostname: 'controller-0',
      personality: 'controller',
      availability: 'available',
      administrative: 'unlocked',
      operational: 'enabled',
      cpus: 32,
      memory_mb: 131072,
      interfaces: [
        { name: 'eno1', class: 'platform', datanet: 'oam', mtu: 1500 },
        { name: 'eno2', class: 'data', datanet: 'physnet0', mtu: 1500 },
      ],
    },
    {
      hostname: 'controller-1',
      personality: 'controller',
      availability: 'available',
      administrative: 'unlocked',
      operational: 'enabled',
      cpus: 32,
      memory_mb: 131072,
      interfaces: [
        { name: 'eno1', class: 'platform', datanet: 'oam', mtu: 1500 },
        { name: 'eno2', class: 'data', datanet: 'physnet0', mtu: 1500 },
      ],
    },
    {
      hostname: 'worker-0',
      personality: 'worker',
      availability: 'degraded',
      administrative: 'unlocked',
      operational: 'enabled',
      cpus: 64,
      memory_mb: 262144,
      interfaces: [
        { name: 'ens785f0', class: 'data', datanet: 'physnet1', mtu: 9000 },
      ],
    },
  ],
  links: [
    { source: 'controller-0', target: 'worker-0', datanet: 'physnet0' },
    { source: 'controller-1', target: 'worker-0', datanet: 'physnet0' },
  ],
};

const softwareManagement = {
  current_release: { version: '22.12', patch_level: 4, status: 'deployed', applied_at: '2026-05-14T09:12:44Z' },
  available_releases: [
    { version: '23.09', size_bytes: 4831838208, state: 'available', signature: 'verified' },
    { version: '22.12.5', size_bytes: 218103808, state: 'downloading', signature: 'verified' },
  ],
  deploy_in_progress: false,
};

const releaseUpload = {
  upload_endpoint: '/admin/software_management/releaseupload',
  accepted_types: ['.iso', '.patch', '.sig'],
  max_upload_bytes: 8589934592,
  free_space_bytes: 42949672960,
  recent_uploads: [
    { filename: 'moonsun-23.09.iso', uploaded_at: '2026-08-11T17:03:21Z', state: 'verified', uploaded_by: 'admin' },
  ],
};

const storageOverview = {
  backends: [
    { name: 'ceph-store', type: 'ceph', state: 'configured', replication: 2, capacity_gib: 8192, used_gib: 3117 },
    { name: 'lvm-local', type: 'lvm', state: 'configured', replication: 1, capacity_gib: 1024, used_gib: 402 },
  ],
  osds: [
    { id: 'osd.0', host: 'controller-0', state: 'up', usage_percent: 38 },
    { id: 'osd.1', host: 'controller-1', state: 'up', usage_percent: 41 },
    { id: 'osd.2', host: 'worker-0', state: 'down', usage_percent: 0 },
  ],
  cluster_health: 'HEALTH_WARN',
};

const systemConfig = {
  system: { name: 'moonsun-onprem', mode: 'duplex', software_version: '22.12', region: 'RegionOne', timezone: 'UTC' },
  dns: { nameservers: ['8.8.8.8', '1.1.1.1'] },
  ntp: { servers: ['0.pool.ntp.org', '1.pool.ntp.org'], enabled: true },
  oam: { floating_ip: '172.99.99.88', subnet: '172.99.99.0/24', gateway: '172.99.99.1' },
  certificates: [
    { name: 'ssl', expiry: '2027-01-30T00:00:00Z', issuer: 'internal-ca' },
  ],
};

const alarmList = {
  alarms: [
    { uuid: 'a1f0c2d4-1111-4a1b-9c3d-0000000000a1', alarm_id: '800.001', severity: 'major', entity_instance_id: 'cluster=ceph-store', reason_text: 'Storage Alarm Condition: HEALTH_WARN', timestamp: '2026-08-26T22:14:02Z', suppression: false },
    { uuid: 'a1f0c2d4-2222-4a1b-9c3d-0000000000a2', alarm_id: '200.006', severity: 'minor', entity_instance_id: 'host=worker-0', reason_text: 'worker-0 is degraded', timestamp: '2026-08-27T04:41:19Z', suppression: false },
  ],
  total: 2,
};

const eventLogList = {
  events: [
    { uuid: 'e0000000-1111-4000-8000-00000000e001', event_log_id: '100.104', state: 'set', severity: 'critical', entity_instance_id: 'host=worker-0.filesystem=/var/log', reason_text: 'Filesystem threshold exceeded', timestamp: '2026-08-27T03:02:55Z' },
    { uuid: 'e0000000-2222-4000-8000-00000000e002', event_log_id: '401.001', state: 'log', severity: 'warning', entity_instance_id: 'service=keystone', reason_text: 'Service restart detected', timestamp: '2026-08-27T05:20:10Z' },
    { uuid: 'e0000000-3333-4000-8000-00000000e003', event_log_id: '275.001', state: 'clear', severity: 'informational', entity_instance_id: 'host=controller-1', reason_text: 'Host unlocked', timestamp: '2026-08-27T06:00:00Z' },
  ],
  total: 3,
};

const eventsSuppressionList = {
  suppressions: [
    { uuid: 'b0000000-1111-4000-8000-00000000c001', alarm_id: '900.001', description: 'Patch in progress', suppression_status: 'suppressed' },
    { uuid: 'b0000000-2222-4000-8000-00000000c002', alarm_id: '750.002', description: 'Application apply in progress', suppression_status: 'unsuppressed' },
  ],
  total: 2,
};

const keystoneRoles = {
  roles: [
    { id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60001', name: 'admin', domain_id: null },
    { id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60002', name: 'member', domain_id: null },
    { id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60003', name: 'reader', domain_id: null },
    { id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60004', name: 'operator', domain_id: null },
  ],
  total: 4,
};

const settings = {
  org_id: ORG_ID,
  app_id: APP_ID,
  example_run_id: RUN_ID,
  ui: { theme: 'default', language: 'en', items_per_page: 20, session_timeout_minutes: 30 },
  features: { software_management: true, storage_overview: true, fault_management: true, identity: true },
  version: '1.0.0',
};

const identity = {
  users: [
    { id: 'u0000000000000000000000000000001', name: 'admin', email: 'admin@example.com', enabled: true, domain_id: 'default', project: 'admin', role_id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60001' },
    { id: 'u0000000000000000000000000000002', name: 'user', email: 'user@example.com', enabled: true, domain_id: 'default', project: 'services', role_id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60003' },
    { id: 'u0000000000000000000000000000003', name: 'orchid', email: 'abc1787332238925@example.com', enabled: true, domain_id: 'Cargo', project: '', role_id: '' },
  ],
  total: 3,
};

/**
 * Tenant-owned objects behind the id-bearing paths. Ids are synthetic
 * placeholders; the real ones from the capture are kept out of this repo.
 */
const projects = {
  projects: [
    { id: '0000aaaa0000bbbb0000cccc00000001', name: 'Tenant-A', tenant: 'tenant-a', domain_id: 'default', enabled: true, members: 2 },
    { id: '0000aaaa0000bbbb0000cccc00000002', name: 'Tenant-B', tenant: 'tenant-b', domain_id: 'default', enabled: true, members: 1 },
  ],
  total: 2,
};

const identityUsers = {
  users: [
    { id: '0000dddd0000eeee0000ffff00000001', name: 'admin', tenant: 'tenant-a', email: 'admin@example.com', enabled: true, role_id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60001' },
    { id: '0000dddd0000eeee0000ffff00000002', name: 'user', tenant: 'tenant-a', email: 'user@example.com', enabled: true, role_id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60003' },
    { id: '0000dddd0000eeee0000ffff00000003', name: 'readonly', tenant: 'tenant-b', email: 'readonly@example.com', enabled: true, role_id: 'e3f2a1b0c9d84e7fa1b2c3d4e5f60003' },
  ],
  total: 3,
};

const applicationCredentials = {
  application_credentials: [
    { id: 'ac00000000000000000000000000001', name: 'ci-runner', tenant: 'tenant-a', expires_at: null, unrestricted: false },
    { id: 'ac00000000000000000000000000002', name: 'reporting', tenant: 'tenant-b', expires_at: null, unrestricted: false },
  ],
  total: 2,
};

const identityCreateForm = {
  form: 'identity/create',
  csrfmiddlewaretoken: 'static-csrf-token-value',
  action: '/identity/users/create',
  method: 'POST',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'text', required: false },
    { name: 'email', type: 'email', required: true },
    { name: 'password', type: 'password', required: true },
    { name: 'confirm_password', type: 'password', required: true },
    { name: 'domain_id', type: 'text', required: false },
    { name: 'domain_name', type: 'text', required: false },
    { name: 'project', type: 'select', required: false },
    { name: 'role_id', type: 'select', required: false, options: keystoneRoles.roles.map((r) => ({ value: r.id, label: r.name })) },
    { name: 'enabled', type: 'checkbox', required: false, default: 'true' },
  ],
};

const identityGroups = {
  groups: [
    { id: 'g00000000000000000000000000001', name: 'East', description: 'Eastern region operators', domain_id: 'default', members: 4 },
    { id: 'g00000000000000000000000000002', name: 'West', description: 'Example group description', domain_id: 'default', members: 2 },
  ],
  total: 2,
};

const viewCredentials = {
  project: 'admin',
  user: 'admin',
  auth_url: 'https://172.99.99.88:5000/v3',
  region: 'RegionOne',
  interface: 'public',
  identity_api_version: 3,
  ec2_credentials: [
    { access: 'a1b2c3d4e5f60718293a4b5c6d7e8f90', secret: '<redacted>', trust_id: null },
  ],
  openrc_download: '/project/api_access/openrc/',
};

function headerHtml(username, role) {
  return [
    '<div id="site-header" class="navbar">',
    '  <a class="brand" href="/">MoonSun On-Prem</a>',
    '  <ul class="nav">',
    '    <li><a href="/project/api_access/view_credentials">Project</a></li>',
    '    <li><a href="/admin/system_config">Admin</a></li>',
    '    <li><a href="/identity">Identity</a></li>',
    '  </ul>',
    '  <div class="user-menu">',
    '    <span class="username">' + username + '</span>',
    '    <span class="role">' + role + '</span>',
    '    <a href="/auth/logout/">Sign Out</a>',
    '  </div>',
    '</div>',
  ].join('\n');
}

module.exports = {
  ORG_ID,
  APP_ID,
  RUN_ID,
  datanets,
  hostTopology,
  softwareManagement,
  releaseUpload,
  storageOverview,
  systemConfig,
  alarmList,
  eventLogList,
  eventsSuppressionList,
  keystoneRoles,
  settings,
  identity,
  identityCreateForm,
  identityGroups,
  projects,
  identityUsers,
  applicationCredentials,
  viewCredentials,
  headerHtml,
};
