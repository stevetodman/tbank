# TBank: Congenital Heart Disease QBank

This repository is a lightweight, student-facing question bank designed for second-year medical students preparing for the USMLE Step 1 exam. All content currently focuses on congenital heart disease foundations and integrates physiology, embryology, imaging, and management pearls.

## How to Use

- Start with the human-readable workbooks:
  - [Part 1 workbook](question_banks/congenital_heart_disease_part1.md): Tetralogy of Fallot and foundational shunt lesions.
  - [Part 2 workbook](question_banks/congenital_heart_disease_part2.md): PDA/TGA management pearls and high-yield chromosomal syndromes.
  - [Part 3 workbook](question_banks/congenital_heart_disease_part3.md): Syndromic lesions, catheterization clues, and ductal-dependent physiology.
- If you prefer structured data for Anki, flashcard platforms, or custom tooling, the exact same questions are mirrored in the JSON exports:
  - [Part 1 dataset](question_banks/congenital_heart_disease_part1.json)
  - [Part 2 dataset](question_banks/congenital_heart_disease_part2.json)
  - [Part 3 dataset](question_banks/congenital_heart_disease_part3.json)
- Clone or fork this repository to track your progress, annotate explanations, or contribute future congenital heart disease parts.

## GitHub Pages site

This repository includes a static site (served from the `docs/` directory) that publishes a landing page, interactive question browser, and direct download links.

### Preview locally

1. Sync the latest question bank files into the site assets:
   ```bash
   python3 scripts/sync_question_banks.py
   ```
2. Serve the site with any static file server, for example:
   ```bash
   python3 -m http.server 8000 --directory docs
   ```
3. Open <http://localhost:8000> to browse the landing page or navigate to `/questions/` for the interactive player.

### Publish to GitHub Pages

1. Commit the contents of `docs/` (and re-run the sync script whenever `question_banks/` changes).
2. In the repository settings on GitHub, enable **Pages** and set the source to **Deploy from a branch** → `main` (or your default branch) → `/docs` folder.
3. GitHub will build and host the site automatically at `https://<your-username>.github.io/<repository-name>/`.

Contributors should always re-run `python3 scripts/sync_question_banks.py` before opening a pull request so that the published downloads stay current with the source content.

## Roadmap

- Part 1 (available): Tetralogy of Fallot and shunt lesions fundamentals.
- Part 2 (available): PDA pharmacology, ductal-dependent mixing strategies, and congenital genetic syndromes.
- Part 3 (available): Williams syndrome, DiGeorge, hemodynamics maneuvers, and ductal-dependent emergencies.
- Planned expansions: neonatal cyanosis differentials, congenital heart disease imaging interpretation, and surgical management timelines.

Contributions that keep the bank student-friendly—clear vignettes, concise rationales, and board-style formatting—are welcome.
