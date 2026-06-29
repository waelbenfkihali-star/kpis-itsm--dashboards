from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0010_remove_userprofile_must_change_password"),
    ]

    operations = [
        migrations.AddField(
            model_name="incident",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="request",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="change",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
