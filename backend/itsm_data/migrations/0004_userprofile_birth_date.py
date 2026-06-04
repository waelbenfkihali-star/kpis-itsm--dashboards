from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0003_kpidefinition"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="birth_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
