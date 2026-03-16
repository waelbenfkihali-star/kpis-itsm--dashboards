from django.contrib.auth.models import User
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


class TeamMemberSerializer(serializers.ModelSerializer):
    access = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_active",
            "access",
        ]

    def get_access(self, obj):
        return "Admin" if (obj.is_staff or obj.is_superuser) else "User"

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username


class TeamMemberCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    access = serializers.ChoiceField(choices=["Admin", "User"])

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    def create(self, validated_data):
        access = validated_data.pop("access")
        password = validated_data.pop("password")
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", "").strip(),
            first_name=validated_data.get("first_name", "").strip(),
            last_name=validated_data.get("last_name", "").strip(),
            is_staff=access == "Admin",
            is_superuser=access == "Admin",
            is_active=True,
        )
        user.set_password(password)
        user.save()
        return user
