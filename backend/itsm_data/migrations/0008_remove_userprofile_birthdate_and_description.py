from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0007_userprofile_description"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="birthdate",
        ),
        migrations.RemoveField(
            model_name="userprofile",
            name="description",
        ),
    ]
