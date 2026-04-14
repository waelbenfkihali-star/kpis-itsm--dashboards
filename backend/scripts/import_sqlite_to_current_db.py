import os
import sqlite3
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
SQLITE_PATH = Path(os.getenv("SQLITE_PATH", BACKEND_DIR / "db.sqlite3"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import django

django.setup()

from django.contrib.auth.models import User
from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from itsm_data.models import Change, Incident, Request, UserProfile


def parse_dt(value):
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    parsed = parse_datetime(text.replace(" ", "T"))
    if parsed and timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def fetch_rows(cursor, table_name):
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [description[0] for description in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def main():
    if not SQLITE_PATH.exists():
        raise FileNotFoundError(f"SQLite source database not found: {SQLITE_PATH}")

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    sqlite_users = fetch_rows(cursor, "auth_user")
    sqlite_profiles = fetch_rows(cursor, "itsm_data_userprofile")
    sqlite_incidents = fetch_rows(cursor, "itsm_data_incident")
    sqlite_requests = fetch_rows(cursor, "itsm_data_request")
    sqlite_changes = fetch_rows(cursor, "itsm_data_change")

    with transaction.atomic():
        Incident.objects.all().delete()
        Request.objects.all().delete()
        Change.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.all().delete()

        user_id_map = {}

        for row in sqlite_users:
            user = User.objects.create(
                username=row["username"],
                password=row["password"],
                email=row["email"] or "",
                first_name=row["first_name"] or "",
                last_name=row["last_name"] or "",
                is_staff=bool(row["is_staff"]),
                is_superuser=bool(row["is_superuser"]),
                is_active=bool(row["is_active"]),
                last_login=parse_dt(row["last_login"]),
                date_joined=parse_dt(row["date_joined"]),
            )
            user_id_map[row["id"]] = user

        for row in sqlite_profiles:
            user = user_id_map.get(row["user_id"])
            if not user:
                continue
            UserProfile.objects.create(
                user=user,
                avatar=row["avatar"] or "",
            )

        Incident.objects.bulk_create(
            [
                Incident(
                    number=row["number"],
                    state=row["state"],
                    priority=row["priority"],
                    affected_service=row["affected_service"],
                    parent=row["parent"],
                    parent_incident=row["parent_incident"],
                    service_owner=row["service_owner"],
                    configuration_item=row["configuration_item"],
                    location=row["location"],
                    description=row["description"],
                    short_description=row["short_description"],
                    opened=row["opened"],
                    resolution_code=row["resolution_code"],
                    resolution_notes=row["resolution_notes"],
                    responsible_group=row["responsible_group"],
                    responsible_user=row["responsible_user"],
                    resolved=row["resolved"],
                    reopen_count=row["reopen_count"] or 0,
                    caller=row["caller"],
                    aging_group=row["aging_group"],
                    duration=row["duration"] or 0,
                    service_classification=row["service_classification"],
                    business_duration=row["business_duration"] or 0,
                    problem=row["problem"],
                    sla=row["sla"],
                    schedule=row["schedule"],
                    location_division=row["location_division"],
                    service_request=row["service_request"],
                    is_major=bool(row["is_major"]),
                    sla_breached=bool(row["sla_breached"]),
                )
                for row in sqlite_incidents
            ],
            batch_size=500,
        )

        Request.objects.bulk_create(
            [
                Request(
                    count=row["count"] or 0,
                    number=row["number"],
                    state=row["state"],
                    item=row["item"],
                    short_description=row["short_description"],
                    description=row["description"],
                    affected_service=row["affected_service"],
                    parent=row["parent"],
                    service_owner=row["service_owner"],
                    request=row["request"],
                    requested_for=row["requested_for"],
                    opened=row["opened"],
                    opened_by=row["opened_by"],
                    responsible_group=row["responsible_group"],
                    responsible_user=row["responsible_user"],
                    location=row["location"],
                    aging_group=row["aging_group"],
                    location_division=row["location_division"],
                    updated=row["updated"],
                    resolve_time=row["resolve_time"],
                    service_classification=row["service_classification"],
                    closed=row["closed"],
                    closed_by=row["closed_by"],
                    it_service=row["it_service"],
                )
                for row in sqlite_requests
            ],
            batch_size=500,
        )

        Change.objects.bulk_create(
            [
                Change(
                    count=row["count"] or 0,
                    number=row["number"],
                    type=row["type"],
                    state=row["state"],
                    priority=row["priority"],
                    affected_service=row["affected_service"],
                    parent=row["parent"],
                    service_owner=row["service_owner"],
                    configuration_item=row["configuration_item"],
                    location=row["location"],
                    description=row["description"],
                    short_description=row["short_description"],
                    opened=row["opened"],
                    planned_start_date=row["planned_start_date"],
                    planned_end_date=row["planned_end_date"],
                    closed=row["closed"],
                    responsible_group=row["responsible_group"],
                    responsible_user=row["responsible_user"],
                    location_division=row["location_division"],
                    service_classification=row["service_classification"],
                    risk=row["risk"],
                    category=row["category"],
                    close_code=row["close_code"],
                    close_notes=row["close_notes"],
                )
                for row in sqlite_changes
            ],
            batch_size=500,
        )

    conn.close()

    print("SQLite data imported into the currently configured database.")
    print(f"Users: {User.objects.count()}")
    print(f"Profiles: {UserProfile.objects.count()}")
    print(f"Incidents: {Incident.objects.count()}")
    print(f"Requests: {Request.objects.count()}")
    print(f"Changes: {Change.objects.count()}")


if __name__ == "__main__":
    main()
