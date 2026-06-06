# hne serializers mta3 DRF: y7awlou model objects l JSON w yvalidiw data elli de5la men requests
import logging

from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers

from .models import Change, Incident, KpiDefinition, Request, UserProfile


logger = logging.getLogger(__name__)


def send_account_created_email(user, raw_password):
    recipient = str(user.email or "").strip()
    if not recipient:
        return

    brand = settings.ACCOUNT_EMAIL_BRAND
    login_url = settings.APP_LOGIN_URL
    subject = f"{brand} account created"
    text_body = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {brand} account has been created.\n\n"
        f"Username: {user.username}\n"
        f"Password: {raw_password}\n"
        f"Login URL: {login_url}\n\n"
        "Please sign in and change your password as soon as possible.\n\n"
        f"{brand}"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">{brand}</h2>
        <p>Hello {user.get_full_name() or user.username},</p>
        <p>Your account has been created successfully.</p>
        <p><strong>Username:</strong> {user.username}<br />
        <strong>Password:</strong> {raw_password}</p>
        <p><strong>Login URL:</strong> <a href="{login_url}">{login_url}</a></p>
        <p>Please sign in and change your password as soon as possible.</p>
      </body>
    </html>
    """
    

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)

def send_account_updated_email(user, raw_password):
    recipient = str(user.email or "").strip()
    if not recipient:
        return

    brand = settings.ACCOUNT_EMAIL_BRAND
    login_url = settings.APP_LOGIN_URL
    subject = f"{brand} account updated"
    text_body = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {brand} account has been updated.\n\n"
        f"Username: {user.username}\n"
        f"Password: {raw_password}\n"
        f"Login URL: {login_url}\n\n"
        "Please sign in and change your password as soon as possible.\n\n"
        f"{brand}"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">{brand}</h2>
        <p>Hello {user.get_full_name() or user.username},</p>
        <p>Your account has been updated successfully.</p>
        <p><strong>Username:</strong> {user.username}<br />
        <strong>Password:</strong> {raw_password}</p>
        <p><strong>Login URL:</strong> <a href="{login_url}">{login_url}</a></p>
        <p>Please sign in and change your password as soon as possible.</p>
      </body>
    </html>
    """
    

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)


def send_account_deactivated_email(user):
    recipient = str(user.email or "").strip()
    if not recipient:
        return

    brand = settings.ACCOUNT_EMAIL_BRAND
    subject = f"{brand} account deactivated"
    text_body = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {brand} account has been deactivated.\n\n"
        "If you think this is a mistake, please contact your administrator.\n\n"
        f"{brand}"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">{brand}</h2>
        <p>Hello {user.get_full_name() or user.username},</p>
        <p>Your account has been deactivated.</p>
        <p>If you think this is a mistake, please contact your administrator.</p>
      </body>
    </html>
    """

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)


def send_account_deleted_email(user):
    recipient = str(user.email or "").strip()
    if not recipient:
        return

    brand = settings.ACCOUNT_EMAIL_BRAND
    subject = f"{brand} account deleted"
    text_body = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {brand} account has been deleted.\n\n"
        "If you did not expect this action, please contact your administrator.\n\n"
        f"{brand}"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">{brand}</h2>
        <p>Hello {user.get_full_name() or user.username},</p>
        <p>Your account has been deleted.</p>
        <p>If you did not expect this action, please contact your administrator.</p>
      </body>
    </html>
    """

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)

def send_account_deactivated_email(user, raw_password):
    recipient = str(user.email or "").strip()
    if not recipient:
        return

    brand = settings.ACCOUNT_EMAIL_BRAND
    login_url = settings.APP_LOGIN_URL
    subject = f"{brand} account deactivated"
    text_body = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {brand} account has been deactivated.\n\n"
        f"Username: {user.username}\n"
        "your account has been deactivated.\n\n"
        f"{brand}"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">{brand}</h2>
        <p>Hello {user.get_full_name() or user.username},</p>
        <p>Your account has been deactivated successfully.</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p>Your account has been deactivated, you can contact support for more information.</p>
      </body>
    </html>
    """
    

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)    
# hne serializer mta3 Incident: y5ou kol fields mta3 incident kif ma houma
class IncidentSerializer(serializers.ModelSerializer):
    # hne Meta t9oul eli serializer hedhi marbouta b Incident wtraja3 kol fields
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


# hne serializer mta3 KPI definitions: y7adher data lel frontend w yvalidi fields elli l form tab3athhom
class KpiDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = KpiDefinition
        fields = [
            "id",
            "kpi_id",
            "name",
            "owner",
            "module",
            "dimension",
            "target",
            "frequency",
            "unit",
            "formula",
            "source",
            "status",
            "description",
            "is_default",
        ]
        read_only_fields = ["id", "is_default"]

    def validate_kpi_id(self, value):
        kpi_id = value.strip()
        queryset = KpiDefinition.objects.filter(kpi_id__iexact=kpi_id)
        instance = getattr(self, "instance", None)
        if instance is not None:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A KPI with this identifier already exists.")
        return kpi_id

    def validate_name(self, value):
        name = value.strip()
        queryset = KpiDefinition.objects.filter(name__iexact=name, is_deleted=False)
        instance = getattr(self, "instance", None)
        if instance is not None:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A KPI with this name already exists.")
        return name


# hne serializer mta3 user/team member: y7adher data l user b fields zeyda kif access w full_name w avatar
class TeamMemberSerializer(serializers.ModelSerializer):
    access = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    # hne Meta t7aded anou serializer hedhi ta5dem 3la User w traja3 fields elli front yesta7a9hom
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

    # hne n7awlou role mta3 user l text simple: Admin wala User
    def get_access(self, obj):
        return "Admin" if (obj.is_staff or obj.is_superuser) else "User"

    # hne njibou full name ken mawjouda, sinon nraj3ou username bach ma yab9ach feragh
    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    # hne njibou avatar men UserProfile, w ken profile mazel ma t5al9etch n5al9ouha
    def get_avatar(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile.avatar


# hne serializer hedha m5ases l create user jdid men page Team/Form
class TeamMemberCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    access = serializers.ChoiceField(choices=["Admin", "User"])

    # hne nt2kdou elli username mahech deja mawjouda fil database
    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    # hne n5al9ou user jdid w n7addu kenou Admin wala User w ba3d n5al9ou profile mta3ou
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
        try:
            send_account_created_email(user, password)
        except Exception:
            logger.exception("Failed to send account creation email to %s", user.email)
        return user


# hne serializer hedha mta3 update profile mta3 l user elli connecté taw
class CurrentUserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)

    # hne ntha9nou elli username jdida ma tet3arech m3a user e5er
    def validate_username(self, value):
        username = value.strip()
        user = self.context["request"].user
        exists = User.objects.filter(username__iexact=username).exclude(pk=user.pk).exists()
        if exists:
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    # hne nbaddlou ma3loumet l user w ken fama avatar n7afdhouha fil profile
    def update(self, instance, validated_data):
        instance.username = validated_data["username"]
        instance.email = validated_data.get("email", "").strip()
        instance.first_name = validated_data.get("first_name", "").strip()
        instance.last_name = validated_data.get("last_name", "").strip()
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if "avatar" in validated_data:
            profile.avatar = validated_data.get("avatar", "")
        profile.save()
        return instance


# hne serializer hedha mta3 tabdil password, soit l user nasfsou wala admin l user e5er
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

    # hne ntha9nou current password ken l context y9oul elli lazma
    def validate(self, attrs):
        target_user = self.context["target_user"]
        require_current = self.context.get("require_current_password", False)

        if require_current and not target_user.check_password(attrs.get("current_password", "")):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        return attrs

    # hne n7otou password jdida ba3d validation w n7afdhouha fil database
    def save(self, **kwargs):
        user = self.context["target_user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        # Mail on password update/reset is disabled for now.
        # try:
        #     send_account_updated_email(user, self.validated_data["new_password"])
        # except Exception:
        #     logger.exception("Failed to send account update email to %s", user.email)
        return user


# hne serializer hedha mta3 admin ki y7eb ybadel access/email/status mta3 user mo3ayen
class TeamMemberAdminUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    access = serializers.ChoiceField(choices=["Admin", "User"], required=False)
    is_active = serializers.BooleanField(required=False)

    # hne admin ybaddel ken fields elli ba3athhom fil request .
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
        try:
            if not instance.is_active:
                send_account_deactivated_email(instance, "")
        except Exception:
            logger.exception("Failed to send account deactivation email to %s", instance.email)
        return instance
