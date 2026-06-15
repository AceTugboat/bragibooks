from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('importer', '0006_rename_completed_directory'),
    ]

    operations = [
        migrations.AddField(
            model_name='setting',
            name='skip_conversion',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='setting',
            name='audio_bitrate',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='setting',
            name='audio_samplerate',
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='setting',
            name='chapter_source',
            field=models.CharField(
                max_length=20,
                choices=[('audible', 'Audible'), ('source_file', 'Source File')],
                default='audible',
            ),
        ),
        migrations.AddField(
            model_name='setting',
            name='ignore_source_tags',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='setting',
            name='chapter_name_format',
            field=models.CharField(max_length=255, blank=True, default=''),
        ),
    ]
