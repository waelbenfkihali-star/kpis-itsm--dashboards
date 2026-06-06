from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0009_userprofile_must_change_password"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="must_change_password",
        ),
    ]
