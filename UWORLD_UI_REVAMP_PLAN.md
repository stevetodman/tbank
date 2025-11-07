# TBank → UWorld UI/UX Revamp Plan
## Making TBank Look & Feel Exactly Like UWorld

**Goal**: Transform TBank's visual design to match UWorld's professional medical education aesthetic

---

## 🎨 UWorld Visual Design DNA

### What Makes UWorld's UI Distinctive?

#### 1. **Color Palette** — Professional Medical Education
```
Primary: Deep Navy Blue (#2c5282, #2b6cb0)
Accent: Clean Blue (#3182ce)
Success: Medical Green (#38a169)
Error: Medical Red (#e53e3e)
Background: Soft Gray-White (#f7fafc, #edf2f7)
Text: Dark Gray (#2d3748)
Borders: Light Gray (#e2e8f0, #cbd5e0)
```

#### 2. **Typography** — Readability First
- **Vignettes**: Serif font (Georgia, Charter, or similar) at 17-18px for clinical readability
- **UI Elements**: Sans-serif (System fonts)
- **Line Height**: 1.8 for vignettes, 1.5 for UI
- **Line Length**: 65-75 characters max for vignettes

#### 3. **Layout** — Clean, Spacious, Focused
- Generous white space (24-32px padding)
- Clear visual hierarchy
- Contained width (max 900px for question content)
- Sticky header with subtle shadow
- Clean footer with minimal info

#### 4. **Answer Choices** — Clear, Professional
- Large hit targets (56px+ height)
- Clear letter badges (A, B, C, D, E) with circles
- Hover states with subtle color shift
- Selected: Blue border + light blue background
- Correct: Green border + light green background
- Incorrect: Red border + light red background

#### 5. **Explanation Panel** — Distinct Blue Section
- Light blue background (#ebf8ff, #bee3f8)
- Blue left border (4px solid #3182ce)
- Clear section headers
- Organized with bold labels
- Bullet points for key facts

#### 6. **Header** — Professional, Functional
- Clean white background with bottom shadow
- Question counter (e.g., "Question 5 of 52")
- Timer (if timed mode)
- Lab values button, Calculator, Notes (placeholders for now)
- Menu/Settings button

#### 7. **Shadows & Depth** — Subtle, Professional
- Very subtle shadows (not dramatic)
- `0 1px 3px rgba(0,0,0,0.1)` for cards
- `0 1px 2px rgba(0,0,0,0.05)` for header

---

## 📐 Before & After Comparison

### Current TBank Issues

❌ **Colors too vibrant** — Primary blue (#1976d2) is too bright, accent orange unnecessary
❌ **Typography not optimized** — Sans-serif for vignettes reduces readability
❌ **Spacing inconsistent** — Mix of spacing values
❌ **Answer choices too compact** — Need more padding
❌ **Header too basic** — Missing professional medical education feel
❌ **Explanation panel lacks distinction** — Doesn't stand out enough
❌ **Feedback banner too prominent** — Takes focus away from content

### UWorld-Style Improvements

✅ **Professional color palette** — Navy blues, medical greens/reds, soft grays
✅ **Serif vignettes** — Georgia font at 17px with 1.8 line-height
✅ **Consistent spacing** — 8px system (8, 16, 24, 32, 40)
✅ **Larger answer choices** — 56px+ height, clear letter circles
✅ **Professional header** — Logo, counter, timer, controls
✅ **Distinct explanation** — Light blue panel with clear hierarchy
✅ **Subtle feedback** — Smaller banner or inline status

---

## 🛠 Implementation Plan

### Phase 1: Color System Overhaul (1 hour)

**Replace current colors with UWorld palette:**

```css
/* OLD (Current TBank) */
:root {
  --color-primary: #0d47a1;
  --color-primary-light: #1976d2;
  --color-accent: #ff7043;
  --color-text: #1f2933;
  --color-muted: #52606d;
  --color-background: #f7f9fc;
}

/* NEW (UWorld-inspired) */
:root {
  /* Primary Navy Blues */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #3182ce;  /* Main primary */
  --color-primary-600: #2b6cb0;  /* Darker primary */
  --color-primary-700: #2c5282;  /* Navy */
  --color-primary-800: #1e3a5f;
  --color-primary-900: #1e293b;

  /* Success (Medical Green) */
  --color-success-50: #f0fff4;
  --color-success-100: #c6f6d5;
  --color-success-200: #9ae6b4;
  --color-success-500: #38a169;
  --color-success-600: #2f855a;
  --color-success-700: #276749;

  /* Error (Medical Red) */
  --color-error-50: #fff5f5;
  --color-error-100: #fed7d7;
  --color-error-200: #fc8181;
  --color-error-500: #e53e3e;
  --color-error-600: #c53030;
  --color-error-700: #9b2c2c;

  /* Neutrals (Soft Grays) */
  --color-neutral-50: #f7fafc;
  --color-neutral-100: #edf2f7;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e0;
  --color-neutral-400: #a0aec0;
  --color-neutral-500: #718096;
  --color-neutral-600: #4a5568;
  --color-neutral-700: #2d3748;
  --color-neutral-800: #1a202c;
  --color-neutral-900: #171923;

  /* Semantic */
  --color-background: #f7fafc;
  --color-text: #2d3748;
  --color-text-muted: #718096;
  --color-border: #e2e8f0;
  --color-border-dark: #cbd5e0;
}
```

---

### Phase 2: Typography Overhaul (30 min)

**Add serif font for vignettes, optimize sizing:**

```css
:root {
  /* Fonts */
  --font-vignette: Georgia, "Times New Roman", serif;
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif;
  --font-mono: "SF Mono", Consolas, Monaco, monospace;

  /* Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.0625rem;  /* 17px - vignettes */
  --text-xl: 1.125rem;   /* 18px */
  --text-2xl: 1.25rem;   /* 20px */
  --text-3xl: 1.5rem;    /* 24px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  --leading-vignette: 1.8;  /* Extra spacing for readability */
}

/* Apply to vignettes */
.vignette {
  font-family: var(--font-vignette);
  font-size: var(--text-lg);
  line-height: var(--leading-vignette);
  color: var(--color-text);
  max-width: 70ch;
}

.question-text {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: 600;
  line-height: var(--leading-normal);
  color: var(--color-neutral-800);
}
```

---

### Phase 3: Header Redesign (1 hour)

**Create professional UWorld-style header:**

```html
<!-- NEW Header Structure -->
<header class="site-header">
  <div class="header-container">
    <!-- Left: Logo + Question Counter -->
    <div class="header-left">
      <h1 class="logo">TBank</h1>
      <span class="question-counter" id="question-counter">Question 1 of 52</span>
    </div>

    <!-- Center: Timer (if timed mode) -->
    <div class="header-center">
      <div class="timer" id="timer" hidden>
        <svg class="timer-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
          <path d="M8 3v5l3 3"/>
        </svg>
        <span class="timer-text">1:30</span>
      </div>
    </div>

    <!-- Right: Controls -->
    <div class="header-right">
      <button class="header-btn" id="bookmark-btn" title="Bookmark question">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <button class="header-btn" id="notes-btn" title="Notes (coming soon)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
      <button class="header-btn" id="menu-toggle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Progress Bar (below header) -->
  <div class="progress-container">
    <div class="progress-bar" id="progress-bar" style="width: 0%"></div>
  </div>
</header>
```

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary-700);
  margin: 0;
}

.question-counter {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.timer-icon {
  color: var(--color-neutral-500);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all 150ms ease;
}

.header-btn:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-border);
  color: var(--color-neutral-800);
}

.header-btn:active {
  background: var(--color-neutral-100);
}

.progress-container {
  width: 100%;
  height: 4px;
  background: var(--color-neutral-100);
}

.progress-bar {
  height: 100%;
  background: var(--color-primary-500);
  transition: width 500ms ease;
}
```

---

### Phase 4: Answer Choice Redesign (1 hour)

**Make answer choices look exactly like UWorld:**

```html
<!-- NEW Answer Choice Structure -->
<div class="answer-choices">
  <label class="answer-choice">
    <input type="radio" name="answer" value="A" />
    <span class="choice-indicator">
      <span class="choice-letter">A</span>
    </span>
    <span class="choice-text">Decreased pulmonary vascular resistance</span>
  </label>
  <!-- Repeat for B, C, D, E -->
</div>
```

```css
.answer-choices {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.answer-choice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 56px;
}

.answer-choice:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-border-dark);
}

/* Hide actual radio button */
.answer-choice input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Custom radio indicator */
.choice-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: var(--color-neutral-50);
  border: 2px solid var(--color-border-dark);
  border-radius: 50%;
  transition: all 150ms ease;
}

.choice-letter {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-neutral-700);
}

.choice-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  padding-top: 4px;
}

/* Selected state (before submission) */
.answer-choice:has(input:checked) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.answer-choice:has(input:checked) .choice-indicator {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.answer-choice:has(input:checked) .choice-letter {
  color: #ffffff;
}

/* Correct answer (after submission) */
.answer-choice.answer-correct {
  background: var(--color-success-50);
  border-color: var(--color-success-500);
  border-width: 2px;
}

.answer-choice.answer-correct .choice-indicator {
  background: var(--color-success-500);
  border-color: var(--color-success-500);
}

.answer-choice.answer-correct .choice-letter {
  color: #ffffff;
}

.answer-choice.answer-correct::after {
  content: '✓';
  margin-left: auto;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success-600);
}

/* Incorrect answer (after submission) */
.answer-choice.answer-incorrect {
  background: var(--color-error-50);
  border-color: var(--color-error-500);
  border-width: 2px;
}

.answer-choice.answer-incorrect .choice-indicator {
  background: var(--color-error-500);
  border-color: var(--color-error-500);
}

.answer-choice.answer-incorrect .choice-letter {
  color: #ffffff;
}

.answer-choice.answer-incorrect::after {
  content: '✗';
  margin-left: auto;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-error-600);
}

/* Disabled state (after submission) */
.answer-choice:has(input:disabled) {
  cursor: default;
}
```

---

### Phase 5: Explanation Panel Redesign (45 min)

**Make explanation look like UWorld's distinctive blue panel:**

```css
.explanation-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(to right, #ebf8ff 0%, #f0f9ff 100%);
  border-left: 4px solid var(--color-primary-500);
  border-radius: 8px;
}

.explanation-section h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary-700);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-size: 0.875rem;
}

.explanation-text {
  margin-bottom: 1.25rem;
  line-height: 1.7;
  color: var(--color-text);
}

.explanation-text:last-child {
  margin-bottom: 0;
}

.explanation-text strong {
  font-weight: 600;
  color: var(--color-neutral-800);
}

.explanation-text ul {
  margin: 0.75rem 0 0 1.5rem;
  padding: 0;
}

.explanation-text li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.explanation-text li:last-child {
  margin-bottom: 0;
}

/* Educational objective - distinct style */
.explanation-text:has(strong:contains("Educational Objective")) {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(49, 130, 206, 0.2);
}
```

---

### Phase 6: Feedback Banner Redesign (30 min)

**Make feedback more subtle and professional:**

```css
.feedback-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
}

.feedback-banner.correct {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}

.feedback-banner.correct::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-success-500);
  color: #ffffff;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
}

.feedback-banner.incorrect {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
}

.feedback-banner.incorrect::before {
  content: '✗';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-error-500);
  color: #ffffff;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
}
```

---

### Phase 7: Question Container Layout (30 min)

**Improve overall question layout:**

```css
.question-player {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.question-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.question-meta {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.meta-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.question-stem {
  margin-bottom: 2rem;
}

.vignette {
  font-family: var(--font-vignette);
  font-size: var(--text-lg);
  line-height: var(--leading-vignette);
  color: var(--color-text);
  margin-bottom: 1.5rem;
  max-width: 70ch;
}

.question-text {
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--color-neutral-900);
  margin: 0;
}
```

---

### Phase 8: Navigation Buttons (30 min)

**Professional button styling:**

```css
.question-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #ffffff;
  border: 1px solid var(--color-border-dark);
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 150ms ease;
}

.nav-btn:hover:not(:disabled) {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-400);
  color: var(--color-neutral-900);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: var(--color-primary-500);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 150ms ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-600);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.submit-btn:disabled {
  background: var(--color-neutral-300);
  cursor: not-allowed;
  box-shadow: none;
}
```

---

## 📋 Implementation Checklist

### Week 1: Core Visual Overhaul
- [ ] Replace color system (colors.css)
- [ ] Add serif font for vignettes
- [ ] Redesign header with new structure
- [ ] Implement new answer choice styling
- [ ] Update explanation panel styling
- [ ] Refine feedback banners
- [ ] Update navigation buttons

### Week 2: Polish & Refinement
- [ ] Adjust all spacing to 8px system
- [ ] Update shadows to be more subtle
- [ ] Add bookmark button to header
- [ ] Improve mobile responsiveness
- [ ] Test on multiple browsers
- [ ] Fine-tune colors based on testing

### Week 3: Enhanced Features
- [ ] Add timer UI (even if not functional yet)
- [ ] Improve question menu styling
- [ ] Add subtle animations
- [ ] Update welcome screen to match
- [ ] Polish milestone overlays

---

## 🎯 Success Criteria

### Visual Comparison
- [ ] Side-by-side with UWorld, colors match within 5%
- [ ] Typography is equally readable
- [ ] Answer choices have same professional feel
- [ ] Explanation panel has that distinctive blue look
- [ ] Header feels like a medical education platform

### User Experience
- [ ] Reading clinical vignettes feels comfortable (serif font)
- [ ] Answer selection is clear and satisfying
- [ ] Navigation feels professional and smooth
- [ ] Overall aesthetic says "medical education" not "generic quiz app"

---

## 🚀 Quick Start (Priority Order)

**Day 1: Colors & Typography (2 hours)**
1. Update color variables
2. Add Georgia font for vignettes
3. Update all color references

**Day 2: Answer Choices (2 hours)**
1. Redesign answer choice HTML/CSS
2. Test all states (default, selected, correct, incorrect)
3. Fine-tune spacing and sizing

**Day 3: Header & Layout (2 hours)**
1. Implement new header structure
2. Update question container layout
3. Test sticky header behavior

**Day 4: Explanation & Feedback (1.5 hours)**
1. Update explanation panel styling
2. Refine feedback banners
3. Test readability

**Day 5: Polish & Test (2 hours)**
1. Update navigation buttons
2. Adjust all spacing
3. Cross-browser testing
4. Mobile testing

---

**Total Effort: ~10 hours of focused work**

Ready to start? I can begin with Phase 1 (colors) and work through each phase systematically.
