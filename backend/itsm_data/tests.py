# hne tests backend bech net2akdou elli APIs l ra2isiya tekhdem kif ma .
import datetime

from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import KpiDefinition, UserProfile


# hne class TeamApiTests: tamthel structure wala behavior fil backend.
class TeamApiTests(APITestCase):
    # hne function setUp: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def setUp(self):
        self.admin = User.objects.create_user(
            username="wael",
            email="wael@example.com",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
            first_name="Wael",
            last_name="Ali",
        )
        self.user = User.objects.create_user(
            username="ritha",
            email="ritha.initial@example.com",
            password="StrongPass123!",
            first_name="Ritha",
            last_name="Ben Ali",
        )
        UserProfile.objects.get_or_create(user=self.admin)
        UserProfile.objects.get_or_create(user=self.user)
    # hne test test_me_returns_authenticated_user: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    def test_me_returns_authenticated_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "wael")
        self.assertEqual(response.data["access"], "Admin")
        self.assertEqual(response.data["email"], "wael@example.com")

    # hne test test_team_list_returns_existing_accounts: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    def test_team_list_returns_existing_accounts(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/team/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [row["username"] for row in response.data]
        self.assertIn("wael", usernames)
        self.assertIn("ritha", usernames)

    # hne test test_admin_can_create_admin_account: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        DEFAULT_FROM_EMAIL="LEONI IT <no-reply@leoni.local>",
        ACCOUNT_EMAIL_BRAND="LEONI IT",
        APP_LOGIN_URL="http://localhost:5173/login",
    )
    def test_admin_can_create_admin_account(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/team/",
            {
                "username": "newadmin",
                "email": "newadmin@example.com",
                "first_name": "New",
                "last_name": "Admin",
                "password": "StrongPass123!",
                "access": "Admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(username="newadmin")
        self.assertTrue(created.is_staff)
        self.assertTrue(created.is_superuser)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["newadmin@example.com"])
        self.assertIn("newadmin", mail.outbox[0].body)
        self.assertIn("StrongPass123!", mail.outbox[0].body)

    # hne test test_non_admin_cannot_create_account: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    def test_non_admin_cannot_create_account(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/team/",
            {
                "username": "blocked",
                "password": "StrongPass123!",
                "access": "User",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # hne test test_user_can_update_own_profile: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    def test_user_can_update_own_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            "/api/auth/me/update/",
            {
                "username": "ritha.updated",
                "first_name": "Ritha",
                "last_name": "Ben Ali",
                "email": "ritha@example.com",
                "avatar": "data:image/png;base64,abc123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(self.user.username, "ritha.updated")
        self.assertEqual(profile.avatar, "data:image/png;base64,abc123")
        self.assertEqual(self.user.email, "ritha@example.com")
    # hne test test_admin_can_deactivate_and_reset_password: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.
    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        DEFAULT_FROM_EMAIL="LEONI IT <no-reply@leoni.local>",
        ACCOUNT_EMAIL_BRAND="LEONI IT",
    )
    def test_admin_can_deactivate_and_reset_password(self):
        self.client.force_authenticate(user=self.admin)

        update_response = self.client.patch(
            f"/api/team/{self.user.id}/",
            {"is_active": False, "access": "User"},
            format="json",
        )
        password_response = self.client.post(
            f"/api/team/{self.user.id}/password/",
            {"new_password": "NewStrongPass456!"},
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(password_response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertTrue(self.user.check_password("NewStrongPass456!"))
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        DEFAULT_FROM_EMAIL="LEONI IT <no-reply@leoni.local>",
        ACCOUNT_EMAIL_BRAND="LEONI IT",
    )
    def test_admin_can_delete_account_and_email_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/team/{self.user.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.user.id).exists())
        self.assertEqual(len(mail.outbox), 0)


class KpiApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="kpiadmin",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
        )
        self.user = User.objects.create_user(
            username="kpiuser",
            password="StrongPass123!",
        )

    def test_default_kpi_update_persists_after_listing(self):
        self.client.force_authenticate(user=self.admin)

        list_response = self.client.get("/api/kpis/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        kpi_id = list_response.data[0]["id"]

        update_response = self.client.patch(
            f"/api/kpis/{kpi_id}/",
            {
                "name": "Updated KPI Name",
                "owner": "Updated Owner",
            },
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        refreshed_list = self.client.get("/api/kpis/")
        self.assertEqual(refreshed_list.status_code, status.HTTP_200_OK)

        updated_row = next(item for item in refreshed_list.data if item["id"] == kpi_id)
        self.assertEqual(updated_row["name"], "Updated KPI Name")
        self.assertEqual(updated_row["owner"], "Updated Owner")

        stored = KpiDefinition.objects.get(pk=kpi_id)
        self.assertEqual(stored.name, "Updated KPI Name")
        self.assertEqual(stored.owner, "Updated Owner")

    def test_retired_kpi_is_hidden_from_non_admin_until_reactivated(self):
        self.client.force_authenticate(user=self.admin)
        list_response = self.client.get("/api/kpis/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        retired_row = next(item for item in list_response.data if item["status"] == "Retired")
        retired_id = retired_row["id"]

        self.client.force_authenticate(user=self.user)
        non_admin_list = self.client.get("/api/kpis/")
        self.assertEqual(non_admin_list.status_code, status.HTTP_200_OK)
        self.assertFalse(any(item["id"] == retired_id for item in non_admin_list.data))

        non_admin_detail = self.client.get(f"/api/kpis/{retired_id}/")
        self.assertEqual(non_admin_detail.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(user=self.admin)
        admin_detail = self.client.get(f"/api/kpis/{retired_id}/")
        self.assertEqual(admin_detail.status_code, status.HTTP_200_OK)

        reactivate_response = self.client.patch(
            f"/api/kpis/{retired_id}/",
            {"status": "Active"},
            format="json",
        )
        self.assertEqual(reactivate_response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.user)
        reloaded_list = self.client.get("/api/kpis/")
        self.assertEqual(reloaded_list.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == retired_id for item in reloaded_list.data))
