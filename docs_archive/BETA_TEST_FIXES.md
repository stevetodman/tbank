# TBank Beta Test Fixes - Implementation Roadmap

**Generated**: 2025-11-08
**Total Issues Identified**: 37
**Status**: Ready for Implementation

---

## 🔴 WEEK 1 - CRITICAL FIXES (Priority 1)

### Issue #1: Answer Explanation Visibility - MAJOR UX PROBLEM ⚠️
**Priority**: CRITICAL
**Impact**: High - Affects core learning experience
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Problem**:
- No clear visual separation between question, answers, and explanations
- Correct answer not highlighted after submission
- No indicator showing "You selected X (Incorrect)" vs "Correct: Y"
- Explanation text blends into page
- Students have to scroll to find which answer was correct

**Implementation Requirements**:
- [ ] Add green highlight to correct answer with checkmark ✓
- [ ] Add red highlight to incorrect selected answer with X ✗
- [ ] Create dedicated explanation section with clear visual hierarchy
- [ ] Separate "Why correct" in green-bordered box
- [ ] Separate "Why incorrect" explanations
- [ ] Auto-scroll to explanation section after submission
- [ ] Add visual indicators (✓ Correct / ✗ Incorrect badges)

**Reference Code Location**: `renderQuestion()` function, lines ~800-1200

---

### Issue #2: No Progress Persistence Indicator
**Priority**: CRITICAL
**Impact**: High - Student anxiety about losing progress
**Effort**: Low
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Problem**:
- Students can't tell if progress is being saved
- No visual confirmation after answering
- Welcome screen doesn't show previous progress

**Implementation Requirements**:
- [ ] Add "Progress auto-saved" toast notification after each answer
- [ ] Show "X questions completed" on welcome screen if progress exists
- [ ] Add "Resume where you left off" button on welcome screen
- [ ] Add subtle save icon in header when state is saved
- [ ] Show last session date/time on welcome screen

**Reference Code Location**: `saveState()` function, `renderWelcomeScreen()`

---

### Issue #3: Filter Buttons Are Broken 🐛
**Priority**: CRITICAL
**Impact**: High - Core review functionality doesn't work
**Effort**: Medium
**Files**: `docs/assets/js/app.js`

**Problem**:
- "Review Incorrect" button doesn't filter questions
- "Unanswered" button doesn't work
- "Flagged" button doesn't filter
- Filter UI exists but logic not wired up

**Implementation Requirements**:
- [ ] Implement `filterQuestionGrid()` function
- [ ] Wire up "Show All" button click handler
- [ ] Wire up "Review Incorrect" button to filter grid
- [ ] Wire up "Unanswered" button to filter grid
- [ ] Wire up "Flagged" button to filter grid
- [ ] Update question count display when filtered
- [ ] Add "Showing X of Y questions" indicator
- [ ] Preserve filter state when navigating

**Reference Code Location**: Question menu section, lines ~1800-2000

---

### Issue #4: Explanation Overload - Too Much Text
**Priority**: HIGH
**Impact**: Medium - Cognitive overload
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Problem**:
- Explanations are very lengthy
- Hard to find key takeaway
- Requires extensive scrolling
- No quick summary

**Implementation Requirements**:
- [ ] Add "TL;DR" / "Key Point" section at top of explanations
- [ ] Extract educational objective as the TL;DR
- [ ] Make detailed explanations collapsible
- [ ] Add "Show More / Show Less" toggle button
- [ ] Better formatting with bullet points
- [ ] Improve visual hierarchy with headings

**Reference Code Location**: `renderQuestion()` explanation rendering section

---

### Issue #5: Improve Visual Hierarchy for Questions
**Priority**: HIGH
**Impact**: High - Readability and comprehension
**Effort**: Low
**Files**: `docs/assets/css/questions.css`, `docs/assets/css/dark-mode-quiz.css`

**Problem**:
- Vignette vs question stem not clearly separated
- Answer letters too small
- Selected answer doesn't stand out
- Poor visual distinction between sections

**Implementation Requirements**:
- [ ] Add background color to vignette section
- [ ] Add border-left accent to vignette
- [ ] Increase font-weight of question stem to 600
- [ ] Make question stem standalone with margin
- [ ] Increase answer letter size to 1.2rem
- [ ] Increase answer letter font-weight to 700
- [ ] Add more padding between answer options
- [ ] Improve selected answer visual indicator
- [ ] Test in both light and dark modes

**Reference Code Location**: `.vignette`, `.question-text`, `.answer-choice` CSS classes

---

## 🟡 WEEK 2 - HIGH IMPACT (Priority 2)

### Issue #6: Missing Notes Feature
**Priority**: HIGH
**Impact**: High - Essential for personalized learning
**Effort**: High
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Add "Add Note" button below each explanation
- [ ] Create note editor modal/inline input
- [ ] Save notes to localStorage per question ID
- [ ] Display existing notes when revisiting questions
- [ ] Add note indicator icon to question grid
- [ ] Add "Export Notes" functionality
- [ ] Support markdown formatting in notes
- [ ] Add character limit (500-1000 chars)
- [ ] Add timestamp to notes

---

### Issue #7: No Search Functionality
**Priority**: HIGH
**Impact**: High - Discoverability
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Add search bar in question menu header
- [ ] Implement search across question text, topics, keywords
- [ ] Filter question grid based on search results
- [ ] Highlight matching terms in results
- [ ] Add search filters (topic, difficulty, status)
- [ ] Add search history / recent searches
- [ ] Clear search button
- [ ] Show "X results found" counter

---

### Issue #8: Timer UX Issues
**Priority**: HIGH
**Impact**: Medium - Timed practice experience
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Problem**:
- Timer is small and easy to miss
- Pause button tiny
- No visual warning when time running out
- No indication when paused

**Implementation Requirements**:
- [ ] Increase timer display size
- [ ] Add color changes: Green → Yellow (30s) → Red (10s)
- [ ] Add pulse animation under 10 seconds
- [ ] Show "PAUSED" overlay when timer paused
- [ ] Make pause/resume button larger (44x44px)
- [ ] Add warning at 30 seconds remaining
- [ ] Add progress ring around timer
- [ ] Improve timer positioning on mobile

---

### Issue #9: Session Summary Lacks Context
**Priority**: MEDIUM
**Impact**: Medium - Actionable insights
**Effort**: Medium
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add comparison to previous sessions
- [ ] Show improvement percentage
- [ ] Highlight weakest topic
- [ ] Show flagged questions count with review link
- [ ] Add time management insights
- [ ] Show questions where too slow
- [ ] Add specific review recommendations
- [ ] Store session history in localStorage

---

### Issue #10: Accessibility - Screen Reader Support
**Priority**: HIGH
**Impact**: High - Inclusivity
**Effort**: Medium
**Files**: `docs/index.html`, `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add ARIA labels to all answer choices
- [ ] Add aria-live region for correct/incorrect announcements
- [ ] Improve navigation button aria-labels
- [ ] Implement modal focus trap
- [ ] Add role="region" to explanation sections
- [ ] Add aria-label to all interactive elements
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Add skip links for keyboard navigation

---

### Issue #11: Keyboard Navigation Problems
**Priority**: MEDIUM
**Impact**: Medium - Power users and accessibility
**Effort**: Low
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Enable Tab navigation through answer choices
- [ ] Add keyboard shortcut 'F' to flag questions
- [ ] Add keyboard shortcut 'M' to open menu
- [ ] Add keyboard shortcut 'S' to submit (in addition to Enter)
- [ ] Add keyboard shortcuts A-E to select answers
- [ ] Add Space to toggle explanation expand/collapse
- [ ] Add visible focus indicators
- [ ] Create keyboard shortcuts help modal (? key)

---

### Issue #12: Touch Targets Too Small
**Priority**: HIGH
**Impact**: High - Mobile usability
**Effort**: Low
**Files**: `docs/assets/css/questions.css`

**Problem**:
- Settings ⚙️ button too small
- Menu ☰ button too close to other elements
- Timer pause button hard to tap
- Modal close buttons need more padding

**Implementation Requirements**:
- [ ] Audit all interactive elements for 44x44px minimum
- [ ] Increase settings button size
- [ ] Increase menu button size
- [ ] Add more spacing between header buttons
- [ ] Increase timer pause button touch area
- [ ] Increase modal close button size
- [ ] Add padding to all buttons
- [ ] Test on actual mobile devices

---

## 🟢 MONTH 1 - LEARNING FEATURES (Priority 3)

### Issue #13: No Spaced Repetition System
**Priority**: MEDIUM
**Impact**: Very High - Learning effectiveness
**Effort**: High
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Implement spaced repetition algorithm (SM-2 or similar)
- [ ] Track last review date per question
- [ ] Calculate "due for review" questions
- [ ] Auto-schedule incorrect answers for review
- [ ] Show "Due for Review" counter on welcome screen
- [ ] Create review queue in order of priority
- [ ] Add review intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month
- [ ] Store review history in localStorage
- [ ] Add "Study Due Reviews" button

---

### Issue #14: Custom Quiz Mode
**Priority**: MEDIUM
**Impact**: High - Flexibility
**Effort**: High
**Files**: `docs/assets/js/app.js`, `docs/index.html`

**Implementation Requirements**:
- [ ] Create "Custom Quiz" button on welcome screen
- [ ] Build quiz configuration modal
- [ ] Add topic selection checkboxes
- [ ] Add difficulty filter (easy/medium/hard)
- [ ] Add number of questions selector
- [ ] Add timed vs untimed toggle
- [ ] Add "new questions only" vs "review" toggle
- [ ] Generate quiz based on criteria
- [ ] Show quiz configuration summary before starting

---

### Issue #15: Enhanced Topic Dashboard
**Priority**: MEDIUM
**Impact**: Medium - Learning insights
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Track performance trend over time per topic
- [ ] Show improvement/decline indicators
- [ ] Add subtopic breakdown
- [ ] Show questions to review count per topic
- [ ] Add visual charts/graphs
- [ ] Show comparison to overall average
- [ ] Add "weakest topic" alert
- [ ] Add drill-down to subtopics

---

### Issue #16: Export Data Feature
**Priority**: MEDIUM
**Impact**: Medium - Data portability
**Effort**: Medium
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "Export Progress" button in session summary
- [ ] Generate CSV export with columns: Question ID, Your Answer, Correct Answer, Topic, Time Spent, Date
- [ ] Generate PDF summary report
- [ ] Add progress charts to PDF
- [ ] Export notes separately
- [ ] Add date range filter for exports
- [ ] Create downloadable file
- [ ] Add export to clipboard option

---

### Issue #17: Landscape Mode Optimization
**Priority**: LOW
**Impact**: Medium - Tablet users
**Effort**: Medium
**Files**: `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Detect landscape orientation
- [ ] Create two-column layout (vignette left, answers right)
- [ ] Optimize spacing for horizontal screens
- [ ] Test on iPad and Android tablets
- [ ] Ensure navigation buttons remain accessible
- [ ] Add media queries for landscape mode

---

## 🔵 MONTH 2+ - ADVANCED FEATURES (Priority 4)

### Issue #18: Study Plan Generator
**Priority**: LOW
**Impact**: High - Long-term engagement
**Effort**: Very High
**Files**: `docs/assets/js/app.js`, new files

**Implementation Requirements**:
- [ ] Create study plan configuration wizard
- [ ] Input: days until exam
- [ ] Calculate daily question allocation
- [ ] Prioritize weak topics
- [ ] Track daily completion
- [ ] Send reminders (PWA notifications)
- [ ] Adjust plan based on performance
- [ ] Show progress toward study goals

---

### Issue #19: Flashcard Mode
**Priority**: LOW
**Impact**: Medium - Study variety
**Effort**: High
**Files**: `docs/assets/js/app.js`, new files

**Implementation Requirements**:
- [ ] Create flashcard view mode
- [ ] Front: Educational objective or key concept
- [ ] Back: Clinical scenario + answer
- [ ] Swipe to flip card
- [ ] Mark as "know" or "don't know"
- [ ] Export to Anki format
- [ ] Spaced repetition for flashcards
- [ ] Create flashcards from questions

---

### Issue #20: Social Features
**Priority**: LOW
**Impact**: Medium - Engagement
**Effort**: Very High
**Files**: Multiple, requires backend

**Implementation Requirements**:
- [ ] Study group codes
- [ ] Share progress with friends
- [ ] Anonymous leaderboard
- [ ] Challenge friends on specific questions
- [ ] Share individual questions via link
- [ ] Group study mode
- [ ] Requires backend infrastructure

---

### Issue #21: External Resource Links
**Priority**: LOW
**Impact**: Medium - Deeper learning
**Effort**: Medium
**Files**: Question JSON files, `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "resources" field to question data
- [ ] Link to First Aid pages
- [ ] Link to related videos
- [ ] Link to related questions
- [ ] Show "Learn More" section in explanations
- [ ] Curate quality external resources
- [ ] Add resource validation

---

### Issue #22: Gamification Enhancements
**Priority**: LOW
**Impact**: Medium - Motivation
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Daily study streak counter
- [ ] Achievement badges
- [ ] Badge: "Perfect score on [topic]"
- [ ] Badge: "Completed all questions"
- [ ] Badge: "7-day study streak"
- [ ] Badge: "Improved 60% to 80%"
- [ ] Achievement showcase page
- [ ] Share achievements

---

## ⚡ QUICK WINS (Easy Fixes, High Impact)

### Issue #23: Add "Skip" Button
**Priority**: LOW
**Impact**: Low
**Effort**: Very Low
**Files**: `docs/assets/js/app.js`, `docs/index.html`

**Implementation Requirements**:
- [ ] Add "Skip" button next to Submit button
- [ ] Mark question as skipped
- [ ] Show skipped indicator in question grid
- [ ] Allow filtering by skipped questions

---

### Issue #24: Add "Report Error" Button
**Priority**: LOW
**Impact**: Medium - Quality control
**Effort**: Low
**Files**: `docs/assets/js/app.js`, `docs/index.html`

**Implementation Requirements**:
- [ ] Add "Report Error" button below explanation
- [ ] Create GitHub issue template
- [ ] Link to GitHub issues with pre-filled template
- [ ] Include question ID in report

---

### Issue #25: Show Question ID in Display
**Priority**: LOW
**Impact**: Low
**Effort**: Very Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Change "Question 1 of 52" to "Question #1 of 52"
- [ ] Make ID clickable to copy
- [ ] Show ID in session summary

---

### Issue #26: Add "Previous Explanation" Link
**Priority**: LOW
**Impact**: Low
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "← View Previous Explanation" button
- [ ] Show previous question's explanation in modal
- [ ] Allow navigation through explanation history

---

### Issue #27: Progress Bar Tooltip
**Priority**: LOW
**Impact**: Low
**Effort**: Very Low
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Add tooltip to progress bar on hover
- [ ] Show "23/52 (44%)" in tooltip
- [ ] Add touch/long-press support on mobile

---

### Issue #28: Add "Reset This Question" Button
**Priority**: LOW
**Impact**: Medium
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "Try Again" button after viewing explanation
- [ ] Reset only current question state
- [ ] Don't reset overall progress
- [ ] Confirm before resetting

---

### Issue #29: Add "Show Answer" Button
**Priority**: LOW
**Impact**: Low
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "Show Answer" button (doesn't count as attempt)
- [ ] Reveal correct answer without submitting
- [ ] Mark as "viewed answer" (don't count in stats)
- [ ] Add toggle in settings to enable/disable

---

## 🐛 BUG FIXES

### Issue #30: Timer Doesn't Pause on Modal Open
**Priority**: CRITICAL
**Impact**: High - Unfair timing
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Auto-pause timer when settings modal opens
- [ ] Auto-pause timer when session summary opens
- [ ] Auto-pause timer when any modal opens
- [ ] Resume timer when modal closes (optional)
- [ ] Show "Timer Paused" indicator

---

### Issue #31: Pull-to-Refresh Too Sensitive
**Priority**: MEDIUM
**Impact**: Medium - Accidental triggers
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Increase pull distance threshold
- [ ] Add visual progress indicator
- [ ] Add confirmation modal before randomizing
- [ ] Show "Release to randomize" message
- [ ] Improve touch event handling

---

### Issue #32: Swipe Gestures Not Discoverable
**Priority**: MEDIUM
**Impact**: High - Feature adoption
**Effort**: Low
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Show gesture tutorial overlay on first question
- [ ] Display "👆 Swipe left/right to navigate" message
- [ ] Auto-dismiss after 3 seconds or first swipe
- [ ] Add "?" help button showing gesture guide
- [ ] Make tutorial dismissible
- [ ] Store "tutorial shown" flag in localStorage

---

### Issue #33: Dark Mode Contrast Issues
**Priority**: MEDIUM
**Impact**: Medium - Readability
**Effort**: Medium
**Files**: `docs/assets/css/dark-mode-quiz.css`

**Implementation Requirements**:
- [ ] Run WCAG AAA contrast checker on dark mode
- [ ] Increase contrast for explanation text
- [ ] Improve answer option distinction in dark mode
- [ ] Ensure selected answers stand out
- [ ] Test all color combinations
- [ ] Update color variables as needed

---

### Issue #34: Welcome Screen Information Overload
**Priority**: LOW
**Impact**: Low - First impression
**Effort**: Very Low
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Simplify welcome screen text
- [ ] Remove detailed features list
- [ ] Keep only: question count, USMLE level, start button
- [ ] Move keyboard shortcuts to inline tooltip on first question
- [ ] Make welcome screen more minimal

---

### Issue #35: Streak Celebrations Too Intrusive
**Priority**: LOW
**Impact**: Low - Focus during study
**Effort**: Low
**Files**: `docs/assets/js/app.js`

**Implementation Requirements**:
- [ ] Add "Quiet Mode" setting
- [ ] Make celebrations dismissible with tap/swipe
- [ ] Show subtle badge instead of full animation
- [ ] Add setting to disable celebrations entirely

---

### Issue #36: No High Contrast Mode
**Priority**: LOW
**Impact**: Medium - Accessibility
**Effort**: Medium
**Files**: `docs/assets/css/questions.css`, new CSS file

**Implementation Requirements**:
- [ ] Create high-contrast.css stylesheet
- [ ] Add "High Contrast" toggle in settings
- [ ] Use black/white/yellow color scheme
- [ ] Meet WCAG AAA standards
- [ ] Test with users who need high contrast

---

### Issue #37: Long Questions Scroll Issues
**Priority**: MEDIUM
**Impact**: Medium - UX on complex questions
**Effort**: Medium
**Files**: `docs/assets/js/app.js`, `docs/assets/css/questions.css`

**Implementation Requirements**:
- [ ] Make question stem sticky when scrolling
- [ ] Add "Jump to Answers" button
- [ ] Add "Back to Question" button in answer section
- [ ] Improve layout for long vignettes
- [ ] Consider pagination for very long questions

---

## 📊 IMPLEMENTATION STATISTICS

**Total Issues**: 37

**By Priority**:
- 🔴 Critical (Week 1): 5 issues
- 🟡 High Impact (Week 2): 7 issues
- 🟢 Learning Features (Month 1): 5 issues
- 🔵 Advanced Features (Month 2+): 5 issues
- ⚡ Quick Wins: 7 issues
- 🐛 Bug Fixes: 8 issues

**By Effort**:
- Very Low: 4 issues
- Low: 10 issues
- Medium: 15 issues
- High: 6 issues
- Very High: 2 issues

**By Impact**:
- Very High: 1 issue
- High: 13 issues
- Medium: 18 issues
- Low: 5 issues

---

## 📝 IMPLEMENTATION NOTES

### Recommended Approach
1. Start with **Week 1 Critical Fixes** - highest impact on learning
2. Move to **Week 2 High Impact** - improves core features
3. Cherry-pick **Quick Wins** throughout - easy morale boosters
4. Fix **Bugs** as discovered during development
5. Plan **Learning Features** for major releases
6. Consider **Advanced Features** for v2.0

### Testing Requirements
- [ ] Manual testing on iOS Safari
- [ ] Manual testing on Android Chrome
- [ ] Desktop testing (Chrome, Firefox, Safari)
- [ ] Screen reader testing (VoiceOver, TalkBack)
- [ ] Keyboard navigation testing
- [ ] Performance testing
- [ ] Offline PWA testing

### Code Quality
- [ ] Add comments to new functions
- [ ] Update documentation
- [ ] Write unit tests for critical functions
- [ ] Ensure no console errors
- [ ] Validate HTML/CSS
- [ ] Run ESLint

---

## 🎯 SUCCESS METRICS

**After Week 1 Fixes**:
- Medical students can easily identify correct/incorrect answers
- All filter buttons work correctly
- Progress is clearly indicated
- Timer UX is improved

**After Week 2 Fixes**:
- Notes feature enables personalized learning
- Search makes questions discoverable
- Accessibility score improves significantly
- Mobile touch targets meet standards

**After Month 1**:
- Spaced repetition improves retention
- Custom quizzes enable focused practice
- Enhanced analytics guide study
- Data export enables external tracking

**Long-term Vision**:
- Study plans keep students on track
- Social features increase engagement
- Gamification motivates consistent practice
- TBank becomes essential study tool

---

## 📞 SUPPORT

For questions about any issue, reference the issue number (e.g., "Issue #1") and I can provide:
- Detailed implementation guidance
- Code examples
- Testing procedures
- Design mockups

Ready to start implementing! 🚀
