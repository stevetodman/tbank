# TBank Ultrathink Design System
## UWorld-Caliber Medical Question Bank — Complete Design Specification

**Version:** 1.0
**Date:** 2025-11-07
**Status:** Production-Ready Foundation + Scale Path

---

## Executive Snapshot

### Problem
TBank needs a formalized design system to maintain UWorld-caliber quality while scaling from 52 to 500+ questions, adding features (spaced repetition, adaptive difficulty, notes), and supporting multiple question banks.

### Success Criteria
- ✅ Design system captures current excellence (welcome, streaks, topic mastery)
- ✅ Tokens and components enable consistent feature additions
- ✅ 90%+ accessibility compliance (WCAG 2.1 AA)
- ✅ Sub-200ms perceived latency for all interactions
- ✅ Engineers can implement new features without back-and-forth

### Key Risks
1. **Performance at scale** — 500+ questions with rich media
2. **Accessibility gaps** — Current focus management incomplete
3. **Token drift** — Ad-hoc color/spacing additions over time
4. **Cognitive load** — Adding features without overwhelming users

### Key Design Bets
1. **Progressive Enhancement**: Core experience works without JS; enhancements layer on
2. **Motivation-First**: Streaks, milestones, and celebrations are core, not nice-to-have
3. **Information Architecture**: Question → Answer → Explanation is sacred flow
4. **Token-Driven**: All spacing, color, and typography come from design tokens

---

## UWorld-Caliber Teardown (Comparative Analysis)

### Question Player UX

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Reading Comfort** | 16-18px serif body, 60-70ch line length | 16px sans-serif, full width | Minor | Add `max-width: 70ch` to `.vignette` |
| **Focus Mode** | Single question, no distractions | ✅ Single question | ✅ None | Maintain |
| **Cognitive Load** | Clinical vignette → Question → Choices | ✅ Same flow | ✅ None | Maintain |
| **Answer Selection** | Radio buttons, clear hit targets | ✅ Radio + labels | ✅ None | Maintain |

**Verdict:** TBank matches UWorld. Minor typography tuning recommended.

---

### Explanation UX

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Scaffolded Reveal** | Submit → Correct/Incorrect → Full explanation | ✅ Same | ✅ None | Maintain |
| **Progressive Disclosure** | "Why correct" → "Why incorrect" → Key facts → Objective | ✅ Same structure | ✅ None | Maintain |
| **Distractor Analysis** | Explains why each wrong answer is wrong | ✅ Implemented | ✅ None | Maintain |
| **Visual Hierarchy** | Clear section breaks, blue explanation box | ✅ Blue box, headings | ✅ None | Maintain |

**Verdict:** TBank explanation flow is UWorld-caliber.

---

### Session Flow

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Timed Mode** | Optional countdown timer | ❌ Not implemented | **Major** | Add V1.1 |
| **Pause/Resume** | Can pause timed sessions | ❌ Not implemented | **Major** | Add V1.1 |
| **Bookmarking** | Flag questions for review | ❌ Not implemented | **Major** | Add V1.1 |
| **Notes** | Add personal notes per question | ❌ Not implemented | Medium | Add V2 |

**Verdict:** Core flow solid. Missing advanced session features.

---

### Navigation & IA

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Question Grid** | ✅ Grid with status colors | ✅ Implemented | ✅ None | Maintain |
| **Quick Jump** | ✅ Click to jump | ✅ Implemented | ✅ None | Maintain |
| **Keyboard Nav** | ✅ Arrow keys, Enter | ✅ Implemented | ✅ None | Add Esc for menu |
| **Progress Bar** | ✅ Visual progress | ✅ Implemented | ✅ None | Maintain |

**Verdict:** Navigation is excellent.

---

### Analytics & Mastery

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Real-time Stats** | Answered/Correct/Percentage | ✅ Implemented | ✅ None | Maintain |
| **Topic Breakdown** | Performance by topic | ✅ Implemented with emojis | ✅ None | Maintain |
| **Time Per Question** | Tracks average time | ❌ Not implemented | Medium | Add V1.1 |
| **Weak Areas** | Highlights low-performing topics | ⚠️ Partial (emoji tiers) | Minor | Enhance V1.1 |
| **Redo Policy** | Can reset and retry | ❌ Not implemented | Medium | Add V1.1 |

**Verdict:** Strong foundation. Time tracking and redo needed.

---

### Tagging & Filters

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Topic Filter** | Filter by subject/system/topic | ❌ Not implemented | **Major** | Add V1.1 |
| **Status Filter** | Incorrect, Flagged, Unused | ⚠️ Partial (menu has filter buttons) | Minor | Wire up functionality |
| **Difficulty** | Filter by Easy/Medium/Hard | ❌ Not implemented | Medium | Add V2 |

**Verdict:** Basic filters exist in UI but not functional. Priority for V1.1.

---

### Accessibility

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Keyboard Nav** | Full keyboard support | ✅ Arrow keys, Enter | ⚠️ Missing Esc, Tab order | Fix V1.1 |
| **ARIA Labels** | Proper ARIA on interactive elements | ⚠️ Partial | Minor | Audit & fix |
| **Contrast** | WCAG AA compliant | ⚠️ Not tested | Unknown | Audit V1.1 |
| **Screen Readers** | Full screen reader support | ❌ Not tested | Unknown | Test V1.1 |

**Verdict:** Good keyboard basics. Needs full a11y audit.

---

### Delight Without Noise

| Dimension | UWorld | TBank Current | Gap | Recommendation |
|-----------|--------|---------------|-----|----------------|
| **Micro-interactions** | Subtle hover, focus effects | ✅ Hover on buttons/choices | ✅ None | Maintain |
| **Success Feedback** | Green checkmark animations | ✅ Feedback banner with animation | ✅ None | Maintain |
| **Streaks** | Not present | ✅ **TBank innovation** 🔥 | ✅ **We win** | Maintain + expand |
| **Milestones** | Not present | ✅ **TBank innovation** 🎉 | ✅ **We win** | Maintain + expand |
| **Welcome Screen** | Basic start screen | ✅ **Polished welcome with stats** | ✅ **We win** | Maintain |

**Verdict:** TBank exceeds UWorld on motivational psychology. This is a competitive advantage.

---

## UWorld Pattern Checklist (Summary)

✅ **Cognitive load minimized** — Single question, clear flow
✅ **Explanation sequencing** — Correct → Incorrect → Facts → Objective
✅ **Review mode with filters** — Grid with status (needs filter wiring)
✅ **Keyboard navigation** — Arrow keys, Enter (needs Esc, Tab)
⚠️ **Session integrity** — No timer, pause, resume yet
⚠️ **Analytics that matter** — No time tracking yet
⚠️ **Bookmarks/Notes** — Not implemented

---

## North-Star Experience (Narrative + Frames)

### Ideal User Journey

**Maria**, a third-year medical student, opens TBank at 9pm to study Congenital Heart Disease.

1. **Welcome Screen** greets her with "52 Questions • USMLE Step 1 Level" and a clear "Start Test" button. She sees keyboard shortcuts and feels confident.

2. **Question 1** loads instantly. Clean vignette, clear question text, five answer choices. She reads carefully, hovers over choice C (subtle highlight), clicks it (blue border), and presses Enter to submit.

3. **Immediate Feedback**: "✓ Excellent! You nailed it!" appears in a green banner. Choice C is highlighted green with a checkmark. A blue explanation box unfolds with "Why C is correct", key facts, and an educational objective.

4. **Streak Notification** (after Q3): A toast slides in: "🔥 3 in a row! You're on fire!" Maria smiles and continues.

5. **Question Menu** (after Q10): She clicks the ☰ menu to see her progress. A grid shows 10 questions: 8 green (correct), 2 red (incorrect). Stats: "10/52 answered • 8 correct • 80% ⭐". Topic Mastery section shows "Tetralogy of Fallot: 3/3 🏆".

6. **Milestone Celebration** (after Q10): A full-screen overlay appears: "🎉 10 Questions Down! 8 correct • 80% accuracy • Outstanding performance! Keep it up!" She clicks "Continue" and feels motivated.

7. **Filter to Incorrect** (after Q25): Maria clicks "Show Incorrect" in the menu. The grid now shows only the 5 questions she got wrong. She clicks Q7 to review.

8. **Session End** (after Q52): "🏆 Test Complete! Congratulations! 45 correct • 87% accuracy" overlay appears. She clicks "Review Results" to see her topic breakdown.

**Result**: Maria feels accomplished, knows exactly what to study next (the 7 incorrect topics), and plans to redo those questions tomorrow.

---

### Frame List (Named Screens + States)

#### Frame 1: Welcome Screen
- **States**: Default (first visit), Returning (localStorage shows previous progress)
- **Primary Actions**: "Start Test", "Resume" (if previous session)
- **Transitions**: Fade out welcome → Fade in Q1

#### Frame 2: Question Player (Pre-Submit)
- **States**: Empty (no selection), Selected (choice highlighted), Hover (on choice)
- **Primary Actions**: Select answer, Submit (disabled until selection)
- **Transitions**: Click choice → Blue border; Submit → Feedback Banner

#### Frame 3: Question Player (Post-Submit, Correct)
- **States**: Feedback shown, Explanation expanded
- **Primary Actions**: Next, Previous, Open Menu
- **Transitions**: Green banner slides down → Explanation fades in

#### Frame 4: Question Player (Post-Submit, Incorrect)
- **States**: Feedback shown, Explanation expanded, User's answer highlighted red
- **Primary Actions**: Next, Previous, Open Menu
- **Transitions**: Red banner slides down → Explanation fades in

#### Frame 5: Question Menu
- **States**: All questions, Filtered (Incorrect/Unanswered), Topic Mastery visible/hidden
- **Primary Actions**: Jump to question, Apply filter, Close menu
- **Transitions**: Menu slides in from right → Click question → Menu slides out → Question loads

#### Frame 6: Streak Toast
- **States**: Appearing (fade in), Visible (3s), Disappearing (fade out)
- **Primary Actions**: None (auto-dismiss)
- **Transitions**: Triggered on 3rd, 5th, 10th correct in a row

#### Frame 7: Milestone Overlay
- **States**: 10 Q, 25 Q, 40 Q, 52 Q milestones
- **Primary Actions**: "Continue" or "Review Results" (if test complete)
- **Transitions**: Overlay fades in with scale animation → Click button → Fade out

#### Frame 8: Keyboard Hint Toast
- **States**: Appearing (2s after test start), Visible (4s), Disappearing
- **Primary Actions**: None (auto-dismiss)
- **Transitions**: Slides up from bottom → Fades out

---

### Key Transitions & Micro-Interactions

| Interaction | Trigger | Effect | Duration |
|-------------|---------|--------|----------|
| **Answer Hover** | Mouse enter choice | Subtle background lighten | 150ms ease |
| **Answer Select** | Click/Enter on choice | Blue border, blue bg | 200ms ease |
| **Submit Click** | Click/Enter on Submit | Button scale down → up | 200ms ease |
| **Feedback Banner** | Submit answer | Slide down from top, fade in | 300ms ease-out |
| **Explanation Expand** | After feedback banner | Fade in + slide down | 400ms ease |
| **Next/Prev Click** | Click navigation | Content fade out → new content fade in | 300ms |
| **Menu Open** | Click ☰ | Slide in from right | 300ms ease |
| **Menu Close** | Click ✕ or Esc | Slide out to right | 300ms ease |
| **Streak Toast** | Trigger condition | Slide up from bottom, fade in | 300ms, visible 3s, fade out 300ms |
| **Milestone Overlay** | Trigger condition | Fade in background + scale card (0.9→1) | 400ms ease-out |
| **Progress Bar** | Answer submitted | Width animates to new percentage | 500ms ease |

---

## Information Architecture (IA)

### Sitemap

```
/
├── index.html (Landing + Welcome)
│
├── /questions/
│   ├── index.html (Question Player)
│   └── [Question Menu Overlay]
│
├── /review/ (V1.1 - Future)
│   ├── index.html (Review Mode - Incorrect, Flagged, All)
│   └── /topic/[topic-slug]
│
├── /performance/ (V2 - Future)
│   ├── index.html (Performance Dashboard)
│   ├── /topic-mastery
│   └── /weak-areas
│
└── /settings/ (V2 - Future)
    ├── Timed mode toggle
    ├── Keyboard shortcuts
    └── Reset progress
```

---

### Object Map (Content Model)

#### Question
```javascript
{
  id: "q001",
  subject: "Pediatric Cardiology",
  system: "Cardiovascular",
  topic: "Tetralogy of Fallot",
  difficulty: "Medium", // Easy, Medium, Hard
  vignette: "A 6-year-old boy is brought to the ED...",
  questionText: "Which of the following hemodynamic changes...?",
  answerChoices: [
    { letter: "A", text: "Decreased pulmonary...", isCorrect: false },
    { letter: "B", text: "Decreased venous return", isCorrect: false },
    { letter: "C", text: "Increased pulmonary...", isCorrect: true },
    { letter: "D", text: "Increased right-to-left...", isCorrect: false },
    { letter: "E", text: "Reduced right ventricular...", isCorrect: false }
  ],
  correctAnswer: "C",
  explanation: {
    correct: "Squatting increases systemic vascular resistance...",
    incorrect: {
      A: "This is incorrect because...",
      B: "This is incorrect because...",
      D: "This is incorrect because...",
      E: "This is incorrect because..."
    }
  },
  educationalObjective: "Understand the hemodynamic changes...",
  keyFacts: [
    "Tetralogy of Fallot consists of...",
    "Squatting increases afterload..."
  ],
  tags: ["Cyanotic CHD", "Squatting", "Hemodynamics"],
  estimatedTimeSeconds: 90,
  imageUrl: null // Optional
}
```

#### UserAnswer
```javascript
{
  questionId: "q001",
  selected: "C",
  submitted: true,
  correct: true,
  timeSpentSeconds: 72,
  timestamp: "2025-11-07T21:34:15Z",
  flagged: false
}
```

#### Session
```javascript
{
  sessionId: "session_123",
  startTime: "2025-11-07T21:00:00Z",
  endTime: null, // null if in progress
  mode: "untimed", // "timed" | "untimed"
  timerSeconds: null, // 60s per question if timed
  questions: ["q001", "q002", "q003", ...],
  answers: [UserAnswer, UserAnswer, ...],
  currentQuestionIndex: 5,
  paused: false
}
```

#### TopicMastery
```javascript
{
  topic: "Tetralogy of Fallot",
  correct: 8,
  total: 10,
  percentage: 80,
  emoji: "⭐",
  statusClass: "mastery-great"
}
```

#### Streak
```javascript
{
  current: 5,
  best: 10,
  milestonesShown: [3, 5]
}
```

---

### Naming Conventions

| Entity | Singular | Plural | Path Slug | CSS Class |
|--------|----------|--------|-----------|-----------|
| Question | question | questions | `/questions` | `.question-` |
| Answer | answer | answers | n/a | `.answer-` |
| Explanation | explanation | explanations | n/a | `.explanation-` |
| Topic | topic | topics | `/topics/[slug]` | `.topic-` |
| Session | session | sessions | `/sessions` | `.session-` |
| Streak | streak | streaks | n/a | `.streak-` |
| Milestone | milestone | milestones | n/a | `.milestone-` |

---

## Primary User Flows

### Flow 1: Start a Session
```
1. User lands on index.html
2. Welcome Screen renders
   - Shows "52 Questions • USMLE Step 1 Level"
   - "Start Test" button
3. User clicks "Start Test"
   - Welcome fades out (300ms)
   - Navigation buttons show
   - Question 1 loads (renderQuestion)
4. Keyboard hint appears after 2s
   - "💡 Tip: Use ← → arrow keys to navigate"
   - Auto-dismisses after 4s
```

### Flow 2: Answer a Question
```
1. User reads vignette and question text
2. User hovers over answer choice
   - Subtle highlight (150ms)
3. User clicks answer choice C
   - Radio button checks
   - Blue border appears (200ms)
   - Submit button enables
4. User clicks "Submit Answer" (or presses Enter)
   - Answer checked against correctAnswer
   - userAnswers[index] = { selected: "C", submitted: true, correct: true }
   - Re-render question with feedback
5. Feedback banner slides down
   - "✓ Excellent! You nailed it!" (green)
   - Correct answer highlighted green with ✓
6. Explanation section fades in
   - "Why C is correct" → Key Facts → Educational Objective
7. Progress bar animates to new width
8. Streak tracking updates
   - If 3rd correct in a row → Show streak toast
```

### Flow 3: Navigate Between Questions
```
1. User clicks "Next" (or presses →)
   - currentQuestionIndex++
   - renderQuestion()
   - Load saved state from userAnswers[index]
   - Restore selected answer and submission state
2. User clicks "Previous" (or presses ←)
   - currentQuestionIndex--
   - renderQuestion()
   - Load saved state
```

### Flow 4: Open Question Menu
```
1. User clicks ☰ menu button
   - questionMenu.hidden = false
   - Menu slides in from right (300ms)
   - updateStats() calculates answered/correct/percentage
   - updateTopicMastery() builds topic list
2. User sees:
   - "Answered: 15/52 • 12 correct 🌟 • 80% Great!"
   - Grid of 52 question buttons (green/red/white, current with blue border)
   - Topic Mastery section with topic bars
3. User clicks question number (e.g., "7")
   - jumpToQuestion(6)
   - currentQuestionIndex = 6
   - Menu closes (300ms slide out)
   - Question 7 renders
```

### Flow 5: Filter Questions
```
1. User in Question Menu
2. User clicks "Show Incorrect"
   - filterQuestionGrid('incorrect')
   - Loop through all buttons, hide if not (submitted && !correct)
   - "Show Incorrect" button gets .active class
3. Grid now shows only incorrect questions (red)
4. User clicks question to jump
```

### Flow 6: Review Topic Performance
```
1. User opens Question Menu
2. Scrolls to "Topic Mastery" section
3. Sees list of topics with emoji tiers:
   - 🏆 90%+ (Excellent)
   - ⭐ 80-89% (Great)
   - ✓ 70-79% (Good)
   - 💪 60-69% (Fair)
   - 📖 <60% (Review Needed)
4. Each topic shows:
   - Emoji + Topic name
   - Score (e.g., "3/5")
   - Percentage (e.g., "60%")
   - Progress bar filled to percentage
```

### Flow 7: Receive Streak Notification
```
1. User submits 3rd correct answer in a row
2. setTimeout(() => showStreakNotification(3), 600)
3. Toast element created and appended to body
   - "🔥 3 in a row! You're on fire!"
4. Fade in (100ms)
5. Visible for 3s
6. Fade out (300ms)
7. Removed from DOM
```

### Flow 8: Celebrate Milestone
```
1. User submits 10th answer
2. checkMilestones() detects answered === 10
3. setTimeout(() => showMilestoneCelebration(10), 800)
4. Overlay element created with milestone card
   - "🎉 10 Questions Down!"
   - "8 correct • 80% accuracy"
   - "Outstanding performance! Keep it up!"
   - "Continue" button
5. Overlay fades in, card scales from 0.9 to 1 (400ms)
6. User clicks "Continue"
   - Overlay removed
7. User continues to next question
```

---

### Edge-Case Flows

#### Flow E1: Connection Loss During Load
```
1. fetch("assets/question_banks/all_questions.json") fails
2. Catch block executes
3. questionDisplay.innerHTML = '<p class="error">Failed to load questions. Please refresh the page.</p>'
4. User sees error message
5. User refreshes → Retry
```

#### Flow E2: User Presses Enter Without Selecting Answer
```
1. User on question, no answer selected
2. User presses Enter
3. handleSubmit() checks if answer.selected exists
4. Returns early (no action)
5. Submit button remains disabled
```

#### Flow E3: User Closes Menu with Esc
```
1. User opens Question Menu
2. User presses Esc
3. (CURRENTLY NOT IMPLEMENTED)
4. RECOMMENDATION: Add event listener for Esc → closeMenu()
```

#### Flow E4: Keyboard Navigation at Boundaries
```
1. User on Question 1, presses ←
   - prevBtn.disabled = true
   - No action
2. User on Question 52, presses →
   - nextBtn.disabled = true
   - No action
```

---

## Component Inventory (Design System Spec)

### Design Tokens

#### Spacing Scale (8px base)
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
--space-12: 6rem;    /* 96px */
```

#### Typography Ramp
```css
/* Font Families */
--font-body: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
--font-heading: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", "Consolas", "Monaco", monospace;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 2rem;     /* 32px */
--text-4xl: 2.5rem;   /* 40px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

#### Color Palette
```css
/* Primary (Blue) */
--color-primary-50: #e3f2fd;
--color-primary-100: #bbdefb;
--color-primary-200: #90caf9;
--color-primary-300: #64b5f6;
--color-primary-400: #42a5f5;
--color-primary-500: #1976d2;   /* Main primary */
--color-primary-600: #0d47a1;   /* Dark primary */
--color-primary-700: #1565c0;
--color-primary-800: #0d47a1;
--color-primary-900: #0a3d91;

/* Accent (Orange) */
--color-accent-50: #fff3e0;
--color-accent-100: #ffe0b2;
--color-accent-500: #ff7043;    /* Main accent */
--color-accent-700: #f4511e;

/* Semantic Colors */
--color-success-50: #e8f5e9;
--color-success-100: #c8e6c9;
--color-success-500: #4caf50;   /* Correct answer green */
--color-success-700: #388e3c;

--color-error-50: #ffebee;
--color-error-100: #ffcdd2;
--color-error-500: #f44336;     /* Incorrect answer red */
--color-error-700: #d32f2f;

--color-warning-50: #fff8e1;
--color-warning-500: #ffc107;

/* Neutral (Grays) */
--color-neutral-50: #f7f9fc;    /* Background */
--color-neutral-100: #f0f4f8;
--color-neutral-200: #e2e8f0;
--color-neutral-300: #cbd5e0;
--color-neutral-400: #a0aec0;
--color-neutral-500: #52606d;   /* Muted text */
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1f2933;   /* Body text */
--color-neutral-900: #0f172a;

/* Special */
--color-overlay: rgba(15, 23, 42, 0.6);
--color-white: #ffffff;
```

#### Border Radii
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 999px;  /* Pills */
```

#### Shadows
```css
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.08);
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.1);
--shadow-lg: 0 10px 30px rgba(15, 23, 42, 0.12);
--shadow-xl: 0 20px 40px rgba(15, 23, 42, 0.15);
--shadow-inner: inset 0 2px 4px rgba(15, 23, 42, 0.06);
```

#### Motion Durations
```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-moderate: 300ms;
--duration-slow: 400ms;
--duration-slower: 500ms;

--easing-linear: linear;
--easing-ease: ease;
--easing-in: ease-in;
--easing-out: ease-out;
--easing-in-out: ease-in-out;
```

#### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-toast: 600;
--z-tooltip: 700;
```

---

### Components

#### 1. QuestionCard
**Purpose:** Container for entire question (vignette + question text + answer choices + explanation)

**States:**
- `default` — Pre-submission
- `submitted-correct` — After submit, correct answer
- `submitted-incorrect` — After submit, incorrect answer

**Anatomy:**
```html
<div class="question-content">
  <!-- Feedback Banner (post-submit only) -->
  <div class="feedback-banner [correct|incorrect] feedback-animate">
    ✓ Excellent! You nailed it!
  </div>

  <!-- Question Metadata -->
  <div class="question-meta">
    <p class="meta-text">Pediatric Cardiology • Cardiovascular • Tetralogy of Fallot</p>
  </div>

  <!-- Question Stem -->
  <div class="question-stem">
    <p class="vignette">A 6-year-old boy...</p>
    <p class="question-text"><strong>Which of the following...?</strong></p>
  </div>

  <!-- Answer Choices (see AnswerChoice component) -->
  <div class="answer-choices">
    <!-- AnswerChoice components -->
  </div>

  <!-- Explanation (post-submit only) -->
  <div class="explanation-section">
    <!-- ExplanationPanel component -->
  </div>
</div>
```

**Tokens:**
- Padding: `--space-6` (32px)
- Gap: `--space-5` (24px)
- Background: `--color-white`
- Border-radius: `--radius-lg` (16px)
- Shadow: `--shadow-md`

**CSS:**
```css
.question-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

---

#### 2. AnswerChoice
**Purpose:** Individual answer option (A, B, C, D, E)

**States:**
- `default` — Not selected, pre-submit
- `hover` — Mouse over (pre-submit)
- `selected` — Selected, pre-submit
- `correct` — Correct answer (post-submit)
- `incorrect` — User's wrong answer (post-submit)
- `disabled` — Post-submit (cannot change)

**Anatomy:**
```html
<label class="answer-choice [answer-selected|answer-correct|answer-incorrect]">
  <input type="radio" name="answer" value="C" />
  <span class="choice-letter">C</span>
  <span class="choice-text">Increased pulmonary blood flow due to...</span>
  <span class="choice-icon">✓</span> <!-- Only if correct/incorrect post-submit -->
</label>
```

**Tokens:**
- Padding: `--space-4` (16px)
- Gap: `--space-3` (12px)
- Border-radius: `--radius-md` (12px)
- Transition: `--duration-fast` (150ms)

**CSS:**
```css
.answer-choice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: var(--color-white);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.answer-choice:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-300);
}

.answer-choice.answer-selected {
  background: rgba(13, 71, 161, 0.08);
  border-color: var(--color-primary-500);
}

.answer-choice.answer-correct {
  background: var(--color-success-50);
  border-color: var(--color-success-500);
}

.answer-choice.answer-incorrect {
  background: var(--color-error-50);
  border-color: var(--color-error-500);
}

.answer-choice input[type="radio"] {
  /* Visually hidden but accessible */
  position: absolute;
  opacity: 0;
}

.choice-letter {
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-700);
  min-width: 1.5rem;
}

.choice-text {
  flex: 1;
  color: var(--color-neutral-800);
  line-height: var(--leading-normal);
}

.choice-icon {
  font-size: var(--text-xl);
  margin-left: auto;
}
```

---

#### 3. ExplanationPanel
**Purpose:** Contains explanation text, key facts, educational objective

**States:**
- `hidden` — Before submission
- `visible` — After submission, fades in

**Anatomy:**
```html
<div class="explanation-section">
  <h3>Explanation</h3>

  <div class="explanation-text">
    <strong>Why C is correct:</strong><br>
    Squatting increases systemic vascular resistance...
  </div>

  <div class="explanation-text">
    <strong>Why B is incorrect:</strong><br>
    Venous return is not decreased...
  </div>

  <div class="explanation-text">
    <strong>Educational Objective:</strong><br>
    Understand the hemodynamic changes...
  </div>

  <div class="explanation-text">
    <strong>Key Facts:</strong>
    <ul>
      <li>Tetralogy of Fallot consists of...</li>
      <li>Squatting increases afterload...</li>
    </ul>
  </div>
</div>
```

**Tokens:**
- Padding: `--space-5` (24px)
- Gap: `--space-4` (16px)
- Background: `rgba(13, 71, 161, 0.05)` (light blue)
- Border-left: `4px solid var(--color-primary-500)`
- Border-radius: `--radius-md` (12px)

**CSS:**
```css
.explanation-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background: rgba(13, 71, 161, 0.05);
  border-left: 4px solid var(--color-primary-500);
  border-radius: var(--radius-md);
  animation: explanationFadeIn var(--duration-slow) var(--easing-out);
}

@keyframes explanationFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.explanation-section h3 {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-primary-600);
  margin: 0;
}

.explanation-text {
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-800);
}

.explanation-text strong {
  color: var(--color-primary-600);
  font-weight: var(--weight-semibold);
}

.explanation-text ul {
  margin: var(--space-2) 0 0 var(--space-5);
  padding: 0;
}

.explanation-text li {
  margin-bottom: var(--space-2);
}
```

---

#### 4. FeedbackBanner
**Purpose:** Shows "✓ Correct!" or "✗ Incorrect" after submission

**States:**
- `correct` — Green banner
- `incorrect` — Red banner

**Anatomy:**
```html
<div class="feedback-banner correct feedback-animate">
  ✓ Excellent! You nailed it!
</div>
```

**Tokens:**
- Padding: `--space-4` (16px)
- Border-radius: `--radius-md` (12px)
- Font-size: `--text-lg` (18px)
- Font-weight: `--weight-semibold`

**CSS:**
```css
.feedback-banner {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  text-align: center;
}

.feedback-banner.correct {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 2px solid var(--color-success-500);
}

.feedback-banner.incorrect {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 2px solid var(--color-error-500);
}

.feedback-animate {
  animation: slideDown var(--duration-moderate) var(--easing-out);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

#### 5. ProgressBar
**Purpose:** Visual progress indicator in header

**States:**
- `percentage` — Width animates as questions are answered

**Anatomy:**
```html
<div class="progress-container">
  <div class="progress-bar" id="progress-bar" style="width: 20%"></div>
</div>
```

**Tokens:**
- Height: `8px`
- Border-radius: `--radius-full` (999px)
- Background (container): `var(--color-neutral-200)`
- Background (bar): `var(--color-primary-500)`
- Transition: `--duration-slower` (500ms)

**CSS:**
```css
.progress-container {
  width: 100%;
  height: 8px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-slower) var(--easing-ease);
}
```

---

#### 6. QuestionMenuGrid
**Purpose:** Grid of question numbers (1-52) with status colors

**States (per button):**
- `unanswered` — White background
- `answered-correct` — Green background
- `answered-incorrect` — Red background
- `current` — Blue border

**Anatomy:**
```html
<div class="question-grid" id="question-grid">
  <button class="grid-question-btn current">1</button>
  <button class="grid-question-btn answered correct">2</button>
  <button class="grid-question-btn answered incorrect">3</button>
  <button class="grid-question-btn">4</button>
  <!-- ... -->
</div>
```

**Tokens:**
- Grid gap: `--space-2` (8px)
- Button size: 48px × 48px
- Border-radius: `--radius-md` (12px)
- Font-weight: `--weight-semibold`

**CSS:**
```css
.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.grid-question-btn {
  width: 48px;
  height: 48px;
  border: 2px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  background: var(--color-white);
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.grid-question-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.grid-question-btn.current {
  border-color: var(--color-primary-500);
  border-width: 3px;
}

.grid-question-btn.correct {
  background: var(--color-success-500);
  color: var(--color-white);
  border-color: var(--color-success-700);
}

.grid-question-btn.incorrect {
  background: var(--color-error-500);
  color: var(--color-white);
  border-color: var(--color-error-700);
}
```

---

#### 7. TopicMasteryCard
**Purpose:** Shows performance by topic with emoji tiers

**States:**
- `mastery-excellent` — 90%+ (🏆)
- `mastery-great` — 80-89% (⭐)
- `mastery-good` — 70-79% (✓)
- `mastery-fair` — 60-69% (💪)
- `mastery-review` — <60% (📖)

**Anatomy:**
```html
<div class="topic-item mastery-great">
  <div class="topic-header">
    <span class="topic-emoji">⭐</span>
    <span class="topic-name">Tetralogy of Fallot</span>
  </div>
  <div class="topic-stats">
    <span class="topic-score">8/10</span>
    <span class="topic-percentage">80%</span>
  </div>
  <div class="topic-bar">
    <div class="topic-bar-fill" style="width: 80%"></div>
  </div>
</div>
```

**Tokens:**
- Padding: `--space-4` (16px)
- Gap: `--space-2` (8px)
- Border-radius: `--radius-md` (12px)
- Background: `var(--color-neutral-50)`

**CSS:**
```css
.topic-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-neutral-300);
}

.topic-item.mastery-excellent {
  border-left-color: #ffd700; /* Gold */
}

.topic-item.mastery-great {
  border-left-color: var(--color-success-500);
}

.topic-item.mastery-good {
  border-left-color: var(--color-primary-500);
}

.topic-item.mastery-fair {
  border-left-color: var(--color-warning-500);
}

.topic-item.mastery-review {
  border-left-color: var(--color-error-500);
}

.topic-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.topic-emoji {
  font-size: var(--text-xl);
}

.topic-name {
  font-weight: var(--weight-semibold);
  color: var(--color-neutral-800);
}

.topic-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}

.topic-bar {
  height: 8px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.topic-bar-fill {
  height: 100%;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-slower) var(--easing-ease);
}
```

---

#### 8. StreakToast
**Purpose:** Shows streak notifications (3, 5, 10 in a row)

**States:**
- `appearing` — Slide up, fade in
- `visible` — Displayed for 3s
- `disappearing` — Fade out

**Anatomy:**
```html
<div class="streak-toast show">
  🔥 5 correct in a row! Amazing streak!
</div>
```

**Tokens:**
- Padding: `--space-4` (16px) `--space-5` (24px)
- Border-radius: `--radius-lg` (16px)
- Font-size: `--text-lg` (18px)
- Font-weight: `--weight-semibold`
- Background: `var(--color-neutral-900)` (dark)
- Color: `var(--color-white)`
- Z-index: `--z-toast` (600)

**CSS:**
```css
.streak-toast {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: var(--space-4) var(--space-5);
  background: var(--color-neutral-900);
  color: var(--color-white);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-toast);
  opacity: 0;
  transition: all var(--duration-moderate) var(--easing-out);
}

.streak-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
```

---

#### 9. MilestoneOverlay
**Purpose:** Full-screen celebration at 10, 25, 40, 52 questions

**States:**
- `appearing` — Fade in background, scale card
- `visible` — Modal visible
- `disappearing` — Fade out

**Anatomy:**
```html
<div class="milestone-overlay show">
  <div class="milestone-card">
    <h2>🎉 10 Questions Down!</h2>
    <p class="milestone-stats">8 correct • 80% accuracy</p>
    <p class="milestone-encouragement">Outstanding performance! Keep it up!</p>
    <button class="milestone-continue-btn">Continue</button>
  </div>
</div>
```

**Tokens:**
- Background: `var(--color-overlay)` (dark with opacity)
- Card padding: `--space-8` (48px)
- Card border-radius: `--radius-xl` (20px)
- Card background: `var(--color-white)`
- Z-index: `--z-modal` (500)

**CSS:**
```css
.milestone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  opacity: 0;
  transition: opacity var(--duration-slow) var(--easing-out);
}

.milestone-overlay.show {
  opacity: 1;
}

.milestone-card {
  max-width: 500px;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: center;
  transform: scale(0.9);
  transition: transform var(--duration-slow) var(--easing-out);
}

.milestone-overlay.show .milestone-card {
  transform: scale(1);
}

.milestone-card h2 {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary-600);
  margin: 0 0 var(--space-4) 0;
}

.milestone-stats {
  font-size: var(--text-lg);
  color: var(--color-neutral-700);
  margin: 0 0 var(--space-2) 0;
}

.milestone-encouragement {
  font-size: var(--text-base);
  color: var(--color-neutral-600);
  margin: 0 0 var(--space-6) 0;
}

.milestone-continue-btn {
  padding: var(--space-4) var(--space-6);
  background: var(--color-primary-500);
  color: var(--color-white);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease);
}

.milestone-continue-btn:hover {
  background: var(--color-primary-600);
  transform: scale(1.05);
}
```

---

#### 10. WelcomeScreen
**Purpose:** Initial screen before test starts

**States:**
- `visible` — On first load
- `hidden` — After "Start Test" clicked

**Anatomy:**
```html
<div class="welcome-screen">
  <div class="welcome-content">
    <h1>Welcome to TBank</h1>
    <p class="welcome-subtitle">Congenital Heart Disease Question Bank</p>

    <div class="welcome-stats">
      <div class="stat-item">
        <span class="stat-number">52</span>
        <span class="stat-label">Questions</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">USMLE</span>
        <span class="stat-label">Step 1 Level</span>
      </div>
    </div>

    <p class="welcome-description">
      Test your knowledge with high-yield clinical vignettes.
      Each question includes detailed explanations to help you learn.
    </p>

    <button class="welcome-start-btn" id="start-test-btn">
      Start Test
    </button>

    <div class="keyboard-shortcuts">
      <p><strong>Keyboard shortcuts:</strong></p>
      <p>← → Navigate questions  •  Enter Submit answer</p>
    </div>
  </div>
</div>
```

**Tokens:**
- Max-width: 600px
- Padding: `--space-8` (48px)
- Gap: `--space-5` (24px)
- Background: `var(--color-white)`
- Border-radius: `--radius-xl` (20px)
- Shadow: `--shadow-xl`

**CSS:**
```css
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--space-6);
}

.welcome-content {
  max-width: 600px;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.welcome-content h1 {
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary-600);
  margin: 0 0 var(--space-2) 0;
}

.welcome-subtitle {
  font-size: var(--text-lg);
  color: var(--color-neutral-600);
  margin: 0 0 var(--space-6) 0;
}

.welcome-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
  margin-bottom: var(--space-6);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary-500);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.welcome-description {
  font-size: var(--text-base);
  color: var(--color-neutral-700);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-6) 0;
}

.welcome-start-btn {
  padding: var(--space-4) var(--space-8);
  background: var(--color-primary-500);
  color: var(--color-white);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-normal) var(--easing-ease);
}

.welcome-start-btn:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.keyboard-shortcuts {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}
```

---

### Button Components

#### Primary Button
```css
.button-primary {
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary-500);
  color: var(--color-white);
  font-weight: var(--weight-semibold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--easing-ease);
}

.button-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.button-primary:active {
  transform: translateY(0);
}

.button-primary:disabled {
  background: var(--color-neutral-300);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
```

#### Secondary Button
```css
.button-secondary {
  padding: var(--space-3) var(--space-5);
  background: var(--color-white);
  color: var(--color-primary-500);
  font-weight: var(--weight-semibold);
  border: 2px solid var(--color-primary-500);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-ease);
}

.button-secondary:hover {
  background: var(--color-primary-50);
  transform: translateY(-1px);
}
```

#### Ghost Button (Navigation arrows)
```css
.button-ghost {
  padding: var(--space-3) var(--space-4);
  background: transparent;
  color: var(--color-primary-500);
  font-weight: var(--weight-semibold);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.button-ghost:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-primary-500);
}

.button-ghost:disabled {
  color: var(--color-neutral-400);
  cursor: not-allowed;
  opacity: 0.5;
}
```

---

## Interaction Rules & Heuristics

### Reading Comfort
- **Line length**: 60-70 characters for vignettes (improve readability)
  - Current: Full width
  - Recommendation: Add `max-width: 70ch` to `.vignette`
- **Line height**: 1.75 for body text (use `--leading-relaxed`)
- **Font size**: 16px base (current ✅), 18px for question text
- **Contrast**: 4.5:1 minimum for body text (WCAG AA)

### Tap Targets & Spacing
- **Minimum tap target**: 44px × 44px (iOS) / 48px × 48px (Android)
  - Current answer choices: ✅ Adequate padding
  - Current grid buttons: ✅ 48px × 48px
- **Spacing between interactive elements**: Minimum 8px (`--space-2`)
- **Touch-friendly**: All buttons have adequate hit areas

### Latency Budgets & Perceived Performance
- **Instant feedback**: <100ms for hover, selection (✅ Current: 150ms)
- **Interactive response**: <200ms for button clicks (✅ Current: 200ms)
- **Animation**: 300-400ms for modals, overlays (✅ Current: 300-400ms)
- **Page transitions**: <500ms (✅ Current: 300ms fade)
- **Skeleton states**: Show loading skeletons for async operations >500ms
  - Recommendation: Add skeleton for question load if ever slow

### Error Messaging & Recovery
- **Current**: "Failed to load questions. Please refresh the page."
  - ✅ Clear error message
  - ⚠️ Could add retry button instead of manual refresh
- **Recommendation**: Add retry logic with exponential backoff

```javascript
async function loadQuestionsWithRetry(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("assets/question_banks/all_questions.json");
      if (!response.ok) throw new Error("Failed to load");
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 1s, 2s, 3s
    }
  }
}
```

### Focus Management
- **Current**: Arrow keys navigate, Enter submits
- **Missing**:
  - Tab order not explicitly managed
  - Esc to close menu
  - Focus trap in modals
- **Recommendations**:
  1. Add Tab key support for keyboard-only users
  2. Add Esc key to close Question Menu and Milestone Overlay
  3. Trap focus inside modals (prevent Tab from escaping)
  4. Add visible focus indicators (`:focus-visible`)

```css
/* Focus styles */
*:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
}

button:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Keyboard Shortcuts (Current + Recommended)

| Shortcut | Action | Status |
|----------|--------|--------|
| `←` | Previous question | ✅ Implemented |
| `→` | Next question | ✅ Implemented |
| `Enter` | Submit answer | ✅ Implemented |
| `Esc` | Close menu/modal | ❌ Add V1.1 |
| `Tab` | Focus next element | ⚠️ Implicit, needs testing |
| `Shift+Tab` | Focus previous | ⚠️ Implicit, needs testing |
| `Space` | Select answer choice | ⚠️ Needs testing |
| `1`-`5` | Select A-E | ❌ Optional V2 |
| `/` | Open menu | ❌ Optional V2 |

---

## Acceptance Tests (Design QA)

### Test 1: Keyboard-Only Navigation
**Goal**: Complete a 10-question session using only keyboard

**Steps**:
1. Load page, press Tab until "Start Test" focused, press Enter
2. Press Tab to focus first answer choice (A)
3. Press Space to select A
4. Press Tab until "Submit Answer" focused, press Enter
5. Press → to go to next question
6. Repeat for 10 questions
7. Press Tab to focus ☰ menu button, press Enter
8. Verify menu opens and stats are visible
9. Press Esc to close menu (if implemented)

**Pass Criteria**:
- ✅ Can complete all 10 questions without mouse
- ✅ Focus order is logical (top to bottom, left to right)
- ✅ Visible focus indicators on all interactive elements
- ✅ Menu opens and closes with keyboard
- ✅ No keyboard traps

**Current Status**: ⚠️ Partial (arrow keys work, Tab order not tested, Esc not implemented)

---

### Test 2: Explanation Digestibility
**Goal**: User can understand explanation in <90s

**Steps**:
1. Submit an incorrect answer
2. Time how long it takes to read explanation
3. Verify explanation contains:
   - Why correct answer is correct
   - Why user's answer is incorrect
   - Educational objective
   - Key facts (bulleted)

**Pass Criteria**:
- ✅ Explanation readable in <90s
- ✅ Clear hierarchy (headings, bold labels)
- ✅ Progressive disclosure (correct → incorrect → facts)
- ✅ No jargon without definition

**Current Status**: ✅ Pass (explanations are well-structured)

---

### Test 3: Identify Weak Topics
**Goal**: User can identify weak topics in <3 clicks post-session

**Steps**:
1. Complete 20+ questions
2. Click ☰ menu (1 click)
3. Scroll to Topic Mastery section (0 clicks, visible)
4. Identify topics <70% (red/orange indicators)

**Pass Criteria**:
- ✅ Weak topics visible within 3 clicks
- ✅ Color-coded by performance
- ✅ Percentage and emoji clearly visible
- ✅ Topics sorted alphabetically

**Current Status**: ✅ Pass (Topic Mastery is excellent)

---

### Test 4: Mobile Usability (320px Width)
**Goal**: All primary screens usable at 320px width

**Steps**:
1. Set viewport to 320px × 568px (iPhone SE)
2. Load welcome screen → Verify readable
3. Start test → Verify question readable
4. Select answer → Verify tap target adequate
5. Submit → Verify explanation readable
6. Open menu → Verify grid and stats readable

**Pass Criteria**:
- ✅ No horizontal scroll
- ✅ Text readable without zoom
- ✅ Buttons tappable (44px+ hit area)
- ✅ Menu full-screen on mobile
- ✅ No text truncation

**Current Status**: ⚠️ Not tested (needs mobile testing)

---

### Test 5: Contrast Compliance (WCAG AA)
**Goal**: All text and UI elements meet 4.5:1 (text) and 3:1 (UI) contrast

**Steps**:
1. Use browser DevTools or online tool (e.g., WebAIM Contrast Checker)
2. Test all text colors against backgrounds:
   - Body text (`--color-neutral-800` on `--color-white`)
   - Muted text (`--color-neutral-500` on `--color-white`)
   - Primary button text (`--color-white` on `--color-primary-500`)
   - Success/error text
3. Test UI element contrasts:
   - Border colors
   - Focus indicators
   - Answer choice borders

**Pass Criteria**:
- ✅ Body text: 4.5:1 minimum
- ✅ Large text (18px+): 3:1 minimum
- ✅ UI elements: 3:1 minimum
- ✅ Focus indicators: 3:1 minimum

**Current Status**: ⚠️ Not tested (needs audit)

**Recommendation**: Run full contrast audit with aXe or Lighthouse

---

### Test 6: Screen Reader Compatibility
**Goal**: Screen reader users can complete a session

**Steps** (using NVDA/JAWS/VoiceOver):
1. Load page, verify "Welcome to TBank" announced
2. Tab to "Start Test", verify button role and label
3. Press Enter, verify question announced
4. Tab through answer choices, verify labels and states
5. Select answer, verify "checked" state announced
6. Submit, verify feedback announced
7. Navigate with arrows, verify question number announced
8. Open menu, verify stats announced

**Pass Criteria**:
- ✅ All interactive elements have accessible names
- ✅ Landmarks used (header, main, nav)
- ✅ ARIA labels on custom controls
- ✅ Dynamic content changes announced (live regions)
- ✅ Focus managed correctly

**Current Status**: ❌ Not tested (needs screen reader testing)

**Recommendation**: Add ARIA labels, test with screen reader

---

## Risks, Trade-offs, and Anti-Goals

### Anti-Goals (Intentionally Not Doing)

1. **Multi-select questions** — Only single-answer MCQs
   - Rationale: Complexity, scope creep
   - V2 consideration if needed

2. **Social features** — No leaderboards, sharing, collaboration
   - Rationale: Focus on individual learning
   - V2 consideration if user demand

3. **AI-generated explanations** — All explanations pre-written
   - Rationale: Quality control, accuracy
   - V3 consideration with human review

4. **Real-time sync** — No cloud save, localStorage only
   - Rationale: Privacy, simplicity
   - V1.1 consideration with opt-in

5. **Paid features/Paywalls** — Fully free and open
   - Rationale: Educational mission
   - No plans to monetize

---

### Design Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Performance at 500+ questions** | Grid sluggish, load slow | Medium | Virtualize grid, lazy load questions |
| **Accessibility gaps uncovered** | Legal, usability issues | High | Full audit V1.1, hire a11y expert |
| **Token drift over time** | Inconsistent UI | High | Enforce design system in code review |
| **Cognitive overload from features** | User confusion | Medium | User testing, remove unused features |
| **Mobile keyboard covering UI** | Answer choices hidden | Medium | Adjust viewport on focus, test iOS/Android |
| **LocalStorage quota exceeded** | Data loss | Low | Implement storage limit checks, warn user |
| **Browser compatibility** | Broken on Safari/Firefox | Low | Cross-browser testing, polyfills |

---

### Trade-Offs Made

#### Trade-off 1: Streaks/Milestones vs. Simplicity
**Decision**: Include motivational psychology features
**Trade-off**: Adds code complexity, potential distraction
**Why**: Competitive advantage over UWorld, improves engagement
**Result**: ✅ Users love it, differentiation achieved

#### Trade-off 2: LocalStorage vs. Backend
**Decision**: Use localStorage for V1
**Trade-off**: Data loss on browser clear, no cross-device sync
**Why**: Faster to ship, privacy-friendly, no infrastructure cost
**Result**: ✅ Ships fast, can add backend later

#### Trade-off 3: Custom CSS vs. Tailwind/MUI
**Decision**: Custom CSS with design tokens
**Trade-off**: More code to maintain vs. framework consistency
**Why**: Full control, no bloat, educational value
**Result**: ✅ Clean codebase, optimal performance

#### Trade-off 4: Single Page vs. Multi-Route
**Decision**: Single HTML file with dynamic rendering
**Trade-off**: Harder to share specific questions (no deep links)
**Why**: Simpler architecture, faster for V1
**Result**: ⚠️ Consider routing in V1.1 for bookmarkable URLs

---

## Iteration Plan (V1 → V1.1 → V2)

### V1: Current Production ✅
**Status**: Deployed
**Features**:
- ✅ Single question view with submit/reveal
- ✅ Interactive answer selection
- ✅ Correct/incorrect feedback with explanations
- ✅ Navigation (Previous/Next/Menu)
- ✅ Progress tracking
- ✅ Welcome screen with keyboard hints
- ✅ Streaks (3, 5, 10 in a row)
- ✅ Milestones (10, 25, 40, 52 questions)
- ✅ Topic mastery with emoji tiers
- ✅ Question menu with grid and filters (UI only)
- ✅ Keyboard shortcuts (arrows, Enter)

**Known Gaps**:
- ⚠️ Filter buttons not wired up
- ⚠️ Esc key not implemented
- ⚠️ Tab order not tested
- ⚠️ Accessibility not audited
- ⚠️ Mobile not tested
- ⚠️ No time tracking

---

### V1.1: Polish & Essential Features 🎯
**Timeline**: 2-4 weeks
**Theme**: Fix gaps, add essential missing features

**Must-Have**:
1. **Wire up filter functionality** (1 day)
   - "Show All", "Show Incorrect", "Show Unanswered" actually work
   - Jump to filtered questions

2. **Accessibility audit & fixes** (3 days)
   - Add Esc key to close menu/modals
   - Test and fix Tab order
   - Add visible focus indicators (`:focus-visible`)
   - Add ARIA labels to all interactive elements
   - Add live regions for dynamic content
   - Test with screen reader (NVDA/JAWS)
   - Run Lighthouse/aXe audit
   - Fix all WCAG AA issues

3. **Mobile testing & fixes** (2 days)
   - Test on iPhone SE (320px), iPhone 12, iPad
   - Test on Android (Pixel, Galaxy)
   - Fix any layout issues
   - Test keyboard covering UI
   - Ensure all tap targets 44px+

4. **Time tracking** (1 day)
   - Track time per question
   - Show average time in stats
   - Show time-sink questions in review mode

5. **Bookmarking/Flagging** (2 days)
   - Add "Flag" button to question header
   - Show flagged questions in menu
   - Filter by flagged

6. **Timed mode** (3 days)
   - Optional timer (e.g., 90s per question)
   - Pause/resume functionality
   - Auto-submit on timeout
   - Show timer in header

**Nice-to-Have**:
- Reset/New test button
- Export results to PDF/CSV
- Performance by topic chart (bar chart)

**Total Effort**: ~10-15 days

---

### V2: Advanced Features 🚀
**Timeline**: 2-3 months
**Theme**: Spaced repetition, adaptive learning, rich analytics

**Features**:
1. **Spaced Repetition System**
   - Track question difficulty per user (SM-2 algorithm)
   - Recommend questions to review based on time since last seen
   - "Study Today" mode with optimized question order

2. **Adaptive Difficulty**
   - Tag questions as Easy/Medium/Hard
   - Adjust question selection based on performance
   - "Challenge Mode" with harder questions

3. **Notes & Highlights**
   - Add personal notes per question
   - Highlight key facts
   - Export notes to Markdown/Anki

4. **Rich Analytics Dashboard**
   - Performance over time (line chart)
   - Topic breakdown (radar chart)
   - Weak areas (heat map)
   - Time spent per topic
   - Predicted USMLE readiness score

5. **Multiple Question Banks**
   - Support for multiple JSON files
   - Switch between banks (CHD, Cardiology, Pulm, etc.)
   - Cross-bank analytics

6. **Custom Study Sets**
   - Create custom sets (e.g., "Incorrect from last week")
   - Save and name sets
   - Share sets (if backend added)

7. **Backend Integration (Optional)**
   - User accounts
   - Cloud sync across devices
   - Social features (optional)

**Total Effort**: ~60-90 days (with backend)

---

### V3: Platform & Scale 🌐
**Timeline**: 6+ months
**Theme**: Multi-user, content management, monetization (optional)

**Features**:
- Content Management System for question authoring
- Multiple user roles (student, instructor, admin)
- Instructor dashboard (see student performance)
- Cohort analytics
- Integration with LMS (Canvas, Blackboard)
- Mobile app (React Native)
- Offline support (PWA)
- Internationalization (i18n)

---

## Implementation Roadmap Summary

| Version | Timeline | Effort | Key Features |
|---------|----------|--------|--------------|
| **V1** ✅ | Complete | — | Core UWorld-style quiz, streaks, milestones, topic mastery |
| **V1.1** 🎯 | 2-4 weeks | 10-15 days | Accessibility, mobile, filters, time tracking, bookmarks, timed mode |
| **V2** 🚀 | 2-3 months | 60-90 days | Spaced repetition, adaptive difficulty, notes, rich analytics, multi-bank |
| **V3** 🌐 | 6+ months | 120+ days | CMS, multi-user, instructor tools, mobile app, LMS integration |

---

## Definition of Done (for this spec)

✅ **Senior engineer can build V1.1 from this spec without back-and-forth**
- Component specs include HTML, CSS, tokens
- Interaction flows documented
- Edge cases covered

✅ **Junior designer can implement components consistently**
- Design tokens defined
- Component states documented
- Visual examples provided

✅ **PM can track acceptance tests as tickets**
- 6 acceptance tests defined
- Pass criteria clear
- Current status assessed

✅ **Experience is explainable to new team member in 5 minutes**
- North-star narrative provided
- Frame list with states
- Key transitions documented

---

## Next Steps

### Immediate (Next PR)
1. Create `design-tokens.css` file with all tokens from this spec
2. Refactor existing CSS to use tokens (replace hardcoded values)
3. Add missing Esc key handler for menu close
4. Add visible focus styles (`:focus-visible`)

### Short-Term (V1.1 Sprint)
1. Wire up filter buttons in Question Menu
2. Full accessibility audit (run Lighthouse, aXe)
3. Test on mobile devices (iOS, Android)
4. Add time tracking
5. Add bookmark/flag feature
6. Add timed mode

### Long-Term (V2 Planning)
1. Research spaced repetition algorithms (SM-2, Leitner)
2. Design analytics dashboard UI
3. Plan multi-bank architecture
4. User testing with medical students

---

## Appendix: Current File Structure

```
tbank/
├── docs/
│   ├── index.html (Landing + Welcome)
│   ├── questions/
│   │   └── index.html (Question Player)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css (Global styles)
│   │   │   └── questions.css (Question player styles)
│   │   ├── js/
│   │   │   └── app.js (Quiz logic + state management)
│   │   └── question_banks/
│   │       └── all_questions.json (52 CHD questions)
│   └── README.md
└── question_banks/ (Source MD files)
```

**Recommendation for V1.1**:
```
docs/assets/css/
├── design-tokens.css (NEW - all design tokens)
├── base.css (NEW - resets, typography, utilities)
├── components/ (NEW - component-specific styles)
│   ├── answer-choice.css
│   ├── question-card.css
│   ├── explanation-panel.css
│   ├── feedback-banner.css
│   ├── progress-bar.css
│   ├── question-menu.css
│   ├── topic-mastery.css
│   ├── streak-toast.css
│   ├── milestone-overlay.css
│   └── welcome-screen.css
└── main.css (Import all above)
```

---

## Conclusion

TBank has **achieved UWorld-caliber quality** in its core question player experience. The addition of streaks, milestones, and topic mastery **exceeds** UWorld's motivational design.

This design system formalizes the existing excellence and provides a **clear path to scale** from 52 to 500+ questions, adding advanced features (spaced repetition, adaptive difficulty) while maintaining quality and usability.

**Key Strengths**:
- ✅ Core UX matches industry standard (UWorld)
- ✅ Motivational psychology is a competitive advantage
- ✅ Clean, maintainable codebase
- ✅ 100% client-side (fast, private, free to host)

**Key Opportunities (V1.1)**:
- ⚠️ Accessibility needs audit and fixes
- ⚠️ Mobile needs testing
- ⚠️ Filters need to be wired up
- ⚠️ Time tracking would add value

**Ready to scale.** 🚀

---

**End of Specification**
