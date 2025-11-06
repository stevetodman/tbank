#!/usr/bin/env python3
"""Sync question bank source files into the GitHub Pages directory.

Copies every Markdown and JSON question bank from the repository-level
``question_banks`` folder into ``docs/assets/question_banks`` so the
static site can serve downloadable files.
"""

from __future__ import annotations

import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = REPO_ROOT / "question_banks"
DEST_DIR = REPO_ROOT / "docs" / "assets" / "question_banks"


def sync_question_banks() -> None:
  if not SOURCE_DIR.exists():
    raise SystemExit(f"Source directory {SOURCE_DIR} does not exist")

  DEST_DIR.mkdir(parents=True, exist_ok=True)

  # Remove previous files to prevent stale assets
  for existing in DEST_DIR.glob("*"):
    if existing.is_file():
      existing.unlink()

  for path in SOURCE_DIR.glob("*.*"):
    if path.suffix.lower() not in {".json", ".md"}:
      continue
    shutil.copy2(path, DEST_DIR / path.name)


if __name__ == "__main__":
  sync_question_banks()
