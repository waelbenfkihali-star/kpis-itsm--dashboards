from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile


class TeamApiTests(APITestCase):
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

    def test_me_returns_authenticated_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "wael")
        self.assertEqual(response.data["access"], "Admin")

    def test_team_list_returns_existing_accounts(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/team/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [row["username"] for row in response.data]
        self.assertIn("wael", usernames)
        self.assertIn("ritha", usernames)

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
