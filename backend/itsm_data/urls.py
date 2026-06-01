# hne routes mta3 app itsm_data: kol path hne marbout b endpoint/view mo3ayna fil backend
from django.urls import path
from .views import (
    import_excel,
    incidents_list,
    requests_list,
    changes_list,
    incident_detail,
    request_detail,
    change_detail,
    delete_incidents,
    delete_changes,
    delete_requests,
    monthly_stats,
    current_user,
    update_current_user,
    change_current_user_password,
    team_members,
    team_member_detail,
    team_member_password,
    ai_dashboard_query,
    kpis_list,
    kpi_detail,
)

urlpatterns = [
    # hne auth/profile endpoints mta3 l user connecté
    path("auth/me/", current_user),
    path("auth/me/update/", update_current_user),
    path("auth/me/password/", change_current_user_password),
    # hne team management endpoints
    path("team/", team_members),
    path("team/<int:user_id>/", team_member_detail),
    path("team/<int:user_id>/password/", team_member_password),
    path("kpis/", kpis_list),
    path("kpis/<int:kpi_id>/", kpi_detail),
    # hne import endpoint mta3 Excel
    path("import/", import_excel),
    # hne incidents endpoints: list, delete, details
    path("incidents/", incidents_list),
    path("incidents/delete/", delete_incidents),
    path("incidents/<str:number>/", incident_detail),
    # hne requests endpoints: list, delete, details
    path("requests/", requests_list),
    path("requests/delete/", delete_requests),
    path("requests/<str:number>/", request_detail),
    # hne changes endpoints: list, delete, details
    path("changes/", changes_list),
    path("changes/delete/", delete_changes),
    path("changes/<str:number>/", change_detail),
    # hne endpoints zeyda lel dashboard global w AI dashboard
    path("monthly-stats/", monthly_stats),
    path("ai/dashboard-query/", ai_dashboard_query),
    
]
