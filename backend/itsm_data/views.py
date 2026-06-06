# hne aham API logic fil backend: import Excel, list/detail/delete lel records, team/profile management, w AI dashboard query.
import json
import pandas as pd
import urllib.error
from collections import defaultdict
from datetime import datetime
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives

from .ai_dashboard import build_ai_dashboard_intent
from .kpi_defaults import DEFAULT_KPIS
from .models import Incident, Request, Change, KpiDefinition
from .serializers import (
    ChangeSerializer,
    IncidentSerializer,
    KpiDefinitionSerializer,
    RequestSerializer,
    CurrentUserUpdateSerializer,
    PasswordChangeSerializer,
    TeamMemberCreateSerializer,
    TeamMemberAdminUpdateSerializer,
    TeamMemberSerializer,
    logger,
)


def sync_default_kpis():
    for item in DEFAULT_KPIS:
        defaults = {
            "name": item.get("name", "").strip(),
            "owner": item.get("owner", "").strip(),
            "module": item.get("module", "").strip(),
            "dimension": item.get("dimension", "").strip(),
            "target": item.get("target", "").strip(),
            "frequency": item.get("frequency", "").strip(),
            "unit": item.get("unit", "").strip(),
            "formula": item.get("formula", "").strip(),
            "source": item.get("source", "").strip(),
            "status": item.get("status", "Active").strip(),
            "description": item.get("description", "").strip(),
            "is_default": True,
        }
        obj, created = KpiDefinition.objects.get_or_create(
            kpi_id=item["kpi_id"].strip(),
            defaults=defaults,
        )




# hne function tjib chwaya values mokhtalfin men field mo3ayen bech nesta3mlouhom k context, lel AI.
def sample_distinct_values(queryset, field_name, limit=5):
    values = (
        queryset.exclude(**{f"{field_name}__isnull": True})
        .exclude(**{field_name: ""})
        .values_list(field_name, flat=True)
        .distinct()[:limit]
    )
    return [str(value).strip() for value in values if str(value).strip()]



# hne function tebni context men data mawjouda fil database bech AI yefhem services w groups w divisions l 7a9i9iyin.
def build_ai_data_context():
    return {
        "modules": {
            "incidents": {
                "service_values": sample_distinct_values(Incident.objects.all(), "affected_service"),
                "group_values": sample_distinct_values(Incident.objects.all(), "responsible_group"),
                "division_values": sample_distinct_values(Incident.objects.all(), "location_division"),
                "ci_values": sample_distinct_values(Incident.objects.all(), "configuration_item"),
            },
            "requests": {
                "service_values": sample_distinct_values(Request.objects.all(), "it_service"),
                "group_values": sample_distinct_values(Request.objects.all(), "responsible_group"),
                "division_values": sample_distinct_values(Request.objects.all(), "location_division"),
                "item_values": sample_distinct_values(Request.objects.all(), "item"),
            },
            "changes": {
                "service_values": sample_distinct_values(Change.objects.all(), "affected_service"),
                "group_values": sample_distinct_values(Change.objects.all(), "responsible_group"),
                "division_values": sample_distinct_values(Change.objects.all(), "location_division"),
                "ci_values": sample_distinct_values(Change.objects.all(), "configuration_item"),
                "type_values": sample_distinct_values(Change.objects.all(), "type"),
            },
        },
        "guidance": {
            "ib_means": "division",
            "service_owner_means": "owner",
            "ci_means": "configuration item",
        },
    
    }


# hne function tnadhhef text jey men Excel: tna7i les espaces zeydin w valeurs kif nan wala null.
def clean_text(value):
    if value is None:
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "nat", "none", "null"}:
        return ""
    
    return " ".join(text.split())



# hne function tnadhhef fields elli yochbhou lel asami, w ila valeur fergha fallback mafhoum.
def clean_name_like(value, fallback="Unknown"):
    
    text = clean_text(value)
    
    return text or fallback


# hne function twa7ed l states l mokhtalfa elli jeya men source data l states mafhouma dakhil l app.
def clean_state(value):
    if not value:
        return ""

    v = str(value).strip().lower()

    mapping = {
        "open": "Open",
        "opened": "Open",
        "new": "Open",
        "assigned": "Open",
        "closed": "Closed",
        "resolved": "Resolved",
        "in progress": "In Progress",
        "work in progress": "In Progress",
        "wip": "In Progress",
        "pending": "Pending",
        "pending user info": "Pending",
        "pending vendor": "Pending",
        "pending change": "Pending",
        "on hold": "Pending",
        "awaiting info": "Pending",
        "complete": "Completed",
        "completed": "Completed",
        "implemented": "Implemented",
    
    }


    return mapping.get(v, v.capitalize())


# hne function twa7ed l priorities l format ma3rouf kif P1 w P2 w P3 w P4.
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



# hne function tebdel values kif yes/no wala 1/0 l true wala false.
def to_bool(value):
    v = str(value).strip().lower()
    return v in ["true", "yes", "y", "1", "major", "oui"]

# hne function t7awel tebdel value l integer b tari9a amna, w ila tefchel 0.
def to_int(value):
    
    try:
        if value in ["", None]:
           
            return 0
        
        return int(float(value))
    except Exception:
        return 0


# hne function t7awel tebdel value l float b tari9a amna, w ila tefchel 0.
def to_float(value):
   
    try:
        if value in ["", None]:
            return 0
        return float(value)
    except Exception:
        return 0

# hne function twa7ed format mta3 date bech ba9i l app ynajem yeta3amel ma3aha .
def normalize_date(value):
    if value in ["", None]:
        return ""

    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")

    try:
        timestamp = pd.to_datetime(value, errors="coerce", dayfirst=False)
        if pd.isna(timestamp):
           
            timestamp = pd.to_datetime(value, errors="coerce", dayfirst=True)
        
        if pd.isna(timestamp):
            
            return clean_text(value)
        return timestamp.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return clean_text(value)


# hne function ta9ra sheet l matloub men Excel, tna7i l takrar w l astor l fergha, w rows wajdin lel import.
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

    df = df.drop_duplicates()
    
    df = df.dropna(how="all")
    
    df = df.fillna("")

    return df.to_dict(orient="records"), target


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
# hne endpoint mta3 import: yodkhel incidents w requests w changes men Excel dakhil transaction wa7da.
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
                            service_owner=clean_name_like(row.get("Service Owner")),
                            configuration_item=clean_name_like(row.get("Configuration item")),
                            location=clean_name_like(row.get("Location")),
                            description=clean_text(row.get("Description")),
                            short_description=clean_text(row.get("Short description")),
                            opened=normalize_date(row.get("Opened")),
                            resolution_code=clean_text(row.get("Resolution code")),
                            resolution_notes=clean_text(row.get("Resolution notes")),
                            responsible_group=clean_name_like(row.get("Responsible group")),
                            responsible_user=clean_name_like(row.get("Responsible user")),
                            resolved=normalize_date(row.get("Resolved")),
                            reopen_count=to_int(row.get("Reopen count")),
                            caller=clean_name_like(row.get("Caller")),
                            aging_group=clean_name_like(row.get("Aging Group")),
                            duration=to_float(row.get("Duration")),
                            service_classification=clean_text(row.get("Service classification")),
                            business_duration=to_float(row.get("Business duration")),
                            problem=clean_text(row.get("Problem")),
                            sla=clean_text(row.get("SLA")),
                            schedule=clean_name_like(row.get("Schedule")),
                            location_division=clean_name_like(row.get("Location Division")),
                            service_request=clean_text(row.get("Service Request")),
                            is_major=to_bool(row.get("Is Major")) or priority == "P1",
                            sla_breached=to_bool(row.get("SLA Breached")) or "breach" in sla_value,
                        )
                    )
                    existing_numbers.add(number)

                Incident.objects.bulk_create(objs, batch_size=500)
                imported_counts["incidents"] = len(objs)


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
                            item=clean_name_like(row.get("Item")),
                            short_description=clean_text(row.get("Short description")),
                            description=clean_text(row.get("Description")),
                            affected_service=clean_name_like(row.get("Affected Service")),
                            parent=clean_text(row.get("Parent")),
                            service_owner=clean_name_like(row.get("Service Owner")),
                            request=clean_text(row.get("Request")),
                            requested_for=clean_name_like(row.get("Requested for")),
                            opened=normalize_date(row.get("Opened")),
                            opened_by=clean_name_like(row.get("Opened by")),
                            responsible_group=clean_name_like(row.get("Responsible group")),
                            responsible_user=clean_name_like(row.get("Responsible user")),
                            location=clean_name_like(row.get("Location")),
                            aging_group=clean_name_like(row.get("Aging Group")),
                            location_division=clean_name_like(row.get("Location Division")),
                            updated=normalize_date(row.get("Updated")),
                            resolve_time=clean_text(row.get("Resolve Time")),
                            service_classification=clean_text(row.get("Service classification")),
                            closed=normalize_date(row.get("Closed")),
                            closed_by=clean_name_like(row.get("Closed by")),
                            it_service=clean_name_like(row.get("IT Service") or row.get("Affected Service")),
                        )
                    )
                    existing_numbers.add(number)

                Request.objects.bulk_create(objs, batch_size=500)
                imported_counts["requests"] = len(objs)


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
                            affected_service=clean_name_like(row.get("Affected Service")),
                            parent=clean_text(row.get("Parent")),
                            service_owner=clean_name_like(row.get("Service Owner")),
                            configuration_item=clean_name_like(row.get("Configuration item")),
                            location=clean_name_like(row.get("Location")),
                            description=clean_text(row.get("Description")),
                            short_description=clean_text(row.get("Short description")),
                            opened=normalize_date(row.get("Opened")),
                            planned_start_date=normalize_date(row.get("Planned start date")),
                            planned_end_date=normalize_date(row.get("Planned end date")),
                            closed=normalize_date(row.get("Closed")),
                            responsible_group=clean_name_like(row.get("Responsible group")),
                            responsible_user=clean_name_like(row.get("Responsible user")),
                            location_division=clean_name_like(row.get("Location Division")),
                            service_classification=clean_text(row.get("Service classification")),
                            risk=clean_name_like(row.get("Risk")),
                            category=clean_name_like(row.get("Category")),
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


@api_view(["GET", "POST"])
def kpis_list(request):
    sync_default_kpis()

    if request.method == "GET":
        rows = KpiDefinition.objects.filter(is_deleted=False)
        if not request.user.is_staff:
            rows = rows.filter(status__iexact="Active")
        rows = rows.order_by("module", "kpi_id", "id")
        return Response(KpiDefinitionSerializer(rows, many=True).data)

    if not request.user.is_staff:
        return Response(
            {"detail": "Only admins can create KPIs."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = KpiDefinitionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    row = serializer.save(is_default=False, is_deleted=False)
    return Response(KpiDefinitionSerializer(row).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
def kpi_detail(request, kpi_id):
    sync_default_kpis()
    row = get_object_or_404(KpiDefinition, pk=kpi_id)

    if request.method == "GET":
        if row.is_deleted:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if row.status.strip().lower() == "retired" and not request.user.is_staff:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(KpiDefinitionSerializer(row).data)

    if not request.user.is_staff:
        return Response(
            {"detail": "Only admins can manage KPIs."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "DELETE":
        if row.is_default:
            row.is_deleted = True
            row.save(update_fields=["is_deleted", "updated_at"])
        else:
            row.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = KpiDefinitionSerializer(instance=row, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated = serializer.save(is_deleted=False)
    return Response(KpiDefinitionSerializer(updated).data)



@api_view(["GET"])
# hne endpoint liste incidents lkol mortbin men l a7deth lel a9dem.
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
# hne endpoint details mta3 incident wa7da hasb number mawjouda fil route.
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
# hne endpoint yfasakh incidents l mokhtarin b ids w 9adeh men sater temsa7.
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
# hne endpoint y7seb overview b chhar yjamma3 incidents w requests w changes fil nafs l silsila iya.
def monthly_stats(request):

    data = defaultdict(lambda: {
        "month": "",
        "Incidents": 0,
        "Requests": 0,
        "Changes": 0
    })

    # hne helper sghir ye5ou date string w menha l juz2 YYYY-MM bech na3mlou grouping b chhar.
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
@permission_classes([AllowAny])
# hne endpoint ye5ou prompt mta3 user w y7awlou l intent mnadhem bech saf7et AI dashboard .
def ai_dashboard_query(request):
    prompt = str(request.data.get("prompt", "")).strip()
    hint_intent = request.data.get("hint_intent")
    if not prompt:
        return Response({"detail": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        intent = build_ai_dashboard_intent(prompt, build_ai_data_context(), hint_intent)
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
# hne endpoint data mta3 l user elli 3amel login taw.
def current_user(request):
    return Response(TeamMemberSerializer(request.user).data)


@api_view(["PATCH"])
# hne endpoint ybadel ma3loumet l user l 7ali w l neskha l mou7adtha.
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
# hne endpoint ybadel password mta3 l user l 7ali ba3d validation.
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
# hne endpoint fil GET les comptes lkol, w fil POST y5lo9 account jdid ila elli ba3eth request admin.
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
# hne endpoint ykhallel admin ybadel account mo3ayen wala yfasakhou, m3a 7imaya men self-delete w self-deactivate.
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
# hne endpoint ykhallel admin ya3mel reset lel password mta3 user mo3ayen.
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
