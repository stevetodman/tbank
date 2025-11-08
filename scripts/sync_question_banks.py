#!/usr/bin/env python3
"""Sync question bank source files into the GitHub Pages directory.

Copies every Markdown and JSON question bank from the repository-level
``question_banks`` folder into ``docs/assets/question_banks`` so the
static site can serve downloadable files. Also creates a merged
all_questions.json file for the main quiz interface.
"""

from __future__ import annotations

import json
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
  for existing in DEST_DIR.iterdir():
    if existing.is_file() or existing.is_symlink():
      existing.unlink()
    elif existing.is_dir():
      shutil.rmtree(existing)

  # Copy individual question bank files
  for source_path in SOURCE_DIR.rglob("*"):
    relative_path = source_path.relative_to(SOURCE_DIR)
    destination_path = DEST_DIR / relative_path

    if source_path.is_dir():
      destination_path.mkdir(parents=True, exist_ok=True)
      continue

    if source_path.suffix.lower() not in {".json", ".md"}:
      continue

    destination_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_path, destination_path)

  # Create merged all_questions.json for main quiz interface
  create_merged_question_bank()


def create_merged_question_bank() -> None:
  """Merge all individual question JSON files into all_questions.json."""
  all_questions = []
  question_id_counter = 1

  # Find all JSON files in source directory (sorted for consistency)
  json_files = sorted(SOURCE_DIR.glob("*.json"))

  for json_file in json_files:
    try:
      with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

      # Extract questions from each file
      if isinstance(data, dict) and "questionBank" in data:
        questions = data["questionBank"].get("questions", [])

        # Renumber questions sequentially
        for question in questions:
          question["id"] = question_id_counter
          all_questions.append(question)
          question_id_counter += 1

    except (json.JSONDecodeError, KeyError) as e:
      print(f"Warning: Could not parse {json_file.name}: {e}")
      continue

  # Create merged structure
  merged_data = {
    "questionBank": {
      "id": "chd-all",
      "title": "TBank: Congenital Heart Disease",
      "description": "Complete question bank covering congenital heart disease for USMLE Step 1",
      "totalQuestions": len(all_questions),
      "questions": all_questions
    }
  }

  # Write merged file
  output_path = DEST_DIR / "all_questions.json"
  with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(merged_data, f, indent=2, ensure_ascii=False)

  print(f"✓ Created all_questions.json with {len(all_questions)} questions")


if __name__ == "__main__":
  sync_question_banks()
