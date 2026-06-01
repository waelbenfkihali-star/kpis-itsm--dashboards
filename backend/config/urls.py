# hne routes l principales mta3 projet Django lkol
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # hne route mta3 Django admin panel
    path("admin/", admin.site.urls),

    # hne JWT auth endpoints: login yraja3 access/refresh w refresh yjaded access
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # hne nrbtou kol routes mta3 app itsm_data ta7t /api/
    path("api/", include("itsm_data.urls")),
]
