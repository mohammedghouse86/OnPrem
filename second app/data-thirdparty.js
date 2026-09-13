'use strict';

/**
 * Fixtures for the third-party services bundled behind the same gateway:
 * Grafana, Kiali/Istio, Prometheus and Jaeger. They are not the platform's own
 * API, but they answer on the same host, share the same bearer token, and were
 * captured alongside it — so a scan driven by this spec reaches them too.
 *
 * **These payloads are trimmed.** Several of the captured responses are far too
 * large to keep whole — Prometheus `/targets` alone was 11 MB, and Grafana's
 * metric metadata 288 KB. Arrays are cut to two elements, maps of more than
 * twenty keys to five, and long strings truncated. The envelope, the key names
 * and the value types are exactly as captured; only the number of rows differs,
 * so a client that parses the real thing parses this.
 */

const GRAFANA_DASHBOARD_SNAPSHOTS = [];

const GRAFANA_DASHBOARDS_HOME = {
  meta: {
    canSave: false,
    canEdit: true,
    canAdmin: false,
    canStar: false,
    canDelete: false
  },
  dashboard: {
    annotations: {
      list: [
        {
          $$hashKey: "object:2875",
          builtIn: 1,
          datasource: {
            type: "datasource"
          },
          enable: true,
          hide: true,
          iconColor: "rgba(0, 211, 255, 1)",
          name: "Annotations & Alerts",
          target: {
            limit: 100,
            matchAny: false,
            tags: [],
            type: "dashboard"
          },
          type: "dashboard"
        }
      ]
    },
    description: "CPU, memory, disk IO, network, temperature and other monitoring metrics",
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    id: 1772,
    links: [
      {
        $$hashKey: "object:2302",
        asDropdown: true,
        icon: "external link",
        tags: [],
        targetBlank: true,
        title: "",
        type: "dashboards"
      }
    ],
    panels: [
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 0
        },
        id: 199,
        panels: [],
        title: "Main",
        type: "row"
      },
      {
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        gridPos: {
          h: 3,
          w: 24,
          x: 0,
          y: 1
        },
        id: 201,
        options: {
          code: {
            language: "plaintext",
            showLineNumbers: false,
            showMiniMap: false
          },
          content: "<div style=\"height: 100%; position: center; width: 100%; background-color:#6c9694;\">\n\n  <div style=\"height: 100%; position: absolute; width: 100%; text-align: center;padding:10px\">\n    <font size=7px color=#201c1c style=\"background-color:#6c9694\">PLATFORM HEALTH\n      <font size=7px color=#30d4d0 style=\"background-color:#6c9694;\"> /\n    <img src=\"https://www.windriver.com/themes/wr/global/images/s…",
          mode: "html"
        },
        pluginVersion: "11.6.0",
        title: "",
        type: "text"
      }
    ],
    preload: false,
    refresh: "30s",
    schemaVersion: 41,
    tags: [
      "Prometheus",
      "node_exporter"
    ],
    templating: {
      list: []
    },
    time: {
      from: "now-12h",
      to: "now"
    },
    timepicker: {
      refresh_intervals: [
        "15s",
        "30s"
      ]
    },
    timezone: "browser",
    title: "Main Dashboard Platform Health",
    uid: "MainPH",
    version: 1
  }
};

const GRAFANA_DASHBOARDS_PUBLIC_DASHBOARDS = {
  publicDashboards: [],
  totalCount: 0,
  page: 1,
  perPage: 8
};

const GRAFANA_DASHBOARDS_TAGS = [
  {
    term: "MAIN",
    count: 1
  },
  {
    term: "Prometheus",
    count: 1
  }
];

const GRAFANA_DATASOURCES = [
  {
    id: 2,
    uid: "alertmanager",
    orgId: 1,
    name: "Alertmanager",
    type: "alertmanager",
    typeName: "Alertmanager",
    typeLogoUrl: "public/app/plugins/datasource/alertmanager/img/logo.svg",
    access: "proxy",
    url: "http://kube-prometheus-stack-alertmanager.prod-wrai-tools-platformhealth:9093/alertmanager",
    user: "",
    database: "",
    basicAuth: false,
    isDefault: false,
    jsonData: {
      handleGrafanaManagedAlerts: false,
      implementation: "prometheus"
    },
    readOnly: true
  },
  {
    id: 5,
    uid: "PXRA123456789",
    orgId: 1,
    name: "aws-xray",
    type: "grafana-x-ray-datasource",
    typeName: "AWS Application Signals",
    typeLogoUrl: "public/plugins/grafana-x-ray-datasource/img/AWS-X-Ray.svg",
    access: "proxy",
    url: "",
    user: "",
    database: "",
    basicAuth: false,
    isDefault: false,
    jsonData: {
      authType: "default",
      defaultRegion: "us-east-1"
    },
    readOnly: true
  }
];

const GRAFANA_DATASOURCES_CORRELATIONS = {
  correlations: [],
  totalCount: 0,
  page: 1,
  limit: 100
};

const GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABEL_NAME_VALUES = {
  status: "success",
  data: [
    ":node_memory_MemAvailable_bytes:sum",
    "ALERTS"
  ]
};

const GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABELS = {
  status: "success",
  data: [
    "__name__",
    "access_mode"
  ]
};

const GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_METADATA = {
  status: "success",
  data: {
    aggregator_discovery_aggregation_count_total: [
      {
        type: "counter",
        unit: "",
        help: "[ALPHA] Counter of number of times discovery was aggregated"
      }
    ],
    aggregator_discovery_nopeer_requests_total: [
      {
        type: "counter",
        unit: "",
        help: "[ALPHA] Counter of number of times no-peer (non peer-aggregated) discovery was requested"
      }
    ],
    aggregator_discovery_peer_aggregated_cache_hits_total: [
      {
        type: "counter",
        unit: "",
        help: "[ALPHA] Counter of number of times discovery was served from peer-aggregated cache"
      }
    ],
    aggregator_discovery_peer_aggregated_cache_misses_total: [
      {
        type: "counter",
        unit: "",
        help: "[ALPHA] Counter of number of times discovery was aggregated across all API servers"
      }
    ],
    aggregator_unavailable_apiservice: [
      {
        type: "gauge",
        unit: "",
        help: "[ALPHA] Gauge of APIServices which are marked as unavailable broken down by APIService name."
      }
    ]
  }
};

const GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_QUERY_EXEMPLARS = {
  status: "success",
  data: []
};

const GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_RULES = {
  status: "success",
  data: {
    groups: [
      {
        name: "alertmanager.rules",
        file: "/etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0/prod-wrai-tools-platformhealth-kube-prometheus-stack-alertmanager.rules-53ddc095-9b38-46ad-a76e-e43067904c80.yaml",
        rules: [
          {
            state: "inactive",
            name: "AlertmanagerFailedReload",
            query: "max_over_time(alertmanager_config_last_reload_successful{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]) == 0",
            duration: 600,
            keepFiringFor: 0,
            labels: {
              severity: "critical"
            },
            annotations: {
              description: "Configuration has failed to load for {{ $labels.namespace }}/{{ $labels.pod}}.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/alertmanager/alertmanagerfailedreload",
              summary: "Reloading an Alertmanager configuration has failed."
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.000188554,
            lastEvaluation: "2026-09-10T16:09:05.452305163Z",
            type: "alerting"
          },
          {
            state: "inactive",
            name: "AlertmanagerMembersInconsistent",
            query: "max_over_time(alertmanager_cluster_members{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]) < on (namespace, service, cluster) group_left () count by (namespace, service, cluster) (max_over_time(alertmanager_cluster_members{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]))",
            duration: 900,
            keepFiringFor: 0,
            labels: {
              severity: "critical"
            },
            annotations: {
              description: "Alertmanager {{ $labels.namespace }}/{{ $labels.pod}} has only found {{ $value }} members of the {{$labels.job}} cluster.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/alertmanager/alertmanagermembersinconsistent",
              summary: "A member of an Alertmanager cluster has not found all other cluster members."
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.000144159,
            lastEvaluation: "2026-09-10T16:09:05.452496359Z",
            type: "alerting"
          }
        ],
        interval: 30,
        limit: 0,
        evaluationTime: 0.002399854,
        lastEvaluation: "2026-09-10T16:09:05.452293151Z"
      },
      {
        name: "config-reloaders",
        file: "/etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0/prod-wrai-tools-platformhealth-kube-prometheus-stack-config-reloaders-28627f77-f2d5-4b09-ac92-403462b51b66.yaml",
        rules: [
          {
            state: "inactive",
            name: "ConfigReloaderSidecarErrors",
            query: "max_over_time(reloader_last_reload_successful{namespace=~\".+\"}[5m]) == 0",
            duration: 600,
            keepFiringFor: 0,
            labels: {
              severity: "warning"
            },
            annotations: {
              description: "Errors encountered while the {{$labels.pod}} config-reloader sidecar attempts to sync config in {{$labels.namespace}} namespace.\nAs a result, configuration for service running in {{$labels.pod}} may be stale and cannot be updated anymore.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/prometheus-operator/configreloadersidecarerrors",
              summary: "config-reloader sidecar has not had a successful reload for 10m"
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.000313286,
            lastEvaluation: "2026-09-10T16:08:52.986611368Z",
            type: "alerting"
          }
        ],
        interval: 30,
        limit: 0,
        evaluationTime: 0.00032933,
        lastEvaluation: "2026-09-10T16:08:52.986598655Z"
      }
    ]
  }
};

const GRAFANA_FOLDERS = [
  {
    id: 1,
    uid: "dfwju0brnkvlsd",
    title: "Platform-Health"
  }
];

const GRAFANA_FOLDERS_GENERAL = {
  id: 0,
  uid: "general",
  orgId: 0,
  title: "Dashboards",
  url: "",
  hasAcl: false,
  canSave: true,
  canEdit: true,
  canAdmin: true,
  canDelete: true,
  createdBy: "Anonymous",
  created: "0001-01-01T00:00:00Z",
  updatedBy: "Anonymous",
  updated: "0001-01-01T00:00:00Z",
  accessControl: {
    "alert.rules:create": true,
    "alert.rules:delete": true,
    "alert.rules:read": true,
    "alert.rules:write": true,
    "alert.silences:create": true
  }
};

const GRAFANA_GNET_PLUGINS = {
  items: [
    {
      status: "deprecated",
      id: 22,
      typeId: 1,
      typeName: "Application",
      typeCode: "app"
    },
    {
      status: "deprecated",
      id: 92,
      typeId: 3,
      typeName: "Panel",
      typeCode: "panel"
    }
  ],
  orderBy: "weight",
  direction: "asc",
  links: [
    {
      rel: "self",
      href: "/plugins"
    }
  ]
};

const GRAFANA_LIBRARY_ELEMENTS = {
  result: {
    totalCount: 0,
    elements: [],
    page: 1,
    perPage: 40
  }
};

const GRAFANA_PLUGINS = [
  {
    name: "AWS Application Signals",
    type: "datasource",
    id: "grafana-x-ray-datasource",
    enabled: true,
    pinned: false,
    info: {
      author: {
        name: "Grafana",
        url: "https://grafana.com"
      },
      description: "Data source for AWS Application Signals",
      links: [
        {
          name: "Website",
          url: "https://github.com/grafana/x-ray-datasource"
        },
        {
          name: "License",
          url: "https://github.com/grafana/x-ray-datasource/blob/master/LICENSE"
        }
      ],
      logos: {
        small: "public/plugins/grafana-x-ray-datasource/img/AWS-X-Ray.svg",
        large: "public/plugins/grafana-x-ray-datasource/img/AWS-X-Ray.svg"
      },
      build: {},
      screenshots: [],
      version: "2.17.1",
      updated: "2026-08-05",
      keywords: [
        "datasource",
        "aws"
      ]
    },
    dependencies: {
      grafanaDependency: ">=10.4.0-0",
      grafanaVersion: "*",
      plugins: [],
      extensions: {
        exposedComponents: []
      }
    },
    latestVersion: "2.17.2",
    hasUpdate: true,
    defaultNavUrl: "/grafana",
    category: "tracing",
    state: "",
    signature: "valid",
    signatureType: "grafana",
    signatureOrg: "Grafana Labs",
    accessControl: {
      "plugins.app:access": true,
      "plugins:write": true
    },
    angularDetected: false
  },
  {
    name: "Alert list",
    type: "panel",
    id: "alertlist",
    enabled: true,
    pinned: false,
    info: {
      author: {
        name: "Grafana Labs",
        url: "https://grafana.com"
      },
      description: "Shows list of alerts and their current status",
      links: null,
      logos: {
        small: "public/app/plugins/panel/alertlist/img/icn-singlestat-panel.svg",
        large: "public/app/plugins/panel/alertlist/img/icn-singlestat-panel.svg"
      },
      build: {},
      screenshots: null,
      version: "",
      updated: "",
      keywords: null
    },
    dependencies: {
      grafanaDependency: "",
      grafanaVersion: "*",
      plugins: [],
      extensions: {
        exposedComponents: []
      }
    },
    latestVersion: "",
    hasUpdate: false,
    defaultNavUrl: "/grafana",
    category: "",
    state: "",
    signature: "internal",
    signatureType: "",
    signatureOrg: "",
    accessControl: {
      "plugins.app:access": true,
      "plugins:write": true
    },
    angularDetected: false
  }
];

const GRAFANA_PLUGINS_BY_SETTINGS = {
  name: "Grafana Logs Drilldown",
  type: "app",
  id: "grafana-lokiexplore-app",
  enabled: true,
  pinned: true
};

const GRAFANA_PLUGINS_ERRORS = [];

const GRAFANA_PROMETHEUS_GRAFANA_API_V1_RULES = {
  status: "success",
  data: {
    groups: []
  }
};

const GRAFANA_SEARCH = [
  {
    id: 1,
    uid: "dfwju0brnkvlsd",
    orgId: 1,
    title: "Platform-Health",
    uri: "db/platform-health",
    url: "/grafana/dashboards/f/dfwju0brnkvlsd/platform-health",
    slug: "",
    type: "dash-folder",
    tags: [],
    isStarred: false,
    sortMeta: 0,
    isDeleted: false
  },
  {
    id: 22,
    uid: "alertmanager-overview",
    orgId: 1,
    title: "Alertmanager / Overview",
    uri: "db/alertmanager-overview",
    url: "/grafana/d/alertmanager-overview/alertmanager-overview",
    slug: "",
    type: "dash-db",
    tags: [
      "alertmanager-mixin"
    ],
    isStarred: false,
    folderId: 1,
    folderUid: "dfwju0brnkvlsd",
    folderTitle: "Platform-Health",
    folderUrl: "/grafana/dashboards/f/dfwju0brnkvlsd/Platform-Health",
    sortMeta: 0,
    isDeleted: false
  }
];

const GRAFANA_SEARCH_SORTING = {
  sortOptions: [
    {
      description: "Sort results in an alphabetically ascending order",
      displayName: "Alphabetically (A–Z)",
      meta: "",
      name: "alpha-asc"
    },
    {
      description: "Sort results in an alphabetically descending order",
      displayName: "Alphabetically (Z–A)",
      meta: "",
      name: "alpha-desc"
    }
  ]
};

const GRAFANA_USER_ORGS = [
  {
    orgId: 1,
    name: "Main Org.",
    role: "Admin"
  }
];

const GRAFANA_USER_PREFERENCES = {};

const KIALI_AUTH_INFO = {
  strategy: "anonymous",
  sessionInfo: {}
};

const KIALI_CLUSTERS_APPS = {
  applications: [
    {
      name: "calico-apiserver",
      namespace: "calico-apiserver",
      cluster: "Kubernetes",
      istioSidecar: false,
      isAmbient: false,
      isGateway: false,
      labels: {
        apiserver: "true",
        "app.kubernetes.io/name": "calico-apiserver",
        "k8s-app": "calico-apiserver,tigera-api"
      },
      istioReferences: [],
      health: {
        workloadStatuses: [
          {
            name: "calico-apiserver",
            desiredReplicas: 2,
            currentReplicas: 2,
            availableReplicas: 2,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    }
  ],
  cluster: "Kubernetes"
};

const KIALI_CLUSTERS_HEALTH = {
  namespaceAppHealth: {
    "calico-apiserver": {
      "calico-apiserver": {
        workloadStatuses: [
          {
            name: "calico-apiserver",
            desiredReplicas: 2,
            currentReplicas: 2,
            availableReplicas: 2,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    },
    "calico-system": {
      "calico-kube-controllers": {
        workloadStatuses: [
          {
            name: "calico-kube-controllers",
            desiredReplicas: 1,
            currentReplicas: 1,
            availableReplicas: 1,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      },
      "calico-node": {
        workloadStatuses: [
          {
            name: "calico-node",
            desiredReplicas: 22,
            currentReplicas: 22,
            availableReplicas: 22,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      },
      "calico-typha": {
        workloadStatuses: [
          {
            name: "calico-typha",
            desiredReplicas: 3,
            currentReplicas: 3,
            availableReplicas: 3,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      },
      "csi-node-driver": {
        workloadStatuses: [
          {
            name: "csi-node-driver",
            desiredReplicas: 22,
            currentReplicas: 22,
            availableReplicas: 22,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    },
    "cert-manager": {
      cainjector: {
        workloadStatuses: [
          {
            name: "cert-manager-cainjector",
            desiredReplicas: 1,
            currentReplicas: 1,
            availableReplicas: 1,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      },
      "cert-manager": {
        workloadStatuses: [
          {
            name: "cert-manager",
            desiredReplicas: 1,
            currentReplicas: 1,
            availableReplicas: 1,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      },
      webhook: {
        workloadStatuses: [
          {
            name: "cert-manager-webhook",
            desiredReplicas: 1,
            currentReplicas: 1,
            availableReplicas: 1,
            syncedProxies: -1
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    },
    default: {},
    "ingress-nginx": {
      "ingress-nginx": {
        workloadStatuses: [
          {
            name: "ingress-nginx-controller",
            desiredReplicas: 2,
            currentReplicas: 2,
            availableReplicas: 2,
            syncedProxies: 2
          }
        ],
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    }
  }
};

const KIALI_CLUSTERS_SERVICES = {
  cluster: "Kubernetes",
  services: [
    {
      name: "calico-api",
      namespace: "calico-apiserver",
      istioSidecar: false,
      cluster: "Kubernetes",
      isAmbient: false,
      appLabel: false,
      additionalDetailSample: null,
      annotations: null,
      healthAnnotations: {},
      ports: null,
      labels: {
        "k8s-app": "tigera-api"
      },
      selector: {
        apiserver: "true"
      },
      istioReferences: [],
      kialiWizard: "",
      serviceRegistry: "Kubernetes",
      health: {
        requests: {
          inbound: {},
          outbound: {},
          healthAnnotations: {}
        }
      }
    }
  ],
  validations: {
    service: {
      "calico-api.calico-apiserver": {
        name: "calico-api",
        namespace: "calico-apiserver",
        cluster: "",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "service"
        },
        valid: false,
        checks: [
          {
            code: "KIA0701",
            message: "Deployment exposing same port as Service not found",
            severity: "warning",
            path: "spec/ports[0]"
          }
        ],
        references: null
      }
    }
  }
};

const KIALI_CLUSTERS_TLS = [
  {
    autoMTLSEnabled: true,
    cluster: "Kubernetes",
    minTLS: "",
    namespace: "calico-system",
    status: "MTLS_NOT_ENABLED"
  },
  {
    autoMTLSEnabled: true,
    cluster: "Kubernetes",
    minTLS: "",
    namespace: "cert-manager",
    status: "MTLS_NOT_ENABLED"
  }
];

const KIALI_CLUSTERS_WORKLOADS = {
  cluster: "Kubernetes",
  workloads: [
    {
      name: "calico-apiserver",
      namespace: "calico-apiserver",
      cluster: "Kubernetes",
      gvk: {
        Group: "apps",
        Version: "v1",
        Kind: "Deployment"
      },
      createdAt: "2026-08-28T08:52:39Z"
    }
  ],
  validations: {
    workload: {
      "calico-apiserver.calico-apiserver": {
        name: "calico-apiserver",
        namespace: "calico-apiserver",
        cluster: "",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      }
    }
  }
};

const KIALI_CONFIG = {
  authStrategy: "anonymous",
  clusters: {
    Kubernetes: {
      apiEndpoint: "https://172.20.0.1:443",
      isKialiHome: true,
      kialiInstances: [
        {
          namespace: "istio-system",
          operatorResource: "",
          serviceName: "kiali",
          url: "",
          version: "v2.12.0"
        }
      ],
      name: "Kubernetes",
      secretName: "",
      accessible: true
    }
  },
  clusterWideAccess: true,
  deployment: {
    viewOnlyMode: true
  },
  healthConfig: {
    rate: [
      {
        tolerance: [
          {
            code: "5XX",
            degraded: 0,
            failure: 10,
            protocol: "http",
            direction: ".*"
          },
          {
            code: "4XX",
            degraded: 10,
            failure: 20,
            protocol: "http",
            direction: ".*"
          }
        ]
      },
      {
        tolerance: [
          {
            code: "5XX",
            degraded: 0,
            failure: 10,
            protocol: "http",
            direction: ".*"
          },
          {
            code: "4XX",
            degraded: 10,
            failure: 20,
            protocol: "http",
            direction: ".*"
          }
        ]
      }
    ]
  },
  istioAnnotations: {
    ambientAnnotation: "ambient.istio.io/redirection",
    ambientAnnotationEnabled: "enabled",
    istioInjectionAnnotation: "sidecar.istio.io/inject"
  },
  istioConfigMap: "",
  istioIdentityDomain: "svc.cluster.local",
  istioLabels: {
    ambientNamespaceLabel: "istio.io/dataplane-mode",
    ambientNamespaceLabelValue: "ambient",
    ambientWaypointGatewayLabel: "gateway.networking.k8s.io/gateway-name",
    ambientWaypointLabel: "",
    ambientWaypointLabelValue: "",
    ambientWaypointUseLabel: "istio.io/use-waypoint",
    appLabelName: "",
    injectionLabelName: "istio-injection",
    injectionLabelRev: "istio.io/rev",
    serviceCanonicalName: "service.istio.io/canonical-name",
    serviceCanonicalRevision: "service.istio.io/canonical-revision",
    versionLabelName: ""
  },
  istioNamespace: "istio-system",
  istioStatusEnabled: true,
  kialiFeatureFlags: {
    clustering: {
      enable_exec_provider: false
    },
    istioAnnotationAction: true,
    istioInjectionAction: true,
    istioUpgradeAction: false,
    uiDefaults: {
      graph: {
        findOptions: [
          {
            description: "Find: slow edges (> 1s)",
            expression: "rt > 1000"
          },
          {
            description: "Find: unhealthy nodes",
            expression: "! healthy"
          }
        ],
        hideOptions: [
          {
            description: "Hide: healthy nodes",
            expression: "healthy"
          },
          {
            description: "Hide: unknown nodes",
            expression: "name = unknown"
          }
        ],
        settings: {
          animation: "point"
        },
        traffic: {
          ambient: "total",
          grpc: "requests",
          http: "requests",
          tcp: "sent"
        }
      },
      i18n: {
        language: "en",
        showSelector: false
      },
      list: {
        includeHealth: true,
        includeIstioResources: true,
        includeValidations: true,
        showIncludeToggles: false
      },
      mesh: {
        findOptions: [
          {
            description: "Find: unhealthy nodes",
            expression: "! healthy"
          }
        ],
        hideOptions: [
          {
            description: "Hide: healthy nodes",
            expression: "healthy"
          }
        ]
      },
      metricsPerRefresh: "1m",
      metricsInbound: {},
      metricsOutbound: {},
      refreshInterval: "60s",
      tracing: {
        limit: 100
      }
    },
    validations: {
      ignore: [
        "KIA1301"
      ],
      SkipWildcardGatewayHosts: false
    }
  },
  logLevel: "info",
  prometheus: {
    globalScrapeInterval: 30,
    storageTsdbRetention: 864000
  }
};

const KIALI_CRIPPLED = "{\n  \"requestSize\": false,\n  \"requestSizeAverage\": false,\n  \"requestSizePercentiles\": false,\n  \"responseSize\": false,\n  \"responseSizeAverage\": false,\n  \"responseSizePercentiles\": false,\n  \"responseTime\": false,\n  \"responseTimeAverage\": false,\n  \"responseTimePercentiles\": false\n}{\n  \"requestSize\": true,\n  \"requestSizeAverage\": true,\n  \"requestSizePercentiles\": true,\n  \"responseSize\": true,\n  \"respon";

const KIALI_GRAFANA = {
  externalLinks: []
};

const KIALI_ISTIO_CONFIG = {
  resources: {
    "extensions.istio.io/v1alpha1, Kind=WasmPlugin": [],
    "gateway.networking.k8s.io/v1, Kind=GRPCRoute": [],
    "gateway.networking.k8s.io/v1, Kind=Gateway": [],
    "gateway.networking.k8s.io/v1, Kind=HTTPRoute": [],
    "gateway.networking.k8s.io/v1alpha2, Kind=TCPRoute": [],
    "gateway.networking.k8s.io/v1alpha2, Kind=TLSRoute": [],
    "gateway.networking.k8s.io/v1beta1, Kind=ReferenceGrant": [],
    "networking.istio.io/v1, Kind=DestinationRule": [],
    "networking.istio.io/v1, Kind=Gateway": [],
    "networking.istio.io/v1, Kind=ServiceEntry": [],
    "networking.istio.io/v1, Kind=Sidecar": [],
    "networking.istio.io/v1, Kind=VirtualService": [],
    "networking.istio.io/v1, Kind=WorkloadEntry": [],
    "networking.istio.io/v1, Kind=WorkloadGroup": [],
    "networking.istio.io/v1alpha3, Kind=EnvoyFilter": [
      {
        kind: "EnvoyFilter",
        apiVersion: "networking.istio.io/v1alpha3",
        metadata: {
          name: "decrease-envoy-buffer",
          namespace: "istio-system",
          uid: "304db5ca-253d-4806-a950-719b394252e8",
          resourceVersion: "17888",
          generation: 1,
          creationTimestamp: "2026-08-28T08:56:41Z"
        },
        spec: {
          configPatches: [
            {
              applyTo: "CLUSTER",
              match: {
                cluster: {
                  portNumber: 8075
                }
              },
              patch: {
                operation: "MERGE",
                value: {
                  http2_protocol_options: {
                    initial_connection_window_size: 65535,
                    initial_stream_window_size: 65535
                  },
                  per_connection_buffer_limit_bytes: 65535,
                  typed_extension_protocol_options: {
                    "envoy.extensions.upstreams.http.v3.HttpProtocolOptions": {
                      "@type": "type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions",
                      explicit_http_config: {
                        http2_protocol_options: {
                          initial_connection_window_size: 65535,
                          initial_stream_window_size: 65535
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              applyTo: "CLUSTER",
              patch: {
                operation: "MERGE",
                value: {
                  per_connection_buffer_limit_bytes: 65535
                }
              }
            }
          ]
        },
        status: {}
      }
    ],
    "security.istio.io/v1, Kind=AuthorizationPolicy": [],
    "security.istio.io/v1, Kind=PeerAuthentication": [
      {
        kind: "PeerAuthentication",
        apiVersion: "security.istio.io/v1",
        metadata: {
          name: "istio-peer-auth-smtp-dast-default-peerauthentication",
          namespace: "prod-wrai-smtp",
          uid: "7c593d1b-cd1d-4335-b59a-d1dafe88953d",
          resourceVersion: "102016",
          generation: 1,
          creationTimestamp: "2026-08-28T11:54:28Z",
          annotations: {
            "argocd.argoproj.io/tracking-id": "istio-peer-auth-smtp-dast:security.istio.io/PeerAuthentication:prod-wrai-smtp/istio-peer-auth-smtp-dast-default-peerauthentication",
            "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"security.istio.io/v1beta1\",\"kind\":\"PeerAuthentication\",\"metadata\":{\"annotations\":{\"argocd.argoproj.io/tracking-id\":\"istio-peer-auth-smtp-dast:security.istio.io/PeerAuthentication:prod-wrai-smtp/istio-peer-auth-smtp-dast-default-peerauthentication\"},\"name\":\"istio-peer-auth-smtp-dast-default-peerauthentication\",\"namespace\":\"prod-wrai-smtp\"},\"spec\":{\"mtls\":{\"mode\":\"PERMISSIVE\"}}}\n"
          }
        },
        spec: {
          mtls: {
            mode: "PERMISSIVE"
          }
        },
        status: {}
      }
    ],
    "security.istio.io/v1, Kind=RequestAuthentication": [],
    "telemetry.istio.io/v1, Kind=Telemetry": []
  },
  validations: {
    "security.istio.io/v1, Kind=PeerAuthentication": {
      "istio-peer-auth-smtp-dast-default-peerauthentication.prod-wrai-smtp": {
        name: "istio-peer-auth-smtp-dast-default-peerauthentication",
        namespace: "prod-wrai-smtp",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "security.istio.io",
          Version: "v1",
          Kind: "PeerAuthentication"
        },
        valid: true,
        checks: [],
        references: null
      }
    },
    workload: {
      "alertmanager-kube-prometheus-stack-alertmanager.prod-wrai-tools-platformhealth": {
        name: "alertmanager-kube-prometheus-stack-alertmanager",
        namespace: "prod-wrai-tools-platformhealth",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      },
      "api-gateway.prod-wrai-usp-hive": {
        name: "api-gateway",
        namespace: "prod-wrai-usp-hive",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      },
      "apigateway.prod-wrai-usp-taf": {
        name: "apigateway",
        namespace: "prod-wrai-usp-taf",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      },
      "calico-apiserver.calico-apiserver": {
        name: "calico-apiserver",
        namespace: "calico-apiserver",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      },
      "calico-kube-controllers.calico-system": {
        name: "calico-kube-controllers",
        namespace: "calico-system",
        cluster: "Kubernetes",
        objectGVK: {
          Group: "",
          Version: "",
          Kind: "workload"
        },
        valid: true,
        checks: [],
        references: null
      }
    }
  }
};

const KIALI_ISTIO_STATUS = [
  {
    cluster: "Kubernetes",
    name: "istiod",
    status: "Healthy",
    is_core: true
  },
  {
    cluster: "Kubernetes",
    name: "prometheus",
    status: "Healthy",
    is_core: false
  }
];

const KIALI_ISTIO_VALIDATIONS = [
  {
    errors: 0,
    objectCount: 0,
    warnings: 0,
    namespace: "calico-apiserver",
    cluster: "Kubernetes"
  },
  {
    errors: 0,
    objectCount: 0,
    warnings: 0,
    namespace: "calico-system",
    cluster: "Kubernetes"
  }
];

const KIALI_MESH_CONTROLPLANES = [
  {
    cluster: {
      apiEndpoint: "https://172.20.0.1:443",
      isKialiHome: true,
      kialiInstances: [
        {
          namespace: "istio-system",
          operatorResource: "",
          serviceName: "kiali",
          url: "",
          version: "v2.12.0"
        }
      ],
      name: "Kubernetes",
      secretName: "",
      accessible: true
    },
    config: {
      certificates: [
        {
          dnsNames: null,
          configMapName: "istio-ca-root-cert",
          issuer: "O=cluster.local",
          notBefore: "2026-08-28T08:56:29Z",
          notAfter: "2036-08-25T08:56:29Z",
          error: "",
          accessible: true,
          cluster: ""
        }
      ],
      effectiveConfig: {
        configMap: {
          mesh: {
            defaultConfig: {
              discoveryAddress: "istiod.istio-system.svc:15012"
            },
            trustDomain: "cluster.local",
            rootNamespace: "istio-system",
            enablePrometheusMerge: true,
            defaultProviders: {
              metrics: [
                "prometheus"
              ]
            }
          },
          meshNetworks: {}
        }
      },
      standardConfig: {
        cluster: "Kubernetes",
        configMap: {
          mesh: {
            defaultConfig: {
              discoveryAddress: "istiod.istio-system.svc:15012"
            },
            trustDomain: "cluster.local",
            rootNamespace: "istio-system",
            enablePrometheusMerge: true,
            defaultProviders: {
              metrics: [
                "prometheus"
              ]
            }
          },
          meshNetworks: {}
        },
        name: "istio",
        namespace: "istio-system"
      }
    },
    externalControlPlane: false,
    id: "Kubernetes",
    istiodName: "istiod",
    istiodNamespace: "istio-system",
    managedClusters: [
      {
        apiEndpoint: "https://172.20.0.1:443",
        isKialiHome: true,
        kialiInstances: [
          {
            namespace: "istio-system",
            operatorResource: "",
            serviceName: "kiali",
            url: "",
            version: "v2.12.0"
          }
        ],
        name: "Kubernetes",
        secretName: "",
        accessible: true
      }
    ],
    managesExternal: false,
    managedNamespaces: [
      {
        name: "default",
        cluster: "Kubernetes",
        isAmbient: false,
        labels: {
          "istio-injection": "enabled",
          "kubernetes.io/metadata.name": "default",
          "sidecar-injector": "prod-vault",
          "webhook-injector": "prod-vault"
        },
        annotations: null,
        revision: "default"
      },
      {
        name: "ingress-nginx",
        cluster: "Kubernetes",
        isAmbient: false,
        labels: {
          "app.kubernetes.io/name": "ingress-nginx",
          "istio-injection": "enabled",
          "kubernetes.io/metadata.name": "ingress-nginx",
          name: "ingress-nginx"
        },
        annotations: null,
        revision: "default"
      }
    ],
    resources: {
      limits: {
        cpu: "5",
        memory: "6Gi"
      },
      requests: {
        cpu: "300m",
        memory: "300Mi"
      }
    },
    revision: "default",
    status: "Healthy",
    thresholds: {
      memory: 6443,
      cpu: 5
    },
    version: {
      name: "Istio",
      version: "1.24.5",
      tempoConfig: {}
    }
  }
];

const KIALI_MESH_GRAPH = {
  elements: {
    nodes: [
      {
        data: {
          id: "3093dc2223bcaae5f55c76488bf1a8b2fe5235e6058f00c6f4956566669323ba",
          cluster: "Kubernetes",
          infraName: "Kubernetes",
          infraType: "cluster",
          namespace: "",
          nodeType: "box",
          healthData: "Healthy",
          infraData: {
            apiEndpoint: "https://172.20.0.1:443",
            isKialiHome: true,
            kialiInstances: [
              {
                namespace: "istio-system",
                operatorResource: "",
                serviceName: "kiali",
                url: "",
                version: "v2.12.0"
              }
            ],
            name: "Kubernetes",
            secretName: "",
            accessible: true
          },
          isBox: "cluster",
          version: "v1.36.3-eks-cb19647"
        }
      },
      {
        data: {
          id: "c45e8e02a3568cc1c324743f70210e20977db688449e176226530c0982e6f096",
          parent: "3093dc2223bcaae5f55c76488bf1a8b2fe5235e6058f00c6f4956566669323ba",
          cluster: "Kubernetes",
          infraName: "istio-system",
          infraType: "namespace",
          namespace: "istio-system",
          nodeType: "box",
          healthData: null,
          isBox: "namespace"
        }
      }
    ],
    edges: [
      {
        data: {
          id: "458ddb8805094a679ea7ba61a2cca20fc05b3af05dd84476c7f7c3f4afab8b5e",
          source: "6e12a8f447f2f8f96372f53e5cea9bd7ef942918951bfc9dd83e810f2e989366",
          target: "d6314eec1c5e23db7ed74ba5a5b718aa3d12d168748ef49433df4e9166f37d51"
        }
      },
      {
        data: {
          id: "ddb5d9e72833509c111c0dbe6267a3e6e3ed8b9c25c2ff526e68f00b0586b258",
          source: "c7d7fa6dc9c429e75610e0768894b7770a8ff096e0c6ea7df5f6f7cf1ac9a6ce",
          target: "6e12a8f447f2f8f96372f53e5cea9bd7ef942918951bfc9dd83e810f2e989366"
        }
      }
    ]
  },
  meshName: "cluster.local",
  timestamp: 1789057381
};

const KIALI_NAMESPACES = [
  {
    name: "calico-apiserver",
    cluster: "Kubernetes",
    isAmbient: false,
    labels: {
      "kubernetes.io/metadata.name": "calico-apiserver",
      name: "calico-apiserver",
      "pod-security.kubernetes.io/enforce": "restricted",
      "pod-security.kubernetes.io/enforce-version": "latest"
    },
    annotations: null
  },
  {
    name: "calico-system",
    cluster: "Kubernetes",
    isAmbient: false,
    labels: {
      "kubernetes.io/metadata.name": "calico-system",
      name: "calico-system",
      "pod-security.kubernetes.io/enforce": "privileged",
      "pod-security.kubernetes.io/enforce-version": "latest"
    },
    annotations: null
  }
];

const KIALI_STATUS = {
  status: {
    "Disabled features": "",
    "Kiali commit hash": "3e2e9648e4ccd248bed20a3062a6bfbd04755de2",
    "Kiali container version": "v2.12.0",
    "Kiali state": "running",
    "Kiali version": "v2.12.0"
  },
  externalServices: [
    {
      name: "Kubernetes-Kubernetes",
      version: "v1.36.3-eks-cb19647",
      tempoConfig: {}
    },
    {
      name: "Prometheus",
      version: "2.54.1",
      tempoConfig: {}
    }
  ],
  warningMessages: [],
  istioEnvironment: {
    istioAPIEnabled: true
  }
};

const KIALI_TRACING = {
  enabled: false,
  integration: false,
  internalURL: "",
  provider: "",
  tempoConfig: {},
  url: "",
  namespaceSelector: false,
  whiteListIstioSystem: null
};

const PROMETHEUS_V1_ALERTMANAGERS = {
  status: "success",
  data: {
    activeAlertmanagers: [
      {
        url: "http://10.71.141.0:9093/alertmanager/api/v2/alerts"
      }
    ],
    droppedAlertmanagers: [
      {
        url: "http://10.71.176.90:4318/alertmanager/api/v2/alerts"
      },
      {
        url: "http://10.71.176.90:4317/alertmanager/api/v2/alerts"
      }
    ]
  }
};

const PROMETHEUS_V1_LABEL_NAME_VALUES = {
  status: "success",
  data: [
    ":node_memory_MemAvailable_bytes:sum",
    "ALERTS"
  ]
};

const PROMETHEUS_V1_QUERY = {
  status: "success",
  data: {
    resultType: "scalar",
    result: [
      1789057647.663,
      "1789057647.663"
    ]
  }
};

const PROMETHEUS_V1_RULES = {
  status: "success",
  data: {
    groups: [
      {
        name: "alertmanager.rules",
        file: "/etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0/prod-wrai-tools-platformhealth-kube-prometheus-stack-alertmanager.rules-53ddc095-9b38-46ad-a76e-e43067904c80.yaml",
        rules: [
          {
            state: "inactive",
            name: "AlertmanagerFailedReload",
            query: "max_over_time(alertmanager_config_last_reload_successful{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]) == 0",
            duration: 600,
            keepFiringFor: 0,
            labels: {
              severity: "critical"
            },
            annotations: {
              description: "Configuration has failed to load for {{ $labels.namespace }}/{{ $labels.pod}}.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/alertmanager/alertmanagerfailedreload",
              summary: "Reloading an Alertmanager configuration has failed."
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.0002606,
            lastEvaluation: "2026-09-10T16:27:05.451523705Z",
            type: "alerting"
          },
          {
            state: "inactive",
            name: "AlertmanagerMembersInconsistent",
            query: "max_over_time(alertmanager_cluster_members{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]) < on (namespace, service, cluster) group_left () count by (namespace, service, cluster) (max_over_time(alertmanager_cluster_members{job=\"kube-prometheus-stack-alertmanager\",namespace=\"prod-wrai-tools-platformhealth\"}[5m]))",
            duration: 900,
            keepFiringFor: 0,
            labels: {
              severity: "critical"
            },
            annotations: {
              description: "Alertmanager {{ $labels.namespace }}/{{ $labels.pod}} has only found {{ $value }} members of the {{$labels.job}} cluster.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/alertmanager/alertmanagermembersinconsistent",
              summary: "A member of an Alertmanager cluster has not found all other cluster members."
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.000220371,
            lastEvaluation: "2026-09-10T16:27:05.451788853Z",
            type: "alerting"
          }
        ],
        interval: 30,
        limit: 0,
        evaluationTime: 0.003591681,
        lastEvaluation: "2026-09-10T16:27:05.45149187Z"
      },
      {
        name: "config-reloaders",
        file: "/etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0/prod-wrai-tools-platformhealth-kube-prometheus-stack-config-reloaders-28627f77-f2d5-4b09-ac92-403462b51b66.yaml",
        rules: [
          {
            state: "inactive",
            name: "ConfigReloaderSidecarErrors",
            query: "max_over_time(reloader_last_reload_successful{namespace=~\".+\"}[5m]) == 0",
            duration: 600,
            keepFiringFor: 0,
            labels: {
              severity: "warning"
            },
            annotations: {
              description: "Errors encountered while the {{$labels.pod}} config-reloader sidecar attempts to sync config in {{$labels.namespace}} namespace.\nAs a result, configuration for service running in {{$labels.pod}} may be stale and cannot be updated anymore.",
              runbook_url: "https://runbooks.prometheus-operator.dev/runbooks/prometheus-operator/configreloadersidecarerrors",
              summary: "config-reloader sidecar has not had a successful reload for 10m"
            },
            alerts: [],
            health: "ok",
            evaluationTime: 0.000330908,
            lastEvaluation: "2026-09-10T16:26:52.986752822Z",
            type: "alerting"
          }
        ],
        interval: 30,
        limit: 0,
        evaluationTime: 0.000350774,
        lastEvaluation: "2026-09-10T16:26:52.986736049Z"
      }
    ]
  }
};

const PROMETHEUS_V1_SCRAPE_POOLS = {
  status: "success",
  data: {
    scrapePools: [
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/0",
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/1"
    ]
  }
};

const PROMETHEUS_V1_STATUS_BUILDINFO = {
  status: "success",
  data: {
    version: "2.54.1",
    revision: "e6cfa720fbe6280153fab13090a483dbd40bece3",
    branch: "HEAD",
    buildUser: "root@812ffd741951",
    buildDate: "20240827-10:56:41",
    goVersion: "go1.22.6"
  }
};

const PROMETHEUS_V1_STATUS_CONFIG = {
  status: "success",
  data: {
    yaml: "global:\n  scrape_interval: 30s\n  scrape_timeout: 10s\n  scrape_protocols:\n  - OpenMetricsText1.0.0\n  - OpenMetricsText0.0.1\n  - PrometheusText0.0.4\n  evaluation_interval: 30s\n  external_labels:\n    prometheus: prod-wrai-tools-platformhealth/kube-prometheus-stack-prometheus\n    prometheus_replica: prometheus-kube-prometheus-stack-prometheus-0\nruntime:\n  gogc: 75\nalerting:\n  alert_relabel_configs:\n  …"
  }
};

const PROMETHEUS_V1_STATUS_FLAGS = {
  status: "success",
  data: {
    "alertmanager.drain-notification-queue-on-shutdown": "true",
    "alertmanager.notification-queue-capacity": "10000",
    "alertmanager.timeout": "",
    "auto-gomemlimit.ratio": "0.9",
    "config.file": "/etc/prometheus/config_out/prometheus.env.yaml"
  }
};

const PROMETHEUS_V1_STATUS_RUNTIMEINFO = {
  status: "success",
  data: {
    startTime: "2026-08-28T13:49:04.100616589Z",
    CWD: "/prometheus",
    reloadConfigSuccess: true,
    lastConfigTime: "2026-08-28T13:59:09Z",
    corruptionCount: 0,
    goroutineCount: 641,
    GOMAXPROCS: 8,
    GOMEMLIMIT: 9223372036854776000,
    GOGC: "75",
    GODEBUG: "",
    storageRetention: "10d or 25GiB"
  }
};

const PROMETHEUS_V1_STATUS_TSDB = {
  status: "success",
  data: {
    headStats: {
      numSeries: 390577,
      numLabelPairs: 18484,
      chunkCount: 1265028,
      minTime: 1789048800002,
      maxTime: 1789057622118
    },
    seriesCountByMetricName: [
      {
        name: "apiserver_request_duration_seconds_bucket",
        value: 12078
      },
      {
        name: "kubernetes_feature_enabled",
        value: 11204
      }
    ],
    labelValueCountByLabelName: [
      {
        name: "__name__",
        value: 2148
      },
      {
        name: "name",
        value: 1888
      }
    ],
    memoryInBytesByLabelName: [
      {
        name: "__name__",
        value: 14439316
      },
      {
        name: "id",
        value: 12443108
      }
    ],
    seriesCountByLabelValuePair: [
      {
        name: "service=kube-prometheus-stack-kubelet",
        value: 134397
      },
      {
        name: "job=kubelet",
        value: 134203
      }
    ]
  }
};

const PROMETHEUS_V1_TARGETS = {
  status: "success",
  data: {
    activeTargets: [
      {
        discoveredLabels: {
          __address__: "10.71.141.0:9093",
          __meta_kubernetes_endpoint_address_target_kind: "Pod",
          __meta_kubernetes_endpoint_address_target_name: "alertmanager-kube-prometheus-stack-alertmanager-0",
          __meta_kubernetes_endpoint_node_name: "ip-10-71-153-138.us-east-2.compute.internal",
          __meta_kubernetes_endpoint_port_name: "http-web"
        },
        labels: {
          container: "alertmanager",
          endpoint: "http-web",
          instance: "10.71.141.0:9093",
          job: "kube-prometheus-stack-alertmanager",
          namespace: "prod-wrai-tools-platformhealth",
          pod: "alertmanager-kube-prometheus-stack-alertmanager-0",
          service: "kube-prometheus-stack-alertmanager"
        },
        scrapePool: "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/0",
        scrapeUrl: "http://10.71.141.0:9093/alertmanager/metrics",
        globalUrl: "http://10.71.141.0:9093/alertmanager/metrics",
        lastError: "",
        lastScrape: "2026-09-10T16:27:05.313525191Z",
        lastScrapeDuration: 0.003092755,
        health: "up",
        scrapeInterval: "30s",
        scrapeTimeout: "10s"
      },
      {
        discoveredLabels: {
          __address__: "10.71.141.0:8080",
          __meta_kubernetes_endpoint_address_target_kind: "Pod",
          __meta_kubernetes_endpoint_address_target_name: "alertmanager-kube-prometheus-stack-alertmanager-0",
          __meta_kubernetes_endpoint_node_name: "ip-10-71-153-138.us-east-2.compute.internal",
          __meta_kubernetes_endpoint_port_name: "reloader-web"
        },
        labels: {
          container: "config-reloader",
          endpoint: "reloader-web",
          instance: "10.71.141.0:8080",
          job: "kube-prometheus-stack-alertmanager",
          namespace: "prod-wrai-tools-platformhealth",
          pod: "alertmanager-kube-prometheus-stack-alertmanager-0",
          service: "kube-prometheus-stack-alertmanager"
        },
        scrapePool: "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/1",
        scrapeUrl: "http://10.71.141.0:8080/metrics",
        globalUrl: "http://10.71.141.0:8080/metrics",
        lastError: "",
        lastScrape: "2026-09-10T16:27:05.07340876Z",
        lastScrapeDuration: 0.002091852,
        health: "up",
        scrapeInterval: "30s",
        scrapeTimeout: "10s"
      }
    ],
    droppedTargets: [
      {
        discoveredLabels: {
          __address__: "10.71.159.50:3100",
          __meta_kubernetes_endpoint_address_target_kind: "Pod",
          __meta_kubernetes_endpoint_address_target_name: "loki-write-2",
          __meta_kubernetes_endpoint_node_name: "ip-10-71-171-75.us-east-2.compute.internal",
          __meta_kubernetes_endpoint_port_name: "http-metrics"
        }
      },
      {
        discoveredLabels: {
          __address__: "10.71.180.69:3100",
          __meta_kubernetes_endpoint_address_target_kind: "Pod",
          __meta_kubernetes_endpoint_address_target_name: "loki-write-0",
          __meta_kubernetes_endpoint_node_name: "ip-10-71-182-157.us-east-2.compute.internal",
          __meta_kubernetes_endpoint_port_name: "http-metrics"
        }
      }
    ],
    droppedTargetCounts: {
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/0": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-alertmanager/1": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-apiserver/0": 0,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-coredns/0": 105,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-grafana/0": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kube-etcd/0": 107,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kube-proxy/0": 85,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kube-scheduler/0": 107,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kube-state-metrics/0": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kubelet/0": 85,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kubelet/1": 85,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-kubelet/2": 85,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-operator/0": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-prometheus-node-exporter/0": 124,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-prometheus/0": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/kube-prometheus-stack-prometheus/1": 145,
      "serviceMonitor/prod-wrai-tools-platformhealth/servicemonitor-cluster-autoscaler-cert-manager/0": 3,
      "serviceMonitor/prod-wrai-tools-platformhealth/servicemonitor-cluster-autoscaler-cluster-autoscaler/0": 106,
      "serviceMonitor/prod-wrai-tools-platformhealth/servicemonitor-cluster-autoscaler-loki/0": 122
    }
  }
};

const TRACING_DEPENDENCIES = {
  data: [
    {
      parent: "api-gateway",
      child: "target-control",
      callCount: 1
    },
    {
      parent: "api-gateway",
      child: "auth-microservice",
      callCount: 18
    }
  ],
  total: 0,
  limit: 0,
  offset: 0,
  errors: null
};

const TRACING_METRICS_CALLS = "{\"data\":null,\"total\":0,\"limit\":0,\"offset\":0,\"errors\":[{\"code\":501,\"msg\":\"metrics querying is currently disabled\"}]}";

const TRACING_METRICS_ERRORS = "{\"data\":null,\"total\":0,\"limit\":0,\"offset\":0,\"errors\":[{\"code\":501,\"msg\":\"metrics querying is currently disabled\"}]}";

const TRACING_METRICS_LATENCIES = "{\"data\":null,\"total\":0,\"limit\":0,\"offset\":0,\"errors\":[{\"code\":501,\"msg\":\"metrics querying is currently disabled\"}]}";

const TRACING_SERVICES = {
  data: [
    "api-gateway",
    "auth-microservice"
  ],
  total: 11,
  limit: 0,
  offset: 0,
  errors: null
};

const TRACING_SERVICES_BY_OPERATIONS = {
  data: [
    "HTTP GET /auth/users/all/settings/p51bz$%7B325*514%7Dl5ngv",
    "HTTP GET /auth15319292'%20or%20'4218'%3D'4218'/groups"
  ],
  total: 7554,
  limit: 0,
  offset: 0,
  errors: null
};

const TRACING_TRACES = {
  data: [
    {
      traceID: "1a922561051f674348db8cae7c6e0063",
      spans: [
        {
          traceID: "1a922561051f674348db8cae7c6e0063",
          spanID: "142f34f7be5d6ab4",
          operationName: "HTTP GET /auth/users/me/authorize",
          references: [],
          startTime: 1789057310707000,
          duration: 37359,
          tags: [
            {
              key: "otel.scope.name",
              type: "string",
              value: "um-gateway"
            },
            {
              key: "correlation.id",
              type: "string",
              value: "b6f3fe1e-b71b-4991-8fab-a3fc755d8689"
            }
          ],
          logs: [],
          processID: "p1",
          warnings: null
        },
        {
          traceID: "1a922561051f674348db8cae7c6e0063",
          spanID: "691d78bb7ac720df",
          operationName: "Middleware Authentication GET /auth/users/me/authorize",
          references: [
            {
              refType: "CHILD_OF",
              traceID: "1a922561051f674348db8cae7c6e0063",
              spanID: "142f34f7be5d6ab4"
            }
          ],
          startTime: 1789057310707000,
          duration: 20027,
          tags: [
            {
              key: "otel.scope.name",
              type: "string",
              value: "api-gateway-auth"
            },
            {
              key: "middleware.name",
              type: "string",
              value: "Authentication"
            }
          ],
          logs: [],
          processID: "p1",
          warnings: null
        }
      ],
      processes: {
        p1: {
          serviceName: "api-gateway",
          tags: [
            {
              key: "host.arch",
              type: "string",
              value: "amd64"
            },
            {
              key: "host.name",
              type: "string",
              value: "um-gateway-7469b778fc-qbdxv"
            }
          ]
        },
        p2: {
          serviceName: "auth-microservice",
          tags: [
            {
              key: "host.arch",
              type: "string",
              value: "amd64"
            },
            {
              key: "host.name",
              type: "string",
              value: "um-auth-8887cc698-srkkb"
            }
          ]
        },
        p3: {
          serviceName: "auth-microservice",
          tags: [
            {
              key: "host.arch",
              type: "string",
              value: "amd64"
            },
            {
              key: "host.name",
              type: "string",
              value: "um-auth-8887cc698-d4ppj"
            }
          ]
        }
      },
      warnings: null
    },
    {
      traceID: "b218aa11c9a0eb7f36d8fe9a7ef91103",
      spans: [
        {
          traceID: "b218aa11c9a0eb7f36d8fe9a7ef91103",
          spanID: "7e84f25ec45a09dc",
          operationName: "HTTP GET /auth/users/me/authorize",
          references: [],
          startTime: 1789057310574000,
          duration: 19500,
          tags: [
            {
              key: "otel.scope.name",
              type: "string",
              value: "um-gateway"
            },
            {
              key: "correlation.id",
              type: "string",
              value: "1dd04b7c-5a5e-4826-99b9-2b539df7e1c3"
            }
          ],
          logs: [],
          processID: "p1",
          warnings: null
        },
        {
          traceID: "b218aa11c9a0eb7f36d8fe9a7ef91103",
          spanID: "e6ffb55dbf0d024e",
          operationName: "Middleware Authentication GET /auth/users/me/authorize",
          references: [
            {
              refType: "CHILD_OF",
              traceID: "b218aa11c9a0eb7f36d8fe9a7ef91103",
              spanID: "7e84f25ec45a09dc"
            }
          ],
          startTime: 1789057310575000,
          duration: 11343,
          tags: [
            {
              key: "otel.scope.name",
              type: "string",
              value: "api-gateway-auth"
            },
            {
              key: "middleware.name",
              type: "string",
              value: "Authentication"
            }
          ],
          logs: [],
          processID: "p1",
          warnings: null
        }
      ],
      processes: {
        p1: {
          serviceName: "api-gateway",
          tags: [
            {
              key: "host.arch",
              type: "string",
              value: "amd64"
            },
            {
              key: "host.name",
              type: "string",
              value: "um-gateway-7469b778fc-p99ht"
            }
          ]
        },
        p2: {
          serviceName: "auth-microservice",
          tags: [
            {
              key: "host.arch",
              type: "string",
              value: "amd64"
            },
            {
              key: "host.name",
              type: "string",
              value: "um-auth-8887cc698-d4ppj"
            }
          ]
        }
      },
      warnings: null
    }
  ],
  total: 0,
  limit: 0,
  offset: 0,
  errors: null
};

/**
 * Grafana serves plugin logos as SVG, not JSON — 189 of them in the capture,
 * 2.8 MB in total. One neutral placeholder stands in for all of them.
 */
const GRAFANA_PLUGIN_LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<rect width="24" height="24" rx="4" fill="#006e90"/></svg>';

module.exports = {
  GRAFANA_DASHBOARD_SNAPSHOTS,
  GRAFANA_DASHBOARDS_HOME,
  GRAFANA_DASHBOARDS_PUBLIC_DASHBOARDS,
  GRAFANA_DASHBOARDS_TAGS,
  GRAFANA_DATASOURCES,
  GRAFANA_DATASOURCES_CORRELATIONS,
  GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABEL_NAME_VALUES,
  GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_LABELS,
  GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_METADATA,
  GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_QUERY_EXEMPLARS,
  GRAFANA_DATASOURCES_UID_BY_RESOURCES_API_V1_RULES,
  GRAFANA_FOLDERS,
  GRAFANA_FOLDERS_GENERAL,
  GRAFANA_GNET_PLUGINS,
  GRAFANA_LIBRARY_ELEMENTS,
  GRAFANA_PLUGINS,
  GRAFANA_PLUGINS_BY_SETTINGS,
  GRAFANA_PLUGINS_ERRORS,
  GRAFANA_PROMETHEUS_GRAFANA_API_V1_RULES,
  GRAFANA_SEARCH,
  GRAFANA_SEARCH_SORTING,
  GRAFANA_USER_ORGS,
  GRAFANA_USER_PREFERENCES,
  KIALI_AUTH_INFO,
  KIALI_CLUSTERS_APPS,
  KIALI_CLUSTERS_HEALTH,
  KIALI_CLUSTERS_SERVICES,
  KIALI_CLUSTERS_TLS,
  KIALI_CLUSTERS_WORKLOADS,
  KIALI_CONFIG,
  KIALI_CRIPPLED,
  KIALI_GRAFANA,
  KIALI_ISTIO_CONFIG,
  KIALI_ISTIO_STATUS,
  KIALI_ISTIO_VALIDATIONS,
  KIALI_MESH_CONTROLPLANES,
  KIALI_MESH_GRAPH,
  KIALI_NAMESPACES,
  KIALI_STATUS,
  KIALI_TRACING,
  PROMETHEUS_V1_ALERTMANAGERS,
  PROMETHEUS_V1_LABEL_NAME_VALUES,
  PROMETHEUS_V1_QUERY,
  PROMETHEUS_V1_RULES,
  PROMETHEUS_V1_SCRAPE_POOLS,
  PROMETHEUS_V1_STATUS_BUILDINFO,
  PROMETHEUS_V1_STATUS_CONFIG,
  PROMETHEUS_V1_STATUS_FLAGS,
  PROMETHEUS_V1_STATUS_RUNTIMEINFO,
  PROMETHEUS_V1_STATUS_TSDB,
  PROMETHEUS_V1_TARGETS,
  TRACING_DEPENDENCIES,
  TRACING_METRICS_CALLS,
  TRACING_METRICS_ERRORS,
  TRACING_METRICS_LATENCIES,
  TRACING_SERVICES,
  TRACING_SERVICES_BY_OPERATIONS,
  TRACING_TRACES,
  GRAFANA_PLUGIN_LOGO,
};
