from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile


# hna class TeamApiTests li tdefine model/w service
class TeamApiTests(APITestCase):
        # hna function setUp li tdefine service logic
    def setUp(self):
        self.admin = User.objects.create_user(
            username="wael",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
            first_name="Wael",
            last_name="Ali",
        )
        self.user = User.objects.create_user(
            username="ritha",
            password="StrongPass123!",
            first_name="Ritha",
        )
    # hna function test_me_returns_authenticated_user li tdefine service logic

        # hna function test_me_returns_authenticated_user li tdefine service logic
    def test_me_returns_authenticated_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "wael")
            # hna function test_team_list_returns_existing_accounts li tdefine service logic
        self.assertEqual(response.data["access"], "Admin")
    # hna function test_team_list_returns_existing_accounts li tdefine service logic

    def test_team_list_returns_existing_accounts(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/team/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [row["username"] for row in response.data]
            # hna function test_admin_can_create_admin_account li tdefine service logic
        self.assertIn("wael", usernames)
            # hna function test_admin_can_create_admin_account li tdefine service logic
        self.assertIn("ritha", usernames)
    # hna function test_admin_can_create_admin_account li tdefine service logic

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
            # hna function test_non_admin_cannot_create_account li tdefine service logic
        created = User.objects.get(username="newadmin")
            # hna function test_non_admin_cannot_create_account li tdefine service logic
        self.assertTrue(created.is_staff)
            # hna function test_non_admin_cannot_create_account li tdefine service logic
        self.assertTrue(created.is_superuser)

    def test_non_admin_cannot_create_account(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/team/",
            {
                "username": "blocked",
                "password": "StrongPass123!",
                "access": "User",
            },
                # hna function test_user_can_update_own_profile li tdefine service logic
            format="json",
            # hna function test_user_can_update_own_profile li tdefine service logic
        )
    # hna function test_user_can_update_own_profile li tdefine service logic

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

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

            # hna function test_admin_can_deactivate_and_reset_password li tdefine service logic
        self.assertEqual(response.status_code, status.HTTP_200_OK)
            # hna function test_admin_can_deactivate_and_reset_password li tdefine service logic
        self.user.refresh_from_db()
            # hna function test_admin_can_deactivate_and_reset_password li tdefine service logic
        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(self.user.username, "ritha.updated")
        self.assertEqual(profile.avatar, "data:image/png;base64,abc123")

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
