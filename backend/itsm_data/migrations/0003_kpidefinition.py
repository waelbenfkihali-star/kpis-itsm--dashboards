from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0002_userprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="KpiDefinition",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("kpi_id", models.CharField(max_length=100, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("owner", models.CharField(max_length=255)),
                ("module", models.CharField(max_length=100)),
                ("dimension", models.CharField(blank=True, default="", max_length=255)),
                ("target", models.CharField(blank=True, default="", max_length=255)),
                ("frequency", models.CharField(blank=True, default="", max_length=100)),
                ("unit", models.CharField(blank=True, default="", max_length=100)),
                ("formula", models.TextField(blank=True, default="")),
                ("source", models.CharField(blank=True, default="", max_length=255)),
                ("status", models.CharField(blank=True, default="Active", max_length=100)),
                ("description", models.TextField(blank=True, default="")),
                ("is_default", models.BooleanField(default=False)),
                ("is_deleted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
