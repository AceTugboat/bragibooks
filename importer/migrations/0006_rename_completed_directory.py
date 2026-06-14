from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('importer', '0005_cover_image_link'),
    ]

    operations = [
        migrations.RenameField(
            model_name='setting',
            old_name='completed_directory',
            new_name='archive_directory',
        ),
        migrations.AlterField(
            model_name='setting',
            name='archive_directory',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
