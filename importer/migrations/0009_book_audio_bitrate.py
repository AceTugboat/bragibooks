from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('importer', '0008_add_passkey_credential'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='audio_bitrate',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
