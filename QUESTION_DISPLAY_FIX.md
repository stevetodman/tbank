# Question Display Fix - Full UWorld Format

## Problem Identified
The questions were not displaying the full clinical vignettes. The code was using OR logic (`||`) which only showed ONE of:
- `vignette` (clinical case description), OR
- `questionText` (the actual question)

## Solution Implemented
Now displays BOTH fields in proper UWorld format:

### Before Fix:
```javascript
html += `<p>${question.questionText || question.vignette || ''}</p>`;
```
Only showed one field, missing the full clinical case.

### After Fix:
```javascript
// Show vignette (clinical case) if present
if (question.vignette) {
  html += `<p class="vignette">${question.vignette}</p>`;
}

// Show question text (the actual question being asked)
if (question.questionText) {
  html += `<p class="question-text"><strong>${question.questionText}</strong></p>`;
}
```

## What You See Now

### Full Question Structure:
```
┌─────────────────────────────────────────────┐
│ Tetralogy of Fallot - Squatting Physiology │  ← Title
│                                             │
│ Physiology • Cardiovascular • ToF          │  ← Metadata
│                                             │
│ A 6-year-old boy is brought to the        │  ← VIGNETTE
│ emergency department for sudden shortness   │    (Clinical case)
│ of breath and bluish discoloration of the  │
│ lips while playing. His symptoms resolve   │
│ when he squats. The parents note that he   │
│ often assumes this posture spontaneously   │
│ during exertion. The child's growth has    │
│ been below the 10th percentile since       │
│ infancy. Physical examination reveals      │
│ central cyanosis, digital clubbing, and a  │
│ harsh systolic murmur at the left upper    │
│ sternal border. Echocardiography shows     │
│ anterior deviation of the infundibular     │
│ septum.                                    │
│                                             │
│ Which of the following hemodynamic changes │  ← QUESTION TEXT
│ best explains why squatting relieves this  │    (Actual question)
│ child's symptoms?                          │
│                                             │
│ ○ A. Decreased pulmonary vascular...       │  ← Answer choices
│ ○ B. Decreased venous return               │
│ ○ C. Increased pulmonary blood flow...     │
│ ○ D. Increased right-to-left shunting...   │
│ ○ E. Reduced right ventricular afterload   │
└─────────────────────────────────────────────┘
```

## Styling Improvements

### Vignette (Clinical Case):
- Regular paragraph style
- 1.8 line height for readability
- Good spacing below (1.5rem)
- Normal font weight

### Question Text:
- **Bold formatting** to stand out
- Slightly larger font (1.05rem)
- Tighter line spacing
- Darker color for emphasis

## UWorld Format Compliance

✅ **Clinical Vignette**: Full patient case description
✅ **Question Stem**: Bold, clear question
✅ **Visual Separation**: Spacing between vignette and question
✅ **Answer Choices**: Clean, selectable options

## JSON Fields Utilized

All relevant fields from your JSON are now displayed:

| Field | Where Displayed | When |
|-------|----------------|------|
| `title` | Question header | Always |
| `subject` | Metadata line | If present |
| `system` | Metadata line | If present |
| `topic` | Metadata line | If present |
| `vignette` | Main clinical case | If present |
| `questionText` | Question stem (bold) | If present |
| `answerChoices[]` | Radio button options | Always |
| `correctAnswer` | After submit | When submitted |
| `explanation.correct` | Explanation section | When submitted |
| `explanation.incorrect` | Explanation section | When submitted & wrong |
| `educationalObjective` | Explanation section | When submitted |
| `keyFacts[]` | Explanation section | When submitted |

## Merge to Deploy

This fix is ready on branch:
`claude/deploy-uworld-interface-011CUtvnddy52E7AvwTFjRHL`

Create PR: https://github.com/stevetodman/tbank/pull/new/claude/deploy-uworld-interface-011CUtvnddy52E7AvwTFjRHL

Once merged and deployed, you'll see the full clinical vignettes + questions in proper UWorld format!
