'use strict';

/**
 * Fixture data for the Wind River Studio mock — the second app.
 *
 * Every payload here is shaped exactly like the one the real `dast` gateway
 * returned in the HAR captures that `second_app_oas.yaml` was derived from:
 * the same envelopes (`{success, data, message}` for `/um` and `/portal`,
 * `{status, data, rbacRole}` for TAF v3, a bare `{data}` for TAF v4), the same
 * fields and the same types — including the quirks the spec calls out, such as
 * epoch-millisecond timestamps returned as strings.
 *
 * Two orgs are modelled so an authorization scan has a cross-tenant boundary to
 * probe. Org-A holds the objects from the capture; Org-B is a synthetic mirror
 * owned by a different account. Objects carry an `org` marker that the handlers
 * strip before serialising — it is bookkeeping, not part of the wire format.
 */

/* ------------------------------------------------------------------ *
 * Organisations
 * ------------------------------------------------------------------ */

const ORGS = {
  'org-a': { id: 'cc2bcd01-059e-4eba-95ef-0c57cd98d3f9', name: 'Studio-Org-A' },
  'org-b': { id: '7a5f2c94-1d38-4e60-b9a7-6c2e0f35d481', name: 'Studio-Org-B' },
};

/* ------------------------------------------------------------------ *
 * Identity
 * ------------------------------------------------------------------ */

/** The full RBAC group directory — the 37 groups the capture returned. */
const GROUPS = [
  {
    id: 'c5e13656-25c4-472b-b30a-2ff9f50d1b8f',
    name: 'artifacts-admin-group',
    description: null
  },
  {
    id: '86e12340-4afc-4a89-8044-a489c8613793',
    name: 'device-registry-admin-group',
    description: null
  },
  {
    id: '72c05a7a-606d-46b4-9776-ff503c3219c3',
    name: 'dfl-admin-group',
    description: null
  },
  {
    id: '8a3d5e6a-e783-4a14-973d-9410713b4a09',
    name: 'dfl-editor-group',
    description: null
  },
  {
    id: 'eb49d895-f5d7-4f89-9f2e-261f748f245d',
    name: 'dfl-lead-group',
    description: null
  },
  {
    id: 'f6873ad9-9284-415d-818f-599ecac72ede',
    name: 'dfl-tester-group',
    description: null
  },
  {
    id: '387cff26-6979-4c5e-a081-a7fe8792c06b',
    name: 'dfl-viewer-group',
    description: null
  },
  {
    id: '339575de-f249-4987-8160-18b5a820900b',
    name: 'dlm-admin-group',
    description: null
  },
  {
    id: '29e453f3-ace0-4e34-a000-974946afb494',
    name: 'gitlab-admin-group',
    description: null
  },
  {
    id: '9024dd81-8911-48c6-bdcf-3fc68bf0ea6d',
    name: 'grafana-admin-group',
    description: null
  },
  {
    id: '2497e804-7194-48ea-a4b7-3a61b2f5b877',
    name: 'grafana-editor-group',
    description: null
  },
  {
    id: 'd43aaf50-922b-4a65-aa6c-c2e5e08bcdeb',
    name: 'grafana-viewer-group',
    description: null
  },
  {
    id: '5096263a-3edf-4d93-9cad-b36ab2c09414',
    name: 'hive-admin-group',
    description: null
  },
  {
    id: 'd924f68e-b5ae-48a6-8f01-5b5b3c8ae843',
    name: 'impersonation-admin-group',
    description: ''
  },
  {
    id: 'e9ec4202-0191-4506-9399-eeb6a20b6d40',
    name: 'jenkins-admin-group',
    description: null
  },
  {
    id: '2d81226a-832a-41cb-a1e1-e18859707db3',
    name: 'license-admin-group',
    description: null
  },
  {
    id: '1d457329-86fa-436e-b758-49d7ea6bb69b',
    name: 'lxbs-admin-group',
    description: ''
  },
  {
    id: '9f48320c-4949-4289-b4b3-98a0ecce4de6',
    name: 'mcp-admin-group',
    description: null
  },
  {
    id: '97c2da60-c4b5-4354-ac4d-8a3011b373f2',
    name: 'ntf-admin-group',
    description: null
  },
  {
    id: 'bd5ac82a-12cc-490d-b2da-b643461e481b',
    name: 'ota-admin-group',
    description: null
  },
  {
    id: '91496d44-b02e-4d04-9695-daee833443fe',
    name: 'platformhealth-admin-group',
    description: null
  },
  {
    id: 'c98a6276-85f2-4be3-9fa4-ff329c39efa5',
    name: 'plm-admin-group',
    description: null
  },
  {
    id: 'f59246e1-4aaa-4417-9f3d-17048c5e5583',
    name: 'plm-task-creators-group',
    description: null
  },
  {
    id: '140669b7-4580-4a29-b729-32712c3e2769',
    name: 'plm-task-library-viewer-group',
    description: null
  },
  {
    id: '5a3c0005-1f52-492e-9308-483a05cc7114',
    name: 'schedule-admin-group',
    description: null
  },
  {
    id: 'd0e95e5e-315f-4bde-b70c-b3da315b56f6',
    name: 'slc-admin-group',
    description: null
  },
  {
    id: '2b6cfc06-9d05-4fa5-b26a-17c421b620f9',
    name: 'system-registry-admin-group',
    description: null
  },
  {
    id: '10c3c4af-5697-4227-83c4-beeca2c235e5',
    name: 'taf-admin-group',
    description: null
  },
  {
    id: '981d8b73-5df8-4367-9fbe-149db2001db5',
    name: 'tozny-admin-group',
    description: null
  },
  {
    id: '753b3983-fec9-4bb0-b29f-c4d5f72933ef',
    name: 'usp-admin-group',
    description: null
  },
  {
    id: 'eda2b9cf-c21c-4791-b93b-563325f8dd14',
    name: 'vault-admin-group',
    description: null
  },
  {
    id: 'ae2fbd0b-d205-4b1a-a96b-71072f3a18be',
    name: 'vault-reader-group',
    description: null
  },
  {
    id: '9fed1194-53dc-4059-90fb-034253acec10',
    name: 'vlab-starter-group',
    description: null
  },
  {
    id: 'f7c4a829-6b44-4e97-97b5-e4476e95d118',
    name: 'vt-admin-group',
    description: null
  },
  {
    id: 'd81dac4b-39cb-4d7a-9cda-a5e305ef4a8d',
    name: 'vxbs-admin-group',
    description: ''
  },
  {
    id: '86b2afac-07bc-4717-b9d4-9d14d34a5a04',
    name: 'vxworks-jenkins-admin-group',
    description: ''
  },
  {
    id: 'af531fe1-1bfc-458a-bc41-5927eeaba420',
    name: 'workspace-admin-group',
    description: null
  }
];

const groupRef = (name) => {
  const g = GROUPS.find((row) => row.name === name);
  return { id: g.id, name: g.name };
};

/** Keycloak roles per account. The 13 for testadmin01 are the captured set. */
const ROLES = {
  testadmin01: [
    {
      roleId: 'ce7fb3c0-712b-4e85-881c-47175b39f481',
      name: 'default-roles-wrai'
    },
    {
      roleId: '1196af89-c252-480d-aa8d-012c9081e3c5',
      name: 'platformhealthAdmin'
    },
    {
      roleId: '3730b12e-375d-4016-b6c1-f61caebe678a',
      name: 'tafAdmin'
    },
    {
      roleId: '05faa317-9325-450c-a316-8d1b66357bcc',
      name: 'slcAdmin'
    },
    {
      roleId: 'f02a09bb-7cd8-4563-aa3c-46b9ac05af62',
      name: 'licenseAdmin'
    },
    {
      roleId: '84d3cbf6-cb83-4443-b45e-8d63a83441f8',
      name: 'manage-account'
    },
    {
      roleId: '1a417bd8-2ce8-43c7-860e-743413e63087',
      name: 'manage-account-links'
    },
    {
      roleId: 'f292fa55-8e5a-4761-a1d7-a3bc36cf578b',
      name: 'view-profile'
    },
    {
      roleId: '0efe215c-0e98-4f81-95fe-5d5ba9605530',
      name: 'offline_access'
    },
    {
      roleId: 'e6296580-3004-41ff-bb71-d2de88f18d81',
      name: 'uma_authorization'
    },
    {
      roleId: '1baa4b04-4e93-4963-804d-81f751850fb1',
      name: 'uspAdmin'
    },
    {
      roleId: '650af119-82e8-4e92-aae2-f6205fe4e16d',
      name: 'hiveAdmin'
    },
    {
      roleId: '7fab58ec-4b51-4e06-8c8d-966f1fb2edc4',
      name: 'vaultAdmin'
    }
  ],
  testuser01: [
    { roleId: 'ce7fb3c0-712b-4e85-881c-47175b39f481', name: 'default-roles-wrai' },
    { roleId: '8c41d9b7-5a02-4e63-91fd-7b25c0a4e386', name: 'tafEditor' },
    { roleId: 'f292fa55-8e5a-4761-a1d7-a3bc36cf578b', name: 'view-profile' },
    { roleId: '0efe215c-0e98-4f81-95fe-5d5ba9605530', name: 'offline_access' },
  ],
  testviewer01: [
    { roleId: 'ce7fb3c0-712b-4e85-881c-47175b39f481', name: 'default-roles-wrai' },
    { roleId: '2b7e5c30-9d18-4a47-bc06-e35f9812da74', name: 'tafViewer' },
    { roleId: 'f292fa55-8e5a-4761-a1d7-a3bc36cf578b', name: 'view-profile' },
  ],
};

/** Group membership per account, in the `{id, name}` form the API returns. */
const MEMBERSHIP = {
  testadmin01: [
    'hive-admin-group',
    'license-admin-group',
    'platformhealth-admin-group',
    'plm-task-library-viewer-group',
    'slc-admin-group',
    'taf-admin-group',
    'usp-admin-group',
    'vault-admin-group',
    'vlab-starter-group',
  ].map(groupRef),
  testuser01: ['dfl-editor-group', 'plm-task-creators-group', 'vlab-starter-group'].map(groupRef),
  testviewer01: ['dfl-viewer-group', 'grafana-viewer-group'].map(groupRef),
};

/** `GET /um/api/auth/users/me/profile`. */
const PROFILES = {
  testadmin01: {
    userId: '02da2ad8-644a-480f-b6d2-ac5a8691d3a9',
    username: 'testadmin01',
    email: 'testadmin01@windriver.com',
    phoneNumber: '',
    mobilePhoneNumber: null,
    firstName: 'test',
    lastName: 'admin01',
    nickname: '',
    lastLogin: '2026-09-08T16:13:15.535Z',
    lastFailedLogin: null,
    position: null,
    department: null,
    location: null,
    tenantId: ORGS['org-a'].id,
    toznyId: '83a80e68-0cc3-47bc-82ca-b1786d3625cb',
    licenseActionDate: '2026-09-01T07:18:16.394Z',
    licenseId: '80fd3a5a-98fe-49cf-b28e-0c7a2c36a5fd',
    licenseLastAssignDate: '2026-09-01T07:18:16.394Z',
    groups: MEMBERSHIP.testadmin01.map((g) => g.name),
  },
  testuser01: {
    userId: 'b31f0c47-2e5d-4a19-9c68-5f0d7a2b4e13',
    username: 'testuser01',
    email: 'testuser01@windriver.com',
    phoneNumber: '',
    mobilePhoneNumber: null,
    firstName: 'test',
    lastName: 'user01',
    nickname: '',
    lastLogin: '2026-09-11T09:42:08.117Z',
    lastFailedLogin: null,
    position: null,
    department: null,
    location: null,
    tenantId: ORGS['org-a'].id,
    toznyId: '5d9c1a74-6b38-4f02-ae51-c7304b8d2f69',
    licenseActionDate: '2026-09-02T11:05:44.210Z',
    licenseId: 'c18a7e05-4d36-4b9f-80e2-1af65d379b48',
    licenseLastAssignDate: '2026-09-02T11:05:44.210Z',
    groups: MEMBERSHIP.testuser01.map((g) => g.name),
  },
  testviewer01: {
    userId: '6e4a9d12-8c37-4b56-a0f9-2d15e7c83b40',
    username: 'testviewer01',
    email: 'testviewer01@windriver.com',
    phoneNumber: '',
    mobilePhoneNumber: null,
    firstName: 'test',
    lastName: 'viewer01',
    nickname: '',
    lastLogin: '2026-09-11T14:20:51.903Z',
    lastFailedLogin: null,
    position: null,
    department: null,
    location: null,
    tenantId: ORGS['org-b'].id,
    toznyId: 'a06f38b2-71cd-4e95-8b47-2f9e5c0416ad',
    licenseActionDate: '2026-09-03T08:37:29.556Z',
    licenseId: '9f2d6c83-15ba-4e70-a3c9-6b84d017e2f5',
    licenseLastAssignDate: '2026-09-03T08:37:29.556Z',
    groups: MEMBERSHIP.testviewer01.map((g) => g.name),
  },
};

/**
 * Effective settings per account. Every value is a string, including the
 * numeric ones — that is how the platform returns them.
 */
const SETTINGS = {
  testadmin01: {
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24',
    openingApps: '1',
    timeZone: 'GMT+0000',
    theme: 'dark',
    appCentralOpen: '1',
    appCentralLayout: '1',
    language: 'en-US',
  },
  testuser01: {
    dateFormat: 'mm/dd/yyyy',
    timeFormat: '12',
    openingApps: '1',
    timeZone: 'GMT+0000',
    theme: 'light',
    appCentralOpen: '1',
    appCentralLayout: '2',
    language: 'en-US',
  },
  testviewer01: {
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24',
    openingApps: '0',
    timeZone: 'GMT+0000',
    theme: 'light',
    appCentralOpen: '0',
    appCentralLayout: '1',
    language: 'en-US',
  },
};

/**
 * The settings catalogue that `PUT /um/api/auth/users/me/change/setting`
 * writes against: settingId -> the field it maps to. The endpoint listing the
 * catalogue was never exercised in the capture, so the first four ids are the
 * ones the SPA was observed sending and the rest cover the remaining fields.
 */
const SETTING_IDS = {
  '47a219a4-a691-4dab-9af1-6895cfd9545b': 'timeZone',
  'f2d39242-ca24-4c4a-a697-ffc40dc365b8': 'timeFormat',
  '1eaf9d0b-9fe1-4bc8-84fe-18f767a812ff': 'dateFormat',
  '3f507d4d-ff8f-4926-986c-0d0cfc973654': 'language',
  '6b0c9f41-8d27-4a53-bf19-05e7c2a63d80': 'theme',
  'a92e4d17-3c68-4f05-9b7a-e14d80c6f325': 'openingApps',
  'd7f31b06-59ae-4c82-a640-8f2b17e95c3d': 'appCentralOpen',
  '0e85a7c2-4b13-49df-96e8-3a7c5d20b184': 'appCentralLayout',
};

/** Applications the session bundle says the caller may launch. */
const ENTITLEMENTS = [
  {
    id: '07dbfc5c-0882-4970-9cd9-0d56a49237eb',
    name: 'GitLab',
    url: 'https://gitlab.dast.wrstudio.cloud',
    isThirdParty: true,
    shortName: 'GitLab',
    isFeature: false
  },
  {
    id: '0cfde257-39ee-47d2-a80b-5e7838a88376',
    name: 'Artifact Repository',
    url: 'https://artifacts.dast.wrstudio.cloud/minio/login',
    isThirdParty: true,
    shortName: 'Artifacts',
    isFeature: false
  },
  {
    id: '57dfe3d6-c12e-467b-9d85-34f5d8217f25',
    name: 'VxWorks Build System',
    url: 'https://vxbs.dast.wrstudio.cloud',
    isThirdParty: false,
    shortName: 'VXBS',
    isFeature: false
  },
  {
    id: '5a29b3ab-74ee-47df-a379-1ca6d7e20724',
    name: 'Workspace',
    url: 'https://dast.wrstudio.cloud/ws',
    isThirdParty: false,
    shortName: 'ws',
    isFeature: false
  },
  {
    id: '5f442c5a-713c-454e-9c93-fff6b75b0be5',
    name: 'Identity Management',
    url: 'https://tozny.id.dast.wrstudio.cloud/wrai/login',
    isThirdParty: true,
    shortName: 'Tozny Id',
    isFeature: false
  },
  {
    id: '687ceab0-2c7d-45a7-a529-b38f97fb7e03',
    name: 'Linux Build System',
    url: 'https://lxbs.dast.wrstudio.cloud',
    isThirdParty: false,
    shortName: 'LXBS',
    isFeature: false
  },
  {
    id: '6cc934ba-1b15-433d-a81e-e8b43b50373f',
    name: 'HivePhysicalTargets',
    url: '',
    isThirdParty: false,
    shortName: 'HivePhysicalTargets',
    isFeature: true
  },
  {
    id: '703da1d3-3de6-4bef-bbe4-d81d60035955',
    name: 'System Registry',
    url: 'https://system.registry.dast.wrstudio.cloud',
    isThirdParty: true,
    shortName: 'System Registry',
    isFeature: false
  },
  {
    id: '71c94a3d-cd7e-452c-8134-15056d66e4dc',
    name: 'Test Automation Framework',
    url: 'https://dast.wrstudio.cloud/taf',
    isThirdParty: false,
    shortName: 'TAF',
    isFeature: false
  },
  {
    id: '7977a1fd-60ac-450d-946a-5c356293f7b7',
    name: 'Digital Feedback Loop',
    url: 'https://dfl.dast.wrstudio.cloud',
    isThirdParty: false,
    shortName: 'DFL',
    isFeature: false
  },
  {
    id: '9dacdbeb-b685-4982-aa92-21e4a15e5d54',
    name: 'Main Control Program',
    url: 'https://dast.wrstudio.cloud/mcp',
    isThirdParty: false,
    shortName: 'MCP',
    isFeature: false
  },
  {
    id: 'a951b6f7-ec55-4a77-93c9-960baa9746c4',
    name: 'HiveSIMICS',
    url: '',
    isThirdParty: false,
    shortName: 'HiveSIMICS',
    isFeature: true
  },
  {
    id: 'b9000927-2c4d-4739-9516-2db44c94ae51',
    name: 'Jenkins',
    url: 'https://jenkins.dast.wrstudio.cloud',
    isThirdParty: true,
    shortName: 'Jenkins',
    isFeature: false
  },
  {
    id: 'bf75c7ca-77b5-4082-a6e7-964178d5644a',
    name: 'Pipeline Manager',
    url: 'https://dast.wrstudio.cloud/plm',
    isThirdParty: false,
    shortName: 'PLM',
    isFeature: false
  },
  {
    id: 'c6527ef2-462e-4a6d-b6ba-9618da8f2768',
    name: 'Virtual Lab',
    url: 'https://hive.dast.wrstudio.cloud',
    isThirdParty: false,
    shortName: 'Hive',
    isFeature: false
  },
  {
    id: 'e736d214-68c4-40ba-ae6d-d33bed62f3f4',
    name: 'Over the Air Updates',
    url: 'https://wrs-ota.dast.wrstudio.cloud',
    isThirdParty: false,
    shortName: 'WRS-OTA',
    isFeature: false
  },
  {
    id: 'e9083577-d4e7-48d6-9112-2dcfd01750f0',
    name: 'Device Registry',
    url: 'https://device.registry.dast.wrstudio.cloud',
    isThirdParty: true,
    shortName: 'Device Registry',
    isFeature: false
  },
  {
    id: 'ffe69062-a81b-4afe-931a-50afb4d71eac',
    name: 'Platform Health',
    url: 'https://dast.wrstudio.cloud/platformhealth',
    isThirdParty: false,
    shortName: 'platformhealth',
    isFeature: false
  }
];

/* ------------------------------------------------------------------ *
 * Components
 * ------------------------------------------------------------------ */

const ENVIRONMENT_WRRN = 'wrrn::aws:49e44597-8990-4f86-9831-9a4e8b0a1730';
const LOCATION_WRRN =
  ENVIRONMENT_WRRN + '::WRStudionginstaller:useast2:1f62f9b9-e637-4959-9a62-20dce262b8a2';
const PORTAL_WRRN = LOCATION_WRRN + '::home:7f49c0f6-4475-44b2-a225-9c63b4ab77b0';

const PORTAL_UNIQUE_DATA = {
  purpose: 'home',
  contains: 'Wind River Studio',
  entitlements: {
    name: 'Wind River Studio',
    iconName: 'default',
    isFeature: false,
    shortName: 'WRS',
    isThirdParty: false,
  },
};

/** `GET /um/api/components`. */
const COMPONENTS = [
  {
    id: '7f49c0f6-4475-44b2-a225-9c63b4ab77b0',
    name: 'Portal',
    wrrn: PORTAL_WRRN,
    description: 'Wind River Studio',
    url: 'hosted_zone',
    uniqueData: PORTAL_UNIQUE_DATA,
    locationWrrn: LOCATION_WRRN,
    namespace: 'WRStudio-ng-installer',
    geographic: 'us-east-2',
    environment: 'scales',
    category: 'home',
    type: 'home',
    state: 'ready',
  },
  {
    id: 'b8d4f206-31ca-4e79-9f85-0c6a72e14b3d',
    name: 'Test Automation Framework',
    wrrn: LOCATION_WRRN + '::taf:b8d4f206-31ca-4e79-9f85-0c6a72e14b3d',
    description: 'Test Automation Framework',
    url: 'hosted_zone',
    uniqueData: {
      purpose: 'taf',
      contains: 'Test Automation Framework',
      entitlements: {
        name: 'Test Automation Framework',
        iconName: 'default',
        isFeature: false,
        shortName: 'TAF',
        isThirdParty: false,
      },
    },
    locationWrrn: LOCATION_WRRN,
    namespace: 'WRStudio-ng-installer',
    geographic: 'us-east-2',
    environment: 'scales',
    category: 'taf',
    type: 'taf',
    state: 'ready',
  },
];

/** The embedded parent component every resource carries. */
const RESOURCE_COMPONENT = {
  namespace: 'WRStudio-ng-installer',
  geographic: 'us-east-2',
  locationWrrn: LOCATION_WRRN,
  environmentWrrn: ENVIRONMENT_WRRN,
  category: 'home',
  type: 'home',
  name: 'Portal',
  wrrn: PORTAL_WRRN,
  description: 'Wind River Studio',
  url: 'hosted_zone',
  state: 'ready',
  uniqueData: PORTAL_UNIQUE_DATA,
};

/** What `GET /um/api/components/categories` reports. */
const COMPONENT_CATEGORIES = [
  'home',
  'gallery',
  'mcp',
  'ntf',
  'platformhealth',
  'schedule',
  'tozny',
  'um',
  'vault',
  'vlab',
  'taf',
];

/**
 * `GET /portal/api/component-management/components`. The real icons are large
 * inline SVGs — 213 KB across the 17 rows — so a single neutral placeholder
 * stands in for them. The field keeps the `data:image/svg+xml;base64,` form the
 * spec documents.
 */
const PORTAL_COMPONENTS = [
  {
    id: '687ceab0-2c7d-45a7-a529-b38f97fb7e03',
    name: 'Linux Build System',
    url: 'https://lxbs.dast.wrstudio.cloud',
    shortname: 'LXBS',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '9dacdbeb-b685-4982-aa92-21e4a15e5d54',
    name: 'Main Control Program',
    url: 'https://dast.wrstudio.cloud/mcp',
    shortname: 'MCP',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'bf75c7ca-77b5-4082-a6e7-964178d5644a',
    name: 'Pipeline Manager',
    url: 'https://dast.wrstudio.cloud/plm',
    shortname: 'PLM',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '703da1d3-3de6-4bef-bbe4-d81d60035955',
    name: 'System Registry',
    url: 'https://system.registry.dast.wrstudio.cloud',
    shortname: 'System Registry',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '0cfde257-39ee-47d2-a80b-5e7838a88376',
    name: 'Artifact Repository',
    url: 'https://artifacts.dast.wrstudio.cloud/minio/login',
    shortname: 'Artifacts',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '7977a1fd-60ac-450d-946a-5c356293f7b7',
    name: 'Digital Feedback Loop',
    url: 'https://dfl.dast.wrstudio.cloud',
    shortname: 'DFL',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '71c94a3d-cd7e-452c-8134-15056d66e4dc',
    name: 'Test Automation Framework',
    url: 'https://dast.wrstudio.cloud/taf',
    shortname: 'TAF',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '6c9532dd-a726-451e-a9c4-735205baaa2f',
    name: 'Wind River Studio',
    url: 'https://dast.wrstudio.cloud',
    shortname: 'WRS',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'e736d214-68c4-40ba-ae6d-d33bed62f3f4',
    name: 'Over the Air Updates',
    url: 'https://wrs-ota.dast.wrstudio.cloud',
    shortname: 'WRS-OTA',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'e9083577-d4e7-48d6-9112-2dcfd01750f0',
    name: 'Device Registry',
    url: 'https://device.registry.dast.wrstudio.cloud',
    shortname: 'Device Registry',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'c6527ef2-462e-4a6d-b6ba-9618da8f2768',
    name: 'Virtual Lab',
    url: 'https://hive.dast.wrstudio.cloud',
    shortname: 'Hive',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'b9000927-2c4d-4739-9516-2db44c94ae51',
    name: 'Jenkins',
    url: 'https://jenkins.dast.wrstudio.cloud',
    shortname: 'Jenkins',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: 'ffe69062-a81b-4afe-931a-50afb4d71eac',
    name: 'Platform Health',
    url: 'https://dast.wrstudio.cloud/platformhealth',
    shortname: 'platformhealth',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '57dfe3d6-c12e-467b-9d85-34f5d8217f25',
    name: 'VxWorks Build System',
    url: 'https://vxbs.dast.wrstudio.cloud',
    shortname: 'VXBS',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '07dbfc5c-0882-4970-9cd9-0d56a49237eb',
    name: 'GitLab',
    url: 'https://gitlab.dast.wrstudio.cloud',
    shortname: 'GitLab',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '5f442c5a-713c-454e-9c93-fff6b75b0be5',
    name: 'Identity Management',
    url: 'https://tozny.id.dast.wrstudio.cloud/wrai/login',
    shortname: 'Tozny Id',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: true,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  },
  {
    id: '5a29b3ab-74ee-47df-a379-1ca6d7e20724',
    name: 'Workspace',
    url: 'https://dast.wrstudio.cloud/ws',
    shortname: 'ws',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNmU5MCIvPjwvc3ZnPg==',
    isThirdParty: false,
    isFeature: false,
    isExternal: false,
    isFavorite: false
  }
];

/* ------------------------------------------------------------------ *
 * Resources
 * ------------------------------------------------------------------ */

/**
 * Dashboards registered against the Portal component. `org` and `owner` are the
 * authorization markers; the handlers drop them before serialising.
 */
const RESOURCES = [
  {
    org: 'org-a',
    owner: 'testadmin01',
    wrrn: PORTAL_WRRN + '::dashboard:61ccb06b-025d-4c90-aeb7-62561d7ba4d9',
    name: 'test_08_sep',
    manual: true,
    description: '',
    type: 'dashboard',
    category: 'dashboard',
    state: 'ready',
    url: 'https://dast.wrstudio.cloud/dashboard',
    toolId: 'd53ee552-8795-483d-a6e3-f4cae6d3ab98',
    rbacRoles: [],
    tags: [],
    component: RESOURCE_COMPONENT,
    uniqueData: { widgets: [], createdDate: '1788884482306', updatedDate: '1788884482306' },
  },
  {
    org: 'org-a',
    owner: 'testuser01',
    wrrn: PORTAL_WRRN + '::dashboard:4f8b21d7-90ec-4a56-b3f1-7d20c94e8a65',
    name: 'pipeline_overview',
    manual: true,
    description: 'Shared build pipeline view',
    type: 'dashboard',
    category: 'dashboard',
    state: 'ready',
    url: 'https://dast.wrstudio.cloud/dashboard',
    toolId: 'd53ee552-8795-483d-a6e3-f4cae6d3ab98',
    rbacRoles: [],
    tags: ['pipelines'],
    component: RESOURCE_COMPONENT,
    uniqueData: { widgets: [], createdDate: '1789104553871', updatedDate: '1789104553871' },
  },
  {
    org: 'org-b',
    owner: 'testviewer01',
    wrrn: PORTAL_WRRN + '::dashboard:2c7f4b81-90de-4f3a-8c62-5db1e07a4936',
    name: 'qa_dashboard_11_sep',
    manual: true,
    description: '',
    type: 'dashboard',
    category: 'dashboard',
    state: 'ready',
    url: 'https://dast.wrstudio.cloud/dashboard',
    toolId: 'd53ee552-8795-483d-a6e3-f4cae6d3ab98',
    rbacRoles: [],
    tags: [],
    component: RESOURCE_COMPONENT,
    uniqueData: { widgets: [], createdDate: '1789198472004', updatedDate: '1789198472004' },
  },
];

/* ------------------------------------------------------------------ *
 * Test Automation Framework
 * ------------------------------------------------------------------ */

const TAF_PROJECTS = [
  {
    org: 'org-a',
    id: '7b00367e-46fd-4d54-acd7-cc07923d14bb',
    projectCode: '001',
    name: 'test_08_sep',
    description: '',
    targetRetention: 'release',
    targetRetentionDuration: 8,
    isDeleted: false,
    modifiedByUserName: 'testadmin01',
    artifactStorage: null,
    createdBy: 'testadmin01@windriver.com',
    createdDate: '2026-09-08T16:24:43.828Z',
    modifiedBy: 'testadmin01@windriver.com',
    modifiedDate: '2026-09-08T16:24:43.828Z',
    secretPath: null,
    ramResourceName: null,
  },
  {
    org: 'org-b',
    id: 'a4e81c72-3f65-4d09-b8a1-77c2e5940db3',
    projectCode: '002',
    name: 'qa_regression_11_sep',
    description: '',
    targetRetention: 'release',
    targetRetentionDuration: 4,
    isDeleted: false,
    modifiedByUserName: 'testviewer01',
    artifactStorage: null,
    createdBy: 'testviewer01@windriver.com',
    createdDate: '2026-09-11T10:02:18.441Z',
    modifiedBy: 'testviewer01@windriver.com',
    modifiedDate: '2026-09-11T10:02:18.441Z',
    secretPath: null,
    ramResourceName: null,
  },
];

const TAF_TEST_PLANS = [
  {
    org: 'org-a',
    id: '0f6ba250-3a07-4858-9aee-1621fcd5392c',
    name: 'test_plan_08_sep',
    description: null,
    projectId: '7b00367e-46fd-4d54-acd7-cc07923d14bb',
    targetRetention: 'release',
    isDisabled: false,
    modifiedByUserName: 'testadmin01',
    createdBy: 'testadmin01@windriver.com',
    modifiedBy: 'testadmin01@windriver.com',
    createdDate: '2026-09-08T16:25:07.412Z',
    modifiedDate: '2026-09-08T16:25:07.412Z',
    totalEnvironments: 0,
    totalTestCases: 0,
    totalTestSuites: 0,
  },
  {
    org: 'org-b',
    id: 'd1b93f57-6c20-4a88-9e34-08fa5c71b6e2',
    name: 'qa_plan_11_sep',
    description: null,
    projectId: 'a4e81c72-3f65-4d09-b8a1-77c2e5940db3',
    targetRetention: 'release',
    isDisabled: false,
    modifiedByUserName: 'testviewer01',
    createdBy: 'testviewer01@windriver.com',
    modifiedBy: 'testviewer01@windriver.com',
    createdDate: '2026-09-11T10:04:36.229Z',
    modifiedDate: '2026-09-11T10:04:36.229Z',
    totalEnvironments: 0,
    totalTestCases: 0,
    totalTestSuites: 0,
  },
];

/**
 * Executions. Every observed response carried an empty array, so no execution
 * object was ever seen on the wire and none is invented here.
 */
const TAF_EXECUTIONS = [];

/* ------------------------------------------------------------------ *
 * Virtual Lab — target manager
 *
 * Admin-only, all of it. These are the reference tables behind the lab
 * inventory (hardware, network kit and the country/state/city/site/lab
 * hierarchy), and an ordinary account has no business reading them — so every
 * path under /vlab/api/v4/target-manager is refused for a non-admin role. See
 * ADMIN_ONLY_PREFIXES in auth.js.
 *
 * Bodies are the captured ones. The list endpoints return a count/offset/total
 * envelope in which `offset` is a STRING, while the three hierarchy reads
 * return a bare `{status, data}` — both quirks are the service's, and both are
 * reproduced.
 * ------------------------------------------------------------------ */

const VLAB_BSPS = [
  {
    id: '1364ee63-f7ca-4d79-968f-de999633823a',
    name: 'test_bsp',
    createdDate: '2026-09-10T16:13:24.825Z',
    modifiedDate: '2026-09-10T16:13:31.103Z',
    createdBy: 'testadmin01',
    modifiedBy: 'testadmin01'
  }
];

const VLAB_CHECKRBAC = {
  message: "You don't have any assigned resource. Please contact your administrator.",
  check: false
};

const VLAB_CITIES = [
  {
    id: '3d509f2d-086c-45b6-bc46-ee9af468ea41',
    name: 'test city',
    createdDate: '2026-09-10T16:15:44.476Z',
    modifiedDate: '2026-09-10T16:15:44.476Z',
    createdBy: 'testadmin01',
    modifiedBy: null,
    isDeleted: false
  }
];

const VLAB_CONNECTION_TYPES = [];

const VLAB_COUNTRIES = [
  {
    id: 'f2b5fef5-ef9c-4af5-8513-bff02f0a34fa',
    name: 'test country',
    modifiedDate: null,
    modifiedBy: null,
    isDeleted: false
  }
];

const VLAB_CPUS = [];

const VLAB_INFO_ARCHITECTURES = [
  {
    id: '086b5184-e8f7-4999-b85f-d064524983f2',
    name: 'test_10_sep',
    createdDate: '2026-09-10T16:12:53.017Z',
    modifiedDate: '2026-09-10T16:12:53.017Z',
    createdBy: 'testadmin01',
    modifiedBy: 'testadmin01'
  }
];

const VLAB_KVM = [
  {
    id: '7ba01433-94a8-41c9-827b-9e12b6be3bd0',
    name: 'test kvm',
    url: null,
    vncIpAddress: '12.12.12.12',
    ldapEnabled: false,
    username: 'username',
    password: '[REDACTED]',
    createdDate: '2026-09-10T16:17:28.736Z',
    modifiedDate: '2026-09-10T16:17:35.388Z',
    createdBy: 'testadmin01',
    modifiedBy: 'testadmin01'
  }
];

const VLAB_LABS = [
  {
    name: 'test lab',
    id: 'bbedb09e-0bec-4c44-a310-658b21a22120',
    locationName: 'test site',
    locationId: 'e3bde3d9-c055-4e01-ac08-f69c7110a682',
    cityName: 'test city',
    cityId: '3d509f2d-086c-45b6-bc46-ee9af468ea41',
    stateName: 'test state',
    stateId: '71790855-cdc0-42b1-807d-c742a3cf651b',
    countryName: 'test country',
    countryId: 'f2b5fef5-ef9c-4af5-8513-bff02f0a34fa'
  }
];

const VLAB_LABS_LOCATIONS = [
  {
    location_name: 'test site',
    city_name: 'test city',
    id: 'bbedb09e-0bec-4c44-a310-658b21a22120',
    name: 'test lab'
  }
];

const VLAB_LOCATIONS = [
  {
    id: 'e3bde3d9-c055-4e01-ac08-f69c7110a682',
    name: 'test site',
    address: null,
    description: null,
    createdDate: '2026-09-10T16:16:12.399Z',
    modifiedDate: '2026-09-10T16:16:12.399Z',
    createdBy: 'testadmin01',
    modifiedBy: null,
    city: {
      id: '3d509f2d-086c-45b6-bc46-ee9af468ea41',
      name: 'test city',
      createdDate: '2026-09-10T16:15:44.476Z',
      modifiedDate: '2026-09-10T16:15:44.476Z',
      createdBy: 'testadmin01',
      modifiedBy: null,
      isDeleted: false,
      state: {
        id: '71790855-cdc0-42b1-807d-c742a3cf651b',
        name: 'test state',
        createdDate: '2026-09-10T16:15:25.360Z',
        modifiedDate: '2026-09-10T16:15:25.360Z',
        createdBy: 'testadmin01',
        modifiedBy: null,
        isDeleted: false,
        country: {
          id: 'f2b5fef5-ef9c-4af5-8513-bff02f0a34fa',
          name: 'test country',
          createdDate: '2026-09-10T16:14:59.435Z',
          modifiedDate: '2026-09-10T16:14:59.435Z',
          createdBy: 'testadmin01',
          modifiedBy: null,
          isDeleted: false
        }
      }
    }
  }
];

const VLAB_LOCATIONS_BY_CITY = [
  {
    id: 'e3bde3d9-c055-4e01-ac08-f69c7110a682',
    name: 'test site',
    address: null,
    description: null,
    modifiedDate: null,
    modifiedBy: null
  }
];

const VLAB_NETWORK_INTERFACES = [
  {
    id: 'e91609c8-ec43-4796-b8d3-79750fef59f8',
    name: 'test',
    createdDate: '2026-09-10T16:17:56.504Z',
    modifiedDate: '2026-09-10T16:18:01.770Z',
    createdBy: 'testadmin01',
    modifiedBy: 'testadmin01'
  }
];

const VLAB_PDUS = [];

/* ------------------------------------------------------------------ *
 * Virtual Lab — the rest of the captured surface
 *
 * Reservations, target control and the target-manager writes. Note the envelope
 * is not consistent across these services and the inconsistency is preserved:
 * `/v4/target-manager/*` returns `offset` as a string and `count` as a number,
 * `/v4/reservation/physical-reservations` returns BOTH as strings, and
 * `/v4/reservation/reservations` and `/v1/target-action-collections` return both
 * as numbers.
 *
 * Every collection that came back empty in the capture is left empty here — no
 * row is invented for a shape that was never seen on the wire.
 * ------------------------------------------------------------------ */

/** Collections observed empty. Their element shape is unknown. */
const VLAB_EMPTY = [];

const VLAB_STATES = [
  {
    id: '71790855-cdc0-42b1-807d-c742a3cf651b',
    name: 'test state',
    isDeleted: false,
    country: {
      id: 'f2b5fef5-ef9c-4af5-8513-bff02f0a34fa',
      name: 'test country',
      isDeleted: false
    }
  }
];

const VLAB_CITY_LIST = [
  {
    id: '3d509f2d-086c-45b6-bc46-ee9af468ea41',
    name: 'test city',
    isDeleted: false,
    state: {
      id: '71790855-cdc0-42b1-807d-c742a3cf651b',
      name: 'test state',
      isDeleted: false,
      country: {
        id: 'f2b5fef5-ef9c-4af5-8513-bff02f0a34fa',
        name: 'test country',
        isDeleted: false
      }
    }
  }
];

const VLAB_STATE_BY_ID = [
  {
    stateId: '71790855-cdc0-42b1-807d-c742a3cf651b',
    name: 'test state'
  }
];

const VLAB_TERMINAL_SERVERS = [
  {
    id: 'a9f719c7-13d6-4e7e-a407-27c9744a36c7',
    name: 'test',
    username: 'usernamw',
    password: '[REDACTED]',
    ipv4Address: '12.12.12.12',
    subnetMask: '255.255.255.0',
    ipv6Address: null,
    fqdnAddress: null,
    portCount: '8080',
    createdDate: '2026-09-10T16:20:06.699Z',
    modifiedDate: '2026-09-10T16:20:17.481Z',
    createdBy: 'testadmin01',
    modifiedBy: 'testadmin01'
  }
];

const VLAB_USER_GROUPS = [
  {
    id: '5096263a-3edf-4d93-9cad-b36ab2c09414',
    name: 'hive-admin-group'
  },
  {
    id: '2d81226a-832a-41cb-a1e1-e18859707db3',
    name: 'license-admin-group'
  },
  {
    id: '91496d44-b02e-4d04-9695-daee833443fe',
    name: 'platformhealth-admin-group'
  },
  {
    id: '140669b7-4580-4a29-b729-32712c3e2769',
    name: 'plm-task-library-viewer-group'
  },
  {
    id: 'd0e95e5e-315f-4bde-b70c-b3da315b56f6',
    name: 'slc-admin-group'
  },
  {
    id: '10c3c4af-5697-4227-83c4-beeca2c235e5',
    name: 'taf-admin-group'
  },
  {
    id: '753b3983-fec9-4bb0-b29f-c4d5f72933ef',
    name: 'usp-admin-group'
  },
  {
    id: 'eda2b9cf-c21c-4791-b93b-563325f8dd14',
    name: 'vault-admin-group'
  },
  {
    id: '9fed1194-53dc-4059-90fb-034253acec10',
    name: 'vlab-starter-group'
  }
];

const VLAB_VIRTUAL_TARGETS = [
  {
    id: 'e343da68-4622-40b0-8078-082a0e342d9f',
    template: {
      vlab_config: {
        CPU: {
          description: 'core type',
          read_only: true,
          required: false,
          ui_order: -1,
          value: 'x86'
        },
        VT_OS_IMAGE: {
          default: './vxWorks',
          description: 'VxWorks kernel image',
          read_only: false,
          required: false,
          ui_order: 0
        },
        architecture: {
          description: 'architecture of target',
          read_only: true,
          required: false,
          value: 'x86 Generic'
        },
        artifact_files: {
          default: 'VT_OS_IMAGE',
          description: 'List of artifact files will be used in artifact_path',
          read_only: false,
          required: false,
          ui_order: 0
        },
        artifact_path: {
          default: 'path/to/artifacts',
          description: 'Path to artifacts',
          read_only: false,
          required: false,
          ui_order: 0
        }
      }
    },
    isDeleted: false,
    createdBy: 'vt-admin',
    favorite: false,
    isReservable: true
  },
  {
    id: '6fd5b82e-b7ef-4441-8d1e-f5c454352f41',
    template: {
      vlab_config: {
        CPU: {
          description: 'core type',
          read_only: true,
          required: false,
          ui_order: -1,
          value: 'x86'
        },
        VT_OS_IMAGE: {
          default: './vxWorks',
          description: 'VxWorks kernel image',
          read_only: false,
          required: false,
          ui_order: 0
        },
        architecture: {
          description: 'architecture of target',
          read_only: true,
          required: false,
          value: 'x86 Generic'
        },
        artifact_files: {
          default: 'VT_OS_IMAGE',
          description: 'List of artifact files will be used in artifact_path',
          read_only: false,
          required: false,
          ui_order: 0
        },
        artifact_path: {
          default: 'path/to/artifacts',
          description: 'Path to artifacts',
          read_only: false,
          required: false,
          ui_order: 0
        }
      }
    },
    isDeleted: false,
    createdBy: 'vt-admin',
    favorite: false,
    isReservable: true
  }
];

const VLAB_CONNECTION_TYPE_ERROR = {
  statusCode: 500,
  response: {
    $statusCode: 500,
    status: 'error',
    errors: [
      {
        message: 'The specified connection type is not permitted. The allowed connection types are ssh, serial, telnet and android.',
        detail: 'Key (name)=not allowed type.',
        code: '45501'
      }
    ],
    errorMessages: [
      'The specified connection type is not permitted. The allowed connection types are ssh, serial, telnet and android.'
    ]
  }
};

module.exports = {
  ORGS,
  GROUPS,
  ROLES,
  MEMBERSHIP,
  PROFILES,
  SETTINGS,
  SETTING_IDS,
  ENTITLEMENTS,
  COMPONENTS,
  COMPONENT_CATEGORIES,
  PORTAL_COMPONENTS,
  RESOURCE_COMPONENT,
  RESOURCES,
  TAF_PROJECTS,
  TAF_TEST_PLANS,
  TAF_EXECUTIONS,
  VLAB_BSPS,
  VLAB_CHECKRBAC,
  VLAB_CITIES,
  VLAB_CONNECTION_TYPES,
  VLAB_COUNTRIES,
  VLAB_CPUS,
  VLAB_INFO_ARCHITECTURES,
  VLAB_KVM,
  VLAB_LABS,
  VLAB_LABS_LOCATIONS,
  VLAB_LOCATIONS,
  VLAB_LOCATIONS_BY_CITY,
  VLAB_NETWORK_INTERFACES,
  VLAB_PDUS,
  VLAB_EMPTY,
  VLAB_STATES,
  VLAB_CITY_LIST,
  VLAB_STATE_BY_ID,
  VLAB_TERMINAL_SERVERS,
  VLAB_USER_GROUPS,
  VLAB_VIRTUAL_TARGETS,
  VLAB_CONNECTION_TYPE_ERROR,
  ENVIRONMENT_WRRN,
  LOCATION_WRRN,
  PORTAL_WRRN,
};
