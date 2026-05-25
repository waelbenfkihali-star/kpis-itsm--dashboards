# hne serializers mta3 DRF: y7adhrou data 5arja lel frontend w yet7a99ou men data de5la men requests.
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Change, Incident, Request, UserProfile


# hne class IncidentSerializer: tamthel structure wala behavior fil backend.
class IncidentSerializer(serializers.ModelSerializer):
    # hne class Meta: tamthel structure wala behavior fil backend.
    class Meta:
        model = Incident
        fields = "__all__"


# hne class RequestSerializer: tamthel structure wala behavior fil backend.
class RequestSerializer(serializers.ModelSerializer):
    # hne class Meta: tamthel structure wala behavior fil backend.
    class Meta:
        model = Request
        fields = "__all__"


# hne class ChangeSerializer: tamthel structure wala behavior fil backend.
class ChangeSerializer(serializers.ModelSerializer):
    # hne class Meta: tamthel structure wala behavior fil backend.
    class Meta:
        model = Change
        fields = "__all__"


# hne class TeamMemberSerializer: tamthel structure wala behavior fil backend.
class TeamMemberSerializer(serializers.ModelSerializer):
    access = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    # hne class Meta: tamthel structure wala behavior fil backend.
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

    # hne function get_access: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def get_access(self, obj):
        return "Admin" if (obj.is_staff or obj.is_superuser) else "User"

    # hne function get_full_name: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    # hne function get_avatar: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def get_avatar(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile.avatar


# hne class TeamMemberCreateSerializer: tamthel structure wala behavior fil backend.
class TeamMemberCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    access = serializers.ChoiceField(choices=["Admin", "User"])

    # hne function validate_username: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    # hne function create: t3awen fil logic mta3 backend dakhil hedha l fichier.
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


# hne class CurrentUserUpdateSerializer: tamthel structure wala behavior fil backend.
class CurrentUserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)

    # hne function validate_username: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def validate_username(self, value):
        username = value.strip()
        user = self.context["request"].user
        exists = User.objects.filter(username__iexact=username).exclude(pk=user.pk).exists()
        if exists:
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    # hne function update: tbadel resource mawjouda hasb data l msada9 3liha.
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


# hne class PasswordChangeSerializer: tamthel structure wala behavior fil backend.
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

    # hne function validate: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def validate(self, attrs):
        target_user = self.context["target_user"]
        require_current = self.context.get("require_current_password", False)

        if require_current and not target_user.check_password(attrs.get("current_password", "")):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        return attrs

    # hne function save: t3awen fil logic mta3 backend dakhil hedha l fichier.
    def save(self, **kwargs):
        user = self.context["target_user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


# hne class TeamMemberAdminUpdateSerializer: tamthel structure wala behavior fil backend.
class TeamMemberAdminUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    access = serializers.ChoiceField(choices=["Admin", "User"], required=False)
    is_active = serializers.BooleanField(required=False)

    # hne function update: tbadel resource mawjouda hasb data l msada9 3liha.
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
