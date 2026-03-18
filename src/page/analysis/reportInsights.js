import { countBy, countWhere, ratio, topLabel } from "./analysisUtils";

function formatPercent(part, total) {
  return `${ratio(part, total)}%`;
}

export function buildDashboardInsights({
  incidents,
  requests,
  changes,
  majorIncidents,
  incidentBacklog,
  openRequests,
  openChanges,
}) {
  const slaBreached = countWhere(incidents, (row) => row.sla_breached);
  const oldRequests = countWhere(openRequests, (row) => {
    if (!row.opened) return false;
    const opened = new Date(row.opened);
    return !Number.isNaN(opened.getTime()) && Date.now() - opened.getTime() > 60 * 24 * 60 * 60 * 1000;
  });
  const pastDueChanges = countWhere(openChanges, (row) => {
    if (!row.planned_end_date) return false;
    const planned = new Date(row.planned_end_date);
    return !Number.isNaN(planned.getTime()) && planned.getTime() < Date.now();
  });

  return {
    highlights: [
      `${majorIncidents.length} major incidents are currently in scope across ${incidents.length} incident records.`,
      `${openRequests.length} requests and ${openChanges.length} changes remain open in the current dashboard view.`,
      `Top workload owners are ${topLabel(openRequests, "responsible_group")} for requests and ${topLabel(openChanges, "responsible_group")} for changes.`,
    ],
    risks: [
      slaBreached ? `${slaBreached} incidents have already breached SLA.` : null,
      oldRequests ? `${oldRequests} open requests are older than 60 days and may need backlog cleanup.` : null,
      pastDueChanges ? `${pastDueChanges} open changes are already past their planned end date.` : null,
    ],
    actions: [
      `Review backlog pressure for ${topLabel(incidentBacklog, "affected_service")} because it is carrying the largest incident load.`,
      `Prioritize aging work with ${topLabel(openRequests, "responsible_group")} to reduce delayed request fulfillment.`,
      `Check delivery plans with ${topLabel(openChanges, "responsible_group")} to recover overdue changes.`,
    ],
  };
}

export function buildIncidentInsights({
  rows,
  backlog,
  major,
  slaBreached,
  unassignedBacklog,
  services,
  groups,
}) {
  return {
    highlights: [
      `${rows.length} incidents were included in this analysis scope.`,
      `${major} incidents are major, representing ${formatPercent(major, rows.length)} of the selected scope.`,
      `${services[0]?.label || "Unknown"} is the most impacted service in the current incident selection.`,
    ],
    risks: [
      backlog ? `${backlog} incidents are still open, which is ${formatPercent(backlog, rows.length)} of the selected set.` : null,
      slaBreached ? `${slaBreached} incidents in scope have breached SLA.` : null,
      unassignedBacklog ? `${unassignedBacklog} open incidents still have no responsible user assigned.` : null,
    ],
    actions: [
      `Review assignment discipline in ${groups[0]?.label || "the top responsible group"} to reduce ownership gaps.`,
      `Focus remediation on ${services[0]?.label || "the top impacted service"} first because it carries the largest concentration of incidents.`,
    ],
  };
}

export function buildRequestInsights({
  rows,
  backlog,
  closed,
  olderThan60,
  services,
  groups,
  items,
}) {
  return {
    highlights: [
      `${rows.length} requests are included in the current report scope.`,
      `${closed} requests are already completed or closed, equal to ${formatPercent(closed, rows.length)} of the selection.`,
      `${services[0]?.label || "Unknown"} is the service with the highest request volume in scope.`,
    ],
    risks: [
      backlog ? `${backlog} requests are still open and waiting for completion.` : null,
      olderThan60 ? `${olderThan60} open requests are older than 60 days.` : null,
      groups[0]?.label ? `${groups[0].label} is carrying the heaviest request workload.` : null,
    ],
    actions: [
      `Reduce aging demand in ${groups[0]?.label || "the busiest group"} to improve closure flow.`,
      `Review fulfillment patterns for ${items[0]?.label || "the top requested item"} because it appears most often in the selected scope.`,
    ],
  };
}

export function buildChangeInsights({
  rows,
  open,
  closed,
  critical,
  emergency,
  pastDue,
  services,
  groups,
}) {
  return {
    highlights: [
      `${rows.length} changes are covered in this report.`,
      `${closed} changes are already completed, which is ${formatPercent(closed, rows.length)} of the selected scope.`,
      `${services[0]?.label || "Unknown"} is the most impacted service in the selected changes.`,
    ],
    risks: [
      open ? `${open} changes are still open and need active tracking.` : null,
      pastDue ? `${pastDue} changes are past their planned end date.` : null,
      emergency ? `${emergency} changes are emergency type, representing ${formatPercent(emergency, rows.length)} of the scope.` : null,
      critical ? `${critical} changes are priority P1 and require stronger risk control.` : null,
    ],
    actions: [
      `Reconfirm delivery commitments with ${groups[0]?.label || "the busiest group"} to recover overdue work.`,
      `Prioritize governance around ${services[0]?.label || "the top service"} because it carries the highest change concentration.`,
    ],
  };
}

export function buildSelectionInsights({
  rows,
  statusCounts,
  primaryCounts,
  secondaryCounts,
  subtitle,
}) {
  const topStatus = statusCounts[0];
  const topPrimary = primaryCounts[0];
  const topSecondary = secondaryCounts[0];

  return {
    highlights: [
      `${rows.length} selected ${subtitle.toLowerCase()} are included in this report.`,
      topStatus ? `The dominant status is ${topStatus.label} with ${topStatus.value} records.` : null,
      topPrimary ? `${topPrimary.label} is the top ${subtitle.toLowerCase()} driver in the primary breakdown.` : null,
    ],
    risks: [
      topSecondary ? `${topSecondary.label} carries the highest load in the secondary breakdown and should be monitored.` : null,
    ],
    actions: [
      `Review the concentration in ${topPrimary?.label || "the top primary category"} to understand why it leads the current selection.`,
      `Use the status mix to validate whether the selected ${subtitle.toLowerCase()} are progressing as expected.`,
    ],
  };
}
