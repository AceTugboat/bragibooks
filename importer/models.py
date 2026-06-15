from django.contrib.auth.models import User
from django.db import models
from pathlib import Path


class BookManager(models.Manager):
    def book_asin_validator(self, asin):
        errors = {}

        if len(asin) != 10 and len(asin) != 0:
            errors['invalid_asin'] = f"Invalid ASIN format for {asin}"

        if len(asin) == 0:
            errors['blank_asin'] = "Must fill in all ASIN fields"

        return errors


class SettingManager(models.Manager):
    def file_path_validator(self, path):
        errors = {}

        if not Path(path).is_dir():
            try:
                Path(path).mkdir(parents=True, exist_ok=True)
            except OSError:
                errors['invalid_path'] = (
                    f"Invalid path: {path}"
                )
        return errors


class StatusChoices(models.TextChoices):
    PROCESSING = "Processing"
    DONE = "Done"
    ERROR = "Error"


class Status(models.Model):
    status = models.CharField(max_length=10, choices=StatusChoices.choices)
    message = models.TextField()

    def __str__(self) -> str:
        return self.status


class Book(models.Model):
    title = models.CharField(max_length=255)
    asin = models.CharField(max_length=10)
    short_desc = models.TextField()
    long_desc = models.TextField()
    release_date = models.DateField()
    series = models.CharField(max_length=255, blank=True, default='')
    publisher = models.CharField(max_length=255)
    lang = models.CharField(max_length=25)
    runtime_length_minutes = models.IntegerField()
    format_type = models.CharField(max_length=25)
    converted = models.BooleanField()
    src_path = models.TextField()
    dest_path = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.OneToOneField(Status, on_delete=models.CASCADE)
    cover_image_link = models.URLField()
    objects = BookManager()

    def __str__(self) -> str:
        return f"{self.title}: by {', '.join(str(author) for author in self.authors.all())}"


class Author(models.Model):
    first_name = models.CharField(max_length=45)
    last_name = models.CharField(max_length=45)
    asin = models.CharField(max_length=10, null=True, default='')
    books = models.ManyToManyField(Book, related_name="authors")
    short_desc = models.TextField(blank=True, default='')
    long_desc = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Narrator(models.Model):
    first_name = models.CharField(max_length=45)
    last_name = models.CharField(max_length=45)
    books = models.ManyToManyField(Book, related_name="narrators")
    short_desc = models.TextField(blank=True, default='')
    long_desc = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Setting(models.Model):
    api_url = models.CharField(max_length=255)
    archive_directory = models.CharField(max_length=255, blank=True, default='')
    input_directory = models.CharField(max_length=255)
    num_cpus = models.IntegerField()
    output_directory = models.CharField(max_length=255)
    output_scheme = models.CharField(max_length=255)
    skip_conversion = models.BooleanField(default=False)
    audio_bitrate = models.IntegerField(null=True, blank=True)
    audio_samplerate = models.IntegerField(null=True, blank=True)
    chapter_source = models.CharField(
        max_length=20,
        choices=[('audible', 'Audible'), ('source_file', 'Source File')],
        default='audible',
    )
    ignore_source_tags = models.BooleanField(default=False)
    chapter_name_format = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = SettingManager()

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PasskeyCredential(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passkeys')
    credential_id = models.TextField(unique=True)
    public_key = models.TextField()
    sign_count = models.IntegerField(default=0)
    name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} — {self.name or self.credential_id[:12]}"
