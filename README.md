# ITSM KPI Dashboard

This project is a React + Django ITSM dashboard. It now supports PostgreSQL for local development and for a cleaner DevOps handoff.

## Stack

- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Auth: JWT
- Database: PostgreSQL via Docker Compose

## Run With PostgreSQL

1. Create a local env file from [.env.example](C:/Users/wael/kpis-itsm-dashboards/.env.example):

```powershell
Copy-Item .env.example .env
```

2. Start the full stack:

```powershell
docker compose up -d --build
```

3. Open the app:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- PostgreSQL: `localhost:5433`

The backend container automatically runs migrations before starting Django.

## Environment Variables

- `DB_ENGINE=postgres` to use PostgreSQL
- `DB_ENGINE=sqlite` to temporarily use SQLite
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `POSTGRES_EXPOSE_PORT` for the host-side port, default `5433`
- `OPENAI_API_KEY` for the AI dashboard builder

## Move Existing Data From SQLite To PostgreSQL

The safest app-level migration path here is Django fixtures.

1. Export data from the old SQLite database:

```powershell
docker compose run --rm -e DB_ENGINE=sqlite -e SQLITE_PATH=/app/db.sqlite3 backend python manage.py dumpdata itsm_data auth.User --indent 2 > data-export.json
```

2. Start PostgreSQL normally:

```powershell
docker compose up -d postgres backend
```

3. Load the exported data into PostgreSQL:

```powershell
Get-Content .\data-export.json | docker compose exec -T backend python manage.py loaddata -
```

4. Verify the migration:

```powershell
docker compose exec backend python manage.py shell -c "from itsm_data.models import Incident, Request, Change; print(Incident.objects.count(), Request.objects.count(), Change.objects.count())"
```

There is also a direct migration helper for this repository:

```powershell
docker compose exec backend python scripts/import_sqlite_to_current_db.py
```

## Seed Demo Data

The seed script is now database-agnostic and works with the currently configured database:

```powershell
docker compose exec backend python scripts/seed_realistic_demo_data.py
```

## DevOps Handoff

For DevOps, the minimum clean handoff is:

- Keep secrets in environment variables or a secret manager, not in git
- Set `DEBUG=False` in production
- Replace Django dev server with Gunicorn or Uvicorn
- Put Nginx or a reverse proxy in front of frontend/backend
- Restrict `ALLOWED_HOSTS` and CORS
- Use a managed PostgreSQL instance or a persistent PostgreSQL volume
- Add CI steps for `python manage.py migrate`, tests, and frontend build
- Add automated backups for PostgreSQL

## Current Docker Services

- `frontend`: Vite dev server
- `backend`: Django app
- `postgres`: PostgreSQL 16 with persistent Docker volume
row.is_deleted = True
row.save(update_fields=["is_deleted"])
profile.is_archived = True
profile.save(update_fields=["is_archived"])

Incident.objects.filter(id__in=ids).update(is_archived=True)

docker compose exec postgres psql -U itsm_user -d itsm_dashboard
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
InputLabelProps={{ shrink: true }}
docker compose restart backend
docker compose restart frontend
line: {
  title: "Emergency Changes Trend",
  data: monthlySeriesInRange(
    rows.filter((row) => String(row.type || "").toLowerCase().includes("emergency")),
    "opened",
    rows,
    "opened"
  ),
  label: "Emergency Changes",
}
chart: {
  title: "Requests by Item",
  type: "pie",
  data: countBy(rows, "item"),
}
chart: {
  title: "Open Incidents by Group",
  data: countBy(openBacklogRows, "responsible_group"),
}
{
  title: "Open Incidents by Group per Month",
  note: "Monthly comparison of open incidents by responsible group.",
  type: "stacked",
  ...monthlyBreakdownInRange(
    openBacklogRows,
    "opened",
    "responsible_group",
    5,
    "Unknown",
    rows,
    "opened"
  ),
}
{
  title: "Emergency Changes",
  value: emergencyRows.length,
  note: `${ratio(emergencyRows.length, rows.length)}% of selected changes are emergency type`,
}
{
  title: "Top Responsible Group",
  value: countBy(rows, "responsible_group")[0]?.label || "-",
  note: "Group with the highest volume in the selected scope",
}
{
  title: "Emergency Changes",
  value: countWhere(rows, (row) =>
    String(row.type || "").toLowerCase().includes("emergency")
  ),
  note: "Changes marked as emergency",
}




variables u need : 
// hne nfilteriw rows 7aseb condition mo3ayna bach n7adhrou scope mta3 KPI.
// exemple: n5arjou kan incidents elli mazelt open.
const scopeRows = rows.filter((row) =>
  ["Open", "In Progress", "Pending"].includes(row.state)
);

// hne n7esbou 9adech fama rows fil scope elli 7adharnah.
// exemple: 9adech fama open incidents.
const totalCount = scopeRows.length;

// hne n3addou rows elli y7a99ou condition mo3ayna direct men rows lkol.
// exemple: 9adech fama incidents major.
const matchingCount = countWhere(rows, (row) => row.is_major);

// hne نجمعو scope rows 7aseb field mo3ayen kif service wala group.
// exemple: incidents open grouped by responsible group.
const groupedRows = countBy(scopeRows, "responsible_group");

// hne njibou akther valeur wala category متكررة fil scope.
// exemple: anehou akther responsible group 3andou open incidents.
const topValue = countBy(scopeRows, "responsible_group")[0]?.label || "-";

// hne n7esbou percentage men part w total.
// exemple: percentage mta3 incidents major men total incidents.
const percentageValue = ratio(matchingCount, rows.length);

// hne n7esbou moyenne mta3 field ra9mi fil scope.
// exemple: moyenne mta3 duration fil incidents elli open.
const avgValue = average(scopeRows, "duration");

// hne نبنيو trend chahri men scope rows 7aseb date field mo3ayen.
// exemple: trend chahri mta3 open incidents 7aseb opened.
const monthlyTrend = monthlySeriesInRange(scopeRows, "opened", rows, "opened");

// hne نبنيو breakdown chahri groupé 7aseb group field mo3ayen.
// exemple: open incidents per month grouped by responsible group.
const monthlyGrouped = monthlyBreakdownInRange(
  scopeRows,
  "opened",
  "responsible_group",
  5,
  "Unknown",
  rows,
  "opened"
);

cards u need : 
cards: [
  {
    title: "Open Incidents",
    value: totalCount,
    note: `${ratio(totalCount, rows.length)}% of selected incidents are still open`,
  },
  {
    title: "Top Responsible Group",
    value: topValue,
    note: "Group carrying the highest open incident backlog",
  },
  {
    title: "Average Duration",
    value: avgValue || "-",
    note: "Average duration across open incidents",
  },
]



bar chart by item :
chart: {
  title: "Open Incidents by Group",
  data: groupedRows,
}

pie chart distrubution : 
chart: {
  title: "Requests Distribution by Item",
  type: "pie",
  data: groupedRows,
}

line chart : 
line: {
  title: "Emergency Changes Trend",
  data: monthlyTrend,
  label: "Emergency Changes",
}

stacked chart : 
extras: [
  {
    title: "Open Incidents by Group per Month",
    note: "Monthly comparison of top responsible groups.",
    type: "stacked",
    ...monthlyGrouped,
  },
]
function handleShowActiveKpis() {
  const activeKpis = rows.filter((row) => row.status === "Active");
  setFilteredRows(activeKpis);
}
function handleSheilaP1P2() {
  const result = rows.filter(
    (row) =>
      ["P1", "P2"].includes(row.priority) &&
      String(row.responsible_user || "").toLowerCase().includes("sheila")
  );
  setFilteredRows(result);
}

@api_view(["GET"])
def p1_incidents(request):
    incidents = Incident.objects.filter(priority="P1")
    serializer = IncidentSerializer(incidents, many=True)
    return Response(serializer.data)

path("incidents/p1/", views.p1_incidents),

apiFetch("/incidents/p1/")
  .then((res) => res.json())
  .then((data) => setRows(data));

<Button onClick={() => navigate("/incidents")}>
  Go to Incidents
</Button>

apiFetch("/incidents/?archived=true")
apiFetch("/kpis/?deleted=true")
<InfoStat
  title="Age"
  value={currentUser?.age ?? "-"}
  note="Calculated from birthdate"
/>

npm run build
docker compose exec backend python manage.py check