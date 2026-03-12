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
)

urlpatterns = [
    path("import/", import_excel),
    path("incidents/", incidents_list),
    path("incidents/delete/", delete_incidents),
    path("incidents/<str:number>/", incident_detail),
    path("requests/", requests_list),
    path("requests/delete/", delete_requests),
    path("requests/<str:number>/", request_detail),
    path("changes/", changes_list),
    path("changes/delete/", delete_changes),
    path("changes/<str:number>/", change_detail),
    path("monthly-stats/", monthly_stats),
    
]