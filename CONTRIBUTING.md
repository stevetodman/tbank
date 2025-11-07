# Contributing to TBank

Thanks for helping us expand the congenital heart disease question bank for MS2 students! This guide explains how to craft high-quality, board-style questions that help your classmates prepare for Step 1.

## 🎯 Our Mission

TBank provides **free, high-quality, board-style practice questions** for medical students learning congenital heart disease. Every question should:
- Mirror USMLE Step 1 format and difficulty
- Include detailed explanations that teach concepts
- Focus on high-yield, testable material
- Be clinically realistic and educational

## 🚀 Quick Start

### For Students Adding Questions

1. **Fork this repository** to your GitHub account
2. **Choose a question bank file** in `question_banks/` to add your question(s)
3. **Follow the style guide below** to write your question
4. **Test your changes locally** (see instructions below)
5. **Submit a pull request** with your contribution

### For Reviewers

If you're helping review questions:
- Check clinical accuracy
- Verify explanation quality
- Ensure USMLE-appropriate difficulty
- Confirm board-style formatting

## 📝 Question Style Guide

### Required Components

Every question must include:

#### 1. Clinical Vignette (Board-Style Scenario)
- **Present tense**, concise scenario
- Include only relevant clinical details
- End with a clear question stem
- Avoid extraneous information

**Good Example:**
> A 6-year-old boy is brought to the emergency department for sudden shortness of breath and bluish discoloration of the lips while playing. His symptoms resolve when he squats. Physical examination reveals central cyanosis, digital clubbing, and a harsh systolic murmur at the left upper sternal border.

**Poor Example:**
> A patient has been experiencing symptoms for some time. His mother noticed that he has been having trouble breathing and his lips turn blue. She is very worried. When he sits down in a squatting position, it seems to get better...

#### 2. Question Stem
Use standard USMLE phrasing:
- "Which of the following..."
- "What is the next best step..."
- "Which of the following best explains..."
- "What is the most likely diagnosis..."

#### 3. Answer Choices (A-E)
- **Exactly 5 options** labeled A through E
- **One unambiguous correct answer**
- **Plausible distractors** (wrong, but could sound reasonable)
- Avoid "All of the above" or "None of the above"
- Keep options parallel in structure

#### 4. Detailed Explanation
Must include:
- **Why the correct answer is right** (with mechanism/pathophysiology)
- **Why key distractors are wrong** (explain the misconception)
- **High-yield teaching points** related to the question

#### 5. Educational Objective
One sentence summarizing the key learning point:
> In Tetralogy of Fallot, squatting increases systemic vascular resistance, decreasing the magnitude of right-to-left shunting and improving arterial oxygenation.

#### 6. Rapid Review Pearls
2-4 bullet points of high-yield facts for quick review:
- ToF: PROV (Pulmonary stenosis, RV hypertrophy, Overriding aorta, VSD)
- Squatting ↑ SVR → ↓ R→L shunt → ↑ pulmonary blood flow
- Boot-shaped heart on CXR

### Difficulty Levels

Tag each question with appropriate difficulty:

- **Intermediate (Level 2):** Standard Step 1 knowledge, straightforward application
- **Advanced (Level 3-4):** Complex integration, second-order thinking
- **Very Advanced (Level 5):** Rare presentations, nuanced differentials

### Metadata Requirements

Include these fields for each question:
- **Subject:** Physiology, Pathology, Pharmacology, etc.
- **System:** Cardiovascular
- **Topic:** Specific lesion (e.g., "Tetralogy of Fallot")
- **Subtopic:** Specific concept (e.g., "Hemodynamics", "Cyanotic Spells")
- **Difficulty:** 1-5 scale with label
- **Estimated Time:** Typical time to answer (60-120 seconds)
- **Tags:** Keywords for searching

## 📋 Formatting Standards

### Markdown Format

Questions in `.md` files should follow this structure:

```markdown
## Question [Number]: [Title]

**Difficulty:** [Level] | **Topic:** [Topic] | **Subtopic:** [Subtopic]

### Vignette

[Clinical scenario paragraph]

[Question stem]

**A.** [Choice A]
**B.** [Choice B]
**C.** [Choice C]
**D.** [Choice D]
**E.** [Choice E]

### Answer

**Correct Answer: [Letter]**

[Detailed explanation paragraph]

**Why incorrect answers are wrong:**
- **A:** [Explanation]
- **B:** [Explanation]
- **D:** [Explanation]
- **E:** [Explanation]

### Educational Objective

[One-sentence learning point]

### Rapid Review

- [High-yield fact 1]
- [High-yield fact 2]
- [High-yield fact 3]
```

### JSON Format

Questions in `.json` files must match this schema:

```json
{
  "id": 1,
  "title": "Question Title",
  "subject": "Physiology",
  "system": "Cardiovascular",
  "topic": "Tetralogy of Fallot",
  "subtopic": "Hemodynamics",
  "difficulty": 2,
  "difficultyLabel": "Medium",
  "estimatedTimeSeconds": 90,
  "vignette": "Clinical scenario...",
  "questionText": "Which of the following...",
  "answerChoices": [
    {"letter": "A", "text": "Option A", "isCorrect": false},
    {"letter": "B", "text": "Option B", "isCorrect": false},
    {"letter": "C", "text": "Option C", "isCorrect": true},
    {"letter": "D", "text": "Option D", "isCorrect": false},
    {"letter": "E", "text": "Option E", "isCorrect": false}
  ],
  "correctAnswer": "C",
  "explanation": {
    "correct": "Explanation of correct answer...",
    "incorrect": {
      "A": "Why A is wrong...",
      "B": "Why B is wrong...",
      "D": "Why D is wrong...",
      "E": "Why E is wrong..."
    }
  },
  "educationalObjective": "Key learning point...",
  "keyFacts": [
    "High-yield fact 1",
    "High-yield fact 2"
  ],
  "tags": ["tag1", "tag2"]
}
```

## 🧪 Testing Your Contributions

Before submitting, test your questions locally:

```bash
# 1. Sync your new questions to the site
python3 scripts/sync_question_banks.py

# 2. Start a local server
python3 -m http.server 8000 --directory docs

# 3. Visit http://localhost:8000 in your browser

# 4. Navigate to the interactive quiz and test your questions
```

**Check for:**
- ✅ Questions display correctly
- ✅ Answer choices render properly
- ✅ Explanations are readable and clear
- ✅ No formatting errors or broken text
- ✅ Search and filter work with your questions

## 📤 Submitting Your Contribution

### Before You Submit

- [ ] Question follows board-style format
- [ ] Explanation is clear and educational
- [ ] All required fields are complete
- [ ] Tested locally and displays correctly
- [ ] JSON is valid (use a JSON validator)
- [ ] Markdown is properly formatted
- [ ] Ran sync script: `python3 scripts/sync_question_banks.py`
- [ ] Committed synced files in `docs/assets/question_banks/`

### Pull Request Process

1. **Create a descriptive PR title:**
   - "Add 3 questions on VSD physiology"
   - "Add question on Turner syndrome and coarctation"

2. **Describe your contribution:**
   ```
   ## Summary
   Added [number] questions covering [topic]

   ## Question Topics
   - Question 1: [Title] (Difficulty: [Level])
   - Question 2: [Title] (Difficulty: [Level])

   ## Checklist
   - [x] Questions follow style guide
   - [x] Explanations are educational
   - [x] Tested locally
   - [x] Sync script run
   ```

3. **Wait for review:** A maintainer will review for:
   - Clinical accuracy
   - Educational value
   - Formatting compliance
   - Appropriate difficulty

4. **Address feedback:** Respond to any requested changes

5. **Merge:** Once approved, your questions will be added!

## 🔍 Review Process

### Initial Triage
Maintainer confirms:
- Question aligns with scope (congenital heart disease)
- Follows formatting standards
- Contains all required components

### Clinical Review
Subject matter reviewers verify:
- Clinical accuracy (diagnosis, management, pathophysiology)
- Age-appropriate presentation
- USMLE-relevant content
- Appropriate difficulty level

### Editorial Pass
Final check for:
- Grammar and spelling
- Clarity of explanation
- Consistency with existing questions
- Proper JSON/Markdown formatting

### Feedback Loop
- Reviewers may request revisions
- Please respond within 1 week if possible
- Maintainers will work with you to polish your contribution

## 💡 Tips for Great Questions

### Do:
✅ Focus on high-yield, testable concepts
✅ Use realistic clinical scenarios
✅ Include pathophysiology in explanations
✅ Teach through the rationales
✅ Reference primary sources when helpful
✅ Make distractors plausible but clearly wrong

### Don't:
❌ Copy questions from copyrighted sources
❌ Include obscure or low-yield trivia
❌ Write vague or ambiguous stems
❌ Create "trick" questions with unclear answers
❌ Use overly complex medical jargon unnecessarily
❌ Include identifying patient information

## 📚 Resources

### Writing Board-Style Questions
- NBME Item Writing Guide
- USMLE Content Outline
- First Aid for the USMLE Step 1

### Congenital Heart Disease References
- *Nelson Textbook of Pediatrics* (latest edition)
- *Pediatric Cardiology* by Myung K. Park
- UpToDate articles on congenital heart disease
- ACC/AHA Guidelines

## 🤝 Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Credit sources appropriately
- No plagiarism or copyright violation
- Keep the focus on educational quality

## 🆘 Need Help?

- **Questions about style?** See examples in existing question banks
- **Technical issues?** Open an issue on GitHub
- **Want to discuss a question idea?** Start a discussion or draft PR

---

**Thank you for contributing to TBank!** Your questions help fellow medical students succeed on Step 1 and build a strong foundation in congenital heart disease. 🎓

Every contribution makes a difference. Let's build something great together!
