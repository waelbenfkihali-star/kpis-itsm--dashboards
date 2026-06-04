from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("itsm_data", "0004_userprofile_birth_date"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="birth_date",
        ),
    ]
