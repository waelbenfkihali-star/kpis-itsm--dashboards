from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0008_remove_userprofile_birthdate_and_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="must_change_password",
            field=models.BooleanField(default=False),
        ),
    ]
