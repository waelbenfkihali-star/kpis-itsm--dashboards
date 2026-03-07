from rest_framework import serializers
from .models import Incident, Request, Change


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = "__all__"


class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = "__all__"


class ChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Change
        fields = "__all__"