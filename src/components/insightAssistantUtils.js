// hne local logic mta3 AI dashboard: yfasser prompt, y7adher data, w ybni result local 9bal refinement men backend.
import {
  countBy,
  countWhere,
  monthlySeries,
  topLabel,
} from "../page/analysis/analysisUtils";

const QUERY_ALIASES = [
  [/dashboard/g, "overview"],
  [/\bwarini\b/g, "show me"],
  [/\bwrini\b/g, "show me"],
  [/\bwari?ni\b/g, "show me"],
  [/\bawrini\b/g, "show me"],
  [/\bwarri?ni\b/g, "show me"],
  [/\baatini\b/g, "give me"],
  [/\b3tini\b/g, "give me"],
  [/\ba3tini\b/g, "give me"],
  [/\b3atini\b/g, "give me"],
  [/\bheb\b/g, "want"],
  [/\bn7eb\b/g, "want"],
  [/\bnحب\b/g, "want"],
  [/\b9aren\b/g, "compare"],
  [/\b9arinna\b/g, "compare"],
  [/\b9arinni\b/g, "compare"],
  [/\bcompares?\b/g, "compare"],
  [/\b9assem\b/g, "split"],
  [/\bchnouma\b/g, "what are"],
  [/\bchnowa\b/g, "what is"],
  [/\bkifech\b/g, "how"],
  [/\b9adech\b/g, "how many"],
  [/\b9addech\b/g, "how many"],
  [/\bch7al\b/g, "how many"],
  [/\b9olli\b/g, "tell me"],
  [/\bgolli\b/g, "tell me"],
  [/\bkol\b/g, "all"],
  [/\bba3d\b/g, "after"],
  [/\b9bal\b/g, "before"],
  [/\b3la\b/g, "about"],
  [/\bpar\b/g, "by"],
  [/\bw\b/g, "and"],
  [/\bou\b/g, "and"],
  [/\bya3ni\b/g, "meaning"],
  [/\bma7loul\b/g, "resolved"],
  [/\bmsakker\b/g, "closed"],
  [/\bmaftou7\b/g, "open"],
  [/\bme7loul\b/g, "resolved"],
  [/\bmesakker\b/g, "closed"],
  [/\bma7loula\b/g, "resolved"],
  [/\bmaskra\b/g, "closed"],
  [/\bmta3\b/g, "of"],
  [/\bmt3\b/g, "of"],
  [/\bta3\b/g, "of"],
  [/\btaa\b/g, "of"],
  [/\binc\b/g, "incidents"],
  [/\breq\b/g, "requests"],
  [/\bchg\b/g, "changes"],
  [/\btal3li\b/g, "show me"],
  [/\byfhem\b/g, "understand"],
  [/\bfassar\b/g, "explain"],
  [/\bfaserli\b/g, "explain"],
  [/\b7allel\b/g, "analyze"],
  [/\b7allelli\b/g, "analyze"],
  [/\bchnowa\b/g, "what is"],
  [/\bchniya\b/g, "what is"],
  [/\bakhter\b/g, "top"],
  [/\bakther\b/g, "top"],
  [/\bmost\b/g, "top"],
  [/\bhighest\b/g, "top"],
  [/\ba9wa\b/g, "top"],
  [/\ba3la\b/g, "top"],
  [/\bbrcha\b/g, "many"],
  [/\bmoch\b/g, "not"],
  [/\bmahir?\b/g, "not"],
  [/\bmouch\b/g, "not"],
  [/\b7\b/g, "h"],
  [/\bslm\b/g, "sla"],
  [/\bprio\b/g, "priority"],
  [/\bprios\b/g, "priority"],
  [/\bdept\b/g, "group"],
  [/\bops\b/g, "operations"],
  [/\bsites?\b/g, "location"],
  [/\bplants?\b/g, "location"],
  [/\bapps?\b/g, "applications"],
  [/\bmois\b/g, "month"],
  [/\btendance\b/g, "month"],
  [/\b3awem\b/g, "years"],
  [/\bla3wem\b/g, "years"],
  [/\bsnin\b/g, "years"],
  [/\bsana\b/g, "year"],
  [/\b3am\b/g, "year"],
  [/\bsn\b/g, "year"],
  [/\bfiltrage\b/g, "filtering"],
  [/\bfiltre\b/g, "filter"],
  [/\bfiltres\b/g, "filters"],
  [/\bsevice\b/g, "service"],
  [/\bsrv\b/g, "service"],
  [/\bit service\b/g, "service"],
  [/\bib\b/g, "division"],
  [/\bdivision mta3\b/g, "division"],
  [/\bowner\b/g, "service owner"],
  [/\bci\b/g, "configuration item"],
  [/\bmas2oul\b/g, "owner"],
  [/\bresponsable\b/g, "group"],
  [/\bequipe\b/g, "group"],
  [/\bbacklog\b/g, "open"],
  [/\bretard\b/g, "past due"],
  [/\ben retard\b/g, "past due"],
  [/\burgent\b/g, "emergency"],
  [/\bcritique\b/g, "major"],
  [/\bpar mois\b/g, "by month"],
  [/\bpar service\b/g, "by service"],
  [/\bpar groupe\b/g, "by group"],
  [/\bpar priorite\b/g, "by priority"],
  [/\bpar etat\b/g, "by state"],
];

const EXTRA_KEYWORD_GROUPS = {
  compare: [
    "compare",
    "comparison",
    "versus",
    "vs",
    "against",
    "side by side",
    "difference between",
    "trend comparison",
    "9aren",
    "far9",
    "mo9arna",
  ],
  overview: [
    "dashboard",
    "overview",
    "summary",
    "full picture",
    "global view",
    "executive view",
    "kpi dashboard",
    "main dashboard",
    "snapshot",
    "general view",
    "vue d ensemble",
    "vue globale",
    "resume",
    "global",
    "kol chay",
    "synthese",
  ],
  open: [
    "open",
    "still open",
    "active",
    "pending",
    "in progress",
    "not closed",
    "backlog",
    "awaiting",
    "maftou7",
    "encours",
  ],
  closed: [
    "closed",
    "resolved",
    "completed",
    "done",
    "implemented",
    "finished",
    "completed tickets",
    "msakker",
    "me7loul",
    "m7al",
  ],
};

const INTENT_TEMPLATES = [
  {
    id: "compare_volume_monthly",
    terms: ["compare", "month"],
    build: (baseIntent) => ({
      ...baseIntent,
      compare: true,
      modules: baseIntent.modules.length > 1 ? baseIntent.modules : ["incidents", "requests"],
      grouping: "month",
      groupings: ["month"],
      chart_type: "line",
    }),
  },
  {
    id: "overview_open_module",
    terms: ["overview", "open"],
    build: (baseIntent) => ({
      ...baseIntent,
      state: "open",
      groupings: unique(["month", "service", ...(baseIntent.groupings || [])]).slice(0, 3),
      grouping: "month",
      chart_type: "line",
    }),
  },
  {
    id: "top_services_backlog",
    terms: ["top", "service", "backlog"],
    build: (baseIntent) => ({
      ...baseIntent,
      state: "open",
      grouping: "service",
      groupings: ["service", "month"],
      chart_type: "bar",
    }),
  },
  {
    id: "priority_breakdown",
    terms: ["priority"],
    build: (baseIntent) => ({
      ...baseIntent,
      grouping: "priority",
      groupings: unique(["priority", "month", ...(baseIntent.groupings || [])]).slice(0, 3),
      chart_type: "bar",
    }),
  },
  {
    id: "group_breakdown",
    terms: ["group"],
    build: (baseIntent) => ({
      ...baseIntent,
      grouping: "group",
      groupings: unique(["group", "month", ...(baseIntent.groupings || [])]).slice(0, 3),
      chart_type: baseIntent.compare ? "line" : "bar",
    }),
  },
  {
    id: "monthly_trend_default",
    terms: ["month"],
    build: (baseIntent) => ({
      ...baseIntent,
      grouping: "month",
      groupings: unique(["month", ...(baseIntent.groupings || [])]).slice(0, 3),
      chart_type: "line",
    }),
  },
  {
    id: "top_breakdown_default",
    terms: ["top"],
    build: (baseIntent) => ({
      ...baseIntent,
      topN: baseIntent.topN || 8,
      chart_type: "bar",
    }),
  },
];

const MODULE_CONFIG = {
  incidents: {
    label: "Incidents",
    singular: "incident",
    keywords: [
      "incident",
      "incidents",
      "incidenti",
      "ticket",
      "tickets",
      "issue",
      "issues",
      "problem",
      "problems",
      "panne",
      "pannes",
      "down",
      "incidentat",
      "tickets ouverts",
      "tickets open",
      "outage",
      "outages",
      "alert",
      "alerts",
      "incidentat",
    ],
    defaultDateKey: "opened",
    groupKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      priority: "priority",
      state: "state",
      site: "location",
      user: "responsible_user",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
      ci: "configuration_item",
    },
    filterKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      priority: "priority",
      state: "state",
      site: "location",
      user: "responsible_user",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
      ci: "configuration_item",
    },
  },
  requests: {
    label: "Requests",
    singular: "request",
    keywords: [
      "request",
      "requests",
      "requete",
      "requetes",
      "demande",
      "demandes",
      "service request",
      "catalog",
      "catalogue",
      "ask",
      "asks",
      "demandat",
      "talabat",
      "service requests",
      "fulfillment",
      "fulfilment",
      "access request",
      "access requests",
      "onboarding requests",
      "talabat",
      "طلبات",
    ],
    defaultDateKey: "opened",
    groupKeys: {
      service: "it_service",
      group: "responsible_group",
      month: "opened",
      item: "item",
      state: "state",
      user: "requested_for",
      site: "location",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
    },
    filterKeys: {
      service: "it_service",
      group: "responsible_group",
      month: "opened",
      item: "item",
      state: "state",
      user: "requested_for",
      site: "location",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
    },
  },
  changes: {
    label: "Changes",
    singular: "change",
    keywords: [
      "change",
      "changes",
      "changement",
      "changements",
      "chg",
      "rfc",
      "release",
      "deployment",
      "taghyir",
      "taghyirat",
      "modification",
      "change request",
      "change requests",
      "implementation",
      "deployments",
      "taghyir",
    ],
    defaultDateKey: "opened",
    groupKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      type: "type",
      priority: "priority",
      state: "state",
      site: "location",
      user: "responsible_user",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
      ci: "configuration_item",
    },
    filterKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      type: "type",
      priority: "priority",
      state: "state",
      site: "location",
      user: "responsible_user",
      division: "location_division",
      owner: "service_owner",
      classification: "service_classification",
      ci: "configuration_item",
    },
  },
};

const GROUP_KEYWORDS = {
  service: [
    "service",
    "services",
    "par service",
    "by service",
    "application",
    "applications",
    "system",
    "systems",
    "app",
    "apps",
    "product",
    "products",
    "platform",
    "platforms",
  ],
  group: [
    "group",
    "groupe",
    "groups",
    "groupes",
    "team",
    "teams",
    "equipe",
    "equipes",
    "support",
    "owner team",
    "par groupe",
    "by group",
    "assignment group",
    "resolver group",
    "support team",
  ],
  month: [
    "month",
    "months",
    "mois",
    "monthly",
    "mensuel",
    "trend",
    "timeline",
    "over time",
    "time",
    "evolution",
    "par mois",
    "by month",
    "week",
    "weeks",
    "weekly",
    "daily trend",
    "monthly trend",
  ],
  priority: [
    "priority",
    "priorite",
    "priorities",
    "priorites",
    "severity",
    "severite",
    "criticality",
    "p1",
    "p2",
    "p3",
    "p4",
    "severity level",
  ],
  state: [
    "status",
    "state",
    "etat",
    "states",
    "statuses",
    "workflow",
    "open vs closed",
    "lifecycle",
    "ticket status",
  ],
  site: [
    "site",
    "sites",
    "location",
    "locations",
    "localisation",
    "country",
    "division",
    "plant",
    "office",
    "hub",
    "region",
  ],
  division: [
    "division",
    "divisions",
    "ib",
    "business unit",
    "branch",
    "entity",
    "location division",
  ],
  owner: [
    "owner",
    "service owner",
    "owners",
    "ownership",
    "managed by",
  ],
  classification: [
    "classification",
    "service classification",
    "class",
    "category family",
  ],
  ci: [
    "ci",
    "configuration item",
    "config item",
    "asset",
    "server",
    "application ci",
  ],
  item: [
    "item",
    "items",
    "catalog",
    "catalogue",
    "article",
    "articles",
    "request type",
    "service item",
    "catalog item",
  ],
  type: [
    "type",
    "types",
    "category",
    "categories",
    "categorie",
    "change type",
    "kind",
  ],
  user: [
    "user",
    "users",
    "requested for",
    "requester",
    "owner",
    "caller",
    "agent",
    "responsible",
    "person",
    "assigned to",
    "assignee",
    "owner",
  ],
};

const STATE_KEYWORDS = {
  open: [
    "open",
    "opened",
    "ouvert",
    "ouverte",
    "ouvertes",
    "ouverts",
    "backlog",
    "pending",
    "en cours",
    "in progress",
    "not closed",
    "still open",
  ],
  closed: [
    "closed",
    "resolved",
    "completed",
    "implemented",
    "ferme",
    "fermee",
    "fermes",
    "fermees",
    "cloture",
    "done",
  ],
};

const METRIC_KEYWORDS = {
  major: ["major", "major incidents", "critical incidents", "critique", "majeur"],
  sla: ["sla", "breach", "breached", "violated", "depassement", "depasse", "out of sla", "sla miss"],
  emergency: ["emergency", "urgent change", "urgent", "critical change", "hotfix"],
  pastDue: ["past due", "overdue", "retard", "late", "en retard", "expired"],
  backlog: ["backlog", "open", "pending", "not closed", "queue", "workload"],
  volume: ["volume", "count", "nombre", "how many", "combien", "total", "amount", "number of"],
};

const PIE_KEYWORDS = ["share", "distribution", "repartition", "breakdown", "split", "mix"];
const OVERVIEW_KEYWORDS = [
  "dashboard",
  "overview",
  "summary",
  "resume",
  "global",
  "overall",
  "full view",
  "vue globale",
  "kpi",
];

const MONTH_ALIASES = {
  january: 1,
  jan: 1,
  janvier: 1,
  february: 2,
  feb: 2,
  fevrier: 2,
  fevr: 2,
  mars: 3,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  avril: 4,
  may: 5,
  mai: 5,
  june: 6,
  jun: 6,
  juin: 6,
  july: 7,
  jul: 7,
  juillet: 7,
  august: 8,
  aug: 8,
  aout: 8,
  september: 9,
  sep: 9,
  sept: 9,
  septembre: 9,
  october: 10,
  oct: 10,
  octobre: 10,
  november: 11,
  nov: 11,
  novembre: 11,
  december: 12,
  dec: 12,
  decembre: 12,
};

// hne function normalizeText: twa7ed format mta3 valeur bech ba9i l app yeta3amel ma3aha b souhoula.
function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// hne function normalizeQuery: twa7ed format mta3 valeur bech ba9i l app yeta3amel ma3aha b souhoula.
function normalizeQuery(value) {
  let text = normalizeText(value)
    .replace(/\b3and\b/g, "have")
    .replace(/\b7atta\b/g, "until")
    .replace(/\bmen\b/g, "from")
    .replace(/\blil\b/g, "to")
    .replace(/\bfi\b/g, "in")
    .replace(/\billi\b/g, "that")
    .replace(/\btickets?\b/g, "incidents")
    .replace(/\bdemandes?\b/g, "requests")
    .replace(/\bproblemes?\b/g, "incidents")
    .replace(/\brequetes?\b/g, "requests")
    .replace(/\bchangements?\b/g, "changes")
    .replace(/\bstatut\b/g, "state")
    .replace(/\bpriorite\b/g, "priority");

  QUERY_ALIASES.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  return text.replace(/\s+/g, " ").trim();
}

// hne function titleCase: t3awen ba9i l code fil fichier hedha b logic sghira.
function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

// hne function isClosedState: true wala false hasb condition mo3ayna fil logic.
function isClosedState(value) {
  return ["closed", "resolved", "completed", "implemented"].includes(normalizeText(value));
}

// hne function parseDateValue: tfasser input w t7awlou l data mafhouma lel code.
function parseDateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// hne function endOfMonth: t3awen ba9i l code fil fichier hedha b logic sghira.
function endOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}

// hne function monthsAgo: t3awen ba9i l code fil fichier hedha b logic sghira.
function monthsAgo(count, baseDate = new Date()) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() - count, 1);
}

// hne function daysAgo: t3awen ba9i l code fil fichier hedha b logic sghira.
function daysAgo(count, baseDate = new Date()) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() - count);
  return next;
}

// hne function unique: t3awen ba9i l code fil fichier hedha b logic sghira.
function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

// hne function tokenize: t3awen ba9i l code fil fichier hedha b logic sghira.
function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

// hne function levenshtein: t3awen ba9i l code fil fichier hedha b logic sghira.
function levenshtein(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (!a) return b.length;
  if (!b) return a.length;

  // hne function matrix: t3awen ba9i l code fil fichier hedha b logic sghira.
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

// hne function similarityScore: t3awen ba9i l code fil fichier hedha b logic sghira.
function similarityScore(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);

  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

// hne function keywordScore: t3awen ba9i l code fil fichier hedha b logic sghira.
function keywordScore(text, keywords = []) {
  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return score;
    if (text.includes(normalizedKeyword)) return score + Math.max(2, normalizedKeyword.split(" ").length);

    const textTokens = tokenize(text);
    const keywordTokens = tokenize(normalizedKeyword);
    // hne function fuzzyHits: t3awen ba9i l code fil fichier hedha b logic sghira.
    const fuzzyHits = keywordTokens.reduce((sum, keywordToken) => {
      // hne function best: t3awen ba9i l code fil fichier hedha b logic sghira.
      const best = textTokens.reduce((bestScore, token) => Math.max(bestScore, similarityScore(token, keywordToken)), 0);
      return sum + (best >= 0.88 ? best : 0);
    }, 0);

    return score + fuzzyHits;
  }, 0);
}

// hne function normalizedConfidence: twa7ed format mta3 valeur bech ba9i l app yeta3amel ma3aha b souhoula.
function normalizedConfidence(rawScore, baseline = 1) {
  return Math.max(0.25, Math.min(0.99, rawScore / baseline));
}

// hne function detectModules: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectModules(text) {
  const scoredModules = Object.entries(MODULE_CONFIG)
    .map(([key, config]) => ({
      key,
      score: keywordScore(text, config.keywords),
    }))
    .sort((left, right) => right.score - left.score);

  const topScore = scoredModules[0]?.score || 0;
  if (!topScore) {
    return {
      modules: ["incidents"],
      confidence: 0.34,
      explicit: false,
      scores: scoredModules,
    };
  }

  const selected = scoredModules
    .filter((item) => item.score >= Math.max(1.5, topScore * 0.62))
    .map((item) => item.key);

  return {
    modules: selected.length ? selected : [scoredModules[0].key],
    confidence: normalizedConfidence(topScore, 8),
    explicit: topScore > 0,
    scores: scoredModules,
  };
}

// hne function detectAllYears: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectAllYears(text) {
  return [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]));
}

// hne function detectQuarter: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectQuarter(text) {
  const quarterMatch =
    text.match(/\bq([1-4])\b/) ||
    text.match(/\b([1-4])(st|nd|rd|th)? quarter\b/) ||
    text.match(/\btrimestre\s*([1-4])\b/);
  if (!quarterMatch) return null;
  return Number(quarterMatch[1]);
}

// hne function detectTopN: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectTopN(text) {
  const topMatch =
    text.match(/\b(top|first|best)\s+(\d{1,2})\b/) ||
    text.match(/\b(\d{1,2})\s+(top|best)\b/) ||
    text.match(/\btop\s*(\d{1,2})\b/);
  if (topMatch) return Math.max(1, Math.min(Number(topMatch[2] || topMatch[1]), 20));

  const limitMatch = text.match(/\b(limit|only)\s+(\d{1,2})\b/);
  return limitMatch ? Math.max(1, Math.min(Number(limitMatch[2]), 20)) : 8;
}

// hne function detectGroupings: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectGroupings(text, module) {
  const available = MODULE_CONFIG[module].groupKeys;
  const scored = Object.entries(GROUP_KEYWORDS)
    .filter(([key]) => available[key])
    .map(([key, keywords]) => ({
      key,
      score: keywordScore(text, keywords),
    }))
    .sort((left, right) => right.score - left.score);
  // hne function detected: t3awen ba9i l code fil fichier hedha b logic sghira.
  const detected = scored.filter((item) => item.score > 0).map((item) => item.key);

  if (!detected.length) {
    return {
      groupings: OVERVIEW_KEYWORDS.some((keyword) => text.includes(keyword)) ? ["month", "service"] : ["service"],
      confidence: 0.36,
      scores: scored,
    };
  }

  const ordered = unique(detected);
  if (ordered.length === 1 && ordered[0] !== "month" && /\btrend|evolution|timeline|over time|par mois|by month\b/.test(text)) {
    return {
      groupings: ["month", ordered[0]],
      confidence: normalizedConfidence(scored[0]?.score || 1, 7),
      scores: scored,
    };
  }
  return {
    groupings: ordered.slice(0, 3),
    confidence: normalizedConfidence(scored[0]?.score || 1, 7),
    scores: scored,
  };
}

// hne function detectState: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectState(text) {
  const openScore = keywordScore(text, [...STATE_KEYWORDS.open, ...EXTRA_KEYWORD_GROUPS.open]);
  const closedScore = keywordScore(text, [...STATE_KEYWORDS.closed, ...EXTRA_KEYWORD_GROUPS.closed]);
  if (openScore > closedScore && openScore > 0) return { value: "open", confidence: normalizedConfidence(openScore, 6) };
  if (closedScore > openScore && closedScore > 0) return { value: "closed", confidence: normalizedConfidence(closedScore, 6) };
  return { value: "all", confidence: 0.4 };
}

// hne function detectMetric: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectMetric(text) {
  const scored = Object.entries(METRIC_KEYWORDS)
    .map(([key, keywords]) => ({
      key,
      score: keywordScore(text, keywords),
    }))
    .sort((left, right) => right.score - left.score);
  let metric = scored[0]?.score > 0 ? scored[0].key : "count";

  if (metric === "backlog") metric = "count";
  if (metric === "volume") metric = "count";
  return {
    value: metric,
    confidence: metric === "count" ? 0.45 : normalizedConfidence(scored[0]?.score || 1, 5),
    scores: scored,
  };
}

// hne function isCompareIntent: true wala false hasb condition mo3ayna fil logic.
function isCompareIntent(text, modules) {
  return modules.length > 1 || EXTRA_KEYWORD_GROUPS.compare.some((keyword) => text.includes(keyword)) || /\bcontre|between|compare moi|compare me\b/.test(text);
}

// hne function detectChartType: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectChartType(text, grouping, compare) {
  if (compare || grouping === "month") return "line";
  if (PIE_KEYWORDS.some((keyword) => text.includes(normalizeText(keyword)))) return "pie";
  return "bar";
}

// hne function buildInterpretation: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildInterpretation(intent, detection) {
  const moduleLabel = intent.overview && (!intent.module || intent.compare)
    ? "global overview"
    : intent.compare
      ? intent.modules.join(" vs ")
      : intent.module;

  return {
    module: moduleLabel,
    groupings: intent.groupings || [intent.grouping],
    state: intent.state,
    metric: intent.metric,
    period: intent.dateScope?.label || "All available data",
    filters: (intent.filters || []).map((item) => item.label),
    confidence: Math.round(
      (
        [
          detection.moduleConfidence,
          detection.groupingConfidence,
          detection.stateConfidence,
          detection.metricConfidence,
          intent.filters?.length ? 0.8 : 0.6,
        ].reduce((sum, value) => sum + value, 0) / 5
      ) * 100
    ),
  };
}

// hne function buildFollowUps: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildFollowUps(intent) {
  const moduleLabel = intent.compare ? "comparison" : MODULE_CONFIG[intent.module]?.label?.toLowerCase() || "dashboard";
  const primaryGrouping = intent.groupings?.[0] || intent.grouping || "service";
  const alternateGrouping = primaryGrouping === "month" ? "service" : "month";

  return unique([
    `Show the same ${moduleLabel} by ${alternateGrouping}`,
    `Focus on open ${moduleLabel}`,
    `Add a priority breakdown`,
    `Compare the same scope by month`,
  ]).slice(0, 4);
}

// hne function buildRecoverySuggestions: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildRecoverySuggestions(intent) {
  const targetModule = intent.compare ? "modules" : MODULE_CONFIG[intent.module]?.label?.toLowerCase() || "items";
  return [
    `Try the same question without the filters to widen the ${targetModule} scope.`,
    "Try a broader period like last 12 months.",
    "Try asking by service or by month.",
  ];
}

// hne function applyIntentTemplates: t3awen ba9i l code fil fichier hedha b logic sghira.
function applyIntentTemplates(baseIntent, text) {
  for (const template of INTENT_TEMPLATES) {
    if (template.terms.every((term) => text.includes(term))) {
      return template.build(baseIntent);
    }
  }
  return baseIntent;
}

// hne function detectDateScope: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectDateScope(text) {
  const years = detectAllYears(text);
  const quarter = detectQuarter(text);
  const currentYear = new Date().getFullYear();
  const now = new Date();

  if (/\bthis quarter\b/.test(text) || /\bcurrent quarter\b/.test(text)) {
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    return {
      year: now.getFullYear(),
      yearRange: null,
      quarter: currentQuarter,
      startDate: new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1),
      endDate: endOfMonth(now.getFullYear(), currentQuarter * 3 - 1),
      label: `Q${currentQuarter} ${now.getFullYear()}`,
    };
  }

  if (/\blast quarter\b/.test(text) || /\bprevious quarter\b/.test(text)) {
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const quarterYear = currentQuarter === 1 ? now.getFullYear() - 1 : now.getFullYear();
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    return {
      year: quarterYear,
      yearRange: null,
      quarter: previousQuarter,
      startDate: new Date(quarterYear, (previousQuarter - 1) * 3, 1),
      endDate: endOfMonth(quarterYear, previousQuarter * 3 - 1),
      label: `Q${previousQuarter} ${quarterYear}`,
    };
  }

  const lastDaysMatch = text.match(/\b(last|past)\s+(\d{1,3})\s+days?\b/);
  if (lastDaysMatch) {
    const count = Number(lastDaysMatch[2]);
    return {
      year: null,
      yearRange: null,
      quarter: null,
      startDate: daysAgo(count - 1),
      endDate: new Date(),
      label: `Last ${count} days`,
    };
  }

  const lastMonthsMatch =
    text.match(/\b(last|past|derniers?)\s+(\d{1,2})\s+months?\b/) ||
    text.match(/\b(\d{1,2})\s+derniers?\s+mois\b/) ||
    text.match(/\b(last|past)\s+(\d{1,2})\s+m\b/);
  if (lastMonthsMatch) {
    const count = Number(lastMonthsMatch[2] || lastMonthsMatch[1]);
    return {
      year: null,
      yearRange: null,
      quarter,
      startDate: monthsAgo(Math.max(count - 1, 0)),
      endDate: new Date(),
      label: `Last ${count} months`,
    };
  }

  if (/\bthis month\b/.test(text) || /\bce mois\b/.test(text)) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      yearRange: null,
      quarter: null,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: endOfMonth(now.getFullYear(), now.getMonth()),
      label: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  if (/\bthis year\b/.test(text) || /\bcette annee\b/.test(text)) {
    return {
      year: currentYear,
      yearRange: null,
      quarter,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31, 23, 59, 59, 999),
      label: `${currentYear}`,
    };
  }

  if (/\blast year\b/.test(text) || /\bannee derniere\b/.test(text)) {
    return {
      year: currentYear - 1,
      yearRange: null,
      quarter,
      startDate: new Date(currentYear - 1, 0, 1),
      endDate: new Date(currentYear - 1, 11, 31, 23, 59, 59, 999),
      label: `${currentYear - 1}`,
    };
  }

  const betweenYearMatch =
    text.match(/\bbetween\s+(20\d{2})\s+(and|to)\s+(20\d{2})\b/) ||
    text.match(/\bfrom\s+(20\d{2})\s+to\s+(20\d{2})\b/) ||
    text.match(/\bentre\s+(20\d{2})\s+et\s+(20\d{2})\b/) ||
    text.match(/\bde\s+(20\d{2})\s+a\s+(20\d{2})\b/) ||
    text.match(/\b(20\d{2})\s*[-/]\s*(20\d{2})\b/);
  if (betweenYearMatch) {
    const firstYear = Number(betweenYearMatch[1]);
    const secondYear = Number(betweenYearMatch[3] || betweenYearMatch[2]);
    const startYear = Math.min(firstYear, secondYear);
    const endYear = Math.max(firstYear, secondYear);
    return {
      year: null,
      yearRange: [startYear, endYear],
      quarter,
      startDate: new Date(startYear, 0, 1),
      endDate: new Date(endYear, 11, 31, 23, 59, 59, 999),
      label: `${startYear}-${endYear}`,
    };
  }

  // hne function monthKeys: t3awen ba9i l code fil fichier hedha b logic sghira.
  const monthKeys = Object.keys(MONTH_ALIASES).sort((left, right) => right.length - left.length);
  // hne function monthName: t3awen ba9i l code fil fichier hedha b logic sghira.
  const monthName = monthKeys.find((monthKey) => new RegExp(`\\b${monthKey}\\b`).test(text));
  if (monthName) {
    const monthIndex = MONTH_ALIASES[monthName] - 1;
    const year = years[0] || currentYear;
    if (quarter) {
      return {
        year,
        yearRange: null,
        quarter,
        startDate: new Date(year, (quarter - 1) * 3, 1),
        endDate: endOfMonth(year, quarter * 3 - 1),
        label: `Q${quarter} ${year}`,
      };
    }
    return {
      year,
      yearRange: null,
      quarter: null,
      startDate: new Date(year, monthIndex, 1),
      endDate: endOfMonth(year, monthIndex),
      label: `${titleCase(monthName)} ${year}`,
    };
  }

  if (years.length >= 2) {
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    return {
      year: null,
      yearRange: [startYear, endYear],
      quarter,
      startDate: new Date(startYear, 0, 1),
      endDate: new Date(endYear, 11, 31, 23, 59, 59, 999),
      label: `${startYear}-${endYear}`,
    };
  }

  if (years.length === 1) {
    const year = years[0];
    return {
      year,
      yearRange: null,
      quarter,
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31, 23, 59, 59, 999),
      label: `${year}`,
    };
  }

  return {
    year: null,
    yearRange: null,
    quarter,
    startDate: null,
    endDate: null,
    label: quarter ? `Q${quarter}` : null,
  };
}

// hne function extractDistinctValues: t3awen ba9i l code fil fichier hedha b logic sghira.
function extractDistinctValues(rows, key) {
  return [...new Set(rows.map((row) => String(row?.[key] || "").trim()).filter(Boolean))];
}

// hne function findEntityMatch: t3awen ba9i l code fil fichier hedha b logic sghira.
function findEntityMatch(text, rows, key) {
  const values = extractDistinctValues(rows, key)
    .filter((value) => normalizeText(value).length >= 2)
    .sort((left, right) => right.length - left.length);

  // hne function directMatch: t3awen ba9i l code fil fichier hedha b logic sghira.
  const directMatch = values.find((value) => {
    const normalizedValue = normalizeText(value);
    return normalizedValue && text.includes(normalizedValue);
  });

  if (directMatch) return directMatch;

  const textTokens = tokenize(text);
  let bestMatch = null;
  let bestScore = 0;

  values.forEach((value) => {
    const valueTokens = tokenize(value);
    const tokenScore = valueTokens.length
      ? valueTokens.reduce((sum, valueToken) => {
          const bestToken = textTokens.reduce(
            (best, textToken) => Math.max(best, similarityScore(textToken, valueToken)),
            0
          );
          return sum + bestToken;
        }, 0) / valueTokens.length
      : 0;

    const fullScore = similarityScore(text, value);
    const score = Math.max(tokenScore, fullScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  });

  return bestScore >= 0.82 ? bestMatch : null;
}

// hne function detectPriorityFilter: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectPriorityFilter(text) {
  const match = text.match(/\bp([1-4])\b/);
  return match ? `P${match[1]}` : null;
}

// hne function extractFilterCandidates: t3awen ba9i l code fil fichier hedha b logic sghira.
function extractFilterCandidates(text, keywords = []) {
  const escaped = keywords
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((left, right) => right.length - left.length);

  const candidates = [];

  escaped.forEach((keyword) => {
    const patterns = [
      new RegExp(`\\b(?:for|by|with|in|on)\\s+${keyword}\\s+([\\w\\s/-]{2,60})`, "g"),
      new RegExp(`\\b${keyword}\\s*(?::|=|-)?\\s*([\\w\\s/-]{2,60})`, "g"),
    ];

    patterns.forEach((pattern) => {
      let match = pattern.exec(text);
      while (match) {
        const value = normalizeText(match[1])
          .replace(/\b(and|with|by|for|in|on|filter|filters|month|months|year|years|quarter|q[1-4])\b.*$/, "")
          .trim();
        if (value.length >= 2) {
          candidates.push(value);
        }
        match = pattern.exec(text);
      }
    });
  });

  return unique(candidates).slice(0, 4);
}

// hne function collectRowsForModules: t3awen ba9i l code fil fichier hedha b logic sghira.
function collectRowsForModules(modules, datasets) {
  return unique(modules)
    .filter((module) => MODULE_CONFIG[module])
    .flatMap((module) => Array.isArray(datasets[module]) ? datasets[module] : []);
}

// hne function findFilterMatchAcrossModules: t3awen ba9i l code fil fichier hedha b logic sghira.
function findFilterMatchAcrossModules(text, modules, datasets, field, explicitCandidates = []) {
  let bestMatch = null;
  let bestScore = 0;

  unique(modules)
    .filter((module) => MODULE_CONFIG[module])
    .forEach((module) => {
      const rows = Array.isArray(datasets[module]) ? datasets[module] : [];
      const key = MODULE_CONFIG[module]?.filterKeys?.[field];
      if (!key || !rows.length) return;

      const candidates = explicitCandidates.length ? explicitCandidates : [text];
      candidates.forEach((candidate) => {
        const matchedValue = findEntityMatch(candidate, rows, key);
        if (!matchedValue) return;

        const reference = candidate === text ? text : candidate;
        const score = similarityScore(reference, matchedValue);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = matchedValue;
        }
      });

      if (!bestMatch) {
        const fallbackMatch = findEntityMatch(text, rows, key);
        if (fallbackMatch) {
          const score = similarityScore(text, fallbackMatch);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = fallbackMatch;
          }
        }
      }
    });

  return bestMatch;
}

// hne function detectSemanticFilters: t3awen ba9i l code fil fichier hedha b logic sghira.
function detectSemanticFilters(text, modules, datasets) {
  const targetModules = modules?.length ? modules : ["incidents"];
  const filters = [];
  const seen = new Set();
  const fieldEntries = [
    ["service", ["service", "services", "application", "applications", "system", "systems"]],
    ["group", ["group", "groups", "team", "support team", "assignment group"]],
    ["site", ["site", "sites", "location", "locations", "country", "office", "region"]],
    ["division", ["division", "divisions", "ib", "business unit", "branch", "entity"]],
    ["owner", ["owner", "service owner", "managed by"]],
    ["classification", ["classification", "service classification", "class"]],
    ["ci", ["ci", "configuration item", "config item", "asset"]],
    ["item", ["item", "catalog item", "request item", "request type"]],
    ["type", ["type", "change type", "category"]],
    ["user", ["user", "requested for", "requester", "caller", "assignee"]],
  ];

  const priority = detectPriorityFilter(text);
  if (priority) {
    filters.push({ field: "priority", value: priority, label: `Priority: ${priority}` });
  }

  fieldEntries.forEach(([field, keywords]) => {
    const explicitCandidates = extractFilterCandidates(text, keywords);
    const matchedValue = findFilterMatchAcrossModules(text, targetModules, datasets, field, explicitCandidates);
    if (matchedValue) {
      const token = `${field}:${normalizeText(matchedValue)}`;
      if (!seen.has(token)) {
        seen.add(token);
        filters.push({ field, value: matchedValue, label: `${titleCase(field)}: ${matchedValue}` });
      }
    }
  });

  return filters;
}

// hne function filterByDateScope: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
function filterByDateScope(rows, dateKey, dateScope) {
  if (!dateScope?.startDate && !dateScope?.endDate && !dateScope?.quarter) return rows;

  return rows.filter((row) => {
    const parsed = parseDateValue(row[dateKey]);
    if (!parsed) return false;

    if (dateScope.startDate && parsed < dateScope.startDate) return false;
    if (dateScope.endDate && parsed > dateScope.endDate) return false;
    if (dateScope.quarter && Math.floor(parsed.getMonth() / 3) + 1 !== dateScope.quarter) return false;
    return true;
  });
}

// hne function filterByState: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
function filterByState(rows, state) {
  if (state === "open") {
    return rows.filter((row) => !isClosedState(row.state));
  }
  if (state === "closed") {
    return rows.filter((row) => isClosedState(row.state));
  }
  return rows;
}

// hne function filterByMetric: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
function filterByMetric(rows, module, metric) {
  if (metric === "major" && module === "incidents") {
    return rows.filter((row) => row.is_major || normalizeText(row.priority) === "p1");
  }
  if (metric === "sla" && module === "incidents") {
    return rows.filter((row) => row.sla_breached);
  }
  if (metric === "emergency" && module === "changes") {
    return rows.filter((row) => normalizeText(row.type).includes("emergency"));
  }
  if (metric === "pastDue" && module === "changes") {
    return rows.filter((row) => {
      const planned = parseDateValue(row.planned_end_date);
      return planned && planned.getTime() < Date.now();
    });
  }
  return rows;
}

// hne function applyDetectedFilters: t3awen ba9i l code fil fichier hedha b logic sghira.
function applyDetectedFilters(rows, filters, module = "incidents") {
  const fieldMap = MODULE_CONFIG[module]?.filterKeys || {};
  return filters.reduce(
    (scopedRows, filter) => {
      const key = filter.key || fieldMap[filter.field];
      if (!key) return scopedRows;
      return scopedRows.filter((row) => normalizeText(row[key]) === normalizeText(filter.value));
    },
    rows
  );
}

// hne function makeBarRows: t7adher data b format mnasba lel affichage wala l analyse.
function makeBarRows(rows, key, limit = 8) {
  return countBy(rows, key)
    .slice(0, limit)
    .map((item) => ({
      label: item.label,
      value: item.value,
    }));
}

// hne function makePieRows: t7adher data b format mnasba lel affichage wala l analyse.
function makePieRows(rows, key, limit = 8) {
  return countBy(rows, key)
    .slice(0, limit)
    .map((item) => ({
      id: item.label,
      label: item.label,
      value: item.value,
    }));
}

// hne function makeSingleSeriesChart: t7adher data b format mnasba lel affichage wala l analyse.
function makeSingleSeriesChart(rows, module, grouping, chartType, topN) {
  const key = MODULE_CONFIG[module].groupKeys[grouping];
  if (grouping === "month") {
    return {
      type: chartType === "bar" ? "bar" : "line",
      data: monthlySeries(rows, key).map((item) => ({
        month: item.month,
        value: item.value,
      })),
      label: MODULE_CONFIG[module].label,
    };
  }

  return {
    type: chartType === "pie" ? "pie" : "bar",
    data: chartType === "pie" ? makePieRows(rows, key, topN) : makeBarRows(rows, key, topN),
    label: titleCase(grouping),
  };
}

// hne function buildOverviewKpis: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildOverviewKpis(series) {
  // hne function total: t3awen ba9i l code fil fichier hedha b logic sghira.
  const total = series.reduce((sum, item) => sum + item.rows.length, 0);
  const openTotal = series.reduce(
    (sum, item) => sum + item.rows.filter((row) => !isClosedState(row.state)).length,
    0
  );

  return [
    {
      label: "Total Records",
      value: total,
      note: "Combined ITSM scope for the selected dashboard",
    },
    ...series.map((item) => ({
      label: item.label,
      value: item.rows.length,
      note: `${item.rows.filter((row) => !isClosedState(row.state)).length} still open`,
    })),
    {
      label: "Open Items",
      value: openTotal,
      note: `${Math.max(total - openTotal, 0)} already closed or completed`,
    },
  ].slice(0, 5);
}

// hne function buildOverviewWidgets: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildOverviewWidgets(series) {
  return [
    {
      title: "Total volume by module",
      summary: "Overall distribution of records across the main ITSM modules.",
      chart: {
        type: "bar",
        data: series.map((item) => ({
          label: item.label,
          value: item.rows.length,
        })),
      },
    },
    {
      title: "Open workload by module",
      summary: "Remaining active workload to monitor in each ITSM module.",
      chart: {
        type: "bar",
        data: series.map((item) => ({
          label: item.label,
          value: item.rows.filter((row) => !isClosedState(row.state)).length,
        })),
      },
    },
  ];
}

// hne function formatValue: t3awen ba9i l code fil fichier hedha b logic sghira.
function formatValue(value) {
  if (typeof value === "number") return value.toLocaleString();
  return String(value ?? "-");
}

// hne function buildTopInsight: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildTopInsight(rows, module, grouping, metric) {
  const config = MODULE_CONFIG[module];
  if (!rows.length) {
    return {
      title: "No matching data",
      body: "The current filters did not return enough records to build a stronger insight.",
    };
  }

  if (grouping === "month") {
    const points = monthlySeries(rows, config.groupKeys.month);
    const peak = [...points].sort((left, right) => right.value - left.value)[0];
    const latest = points[points.length - 1];

    if (peak && latest) {
      return {
        title: `Peak activity in ${peak.month}`,
        body: `${formatValue(peak.value)} ${config.label.toLowerCase()} were recorded in the busiest month. The latest visible month is ${latest.month} with ${formatValue(latest.value)} items.`,
      };
    }
  }

  const grouped = countBy(rows, config.groupKeys[grouping]);
  const leader = grouped[0];
  const runnerUp = grouped[1];

  if (leader) {
    const leadText = `${leader.label} leads with ${formatValue(leader.value)} ${config.singular}${leader.value > 1 ? "s" : ""}`;
    const deltaText =
      runnerUp
        ? `, ahead of ${runnerUp.label} by ${formatValue(Math.max(leader.value - runnerUp.value, 0))}`
        : "";

    return {
      title: `${titleCase(grouping)} leader identified`,
      body: `${leadText}${deltaText}. Metric focus: ${metric === "count" ? "overall volume" : titleCase(metric)}.`,
    };
  }

  return {
    title: "Stable distribution",
    body: "The selected scope is distributed across multiple categories without one dominant driver.",
  };
}

// hne function buildExecutiveNotes: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildExecutiveNotes(rows, module, grouping, state, metric) {
  const config = MODULE_CONFIG[module];
  // hne function openCount: t3awen ba9i l code fil fichier hedha b logic sghira.
  const openCount = rows.filter((row) => !isClosedState(row.state)).length;
  // hne function closedCount: t3awen ba9i l code fil fichier hedha b logic sghira.
  const closedCount = rows.filter((row) => isClosedState(row.state)).length;
  const topDriver = topLabel(rows, config.groupKeys[grouping] || config.groupKeys.service || config.groupKeys.group, "-");

  return [
    `${formatValue(rows.length)} ${config.label.toLowerCase()} included in this dashboard.`,
    state === "all"
      ? `${formatValue(openCount)} are still open while ${formatValue(closedCount)} are already closed or completed.`
      : `Current state scope is focused on ${state} items.`,
    `The strongest visible driver is ${topDriver} on the ${grouping} axis.`,
    metric !== "count"
      ? `The dashboard is optimized around the ${titleCase(metric)} metric.`
      : `The dashboard is optimized around total operational volume.`,
  ];
}

// hne function makeKpis: t7adher data b format mnasba lel affichage wala l analyse.
function makeKpis(rows, module, metric, grouping) {
  const config = MODULE_CONFIG[module];
  // hne function openCount: t3awen ba9i l code fil fichier hedha b logic sghira.
  const openCount = rows.filter((row) => !isClosedState(row.state)).length;
  // hne function closedCount: t3awen ba9i l code fil fichier hedha b logic sghira.
  const closedCount = rows.filter((row) => isClosedState(row.state)).length;
  const keyForTop = config.groupKeys[grouping] || config.groupKeys.service || config.groupKeys.group;
  const metricCount =
    metric === "sla"
      ? countWhere(rows, (row) => row.sla_breached)
      : metric === "major"
        ? countWhere(rows, (row) => row.is_major || normalizeText(row.priority) === "p1")
        : metric === "emergency"
          ? countWhere(rows, (row) => normalizeText(row.type).includes("emergency"))
          : metric === "pastDue"
            ? countWhere(rows, (row) => {
                const planned = parseDateValue(row.planned_end_date);
                return planned && planned.getTime() < Date.now() && !isClosedState(row.state);
              })
            : null;

  const cards = [
    {
      label: `Total ${config.label}`,
      value: rows.length,
      note: `Records included in the current dashboard scope`,
    },
    {
      label: "Open",
      value: openCount,
      note: closedCount ? `${closedCount} already closed or completed` : "No closed items in scope",
    },
    {
      label: `Top ${titleCase(grouping)}`,
      value: topLabel(rows, keyForTop, "-"),
      note: `Most represented driver in this dashboard`,
    },
  ];

  if (metricCount !== null) {
    cards.push({
      label: `${titleCase(metric)} Count`,
      value: metricCount,
      note: `Matched special metric in the selected scope`,
    });
  } else {
    cards.push({
      label: "Closed",
      value: closedCount,
      note: openCount ? `${openCount} still open` : "Everything is closed",
    });
  }

  return cards;
}

// hne function summarizeScope: t3awen ba9i l code fil fichier hedha b logic sghira.
function summarizeScope({ rows, module, grouping, dateScope, metric, filters, state }) {
  const bits = [`Scope: ${rows.length} ${MODULE_CONFIG[module].label.toLowerCase()}`];
  if (dateScope?.label) bits.push(`Period: ${dateScope.label}`);
  if (state !== "all") bits.push(`State: ${state}`);
  if (metric !== "count") bits.push(`Metric: ${metric}`);
  if (filters?.length) bits.push(...filters.map((filter) => filter.label));
  if (grouping !== "month") {
    const top = countBy(rows, MODULE_CONFIG[module].groupKeys[grouping])[0];
    bits.push(`Top ${grouping}: ${top?.label || "-"}`);
  }
  return bits;
}

// hne function buildTitle: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildTitle({ module, grouping, dateScope, state, metric, filters, compare }) {
  const stateLabel = state !== "all" ? `${titleCase(state)} ` : "";
  const metricLabel = metric !== "count" ? `${titleCase(metric)} ` : "";
  // hne function filterLabel: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
  const filterLabel = filters?.length ? ` for ${filters.map((filter) => filter.value).join(", ")}` : "";
  const timeLabel = dateScope?.label ? ` in ${dateScope.label}` : "";

  if (compare) return `Comparison Dashboard${timeLabel}`;
  if (grouping === "month") return `${stateLabel}${metricLabel}${MODULE_CONFIG[module].label} by Month${timeLabel}${filterLabel}`;
  return `${stateLabel}${metricLabel}${MODULE_CONFIG[module].label} by ${titleCase(grouping)}${timeLabel}${filterLabel}`;
}

// hne function buildSecondaryWidgets: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildSecondaryWidgets(rows, module, primaryGrouping, requestedGroupings, topN) {
  const candidates = unique([
    ...requestedGroupings.filter((grouping) => grouping !== primaryGrouping),
    primaryGrouping === "month" ? "service" : "month",
    "state",
  ]).filter((grouping) => MODULE_CONFIG[module].groupKeys[grouping]);

  return candidates.slice(0, 2).map((grouping) => ({
    title: `${MODULE_CONFIG[module].label} by ${titleCase(grouping)}`,
    summary: grouping === "month" ? "Secondary trend to validate the main direction over time." : `Secondary breakdown highlighting the main concentration by ${grouping}.`,
    chart: makeSingleSeriesChart(rows, module, grouping, grouping === "month" ? "line" : "bar", topN),
  }));
}

// hne function buildOverviewResult: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildOverviewResult(intent, datasets) {
  const modules = Array.isArray(intent?.modules) && intent.modules.length
    ? intent.modules.filter((module) => MODULE_CONFIG[module])
    : Object.keys(MODULE_CONFIG);
  const dateScope = intent?.dateScope || detectDateScope("");
  const state = intent?.state || "all";
  const metric = intent?.metric || "count";
  const filters = Array.isArray(intent?.filters) ? intent.filters : [];

  // hne variable series: series wajda lel chart.
  const series = modules.map((module) => {
    const config = MODULE_CONFIG[module];
    let rows = Array.isArray(datasets[module]) ? datasets[module] : [];
    rows = filterByDateScope(rows, config.defaultDateKey, dateScope);
    rows = filterByState(rows, state);
    rows = filterByMetric(rows, module, metric);
    rows = applyDetectedFilters(rows, filters, module);

    return {
      module,
      label: config.label,
      rows,
      data: monthlySeries(rows, config.defaultDateKey).map((item) => ({
        x: item.month,
        y: item.value,
      })),
    };
  });

  // hne variable nonEmptySeries: series wajda lel chart.
  const nonEmptySeries = series.filter((item) => item.rows.length);
  if (!nonEmptySeries.length) {
    return {
      ok: false,
      answer: "I couldn't build a global dashboard for that scope. Try a broader period or remove some filters.",
      suggestions: buildRecoverySuggestions(intent),
      interpretation: intent.interpretation,
    };
  }

  const leader = [...nonEmptySeries].sort((left, right) => right.rows.length - left.rows.length)[0];

  return {
    ok: true,
    title: intent?.title || `Global ITSM Overview${dateScope?.label ? ` in ${dateScope.label}` : ""}`,
    answer:
      intent?.answer ||
      "I built a global ITSM dashboard that summarizes incidents, requests, and changes in one view.",
    chart: {
      type: "multiLine",
      data: nonEmptySeries.map((item) => ({
        id: item.label,
        data: item.data,
      })),
    },
    kpis: buildOverviewKpis(nonEmptySeries),
    widgets: buildOverviewWidgets(nonEmptySeries),
    spotlight: {
      title: "Overview spotlight",
      body: `${leader.label} currently has the largest visible volume in the selected scope, so it should be reviewed first in the global dashboard.`,
    },
    executiveNotes: [
      `${nonEmptySeries.reduce((sum, item) => sum + item.rows.length, 0)} combined records are included in this overview.`,
      dateScope?.label ? `The selected period is ${dateScope.label}.` : "The overview uses all available data.",
      state === "all" ? "The view includes both open and closed records." : `The view is focused on ${state} records only.`,
      metric !== "count" ? `The dashboard emphasizes the ${titleCase(metric)} metric.` : "The dashboard emphasizes overall operational volume.",
    ],
    interpretation: intent.interpretation,
    followUps: [
      "Focus on incidents by service",
      "Show requests by month",
      "Compare incidents and changes by month",
      "Show open workload by group",
    ],
    summary:
      intent?.summary?.length
        ? intent.summary
        : [
            `Scope: ${nonEmptySeries.reduce((sum, item) => sum + item.rows.length, 0)} records`,
            `Modules: ${nonEmptySeries.map((item) => item.label).join(", ")}`,
            ...(dateScope?.label ? [`Period: ${dateScope.label}`] : []),
            ...(state !== "all" ? [`State: ${state}`] : []),
          ],
  };
}

// hne function buildSingleModuleResult: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildSingleModuleResult(intent, datasets) {
  const module = MODULE_CONFIG[intent?.module] ? intent.module : "incidents";
  const config = MODULE_CONFIG[module];
  const requestedGroupings = Array.isArray(intent?.groupings) && intent.groupings.length
    ? intent.groupings.filter((grouping) => config.groupKeys[grouping])
    : [config.groupKeys[intent?.grouping] ? intent.grouping : "service"];
  const primaryGrouping = requestedGroupings[0] || "service";
  const dateScope = intent?.dateScope || detectDateScope("");
  const filters = Array.isArray(intent?.filters) ? intent.filters : [];
  const chartType = intent?.chart_type || detectChartType("", primaryGrouping, false);
  const topN = intent?.topN || intent?.top_n || 8;

  let rows = Array.isArray(datasets[module]) ? datasets[module] : [];
  rows = filterByDateScope(rows, config.defaultDateKey, dateScope);
  rows = filterByState(rows, intent?.state || "all");
  rows = filterByMetric(rows, module, intent?.metric || "count");
  rows = applyDetectedFilters(rows, filters, module);

  if (!rows.length) {
    return {
      ok: false,
      answer: `I couldn't find matching ${config.label.toLowerCase()} for that scope. Try removing one filter or widening the date range.`,
      suggestions: buildRecoverySuggestions(intent),
      interpretation: intent.interpretation,
    };
  }

  const dashboardChart = makeSingleSeriesChart(rows, module, primaryGrouping, chartType, topN);
  const widgets = buildSecondaryWidgets(rows, module, primaryGrouping, requestedGroupings, topN);
  const spotlight = buildTopInsight(rows, module, primaryGrouping, intent?.metric || "count");
  const executiveNotes = buildExecutiveNotes(rows, module, primaryGrouping, intent?.state || "all", intent?.metric || "count");

  return {
    ok: true,
    title: intent?.title || buildTitle({ module, grouping: primaryGrouping, dateScope, state: intent?.state, metric: intent?.metric, filters }),
    answer:
      intent?.answer ||
      `I built a ${config.label.toLowerCase()} dashboard from your request, with the closest grouping, KPI cards, and supporting charts.`,
    chart: dashboardChart,
    kpis: makeKpis(rows, module, intent?.metric || "count", primaryGrouping),
    widgets,
    spotlight,
    executiveNotes,
    interpretation: intent.interpretation,
    followUps: buildFollowUps(intent),
    summary:
      intent?.summary?.length
        ? intent.summary
        : summarizeScope({
            rows,
            module,
            grouping: primaryGrouping,
            dateScope,
            metric: intent?.metric || "count",
            filters,
            state: intent?.state || "all",
          }),
  };
}

// hne function buildComparisonResult: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildComparisonResult(intent, datasets) {
  const modules = Array.isArray(intent.modules) && intent.modules.length ? intent.modules : ["incidents", "requests"];
  // hne function filteredModules: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
  const filteredModules = modules.filter((module) => MODULE_CONFIG[module]).slice(0, 3);
  const dateScope = intent?.dateScope || detectDateScope("");
  const state = intent?.state || "all";
  const metric = intent?.metric || "count";

  // hne variable series: series wajda lel chart.
  const series = filteredModules.map((module) => {
    const config = MODULE_CONFIG[module];
    let rows = Array.isArray(datasets[module]) ? datasets[module] : [];
    rows = filterByDateScope(rows, config.defaultDateKey, dateScope);
    rows = filterByState(rows, state);
    rows = filterByMetric(rows, module, metric);
    rows = applyDetectedFilters(rows, intent?.filters || [], module);

    return {
      module,
      label: config.label,
      rows,
      data: monthlySeries(rows, config.defaultDateKey).map((item) => ({
        x: item.month,
        y: item.value,
      })),
    };
  });

  if (!series.some((item) => item.rows.length)) {
    return {
      ok: false,
      answer: "I couldn't find matching data for that comparison. Try a broader period or fewer conditions.",
      suggestions: buildRecoverySuggestions(intent),
      interpretation: intent.interpretation,
    };
  }

  const totalsWidget = {
    title: "Compared Totals",
    summary: "Current total volume by module in the selected comparison scope.",
    chart: {
      type: "bar",
      data: series.map((item) => ({
        label: item.label,
        value: item.rows.length,
      })),
      label: "Compared totals",
    },
  };

  return {
    ok: true,
    title: intent?.title || buildTitle({ compare: true, dateScope }),
    answer:
      intent?.answer ||
      `I compared ${filteredModules.map((module) => MODULE_CONFIG[module].label).join(", ")} over time and added a supporting total volume view.`,
    chart: {
      type: "multiLine",
      data: series.map((item) => ({
        id: item.label,
        data: item.data,
      })),
    },
    kpis: series.map((item) => ({
      label: item.label,
      value: item.rows.length,
      note: state === "all" ? "Items in the selected period" : `${titleCase(state)} scope`,
    })),
    widgets: [totalsWidget],
    spotlight: {
      title: "Comparison spotlight",
      body: `${filteredModules.map((module) => MODULE_CONFIG[module].label).join(" and ")} are being compared over the same time window so you can spot gaps and trend divergence faster.`,
    },
    executiveNotes: [
      `${filteredModules.length} modules are included in this comparison dashboard.`,
      dateScope?.label ? `The active comparison period is ${dateScope.label}.` : "The comparison uses all available data.",
      state === "all" ? "Both open and closed records are included." : `Only ${state} records are included.`,
      metric !== "count" ? `The comparison is optimized around ${titleCase(metric)}.` : "The comparison is optimized around total volume.",
    ],
    interpretation: intent.interpretation,
    followUps: buildFollowUps(intent),
    summary:
      intent?.summary?.length
        ? intent.summary
        : [
            `Compared: ${filteredModules.map((module) => MODULE_CONFIG[module].label).join(", ")}`,
            ...(dateScope?.label ? [`Period: ${dateScope.label}`] : []),
            ...(state !== "all" ? [`State: ${state}`] : []),
            ...(metric !== "count" ? [`Metric: ${metric}`] : []),
          ],
  };
}

// hne function buildIntentFromQuery: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildIntentFromQuery(query, datasets) {
  const text = normalizeQuery(query);
  const moduleDetection = detectModules(text);
  const modules = moduleDetection.modules;
  const overview = [...OVERVIEW_KEYWORDS, ...EXTRA_KEYWORD_GROUPS.overview].some((keyword) => text.includes(keyword));
  const hasExplicitModule = moduleDetection.explicit;
  const compare = isCompareIntent(text, modules);
  const module = !hasExplicitModule && overview ? null : modules[0];
  const effectiveModules = !hasExplicitModule && overview
    ? Object.keys(MODULE_CONFIG)
    : modules;
  const groupingDetection = compare
    ? { groupings: ["month"], confidence: 0.9, scores: [] }
    : detectGroupings(text, module || "incidents");
  const groupings = groupingDetection.groupings;
  const dateScope = detectDateScope(text);
  const stateDetection = detectState(text);
  const metricDetection = detectMetric(text);

  const baseIntent = {
    compare,
    modules: effectiveModules,
    module,
    grouping: groupings[0],
    groupings,
    state: stateDetection.value,
    metric: metricDetection.value,
    dateScope,
    year: dateScope.year,
    yearRange: dateScope.yearRange,
    quarter: dateScope.quarter,
    topN: detectTopN(text),
    chart_type: detectChartType(text, groupings[0], compare),
    filters: detectSemanticFilters(text, effectiveModules, datasets),
    overview,
  };
  const templatedIntent = applyIntentTemplates(baseIntent, text);
  const interpretation = buildInterpretation(templatedIntent, {
    moduleConfidence: moduleDetection.confidence,
    groupingConfidence: groupingDetection.confidence,
    stateConfidence: stateDetection.confidence,
    metricConfidence: metricDetection.confidence,
  });

  return {
    ...templatedIntent,
    interpretation,
  };
}

// hne function buildAssistantIntentHint: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
export function buildAssistantIntentHint(query, datasets) {
  const intent = buildIntentFromQuery(query, datasets);
  return {
    compare: Boolean(intent.compare),
    module: intent.module,
    modules: Array.isArray(intent.modules) ? intent.modules : [],
    grouping: intent.grouping,
    groupings: Array.isArray(intent.groupings) ? intent.groupings : [],
    state: intent.state,
    metric: intent.metric,
    year: intent.year ?? null,
    year_range: intent.yearRange ?? null,
    quarter: intent.quarter ?? null,
    top_n: intent.topN ?? null,
    chart_type: intent.chart_type,
    filters: Array.isArray(intent.filters) ? intent.filters : [],
  };
}

// hne function buildDateScopeFromIntent: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
function buildDateScopeFromIntent(intent) {
  if (intent?.dateScope) return intent.dateScope;
  if (!(intent?.year || intent?.quarter || intent?.yearRange || intent?.year_range)) return detectDateScope("");

  return {
    year: intent?.year || null,
    yearRange: intent?.yearRange || intent?.year_range || null,
    quarter: intent?.quarter || null,
    startDate: (intent?.yearRange || intent?.year_range)
      ? new Date((intent.yearRange || intent.year_range)[0], 0, 1)
      : intent?.year
        ? new Date(intent.year, 0, 1)
        : null,
    endDate: (intent?.yearRange || intent?.year_range)
      ? new Date((intent.yearRange || intent.year_range)[1], 11, 31, 23, 59, 59, 999)
      : intent?.year
        ? new Date(intent.year, 11, 31, 23, 59, 59, 999)
        : null,
    label: (intent?.yearRange || intent?.year_range)
      ? `${(intent.yearRange || intent.year_range)[0]}-${(intent.yearRange || intent.year_range)[1]}`
      : intent?.year
        ? `${intent.year}`
        : intent?.quarter
          ? `Q${intent.quarter}`
          : null,
  };
}

// hne function buildAssistantResultFromIntent: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
export function buildAssistantResultFromIntent(intent, datasets) {
  const normalizedIntent = {
    ...intent,
    dateScope: buildDateScopeFromIntent(intent),
    groupings: Array.isArray(intent?.groupings)
      ? intent.groupings
      : intent?.secondary_grouping
        ? unique([intent?.grouping, intent?.secondary_grouping])
        : intent?.grouping
          ? [intent.grouping]
          : undefined,
    topN: intent?.topN || intent?.top_n,
  };

  if (normalizedIntent?.overview && (!normalizedIntent?.module || (normalizedIntent?.modules || []).length > 1)) {
    return buildOverviewResult(normalizedIntent, datasets);
  }

  if (normalizedIntent?.compare) {
    return buildComparisonResult(normalizedIntent, datasets);
  }

  return buildSingleModuleResult(normalizedIntent, datasets);
}

// hne function buildAssistantResult: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
export function buildAssistantResult(query, datasets) {
  const text = normalizeQuery(query);
  if (!text.trim()) {
    return {
      ok: false,
      answer:
        "Write your request naturally, for example: compare incidents and requests between 2022 and 2024 by month.",
    };
  }

  return buildAssistantResultFromIntent(buildIntentFromQuery(query, datasets), datasets);
}

export const assistantPromptExamples = [
  "Compare incidents and requests between 2023 and 2025 by month",
  "Show me an overview dashboard for open incidents in 2025",
  "Top 5 services with request backlog last 6 months",
  "Open changes by group and by type for network",
  "warini dashboard 3la incidents open par mois w par priority",
  "3tini requests dashboard 3la onboarding last 12 months",
  "warini incidents open by service for 2025",
  "3tini dashboard requests by month and by group",
  "compare incidents and changes last 12 months",
  "ch7al men incidents open andhom sla breach",
  "warini akther service 3andou backlog requests",
  "9aren incidents w changes par mois",
  "3tini synthese globale 3la requests",
];
