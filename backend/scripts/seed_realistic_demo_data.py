import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DB_PATH = ROOT / "backend" / "db.sqlite3"

NOW = datetime(2026, 4, 1, 9, 0, 0)
START_DATE = datetime(2023, 1, 1, 8, 0, 0)
random.seed(42)

SERVICES = [
    "SAP ERP",
    "Microsoft 365",
    "Network Connectivity",
    "Active Directory",
    "VPN Access",
    "Endpoint Management",
    "ServiceNow Platform",
    "Email Gateway",
    "Manufacturing Execution System",
    "File Services",
]

LOCATIONS = [
    ("Sousse Plant", "Tunisia"),
    ("Mateur Plant", "Tunisia"),
    ("Cluj Office", "Romania"),
    ("Casablanca Hub", "Morocco"),
    ("Leipzig Plant", "Germany"),
    ("Monastir Office", "Tunisia"),
]

GROUPS = [
    ("Global Service Desk", ["Amira Ben Salah", "Youssef Trabelsi", "Nour Mzoughi"]),
    ("Network Operations", ["Mohamed Hadded", "Rania Gharbi", "Slim Ben Ali"]),
    ("SAP Support", ["Khalil Jaziri", "Asma Kallel", "Karim Dhouib"]),
    ("Modern Workplace", ["Wiem Saidi", "Hedi Bouzid", "Sarra Ayadi"]),
    ("Identity & Access", ["Meriem Mhiri", "Aymen Gafsi", "Sami Hachicha"]),
    ("Change Advisory Board", ["Ons Hmid", "Walid Khouja", "Lina Khemiri"]),
]

CALLERS = [
    "Ahmed Ben Omar",
    "Rim Cherif",
    "Mouna Sassi",
    "Hamza Jellouli",
    "Salma Gharbi",
    "Skander Triki",
    "Fatma Rebai",
    "Aziz Ghedira",
]

REQUEST_ITEMS = [
    "Laptop Replacement",
    "VPN Access",
    "Shared Mailbox Access",
    "SAP Role Update",
    "Microsoft Teams Setup",
    "Printer Access",
    "New User Onboarding",
    "Software Installation",
]

CHANGE_TYPES = ["Standard", "Normal", "Emergency"]
CHANGE_CATEGORIES = ["Infrastructure", "Application", "Security", "Database", "Workplace"]
RISKS = ["Low", "Moderate", "High"]
RESOLUTION_CODES = ["Solved Permanently", "Workaround Provided", "User Education", "No Fault Found"]
CLOSE_CODES = ["Successful", "Successful with Issues", "Backed Out", "Cancelled"]
CLASSIFICATIONS = ["Business Application", "Infrastructure", "Security", "End User Service"]
SCHEDULES = ["24x7", "Business Hours", "Regional Shift"]


def fmt(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def pick_location():
    site, division = random.choice(LOCATIONS)
    return site, division


def pick_group():
    group, users = random.choice(GROUPS)
    return group, random.choice(users)


def opened_date():
    day_span = (NOW.date() - START_DATE.date()).days
    random_days = random.randint(0, day_span)
    base = START_DATE + timedelta(days=random_days)
    hour = random.randint(7, 18)
    minute = random.choice([0, 10, 20, 30, 40, 50])
    return base.replace(hour=hour, minute=minute, second=0)


def maybe_parent(prefix, idx):
    return f"{prefix}{idx:05d}" if random.random() < 0.18 else ""


def incident_rows(count=240):
    rows = []
    for i in range(1, count + 1):
        opened = opened_date()
        priority = random.choices(["P1", "P2", "P3", "P4"], weights=[8, 20, 42, 30])[0]
        is_major = priority == "P1" or random.random() < 0.06
        breached = random.random() < (0.42 if priority in {"P1", "P2"} else 0.18)
        state = random.choices(
            ["Open", "In Progress", "Pending", "Resolved", "Closed"],
            weights=[16, 26, 10, 26, 22],
        )[0]
        if is_major and state == "Pending":
            state = "In Progress"

        service = random.choice(SERVICES)
        location, division = pick_location()
        group, user = pick_group()
        caller = random.choice(CALLERS)
        duration = round(random.uniform(0.4, 180 if state in {"Resolved", "Closed"} else 96), 1)
        business_duration = round(max(duration * random.uniform(0.55, 0.9), 0.3), 1)
        resolved = ""
        resolution_code = ""
        resolution_notes = ""
        if state in {"Resolved", "Closed"}:
            resolved_dt = opened + timedelta(hours=max(duration, 1))
            resolved = fmt(resolved_dt)
            resolution_code = random.choice(RESOLUTION_CODES)
            resolution_notes = f"{resolution_code} after technical validation on {service}."

        sla_text = random.choice(
            ["Within SLA", "Response SLA Breached", "Resolution SLA Breached", "Monitoring"]
            if breached
            else ["Within SLA", "Within SLA", "Target Met", "Monitoring"]
        )
        rows.append(
            (
                f"INC{2026:04d}{i:05d}",
                state,
                priority,
                service,
                maybe_parent("TASK", 700 + i),
                maybe_parent("INC", max(1, i - random.randint(1, 10))),
                f"{service} Owner",
                f"{service} - Node {random.randint(1, 24)}",
                location,
                f"{service} issue reported by user at {location}.",
                f"{priority} incident affecting {service}",
                fmt(opened),
                resolution_code,
                resolution_notes,
                group,
                user,
                resolved,
                random.randint(0, 3) if state in {"Resolved", "Closed"} else random.randint(0, 1),
                caller,
                random.choice(["0-7 Days", "8-30 Days", "31-60 Days", "> 60 Days"]),
                duration,
                random.choice(CLASSIFICATIONS),
                business_duration,
                maybe_parent("PRB", 100 + i),
                sla_text,
                random.choice(SCHEDULES),
                division,
                maybe_parent("REQ", 200 + i),
                1 if is_major else 0,
                1 if breached else 0,
            )
        )
    return rows


def request_rows(count=210):
    rows = []
    for i in range(1, count + 1):
        opened = opened_date()
        state = random.choices(
            ["Open", "In Progress", "Pending", "Resolved", "Completed", "Closed"],
            weights=[15, 25, 10, 15, 18, 17],
        )[0]
        item = random.choice(REQUEST_ITEMS)
        service = random.choice(SERVICES)
        location, division = pick_location()
        group, user = pick_group()
        requested_for = random.choice(CALLERS)
        opened_by = random.choice(CALLERS)
        age_days = (NOW - opened).days
        updated = opened + timedelta(days=random.randint(0, max(age_days, 1)), hours=random.randint(1, 8))
        closed = ""
        closed_by = ""
        resolve_time = ""
        if state in {"Resolved", "Completed", "Closed"}:
            closed_dt = updated + timedelta(hours=random.randint(2, 72))
            closed = fmt(closed_dt)
            closed_by = user
            resolve_time = f"{random.randint(2, 96)} hours"

        rows.append(
            (
                1,
                f"REQ{2026:04d}{i:05d}",
                state,
                item,
                f"{item} request for {requested_for}",
                f"Business user requested {item.lower()} related to {service}.",
                service,
                maybe_parent("RITM", 400 + i),
                f"{service} Owner",
                f"REQPARENT-{random.randint(1000, 9999)}",
                requested_for,
                fmt(opened),
                opened_by,
                group,
                user,
                location,
                "0-7 Days" if age_days < 8 else "8-30 Days" if age_days < 31 else "31-60 Days" if age_days < 61 else "> 60 Days",
                division,
                fmt(updated),
                resolve_time,
                random.choice(CLASSIFICATIONS),
                closed,
                closed_by,
                service,
            )
        )
    return rows


def change_rows(count=180):
    rows = []
    for i in range(1, count + 1):
        opened = opened_date()
        change_type = random.choices(CHANGE_TYPES, weights=[42, 43, 15])[0]
        priority = random.choices(["P1", "P2", "P3", "P4"], weights=[10, 25, 40, 25])[0]
        service = random.choice(SERVICES)
        location, division = pick_location()
        group, user = pick_group()
        start = opened + timedelta(days=random.randint(1, 18))
        end = start + timedelta(hours=random.randint(2, 72))
        state = random.choices(
            ["Scheduled", "Implementation", "Pending", "Open", "Implemented", "Closed", "Completed"],
            weights=[20, 18, 10, 12, 18, 12, 10],
        )[0]
        if change_type == "Emergency":
            state = random.choice(["Implementation", "Implemented", "Closed", "Completed", "Open"])

        closed = ""
        close_code = ""
        close_notes = ""
        if state in {"Implemented", "Closed", "Completed"}:
            closed_dt = end + timedelta(hours=random.randint(1, 48))
            closed = fmt(closed_dt)
            close_code = random.choice(CLOSE_CODES)
            close_notes = f"{close_code} after validation and stakeholder communication."

        rows.append(
            (
                1,
                f"CHG{2026:04d}{i:05d}",
                change_type,
                state,
                priority,
                service,
                maybe_parent("RFC", 800 + i),
                f"{service} Owner",
                f"{service} CI-{random.randint(10, 99)}",
                location,
                f"{change_type} change planned for {service} at {location}.",
                f"{change_type} change for {service}",
                fmt(opened),
                fmt(start),
                fmt(end),
                closed,
                group,
                user,
                division,
                random.choice(CLASSIFICATIONS),
                random.choice(RISKS),
                random.choice(CHANGE_CATEGORIES),
                close_code,
                close_notes,
            )
        )
    return rows


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("DELETE FROM itsm_data_incident")
    cur.execute("DELETE FROM itsm_data_request")
    cur.execute("DELETE FROM itsm_data_change")

    cur.executemany(
        """
        INSERT INTO itsm_data_incident (
            number, state, priority, affected_service, parent, parent_incident, service_owner,
            configuration_item, location, description, short_description, opened, resolution_code,
            resolution_notes, responsible_group, responsible_user, resolved, reopen_count, caller,
            aging_group, duration, service_classification, business_duration, problem, sla, schedule,
            location_division, service_request, is_major, sla_breached
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        incident_rows(),
    )

    cur.executemany(
        """
        INSERT INTO itsm_data_request (
            count, number, state, item, short_description, description, affected_service, parent,
            service_owner, request, requested_for, opened, opened_by, responsible_group,
            responsible_user, location, aging_group, location_division, updated, resolve_time,
            service_classification, closed, closed_by, it_service
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        request_rows(),
    )

    cur.executemany(
        """
        INSERT INTO itsm_data_change (
            count, number, type, state, priority, affected_service, parent, service_owner,
            configuration_item, location, description, short_description, opened, planned_start_date,
            planned_end_date, closed, responsible_group, responsible_user, location_division,
            service_classification, risk, category, close_code, close_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        change_rows(),
    )

    conn.commit()
    conn.close()
    print("Seeded realistic demo data into db.sqlite3")


if __name__ == "__main__":
    main()
