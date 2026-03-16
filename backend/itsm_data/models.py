from django.contrib.auth.models import User
from django.db import models


class Incident(models.Model):
    number = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=50, blank=True, null=True)
    affected_service = models.CharField(max_length=255, blank=True, null=True)
    parent = models.CharField(max_length=255, blank=True, null=True)
    parent_incident = models.CharField(max_length=255, blank=True, null=True)
    service_owner = models.CharField(max_length=255, blank=True, null=True)
    configuration_item = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    opened = models.CharField(max_length=100, blank=True, null=True)
    resolution_code = models.CharField(max_length=255, blank=True, null=True)
    resolution_notes = models.TextField(blank=True, null=True)
    responsible_group = models.CharField(max_length=255, blank=True, null=True)
    responsible_user = models.CharField(max_length=255, blank=True, null=True)
    resolved = models.CharField(max_length=100, blank=True, null=True)
    reopen_count = models.IntegerField(default=0)
    caller = models.CharField(max_length=255, blank=True, null=True)
    aging_group = models.CharField(max_length=100, blank=True, null=True)
    duration = models.FloatField(default=0)
    service_classification = models.CharField(max_length=255, blank=True, null=True)
    business_duration = models.FloatField(default=0)
    problem = models.CharField(max_length=255, blank=True, null=True)
    sla = models.CharField(max_length=255, blank=True, null=True)
    schedule = models.CharField(max_length=255, blank=True, null=True)
    location_division = models.CharField(max_length=255, blank=True, null=True)
    service_request = models.CharField(max_length=255, blank=True, null=True)
    is_major = models.BooleanField(default=False)
    sla_breached = models.BooleanField(default=False)

    def __str__(self):
        return self.number or f"Incident {self.pk}"


class Request(models.Model):
    count = models.IntegerField(default=0)
    number = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    item = models.CharField(max_length=255, blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    affected_service = models.CharField(max_length=255, blank=True, null=True)
    parent = models.CharField(max_length=255, blank=True, null=True)
    service_owner = models.CharField(max_length=255, blank=True, null=True)
    request = models.CharField(max_length=255, blank=True, null=True)
    requested_for = models.CharField(max_length=255, blank=True, null=True)
    opened = models.CharField(max_length=100, blank=True, null=True)
    opened_by = models.CharField(max_length=255, blank=True, null=True)
    responsible_group = models.CharField(max_length=255, blank=True, null=True)
    responsible_user = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    aging_group = models.CharField(max_length=100, blank=True, null=True)
    location_division = models.CharField(max_length=255, blank=True, null=True)
    updated = models.CharField(max_length=100, blank=True, null=True)
    resolve_time = models.CharField(max_length=100, blank=True, null=True)
    service_classification = models.CharField(max_length=255, blank=True, null=True)
    closed = models.CharField(max_length=100, blank=True, null=True)
    closed_by = models.CharField(max_length=255, blank=True, null=True)
    it_service = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.number or f"Request {self.pk}"


class Change(models.Model):
    count = models.IntegerField(default=0)
    number = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=50, blank=True, null=True)
    affected_service = models.CharField(max_length=255, blank=True, null=True)
    parent = models.CharField(max_length=255, blank=True, null=True)
    service_owner = models.CharField(max_length=255, blank=True, null=True)
    configuration_item = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    opened = models.CharField(max_length=100, blank=True, null=True)
    planned_start_date = models.CharField(max_length=100, blank=True, null=True)
    planned_end_date = models.CharField(max_length=100, blank=True, null=True)
    closed = models.CharField(max_length=100, blank=True, null=True)
    responsible_group = models.CharField(max_length=255, blank=True, null=True)
    responsible_user = models.CharField(max_length=255, blank=True, null=True)
    location_division = models.CharField(max_length=255, blank=True, null=True)
    service_classification = models.CharField(max_length=255, blank=True, null=True)
    risk = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    close_code = models.CharField(max_length=255, blank=True, null=True)
    close_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.number or f"Change {self.pk}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Profile for {self.user.username}"
