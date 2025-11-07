# UWorld-Style Question Bank Evaluation & Redesign Plan

## Current Critical Flaws

### 1. ❌ Shows All Questions at Once
**Problem:** Overwhelming, no focus, defeats the purpose of testing
**UWorld Standard:** One question at a time, full screen focus

### 2. ❌ Correct Answer Pre-Marked
**Problem:** The correct answer is highlighted in blue BEFORE the user answers
- Line in current code: `if (choice.isCorrect) { item.classList.add("answer-correct"); }`
- This defeats the entire purpose of a question bank
- User sees the answer without thinking

### 3. ❌ No Interactive Answer Selection
**Problem:** No way to select an answer
**UWorld Standard:** Click to select, visual feedback, submit to reveal

### 4. ❌ "Show Explanation" Button
**Problem:** User can peek at explanation without answering
**UWorld Standard:** Must submit answer first, then see comprehensive explanation

### 5. ❌ No Progress Tracking
**Problem:** No sense of completion or progress
**UWorld Standard:** "Question 15 of 52", progress bar, answered/unanswered counts

### 6. ❌ No Performance Feedback
**Problem:** No immediate feedback on correctness
**UWorld Standard:** Green checkmark for correct, red X for incorrect, percentage tracking

---

## UWorld Interface Anatomy (What Makes It Excellent)

### Pre-Answer State
```
┌─────────────────────────────────────────────────────┐
│ TBank                      Question 1 of 52    [≡]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│ A 6-year-old boy is brought to the ED for...        │
│                                                       │
│ Which of the following hemodynamic changes...?       │
│                                                       │
│ ○ A. Decreased pulmonary vascular resistance        │
│ ○ B. Decreased venous return                        │
│ ○ C. Increased pulmonary blood flow due to...       │
│ ○ D. Increased right-to-left shunting...            │
│ ○ E. Reduced right ventricular afterload            │
│                                                       │
│                    [Submit Answer]                    │
│                                                       │
│ [← Previous]                         [Next →]        │
└─────────────────────────────────────────────────────┘
```

### Post-Answer State (Correct)
```
┌─────────────────────────────────────────────────────┐
│ TBank                      Question 1 of 52    [≡]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│ ✓ Correct!                                           │
│                                                       │
│ [Question vignette...]                               │
│                                                       │
│ ○ A. Decreased pulmonary vascular resistance        │
│ ○ B. Decreased venous return                        │
│ ● C. Increased pulmonary blood flow... ✓ (GREEN)    │
│ ○ D. Increased right-to-left shunting...            │
│ ○ E. Reduced right ventricular afterload            │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ EXPLANATION                                      │ │
│ │ Squatting increases systemic vascular...        │ │
│ │                                                  │ │
│ │ Key Facts:                                       │ │
│ │ • Tetralogy of Fallot consists of...            │ │
│ │ • Squatting increases afterload...               │ │
│ │                                                  │ │
│ │ Educational Objective:                           │
│ │ Understand the hemodynamic changes...            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ [← Previous]                         [Next →]        │
└─────────────────────────────────────────────────────┘
```

### Post-Answer State (Incorrect)
```
┌─────────────────────────────────────────────────────┐
│ TBank                      Question 1 of 52    [≡]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│ ✗ Incorrect                                          │
│                                                       │
│ [Question vignette...]                               │
│                                                       │
│ ○ A. Decreased pulmonary vascular resistance        │
│ ● B. Decreased venous return ✗ (RED - Your answer)  │
│ ● C. Increased pulmonary blood flow... ✓ (GREEN)    │
│ ○ D. Increased right-to-left shunting...            │
│ ○ E. Reduced right ventricular afterload            │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ EXPLANATION                                      │ │
│ │ Why C is correct:                                │ │
│ │ Squatting increases systemic vascular...        │ │
│ │                                                  │ │
│ │ Why B is incorrect:                              │ │
│ │ Venous return is not decreased...                │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Required Features (Priority Order)

### Phase 1: Core Functionality (MVP)
1. **Single Question View**
   - Show one question at a time
   - Question number display (e.g., "Question 5 of 52")

2. **Interactive Answer Selection**
   - Radio buttons or clickable options
   - Visual feedback on selection (highlight selected answer)
   - Can change selection before submitting

3. **Submit/Reveal System**
   - "Submit Answer" button (disabled if no answer selected)
   - After submit: Show correct/incorrect feedback
   - After submit: Highlight correct answer (green)
   - After submit: Show user's answer if wrong (red)
   - After submit: Display full explanation

4. **Navigation**
   - "Next" button to advance
   - "Previous" button to go back
   - Preserve answer state when navigating

5. **Answer State Hiding**
   - DO NOT show correct answers until after submission
   - DO NOT pre-mark correct choices
   - Explanation hidden until submission

### Phase 2: Enhanced UX
6. **Progress Tracking**
   - Progress bar or "15 of 52 answered"
   - Visual indicator of answered vs. unanswered questions

7. **Question List/Menu**
   - Grid view showing all question numbers
   - Click to jump to any question
   - Visual status: unanswered, correct, incorrect

8. **Suspend/Flag System**
   - Mark questions for review
   - Filter by flagged questions

### Phase 3: Performance Analytics
9. **Score Tracking**
   - Running percentage (e.g., "12/15 correct - 80%")
   - Performance by topic/system

10. **Reset Functionality**
    - Clear all answers and start over
    - "New test" mode

---

## Specific Code Changes Needed

### HTML Changes
- Remove `question-list` div that shows all questions
- Add single `question-container` div
- Add navigation buttons (Previous/Next)
- Add progress indicator
- Add answer selection radio buttons

### JavaScript Changes
- Track current question index
- Track user answers (array or object)
- Track submission state per question
- Implement answer selection logic
- Implement submit logic
- Implement navigation logic
- Hide correct answers until submission
- Show explanation only after submission

### CSS Changes
- Style for selected answer (before submission)
- Style for correct answer (green, after submission)
- Style for incorrect answer (red, after submission)
- Style for unselected answers (gray/neutral)
- Feedback messages (✓ Correct / ✗ Incorrect)

---

## Key UX Principles to Follow

1. **Focus**: One question at a time, full attention
2. **Feedback**: Immediate, clear, actionable
3. **Progressive Disclosure**: Show information when needed, not all at once
4. **State Management**: Preserve user progress, allow navigation
5. **Visual Hierarchy**: Question → Answers → Explanation (in that order)
6. **Affordances**: Make interactive elements obvious (buttons, radio buttons)
7. **No Cheating**: Can't see answer or explanation before committing to a choice

---

## Implementation Recommendations

### Option A: Full Redesign (Recommended)
- Rebuild JavaScript to implement single-question navigation
- Complete state management for answers
- Full UWorld-style experience
- **Estimated time**: 2-3 hours
- **User experience**: Excellent

### Option B: Quick Fix
- Keep current layout but add answer selection
- Hide correct answers until "Submit" is clicked
- **Estimated time**: 30 minutes
- **User experience**: Better, but not ideal

### Option C: Hybrid
- Single question view
- Simple submit/reveal per question
- Basic navigation
- **Estimated time**: 1 hour
- **User experience**: Good

---

## Recommendation

**Go with Option A (Full Redesign)** because:
- Current interface is fundamentally flawed for testing
- A half-measure won't provide the experience users expect
- UWorld-style interface is industry standard
- The work is worth it for a proper learning tool

The current implementation is more of a "question viewer" than a "question bank".

A real question bank should:
- **Test** the user (not show them answers)
- **Track** performance (know what you got right/wrong)
- **Focus** attention (one question at a time)
- **Provide feedback** (learn from mistakes)

Should I implement the full UWorld-style redesign?
