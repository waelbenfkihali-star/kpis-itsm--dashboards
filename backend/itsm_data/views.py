import pandas as pd
from django.db import transaction
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from .models import Incident, Request, Change
from .serializers import IncidentSerializer, RequestSerializer, ChangeSerializer


# -------- CLEANING FUNCTIONS --------

def clean_text(value):
    if value is None:
        return ""
    return str(value).strip()


def clean_state(value):
    if not value:
        return ""

    v = str(value).strip().lower()

    mapping = {
        "open": "Open",
        "opened": "Open",
        "closed": "Closed",
        "resolved": "Resolved",
        "in progress": "In Progress",
        "pending": "Pending",
    }

    return mapping.get(v, v.capitalize())


def clean_priority(value):
    if not value:
        return ""

    v = str(value).strip().upper()

    mapping = {
        "P1": "P1",
        "P2": "P2",
        "P3": "P3",
        "P4": "P4",
        "CRITICAL": "P1",
        "HIGH": "P2",
        "MEDIUM": "P3",
        "LOW": "P4",
    }

    return mapping.get(v, v)


def to_bool(value):
    v = str(value).strip().lower()
    return v in ["true", "yes", "y", "1", "major", "oui"]


def to_int(value):
    try:
        if value in ["", None]:
            return 0
        return int(float(value))
    except Exception:
        return 0


def to_float(value):
    try:
        if value in ["", None]:
            return 0
        return float(value)
    except Exception:
        return 0


# -------- READ EXCEL --------

def read_excel_rows(uploaded_file, sheet_name):
    xls = pd.ExcelFile(uploaded_file)
    target = None

    for s in xls.sheet_names:
        if s.strip().lower() == sheet_name.strip().lower():
            target = s
            break

    if not target:
        target = xls.sheet_names[0]

    df = pd.read_excel(uploaded_file, sheet_name=target)

    # nettoyage pandas
    df = df.drop_duplicates()
    df = df.dropna(how="all")
    df = df.fillna("")

    return df.to_dict(orient="records"), target


# -------- IMPORT EXCEL --------

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def import_excel(request):
    mode = request.data.get("mode", "all")
    sheet_name = request.data.get("sheet", "Data")

    inc_file = request.FILES.get("incidents")
    req_file = request.FILES.get("requests")
    chg_file = request.FILES.get("changes")

    imported_counts = {
        "incidents": 0,
        "requests": 0,
        "changes": 0,
    }

    used_sheets = {}

    try:
        with transaction.atomic():

            # -------- INCIDENTS --------

            if mode in ["all", "incidents"] and inc_file:

                rows, used_sheet = read_excel_rows(inc_file, sheet_name)
                used_sheets["incidents"] = used_sheet

                Incident.objects.all().delete()

                objs = []

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number:
                        continue

                    priority = clean_priority(row.get("Priority"))
                    sla_value = str(row.get("SLA", "")).lower()

                    objs.append(
                        Incident(
                            number=number,
                            state=clean_state(row.get("State")),
                            priority=priority,
                            affected_service=clean_text(row.get("Affected Service")),
                            parent=clean_text(row.get("Parent")),
                            parent_incident=clean_text(row.get("Parent Incident")),
                            service_owner=clean_text(row.get("Service Owner")),
                            configuration_item=clean_text(row.get("Configuration item")),
                            location=clean_text(row.get("Location")),
                            description=clean_text(row.get("Description")),
                            short_description=clean_text(row.get("Short description")),
                            opened=clean_text(row.get("Opened")),
                            resolution_code=clean_text(row.get("Resolution code")),
                            resolution_notes=clean_text(row.get("Resolution notes")),
                            responsible_group=clean_text(row.get("Responsible group")),
                            responsible_user=clean_text(row.get("Responsible user")),
                            resolved=clean_text(row.get("Resolved")),
                            reopen_count=to_int(row.get("Reopen count")),
                            caller=clean_text(row.get("Caller")),
                            aging_group=clean_text(row.get("Aging Group")),
                            duration=to_float(row.get("Duration")),
                            service_classification=clean_text(row.get("Service classification")),
                            business_duration=to_float(row.get("Business duration")),
                            problem=clean_text(row.get("Problem")),
                            sla=clean_text(row.get("SLA")),
                            schedule=clean_text(row.get("Schedule")),
                            location_division=clean_text(row.get("Location Division")),
                            service_request=clean_text(row.get("Service Request")),
                            is_major=to_bool(row.get("Is Major")) or priority == "P1",
                            sla_breached=to_bool(row.get("SLA Breached")) or "breach" in sla_value,
                        )
                    )

                Incident.objects.bulk_create(objs, batch_size=500)
                imported_counts["incidents"] = len(objs)

            # -------- REQUESTS --------

            if mode in ["all", "requests"] and req_file:

                rows, used_sheet = read_excel_rows(req_file, sheet_name)
                used_sheets["requests"] = used_sheet

                Request.objects.all().delete()

                objs = []

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number:
                        continue

                    objs.append(
                        Request(
                            count=to_int(row.get("Count")),
                            number=number,
                            state=clean_state(row.get("State")),
                            item=clean_text(row.get("Item")),
                            short_description=clean_text(row.get("Short description")),
                            description=clean_text(row.get("Description")),
                            affected_service=clean_text(row.get("Affected Service")),
                            parent=clean_text(row.get("Parent")),
                            service_owner=clean_text(row.get("Service Owner")),
                            request=clean_text(row.get("Request")),
                            requested_for=clean_text(row.get("Requested for")),
                            opened=clean_text(row.get("Opened")),
                            opened_by=clean_text(row.get("Opened by")),
                            responsible_group=clean_text(row.get("Responsible group")),
                            responsible_user=clean_text(row.get("Responsible user")),
                            location=clean_text(row.get("Location")),
                            aging_group=clean_text(row.get("Aging Group")),
                            location_division=clean_text(row.get("Location Division")),
                            updated=clean_text(row.get("Updated")),
                            resolve_time=clean_text(row.get("Resolve Time")),
                            service_classification=clean_text(row.get("Service classification")),
                            closed=clean_text(row.get("Closed")),
                            closed_by=clean_text(row.get("Closed by")),
                            it_service=clean_text(row.get("IT Service")),
                        )
                    )

                Request.objects.bulk_create(objs, batch_size=500)
                imported_counts["requests"] = len(objs)

            # -------- CHANGES --------

            if mode in ["all", "changes"] and chg_file:

                rows, used_sheet = read_excel_rows(chg_file, sheet_name)
                used_sheets["changes"] = used_sheet

                Change.objects.all().delete()

                objs = []

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number:
                        continue

                    objs.append(
                        Change(
                            count=to_int(row.get("Count")),
                            number=number,
                            type=clean_text(row.get("Type")),
                            state=clean_state(row.get("State")),
                            priority=clean_priority(row.get("Priority")),
                            affected_service=clean_text(row.get("Affected Service")),
                            parent=clean_text(row.get("Parent")),
                            service_owner=clean_text(row.get("Service Owner")),
                            configuration_item=clean_text(row.get("Configuration item")),
                            location=clean_text(row.get("Location")),
                            description=clean_text(row.get("Description")),
                            short_description=clean_text(row.get("Short description")),
                            opened=clean_text(row.get("Opened")),
                            planned_start_date=clean_text(row.get("Planned start date")),
                            planned_end_date=clean_text(row.get("Planned end date")),
                            closed=clean_text(row.get("Closed")),
                            responsible_group=clean_text(row.get("Responsible group")),
                            responsible_user=clean_text(row.get("Responsible user")),
                            location_division=clean_text(row.get("Location Division")),
                            service_classification=clean_text(row.get("Service classification")),
                            risk=clean_text(row.get("Risk")),
                            category=clean_text(row.get("Category")),
                            close_code=clean_text(row.get("Close code") or row.get("Close Code")),
                            close_notes=clean_text(row.get("Close notes") or row.get("Close Notes")),
                        )
                    )

                Change.objects.bulk_create(objs, batch_size=500)
                imported_counts["changes"] = len(objs)

        return Response(
            {
                "ok": True,
                "imported_counts": imported_counts,
                "used_sheets": used_sheets,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"ok": False, "error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )


# -------- API LIST --------

@api_view(["GET"])
def incidents_list(request):
    rows = Incident.objects.all().order_by("-id")
    return Response(IncidentSerializer(rows, many=True).data)


@api_view(["GET"])
def requests_list(request):
    rows = Request.objects.all().order_by("-id")
    return Response(RequestSerializer(rows, many=True).data)


@api_view(["GET"])
def changes_list(request):
    rows = Change.objects.all().order_by("-id")
    return Response(ChangeSerializer(rows, many=True).data)


@api_view(["GET"])
def incident_detail(request, number):
    row = Incident.objects.filter(number=number).first()
    if not row:
        return Response({"detail": "Not found"}, status=404)
    return Response(IncidentSerializer(row).data)


@api_view(["GET"])
def request_detail(request, number):
    row = Request.objects.filter(number=number).first()
    if not row:
        return Response({"detail": "Not found"}, status=404)
    return Response(RequestSerializer(row).data)


@api_view(["GET"])
def change_detail(request, number):
    row = Change.objects.filter(number=number).first()
    if not row:
        return Response({"detail": "Not found"}, status=404)
    return Response(ChangeSerializer(row).data)
@api_view(["POST"])
def delete_incidents(request):
    ids = request.data.get("ids", [])
    Incident.objects.filter(id__in=ids).delete()
    return Response({"deleted": len(ids)})
@api_view(["POST"])
def delete_requests(request):
    ids = request.data.get("ids", [])
    Request.objects.filter(id__in=ids).delete()
    return Response({"deleted": len(ids)})


@api_view(["POST"])
def delete_changes(request):
    ids = request.data.get("ids", [])
    Change.objects.filter(id__in=ids).delete()
    return Response({"deleted": len(ids)})