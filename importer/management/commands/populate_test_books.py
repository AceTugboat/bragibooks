from django.core.management.base import BaseCommand
from importer.models import Book, Author, Narrator, Status
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Populate database with 200 test books for UI testing'

    # Sample data
    FIRST_NAMES = [
        'James', 'Mary', 'Michael', 'Patricia', 'Robert', 'Jennifer', 'John', 'Linda',
        'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
        'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
        'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley'
    ]

    LAST_NAMES = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
        'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen',
        'Young', 'King', 'Wright', 'Scott', 'Adams', 'Baker', 'Nelson', 'Carter'
    ]

    ADJECTIVES = [
        'Lost', 'Hidden', 'Sacred', 'Ancient', 'Forgotten', 'Eternal', 'Silent', 'Broken',
        'Crimson', 'Shadow', 'Golden', 'Dark', 'Midnight', 'Shattered', 'Frozen', 'Burning',
        'Whispered', 'Enchanted', 'Cursed', 'Blessed', 'Haunted', 'Secret', 'Mystic', 'Final'
    ]

    NOUNS = [
        'Kingdom', 'Empire', 'Throne', 'Crown', 'Sword', 'Dragon', 'Phoenix', 'Warrior',
        'Legacy', 'Prophecy', 'Chronicles', 'Journey', 'Quest', 'Destiny', 'Truth', 'Secret',
        'Mystery', 'Legend', 'Tale', 'Story', 'Adventure', 'Covenant', 'Testament', 'Revelation'
    ]

    SERIES_NAMES = [
        'The Chronicles', 'The Saga', 'The Trilogy', 'The Series', 'The Collection',
        'Tales of', 'Legends of', 'Adventures in', None, None, None  # None for standalone books
    ]

    PUBLISHERS = [
        'Penguin Random House', 'HarperCollins', 'Simon & Schuster', 'Macmillan',
        'Hachette', 'Scholastic', 'Wiley', 'Pearson', 'Audible Studios', 'Recorded Books'
    ]

    def generate_title(self):
        """Generate a random book title"""
        pattern = random.choice([
            lambda: f"The {random.choice(self.ADJECTIVES)} {random.choice(self.NOUNS)}",
            lambda: f"{random.choice(self.ADJECTIVES)} {random.choice(self.NOUNS)}",
            lambda: f"The {random.choice(self.NOUNS)} of {random.choice(self.ADJECTIVES)} {random.choice(self.NOUNS)}",
            lambda: f"{random.choice(self.NOUNS)}'s {random.choice(self.ADJECTIVES)} {random.choice(self.NOUNS)}",
        ])
        return pattern()

    def generate_person_name(self):
        """Generate a random person name"""
        return random.choice(self.FIRST_NAMES), random.choice(self.LAST_NAMES)

    def get_or_create_author(self):
        """Get or create a random author"""
        first, last = self.generate_person_name()
        author, _ = Author.objects.get_or_create(
            first_name=first,
            last_name=last,
            defaults={
                'asin': None,
                'short_desc': f'{first} {last} is a prolific author.',
                'long_desc': f'{first} {last} has written numerous bestselling books.',
            }
        )
        return author

    def get_or_create_narrator(self):
        """Get or create a random narrator"""
        first, last = self.generate_person_name()
        narrator, _ = Narrator.objects.get_or_create(
            first_name=first,
            last_name=last,
            defaults={
                'short_desc': f'{first} {last} is an acclaimed narrator.',
                'long_desc': f'{first} {last} has narrated hundreds of audiobooks.',
            }
        )
        return narrator

    def handle(self, *args, **options):
        self.stdout.write('Creating test books...')

        books_created = 0
        base_date = datetime.now() - timedelta(days=365*5)  # 5 years ago

        for i in range(200):
            title = self.generate_title()
            
            # Random series information
            series_prefix = random.choice(self.SERIES_NAMES)
            series_name = f"{series_prefix} {random.choice(self.NOUNS)}" if series_prefix else ""
            series_position = random.randint(1, 10) if series_name else None

            # Random release date within last 5 years
            days_offset = random.randint(0, 365*5)
            release_date = (base_date + timedelta(days=days_offset)).strftime('%Y-%m-%d')

            # Random runtime between 3-20 hours
            runtime = random.randint(180, 1200)

            # Generate ASIN
            asin = f"B{random.randint(100000000, 999999999)}"

            # Create individual Status for this book (OneToOneField requirement)
            book_status = Status.objects.create(
                status='Done',
                message='Successfully imported'
            )

            # Create book
            book = Book.objects.create(
                title=title,
                asin=asin,
                short_desc=f"An exciting {random.choice(['fantasy', 'thriller', 'mystery', 'adventure', 'romance'])} novel.",
                long_desc=f"{title} is a captivating story that will keep you on the edge of your seat. " * 5,
                release_date=release_date,
                series=series_name,
                publisher=random.choice(self.PUBLISHERS),
                lang='English',
                runtime_length_minutes=runtime,
                format_type='audiobook',
                converted=True,
                src_path=f'/input/{title.replace(" ", "_")}.m4b',
                dest_path=f'/output/{title.replace(" ", "_")}.m4b',
                status=book_status,
                cover_image_link=f'https://placehold.co/300x300/2C3E50/FFFFFF?text={title[:20].replace(" ", "+")}',
            )

            # Add 1-3 authors
            num_authors = random.randint(1, 3)
            for _ in range(num_authors):
                author = self.get_or_create_author()
                book.authors.add(author)

            # Add 1-2 narrators
            num_narrators = random.randint(1, 2)
            for _ in range(num_narrators):
                narrator = self.get_or_create_narrator()
                book.narrators.add(narrator)

            books_created += 1

            if (i + 1) % 50 == 0:
                self.stdout.write(f'Created {i + 1} books...')

        self.stdout.write(self.style.SUCCESS(f'Successfully created {books_created} test books!'))
        self.stdout.write(f'Total books in database: {Book.objects.count()}')
        self.stdout.write(f'Total authors: {Author.objects.count()}')
        self.stdout.write(f'Total narrators: {Narrator.objects.count()}')
