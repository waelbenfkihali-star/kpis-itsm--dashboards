import { countBy, monthlySeries } from "../page/analysis/analysisUtils";

const MODULE_CONFIG = {
  incidents: {
    label: "Incidents",
    singular: "incident",
    keywords: ["incident", "incidents", "incidenti"],
    defaultDateKey: "opened",
    groupKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      priority: "priority",
      state: "state",
      site: "location",
    },
  },
  requests: {
    label: "Requests",
    singular: "request",
    keywords: ["request", "requests", "requete", "requetes", "demande", "demandes"],
    defaultDateKey: "opened",
    groupKeys: {
      service: "it_service",
      group: "responsible_group",
      month: "opened",
      item: "item",
      state: "state",
      user: "requested_for",
    },
  },
  changes: {
    label: "Changes",
    singular: "change",
    keywords: ["change", "changes", "changement", "changements"],
    defaultDateKey: "opened",
    groupKeys: {
      service: "affected_service",
      group: "responsible_group",
      month: "opened",
      type: "type",
      priority: "priority",
      state: "state",
    },
  },
};

const GROUP_KEYWORDS = {
  service: ["service", "services", "par service", "by service"],
  group: ["group", "groupe", "groups", "groupes", "team", "equipe", "by group", "par groupe"],
  month: [
    "month",
    "months",
    "mois",
    "monthly",
    "mensuel",
    "trend",
    "timeline",
    "over time",
    "par mois",
    "by month",
    "evolution",
  ],
  priority: ["priority", "priorite", "priorities", "p1", "p2", "p3", "p4"],
  state: ["status", "state", "etat", "states", "statuses"],
  site: ["site", "location", "locations", "localisation"],
  item: ["item", "catalog", "article", "catalogue"],
  type: ["type", "types", "category", "categorie"],
  user: ["user", "requested for", "demandeur", "requester"],
};

const STATE_KEYWORDS = {
  open: ["open", "opened", "ouvert", "ouverte", "ouvertes", "backlog", "pending", "en cours", "in progress"],
  closed: ["closed", "resolved", "completed", "implemented", "ferme", "fermee", "fermees", "cloture"],
};

const METRIC_KEYWORDS = {
  major: ["major", "major incidents", "critique majeure"],
  sla: ["sla", "breach", "breached", "violated", "depassement", "depasse"],
  emergency: ["emergency", "urgent change", "changement urgent"],
  pastDue: ["past due", "overdue", "retard", "en retard"],
};

const PIE_KEYWORDS = ["share", "distribution", "repartition", "répartition", "breakdown"];

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

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function isClosedState(value) {
  return ["closed", "resolved", "completed", "implemented"].includes(normalizeText(value));
}

function parseDateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}

function monthsAgo(count, baseDate = new Date()) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() - count, 1);
}

function detectModules(text) {
  const modules = Object.entries(MODULE_CONFIG)
    .filter(([, config]) => config.keywords.some((keyword) => text.includes(keyword)))
    .map(([key]) => key);

  return modules.length ? modules : ["incidents"];
}

function detectAllYears(text) {
  return [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]));
}

function detectQuarter(text) {
  const quarterMatch = text.match(/\bq([1-4])\b/) || text.match(/\b([1-4])(st|nd|rd|th)? quarter\b/);
  if (!quarterMatch) return null;
  return Number(quarterMatch[1]);
}

function detectTopN(text) {
  const topMatch = text.match(/\b(top|first|best)\s+(\d{1,2})\b/) || text.match(/\b(\d{1,2})\s+(top|best)\b/);
  if (topMatch) return Math.max(1, Math.min(Number(topMatch[2] || topMatch[1]), 20));

  const limitMatch = text.match(/\b(limit|only)\s+(\d{1,2})\b/);
  return limitMatch ? Math.max(1, Math.min(Number(limitMatch[2]), 20)) : 8;
}

function detectGrouping(text, module) {
  const available = MODULE_CONFIG[module].groupKeys;
  return (
    Object.entries(GROUP_KEYWORDS).find(
      ([key, keywords]) => available[key] && keywords.some((keyword) => text.includes(keyword))
    )?.[0] || "service"
  );
}

function detectState(text) {
  const wantsOpen = STATE_KEYWORDS.open.some((keyword) => text.includes(keyword));
  const wantsClosed = STATE_KEYWORDS.closed.some((keyword) => text.includes(keyword));
  if (wantsOpen && !wantsClosed) return "open";
  if (wantsClosed && !wantsOpen) return "closed";
  return "all";
}

function detectMetric(text) {
  return (
    Object.entries(METRIC_KEYWORDS).find(([, keywords]) =>
      keywords.some((keyword) => text.includes(keyword))
    )?.[0] || "count"
  );
}

function isCompareIntent(text, modules) {
  return modules.length > 1 || /\b(compare|comparison|versus|vs|contre|between)\b/.test(text);
}

function detectChartType(text, grouping, compare) {
  if (compare || grouping === "month") return "line";
  if (PIE_KEYWORDS.some((keyword) => text.includes(normalizeText(keyword)))) return "pie";
  return "bar";
}

function detectDateScope(text) {
  const years = detectAllYears(text);
  const quarter = detectQuarter(text);
  const currentYear = new Date().getFullYear();
  const lastMonthsMatch = text.match(/\b(last|past|derniers?)\s+(\d{1,2})\s+months?\b/) ||
    text.match(/\b(\d{1,2})\s+derniers?\s+mois\b/);
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

  if (/\blast year\b/.test(text) || /\bl annee derniere\b/.test(text) || /\bannee derniere\b/.test(text)) {
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
    text.match(/\bde\s+(20\d{2})\s+a\s+(20\d{2})\b/);
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

  const monthKeys = Object.keys(MONTH_ALIASES).sort((left, right) => right.length - left.length);
  const monthName = monthKeys.find((monthKey) => new RegExp(`\\b${monthKey}\\b`).test(text));
  if (monthName) {
    const monthIndex = MONTH_ALIASES[monthName] - 1;
    const year = years[0] || currentYear;
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

function extractDistinctValues(rows, key) {
  return [...new Set(rows.map((row) => String(row?.[key] || "").trim()).filter(Boolean))];
}

function findEntityMatch(text, rows, key) {
  const values = extractDistinctValues(rows, key)
    .filter((value) => normalizeText(value).length >= 2)
    .sort((left, right) => right.length - left.length);

  return (
    values.find((value) => {
      const normalizedValue = normalizeText(value);
      return normalizedValue && text.includes(normalizedValue);
    }) || null
  );
}

function detectPriorityFilter(text) {
  const match = text.match(/\bp([1-4])\b/);
  return match ? `P${match[1]}` : null;
}

function detectModuleFilters(text, module, datasets) {
  const rows = Array.isArray(datasets[module]) ? datasets[module] : [];
  const config = MODULE_CONFIG[module];
  const filters = [];

  const priority = detectPriorityFilter(text);
  if (priority && config.groupKeys.priority) {
    filters.push({ key: config.groupKeys.priority, value: priority, label: `Priority ${priority}` });
  }

  [
    ["service", config.groupKeys.service],
    ["group", config.groupKeys.group],
    ["site", config.groupKeys.site],
    ["item", config.groupKeys.item],
    ["type", config.groupKeys.type],
    ["user", config.groupKeys.user],
  ].forEach(([label, key]) => {
    if (!key) return;
    const matchedValue = findEntityMatch(text, rows, key);
    if (matchedValue) {
      filters.push({ key, value: matchedValue, label: `${titleCase(label)}: ${matchedValue}` });
    }
  });

  return filters;
}

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

function filterByState(rows, state) {
  if (state === "open") {
    return rows.filter((row) => !isClosedState(row.state));
  }
  if (state === "closed") {
    return rows.filter((row) => isClosedState(row.state));
  }
  return rows;
}

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

function applyDetectedFilters(rows, filters) {
  return filters.reduce(
    (scopedRows, filter) => scopedRows.filter((row) => normalizeText(row[filter.key]) === normalizeText(filter.value)),
    rows
  );
}

function makeBarRows(rows, key, limit = 8) {
  return countBy(rows, key)
    .slice(0, limit)
    .map((item) => ({
      label: item.label,
      value: item.value,
    }));
}

function makePieRows(rows, key, limit = 8) {
  return countBy(rows, key)
    .slice(0, limit)
    .map((item) => ({
      id: item.label,
      label: item.label,
      value: item.value,
    }));
}

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

function buildTitle({ module, grouping, dateScope, state, metric, filters, compare }) {
  const stateLabel = state !== "all" ? `${titleCase(state)} ` : "";
  const metricLabel = metric !== "count" ? `${titleCase(metric)} ` : "";
  const filterLabel = filters?.length ? ` for ${filters.map((filter) => filter.value).join(", ")}` : "";
  const timeLabel = dateScope?.label ? ` in ${dateScope.label}` : "";

  if (compare) return `Comparison by Month${timeLabel}`;
  if (grouping === "month") return `${stateLabel}${metricLabel}${MODULE_CONFIG[module].label} by Month${timeLabel}${filterLabel}`;
  return `${stateLabel}${metricLabel}${MODULE_CONFIG[module].label} by ${titleCase(grouping)}${timeLabel}${filterLabel}`;
}

function buildSingleModuleResult(intent, datasets) {
  const module = MODULE_CONFIG[intent?.module] ? intent.module : "incidents";
  const config = MODULE_CONFIG[module];
  const grouping = config.groupKeys[intent?.grouping] ? intent.grouping : "service";
  const dateScope = intent?.dateScope || detectDateScope("");
  const filters = Array.isArray(intent?.filters) ? intent.filters : [];

  let rows = Array.isArray(datasets[module]) ? datasets[module] : [];
  rows = filterByDateScope(rows, config.defaultDateKey, dateScope);
  rows = filterByState(rows, intent?.state || "all");
  rows = filterByMetric(rows, module, intent?.metric || "count");
  rows = applyDetectedFilters(rows, filters);

  if (!rows.length) {
    return {
      ok: false,
      answer: `I couldn't find matching ${config.label.toLowerCase()} for that scope. Try removing one filter or widening the date range.`,
    };
  }

  if (grouping === "month") {
    const points = monthlySeries(rows, config.groupKeys.month).map((item) => ({
      month: item.month,
      value: item.value,
    }));

    return {
      ok: true,
      title: intent?.title || buildTitle({ module, grouping, dateScope, state: intent?.state, metric: intent?.metric, filters }),
      answer:
        intent?.answer ||
        `I analyzed ${rows.length} ${config.label.toLowerCase()} and built the closest monthly dashboard for your request.`,
      chart: {
        type: intent?.chart_type === "bar" ? "bar" : "line",
        data: points,
        label: config.label,
      },
      summary:
        intent?.summary?.length
          ? intent.summary
          : summarizeScope({
              rows,
              module,
              grouping,
              dateScope,
              metric: intent?.metric,
              filters,
              state: intent?.state || "all",
            }),
    };
  }

  const chartType = intent?.chart_type === "pie" ? "pie" : "bar";
  const chartData =
    chartType === "pie"
      ? makePieRows(rows, config.groupKeys[grouping], intent?.topN || 8)
      : makeBarRows(rows, config.groupKeys[grouping], intent?.topN || 8);

  return {
    ok: true,
    title: intent?.title || buildTitle({ module, grouping, dateScope, state: intent?.state, metric: intent?.metric, filters }),
    answer:
      intent?.answer ||
      `I analyzed ${rows.length} ${config.label.toLowerCase()} and grouped them by ${grouping} for the closest dashboard match.`,
    chart: {
      type: chartType,
      data: chartData,
      label: grouping,
    },
    summary:
      intent?.summary?.length
        ? intent.summary
        : summarizeScope({
            rows,
            module,
            grouping,
            dateScope,
            metric: intent?.metric,
            filters,
            state: intent?.state || "all",
          }),
  };
}

function buildComparisonResult(intent, datasets) {
  const modules = Array.isArray(intent.modules) && intent.modules.length ? intent.modules : ["incidents", "requests"];
  const filteredModules = modules.filter((module) => MODULE_CONFIG[module]).slice(0, 3);
  const dateScope = intent?.dateScope || detectDateScope("");
  const state = intent?.state || "all";
  const metric = intent?.metric || "count";

  const series = filteredModules.map((module) => {
    const config = MODULE_CONFIG[module];
    let rows = Array.isArray(datasets[module]) ? datasets[module] : [];
    rows = filterByDateScope(rows, config.defaultDateKey, dateScope);
    rows = filterByState(rows, state);
    rows = filterByMetric(rows, module, metric);

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
    };
  }

  const comparedLabels = filteredModules.map((module) => MODULE_CONFIG[module].label).join(" vs ");
  return {
    ok: true,
    title: intent?.title || buildTitle({ compare: true, dateScope }),
    answer:
      intent?.answer ||
      `I compared ${comparedLabels} over time and generated the closest monthly dashboard for your request.`,
    chart: {
      type: "multiLine",
      data: series.map((item) => ({
        id: item.label,
        data: item.data,
      })),
    },
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

function buildIntentFromQuery(query, datasets) {
  const text = normalizeText(query);
  const modules = detectModules(text);
  const module = modules[0];
  const compare = isCompareIntent(text, modules);
  const grouping = compare ? "month" : detectGrouping(text, module);
  const dateScope = detectDateScope(text);

  return {
    compare,
    modules,
    module,
    grouping,
    state: detectState(text),
    metric: detectMetric(text),
    dateScope,
    year: dateScope.year,
    quarter: dateScope.quarter,
    topN: detectTopN(text),
    chart_type: detectChartType(text, grouping, compare),
    filters: compare ? [] : detectModuleFilters(text, module, datasets),
  };
}

export function buildAssistantResultFromIntent(intent, datasets) {
  if (intent?.compare) {
    return buildComparisonResult(
      {
        ...intent,
        dateScope:
          intent?.dateScope ||
          (intent?.year || intent?.quarter || intent?.yearRange
            ? {
                year: intent?.year || null,
                yearRange: intent?.yearRange || null,
                quarter: intent?.quarter || null,
                startDate: intent?.yearRange
                  ? new Date(intent.yearRange[0], 0, 1)
                  : intent?.year
                    ? new Date(intent.year, 0, 1)
                    : null,
                endDate: intent?.yearRange
                  ? new Date(intent.yearRange[1], 11, 31, 23, 59, 59, 999)
                  : intent?.year
                    ? new Date(intent.year, 11, 31, 23, 59, 59, 999)
                    : null,
                label: intent?.yearRange
                  ? `${intent.yearRange[0]}-${intent.yearRange[1]}`
                  : intent?.year
                    ? `${intent.year}`
                    : intent?.quarter
                      ? `Q${intent.quarter}`
                      : null,
              }
            : detectDateScope(""))
      },
      datasets
    );
  }

  return buildSingleModuleResult(
    {
      ...intent,
      dateScope:
        intent?.dateScope ||
        (intent?.year || intent?.quarter || intent?.yearRange
          ? {
              year: intent?.year || null,
              yearRange: intent?.yearRange || null,
              quarter: intent?.quarter || null,
              startDate: intent?.yearRange
                ? new Date(intent.yearRange[0], 0, 1)
                : intent?.year
                  ? new Date(intent.year, 0, 1)
                  : null,
              endDate: intent?.yearRange
                ? new Date(intent.yearRange[1], 11, 31, 23, 59, 59, 999)
                : intent?.year
                  ? new Date(intent.year, 11, 31, 23, 59, 59, 999)
                  : null,
              label: intent?.yearRange
                ? `${intent.yearRange[0]}-${intent.yearRange[1]}`
                : intent?.year
                  ? `${intent.year}`
                  : intent?.quarter
                    ? `Q${intent.quarter}`
                    : null,
            }
          : detectDateScope("")),
    },
    datasets
  );
}

export function buildAssistantResult(query, datasets) {
  const text = normalizeText(query);
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
  "Compare incidents and requests between 2022 and 2024 by month",
  "Show top 5 incidents by service in 2023",
  "Open changes by group for network",
  "Requests for onboarding last 6 months",
  "Demandes ouvertes par service en 2023",
];
