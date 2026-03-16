from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Change, Incident, Request, UserProfile


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
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "avatar",
            "is_active",
            "access",
        ]

    def get_access(self, obj):
        return "Admin" if (obj.is_staff or obj.is_superuser) else "User"

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    def get_avatar(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile.avatar


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
        UserProfile.objects.get_or_create(user=user)
        return user


class CurrentUserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        username = value.strip()
        user = self.context["request"].user
        exists = User.objects.filter(username__iexact=username).exclude(pk=user.pk).exists()
        if exists:
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    def update(self, instance, validated_data):
        instance.username = validated_data["username"]
        instance.email = validated_data.get("email", "").strip()
        instance.first_name = validated_data.get("first_name", "").strip()
        instance.last_name = validated_data.get("last_name", "").strip()
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if "avatar" in validated_data:
            profile.avatar = validated_data.get("avatar", "")
            profile.save(update_fields=["avatar"])

        return instance


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        target_user = self.context["target_user"]
        require_current = self.context.get("require_current_password", False)

        if require_current and not target_user.check_password(attrs.get("current_password", "")):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        return attrs

    def save(self, **kwargs):
        user = self.context["target_user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class TeamMemberAdminUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    access = serializers.ChoiceField(choices=["Admin", "User"], required=False)
    is_active = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        if "first_name" in validated_data:
            instance.first_name = validated_data["first_name"].strip()
        if "last_name" in validated_data:
            instance.last_name = validated_data["last_name"].strip()
        if "email" in validated_data:
            instance.email = validated_data["email"].strip()
        if "access" in validated_data:
            is_admin = validated_data["access"] == "Admin"
            instance.is_staff = is_admin
            instance.is_superuser = is_admin
        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
        instance.save()
        return instance
