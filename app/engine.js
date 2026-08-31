/**
 * GENERATED FILE — do not edit.
 *
 * Built from packages/matching/src by scripts/build-engine.js.
 * Edit the source and run `npm run build:engine`. The tests run against the
 * source, so a hand-edit here would be untested code shipping to users.
 */
(function (root) {
  'use strict';

  const ALIASES = {
  "_comment": "Skill aliases. THE MATCHER LIVES OR DIES HERE: if a resume says 'k8s' and a posting says 'Kubernetes' and this file does not connect them, every number downstream is wrong. Data, not code, so it can be extended without a release. Canonical name -> every form seen in the wild.",
  "_format": "canonical: [alias, ...]. Matching is case-insensitive and punctuation-insensitive; do not add case variants.",
  "_ambiguous": {
    "go": [
      "golang",
      "go lang",
      "go programming"
    ],
    "c": [
      "c programming",
      "ansi c",
      "embedded c"
    ],
    "r": [
      "r language",
      "rstudio",
      "r studio"
    ],
    "swift": [
      "swiftui",
      "swift ios"
    ],
    "rust": [
      "rust lang",
      "rustlang"
    ],
    "spring": [
      "spring boot",
      "springboot"
    ],
    "express": [
      "express.js",
      "expressjs"
    ],
    "safe": [
      "scaled agile framework",
      "pi planning"
    ],
    "dart": [
      "dart lang",
      "dart sdk",
      "flutter"
    ],
    "sap": [
      "sap erp",
      "s/4hana",
      "sap hana"
    ]
  },
  "kubernetes": [
    "k8s",
    "kube"
  ],
  "docker": [
    "containerisation",
    "containerization",
    "docker containers"
  ],
  "amazon web services": [
    "aws",
    "amazon aws"
  ],
  "microsoft azure": [
    "azure",
    "ms azure",
    "windows azure"
  ],
  "google cloud platform": [
    "gcp",
    "google cloud"
  ],
  "microsoft entra id": [
    "azure ad",
    "azure active directory",
    "aad",
    "entra"
  ],
  "active directory": [
    "ad ds",
    "windows active directory",
    "on-prem ad"
  ],
  "microsoft intune": [
    "intune",
    "endpoint manager",
    "mem",
    "microsoft endpoint manager"
  ],
  "microsoft defender": [
    "defender",
    "defender for endpoint",
    "mde",
    "windows defender"
  ],
  "microsoft 365": [
    "m365",
    "o365",
    "office 365",
    "microsoft office 365"
  ],
  "powershell": [
    "ps1",
    "windows powershell"
  ],
  "javascript": [
    "js",
    "ecmascript",
    "es6",
    "es2015"
  ],
  "typescript": [
    "ts"
  ],
  "python": [
    "python3",
    "py"
  ],
  "c#": [
    "c sharp",
    "csharp",
    "dotnet c#"
  ],
  ".net": [
    "dotnet",
    "dot net",
    ".net core",
    "asp.net"
  ],
  "sql": [
    "t-sql",
    "tsql",
    "structured query language"
  ],
  "postgresql": [
    "postgres",
    "psql"
  ],
  "microsoft sql server": [
    "mssql",
    "sql server"
  ],
  "mysql": [
    "maria db",
    "mariadb"
  ],
  "terraform": [
    "hashicorp terraform",
    "iac terraform"
  ],
  "ansible": [
    "red hat ansible"
  ],
  "ci/cd": [
    "cicd",
    "continuous integration",
    "continuous delivery",
    "continuous deployment",
    "build pipeline"
  ],
  "github actions": [
    "gh actions"
  ],
  "azure devops": [
    "ado",
    "vsts",
    "tfs",
    "team foundation server"
  ],
  "jenkins": [],
  "git": [
    "version control",
    "source control"
  ],
  "linux": [
    "unix",
    "rhel",
    "red hat enterprise linux",
    "ubuntu server",
    "centos"
  ],
  "windows server": [
    "win server",
    "windows server administration"
  ],
  "vmware": [
    "vsphere",
    "esxi",
    "vcenter"
  ],
  "hyper-v": [
    "hyperv",
    "microsoft hyper-v"
  ],
  "networking": [
    "tcp/ip",
    "tcpip",
    "lan",
    "wan",
    "routing and switching"
  ],
  "cisco": [
    "ios-xe",
    "cisco ios"
  ],
  "firewall": [
    "firewalls",
    "palo alto",
    "fortinet",
    "fortigate",
    "checkpoint",
    "asa"
  ],
  "vpn": [
    "virtual private network",
    "ipsec",
    "ssl vpn"
  ],
  "siem": [
    "security information and event management",
    "splunk",
    "sentinel",
    "microsoft sentinel",
    "qradar",
    "log analytics",
    "splunk enterprise",
    "spl"
  ],
  "kql": [
    "kusto",
    "kusto query language"
  ],
  "soc": [
    "security operations centre",
    "security operations center"
  ],
  "incident response": [
    "ir",
    "dfir",
    "digital forensics and incident response"
  ],
  "penetration testing": [
    "pen testing",
    "pentest",
    "pentesting",
    "ethical hacking"
  ],
  "vulnerability management": [
    "vuln management",
    "patch management",
    "nessus",
    "qualys",
    "tenable"
  ],
  "iso 27001": [
    "iso27001",
    "isms",
    "iso/iec 27001"
  ],
  "essential eight": [
    "essential 8",
    "e8",
    "acsc essential eight"
  ],
  "nist": [
    "nist csf",
    "nist cybersecurity framework",
    "nist 800-53"
  ],
  "itil": [
    "itil v4",
    "itil 4",
    "service management"
  ],
  "servicenow": [
    "snow",
    "service now"
  ],
  "jira": [
    "atlassian jira"
  ],
  "confluence": [
    "atlassian confluence"
  ],
  "agile": [
    "agile delivery"
  ],
  "react": [
    "react.js",
    "reactjs"
  ],
  "node.js": [
    "node",
    "nodejs"
  ],
  "rest api": [
    "restful api",
    "rest apis",
    "web api",
    "api development"
  ],
  "power bi": [
    "powerbi",
    "microsoft power bi"
  ],
  "excel": [
    "microsoft excel",
    "advanced excel"
  ],
  "sharepoint": [
    "microsoft sharepoint",
    "sharepoint online"
  ],
  "backup and recovery": [
    "veeam",
    "backup",
    "disaster recovery",
    "dr",
    "bcp"
  ],
  "help desk": [
    "helpdesk",
    "service desk",
    "desktop support",
    "level 1 support",
    "l1 support",
    "level 2 support",
    "l2 support"
  ],
  "java": [
    "java se",
    "java ee",
    "j2ee",
    "core java"
  ],
  "go": [
    "golang",
    "go lang",
    "go programming"
  ],
  "rust": [
    "rust lang",
    "rustlang"
  ],
  "php": [
    "php8",
    "php 8"
  ],
  "ruby": [
    "ruby on rails",
    "rails",
    "ror"
  ],
  "kotlin": [
    "kotlin jvm"
  ],
  "swift": [
    "swiftui",
    "swift ios"
  ],
  "scala": [
    "scala jvm"
  ],
  "c++": [
    "cpp",
    "c plus plus"
  ],
  "c": [
    "c programming",
    "ansi c",
    "embedded c"
  ],
  "r": [
    "r language",
    "rstudio",
    "r studio"
  ],
  "matlab": [
    "mat lab"
  ],
  "bash": [
    "shell scripting",
    "shell script",
    "sh scripting",
    "zsh"
  ],
  "perl": [],
  "dart": [
    "dart lang"
  ],
  "angular": [
    "angularjs",
    "angular 2+"
  ],
  "vue.js": [
    "vue",
    "vuejs",
    "vue 3"
  ],
  "svelte": [
    "sveltekit"
  ],
  "next.js": [
    "nextjs",
    "next js"
  ],
  "html": [
    "html5"
  ],
  "css": [
    "css3",
    "scss",
    "sass",
    "tailwind",
    "tailwind css"
  ],
  "webpack": [
    "vite",
    "rollup",
    "bundler"
  ],
  "redux": [
    "state management"
  ],
  "jquery": [],
  "accessibility": [
    "wcag",
    "a11y",
    "screen reader",
    "aria"
  ],
  "react native": [
    "reactnative",
    "rn"
  ],
  "flutter": [
    "flutter sdk"
  ],
  "android": [
    "android sdk",
    "android studio"
  ],
  "ios": [
    "xcode",
    "ios development"
  ],
  "graphql": [
    "apollo",
    "graph ql"
  ],
  "grpc": [
    "protocol buffers",
    "protobuf"
  ],
  "microservices": [
    "micro services",
    "service oriented architecture",
    "soa"
  ],
  "django": [
    "django rest framework",
    "drf"
  ],
  "flask": [
    "flask api"
  ],
  "fastapi": [
    "fast api"
  ],
  "spring": [
    "spring boot",
    "springboot"
  ],
  "express": [
    "express.js",
    "expressjs"
  ],
  "laravel": [],
  "redis": [
    "redis cache",
    "elasticache"
  ],
  "valkey": [
    "valkey server"
  ],
  "memcached": [
    "memcache"
  ],
  "mongodb": [
    "mongo",
    "documentdb"
  ],
  "cassandra": [
    "scylladb",
    "scylla"
  ],
  "elasticsearch": [
    "elastic search",
    "opensearch",
    "elk",
    "elk stack"
  ],
  "dynamodb": [
    "dynamo db",
    "dynamo"
  ],
  "oracle database": [
    "oracle db",
    "plsql",
    "pl/sql"
  ],
  "sqlite": [
    "sql lite"
  ],
  "neo4j": [
    "graph database",
    "cypher"
  ],
  "kafka": [
    "apache kafka",
    "confluent",
    "event streaming"
  ],
  "rabbitmq": [
    "rabbit mq",
    "amqp"
  ],
  "sqs": [
    "amazon sqs",
    "simple queue service"
  ],
  "apache spark": [
    "spark",
    "pyspark"
  ],
  "databricks": [
    "data bricks"
  ],
  "snowflake": [
    "snowflake data cloud"
  ],
  "dbt": [
    "data build tool"
  ],
  "apache airflow": [
    "airflow",
    "dag orchestration"
  ],
  "etl": [
    "elt",
    "data pipeline",
    "data pipelines",
    "data ingestion"
  ],
  "tableau": [],
  "looker": [
    "looker studio",
    "data studio"
  ],
  "data warehousing": [
    "data warehouse",
    "bigquery",
    "redshift",
    "synapse"
  ],
  "pandas": [
    "numpy",
    "dataframes"
  ],
  "machine learning": [
    "ml",
    "predictive modelling",
    "predictive modeling"
  ],
  "deep learning": [
    "neural networks",
    "pytorch",
    "tensorflow",
    "keras"
  ],
  "natural language processing": [
    "nlp",
    "text mining"
  ],
  "computer vision": [
    "opencv",
    "image recognition"
  ],
  "mlops": [
    "ml ops",
    "model deployment",
    "mlflow"
  ],
  "large language models": [
    "llm",
    "llms",
    "genai",
    "generative ai",
    "prompt engineering",
    "rag"
  ],
  "serverless": [
    "aws lambda",
    "lambda",
    "azure functions",
    "cloud functions"
  ],
  "helm": [
    "helm charts"
  ],
  "istio": [
    "service mesh",
    "linkerd"
  ],
  "openshift": [
    "red hat openshift",
    "okd"
  ],
  "cloudformation": [
    "cloud formation",
    "cdk",
    "aws cdk"
  ],
  "pulumi": [],
  "gitlab ci": [
    "gitlab",
    "gitlab pipelines"
  ],
  "argo cd": [
    "argocd",
    "gitops",
    "flux cd"
  ],
  "nginx": [
    "reverse proxy",
    "load balancing"
  ],
  "apache http server": [
    "apache2",
    "httpd"
  ],
  "prometheus": [
    "promql"
  ],
  "grafana": [
    "grafana dashboards"
  ],
  "datadog": [
    "data dog"
  ],
  "new relic": [
    "newrelic"
  ],
  "opentelemetry": [
    "open telemetry",
    "otel",
    "distributed tracing"
  ],
  "observability": [
    "monitoring and alerting",
    "apm",
    "application performance monitoring"
  ],
  "unit testing": [
    "jest",
    "pytest",
    "junit",
    "nunit",
    "xunit",
    "test driven development",
    "tdd"
  ],
  "playwright": [
    "puppeteer"
  ],
  "selenium": [
    "webdriver"
  ],
  "cypress": [
    "cypress.io"
  ],
  "performance testing": [
    "load testing",
    "jmeter",
    "k6",
    "gatling"
  ],
  "quality assurance": [
    "qa",
    "test automation",
    "automated testing"
  ],
  "sap": [
    "sap erp",
    "s/4hana",
    "sap hana"
  ],
  "salesforce": [
    "sfdc",
    "apex",
    "sales cloud",
    "service cloud"
  ],
  "workday": [
    "workday hcm"
  ],
  "dynamics 365": [
    "ms dynamics",
    "d365"
  ],
  "power platform": [
    "power automate",
    "power apps",
    "powerapps"
  ],
  "xero": [
    "myob"
  ],
  "zero trust": [
    "zta",
    "least privilege"
  ],
  "iam": [
    "identity and access management",
    "rbac",
    "sso",
    "single sign on",
    "oauth",
    "saml",
    "oidc"
  ],
  "cryptography": [
    "encryption",
    "pki",
    "tls",
    "certificate management"
  ],
  "devsecops": [
    "dev sec ops",
    "sast",
    "dast",
    "supply chain security"
  ],
  "soc 2": [
    "soc2",
    "soc ii"
  ],
  "gdpr": [
    "privacy act",
    "data privacy",
    "apps",
    "australian privacy principles"
  ],
  "threat modelling": [
    "threat modeling",
    "stride",
    "attack surface"
  ],
  "scrum": [
    "scrum master",
    "sprint planning",
    "ceremonies"
  ],
  "kanban": [
    "wip limits"
  ],
  "safe": [
    "scaled agile framework",
    "pi planning"
  ],
  "stakeholder management": [
    "stakeholder engagement",
    "business partnering"
  ],
  "technical writing": [
    "documentation",
    "runbooks",
    "knowledge base articles"
  ],
  "mentoring": [
    "coaching",
    "onboarding engineers",
    "technical leadership"
  ],
  "code review": [
    "peer review",
    "pull request review"
  ],
  "architecture": [
    "solution architecture",
    "system design",
    "technical design"
  ]
}
;

  // ---- packages/matching/src/skills.js
/**
 * skills.js — normalise and match skills.
 *
 * THE WHOLE MATCHER RESTS ON THIS FILE. If a resume says "k8s" and a posting
 * says "Kubernetes" and these do not resolve to the same thing, every number
 * downstream is wrong — and wrong in the direction that tells someone they are
 * unqualified for a job they can do.
 *
 * The alias table is DATA (data/skill-aliases.json), not code, so it can grow
 * without a release and a user can extend it. Fuzzy string similarity is a
 * fallback AFTER the alias check, never instead of it: "Java" and "JavaScript"
 * are 80% similar as strings and completely different as skills, which is
 * exactly the mistake fuzzy-first matching makes.
 */


/** Lower-case, strip punctuation, collapse whitespace. Keeps + and # — c++ and c# are real. */
function normalise(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** alias -> canonical, built once. */
const LOOKUP = (() => {
  const map = new Map();
  for (const canonical of Object.keys(ALIASES)) {
    if (canonical.startsWith('_')) continue; // _comment, _format, _ambiguous
    map.set(normalise(canonical), canonical);
    for (const alias of ALIASES[canonical]) map.set(normalise(alias), canonical);
  }
  return map;
})();

/** The canonical name for a skill, or the normalised input when unknown. */
function canonicalise(skill) {
  const n = normalise(skill);
  return LOOKUP.get(n) || n;
}

/** Is this skill known to the dictionary at all? */
function isKnown(skill) {
  return LOOKUP.has(normalise(skill));
}

/**
 * Find every known skill mentioned in a block of free text.
 *
 * Matches on word boundaries so "ad" does not fire inside "advanced" and
 * "go" does not fire inside "government" — the failure that makes naive
 * substring extraction useless on real resumes.
 */
/**
 * Skill names that are also ordinary English words.
 *
 * "Go" is the clearest case: a resume saying "go live", "go to market" or
 * "ready to go" would otherwise be credited with the Go programming language,
 * and the applicant would be matched to jobs they cannot do. The same applies
 * to "R", "C" and "Swift".
 *
 * These are not dropped — that would lose every genuine mention. They are
 * accepted only with corroboration, which is either:
 *
 *   (a) an unambiguous form appearing anywhere in the same text ("golang"), or
 *   (b) the term appearing inside a delimited list, which is what a skills
 *       section looks like: "Go, Python, Rust" or a bullet that is just "Go".
 *
 * Prose can produce (b) only by accident and rarely does; a skills list
 * produces it always. That asymmetry is the whole trick.
 */
const AMBIGUOUS = ALIASES._ambiguous || {};

function inListContext(raw, esc) {
  // MUST run on the raw text, not the normalised text. normalise() strips
  // punctuation and collapses whitespace, so by the time text reaches the
  // matcher "Skills: Go, Python, Rust" has become "skills go python rust" —
  // every delimiter this function looks for has already been deleted. Testing
  // the normalised string here made the list case unreachable, which is the
  // only case that lets a bare "Go" through at all.
  const D = '(?:^|[,;:/|•·\\-\\n\\t]|\\s{2,})\\s*';
  const E = '\\s*(?:$|[,;:/|•·\\n\\t]|\\s{2,})';
  return new RegExp(D + esc + E, 'im').test(String(raw).toLowerCase());
}

function extractSkills(text) {
  const hay = normalise(text);
  const found = new Set();

  // Corroborating forms present anywhere in this text.
  const corroborated = new Set();
  for (const [canonical, unambiguous] of Object.entries(AMBIGUOUS)) {
    for (const form of unambiguous) {
      if (hay.indexOf(normalise(form)) !== -1) {
        corroborated.add(canonical);
        break;
      }
    }
  }

  for (const [alias, canonical] of LOOKUP) {
    if (!alias) continue;
    // Escape regex metacharacters — c++, c#, .net and ci/cd all contain them.
    const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // \b is useless here: it treats +, # and . as boundaries, so "c" would
    // match inside "c++". These lookarounds do the job properly.
    //
    // The subtlety is the full stop. It has to be a boundary — "deployed to
    // AWS." is how people actually write — but NOT when it joins a name, or
    // "node" would match inside "node.js" and shadow the longer alias. So a
    // period only counts as part of the token when a letter or digit follows
    // it. An earlier version simply excluded '.' from the boundary set and
    // silently missed every skill that ended a sentence.
    const re = new RegExp(
      '(?<![a-z0-9+#])(?<![a-z0-9]\\.)' + esc + '(?![a-z0-9+#])(?!\\.[a-z0-9])',
      'i'
    );
    if (!re.test(hay)) continue;

    // An ambiguous canonical needs corroboration, unless the alias that
    // matched was itself one of the unambiguous forms.
    if (AMBIGUOUS[canonical] && !corroborated.has(canonical)) {
      const unambiguousAlias = AMBIGUOUS[canonical].some((f) => normalise(f) === alias);
      if (!unambiguousAlias && !inListContext(text, esc)) continue;
    }

    found.add(canonical);
  }
  return [...found].sort();
}

/**
 * Compare a candidate's skills against what a job asks for.
 *
 * Required and preferred are kept apart throughout. Missing a required skill
 * is a different problem from missing a preferred one, and collapsing them
 * into one "missing" list is how a tool ends up telling someone not to apply
 * for a job they would get.
 */
function matchSkills(candidateSkills, jobRequired, jobPreferred) {
  const have = new Set((candidateSkills || []).map(canonicalise));
  const required = [...new Set((jobRequired || []).map(canonicalise))];
  const preferred = [...new Set((jobPreferred || []).map(canonicalise))].filter((s) => !required.includes(s));

  const matchedRequired = required.filter((s) => have.has(s));
  const missingRequired = required.filter((s) => !have.has(s));
  const matchedPreferred = preferred.filter((s) => have.has(s));
  const missingPreferred = preferred.filter((s) => !have.has(s));

  return {
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    // Ratios are reported, never used as the headline. A job listing three
    // skills against a candidate listing thirty is not "1000% matched".
    requiredRatio: required.length ? matchedRequired.length / required.length : 1,
    preferredRatio: preferred.length ? matchedPreferred.length / preferred.length : 1
  };
}


/**
 * The word a piece of text actually uses for this skill.
 *
 * Canonical names are for matching, not for reading. The dictionary resolves
 * "Splunk" to the canonical "siem", so anything that shows a canonical name
 * back to a user writes "Siem" where the advertisement said Splunk — wrong,
 * and obviously machine-written.
 *
 * This lives here rather than in a generator because the same bug appeared
 * independently in the cover letter and again in the interview prep. A defect
 * that recurs in a second module is a missing abstraction, not bad luck.
 *
 * Longest form first, so "amazon web services" wins over "aws" when a document
 * contains both.
 */
function surfaceForm(canonical, text, fallback) {
  const c = canonicalise(canonical);
  if (!text) return fallback === undefined ? c : fallback;
  const forms = [c].concat(ALIASES[c] || []).sort((a, b) => b.length - a.length);
  for (const f of forms) {
    const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = String(text).match(new RegExp('(?<![a-z0-9+#])' + esc + '(?![a-z0-9+#])', 'i'));
    if (m) return m[0];
  }
  return fallback === undefined ? c : fallback;
}


/**
 * Split a job ad's skills into required and preferred.
 *
 * WHY THIS EXISTS. Reading every skill out of an ad as "required" produces the
 * single worst failure this tool can have: telling someone a nice-to-have
 * blocks them. An ad saying "Azure, Defender and SIEM essential. KQL a plus."
 * must not report KQL as a gate.
 *
 * It is deliberately crude and its limits are stated rather than hidden: it
 * looks for preference markers and treats everything from the first marker
 * onward as preferred. Ads that interleave the two, or that bury a
 * nice-to-have in a paragraph of essentials, will be read wrongly — which is
 * why the UI lets the user override the lists by hand.
 */
const PREFERRED_MARKERS = [
  'a plus', 'nice to have', 'nice-to-have', 'desirable', 'preferred', 'preferably',
  'bonus', 'advantageous', 'an advantage', 'would be great', 'ideally', 'highly regarded',
  'well regarded', 'not essential', 'beneficial'
];

function parseJobSkills(text) {
  const raw = String(text == null ? '' : text);
  const lower = raw.toLowerCase();

  // The earliest marker wins — everything after it is treated as preference.
  let cut = -1;
  for (const marker of PREFERRED_MARKERS) {
    const at = lower.indexOf(marker);
    if (at !== -1 && (cut === -1 || at < cut)) cut = at;
  }

  if (cut === -1) {
    return { required: extractSkills(raw), preferred: [], splitAt: null };
  }

  // Back up to the start of the sentence carrying the marker, so "KQL a plus"
  // puts KQL on the preferred side rather than leaving it with the essentials.
  const boundary = Math.max(
    raw.lastIndexOf('.', cut),
    raw.lastIndexOf('\n', cut),
    raw.lastIndexOf(';', cut)
  );
  const head = raw.slice(0, boundary + 1);
  const tail = raw.slice(boundary + 1);

  const required = extractSkills(head);
  const preferred = extractSkills(tail).filter((s) => !required.includes(s));
  return { required, preferred, splitAt: boundary + 1 };
}



  // ---- packages/matching/src/match.js
/**
 * match.js — decide whether a job is worth applying to, and say why.
 *
 * WHY THIS IS NOT A WEIGHTED SUM
 *
 * The obvious design — skills 30%, experience 20%, location 15%, salary 10% —
 * is wrong, and wrong in a way that produces confident nonsense:
 *
 *   Salary is BINARY. If the ranges do not overlap it is a no, not a 10%
 *   deduction that a strong skills match can paper over.
 *   Location is usually binary too. "Must be in Adelaide" is not 15% of a
 *   decision, it is the decision.
 *   Experience is not linear. "5 years required" is not 60% satisfied by 3.
 *   Education is a minimum, so it passes or fails.
 *
 * So: HARD GATES FIRST. Anything that fails a gate is reported as a failure
 * with the specific reason. Only jobs that clear every gate get a soft score,
 * and that score ranks jobs against each other rather than pretending to be
 * an absolute percentage. "72%" invites a precision that does not exist.
 */


/** Do two inclusive ranges overlap? Either being open-ended counts as overlap. */
function rangesOverlap(aMin, aMax, bMin, bMax) {
  const lo1 = Number.isFinite(aMin) ? aMin : -Infinity;
  const hi1 = Number.isFinite(aMax) ? aMax : Infinity;
  const lo2 = Number.isFinite(bMin) ? bMin : -Infinity;
  const hi2 = Number.isFinite(bMax) ? bMax : Infinity;
  return lo1 <= hi2 && lo2 <= hi1;
}

/**
 * Number, or null.
 *
 * The explicit null check is load-bearing. `Number(null)` is 0 and 0 is
 * finite, so the obvious one-liner turned "this job did not state a salary"
 * into "this job pays zero" — and the salary gate then blocked every job
 * without an advertised range for anyone who had set a minimum. It only
 * escaped notice because callers that OMIT the field give undefined, which
 * becomes NaN and behaves correctly; the browser sends explicit nulls from
 * empty inputs, so the bug appeared in the app and not in any test.
 */
const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * The gates. Each returns null when it passes, or { id, reason, detail }
 * when it fails.
 *
 * Every message names the specific mismatch, because "not a match" tells
 * someone nothing they can act on. "Requires 5 years, your profile says 3"
 * tells them whether to apply anyway.
 */
const GATES = [
  {
    id: 'required-skills',
    check(profile, job) {
      const m = matchSkills(profile.skills, job.requiredSkills, job.preferredSkills);
      if (!m.missingRequired.length) return null;
      return {
        reason: `Missing ${m.missingRequired.length} required skill${m.missingRequired.length === 1 ? '' : 's'}`,
        detail: m.missingRequired.join(', ')
      };
    }
  },
  {
    id: 'experience',
    check(profile, job) {
      const need = num(job.minYearsExperience);
      const have = num(profile.yearsExperience);
      if (need === null || have === null) return null;
      if (have >= need) return null;
      return {
        reason: `Requires ${need} years of experience`,
        // The shortfall is what decides whether to apply anyway. Six months
        // short of five years is worth a shot; four years short is not.
        detail: `Your profile says ${have} — ${(need - have).toFixed(1)} short`
      };
    }
  },
  {
    id: 'salary',
    check(profile, job) {
      const wantMin = num(profile.minSalary);
      if (wantMin === null) return null;
      const jobMin = num(job.salaryMin);
      const jobMax = num(job.salaryMax);
      if (jobMin === null && jobMax === null) return null;
      if (rangesOverlap(wantMin, null, jobMin, jobMax)) return null;
      return {
        reason: 'Pay is below your minimum',
        detail: `Job pays up to ${jobMax === null ? 'unspecified' : jobMax.toLocaleString()}; you need at least ${wantMin.toLocaleString()}`
      };
    }
  },
  {
    id: 'work-arrangement',
    check(profile, job) {
      // Only a gate when the candidate has stated a hard requirement.
      if (!profile.remoteRequired) return null;
      const arr = String(job.workArrangement || '').toLowerCase();
      if (!arr) return null;
      if (arr.includes('remote') || arr.includes('hybrid')) return null;
      return {
        reason: 'On-site only, and you require remote',
        detail: `The posting says ${job.workArrangement}`
      };
    }
  },
  {
    id: 'sponsorship',
    check(profile, job) {
      // The one that wastes the most time when it is missed.
      if (!profile.needsSponsorship) return null;
      if (job.sponsorshipOffered !== false) return null;
      return {
        reason: 'No visa sponsorship',
        detail: 'You need sponsorship and this employer states they do not offer it'
      };
    }
  }
];

/**
 * The soft score, for jobs that already cleared every gate.
 *
 * Deliberately narrow: preferred-skill coverage plus a small bonus for
 * comfortably exceeding the experience minimum. It is a tie-breaker for
 * ranking, NOT a verdict — the verdict was the gates.
 */
function softScore(profile, job) {
  const m = matchSkills(profile.skills, job.requiredSkills, job.preferredSkills);
  let score = m.preferredRatio * 100;

  const need = num(job.minYearsExperience);
  const have = num(profile.yearsExperience);
  if (need !== null && have !== null && need > 0) {
    // Capped: twice the required experience is not twice as good a fit, and
    // past a point it reads as overqualified.
    score += Math.min(15, ((have - need) / need) * 15);
  }
  return Math.max(0, Math.round(Math.min(100, score)));
}

/**
 * Assess one job against one profile.
 *
 * Returns everything needed to explain the outcome. Nothing here is a bare
 * number without the reasoning beside it.
 */
function assess(profile, job) {
  const p = profile || {};
  const j = job || {};

  const blockers = [];
  for (const gate of GATES) {
    const fail = gate.check(p, j);
    if (fail) blockers.push({ id: gate.id, ...fail });
  }

  const skills = matchSkills(p.skills, j.requiredSkills, j.preferredSkills);
  const passed = blockers.length === 0;

  return {
    passed,
    blockers,
    skills,
    // Only meaningful when the gates passed; null otherwise, so no screen can
    // accidentally show a score beside a hard failure.
    score: passed ? softScore(p, j) : null,
    verdict: verdictFor(passed, blockers, skills),
    checkedGates: GATES.map((g) => g.id)
  };
}

function verdictFor(passed, blockers, skills) {
  if (!passed) {
    const only = blockers.length === 1 ? blockers[0] : null;
    return {
      level: 'blocked',
      headline: only ? only.reason : `${blockers.length} requirements not met`,
      advice:
        'This does not meet a stated requirement. Applying anyway is your call — ' +
        'employers do stretch on some of these, but know which one you are stretching.'
    };
  }
  if (!skills.missingPreferred.length) {
    return { level: 'strong', headline: 'Meets every requirement listed', advice: 'Worth applying.' };
  }
  return {
    level: 'clear',
    headline: 'Meets every hard requirement',
    advice: `Missing some preferred skills: ${skills.missingPreferred.join(', ')}. These are usually negotiable.`
  };
}

/**
 * Rank several assessed jobs. Blocked jobs sort last and keep their reason —
 * they are not hidden, because "why was this filtered out" is a question
 * people actually ask.
 */
function rank(assessments) {
  return [...(assessments || [])].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? -1 : 1;
    if (!a.passed) return a.blockers.length - b.blockers.length;
    return (b.score || 0) - (a.score || 0);
  });
}


  // ---- packages/documents/src/evidence.js
/**
 * evidence.js — find the sentences in someone's own resume that support a
 * claim about a skill.
 *
 * THIS IS THE FILE THAT KEEPS THE DOCUMENT GENERATORS HONEST.
 *
 * A cover letter generator that writes "I have extensive experience with
 * Kubernetes" from nothing but the word "Kubernetes" is producing a claim its
 * user has to defend in an interview. Everything the generators emit is built
 * from lines that already exist in the resume, and every generated sentence
 * carries the line it came from, so the user can see what they are signing.
 *
 * Where there is no evidence, the generators emit a marked gap rather than
 * prose. A blank the user has to fill is a worse-looking draft and a better
 * application.
 */


/**
 * A blank the applicant must fill, rendered visibly wherever it appears.
 *
 * Defined here rather than in each generator because it is one concept — "we
 * have no evidence for this and will not invent any" — and because both
 * generators land in a single shared scope in the browser bundle, where two
 * `const GAP` declarations are a syntax error that takes the whole app down.
 */
const GAP = (what) => `[${what}]`;

/** Split a resume into candidate evidence lines: bullets and sentences. */
function statements(resumeText) {
  const out = [];
  const lines = String(resumeText || '').split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const isBullet = /^[-•*●▪]\s*/.test(line);
    const body = line.replace(/^[-•*●▪]\s*/, '').trim();
    if (body.length < 20) continue; // headings, dates, contact fragments

    if (isBullet) {
      out.push({ text: body, kind: 'bullet' });
      continue;
    }
    // Prose: split into sentences so one long paragraph does not become one
    // enormous unusable "statement".
    for (const s of body.split(/(?<=[.!?])\s+/)) {
      const t = s.trim();
      if (t.length >= 30) out.push({ text: t, kind: 'sentence' });
    }
  }
  return out;
}

/** Does this statement carry a measurable outcome? Those are worth more. */
function isQuantified(text) {
  return /\b\d[\d,.]*\s*(%|percent|k\b|m\b|x\b|hours?|days?|weeks?|months?|years?|ms\b|s\b|people|users?|customers?|records?|transactions?|services?|teams?)/i.test(text) ||
    /\b\d[\d,.]*\b/.test(text);
}

/**
 * Score a statement as evidence for one skill.
 *
 * Mentioning the skill is necessary. Beyond that, a quantified outcome beats
 * an unquantified one, and a bullet beats buried prose, because that is the
 * order a reader's eye gives them anyway.
 */
function scoreStatement(statement, skill) {
  const hay = normalise(statement.text);
  const canonical = canonicalise(skill);
  const mentioned = extractSkills(statement.text).indexOf(canonical) !== -1;
  if (!mentioned) return 0;

  let score = 10;
  if (isQuantified(statement.text)) score += 8;
  if (statement.kind === 'bullet') score += 2;
  // A statement naming several relevant things is stronger than one naming one.
  score += Math.min(4, extractSkills(statement.text).length);
  // Very long lines are usually a whole paragraph and read poorly when quoted.
  if (statement.text.length > 220) score -= 4;
  return score;
}

/**
 * The best evidence in this resume for each of these skills.
 *
 * Returns one entry per skill, ALWAYS — including skills with no evidence,
 * because "you claim this and cannot show it" is the most useful thing the
 * caller can know.
 */
function evidenceFor(resumeText, skills) {
  const all = statements(resumeText);
  const used = new Set();
  const out = [];

  for (const skill of skills || []) {
    const canonical = canonicalise(skill);
    const ranked = all
      .map((s) => ({ statement: s, score: scoreStatement(s, canonical) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // Prefer evidence not already spent on another skill, so a letter does not
    // quote the same bullet three times.
    const fresh = ranked.filter((r) => !used.has(r.statement.text));
    const pick = fresh[0] || ranked[0] || null;
    if (pick) used.add(pick.statement.text);

    out.push({
      skill: canonical,
      hasEvidence: !!pick,
      text: pick ? pick.statement.text : null,
      quantified: pick ? isQuantified(pick.statement.text) : false,
      score: pick ? pick.score : 0,
      alternatives: ranked.slice(0, 3).map((r) => r.statement.text)
    });
  }
  return out;
}

/** The strongest statements overall, regardless of skill. */
function strongest(resumeText, limit) {
  return statements(resumeText)
    .map((s) => ({ text: s.text, quantified: isQuantified(s.text), skills: extractSkills(s.text) }))
    .filter((s) => s.skills.length > 0)
    .sort((a, b) => {
      if (a.quantified !== b.quantified) return a.quantified ? -1 : 1;
      return b.skills.length - a.skills.length;
    })
    .slice(0, limit || 5);
}


  // ---- packages/documents/src/cover-letter.js
/**
 * cover-letter.js — assemble a tailored cover letter from the applicant's own
 * resume, with every claim traceable to the line it came from.
 *
 * WHY THERE IS NO MODEL HERE
 *
 * A language model writes a fluent cover letter instantly, and that is the
 * problem: fluent, generic, and indistinguishable from the other four hundred
 * the recruiter received, because they were produced by the same model from
 * the same advertisement. Worse, it invents. "I led the migration of a
 * monolith to microservices" is a sentence a model will happily produce for
 * someone who has never done it, and the applicant finds out in the interview.
 *
 * So this assembles rather than writes. It selects the applicant's real
 * achievements, matches them to what the advertisement asks for, and arranges
 * them. The prose scaffolding is fixed and deliberately plain; the content is
 * entirely theirs. Where it has nothing, it leaves a marked blank instead of
 * filling it.
 *
 * The output is a strong draft that needs a human pass — which is the honest
 * ceiling for this problem, and better than a polished draft that is not true.
 */



function titleCase(s) {
  return String(s || '').replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** A readable list: "a, b and c". */
function list(items) {
  const a = (items || []).filter(Boolean);
  if (!a.length) return '';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
}

/** Trim a resume bullet into something that reads inside a sentence. */
function asClause(text) {
  let t = String(text || '').trim().replace(/[.;]+$/, '');
  t = t.replace(/^(I\s+|We\s+)/i, '');
  // Bullets are usually written in past tense already; lower-case the first
  // letter unless it is an acronym or proper noun.
  if (/^[A-Z][a-z]/.test(t)) t = t[0].toLowerCase() + t.slice(1);
  return t;
}

/**
 * Build the letter.
 *
 * profile: { name, email, phone, resumeText, yearsExperience }
 * job:     { title, company, requiredSkills, preferredSkills, adText, hiringManager }
 * opts:    { tone: 'plain'|'warm'|'formal', maxEvidence: 3 }
 */
function coverLetter(profile, job, opts) {
  const p = profile || {};
  const j = job || {};
  const o = opts || {};
  const tone = o.tone || 'plain';
  const maxEvidence = o.maxEvidence || 3;

  const role = j.title || GAP('role title');
  const company = j.company || GAP('company name');
  const required = (j.requiredSkills || []).map(canonicalise);
  const preferred = (j.preferredSkills || []).map(canonicalise);

  // Canonical names are for matching, not for reading. The alias dictionary
  // resolves "Splunk" to the canonical "siem", and a letter that says "the
  // advertisement asks for Siem" when the advertisement said Splunk is both
  // wrong and obviously machine-written. Keep what the ad actually called it.
  const display = new Map();
  for (const raw of (j.requiredSkills || []).concat(j.preferredSkills || [])) {
    const c = canonicalise(raw);
    const surface = String(raw).trim();
    // Only useful if the caller passed the ad's own wording. The app passes
    // the output of parseJobSkills(), which is already canonical, so this
    // resolves "siem" to "siem" and the fix would quietly do nothing.
    if (!display.has(c) && canonicalise(surface) === c && surface.toLowerCase() !== c) {
      display.set(c, surface);
    }
  }

  /**
   * Recover the word the advertisement actually used. The mechanism lives in
   * skills.js, because the interview prep needs exactly the same thing.
   */
  const fromAd = (canonical) => (j.adText ? surfaceForm(canonical, j.adText, null) : null);

  const label = (canonical) => display.get(canonical) || fromAd(canonical) || titleCase(canonical);

  const ev = evidenceFor(p.resumeText, required.concat(preferred));
  const backed = ev.filter((e) => e.hasEvidence);
  const unbacked = ev.filter((e) => !e.hasEvidence && required.indexOf(e.skill) !== -1);

  // Lead with quantified evidence for required skills; those are the sentences
  // that answer "can you do the job" rather than "have you heard of it".
  const lead = backed
    .filter((e) => required.indexOf(e.skill) !== -1)
    .sort((a, b) => (b.quantified - a.quantified) || (b.score - a.score))
    .slice(0, maxEvidence);

  const fallback = lead.length ? [] : strongest(p.resumeText, maxEvidence).map((s) => ({
    skill: s.skills[0], text: s.text, quantified: s.quantified, hasEvidence: true, score: 0
  }));
  const body = lead.length ? lead : fallback;

  const greeting = j.hiringManager
    ? `Dear ${j.hiringManager},`
    : tone === 'formal'
      ? 'Dear Hiring Manager,'
      : 'Hello,';

  const years = Number(p.yearsExperience);
  const opener = (() => {
    const stem = `I am writing to apply for the ${role} position at ${company}.`;
    if (Number.isFinite(years) && years > 0) {
      const covered = body.map((e) => e.skill).filter(Boolean);
      return covered.length
        ? `${stem} I have ${years} year${years === 1 ? '' : 's'} of experience, most of it in ${list(covered.map(label))}.`
        : `${stem} I have ${years} year${years === 1 ? '' : 's'} of experience in the field.`;
    }
    return stem;
  })();

  const paragraphs = [];
  const sources = [];

  for (const e of body) {
    const clause = asClause(e.text);
    paragraphs.push(
      e.quantified
        ? `On ${label(e.skill)}: I ${clause}.`
        : `On ${label(e.skill)}: I ${clause}. ${GAP('add the scale or the outcome — how many, how much, how much faster')}`
    );
    sources.push({ skill: e.skill, quotedFrom: e.text, quantified: e.quantified });
  }

  if (!body.length) {
    paragraphs.push(
      GAP('no achievement in your resume mentions anything this advertisement asks for — ' +
        'either the resume is missing the work, or this job is not a match')
    );
  }

  // Naming a gap yourself is stronger than leaving it to be discovered, but
  // only when it is one gap. Several is a job you should probably skip.
  if (unbacked.length === 1) {
    paragraphs.push(
      `The advertisement asks for ${label(unbacked[0].skill)}, which my resume does not ` +
        `cover. ${GAP('one sentence: the closest thing you have done, or how quickly you have ' +
        'picked up something comparable')}`
    );
  } else if (unbacked.length > 1) {
    paragraphs.push(
      GAP(`${unbacked.length} required skills have no supporting achievement in your resume ` +
        `(${list(unbacked.map((u) => label(u.skill)))}). Addressing them all in a cover ` +
        'letter draws attention to the gap. Consider whether this application is worth sending')
    );
  }

  const why = j.company
    ? `${GAP(`why ${company} specifically — one concrete thing about them, not a compliment. ` +
        'This is the paragraph recruiters use to tell a tailored letter from a template')}`
    : GAP('why this employer specifically');
  paragraphs.push(why);

  const closer = tone === 'warm'
    ? 'I would genuinely like to talk about this one. Thank you for your time.'
    : tone === 'formal'
      ? 'I would welcome the opportunity to discuss my application further. Thank you for your consideration.'
      : 'I would be glad to talk it through. Thank you for reading.';

  const signoff = [
    tone === 'formal' ? 'Yours sincerely,' : 'Regards,',
    p.name || GAP('your name'),
    [p.email, p.phone].filter(Boolean).join('  •  ') || GAP('email and phone')
  ].join('\n');

  const text = [greeting, '', opener, '', ...paragraphs.map((x) => x + '\n'), closer, '', signoff]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const gaps = (text.match(/\[[^\]]+\]/g) || []).length;

  return {
    text,
    greeting,
    opener,
    paragraphs,
    closer,
    signoff,
    sources,
    gaps,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    // Stated plainly so no caller can present this as finished work.
    readiness: gaps === 0
      ? 'complete'
      : gaps <= 2
        ? 'draft — fill the marked blanks'
        : 'skeleton — several blanks need you before this is sendable',
    unbackedRequired: unbacked.map((u) => u.skill)
  };
}


  // ---- packages/documents/src/selection-criteria.js
/**
 * selection-criteria.js — draft STAR responses to selection criteria.
 *
 * WHY THIS IS A SEPARATE THING FROM A COVER LETTER
 *
 * Australian public-sector and university applications ask you to "address
 * the selection criteria": a numbered list, each answered separately, each
 * scored separately by a panel against a rubric. A cover letter that gestures
 * at all of them scores zero on all of them, because the panel is ticking off
 * one criterion at a time and needs to find the answer under its heading.
 *
 * The expected form is STAR — Situation, Task, Action, Result. Panels are
 * trained on it, and a response missing the Result is the single most common
 * reason a competent applicant does not progress: they describe what they were
 * responsible for and never say what changed.
 *
 * WHAT THIS DOES AND DOES NOT DO
 *
 * It finds the applicant's strongest real evidence for each criterion and
 * arranges it into the STAR frame, then marks every part it cannot fill. It
 * does not invent a Situation. It cannot: the situation is a specific thing
 * that happened at a specific place, and a plausible fabrication is precisely
 * what a panel probes for at interview.
 *
 * So the output is a scaffold with the applicant's own achievement already in
 * the Action and Result slots, and named blanks everywhere else.
 */



/** Typical word limits panels set. Used for guidance, not enforcement. */
const LIMITS = { brief: 150, standard: 250, detailed: 500 };

/**
 * Pull the individual criteria out of pasted text.
 *
 * Real postings number them, bullet them, or write them as headed paragraphs.
 * Anything shorter than a clause is not a criterion — it is a fragment of the
 * heading above it.
 */
function parseCriteria(text) {
  const raw = String(text || '');
  if (!raw.trim()) return [];

  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];

  for (const line of lines) {
    // Strip a leading number, letter or bullet marker.
    const stripped = line
      .replace(/^\(?\d+[.)]\s*/, '')
      .replace(/^\(?[a-z][.)]\s*/i, '')
      .replace(/^[-•*●▪]\s*/, '')
      .trim();

    // A heading like "Selection Criteria" is not itself a criterion.
    if (/^(selection|key|essential|desirable)\s+criteri(a|on)\b:?$/i.test(stripped)) continue;
    if (stripped.length < 25) continue;
    // A criterion is a demand; a sentence of company blurb usually is not.
    out.push(stripped.replace(/[.;]+$/, ''));
  }
  return out;
}

/** Which of the applicant's skills does this criterion actually ask about? */
function skillsInCriterion(criterion) {
  return extractSkills(criterion);
}

/**
 * Some criteria are behavioural rather than technical — "demonstrated ability
 * to work in a team", "high-level communication skills". No skill dictionary
 * will match those, and pretending otherwise produces an empty response with
 * no explanation. They get a different scaffold.
 */
const BEHAVIOURAL = [
  { id: 'communication', match: /communicat|written and verbal|stakeholder|liais|present/i,
    prompt: 'a time you explained something difficult to someone who needed it and did not have your background' },
  { id: 'teamwork', match: /team|collaborat|work(ing)? with others|cross-functional/i,
    prompt: 'a time the outcome depended on other people and you made that work' },
  { id: 'problem-solving', match: /problem|analytic|troubleshoot|resolve|diagnos/i,
    prompt: 'a problem nobody had solved yet, and what you did that was not obvious' },
  { id: 'initiative', match: /initiative|autonom|self-?direct|minimal supervision|proactiv/i,
    prompt: 'something you started that nobody asked you to start' },
  { id: 'planning', match: /plan|priorit|deadline|competing demands|time management|organis/i,
    prompt: 'a period with more work than time, and how you decided what not to do' },
  // "supervis" alone matches "minimal supervision", which is a criterion about
  // working WITHOUT supervision — the opposite of leading people. Only the
  // verb forms count.
  { id: 'leadership', match: /lead(ership|ing a team)?\b|supervis(e|ed|ing|or)\b|mentor|manag(e|ing) (a )?(team|staff|people)/i,
    prompt: 'a time you were responsible for other people\'s output as well as your own' },
  { id: 'change', match: /change|adapt|ambigu|shifting|evolv/i,
    prompt: 'a time the goal moved after you had started' },
  { id: 'integrity', match: /integrity|ethic|values|code of conduct|confidential/i,
    prompt: 'a time doing the right thing cost you something' }
];

function behaviouralKind(criterion) {
  return BEHAVIOURAL.filter((b) => b.match.test(criterion));
}

/**
 * Draft one response.
 *
 * Returns the four STAR parts separately as well as assembled text, so a UI
 * can let someone edit them individually — which is how people actually work
 * on these.
 */
function draftResponse(criterion, resumeText, opts) {
  const o = opts || {};
  const limit = LIMITS[o.length || 'standard'] || LIMITS.standard;

  const technical = skillsInCriterion(criterion);
  const behavioural = behaviouralKind(criterion);
  const ev = technical.length ? evidenceFor(resumeText, technical) : [];
  const backed = ev.filter((e) => e.hasEvidence).sort((a, b) => (b.quantified - a.quantified) || (b.score - a.score));
  const best = backed[0] || null;

  const situation = GAP(
    behavioural.length
      ? `Situation — ${behavioural[0].prompt}. Name the employer, the team and roughly when.`
      : 'Situation — where this happened: the employer, the team, roughly when, and what was going wrong or needed doing'
  );

  const task = GAP(
    'Task — what you specifically were accountable for. Not the team: you. ' +
      'A panel scores the word "we" as unassessable'
  );

  let action;
  let result;
  if (best) {
    // The resume line is an achievement, which usually collapses Action and
    // Result into one sentence. Split it where it is splittable, and say so
    // where it is not.
    action = `Action — ${best.text}`;
    result = best.quantified
      ? `Result — ${GAP('restate the figure from the line above as the outcome, and add what it meant: ' +
          'what became possible, what stopped happening, who noticed')}`
      : `Result — ${GAP('this achievement has no number in it. Add one: how much, how many, ' +
          'how much faster, how much cheaper. A Result without a measure is the most common ' +
          'reason a strong response scores badly')}`;
  } else {
    action = `Action — ${GAP(
      technical.length
        ? `nothing in your resume mentions ${technical.join(', ')}. Either add the work, or ` +
          'answer from experience the resume does not currently cover'
        : 'what you actually did, step by step. Three or four sentences — this is the part ' +
          'the panel scores most heavily'
    )}`;
    result = `Result — ${GAP('what changed, with a number')}`;
  }

  const parts = { situation, task, action, result };
  const text = [situation, task, action, result].join('\n\n');
  const gaps = (text.match(/\[[^\]]+\]/g) || []).length;

  return {
    criterion,
    parts,
    text,
    technical,
    behavioural: behavioural.map((b) => b.id),
    evidenceUsed: best ? best.text : null,
    gaps,
    wordLimit: limit,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    readiness: best ? 'draft — your achievement is in, fill the rest' : 'skeleton — no matching evidence found'
  };
}

/** Draft every criterion in a posting. */
function draftAll(criteriaText, resumeText, opts) {
  const criteria = Array.isArray(criteriaText) ? criteriaText : parseCriteria(criteriaText);
  const responses = criteria.map((c) => draftResponse(c, resumeText, opts));
  return {
    criteria,
    responses,
    unsupported: responses.filter((r) => !r.evidenceUsed).map((r) => r.criterion),
    totalGaps: responses.reduce((n, r) => n + r.gaps, 0),
    // A panel scores each criterion separately, so a single weak response is a
    // single low score rather than a diluted average. Worth saying.
    note: responses.length
      ? 'Each response is scored on its own. One unanswered criterion is a zero for that ' +
        'criterion, not a slightly lower overall mark.'
      : 'No criteria found. Paste the numbered or bulleted list from the position description.'
  };
}


  // ---- packages/ats/src/ats-check.js
/**
 * ats-check.js — tell someone what an applicant tracking system will actually
 * do to their resume, and what it will fail to find.
 *
 * THE FRAMING THAT MAKES THIS HONEST
 *
 * We do not parse PDFs. That is deliberate and it is also the source of this
 * module's single best property: **the text the user pastes in is very close
 * to what an ATS extracts.** Both come from the same PDF text layer. So if the
 * pasted text has columns interleaved, dates detached from employers, or
 * bullet characters turned into mojibake, that is not a paste problem to
 * apologise for — it is a preview of the parse, and it is the most useful
 * thing we can show.
 *
 * That reframing means every check below runs on the thing that matters,
 * rather than on a guess about a file we never opened.
 *
 * WHAT THIS DELIBERATELY DOES NOT CLAIM
 *
 * There is no such thing as an "ATS score". Vendors do not publish one,
 * Workday and Greenhouse rank differently from each other, and most systems
 * do not auto-reject at all — a recruiter filters a search. Any tool showing
 * "your ATS score is 74" invented that number. So this returns findings with
 * severities and a plain count, never a score out of a hundred.
 */


/** Section headings an ATS looks for. Anything else is a heading it may ignore. */
const STANDARD_SECTIONS = {
  experience: ['experience', 'employment', 'work history', 'professional experience', 'career history', 'employment history'],
  education: ['education', 'qualifications', 'academic', 'academic background'],
  skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'competencies'],
  summary: ['summary', 'profile', 'objective', 'professional summary', 'about me', 'career summary']
};

/**
 * Headings people invent that read well to a human and mean nothing to a
 * parser looking for known labels.
 */
const CREATIVE_HEADINGS = [
  'what i bring', 'my journey', 'the story so far', 'where i have been',
  'things i am good at', 'my toolkit', 'superpowers', 'what drives me',
  'my impact', 'highlights reel'
];

/** Verbs that describe presence rather than contribution. */
const WEAK_OPENERS = [
  'responsible for', 'duties included', 'tasked with', 'helped with',
  'worked on', 'involved in', 'participated in', 'assisted with',
  'in charge of', 'my role was'
];

const CONTACT = {
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  // Deliberately loose: international formats vary wildly and a false
  // "you have no phone number" is worse than missing an odd one.
  phone: /(\+?\d[\d\s().-]{7,}\d)/,
  linkedin: /linkedin\.com\/in\/[a-z0-9-]+/i
};

/** A finding, in the shape every check returns. */
function finding(id, severity, title, detail, fix) {
  return { id, severity, title, detail, fix };
}

function lines(text) {
  return String(text || '').split(/\r?\n/);
}

function words(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean);
}

/**
 * Does this line look like a heading? Short, no terminal full stop, and
 * either title case or all caps.
 */
function looksLikeHeading(line) {
  const t = line.trim();
  if (!t || t.length > 60) return false;
  if (/[.!?,;]$/.test(t)) return false;
  return words(t).length <= 6;
}

function headings(text) {
  return lines(text).filter(looksLikeHeading).map((l) => l.trim());
}

/* ---------------------------------------------------------------- checks */

/**
 * Interleaved columns. A two-column resume extracts as alternating fragments.
 *
 * THIS CHECK IS DELIBERATELY HARD TO TRIGGER. It is the most alarming finding
 * the tool can report, so a false positive costs more than a miss: someone
 * told to rebuild a resume that was fine will distrust every other finding on
 * the page.
 *
 * The naive signal — "lots of short lines" — fires on every normal resume,
 * because headings, bullets and contact lines are all legitimately short. It
 * did exactly that on the first test case. So short lines are not the signal.
 *
 * The real signature of a broken reading order is a FRAGMENT: a line that is
 * short, is not a heading, is not a bullet, and does not finish a sentence —
 * because the rest of that sentence is physically in the other column. Those
 * are counted, and only those.
 */
function checkColumnDamage(text) {
  const all = lines(text).map((l) => l.trim()).filter(Boolean);
  // Too little text to distinguish a broken parse from a terse resume.
  if (all.length < 25) return null;

  const isBullet = (l) => /^[-•*●▪]/.test(l);
  const isContact = (l) => CONTACT.email.test(l) || CONTACT.phone.test(l) || CONTACT.linkedin.test(l);
  const endsCleanly = (l) => /[.!?:;,]$/.test(l);

  // Exclude only lines that are RECOGNISED section headings, not anything
  // heading-SHAPED. looksLikeHeading() accepts any short line without terminal
  // punctuation — which is the exact shape of the fragments being hunted, so
  // using it here excluded the evidence and the check could never fire.
  const KNOWN_HEADINGS = new Set(
    Object.values(STANDARD_SECTIONS).flat().concat(CREATIVE_HEADINGS, [
      'certifications', 'certification', 'projects', 'publications', 'awards',
      'references', 'interests', 'volunteering', 'languages', 'contact'
    ])
  );
  const isKnownHeading = (l) => KNOWN_HEADINGS.has(normalise(l));

  const candidates = all.filter((l) => !isKnownHeading(l) && !isBullet(l) && !isContact(l));
  if (candidates.length < 15) return null;

  const fragments = candidates.filter((l) => words(l).length <= 4 && !endsCleanly(l));
  const ratio = fragments.length / candidates.length;

  // Two independent conditions, both required.
  if (ratio < 0.45 || fragments.length < 10) return null;

  return finding(
    'column-damage',
    'critical',
    'This looks like it came out of a multi-column layout',
    `${fragments.length} of ${candidates.length} body lines are short fragments that do not ` +
      'finish a sentence. That is what happens when a parser reads a two-column page across ' +
      'instead of down: text from the sidebar lands in the middle of a sentence from the main ' +
      'column, and neither is readable afterwards.',
    'Rebuild the resume in a single column. This matters more than everything else on this ' +
      'list, because a scrambled parse loses information rather than merely presenting it ' +
      'badly — and nothing downstream can recover it.'
  );
}

function checkContact(text) {
  const out = [];
  if (!CONTACT.email.test(text)) {
    out.push(finding('no-email', 'critical', 'No email address found',
      'An email is the primary key in every applicant tracking system. If it is in a header ' +
        'or footer, most parsers never see it — headers and footers are outside the text flow.',
      'Put your email in the body of the first page, as plain text, not in a header.'));
  }
  if (!CONTACT.phone.test(text)) {
    out.push(finding('no-phone', 'warning', 'No phone number found',
      'Recruiters filter on having one, and some systems mark a record incomplete without it.',
      'Add it as plain digits in the body. Avoid rendering it inside an image or an icon font.'));
  }
  if (!CONTACT.linkedin.test(text)) {
    out.push(finding('no-linkedin', 'info', 'No LinkedIn URL found',
      'Not required, but it is the field recruiters click first when a resume is borderline.',
      'Add the full URL as text — a hyperlink behind the word "LinkedIn" extracts as the word.'));
  }
  return out;
}

/** Standard section headings. */
function checkSections(text) {
  const hs = headings(text).map((h) => normalise(h));
  const body = normalise(text);
  const out = [];

  for (const [key, labels] of Object.entries(STANDARD_SECTIONS)) {
    const found = labels.some((l) => hs.some((h) => h === l || h.startsWith(l)));
    if (found) continue;
    // A missing summary is a style choice; missing experience or education is not.
    const severity = key === 'summary' ? 'info' : key === 'skills' ? 'warning' : 'critical';
    out.push(finding(`no-section-${key}`, severity, `No "${labels[0]}" section heading`,
      `Parsers map content to fields by looking for known headings. Without one, everything ` +
        `under it is filed as unclassified text and stops matching a search for that field.`,
      `Use the plain word: "${labels.slice(0, 3).join('", "')}". Creative headings cost you the field.`));
  }

  const creative = hs.filter((h) => CREATIVE_HEADINGS.indexOf(h) !== -1);
  if (creative.length) {
    out.push(finding('creative-headings', 'warning', 'Headings a parser will not recognise',
      `Found: ${creative.join(', ')}. These read well to a person and are invisible to a keyword map.`,
      'Keep the personality in the sentences. Make the headings boring.'));
  }

  // A skills heading with nothing recognisable under it is worse than none.
  if (!out.some((f) => f.id === 'no-section-skills')) {
    const known = extractSkills(body);
    if (known.length < 3) {
      out.push(finding('thin-skills', 'warning', 'Very few recognisable skills',
        `Only ${known.length} skill${known.length === 1 ? '' : 's'} in the dictionary appeared anywhere in this resume.`,
        'Name the technologies explicitly. "Modern cloud tooling" matches no search; ' +
          '"AWS, Terraform, Kubernetes" matches three.'));
    }
  }
  return out;
}

/**
 * Acronym and expansion. Recruiters search for one or the other, and roughly
 * half search for the term the resume does not contain.
 */
function checkAcronyms(text) {
  const body = normalise(text);
  const missing = [];
  for (const canonical of Object.keys(ALIASES)) {
    if (canonical.startsWith('_')) continue;
    const aliases = ALIASES[canonical];
    // An acronym-shaped alias: short, and the canonical is a longer phrase.
    const acronyms = aliases.filter((a) => a.length <= 5 && /^[a-z0-9+#]+$/i.test(a));
    if (!acronyms.length) continue;
    if (canonical.split(' ').length < 2) continue;

    const hasLong = body.indexOf(normalise(canonical)) !== -1;
    const shortHit = acronyms.filter((a) => new RegExp(`(?<![a-z0-9])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i').test(body));
    if (shortHit.length && !hasLong) {
      missing.push({ have: shortHit[0], add: canonical });
    } else if (hasLong && !shortHit.length) {
      missing.push({ have: canonical, add: acronyms[0] });
    }
  }
  if (!missing.length) return null;
  const sample = missing.slice(0, 6);
  return finding('acronym-coverage', 'warning', 'Write the acronym and the full name once',
    'A keyword search matches the literal string. These appear in only one of their two forms: ' +
      sample.map((m) => `"${m.have}" without "${m.add}"`).join('; ') +
      (missing.length > sample.length ? `, and ${missing.length - sample.length} more` : ''),
    'Spell it out once with the acronym in brackets — "Amazon Web Services (AWS)" — then use ' +
      'whichever you like. One mention of each form covers both searches.');
}

/** Achievements that carry a number are the ones that survive a skim. */
function checkQuantification(text) {
  const bullets = lines(text).filter((l) => /^\s*[-•*•●]/.test(l));
  if (bullets.length < 3) return null;
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const ratio = withNumbers / bullets.length;
  if (ratio >= 0.35) return null;
  return finding('no-numbers', 'warning', 'Almost none of the bullets carry a number',
    `${withNumbers} of ${bullets.length} bullets contain a figure. Without one, a claim is a ` +
      'description of a job rather than evidence of doing it well.',
    'Add scale or outcome to the ones where you know it: how many, how much, how much faster, ' +
      'how many people. A range or an approximation is fine. Leave the rest alone rather than ' +
      'inventing figures.');
}

/** Bullets that open by describing a job description rather than a result. */
function checkWeakOpeners(text) {
  const body = normalise(text);
  const hits = WEAK_OPENERS.filter((w) => body.indexOf(w) !== -1);
  if (!hits.length) return null;
  return finding('weak-openers', 'info', 'Phrases that describe the role, not the work',
    `Found: ${hits.slice(0, 4).map((h) => `"${h}"`).join(', ')}. These come from the job ` +
      'description you were given, so every other applicant for that role has them too.',
    'Open with what you did: "Cut deployment time from 40 minutes to 6" rather than ' +
      '"Responsible for the deployment pipeline."');
}

/** Length, which matters mostly at the extremes. */
function checkLength(text) {
  const n = words(text).length;
  if (n < 200) {
    return finding('too-short', 'warning', `Only ${n} words`,
      'There is not enough here for a keyword search to match on, whatever the quality.',
      'Two pages is normal and safe for anything past a first job. One page is a constraint ' +
        'people impose on themselves that no ATS asks for.');
  }
  if (n > 1400) {
    return finding('too-long', 'info', `${n} words is long`,
      'Nothing will reject it, but a recruiter reads the top third and the parse quality of ' +
        'later pages tends to be worse.',
      'Move the oldest roles to one line each. Keep detail where it is recent and relevant.');
  }
  return null;
}

/** Characters that survive a PDF but not always a parser. */
function checkCharacters(text) {
  const bad = [];
  if (/[-]/.test(text)) bad.push('private-use icon glyphs (from an icon font)');
  if (/[�]/.test(text)) bad.push('replacement characters, meaning something already failed to decode');
  if (/\t{2,}/.test(text)) bad.push('runs of tabs, which usually indicate a table');
  if (!bad.length) return null;
  return finding('bad-characters', 'warning', 'Characters that will not survive extraction',
    `Found ${bad.join('; ')}.`,
    'Replace icon fonts with words, and rebuild tables as plain paragraphs or simple bullets.');
}

/**
 * Coverage of the words the job ad actually uses. This is the check that is
 * specific to one application rather than to the resume in general.
 */
function keywordCoverage(resumeText, jobText) {
  const inJob = extractSkills(jobText);
  const inResume = new Set(extractSkills(resumeText));
  const present = inJob.filter((s) => inResume.has(s));
  const absent = inJob.filter((s) => !inResume.has(s));
  return {
    total: inJob.length,
    present,
    absent,
    ratio: inJob.length ? present.length / inJob.length : null
  };
}

/**
 * Run everything.
 *
 * `jobText` is optional: without it you get the general checks, with it you
 * also get coverage against that specific advertisement.
 */
function checkResume(resumeText, jobText) {
  const text = String(resumeText || '');
  const findings = [];

  const push = (f) => {
    if (!f) return;
    if (Array.isArray(f)) findings.push(...f.filter(Boolean));
    else findings.push(f);
  };

  if (!text.trim()) {
    return {
      findings: [finding('empty', 'critical', 'No resume text', 'Nothing was provided to check.',
        'Paste the text of your resume. Select all in the PDF and copy — what you get is ' +
          'close to what the ATS gets, which is the point.')],
      counts: { critical: 1, warning: 0, info: 0 },
      coverage: null,
      checked: []
    };
  }

  push(checkColumnDamage(text));
  push(checkContact(text));
  push(checkSections(text));
  push(checkAcronyms(text));
  push(checkQuantification(text));
  push(checkWeakOpeners(text));
  push(checkLength(text));
  push(checkCharacters(text));

  const coverage = jobText ? keywordCoverage(text, jobText) : null;
  if (coverage && coverage.absent.length) {
    findings.push(finding('job-keyword-gap', coverage.ratio < 0.5 ? 'critical' : 'warning',
      `${coverage.absent.length} skill${coverage.absent.length === 1 ? '' : 's'} in the ad are not in your resume`,
      `The advertisement names ${coverage.total}; your resume contains ${coverage.present.length}. ` +
        `Missing: ${coverage.absent.join(', ')}.`,
      'Add only the ones you genuinely have, using the ad\'s own wording. If you have used ' +
        'it, name it — a skill you did not write down is a skill you do not have, as far as a ' +
        'search is concerned. Do not add the others; being caught out in the interview is worse ' +
        'than not being shortlisted.'));
  }

  const order = { critical: 0, warning: 1, info: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    findings,
    counts: {
      critical: findings.filter((f) => f.severity === 'critical').length,
      warning: findings.filter((f) => f.severity === 'warning').length,
      info: findings.filter((f) => f.severity === 'info').length
    },
    coverage,
    checked: [
      'column/reading-order damage', 'contact fields', 'standard section headings',
      'acronym and expansion coverage', 'quantified achievements', 'opening verbs',
      'length', 'characters that break extraction'
    ].concat(jobText ? ['keyword coverage against this advertisement'] : [])
  };
}


  // ---- packages/tracker/src/pipeline.js
/**
 * pipeline.js — take a pile of job advertisements, work out which are worth
 * applying to, and produce a finished application pack for each one.
 *
 * THIS IS THE "APPLY TO EVERYTHING THAT MATCHES" ENGINE.
 *
 * It does every part of applying that can be done well in bulk: read each
 * advertisement, pull out the requirements, gate it against the profile, rank
 * what survives, and generate a tailored cover letter, a resume gap list and
 * selection-criteria responses for each. What would take a person forty
 * minutes per job takes one paste.
 *
 * WHERE IT STOPS, AND WHY IT STOPS THERE
 *
 * It does not press submit on SEEK or Workday, and that is a deliberate
 * engineering decision rather than squeamishness:
 *
 *   - SEEK, Workday, PageUp and JobAdder all prohibit automated submission in
 *     their terms. The enforcement mechanism is not a lawsuit, it is bot
 *     detection terminating the account — including the SEEK profile with the
 *     applicant's history in it, and every application already in flight.
 *   - Workday's form widgets are shadow-DOM custom components that ignore
 *     programmatic value changes. An automated submission there does not fail
 *     loudly; it submits a half-empty application, and the applicant finds out
 *     by never hearing back.
 *   - A submission is irreversible. There is no unsend. A batch bug that would
 *     be a bad afternoon anywhere else is, here, forty employers holding a
 *     wrong application with the applicant's name on it.
 *
 * So the queue takes it to the last step and hands over: every field prepared,
 * every document written, one job at a time, one click each. That is the fast
 * part automated and the irreversible part left with the person whose name is
 * on the application.
 */






/** Where an application can be. */
const STATUSES = ['queued', 'ready', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'skipped'];

/**
 * Split one pasted blob into separate advertisements.
 *
 * People collect jobs by copying several into one document. The separators
 * they actually use are a run of dashes, a run of equals signs, or a form
 * feed — plus the one this tool tells them to use.
 */
function splitAdvertisements(blob) {
  const text = String(blob || '');
  if (!text.trim()) return [];
  const parts = text.split(/\n\s*(?:-{3,}|={3,}|\*{3,}|#{3,}|\f)\s*\n/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 40);
}

/**
 * Pull structured fields out of one advertisement.
 *
 * Deliberately conservative: a field it cannot find with confidence is left
 * null for the user to fill, rather than guessed. A wrong company name on a
 * cover letter is worse than a blank one, because a blank gets noticed.
 */
function parseAdvertisement(adText) {
  const text = String(adText || '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const labelled = (re) => {
    const m = text.match(re);
    return m ? m[1].trim().replace(/[.,;]+$/, '') : null;
  };

  const title =
    labelled(/(?:^|\n)\s*(?:job\s+)?title\s*[:\-]\s*(.+)/i) ||
    labelled(/(?:^|\n)\s*position\s*[:\-]\s*(.+)/i) ||
    // Otherwise the first line, if it reads like a title rather than a sentence.
    (lines[0] && lines[0].length <= 80 && !/[.!?]$/.test(lines[0]) ? lines[0] : null);

  const company =
    labelled(/(?:^|\n)\s*(?:company|employer|organisation|organization)\s*[:\-]\s*(.+)/i) ||
    labelled(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})\s+(?:we|is|are)\b/);

  const location = labelled(/(?:^|\n)\s*location\s*[:\-]\s*(.+)/i);
  const url = (text.match(/https?:\/\/[^\s)]+/) || [])[0] || null;

  // Salary: a range in either order, with or without a currency symbol.
  const salary = (() => {
    const m = text.match(/\$\s?([\d,]{4,})\s*(?:-|–|to)\s*\$?\s?([\d,]{4,})/);
    if (!m) return { min: null, max: null };
    const n = (s) => Number(String(s).replace(/,/g, ''));
    return { min: n(m[1]), max: n(m[2]) };
  })();

  const years = (() => {
    const m = text.match(/(\d+)\s*\+?\s*(?:-|–|to)?\s*(\d+)?\s*years?(?:['’]|\s+of)?\s+experience/i);
    return m ? Number(m[1]) : null;
  })();

  const skills = parseJobSkills(text);
  const criteria = parseCriteria(
    (text.match(/(?:selection|key|essential)\s+criteri(?:a|on)[\s\S]{0,3000}/i) || [''])[0]
  );

  return {
    title,
    company,
    location,
    url,
    adText: text,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
    minYearsExperience: years,
    salaryMin: salary.min,
    salaryMax: salary.max,
    criteria,
    // Named so a UI can prompt for exactly what is missing rather than
    // showing a generic "check the details" warning.
    missingFields: ['title', 'company'].filter((f) => !({ title, company })[f])
  };
}

/**
 * Build the full application pack for one job.
 *
 * Everything a person needs to open the advertisement and complete it in one
 * pass, generated from their real material.
 */
function buildPack(profile, job, opts) {
  const o = opts || {};
  const assessment = assess(profile, job);

  // A blocked job gets no documents. Generating a polished cover letter for
  // an application that cannot succeed wastes the reader's attention on the
  // wrong thing, and quietly encourages sending it.
  if (!assessment.passed) {
    return {
      job,
      assessment,
      recommendation: 'skip',
      why: assessment.blockers.map((b) => b.reason),
      documents: null
    };
  }

  const letter = coverLetter(profile, job, o.letter);
  const criteria = (job.criteria && job.criteria.length)
    ? draftAll(job.criteria, profile.resumeText, o.criteria)
    : null;
  const ats = checkResume(profile.resumeText, job.adText);

  const blockingAts = ats.findings.filter((f) => f.severity === 'critical');
  const recommendation = blockingAts.length ? 'fix-first' : 'ready';

  return {
    job,
    assessment,
    recommendation,
    why: blockingAts.length
      ? blockingAts.map((f) => f.title)
      : [assessment.verdict.headline],
    documents: {
      coverLetter: letter,
      selectionCriteria: criteria,
      atsCheck: ats
    },
    // Total human work left, so the queue can be ordered by effort as well as
    // by fit — the honest answer to "what should I do next".
    gapsToFill: letter.gaps + (criteria ? criteria.totalGaps : 0)
  };
}

/**
 * The whole batch.
 *
 * `jobs` may be parsed advertisement objects, or raw text blobs which are
 * parsed here.
 */
function buildQueue(profile, jobs, opts) {
  const packs = (jobs || []).map((j) => {
    const job = typeof j === 'string' ? parseAdvertisement(j) : j;
    return buildPack(profile, job, opts);
  });

  const ranked = rank(packs.map((p) => p.assessment));
  const order = new Map(ranked.map((a, i) => [a, i]));
  packs.sort((a, b) => order.get(a.assessment) - order.get(b.assessment));

  const byRec = (r) => packs.filter((p) => p.recommendation === r);

  return {
    packs,
    ready: byRec('ready'),
    fixFirst: byRec('fix-first'),
    skip: byRec('skip'),
    summary: {
      total: packs.length,
      ready: byRec('ready').length,
      fixFirst: byRec('fix-first').length,
      skipped: byRec('skip').length,
      totalGaps: packs.reduce((n, p) => n + (p.gapsToFill || 0), 0)
    },
    // One fix to the resume can move every job out of fix-first at once, so
    // it is worth doing before touching the queue.
    sharedResumeFixes: sharedFixes(packs)
  };
}

/**
 * Findings that apply to the resume itself rather than to one advertisement.
 * These are the highest-leverage work in the whole queue: fix once, and every
 * application improves.
 */
function sharedFixes(packs) {
  const counts = new Map();
  for (const p of packs) {
    if (!p.documents) continue;
    for (const f of p.documents.atsCheck.findings) {
      if (f.id === 'job-keyword-gap') continue; // per-advertisement, not shared
      const seen = counts.get(f.id) || { finding: f, jobs: 0 };
      seen.jobs += 1;
      counts.set(f.id, seen);
    }
  }
  return [...counts.values()]
    .filter((c) => c.jobs > 1)
    .sort((a, b) => b.jobs - a.jobs)
    .map((c) => ({ ...c.finding, affectsJobs: c.jobs }));
}

/**
 * Move an application along. Returns a new record rather than mutating, and
 * keeps the whole history — "when did I apply" is the question this answers.
 */
function transition(record, status, note) {
  if (STATUSES.indexOf(status) === -1) throw new Error('Unknown status: ' + status);
  const at = new Date().toISOString();
  return {
    ...record,
    status,
    updatedAt: at,
    history: (record.history || []).concat([{ status, at, note: note || null }])
  };
}

/** Applications that have gone quiet. Following up is the cheapest win there is. */
function needsFollowUp(records, days) {
  const cutoff = Date.now() - (days || 10) * 86400000;
  return (records || []).filter((r) => {
    if (r.status !== 'applied') return false;
    const t = Date.parse(r.updatedAt || '');
    return Number.isFinite(t) && t < cutoff;
  });
}


  // ---- packages/prep/src/interview.js
/**
 * interview.js — work out what you will actually be asked, and whether you
 * have an answer.
 *
 * THE INSIGHT THIS RESTS ON
 *
 * An interview is not a random quiz. For a structured or semi-structured
 * process — which is most of them now — the questions are generated from the
 * same document you already have: the advertisement. Every required skill is a
 * question. Every gap between the ad and your resume is a question, and it is
 * the one they will press on, because it is the obvious risk in your
 * application and the interviewer can see it as clearly as you can.
 *
 * So this does not guess at questions. It derives them from the requirements,
 * pairs each with the evidence already in your resume, and marks the ones
 * where you have nothing — those are the ones to prepare, and preparing three
 * of those beats rehearsing twenty you can already answer.
 *
 * No model is involved. The questions come from templates applied to the
 * requirements, which is exactly how a hiring manager writes them.
 */




/**
 * Question shapes for a technical requirement.
 *
 * Deliberately the four an interviewer actually reaches for: prove it,
 * measure it, when it went wrong, and how you decide. The fourth is the one
 * candidates prepare least and senior interviewers weight most.
 */
const TECHNICAL_FRAMES = [
  { id: 'prove', ask: (s) => `Talk me through something you have built with ${s}.` },
  { id: 'depth', ask: (s) => `How deep does your ${s} experience go — what have you done beyond the basics?` },
  { id: 'failure', ask: (s) => `Tell me about a time ${s} went wrong on you. What happened and what did you change?` },
  { id: 'judgement', ask: (s) => `When would you NOT use ${s}?` }
];

/** Questions that exist because of a gap, not because of a strength. */
const GAP_FRAMES = [
  { id: 'missing', ask: (s) => `We use ${s} heavily and I do not see it on your resume. Where are you with it?` },
  { id: 'ramp', ask: (s) => `How quickly could you get productive with ${s}?` }
];

const BEHAVIOURAL_QUESTIONS = {
  communication: [
    'Tell me about a time you had to explain something technical to someone without your background.',
    'Describe a disagreement with a stakeholder and how it ended.'
  ],
  teamwork: [
    'Tell me about a time the outcome depended on someone else delivering, and they were struggling.',
    'What is the hardest team you have worked in, and why?'
  ],
  'problem-solving': [
    'Describe the hardest bug or problem you have solved. How did you narrow it down?',
    'Tell me about a time the obvious solution was the wrong one.'
  ],
  initiative: [
    'What have you started that nobody asked you to start?',
    'Tell me about a time you saw a problem outside your remit and acted on it.'
  ],
  planning: [
    'Describe a time you had more work than time. How did you decide what not to do?',
    'Tell me about a deadline you missed.'
  ],
  leadership: [
    'Tell me about someone you have mentored. Where are they now?',
    'Describe a time you had to give difficult feedback.'
  ],
  change: [
    'Tell me about a time the requirements changed after you had started.',
    'How do you work when the goal is genuinely unclear?'
  ],
  integrity: [
    'Tell me about a time doing the right thing cost you something.',
    'Describe a situation where you disagreed with a decision but had to carry it out.'
  ]
};

/** Questions worth asking THEM. The ones that get real answers. */
const QUESTIONS_TO_ASK = [
  { q: 'What does the first ninety days look like for whoever takes this?',
    why: 'A vague answer usually means the role is not scoped, which is the most common reason a good hire fails.' },
  { q: 'Why is this role open?',
    why: 'Growth and backfill are different jobs. If it is a backfill, ask what the last person found hard.' },
  { q: 'How does work get prioritised when two teams want the same thing?',
    why: 'Every organisation has this problem. The interesting part is whether they have an answer or a shrug.' },
  { q: 'What is the on-call expectation, honestly?',
    why: 'Asked plainly, this is hard to dodge, and it is the single largest quality-of-life variable.' },
  { q: 'What would make you regret hiring someone into this role?',
    why: 'Inverts the usual framing and tends to produce a genuine answer about the team, not a rehearsed one.' }
];

/**
 * Build the prep sheet.
 *
 * Ordering is the useful part: questions you cannot answer come FIRST,
 * because prep time is finite and rehearsing the ones you already have is
 * how people feel prepared and are not.
 */
function prepare(profile, job, opts) {
  const o = opts || {};
  const p = profile || {};
  const j = job || {};

  const required = (j.requiredSkills || []).map(canonicalise);
  const preferred = (j.preferredSkills || []).map(canonicalise);
  const all = required.concat(preferred.filter((s) => required.indexOf(s) === -1));

  const ev = evidenceFor(p.resumeText, all);
  const evBySkill = new Map(ev.map((e) => [e.skill, e]));

  const technical = [];
  for (const skill of all) {
    const e = evBySkill.get(skill);
    const isRequired = required.indexOf(skill) !== -1;
    const frames = e && e.hasEvidence ? TECHNICAL_FRAMES : GAP_FRAMES;

    for (const f of frames) {
      technical.push({
        id: `${skill}:${f.id}`,
        skill,
        required: isRequired,
        question: f.ask(label(skill, j)),
        haveAnswer: !!(e && e.hasEvidence),
        evidence: e && e.hasEvidence ? e.text : null,
        // The judgement frame is answerable from opinion, not from the resume,
        // so a missing line is not a gap there.
        priority: !e || !e.hasEvidence
          ? (isRequired ? 1 : 2)
          : f.id === 'failure' || f.id === 'judgement' ? 3 : 4
      });
    }
  }
  technical.sort((a, b) => a.priority - b.priority);

  // Behavioural questions come from the ad's own language.
  const adKinds = behaviouralKind(String(j.adText || '') + ' ' + (j.criteria || []).join(' '));
  const behavioural = [];
  for (const k of adKinds) {
    for (const q of BEHAVIOURAL_QUESTIONS[k.id] || []) {
      behavioural.push({ kind: k.id, question: q, prompt: k.prompt });
    }
  }
  // Every interview asks at least one of these, whatever the ad says.
  if (!behavioural.length) {
    behavioural.push(
      { kind: 'problem-solving', question: BEHAVIOURAL_QUESTIONS['problem-solving'][0], prompt: null },
      { kind: 'teamwork', question: BEHAVIOURAL_QUESTIONS.teamwork[0], prompt: null }
    );
  }

  const unanswered = technical.filter((t) => !t.haveAnswer);

  return {
    technical: o.limit ? technical.slice(0, o.limit) : technical,
    behavioural,
    questionsToAsk: QUESTIONS_TO_ASK,
    unanswered,
    summary: {
      total: technical.length + behavioural.length,
      withoutAnAnswer: unanswered.length,
      // The honest headline. "You have 24 questions" is noise; "three of them
      // you cannot currently answer" is a plan for the evening.
      advice: unanswered.length
        ? `${unanswered.length} question${unanswered.length === 1 ? '' : 's'} you have no evidence for. ` +
          'Prepare those first — they are where the interview will actually go.'
        : 'Every requirement in the ad is backed by something in your resume. Rehearse the ' +
          'failure and judgement questions; those are the ones people under-prepare.'
    }
  };
}

/** Prefer the advertisement's own word over the internal canonical name. */
function label(canonical, job) {
  return surfaceForm(canonical, job && job.adText, canonical);
}


  // ---- packages/prep/src/tailor.js
/**
 * tailor.js — concrete edits to make one resume fit one advertisement.
 *
 * WHERE THE LINE IS
 *
 * Tailoring a resume is legitimate and expected: you emphasise the relevant
 * work and use the words the reader is searching for. Inventing experience is
 * not, and the boundary between them is exactly the boundary this module
 * enforces — it will only ever suggest surfacing something you already wrote,
 * or rewording something you already wrote. It will never suggest adding a
 * skill that is not in your resume.
 *
 * Where the advertisement asks for something you genuinely do not have, the
 * suggestion is "you do not have this", not "add this". That is the difference
 * between a tool that gets you an interview and one that gets you caught out
 * in it.
 */



/** An edit the user can accept or ignore, with the reason attached. */
function edit(kind, severity, what, why, how) {
  return { kind, severity, what, why, how };
}

/**
 * Words the advertisement leans on that the resume never uses — but only where
 * the resume ALREADY demonstrates the thing under another name. That is a
 * rewording suggestion, not a fabrication.
 */
function vocabularyEdits(resumeText, job) {
  const out = [];
  const ad = String(job.adText || '');
  const inResume = new Set(extractSkills(resumeText));

  for (const skill of (job.requiredSkills || []).concat(job.preferredSkills || [])) {
    const c = canonicalise(skill);
    if (!inResume.has(c)) continue;

    const theirWord = surfaceForm(c, ad, null);
    const yourWord = surfaceForm(c, resumeText, null);
    if (!theirWord || !yourWord) continue;
    if (normalise(theirWord) === normalise(yourWord)) continue;

    out.push(edit(
      'vocabulary', 'high',
      `They write "${theirWord}", your resume writes "${yourWord}"`,
      'A keyword search matches the literal string. A recruiter filtering on their own wording ' +
        'will not find yours, even though you have the skill.',
      `Use both once: "${yourWord} (${theirWord})". One mention of each form covers both searches ` +
        'and costs you nine characters.'
    ));
  }
  return out;
}

/**
 * Achievements that mention a required skill but are buried at the bottom.
 * Moving one line is the cheapest edit there is.
 */
function orderEdits(resumeText, job) {
  const all = statements(resumeText);
  if (all.length < 6) return [];
  const required = (job.requiredSkills || []).map(canonicalise);
  if (!required.length) return [];

  const out = [];
  const lastThird = all.slice(Math.floor(all.length * 0.66));
  const firstThird = all.slice(0, Math.floor(all.length * 0.34));
  const topSkills = new Set(firstThird.flatMap((s) => extractSkills(s.text)));

  for (const st of lastThird) {
    const hits = extractSkills(st.text).filter((s) => required.indexOf(s) !== -1 && !topSkills.has(s));
    if (!hits.length) continue;
    out.push(edit(
      'order', 'high',
      `A required skill only appears near the end: ${hits.join(', ')}`,
      'A recruiter reads the top third. An achievement below it is filed as "not their focus", ' +
        'whatever it says.',
      `Move this line up, or echo it in your summary: "${st.text.slice(0, 110)}${st.text.length > 110 ? '…' : ''}"`
    ));
  }
  return out.slice(0, 3);
}

/** Achievements with no number, where the job is one that will ask for numbers. */
function evidenceEdits(resumeText, job) {
  const required = (job.requiredSkills || []).map(canonicalise);
  const out = [];
  for (const st of statements(resumeText)) {
    if (isQuantified(st.text)) continue;
    const hits = extractSkills(st.text).filter((s) => required.indexOf(s) !== -1);
    if (!hits.length) continue;
    out.push(edit(
      'evidence', 'medium',
      `No measure on a line about ${hits.join(', ')}`,
      'This is the work they are hiring for, and the line does not say how much of it you did ' +
        'or what changed.',
      `Add scale or outcome to: "${st.text.slice(0, 110)}${st.text.length > 110 ? '…' : ''}" — ` +
        'how many, how much, how much faster. An approximation is fine; an invention is not.'
    ));
  }
  return out.slice(0, 3);
}

/** Requirements you genuinely do not have. Stated, never "fixed". */
function honestGaps(resumeText, job) {
  const inResume = new Set(extractSkills(resumeText));
  const missing = (job.requiredSkills || [])
    .map(canonicalise)
    .filter((s) => !inResume.has(s));

  return missing.map((s) => edit(
    'gap', 'critical',
    `The ad requires ${surfaceForm(s, job.adText, s)} and your resume does not mention it`,
    'This is a real gap, not a wording problem.',
    'If you have done it, add a real achievement. If you have not, do NOT add the keyword — ' +
      'you would pass the filter and fail the first technical question, having spent the ' +
      'interview slot to do it.'
  ));
}

/**
 * The summary line at the top, which is the highest-leverage 30 words on the
 * page and is usually written once and never touched again.
 */
function summaryEdit(resumeText, job) {
  const first = statements(resumeText)[0];
  const required = (job.requiredSkills || []).map(canonicalise).slice(0, 3);
  if (!required.length) return [];
  const inSummary = first ? new Set(extractSkills(first.text)) : new Set();
  const absent = required.filter((s) => !inSummary.has(s));
  if (!absent.length) return [];

  return [edit(
    'summary', 'high',
    `Your opening lines do not mention ${absent.map((s) => surfaceForm(s, job.adText, s)).join(', ')}`,
    'The summary is read first and skimmed hardest, and it is the part most people write once ' +
      'and never revisit per application.',
    'Rewrite the summary for this job, naming the two or three things the ad leads with — ' +
      'provided you can back them up further down.'
  )];
}

function tailor(profile, job) {
  const resumeText = (profile || {}).resumeText || '';
  const j = job || {};
  if (!resumeText.trim()) {
    return { edits: [], counts: { critical: 0, high: 0, medium: 0 }, note: 'No resume to tailor.' };
  }

  const edits = [
    ...honestGaps(resumeText, j),
    ...vocabularyEdits(resumeText, j),
    ...summaryEdit(resumeText, j),
    ...orderEdits(resumeText, j),
    ...evidenceEdits(resumeText, j)
  ];

  const rank = { critical: 0, high: 1, medium: 2 };
  edits.sort((a, b) => rank[a.severity] - rank[b.severity]);

  return {
    edits,
    counts: {
      critical: edits.filter((e) => e.severity === 'critical').length,
      high: edits.filter((e) => e.severity === 'high').length,
      medium: edits.filter((e) => e.severity === 'medium').length
    },
    note: edits.length
      ? 'Every suggestion above either surfaces or rewords something already in your resume. ' +
        'None of them adds experience you do not have — that is the line between tailoring and ' +
        'lying, and it is where this tool stops.'
      : 'Nothing to change for this one. Your resume already uses their vocabulary and leads ' +
        'with what they asked for.'
  };
}


  // ---- packages/prep/src/followup.js
/**
 * followup.js — the messages people know they should send and do not.
 *
 * Following up is the cheapest advantage in a job search and almost nobody
 * does it, because writing the message from a blank page feels like begging.
 * It is not: a recruiter managing forty applications genuinely loses track,
 * and a short, specific note moves you back to the top of a list.
 *
 * These are short on purpose. A long follow-up reads as anxiety; three
 * sentences reads as professional. Everything specific is a marked blank,
 * because the specific part is what makes it work and it is the part only the
 * applicant knows.
 */


const TEMPLATES = {
  'after-applying': {
    label: 'After applying, no response',
    wait: 10,
    subject: (j) => `Application for ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `I applied for the ${j.title || GAP('role')} role${j.company ? ' at ' + j.company : ''} on ` +
        `${GAP('date')} and wanted to make sure it reached you.`,
      '',
      `${GAP('one sentence on the single most relevant thing you have done — the one that matches ' +
        'their top requirement. Not a summary of your resume; they have that')}`,
      '',
      'Happy to answer anything useful in the meantime.',
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Send about ten working days after applying. Sooner reads as impatient; much later and ' +
      'the shortlist is closed.'
  },

  'after-interview': {
    label: 'After an interview',
    wait: 1,
    subject: (j) => `Thank you — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Thank you for your time ${GAP('yesterday / on Tuesday')}.`,
      '',
      `${GAP('name ONE specific thing from the conversation — a problem they described, a ' +
        'decision they are weighing. This is the whole point of the message: it proves you were ' +
        'listening and it is what they will remember')}`,
      '',
      `${GAP('optional, and powerful: if a question caught you out, answer it properly here in ' +
        'two sentences. Interviewers rate this highly and almost nobody does it')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Send within 24 hours, while they are still writing up their notes. This is the single ' +
      'highest-return message in the whole process.'
  },

  'chasing-decision': {
    label: 'Chasing a decision after an interview',
    wait: 7,
    subject: (j) => `Following up — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Following up on the ${j.title || GAP('role')} role — is there an update, or anything else ` +
        'you need from me?',
      '',
      `${GAP('only if true: mention a competing timeline. It is legitimate pressure and it works. ' +
        'Do not invent one — it is checkable and the bluff ends the process')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'A week after the date they gave you, not a week after the interview. If they gave no ' +
      'date, ask for one at the interview — that is what makes this message easy to write.'
  },

  'after-rejection': {
    label: 'After a rejection',
    wait: 0,
    subject: (j) => `Thank you — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Thank you for letting me know${j.company ? ' about the ' + (j.title || 'role') + ' at ' + j.company : ''}.`,
      '',
      'If you have a moment, I would genuinely value one thing I could have done better — it ' +
        'helps more than you would think.',
      '',
      `${GAP('optional: say you would like to be considered for future roles. Recruiters keep ' +
        'these notes, and a gracious rejection reply is rare enough to be memorable')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Most people send nothing. A short, ungrudging reply is remembered, and second-choice ' +
      'candidates get called back more often than anyone admits.'
  }
};

function draft(kind, profile, job) {
  const t = TEMPLATES[kind];
  if (!t) throw new Error('Unknown follow-up: ' + kind);
  const p = profile || {};
  const j = job || {};
  const body = t.body(p, j);
  return {
    kind,
    label: t.label,
    subject: t.subject(j),
    body,
    note: t.note,
    waitDays: t.wait,
    gaps: (body.match(/\[[^\]]+\]/g) || []).length
  };
}

/** Which message is due, given where the application is and how long it has sat. */
function suggest(status, daysSince) {
  if (status === 'applied' && daysSince >= TEMPLATES['after-applying'].wait) return 'after-applying';
  if (status === 'interviewing' && daysSince <= 1) return 'after-interview';
  if (status === 'interviewing' && daysSince >= TEMPLATES['chasing-decision'].wait) return 'chasing-decision';
  if (status === 'rejected') return 'after-rejection';
  return null;
}


  // ---- packages/autofill/src/fieldmap.js
/**
 * fieldmap.js — decide what a form field is asking for, and what to put in it.
 *
 * THIS IS THE ENGINE THE WHOLE AUTO-APPLY RESTS ON.
 *
 * Every hands-off applier on the market has the same documented failure:
 * it fills fields with errors at scale. A wrong work-authorisation answer, a
 * mis-typed salary band, a yes that should have been a no — replicated across
 * forty applications before anyone notices, each one a silent knockout.
 *
 * That failure is not inevitable. It comes from mapping fields by guesswork
 * and never checking the result. So this module does three things differently:
 *
 *   1. It identifies a field from EVERY signal available — the associated
 *      <label>, aria-label, name, id, placeholder, and the surrounding text —
 *      and scores them, rather than pattern-matching one attribute.
 *   2. It returns a CONFIDENCE, and the runner refuses to fill low-confidence
 *      fields rather than guessing.
 *   3. It marks knockout fields. Those are never inferred, ever. If the user
 *      has not given an explicit answer, the application stops.
 *
 * A field this module cannot identify is reported as unknown. That is the
 * correct answer and it is what keeps the machine honest.
 */

/**
 * KNOCKOUT FIELDS.
 *
 * Answer one of these wrong and the application is dead before a human sees
 * it — most ATS treat them as auto-reject filters. They are never guessed,
 * never defaulted, and never inferred from the resume. The user sets them
 * once, explicitly, or the run stops.
 */
const KNOCKOUT = new Set([
  'workAuthorisation', 'visaSponsorship', 'salaryExpectation', 'noticePeriod',
  'rightToWork', 'securityClearance', 'driversLicence', 'willingToRelocate',
  'criminalRecord', 'referredBy', 'previouslyEmployed'
]);

/**
 * Field definitions. `patterns` are matched against the field's combined
 * signals; `weight` breaks ties when two definitions both match, so the more
 * specific one wins ("current salary" must not resolve to "salary expected").
 */
const FIELDS = [
  // --- identity -----------------------------------------------------------
  { key: 'firstName', weight: 10, patterns: [/\bfirst\s*name\b/, /\bgiven\s*name\b/, /^fname$/, /\bforename\b/] },
  { key: 'lastName', weight: 10, patterns: [/\blast\s*name\b/, /\bsurname\b/, /\bfamily\s*name\b/, /^lname$/] },
  { key: 'fullName', weight: 5, patterns: [/\bfull\s*name\b/, /^name$/, /\byour\s*name\b/, /\blegal\s*name\b/] },
  { key: 'preferredName', weight: 8, patterns: [/\bpreferred\s*name\b/, /\bnickname\b/, /\bgoes\s*by\b/] },
  { key: 'email', weight: 12, patterns: [/\be-?mail\b/, /\bemail\s*address\b/] },
  { key: 'phone', weight: 10, patterns: [/\bphone\b/, /\bmobile\b/, /\btelephone\b/, /\bcontact\s*number\b/] },

  // --- location -----------------------------------------------------------
  { key: 'addressLine1', weight: 9, patterns: [/\baddress\s*(line\s*)?1\b/, /\bstreet\s*address\b/, /^address$/] },
  { key: 'city', weight: 10, patterns: [/\bcity\b/, /\bsuburb\b/, /\btown\b/, /\blocality\b/] },
  { key: 'state', weight: 9, patterns: [/\bstate\b/, /\bprovince\b/, /\bregion\b/, /\bcounty\b/] },
  { key: 'postcode', weight: 10, patterns: [/\bpost\s*code\b/, /\bzip\b/, /\bpostal\s*code\b/] },
  { key: 'country', weight: 9, patterns: [/\bcountry\b/] },

  // --- links --------------------------------------------------------------
  { key: 'linkedin', weight: 12, patterns: [/\blinked\s*in\b/] },
  { key: 'github', weight: 12, patterns: [/\bgit\s*hub\b/] },
  { key: 'portfolio', weight: 8, patterns: [/\bportfolio\b/, /\bpersonal\s*(web)?site\b/, /\bwebsite\b/] },

  // --- documents ----------------------------------------------------------
  { key: 'resume', weight: 12, patterns: [/\bresume\b/, /\bcv\b/, /\bcurriculum\s*vitae\b/] },
  { key: 'coverLetter', weight: 12, patterns: [/\bcover\s*letter\b/, /\bmotivation\s*letter\b/] },

  // --- knockouts ----------------------------------------------------------
  // Ordered before the looser salary/experience patterns so the specific
  // wording wins.
  { key: 'workAuthorisation', weight: 20, knockout: true,
    patterns: [/\bwork\s*authorisation\b/, /\bwork\s*authorization\b/, /\blegally\s*(?:authoris|authoriz)ed\b/,
               /\beligible\s*to\s*work\b/, /\bright\s*to\s*work\b/, /\bwork\s*permit\b/] },
  { key: 'visaSponsorship', weight: 20, knockout: true,
    patterns: [/\bsponsorship\b/, /\bvisa\s*support\b/, /\brequire\s*sponsorship\b/, /\bsponsor(ing)?\s*(a\s*)?visa\b/] },
  { key: 'salaryExpectation', weight: 18, knockout: true,
    patterns: [/\b(?:salary|compensation|remuneration)\s*(?:expectation|expected|requirement)/,
               /\bexpected\s*(?:salary|compensation|pay)\b/, /\bdesired\s*(?:salary|compensation)\b/] },
  { key: 'currentSalary', weight: 19,
    patterns: [/\bcurrent\s*(?:salary|compensation|pay)\b/, /\bpresent\s*salary\b/] },
  { key: 'noticePeriod', weight: 18, knockout: true,
    patterns: [/\bnotice\s*period\b/, /\bhow\s*soon\s*can\s*you\s*start\b/, /\bavailab(?:le|ility)\s*(?:to\s*)?start\b/,
               /\bstart\s*date\b/] },
  { key: 'securityClearance', weight: 20, knockout: true,
    patterns: [/\bsecurity\s*clearance\b/, /\bbaseline\s*clearance\b/, /\bnv1\b/, /\bnegative\s*vetting\b/] },
  { key: 'driversLicence', weight: 18, knockout: true,
    patterns: [/\bdriver'?s?\s*licen[cs]e\b/, /\bvalid\s*licen[cs]e\b/] },
  { key: 'willingToRelocate', weight: 18, knockout: true,
    patterns: [/\brelocat(?:e|ion)\b/, /\bwilling\s*to\s*move\b/] },
  { key: 'criminalRecord', weight: 20, knockout: true,
    patterns: [/\bcriminal\s*(?:record|history|conviction)\b/, /\bpolice\s*check\b/, /\bbackground\s*check\b/] },
  { key: 'referredBy', weight: 15, knockout: true,
    patterns: [/\breferred\s*by\b/, /\bhow\s*did\s*you\s*hear\b/, /\breferral\s*source\b/] },
  { key: 'previouslyEmployed', weight: 18, knockout: true,
    patterns: [/\bpreviously\s*(?:employed|worked)\b/, /\bformer\s*employee\b/, /\bworked\s*(?:here|for\s*us)\b/] },

  // --- experience ---------------------------------------------------------
  { key: 'yearsExperience', weight: 12,
    patterns: [/\byears\s*of\s*experience\b/, /\bhow\s*many\s*years\b/, /\bexperience\s*\(years\)/] },

  // --- equal opportunity --------------------------------------------------
  // Identified so it can be deliberately SKIPPED, not filled. These are
  // voluntary and legally sensitive, and a bot answering them for someone is
  // the wrong default in every jurisdiction.
  { key: 'eeoGender', weight: 20, voluntary: true, patterns: [/\bgender\b/, /\bsex\b/] },
  { key: 'eeoRace', weight: 20, voluntary: true, patterns: [/\brace\b/, /\bethnic(?:ity)?\b/] },
  { key: 'eeoDisability', weight: 20, voluntary: true, patterns: [/\bdisabilit(?:y|ies)\b/] },
  { key: 'eeoVeteran', weight: 20, voluntary: true, patterns: [/\bveteran\b/, /\bmilitary\s*service\b/] },
  { key: 'eeoIndigenous', weight: 20, voluntary: true,
    patterns: [/\baboriginal\b/, /\btorres\s*strait\b/, /\bindigenous\b/, /\bfirst\s*nations\b/] }
];

/** Never touched, whatever the labels say. */
const NEVER_FILL = [
  { key: 'password', patterns: [/\bpassword\b/, /\bpasscode\b/] },
  { key: 'payment', patterns: [/\bcard\s*number\b/, /\bcvv\b/, /\bcredit\s*card\b/, /\biban\b/, /\bbsb\b/, /\baccount\s*number\b/] },
  { key: 'government-id', patterns: [/\bssn\b/, /\bsocial\s*security\b/, /\btax\s*file\s*number\b/, /\btfn\b/, /\bpassport\s*number\b/] },
  { key: 'captcha', patterns: [/\bcaptcha\b/, /\brecaptcha\b/, /\bare\s*you\s*(?:a\s*)?human\b/] }
];

function normaliseLabel(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Every signal a field carries about what it wants.
 *
 * Taking all of them, rather than one, is what makes this work across ATS
 * platforms that each expose a different subset: Greenhouse gives clean
 * labels, Workday leans on aria-label, older systems have nothing but a
 * cryptic `name`.
 */
function signals(field) {
  const f = field || {};
  return [f.label, f.ariaLabel, f.name, f.id, f.placeholder, f.title, f.nearbyText]
    .filter(Boolean).map(normaliseLabel);
}

/**
 * Identify one field.
 *
 * Returns { key, confidence, knockout, voluntary, matchedOn } — or a key of
 * null when nothing matched well enough, which is a real answer and not a
 * failure.
 */
function identify(field) {
  const sig = signals(field);
  if (!sig.length) return { key: null, confidence: 0, reason: 'the field carries no label, name, id or placeholder' };

  const type = normaliseLabel((field || {}).type);
  if (type === 'password') {
    return { key: null, confidence: 1, refuse: 'password', reason: 'password fields are never filled' };
  }

  for (const n of NEVER_FILL) {
    for (const s of sig) {
      if (n.patterns.some((p) => p.test(s))) {
        return { key: null, confidence: 1, refuse: n.key,
          reason: `looks like a ${n.key} field, which is never filled automatically` };
      }
    }
  }

  let best = null;
  for (const def of FIELDS) {
    for (let i = 0; i < sig.length; i++) {
      const s = sig[i];
      if (!def.patterns.some((p) => p.test(s))) continue;
      // A hit on the visible label beats a hit on a machine name: labels are
      // what the human reading the form sees, and are far less likely to be
      // reused for something else.
      const positionBonus = i === 0 ? 3 : i === 1 ? 2 : 0;
      const score = def.weight + positionBonus;
      if (!best || score > best.score) {
        best = { key: def.key, score, knockout: !!def.knockout, voluntary: !!def.voluntary, matchedOn: sig[i] };
      }
    }
  }

  if (!best) {
    return { key: null, confidence: 0,
      reason: `no rule matched "${sig[0]}" — this field needs a human, or an answer-bank entry` };
  }

  // Confidence is the score normalised against the strongest possible match.
  const confidence = Math.min(1, best.score / 23);
  return {
    key: best.key,
    confidence: Math.round(confidence * 100) / 100,
    knockout: best.knockout,
    voluntary: best.voluntary,
    matchedOn: best.matchedOn
  };
}

/**
 * What to put in an identified field, given a profile and an answer bank.
 *
 * The refusals here are the product. A knockout field with no explicit answer
 * returns a pause, not a guess — that single rule is the difference between
 * this and every tool whose reviews complain about mis-toggled work
 * authorisation across forty applications.
 */
function valueFor(id, profile, answers) {
  const p = profile || {};
  const a = answers || {};

  // Refusal is checked BEFORE the null-key case. Both have key === null, so
  // testing the key first swallowed every refusal and reported it as an
  // ordinary skip — losing the difference between "I could not identify this"
  // and "I will never touch this", which is exactly the distinction the audit
  // log exists to show.
  if (id && id.refuse) return { action: 'refuse', why: id.reason, refused: id.refuse };
  if (!id || !id.key) return { action: 'skip', why: (id && id.reason) || 'unidentified field' };

  if (id.voluntary) {
    return {
      action: 'skip',
      why: 'Equal-opportunity questions are voluntary and legally sensitive. A machine should ' +
        'not answer them on your behalf — fill these yourself if you want to.'
    };
  }

  if (id.knockout) {
    const explicit = a[id.key];
    if (explicit === undefined || explicit === null || explicit === '') {
      return {
        action: 'pause',
        why: `"${id.key}" is a knockout question — answered wrong, the application is rejected ` +
          'before a person sees it. There is no saved answer, and it will not be guessed.'
      };
    }
    return { action: 'fill', value: explicit, source: 'answer-bank', knockout: true };
  }

  if (id.confidence < 0.55) {
    return { action: 'pause', why: `not confident enough about this field (${id.confidence}) to fill it` };
  }

  const direct = {
    firstName: p.firstName || (p.name || '').split(/\s+/)[0],
    lastName: p.lastName || (p.name || '').split(/\s+/).slice(1).join(' '),
    fullName: p.name,
    preferredName: p.preferredName || p.firstName || (p.name || '').split(/\s+/)[0],
    email: p.email,
    phone: p.phone,
    addressLine1: p.addressLine1,
    city: p.city,
    state: p.state,
    postcode: p.postcode,
    country: p.country,
    linkedin: p.linkedin,
    github: p.github,
    portfolio: p.portfolio,
    yearsExperience: p.yearsExperience,
    currentSalary: a.currentSalary,
    resume: p.resumeFileName,
    coverLetter: p.coverLetterText
  }[id.key];

  if (direct === undefined || direct === null || direct === '') {
    return { action: 'pause', why: `nothing in your profile answers "${id.key}"` };
  }
  return { action: 'fill', value: String(direct), source: 'profile', knockout: false };
}


  // ---- packages/autofill/src/answers.js
/**
 * answers.js — the answer bank for screening questions.
 *
 * WHY THIS IS A SEPARATE, EXPLICIT THING
 *
 * The published complaints about every hands-off applier land in the same
 * place: it answered a screening question wrong, and it did so on every
 * application before anyone noticed. A mis-toggled work-authorisation answer
 * is not a small error — most applicant tracking systems treat those fields
 * as auto-reject filters, so the application dies before a person reads it.
 *
 * The fix is not better guessing. It is refusing to guess: the user answers
 * each knockout question ONCE, deliberately, and the runner stops on any
 * question that has no answer. A stopped run costs a minute. Forty silently
 * wrong applications cost the search.
 *
 * The bank is also where free-text screening answers live, so the same
 * question asked by the fourteenth employer is answered consistently — which
 * is worth having on its own, since inconsistent answers across applications
 * to the same company group is a real way to get filtered.
 */

/**
 * The questions worth answering once. Each carries WHY it matters, because a
 * user filling this in deserves to know which answers are load-bearing.
 */
const STANDARD = [
  { key: 'workAuthorisation', type: 'choice', options: ['Yes', 'No'],
    question: 'Are you legally authorised to work in the country this job is in?',
    why: 'An auto-reject filter in nearly every ATS. Answered wrong, nothing else you wrote matters.' },
  { key: 'visaSponsorship', type: 'choice', options: ['Yes', 'No'],
    question: 'Will you now or in the future require visa sponsorship?',
    why: 'Also an auto-reject filter, and the one most often answered backwards — note that ' +
      '"Yes" here means you DO need sponsorship, which many employers screen out.' },
  { key: 'salaryExpectation', type: 'text',
    question: 'Your salary expectation',
    why: 'A number here is a commitment. Some fields will not accept a range or "negotiable", ' +
      'which is why it needs a considered answer rather than a default.' },
  { key: 'noticePeriod', type: 'text',
    question: 'Your notice period, or earliest start date',
    why: 'Used to filter for urgent roles. Wrong by a month and you are out of the shortlist.' },
  { key: 'willingToRelocate', type: 'choice', options: ['Yes', 'No'],
    question: 'Are you willing to relocate?',
    why: 'A yes you did not mean leads to interviews in cities you will not move to.' },
  { key: 'driversLicence', type: 'choice', options: ['Yes', 'No'],
    question: 'Do you hold a current driver\'s licence?',
    why: 'A hard requirement for many roles and trivially checkable.' },
  { key: 'securityClearance', type: 'text',
    question: 'Security clearance held, if any',
    why: 'Government and defence roles gate on this. Claiming one you do not hold is not a ' +
      'grey area — it is checked, and it ends more than the application.' },
  { key: 'criminalRecord', type: 'choice', options: ['Yes', 'No'],
    question: 'Do you have a criminal record that would affect this role?',
    why: 'Answer honestly. This is verified at background check, and a false answer is grounds ' +
      'for dismissal after hiring, which is worse than not being hired.' },
  { key: 'previouslyEmployed', type: 'choice', options: ['Yes', 'No'],
    question: 'Have you previously worked for this employer?',
    why: 'Checked against their own records. Getting it wrong looks like carelessness at best.' },
  { key: 'referredBy', type: 'text',
    question: 'How did you hear about this role? (or who referred you)',
    why: 'A real referral name is one of the strongest signals in an application. Leave it ' +
      'blank rather than inventing one.' },
  { key: 'currentSalary', type: 'text',
    question: 'Your current salary',
    why: 'Illegal to ask in several jurisdictions and you are rarely obliged to answer. Consider ' +
      'leaving this empty so the field pauses and you can decide per employer.' }
];

const BY_KEY = new Map(STANDARD.map((q) => [q.key, q]));

/** Answers stored but never provided for a question we know about. */
function missing(bank) {
  const b = bank || {};
  return STANDARD.filter((q) => {
    const v = b[q.key];
    return v === undefined || v === null || v === '';
  });
}

/** Answers stored for questions that are not in the standard set. */
function custom(bank) {
  const b = bank || {};
  return Object.keys(b).filter((k) => !BY_KEY.has(k)).map((k) => ({ key: k, answer: b[k] }));
}

/**
 * Free-text screening questions, matched by their wording.
 *
 * Deliberately an exact-ish match on the normalised question rather than a
 * fuzzy one: answering "Why do you want to work here?" with the answer saved
 * for "Why do you want to leave your current role?" is worse than not
 * answering at all.
 */
function normaliseQuestion(q) {
  return String(q || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function lookupFreeText(question, bank) {
  const b = (bank && bank._freeText) || {};
  const n = normaliseQuestion(question);
  if (b[n]) return { found: true, answer: b[n], exact: true };

  // A saved question that contains, or is contained by, the asked one — the
  // same question with a different employer's name in it.
  for (const key of Object.keys(b)) {
    if (key.length > 25 && (n.indexOf(key) !== -1 || key.indexOf(n) !== -1)) {
      return { found: true, answer: b[key], exact: false, matchedOn: key };
    }
  }
  return { found: false };
}

function remember(bank, question, answer) {
  const b = { ...(bank || {}) };
  b._freeText = { ...(b._freeText || {}) };
  b._freeText[normaliseQuestion(question)] = answer;
  return b;
}

/**
 * Is this bank complete enough to run unattended?
 *
 * Not a boolean by itself — it names what is missing, because "you cannot run
 * yet" without saying why is the least useful message a tool can produce.
 */
function readiness(bank) {
  const gaps = missing(bank);
  // These four are asked by nearly every application. Without them the runner
  // will stop on almost every job, which is not automation.
  const essential = ['workAuthorisation', 'visaSponsorship', 'noticePeriod', 'salaryExpectation'];
  const essentialGaps = gaps.filter((g) => essential.indexOf(g.key) !== -1);

  return {
    ready: essentialGaps.length === 0,
    missing: gaps,
    essentialMissing: essentialGaps,
    advice: essentialGaps.length
      ? `${essentialGaps.length} question${essentialGaps.length === 1 ? '' : 's'} that almost every ` +
        'application asks are unanswered. Until they are, the runner will stop on nearly every job ' +
        '— which is the correct behaviour and also not automation. Answer them once here.'
      : gaps.length
        ? `Ready. ${gaps.length} less-common question${gaps.length === 1 ? '' : 's'} still unanswered; ` +
          'the runner will pause if a form asks one, rather than guessing.'
        : 'Every standard question is answered. The runner will only stop on something new.'
  };
}


  // ---- packages/autofill/src/runner.js
/**
 * runner.js — drive one application from a parsed form to a decision.
 *
 * THE DESIGN, AND WHY IT DIFFERS FROM EVERY OTHER AUTO-APPLIER
 *
 * The published failures of hands-off appliers are consistent and specific:
 *
 *   - they apply to jobs the user is barred from, because they never check
 *     the location, the years-of-experience floor or the licensing rule;
 *   - they apply to the same job three times, because it is posted on three
 *     boards;
 *   - they answer screening questions wrong, at scale, silently.
 *
 * All three are preventable, and none of them is prevented by better form
 * filling. So the runner puts three things in FRONT of the filling:
 *
 *   1. THE GATE. The existing matcher decides whether this job is applicable
 *      at all. A blocked job is never filled, let alone submitted.
 *   2. DEDUPE. The same role at the same employer is applied to once.
 *   3. THE ANSWER BANK. Knockout questions come from explicit answers or the
 *      run stops on that job.
 *
 * And one thing after it: a RECORD of every field, what went in, and where
 * the value came from. If something was wrong, you find out on job one rather
 * than job forty.
 *
 * SUBMISSION IS A MODE, AND IT IS OFF BY DEFAULT.
 *
 *   'review'  — fill everything, submit nothing. The default.
 *   'confirm' — fill everything, ask, then submit.
 *   'auto'    — fill and submit, but ONLY when the job cleared the gate, no
 *               field paused, no field was refused, and every knockout answer
 *               came from the bank. Any doubt at all downgrades to review.
 *
 * That last condition is the whole safety property, and it is asserted by
 * test. A run cannot reach 'submitted' with an unresolved field in it.
 */




const MODES = ['review', 'confirm', 'auto'];

/** A stable identity for a job, so the same role from two boards is one job. */
function jobKey(job) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const t = norm(job.title);
  const c = norm(job.company);
  if (t && c) return `${c}::${t}`;
  return norm(job.url) || `${t}${c}`;
}

/**
 * Plan the filling of one form. Pure: it decides, it does not touch the DOM.
 * The extension executes the plan, which keeps every decision testable.
 */
function planForm(fields, profile, answers) {
  const plan = [];
  for (const field of fields || []) {
    const id = identify(field);

    // A free-text question the field map cannot classify may still have a
    // saved answer, matched on its wording.
    if (!id.key && !id.refuse && field.label) {
      const saved = lookupFreeText(field.label, answers);
      if (saved.found) {
        plan.push({
          field, key: '_freeText', action: 'fill', value: saved.answer,
          source: saved.exact ? 'answer-bank (exact question)' : 'answer-bank (similar question)',
          confidence: saved.exact ? 1 : 0.7, knockout: false
        });
        continue;
      }
    }

    const v = valueFor(id, profile, answers);
    plan.push({
      field,
      key: id.key,
      action: v.action,
      value: v.value,
      why: v.why,
      source: v.source,
      refused: v.refused,
      // Carried from the identification, not from the value: a knockout with
      // NO answer never reaches valueFor's fill branch, so v.knockout is unset
      // exactly when the flag matters most.
      knockout: !!(v.knockout || id.knockout),
      confidence: id.confidence
    });
  }
  return plan;
}

/**
 * Everything that stops this from being submittable unattended.
 *
 * WHETHER A FIELD IS REQUIRED IS THE DECIDING FACTOR, and getting that wrong
 * in either direction is bad. The first version treated every refusal as a
 * blocker, which sounds cautious and is actually useless: almost every
 * application form carries an optional field this will never fill — a tax file
 * number, a referral code — so auto mode would have refused to fire on any
 * real form, ever. An automation that never automates is not safe, it is
 * broken. Found by running it against a real form rather than by reading it.
 *
 * The rule now:
 *   - a knockout with no answer ALWAYS blocks, required or not. Those are the
 *     auto-reject filters and the reason this package exists.
 *   - anything else blocks only when the form says the field is required.
 *
 * Non-blocking refusals are still returned, marked, so they appear in the
 * record. "We did not touch your tax file number" is worth seeing even when
 * it changed nothing.
 */
function blockers(plan) {
  const out = [];
  for (const step of plan) {
    const required = !!(step.field && step.field.required);

    if (step.action === 'pause') {
      // A knockout question is a hard stop whatever the form claims: an ATS
      // that marks work authorisation optional still filters on it.
      if (step.knockout || required) {
        out.push({ kind: 'unanswered', label: labelOf(step.field), why: step.why, blocking: true });
      } else {
        out.push({ kind: 'unanswered', label: labelOf(step.field), why: step.why, blocking: false });
      }
    } else if (step.action === 'refuse') {
      out.push({
        kind: 'refused', label: labelOf(step.field), why: step.why, blocking: required
      });
    } else if (step.action === 'skip' && required) {
      // A required field we could not identify is fatal for an unattended run:
      // the form will not submit, or will submit wrong.
      out.push({ kind: 'required-unknown', label: labelOf(step.field), why: step.why, blocking: true });
    }
  }
  return out;
}

/** Only the blockers that actually prevent an unattended submission. */
function blocking(list) {
  return (list || []).filter((b) => b.blocking !== false);
}

function labelOf(field) {
  const f = field || {};
  return f.label || f.ariaLabel || f.name || f.id || '(unlabelled field)';
}

/**
 * Decide what happens to one job.
 *
 * `seen` is the set of jobKeys already applied to in this session or in
 * history, so duplicates across boards are caught before any work is done.
 */
function runOne(profile, job, form, options) {
  const o = options || {};
  const mode = MODES.indexOf(o.mode) === -1 ? 'review' : o.mode;
  const answers = o.answers || {};
  const seen = o.seen instanceof Set ? o.seen : new Set(o.seen || []);
  const key = jobKey(job);

  // 1. Duplicate. Cheapest check, so it goes first.
  if (seen.has(key)) {
    return { key, job, outcome: 'duplicate', mode, plan: [], blockers: [],
      why: 'Already applied to this role at this employer. The same job posted on three boards ' +
        'is one job, and three applications read as careless rather than keen.' };
  }

  // 2. The gate. A job you are barred from is not filled at all.
  const assessment = assess(profile, job);
  if (!assessment.passed) {
    return { key, job, outcome: 'blocked', mode, assessment, plan: [], blockers: [],
      why: assessment.blockers.map((b) => b.reason).join('; ') };
  }

  // 3. Plan the fill.
  const plan = planForm(form && form.fields, profile, answers);
  const stops = blockers(plan);
  const filled = plan.filter((s) => s.action === 'fill');

  if (!filled.length) {
    return { key, job, outcome: 'needs-human', mode, assessment, plan, blockers: stops,
      why: 'Nothing on this form could be filled from your profile. It is probably a login wall ' +
        'or a format this does not understand yet.' };
  }

  const hard = blocking(stops);
  const clean = hard.length === 0;
  const outcome = mode === 'auto' && clean ? 'submitted'
    : mode === 'confirm' && clean ? 'awaiting-confirmation'
      : 'filled-for-review';

  return {
    key, job, mode, assessment, plan, blockers: stops, outcome,
    filledCount: filled.length,
    why: clean
      ? (outcome === 'submitted'
        ? 'Every field resolved from your profile or your saved answers, and the job cleared ' +
          'every gate. Submitted.'
        : 'Ready to send.')
      : `${hard.length} field${hard.length === 1 ? '' : 's'} need you. Nothing was submitted — ` +
        'a run that guesses here is how a wrong answer ends up on forty applications.',
    // The audit trail. This is what makes a bad answer findable on job one.
    record: filled.map((s) => ({
      field: labelOf(s.field), key: s.key, value: s.value, source: s.source, knockout: s.knockout
    }))
  };
}

/** Run a batch, carrying the dedupe set forward as it goes. */
function runBatch(profile, jobs, options) {
  const o = options || {};
  const seen = new Set(o.seen || []);
  const results = [];

  for (const entry of jobs || []) {
    const r = runOne(profile, entry.job, entry.form, { ...o, seen });
    // Only a job that actually went somewhere counts as applied — a blocked
    // job must not suppress a later, genuine posting of the same role.
    if (r.outcome === 'submitted' || r.outcome === 'awaiting-confirmation' || r.outcome === 'filled-for-review') {
      seen.add(r.key);
    }
    results.push(r);
  }

  const by = (k) => results.filter((r) => r.outcome === k).length;
  return {
    results,
    seen: [...seen],
    summary: {
      total: results.length,
      submitted: by('submitted'),
      awaitingConfirmation: by('awaiting-confirmation'),
      forReview: by('filled-for-review'),
      blocked: by('blocked'),
      duplicates: by('duplicate'),
      needsHuman: by('needs-human')
    },
    answerBank: readiness(o.answers)
  };
}


  // ---- packages/discovery/src/sources.js
/**
 * sources.js — find the vacancies, from everywhere that will actually give
 * them to us.
 *
 * WHAT IS AND IS NOT POSSIBLE, MEASURED RATHER THAN ASSUMED
 *
 * Probed live on 2026-08-29. This matters because most write-ups on the
 * subject are years stale and cite APIs that no longer exist.
 *
 *   KEYLESS, WORKING RIGHT NOW
 *     Greenhouse  boards-api.greenhouse.io/v1/boards/{company}/jobs
 *                 574 jobs for one company, no key, no rate limit hit.
 *                 Thousands of employers use Greenhouse, so a list of company
 *                 slugs IS a job board.
 *     Lever       api.lever.co/v0/postings/{company}?mode=json
 *                 Same idea. 404s on a wrong slug, which is how you validate.
 *     Arbeitnow   arbeitnow.com/api/job-board-api — 175 jobs, Europe/remote.
 *     RemoteOK    remoteok.com/api
 *     Remotive    remotive.com/api/remote-jobs
 *
 *   WITH A FREE KEY THE USER SUPPLIES
 *     Adzuna, Jooble — aggregators covering many countries, including the
 *     Australian market.
 *
 *   NO PUBLIC API AT ALL
 *     SEEK, Indeed, LinkedIn. Indeed withdrew its public job-search API and
 *     LinkedIn's is partner-only. There is no key to apply for as an
 *     individual.
 *
 * That last group is most of the Australian market, so pretending otherwise
 * would make this useless. They are handled a different way — see harvest.js —
 * by reading the search results page the user is already logged into and
 * looking at. The extension does not log in, does not solve anything, and does
 * not fetch pages the user has not opened; it reads what is on screen.
 *
 * EVERY SOURCE NORMALISES TO ONE SHAPE, so the gate, the matcher and the
 * applier do not care where a job came from.
 */

/** The one job shape. Everything downstream depends only on this. */
function normalised(fields) {
  return {
    id: fields.id || null,
    title: fields.title || null,
    company: fields.company || null,
    location: fields.location || null,
    remote: fields.remote === undefined ? null : !!fields.remote,
    url: fields.url || null,
    adText: fields.adText || '',
    salaryMin: fields.salaryMin === undefined ? null : fields.salaryMin,
    salaryMax: fields.salaryMax === undefined ? null : fields.salaryMax,
    postedAt: fields.postedAt || null,
    source: fields.source,
    // How the application is actually made. This decides which machinery runs.
    applyVia: fields.applyVia || 'web',
    applyEmail: fields.applyEmail || null
  };
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    // An inline tag removed from mid-sentence leaves a space before the
    // punctuation that followed it: "<b>Kubernetes</b>." becomes
    // "Kubernetes ." Cosmetic in isolation, and this text is what the matcher
    // and the cover letter quote from, so it ends up in the output.
    .replace(/\s+([.,;:!?)])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .split('\n').map((l) => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ------------------------------------------------------------- adapters */

const ADAPTERS = {
  /**
   * Greenhouse. Per-company rather than a search, which is a feature: these
   * are the employer's own postings, first-hand, with no aggregator lag and
   * no duplicate reposts.
   */
  greenhouse: {
    label: 'Greenhouse',
    keyless: true,
    perCompany: true,
    url: (company) => `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(company)}/jobs?content=true`,
    parse: (body, company) => (body.jobs || []).map((j) => normalised({
      id: `greenhouse:${company}:${j.id}`,
      title: j.title,
      company,
      location: j.location && j.location.name,
      url: j.absolute_url,
      adText: stripHtml(j.content),
      postedAt: j.updated_at,
      source: 'greenhouse'
    }))
  },

  lever: {
    label: 'Lever',
    keyless: true,
    perCompany: true,
    url: (company) => `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`,
    parse: (body, company) => (Array.isArray(body) ? body : []).map((j) => normalised({
      id: `lever:${company}:${j.id}`,
      title: j.text,
      company,
      location: j.categories && j.categories.location,
      url: j.hostedUrl || j.applyUrl,
      adText: stripHtml(j.descriptionPlain || j.description),
      remote: /remote/i.test((j.categories && j.categories.location) || ''),
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      source: 'lever'
    }))
  },

  arbeitnow: {
    label: 'Arbeitnow',
    keyless: true,
    url: () => 'https://www.arbeitnow.com/api/job-board-api',
    parse: (body) => (body.data || []).map((j) => normalised({
      id: `arbeitnow:${j.slug}`,
      title: j.title,
      company: j.company_name,
      location: j.location,
      remote: j.remote,
      url: j.url,
      adText: stripHtml(j.description),
      postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
      source: 'arbeitnow'
    }))
  },

  remoteok: {
    label: 'RemoteOK',
    keyless: true,
    url: () => 'https://remoteok.com/api',
    // The first element is a licence notice, not a job. Slicing blindly would
    // put "API Terms of Service" in the queue as a vacancy.
    parse: (body) => (Array.isArray(body) ? body : []).filter((j) => j && j.id && j.position)
      .map((j) => normalised({
        id: `remoteok:${j.id}`,
        title: j.position,
        company: j.company,
        location: j.location || 'Remote',
        remote: true,
        url: j.url,
        adText: stripHtml(j.description),
        salaryMin: j.salary_min || null,
        salaryMax: j.salary_max || null,
        postedAt: j.date,
        source: 'remoteok'
      }))
  },

  remotive: {
    label: 'Remotive',
    keyless: true,
    url: (_c, q) => `https://remotive.com/api/remote-jobs${q ? `?search=${encodeURIComponent(q)}` : ''}`,
    parse: (body) => (body.jobs || []).map((j) => normalised({
      id: `remotive:${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location,
      remote: true,
      url: j.url,
      adText: stripHtml(j.description),
      postedAt: j.publication_date,
      source: 'remotive'
    }))
  },

  /** Needs a free key from developer.adzuna.com. Covers Australia. */
  adzuna: {
    label: 'Adzuna',
    keyless: false,
    needs: ['appId', 'appKey'],
    url: (_c, q, opts) => {
      const o = opts || {};
      const country = o.country || 'au';
      const params = new URLSearchParams({
        app_id: o.appId || '', app_key: o.appKey || '',
        results_per_page: String(o.limit || 50),
        'content-type': 'application/json'
      });
      if (q) params.set('what', q);
      if (o.where) params.set('where', o.where);
      if (o.salaryMin) params.set('salary_min', String(o.salaryMin));
      return `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
    },
    parse: (body) => (body.results || []).map((j) => normalised({
      id: `adzuna:${j.id}`,
      title: j.title,
      company: j.company && j.company.display_name,
      location: j.location && j.location.display_name,
      url: j.redirect_url,
      adText: stripHtml(j.description),
      salaryMin: j.salary_min || null,
      salaryMax: j.salary_max || null,
      postedAt: j.created,
      source: 'adzuna'
    }))
  },

  jooble: {
    label: 'Jooble',
    keyless: false,
    needs: ['apiKey'],
    method: 'POST',
    url: (_c, _q, opts) => `https://jooble.org/api/${(opts && opts.apiKey) || ''}`,
    body: (q, opts) => ({ keywords: q || '', location: (opts && opts.where) || '' }),
    parse: (body) => (body.jobs || []).map((j) => normalised({
      id: `jooble:${j.id || j.link}`,
      title: j.title,
      company: j.company,
      location: j.location,
      url: j.link,
      adText: stripHtml(j.snippet),
      postedAt: j.updated,
      source: 'jooble'
    }))
  }
};

/** Sources usable right now with nothing configured. */
function keylessSources() {
  return Object.keys(ADAPTERS).filter((k) => ADAPTERS[k].keyless);
}

/** What a source still needs before it can run. */
function missingCredentials(source, opts) {
  const a = ADAPTERS[source];
  if (!a) throw new Error('Unknown source: ' + source);
  if (a.keyless) return [];
  return (a.needs || []).filter((n) => !(opts && opts[n]));
}

/**
 * Fetch one source. `fetchImpl` is injected so this is testable without a
 * network and usable from both a browser and Node.
 */
async function fetchSource(source, options) {
  const o = options || {};
  const a = ADAPTERS[source];
  if (!a) throw new Error('Unknown source: ' + source);

  const missing = missingCredentials(source, o);
  if (missing.length) {
    return { source, ok: false, jobs: [], error: `needs ${missing.join(' and ')}`, needsCredentials: missing };
  }
  if (a.perCompany && !o.company) {
    return { source, ok: false, jobs: [],
      error: `${a.label} is per-employer — give it a company slug (its board is at ${a.label.toLowerCase()}.io/{company})` };
  }

  const doFetch = o.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!doFetch) return { source, ok: false, jobs: [], error: 'no fetch available in this environment' };

  const url = a.url(o.company, o.query, o);
  try {
    const init = a.method === 'POST'
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(a.body(o.query, o)) }
      : { headers: { accept: 'application/json' } };
    const res = await doFetch(url, init);
    if (!res.ok) {
      return { source, ok: false, jobs: [],
        error: res.status === 404 && a.perCompany
          ? `no ${a.label} board for "${o.company}" — the slug is wrong, or they use a different ATS`
          : `HTTP ${res.status}` };
    }
    const body = await res.json();
    return { source, ok: true, jobs: a.parse(body, o.company), error: null };
  } catch (e) {
    return { source, ok: false, jobs: [], error: String((e && e.message) || e) };
  }
}

/**
 * Fetch several sources and merge.
 *
 * Deduped on employer plus title, because the same role genuinely does appear
 * on an aggregator and on the employer's own board — and the employer's own
 * posting is the better one to apply through, so it wins.
 */
const SOURCE_RANK = { greenhouse: 0, lever: 0, adzuna: 2, jooble: 2, arbeitnow: 3, remotive: 3, remoteok: 3 };

async function search(sources, options) {
  const results = [];
  for (const s of sources || []) {
    const spec = typeof s === 'string' ? { source: s } : s;
    results.push(await fetchSource(spec.source, { ...(options || {}), ...spec }));
  }

  const byKey = new Map();
  const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const r of results) {
    for (const job of r.jobs) {
      const key = `${norm(job.company)}::${norm(job.title)}`;
      const held = byKey.get(key);
      if (!held || (SOURCE_RANK[job.source] ?? 9) < (SOURCE_RANK[held.source] ?? 9)) byKey.set(key, job);
    }
  }

  return {
    jobs: [...byKey.values()],
    sources: results.map((r) => ({ source: r.source, ok: r.ok, count: r.jobs.length, error: r.error })),
    duplicatesMerged: results.reduce((n, r) => n + r.jobs.length, 0) - byKey.size
  };
}


  // ---- packages/discovery/src/harvest.js
/**
 * harvest.js — read job listings off a search-results page the user is
 * already looking at.
 *
 * WHY THIS EXISTS AT ALL
 *
 * SEEK, Indeed and LinkedIn have no public job-search API. Indeed withdrew
 * its public one and LinkedIn's is partner-only; there is nothing an
 * individual can apply for. Between them that is most of the Australian
 * market, so a tool that only handled the API-having boards would miss the
 * jobs the user actually wants.
 *
 * So these are read from the page. The extension does not log in, does not
 * defeat anything, and does not fetch pages the user has not opened — it
 * reads the results already rendered in front of them, the same list they can
 * see, and turns it into a queue.
 *
 * MATCHED ON URL SHAPE, NOT ON CSS CLASSES.
 *
 * Every scraper written against class names dies at the next redeploy, and
 * these sites ship obfuscated, generated class names specifically because of
 * that. A job URL, by contrast, is a permalink: seek.com.au/job/12345678 has
 * had that shape for years, because changing it would break every inbound
 * link and every bookmark. Anchors are found by URL pattern and the
 * surrounding element is then read for context, which degrades to "a link and
 * a title" rather than to nothing.
 */

/**
 * Per-board URL patterns and how to pull an id out.
 *
 * `card` is the ancestor most likely to hold the title, employer and
 * location. It is a hint, not a requirement.
 */
const BOARDS = [
  {
    id: 'seek',
    label: 'SEEK',
    host: /(^|\.)seek\.com\.au$/i,
    jobUrl: /\/job\/(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: 'article, [data-card-type], [data-testid*="job"], li'
  },
  {
    id: 'indeed',
    label: 'Indeed',
    host: /(^|\.)indeed\.(com|com\.au|co\.uk)$/i,
    // Both the modern viewjob link and the older redirect carry jk=.
    jobUrl: /[?&]jk=([a-z0-9]+)/i,
    idFrom: (m) => m[1],
    cardSelector: '.job_seen_beacon, [data-jk], td.resultContent, li'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    host: /(^|\.)linkedin\.com$/i,
    jobUrl: /\/jobs\/view\/(?:[^/?#]*-)?(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: '.job-card-container, [data-job-id], li'
  },
  {
    id: 'greenhouse',
    label: 'Greenhouse',
    host: /greenhouse\.io$/i,
    jobUrl: /\/jobs\/(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: '.opening, li'
  },
  {
    id: 'lever',
    label: 'Lever',
    host: /lever\.co$/i,
    jobUrl: /jobs\.lever\.co\/[^/]+\/([0-9a-f-]{8,})/i,
    idFrom: (m) => m[1],
    cardSelector: '.posting, li'
  }
];

function boardFor(url) {
  let host;
  try { host = new URL(url).hostname; } catch (e) { return null; }
  return BOARDS.find((b) => b.host.test(host)) || null;
}

function clean(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

/**
 * The card's text as separate pieces, one per leaf element.
 *
 * Anything with element children is skipped, because its textContent is the
 * concatenation of its descendants — which is the blob this exists to avoid.
 */
function cardSegments(card) {
  if (!card) return [];
  const out = [];
  const leaves = card.querySelectorAll ? card.querySelectorAll('*') : [];
  for (const el of leaves) {
    if (el.children && el.children.length) continue;
    const t = clean(el.textContent);
    if (t) out.push(t);
  }
  // Direct text nodes of the card itself, which belong to no element.
  for (const n of card.childNodes || []) {
    if (n.nodeType === 3) {
      const t = clean(n.textContent);
      if (t) out.push(t);
    }
  }
  return out;
}

/**
 * Pull the fields out of a card's text.
 *
 * Deliberately conservative. A wrong employer name on a queued job leads to a
 * cover letter addressed to the wrong company, so a field that cannot be read
 * confidently is left null for the job page itself to supply later.
 */
function readCard(segments, title) {
  // SEGMENTS, not one blob of text. Element.textContent concatenates sibling
  // elements with no separator at all, so a card rendering
  // <span>Canva</span><span>Sydney NSW</span><span>$140,000</span>
  // arrives as "CanvaSydney NSW$140,000" and every field parsed out of it is
  // wrong. A wrong employer name is not cosmetic — it addresses the cover
  // letter to the wrong company — so the caller passes the leaf elements'
  // text separately and this never sees a blob.
  const lines = (Array.isArray(segments) ? segments : String(segments || '').split('\n'))
    .map(clean).filter(Boolean);
  const t = clean(title);
  // Substring containment is too aggressive: it drops "Austin TX" when the
  // title happens to be "X", and would drop "Engineering Services Pty Ltd"
  // for a role called "Engineer". Only an exact match, or a segment that
  // opens with a title long enough to be distinctive, counts as the title
  // repeated.
  const withoutTitle = lines.filter(
    (l) => l && l !== t && !(t.length >= 6 && l.indexOf(t) === 0)
  );
  const cardText = lines.join('\n');

  // Salary, if the card advertises one.
  const salary = (() => {
    const m = String(cardText || '').match(/\$\s?([\d,]{4,})(?:\s*(?:-|–|to)\s*\$?\s?([\d,]{4,}))?/);
    if (!m) return { min: null, max: null };
    const n = (x) => (x ? Number(String(x).replace(/,/g, '')) : null);
    return { min: n(m[1]), max: n(m[2]) };
  })();

  // A salary range contains a comma ("$140,000 - $170,000"), so a comma alone
  // is not evidence of a place — the first version happily reported the pay
  // band as the location. Money-shaped segments are excluded first.
  const looksLikeMoney = (l) => /\$|\bper\s+(hour|day|week|annum|year)\b|\bp\.?a\.?\b|\bsalary\b/i.test(l);
  // Australian and US listings routinely write "Sydney NSW" or "Austin TX"
  // with no comma at all, so a comma cannot be the only signal — that missed
  // the most common local format.
  const REGION = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT|AL|AK|AZ|CA|CO|CT|FL|GA|IL|MA|MI|NY|NC|OH|OR|PA|TX|VA|WA)\b/;
  const looksLikePlace = (l) =>
    /,/.test(l) || /\bremote\b|\bhybrid\b|\bon-?site\b/i.test(l) || REGION.test(l);
  const location = withoutTitle.find(
    (l) => !looksLikeMoney(l) && looksLikePlace(l) && l.length < 60
  ) || null;
  return {
    // The employer is the first segment that is not the title, not the
    // location and not a salary.
    company: withoutTitle.find((l) => l !== location && !looksLikeMoney(l) && l.length < 60) || null,
    location: location,
    salaryMin: salary.min,
    salaryMax: salary.max,
    remote: /\bremote\b/i.test(cardText || '') ? true : null
  };
}

/**
 * Harvest from a DOM.
 *
 * `doc` is injected so this runs under a test as readily as in a page.
 */
function harvest(doc, pageUrl) {
  const board = boardFor(pageUrl);
  if (!board) {
    return { board: null, jobs: [], error: 'This is not a job board JobPilot knows how to read.' };
  }

  const anchors = [...doc.querySelectorAll('a[href]')];
  const byId = new Map();

  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    let abs = href;
    try { abs = new URL(href, pageUrl).toString(); } catch (e) { /* keep as written */ }

    const m = abs.match(board.jobUrl);
    if (!m) continue;
    const id = board.idFrom(m);
    if (!id) continue;

    const title = clean(a.getAttribute('aria-label') || a.textContent);
    // An anchor with no text is usually an image wrapper around the same job;
    // the titled one for this id will be found in the same pass.
    if (!title || title.length < 3) continue;

    const card = (a.closest && a.closest(board.cardSelector)) || a.parentElement;
    const fields = readCard(cardSegments(card), title);

    const existing = byId.get(id);
    // Prefer the entry with the most context: several anchors point at the
    // same job and only one of them sits inside the full card.
    const score = (fields.company ? 1 : 0) + (fields.location ? 1 : 0) + (fields.salaryMin ? 1 : 0);
    if (existing && existing._score >= score) continue;

    byId.set(id, {
      id: `${board.id}:${id}`,
      title,
      company: fields.company,
      location: fields.location,
      remote: fields.remote,
      salaryMin: fields.salaryMin,
      salaryMax: fields.salaryMax,
      url: abs.split('#')[0],
      adText: '',
      source: board.id,
      applyVia: 'web',
      applyEmail: null,
      _score: score
    });
  }

  const jobs = [...byId.values()].map((j) => { const { _score, ...rest } = j; return rest; });
  return {
    board: board.id,
    boardLabel: board.label,
    jobs,
    error: jobs.length ? null
      : 'No job links found on this page. Open the search results themselves rather than the ' +
        'landing page, and scroll far enough for the listings to load.'
  };
}

/** Which boards can be harvested, for telling the user where to go. */
function supportedBoards() {
  return BOARDS.map((b) => ({ id: b.id, label: b.label }));
}


  // ---- packages/discovery/src/campaign.js
/**
 * campaign.js — one search across many boards, gated, ranked, queued.
 *
 * This is the piece that makes the rest a machine rather than a set of tools.
 * A campaign is: what you are looking for, where to look, and what to do with
 * what comes back.
 *
 *   discover  →  gate  →  rank  →  queue  →  (the extension applies)
 *
 * THE ORDER IS THE PRODUCT. Every complaint about automated appliers is that
 * they apply first and filter never. Here the gate runs on every job before
 * anything is queued, so a run that finds four hundred vacancies and queues
 * eleven has done its job — the eleven are the ones worth an application.
 *
 * Nothing here touches a browser or sends anything. It produces a plan, and
 * the plan is inspectable before a single application is made.
 */





/**
 * An email address advertised as the way to apply.
 *
 * Deliberately narrow. A job ad contains addresses that are not application
 * addresses — a privacy officer, a general enquiries line — and mailing those
 * an application is both useless and rude. An address only counts when the
 * surrounding words say to send an application to it.
 */
const APPLY_CONTEXT = /(appl(y|ications?)|send|forward|email|resume|cv|expressions? of interest|eoi)/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const NOT_APPLY = /(privacy|unsubscribe|noreply|no-reply|donotreply|abuse|legal|webmaster|postmaster)/i;

function applicationEmail(adText) {
  const text = String(adText || '');
  const found = [];
  let m;
  EMAIL_RE.lastIndex = 0;
  while ((m = EMAIL_RE.exec(text)) !== null) {
    const address = m[0];
    if (NOT_APPLY.test(address)) continue;
    // The sentence around it has to be about applying.
    const from = Math.max(0, m.index - 140);
    const context = text.slice(from, m.index + address.length + 60);
    if (!APPLY_CONTEXT.test(context)) continue;
    found.push({ address, context: context.replace(/\s+/g, ' ').trim() });
  }
  return found[0] || null;
}

/**
 * Turn a discovered job into something the gate can judge.
 *
 * The board listing rarely states the requirements — those are in the ad body
 * — so the skills are parsed out of whatever text came with it.
 */
function enrich(job) {
  const skills = parseJobSkills(job.adText || '');
  const email = applicationEmail(job.adText);
  const years = (() => {
    const m = String(job.adText || '').match(/(\d+)\s*\+?\s*(?:-|–|to)?\s*\d*\s*years?(?:['’]|\s+of)?\s+experience/i);
    return m ? Number(m[1]) : null;
  })();

  return {
    ...job,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
    minYearsExperience: years,
    applyVia: email ? 'email' : 'web',
    applyEmail: email ? email.address : null,
    applyEmailContext: email ? email.context : null
  };
}

/**
 * Run a campaign.
 *
 * `already` is the set of jobKeys applied to previously, so a campaign run
 * daily does not re-queue yesterday's applications.
 */
async function run(profile, config, options) {
  const c = config || {};
  const o = options || {};
  const already = new Set(o.already || []);

  const found = await search(c.sources || [], { ...o, query: c.query, where: c.where, ...c.credentials });

  const seen = new Set(already);
  const queued = [];
  const rejected = [];
  let duplicates = 0;

  for (const raw of found.jobs) {
    const job = enrich(raw);
    const key = jobKey(job);

    if (seen.has(key)) { duplicates += 1; continue; }
    seen.add(key);

    // Keyword filter first, if the campaign narrows by title. Cheaper than
    // the gate and it is what the user asked for.
    if (c.titleMustMatch && !new RegExp(c.titleMustMatch, 'i').test(job.title || '')) {
      rejected.push({ job, reason: `title does not match /${c.titleMustMatch}/` });
      continue;
    }
    if (c.excludeTitle && new RegExp(c.excludeTitle, 'i').test(job.title || '')) {
      rejected.push({ job, reason: `title matches the exclusion /${c.excludeTitle}/` });
      continue;
    }

    const assessment = assess(profile, job);
    if (!assessment.passed) {
      rejected.push({ job, key, assessment, reason: assessment.blockers.map((b) => b.reason).join('; ') });
      continue;
    }
    queued.push({ job, key, assessment });
  }

  // Best fit first, so a capped run spends its applications on the best jobs.
  const order = new Map(rank(queued.map((q) => q.assessment)).map((a, i) => [a, i]));
  queued.sort((a, b) => order.get(a.assessment) - order.get(b.assessment));

  const capped = c.dailyCap ? queued.slice(0, c.dailyCap) : queued;
  const deferred = c.dailyCap ? queued.slice(c.dailyCap) : [];

  return {
    queue: capped,
    deferred,
    rejected,
    sources: found.sources,
    summary: {
      discovered: found.jobs.length,
      duplicatesAcrossSources: found.duplicatesMerged,
      alreadyApplied: duplicates,
      rejected: rejected.length,
      queued: capped.length,
      deferredByCap: deferred.length,
      byEmail: capped.filter((q) => q.job.applyVia === 'email').length,
      byWeb: capped.filter((q) => q.job.applyVia === 'web').length
    },
    // The number that actually matters, said plainly.
    advice: capped.length
      ? `${found.jobs.length} vacancies found, ${capped.length} worth applying to. The other ` +
        `${rejected.length} failed a stated requirement — they are listed with the reason, not hidden.`
      : found.jobs.length
        ? `${found.jobs.length} vacancies found and none cleared your gates. Widen the search, or ` +
          'look at the rejection reasons — if they are all the same requirement, that is the thing to fix.'
        : 'No vacancies came back. Check the sources reported below; a per-employer board needs a ' +
          'company slug and an aggregator needs its key.'
  };
}

/**
 * The email application for one queued job.
 *
 * Returns a draft. It does NOT send: sending on someone's behalf needs their
 * mail credentials, and a tool that can silently mail hundreds of employers is
 * a spam cannon whatever its intent. The draft goes to their mail client, from
 * their own address, and they press send — which is also what makes the reply
 * land in their inbox rather than nowhere.
 */
function emailDraft(profile, job, coverLetterText) {
  if (!job.applyEmail) return null;
  const p = profile || {};
  const subject = `Application — ${job.title || 'your advertised role'}` +
    (p.name ? ` — ${p.name}` : '');

  const body = [
    'Hello,',
    '',
    `I am applying for the ${job.title || 'advertised role'}` +
      (job.company ? ` at ${job.company}` : '') + '.',
    '',
    coverLetterText || '[paste your cover letter here]',
    '',
    'My resume is attached.',
    '',
    'Regards,',
    p.name || '[your name]',
    [p.email, p.phone].filter(Boolean).join('  •  ')
  ].join('\n');

  return {
    to: job.applyEmail,
    subject,
    body,
    // Opening the user's own mail client, so the message is genuinely from
    // them and the attachment is added by them.
    mailto: `mailto:${encodeURIComponent(job.applyEmail)}` +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    reminder: 'Attach your resume before sending — a mailto link cannot carry an attachment, ' +
      'and an application email without one is deleted unread.',
    foundBecause: job.applyEmailContext
  };
}



  root.JobPilot = {
    // matching
    normalise: normalise,
    canonicalise: canonicalise,
    isKnown: isKnown,
    extractSkills: extractSkills,
    matchSkills: matchSkills,
    assess: assess,
    rank: rank,
    softScore: softScore,
    parseJobSkills: parseJobSkills,
    PREFERRED_MARKERS: PREFERRED_MARKERS,
    GATES: GATES,
    // evidence and documents
    statements: statements,
    evidenceFor: evidenceFor,
    strongest: strongest,
    coverLetter: coverLetter,
    parseCriteria: parseCriteria,
    draftResponse: draftResponse,
    draftAll: draftAll,
    behaviouralKind: behaviouralKind,
    LIMITS: LIMITS,
    // ats
    checkResume: checkResume,
    keywordCoverage: keywordCoverage,
    // pipeline
    splitAdvertisements: splitAdvertisements,
    parseAdvertisement: parseAdvertisement,
    buildPack: buildPack,
    buildQueue: buildQueue,
    transition: transition,
    needsFollowUp: needsFollowUp,
    STATUSES: STATUSES,
    // prep
    prepare: prepare,
    tailor: tailor,
    draftFollowUp: draft,
    suggestFollowUp: suggest,
    FOLLOWUP_TEMPLATES: TEMPLATES,
    QUESTIONS_TO_ASK: QUESTIONS_TO_ASK,
    surfaceForm: surfaceForm,
    // autofill
    identify: identify,
    valueFor: valueFor,
    planForm: planForm,
    runOne: runOne,
    runBatch: runBatch,
    jobKey: jobKey,
    answerReadiness: readiness,
    STANDARD_ANSWERS: STANDARD,
    lookupFreeText: lookupFreeText,
    rememberAnswer: remember,
    MODES: MODES,
    // discovery
    searchSources: search,
    fetchSource: fetchSource,
    keylessSources: keylessSources,
    missingCredentials: missingCredentials,
    harvest: harvest,
    supportedBoards: supportedBoards,
    runCampaign: run,
    enrichJob: enrich,
    applicationEmail: applicationEmail,
    emailDraft: emailDraft
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
