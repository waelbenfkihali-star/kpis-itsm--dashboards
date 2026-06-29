from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0011_incident_request_change_is_archived"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
