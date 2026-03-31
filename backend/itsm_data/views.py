import json
import pandas as pd
import urllib.error
from collections import defaultdict
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response

from .ai_dashboard import build_ai_dashboard_intent
from .models import Incident, Request, Change
from .serializers import (
    ChangeSerializer,
    IncidentSerializer,
    RequestSerializer,
    CurrentUserUpdateSerializer,
    PasswordChangeSerializer,
    TeamMemberCreateSerializer,
    TeamMemberAdminUpdateSerializer,
    TeamMemberSerializer,
)


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

                objs = []
                existing_numbers = set(
                    Incident.objects.exclude(number__isnull=True)
                    .exclude(number__exact="")
                    .values_list("number", flat=True)
                )

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number or number in existing_numbers:
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
                    existing_numbers.add(number)

                Incident.objects.bulk_create(objs, batch_size=500)
                imported_counts["incidents"] = len(objs)

            # -------- REQUESTS --------

            if mode in ["all", "requests"] and req_file:

                rows, used_sheet = read_excel_rows(req_file, sheet_name)
                used_sheets["requests"] = used_sheet

                objs = []
                existing_numbers = set(
                    Request.objects.exclude(number__isnull=True)
                    .exclude(number__exact="")
                    .values_list("number", flat=True)
                )

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number or number in existing_numbers:
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
                    existing_numbers.add(number)

                Request.objects.bulk_create(objs, batch_size=500)
                imported_counts["requests"] = len(objs)

            # -------- CHANGES --------

            if mode in ["all", "changes"] and chg_file:

                rows, used_sheet = read_excel_rows(chg_file, sheet_name)
                used_sheets["changes"] = used_sheet

                objs = []
                existing_numbers = set(
                    Change.objects.exclude(number__isnull=True)
                    .exclude(number__exact="")
                    .values_list("number", flat=True)
                )

                for row in rows:

                    number = clean_text(row.get("Number"))

                    if not number or number in existing_numbers:
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
                    existing_numbers.add(number)

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


@api_view(["GET"])
def monthly_stats(request):

    data = defaultdict(lambda: {
        "month": "",
        "Incidents": 0,
        "Requests": 0,
        "Changes": 0
    })

    def get_month(date_str):
        if not date_str:
            return None
        text = str(date_str)
        return text[:7]  # YYYY-MM

    for r in Incident.objects.all():
        m = get_month(r.opened)
        if not m:
            continue
        data[m]["month"] = m
        data[m]["Incidents"] += 1

    for r in Request.objects.all():
        m = get_month(r.opened)
        if not m:
            continue
        data[m]["month"] = m
        data[m]["Requests"] += 1

    for r in Change.objects.all():
        m = get_month(r.opened)
        if not m:
            continue
        data[m]["month"] = m
        data[m]["Changes"] += 1

    result = sorted(data.values(), key=lambda x: x["month"])

    return Response(result)


@api_view(["POST"])
def ai_dashboard_query(request):
    prompt = str(request.data.get("prompt", "")).strip()
    if not prompt:
        return Response({"detail": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        intent = build_ai_dashboard_intent(prompt)
        return Response({"ok": True, "intent": intent})
    except urllib.error.HTTPError as error:
        try:
            payload = json.loads(error.read().decode("utf-8"))
            message = payload.get("error", {}).get("message") or payload.get("detail")
        except Exception:
            message = None
        return Response(
            {"detail": message or "AI dashboard request failed."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except RuntimeError as error:
        return Response({"detail": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as error:
        return Response({"detail": str(error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def current_user(request):
    return Response(TeamMemberSerializer(request.user).data)


@api_view(["PATCH"])
def update_current_user(request):
    serializer = CurrentUserUpdateSerializer(
        instance=request.user,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.update(request.user, serializer.validated_data)
    return Response(TeamMemberSerializer(request.user).data)


@api_view(["POST"])
def change_current_user_password(request):
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={
            "request": request,
            "target_user": request.user,
            "require_current_password": True,
        },
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"detail": "Password updated successfully."})


@api_view(["GET", "POST"])
def team_members(request):
    if request.method == "GET":
        users = User.objects.all().order_by("-is_superuser", "-is_staff", "username")
        return Response(TeamMemberSerializer(users, many=True).data)

    if not request.user.is_staff:
        return Response(
            {"detail": "Only admins can create new accounts."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = TeamMemberCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(TeamMemberSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
def team_member_detail(request, user_id):
    if not request.user.is_staff:
        return Response(
            {"detail": "Only admins can manage team accounts."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user = get_object_or_404(User, pk=user_id)

    if request.method == "DELETE":
        if user.pk == request.user.pk:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if user.pk == request.user.pk and "is_active" in request.data and request.data.get("is_active") is False:
        return Response(
            {"detail": "You cannot deactivate your own account."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = TeamMemberAdminUpdateSerializer(instance=user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.update(user, serializer.validated_data)
    return Response(TeamMemberSerializer(user).data)


@api_view(["POST"])
def team_member_password(request, user_id):
    if not request.user.is_staff:
        return Response(
            {"detail": "Only admins can reset account passwords."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user = get_object_or_404(User, pk=user_id)
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={
            "request": request,
            "target_user": user,
            "require_current_password": False,
        },
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"detail": "Password reset successfully."})
