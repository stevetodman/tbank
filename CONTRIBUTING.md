# Contributing to TBank

Thanks for helping us expand the congenital heart disease question bank! These guidelines explain how to craft new questions and how we review submissions.

## Getting Started

1. Fork the repository and create a feature branch for your changes.
2. If you are adding or updating question content, work in the appropriate file inside [`question_banks/`](question_banks/).
3. Follow the style conventions below to keep the bank student-friendly and consistent.

## Style Conventions for New Questions

- **Board-style vignette first.** Open with a concise scenario that highlights the decision-making point. Use present tense and avoid extraneous background details.
- **Clear question stem.** End the vignette with a direct question or request (eg, “Which of the following…” or “What is the next best step…”).
- **Answer choices.** Provide 5 answer options labeled `A.` through `E.` in markdown bullet form. Keep distractors plausible but clearly incorrect with the explanation context.
- **Single best answer.** Each item should have one unambiguous correct choice. Avoid “All of the above” / “None of the above.”
- **High-yield rationale.** Follow the answer key with a short explanation that states why the correct option is right and why the key distractor is wrong. Highlight pathophysiology or management pearls.
- **Citations (optional but encouraged).** Reference primary sources or review articles where appropriate using inline parentheses (eg, `(*Nelson Textbook of Pediatrics*, 22e)`).
- **Difficulty tags.** Add a difficulty label (`Easy`, `Moderate`, or `Advanced`) in square brackets at the start of each question to help learners scaffold practice.
- **Consistency with existing formats.** Match the surrounding tone, markdown structure, and spacing to the existing questions in the same file.

## Submitting Changes

1. Run any relevant formatting or validation scripts you introduce. (Documentation-only changes typically do not need test runs.)
2. Update the README or supporting docs if your change introduces new workflows or datasets.
3. Commit your work with a clear message describing the change.
4. Open a pull request that summarizes the updates and references any related issues.

## Review Process

- **Initial triage.** A maintainer will confirm that the submission aligns with scope (congenital heart disease education) and follows the style conventions above.
- **Content review.** Subject matter reviewers verify clinical accuracy, educational value, and ensure the difficulty tag is appropriate.
- **Editorial pass.** We proofread for grammar, clarity, and consistent formatting.
- **Feedback loop.** Reviewers may request revisions; please respond within a week if possible so we can keep the content fresh.
- **Approval & merge.** Once all comments are resolved and checks pass, a maintainer will merge the PR. Contributions are released under the project license.

We appreciate your help in keeping TBank accurate, concise, and learner-friendly!
