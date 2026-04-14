export function countBy(rows, key, fallback = "Unknown") {
  const counts = {};

  rows.forEach((row) => {
    const value = row[key] || fallback;
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function topLabel(rows, key, fallback = "Unknown") {
  return countBy(rows, key, fallback)[0]?.label || fallback;
}

export function ratio(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function parseDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const monthMatch = text.match(/^(\d{4})-(\d{2})/);
  if (monthMatch) return `${monthMatch[1]}-${monthMatch[2]}`;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthlySeries(rows, key) {
  return monthlySeriesInRange(rows, key, rows);
}

function buildMonthRange(rows, key) {
  const months = rows
    .map((row) => parseDate(row[key]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (!months.length) return [];

  const [startYear, startMonth] = months[0].split("-").map(Number);
  const [endYear, endMonth] = months[months.length - 1].split("-").map(Number);
  const cursor = new Date(startYear, startMonth - 1, 1);
  const end = new Date(endYear, endMonth - 1, 1);
  const range = [];

  while (cursor <= end) {
    range.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return range;
}

export function monthlySeriesInRange(rows, key, rangeRows = rows, rangeKey = key) {
  const counts = {};

  rows.forEach((row) => {
    const month = parseDate(row[key]);
    if (!month) return;
    counts[month] = (counts[month] || 0) + 1;
  });

  const monthRange = buildMonthRange(rangeRows, rangeKey);
  if (!monthRange.length) {
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({ month, value }));
  }

  return monthRange.map((month) => ({ month, value: counts[month] || 0 }));
}

export function monthlyDualSeries(rows, firstKey, secondKey, firstLabel, secondLabel) {
  return monthlyDualSeriesInRange(rows, firstKey, secondKey, firstLabel, secondLabel, rows, firstKey);
}

export function monthlyDualSeriesInRange(
  rows,
  firstKey,
  secondKey,
  firstLabel,
  secondLabel,
  rangeRows = rows,
  rangeKey = firstKey
) {
  const counts = {};

  function touch(month) {
    if (!month) return null;
    counts[month] = counts[month] || {
      month,
      [firstLabel]: 0,
      [secondLabel]: 0,
    };
    return counts[month];
  }

  rows.forEach((row) => {
    const firstMonth = parseDate(row[firstKey]);
    const secondMonth = parseDate(row[secondKey]);

    if (firstMonth) touch(firstMonth)[firstLabel] += 1;
    if (secondMonth) touch(secondMonth)[secondLabel] += 1;
  });

  const monthRange = buildMonthRange(rangeRows, rangeKey);
  if (!monthRange.length) {
    return Object.values(counts).sort((a, b) => a.month.localeCompare(b.month));
  }

  return monthRange.map((month) => ({
    month,
    [firstLabel]: counts[month]?.[firstLabel] || 0,
    [secondLabel]: counts[month]?.[secondLabel] || 0,
  }));
}

export function monthlyBreakdown(rows, dateKey, groupKey, limit = 5, fallback = "Unknown") {
  return monthlyBreakdownInRange(rows, dateKey, groupKey, limit, fallback, rows, dateKey);
}

export function monthlyBreakdownInRange(
  rows,
  dateKey,
  groupKey,
  limit = 5,
  fallback = "Unknown",
  rangeRows = rows,
  rangeKey = dateKey
) {
  const topGroups = countBy(rows, groupKey, fallback)
    .slice(0, limit)
    .map((item) => item.label);
  const counts = {};

  rows.forEach((row) => {
    const month = parseDate(row[dateKey]);
    if (!month) return;

    const group = row[groupKey] || fallback;
    if (!topGroups.includes(group)) return;

    counts[month] = counts[month] || { month };
    topGroups.forEach((label) => {
      if (counts[month][label] === undefined) counts[month][label] = 0;
    });
    counts[month][group] += 1;
  });

  const monthRange = buildMonthRange(rangeRows, rangeKey);
  const data = monthRange.length
    ? monthRange.map((month) => {
        const item = counts[month] || { month };
        topGroups.forEach((label) => {
          if (item[label] === undefined) item[label] = 0;
        });
        return item;
      })
    : Object.values(counts).sort((a, b) => a.month.localeCompare(b.month));

  return {
    keys: topGroups,
    data,
  };
}

export function average(rows, key, filterFn = null) {
  const scopedRows = typeof filterFn === "function" ? rows.filter(filterFn) : rows;
  const values = scopedRows
    .map((row) => Number(row[key]))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

export function countWhere(rows, predicate) {
  return rows.filter(predicate).length;
}

export function diffInDays(value, baseDate = new Date()) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const diff = baseDate.getTime() - parsed.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function bucketAging(days) {
  if (days === null || days < 0) return "Not past due";
  if (days < 30) return "< 30 Days";
  if (days < 60) return "> 30 & < 60 Days";
  return "> 60 Days";
}

export function agingByState(rows, dateKey, stateKey) {
  const result = {};

  rows.forEach((row) => {
    const aging = bucketAging(diffInDays(row[dateKey]));
    const state = row[stateKey] || "Unknown";

    result[aging] = result[aging] || { aging, total: 0 };
    result[aging][state] = (result[aging][state] || 0) + 1;
    result[aging].total += 1;
  });

  const order = ["Not past due", "< 30 Days", "> 30 & < 60 Days", "> 60 Days"];
  return order
    .filter((key) => result[key])
    .map((key) => result[key]);
}

export function makePieData(items) {
  return items.map((item) => ({
    id: item.label,
    label: item.label,
    value: item.value,
  }));
}

export function makeBarData(items, limit = 8) {
  return items.slice(0, limit).map((item) => ({
    label: item.label,
    value: item.value,
  }));
}

export function makeLineData(points, label) {
  return [
    {
      id: label,
      data: points.map((point) => ({
        x: point.month,
        y: point.value,
      })),
    },
  ];
}

export const CHART_COLORS = [
  "#c26d3a",
  "#7a8f46",
  "#a44a3f",
  "#3f7c85",
  "#8b5e83",
  "#d4a239",
  "#5b6c8f",
  "#b86f7a",
];

export function getChartColor(index = 0) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function makeLegendItems(labels = []) {
  return labels.filter(Boolean).map((label, index) => ({
    label,
    color: getChartColor(index),
  }));
}

export function renderBarTooltip({ id, value, indexValue, color }) {
  return `
${id}: ${indexValue}
Value: ${value}
`;
}

export function renderLineTooltip(point) {
  const payload = point?.point || point;
  const seriesId = payload?.serieId || payload?.serie?.id || "Series";
  const month = payload?.data?.xFormatted || payload?.data?.x || payload?.x || "-";
  const value = payload?.data?.yFormatted || payload?.data?.y || payload?.y || "-";

  return `
${seriesId}
Month: ${month}
Value: ${value}
`;
}

export function renderPieTooltip({ datum }) {
  return `
${datum.id}
Value: ${datum.value}
`;
}
