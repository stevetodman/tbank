# TBank Implementation Roadmap

**Status:** Post-Audit - Critical Fixes Complete
**Remaining Work:** High & Medium Priority Improvements

---

## Phase 1: Performance Optimization (15-20 hours)

### 1.1 Event Listener Memory Leaks (HIGH - 3-4 hours)

**Problem:** Event listeners accumulate on every question render

**Current Impact:**
- Memory +1MB per 50 questions
- Performance degrades 2-5x after extended use
- Each listener fires multiple times per interaction

**Solution:** Implement event delegation

```javascript
// BEFORE - Listeners accumulate
function renderQuestion(index) {
  questionDisplay.innerHTML = html;
  document.querySelectorAll('input[name="answer"]').forEach(radio => {
    radio.addEventListener('change', handleAnswerSelection); // DUPLICATE!
  });
}

// AFTER - Single delegated listener
function renderQuestion(index) {
  questionDisplay.innerHTML = html;
}

// Add once at app init
questionDisplay.addEventListener('change', (e) => {
  if (e.target.matches('input[name="answer"]')) {
    handleAnswerSelection(e);
  }
});
```

**Files:** `docs/assets/js/app.js:1667-2002`

---

### 1.2 DOM Rendering Optimization (HIGH - 6-8 hours)

**Problem:** Full DOM rebuild on every question (400-600ms)

**Solution:** Incremental updates instead of innerHTML replacement

```javascript
// BEFORE - Full rebuild
function renderQuestion(index) {
  let html = ''; // Build 227 lines of HTML
  questionDisplay.innerHTML = html; // Replace entire DOM
}

// AFTER - Update only changed elements
function renderQuestion(index) {
  updateQuestionText(questions[index]);
  updateAnswerChoices(questions[index]);
  updateExplanationState(index);
}
```

**Expected:** 50-120ms (75% faster)
**Files:** `docs/assets/js/app.js:1436-1663`

---

### 1.3 querySelectorAll Optimization (MEDIUM - 2 hours)

**Problem:** O(n²) complexity in search/filter operations

```javascript
// BEFORE - O(n²)
const buttons = questionGrid.querySelectorAll('.grid-question-btn');
buttons.forEach((btn, index) => {
  // Query runs O(n) times in O(n) loop
});

// AFTER - O(n) with caching
const buttons = Array.from(questionGrid.querySelectorAll('.grid-question-btn'));
buttons.forEach((btn, index) => {
  // Single query, then iterate
});
```

**Expected:** 20-50ms (90% faster)
**Files:** `docs/assets/js/app.js:2268,2320,2354`

---

### 1.4 Code Splitting & Bundle Optimization (MEDIUM - 4-6 hours)

**Problem:** Monolithic 3,811-line file, 35-40KB gzipped bundle

**Solution:**
1. Split into modules:
   - `core.js` - Quiz engine
   - `ui.js` - Rendering logic
   - `notes.js` - Notes management
   - `stats.js` - Statistics tracking

2. Minify CSS (80KB → 40KB)

3. Lazy load question banks

**Expected:** 15-20KB initial bundle (50% reduction)

---

## Phase 2: Accessibility (WCAG 2.1 AA) (3-4 hours)

### 2.1 Checkbox Labels (HIGH - 1 hour)

**Issue:** Labels missing `for` attributes (WCAG 1.3.1, 4.1.2)

```html
<!-- BEFORE -->
<label>
  <input type="checkbox" id="haptics-toggle">
  Enable Haptics
</label>

<!-- AFTER -->
<label for="haptics-toggle">Enable Haptics</label>
<input type="checkbox" id="haptics-toggle">
```

**Files:** Settings menu, filter UI

---

### 2.2 Color Contrast (HIGH - 30 mins)

**Issue:** Dark mode disabled buttons: 3.8:1 (requires 4.5:1)

```css
/* BEFORE */
.button:disabled {
  color: #6b7280; /* 3.8:1 contrast */
}

/* AFTER */
.button:disabled {
  color: #9ca3af; /* 4.6:1 contrast */
}
```

**Files:** `docs/assets/css/dark-mode-quiz.css`

---

### 2.3 ARIA Attributes (MEDIUM - 1 hour)

**Issues:**
- Timer display conflicting attributes
- Radio button label redundancy
- Answer choice semantic markup

**Files:** `docs/assets/js/app.js`, `docs/index.html`

---

### 2.4 Screen Reader Improvements (MEDIUM - 1 hour)

**Enhancements:**
- Modal opening announcements
- Skip link focus management
- Live region updates

---

## Phase 3: Testing (8-12 hours)

### 3.1 Unit Tests (HIGH - 6-8 hours)

**Current Coverage:** 5% (only utils.js)
**Target:** 70%

**Priority Test Suites:**
```javascript
// app.test.js
describe('renderQuestion', () => {
  it('should render question text correctly');
  it('should handle missing data gracefully');
  it('should update answer choices');
});

describe('handleSubmit', () => {
  it('should prevent double submission');
  it('should update streak correctly');
  it('should save state');
});

describe('State Management', () => {
  it('should save to localStorage');
  it('should handle localStorage failures');
  it('should prevent race conditions');
});
```

**Tools:** Vitest (already configured)

---

### 3.2 Integration Tests (MEDIUM - 2-3 hours)

**Scenarios:**
- Complete quiz flow (select → submit → navigate)
- Note creation and editing
- Session history tracking
- Dark mode toggling
- Timer functionality

---

### 3.3 E2E Tests (LOW - 2-3 hours)

**User Journeys:**
- First-time user onboarding
- Completing full quiz
- Offline functionality
- Multi-device sync

---

## Phase 4: Code Quality (5-8 hours)

### 4.1 Modularize app.js (MEDIUM - 4-6 hours)

**Split 3,811 lines into:**

```
src/
├── core/
│   ├── state.js         - State management
│   ├── quiz-engine.js   - Quiz logic
│   └── validation.js    - Question validation
├── ui/
│   ├── renderer.js      - DOM rendering
│   ├── components.js    - UI components
│   └── animations.js    - Confetti, etc.
├── features/
│   ├── notes.js         - Notes management
│   ├── timer.js         - Timer functionality
│   ├── stats.js         - Statistics
│   └── search.js        - Search/filter
└── app.js               - App initialization
```

---

### 4.2 CSS Optimization (LOW - 1 hour)

**Issues:**
```css
/* BEFORE - Inefficient */
* { transition: all 0.3s; }

/* AFTER - Specific properties */
.button { transition: background-color 0.3s, color 0.3s; }
```

---

### 4.3 Service Worker Improvements (LOW - 1 hour)

**Enhancements:**
- Add cache size limits
- Improve error handling
- Add update notifications

---

## Implementation Priority

### Week 1 (15-20 hours)
**Focus:** Performance
- [ ] Fix event listener leaks (3-4 hrs)
- [ ] Optimize DOM rendering (6-8 hrs)
- [ ] Fix querySelectorAll (2 hrs)
- [ ] Bundle optimization (4-6 hrs)

**Expected:** 80-90% performance improvement

---

### Week 2 (10-15 hours)
**Focus:** Accessibility & Testing
- [ ] Fix checkbox labels (1 hr)
- [ ] Fix color contrast (30 min)
- [ ] ARIA improvements (1 hr)
- [ ] Unit tests for core functions (6-8 hrs)
- [ ] Integration tests (2-3 hrs)

**Expected:** WCAG AA compliance + 70% test coverage

---

### Week 3-4 (8-12 hours)
**Focus:** Code Quality
- [ ] Modularize app.js (4-6 hrs)
- [ ] CSS optimization (1 hr)
- [ ] Service Worker improvements (1 hr)
- [ ] E2E tests (2-3 hrs)

**Expected:** Maintainable, well-tested codebase

---

## Success Metrics

### Performance Targets
- Question navigation: < 120ms
- Memory usage: Stable (no growth)
- Search/filter: < 50ms
- Bundle size: < 20KB gzipped

### Quality Targets
- Test coverage: > 70%
- WCAG compliance: 100% AA
- Lighthouse score: > 95
- 0 ESLint errors/warnings

### Maintainability Targets
- Max file size: < 500 lines
- Cyclomatic complexity: < 15
- Code duplication: < 5%

---

## Quick Start

### 1. Development Setup
```bash
npm install
npm run dev
```

### 2. Run Tests
```bash
npm test
npm run test:coverage
```

### 3. Check Performance
```bash
# Use browser DevTools Performance tab
# Measure question navigation time
# Monitor memory usage
```

### 4. Verify Accessibility
```bash
# Use aXe DevTools extension
# Test with screen reader
# Check color contrast
```

---

## Resources

- **Performance:** See `PERFORMANCE_REPORT.md`
- **Accessibility:** See `ACCESSIBILITY_REPORT.md`
- **Original Audit:** See `AUDIT_SUMMARY.md`
- **Testing:** See `__tests__/README.md`

---

**Total Estimated Effort:** 35-50 hours across 3-4 weeks

**Current Status:** Ready to begin Phase 1

**Last Updated:** 2025-11-08
