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
  const counts = {};

  rows.forEach((row) => {
    const month = parseDate(row[key]);
    if (!month) return;
    counts[month] = (counts[month] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({ month, value }));
}

export function monthlyDualSeries(rows, firstKey, secondKey, firstLabel, secondLabel) {
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

  return Object.values(counts).sort((a, b) => a.month.localeCompare(b.month));
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
