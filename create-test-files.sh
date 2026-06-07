#!/bin/bash

# Create test directory structure for audiobook file explorer
BASE_DIR="input/test-data"

# Clean up existing test data
rm -rf "$BASE_DIR"
mkdir -p "$BASE_DIR"

echo "Creating test audiobook directory structure..."

# Create single audiobooks
mkdir -p "$BASE_DIR/The Hobbit - J.R.R. Tolkien"
touch "$BASE_DIR/The Hobbit - J.R.R. Tolkien/chapter01.m4a"
touch "$BASE_DIR/The Hobbit - J.R.R. Tolkien/chapter02.m4a"
touch "$BASE_DIR/The Hobbit - J.R.R. Tolkien/chapter03.m4a"
touch "$BASE_DIR/The Hobbit - J.R.R. Tolkien/cover.jpg"

mkdir -p "$BASE_DIR/1984 - George Orwell"
touch "$BASE_DIR/1984 - George Orwell/1984-part1.mp3"
touch "$BASE_DIR/1984 - George Orwell/1984-part2.mp3"
touch "$BASE_DIR/1984 - George Orwell/1984-part3.mp3"

# Create nested series structure
mkdir -p "$BASE_DIR/Series/Harry Potter/Book 1 - Philosophers Stone"
touch "$BASE_DIR/Series/Harry Potter/Book 1 - Philosophers Stone/hp1-ch01.m4b"
touch "$BASE_DIR/Series/Harry Potter/Book 1 - Philosophers Stone/hp1-ch02.m4b"
touch "$BASE_DIR/Series/Harry Potter/Book 1 - Philosophers Stone/cover.jpg"

mkdir -p "$BASE_DIR/Series/Harry Potter/Book 2 - Chamber of Secrets"
touch "$BASE_DIR/Series/Harry Potter/Book 2 - Chamber of Secrets/hp2-complete.m4b"

mkdir -p "$BASE_DIR/Series/The Expanse/Book 1 - Leviathan Wakes"
touch "$BASE_DIR/Series/The Expanse/Book 1 - Leviathan Wakes/part01.mp3"
touch "$BASE_DIR/Series/The Expanse/Book 1 - Leviathan Wakes/part02.mp3"
touch "$BASE_DIR/Series/The Expanse/Book 1 - Leviathan Wakes/part03.mp3"

mkdir -p "$BASE_DIR/Series/The Expanse/Book 2 - Calibans War"
touch "$BASE_DIR/Series/The Expanse/Book 2 - Calibans War/complete.m4a"

# Create author-organized structure
mkdir -p "$BASE_DIR/By Author/Brandon Sanderson/Mistborn - The Final Empire"
touch "$BASE_DIR/By Author/Brandon Sanderson/Mistborn - The Final Empire/mistborn1-disc1.mp3"
touch "$BASE_DIR/By Author/Brandon Sanderson/Mistborn - The Final Empire/mistborn1-disc2.mp3"
touch "$BASE_DIR/By Author/Brandon Sanderson/Mistborn - The Final Empire/metadata.json"

mkdir -p "$BASE_DIR/By Author/Brandon Sanderson/The Way of Kings"
touch "$BASE_DIR/By Author/Brandon Sanderson/The Way of Kings/twok-complete.m4b"
touch "$BASE_DIR/By Author/Brandon Sanderson/The Way of Kings/cover.jpg"

mkdir -p "$BASE_DIR/By Author/Neil Gaiman/American Gods"
touch "$BASE_DIR/By Author/Neil Gaiman/American Gods/american-gods-full.m4b"

# Create unsorted/mixed structure
mkdir -p "$BASE_DIR/Unsorted"
touch "$BASE_DIR/Unsorted/random_audiobook_01.mp3"
touch "$BASE_DIR/Unsorted/random_audiobook_02.mp3"
touch "$BASE_DIR/Unsorted/some_podcast.m4a"

mkdir -p "$BASE_DIR/Unsorted/Nested Folder/Deep Nested"
touch "$BASE_DIR/Unsorted/Nested Folder/Deep Nested/deeply-nested-book.m4b"
touch "$BASE_DIR/Unsorted/Nested Folder/another-file.mp3"

# Create some standalone m4b files
touch "$BASE_DIR/Dune - Frank Herbert.m4b"
touch "$BASE_DIR/The Martian - Andy Weir.m4b"
touch "$BASE_DIR/Project Hail Mary - Andy Weir.m4b"

# Create a few more realistic scenarios
mkdir -p "$BASE_DIR/New Arrivals/Ready Player One"
touch "$BASE_DIR/New Arrivals/Ready Player One/ready-player-one.m4b"
touch "$BASE_DIR/New Arrivals/Ready Player One/info.txt"

mkdir -p "$BASE_DIR/Completed"
touch "$BASE_DIR/Completed/.gitkeep"

echo "✓ Test directory structure created successfully!"
echo "Created structure in: $BASE_DIR"
echo ""
echo "Directory tree:"
tree "$BASE_DIR" 2>/dev/null || find "$BASE_DIR" -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
