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
    "cv",
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
   * Recover the word the advertisement actually used.
   *
   * The alias dictionary maps "Splunk" to the canonical "siem", and a letter
   * that says "the advertisement asks for Siem" when the advertisement said
   * Splunk is both wrong and obviously machine-written. So when the caller
   * hands over canonical names, go back to the ad text and find whichever
   * form of this skill is really written there.
   */
  const fromAd = (canonical) => {
    if (!j.adText) return null;
    const forms = [canonical].concat(ALIASES[canonical] || []);
    // Longest first: prefer "amazon web services" over "aws" when both appear.
    forms.sort((a, b) => b.length - a.length);
    for (const f of forms) {
      const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = j.adText.match(new RegExp('(?<![a-z0-9+#])' + esc + '(?![a-z0-9+#])', 'i'));
      if (m) return m[0];
    }
    return null;
  };

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
    STATUSES: STATUSES
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
