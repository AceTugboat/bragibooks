import logging
from dataclasses import dataclass
from pathlib import Path

from m4b_merge import helpers

from importer.models import Book, Setting, StatusChoices
from importer.tasks import m4b_merge_task
from utils.merge import create_book

logger = logging.getLogger(__name__)


@dataclass
class MatchEntry:
    src_path: str
    asin: str


class MatchValidationError(Exception):
    pass


def process_match(entries: list[MatchEntry]) -> list[Book]:
    if not entries:
        raise MatchValidationError("No entries provided")

    existing_settings = Setting.objects.first()
    if not existing_settings:
        raise MatchValidationError(
            "Settings not configured. Please complete setup in Settings."
        )

    created: list[Book] = []

    for entry in entries:
        errors = Book.objects.book_asin_validator(entry.asin)
        if errors:
            raise MatchValidationError(next(iter(errors.values())))

        try:
            helpers.validate_asin(existing_settings.api_url, entry.asin)
        except ValueError:
            raise MatchValidationError(f"Bad ASIN: {entry.asin}")

        original_path = Path(entry.src_path)
        if not helpers.get_directory(original_path):
            logger.warning("No supported files in %s — skipping", original_path)
            continue

        logger.info("Creating book for %s at %s", entry.asin, original_path)
        book = create_book(entry.asin, original_path)
        created.append(book)

        logger.info("Enqueuing merge task for: %s", book)
        m4b_merge_task.enqueue(entry.asin)

    return created
