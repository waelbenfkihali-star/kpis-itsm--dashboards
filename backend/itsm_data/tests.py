from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


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
