from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0018_remove_kpidefinition_dimension"),
    ]

    operations = [
        migrations.AddField(
            model_name="kpidefinition",
            name="dimension",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
