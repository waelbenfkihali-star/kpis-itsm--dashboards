from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("itsm_data", "0012_userprofile_is_archived"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE itsm_data_userprofile
                DROP COLUMN IF EXISTS birth,
                DROP COLUMN IF EXISTS birthdate;
            """,
            reverse_sql="""
                ALTER TABLE itsm_data_userprofile
                ADD COLUMN birth date NULL;
                ALTER TABLE itsm_data_userprofile
                ADD COLUMN birthdate date NULL;
            """,
        ),
    ]
