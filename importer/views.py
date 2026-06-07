# System imports
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# If using docker, default to /input folder, else $USER/input
# This is still used by DirectoryListAPI in api.py
if Path('/downloads').is_dir():
    rootdir = "/downloads"
else:
    rootdir = f"{str(Path.home())}/downloads"
