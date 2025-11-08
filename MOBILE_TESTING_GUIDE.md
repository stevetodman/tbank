# TBank Mobile Testing Guide

**Version:** 1.0.0
**Date:** 2025-11-08
**Purpose:** Comprehensive testing procedures for mobile UI/UX enhancements

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Environments](#testing-environments)
3. [Feature Testing](#feature-testing)
4. [Regression Testing](#regression-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Issue Reporting](#issue-reporting)

---

## Quick Start

### Prerequisites
- Modern smartphone (iOS 14+ or Android 10+)
- Desktop browser for comparison testing
- Network throttling capability (for offline testing)

### Quick Test (5 minutes)
1. Visit https://stevetodman.github.io/tbank/ on mobile
2. Verify welcome screen shows mobile gestures (NOT keyboard shortcuts)
3. Swipe left/right on a question to navigate
4. Double-tap an answer to select and submit
5. Enable dark mode in settings
6. Verify no keyboard hints or black boxes appear

**Expected Result:** All mobile features work; no desktop-only UI elements visible

---

## Testing Environments

### Mobile Devices

#### iOS Testing
**Minimum Supported:** iOS 14.0+

**Test Devices (Physical or Simulator):**
- iPhone SE (2020) - 375×667px - Smallest modern screen
- iPhone 12/13/14 - 390×844px - Standard size
- iPhone 12/13/14 Pro Max - 428×926px - Large size
- iPad Mini - 768×1024px - Tablet breakpoint

**Safari Versions:**
- Latest stable
- Previous major version (for regression)

#### Android Testing
**Minimum Supported:** Android 10.0+

**Test Devices (Physical or Emulator):**
- Pixel 4a - 360×800px - Compact size
- Pixel 6 - 412×915px - Standard size
- Samsung Galaxy S21+ - 384×854px - Common size
- Tablet (10") - 800×1280px - Tablet experience

**Browser Versions:**
- Chrome latest stable
- Chrome previous major version
- Samsung Internet Browser latest

#### Viewport Sizes for Responsive Testing
```
320px × 568px  - iPhone SE (1st gen)
375px × 667px  - iPhone SE (2nd gen), iPhone 8
390px × 844px  - iPhone 13, 14
393px × 851px  - Pixel 5
412px × 915px  - Pixel 6
414px × 896px  - iPhone 11 Pro Max
428px × 926px  - iPhone 14 Pro Max
768px × 1024px - iPad Mini, tablet breakpoint
```

### Desktop Browsers (Comparison Testing)

**Required Tests:**
- Chrome 120+ (Windows, macOS, Linux)
- Firefox 120+
- Safari 17+ (macOS only)
- Edge 120+

---

## Feature Testing

### 1. Keyboard Shortcuts Visibility (CRITICAL)

#### Test Case 1.1: Welcome Screen - Mobile
**Objective:** Verify keyboard shortcuts are hidden on mobile devices

**Steps:**
1. Open TBank on mobile device (iOS or Android)
2. View welcome screen
3. Check for any keyboard navigation hints or arrow symbols

**Expected Result:**
- ✅ Mobile gestures section visible with touch instructions
- ✅ NO keyboard shortcuts section visible
- ✅ NO "← → Navigate questions" text
- ✅ NO black or dark gray box with arrows

**Test on:**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Mobile viewport in desktop browser (375px width)

#### Test Case 1.2: Welcome Screen - Dark Mode Mobile
**Objective:** Verify keyboard shortcuts stay hidden in dark mode

**Steps:**
1. Open TBank on mobile device
2. Enable dark mode in Settings
3. View welcome screen
4. Check for keyboard hints

**Expected Result:**
- ✅ Dark theme applied correctly
- ✅ NO keyboard shortcuts visible
- ✅ NO black box (color #2d3748) with arrows
- ✅ Mobile gestures section visible with proper dark mode styling

**Test on:**
- [ ] iPhone dark mode (Safari)
- [ ] Android dark mode (Chrome)
- [ ] System dark mode preference

#### Test Case 1.3: Welcome Screen - Desktop
**Objective:** Verify keyboard shortcuts ARE visible on desktop

**Steps:**
1. Open TBank in desktop browser (>768px width)
2. View welcome screen
3. Check for keyboard shortcuts section

**Expected Result:**
- ✅ Keyboard shortcuts section VISIBLE
- ✅ Text: "Keyboard shortcuts:"
- ✅ Text: "← → Navigate questions • Enter Submit answer"
- ✅ NO mobile gestures section

**Test on:**
- [ ] Chrome desktop (1920px)
- [ ] Firefox desktop (1440px)
- [ ] Safari desktop (1280px)

#### Test Case 1.4: Keyboard Hint Toast - Mobile
**Objective:** Verify keyboard hint toast never appears on mobile

**Steps:**
1. Open TBank on mobile device
2. Start test (click "Start Test")
3. Wait 2-5 seconds
4. Check for any toast notifications about keyboard shortcuts

**Expected Result:**
- ✅ NO toast message about arrow keys
- ✅ NO floating hint boxes
- ✅ NO keyboard navigation instructions

**Test on:**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)

#### Test Case 1.5: Keyboard Hint Toast - Desktop
**Objective:** Verify keyboard hint toast appears on desktop

**Steps:**
1. Open TBank in desktop browser
2. Start test
3. Wait 2-5 seconds

**Expected Result:**
- ✅ Toast message appears: "💡 Tip: Use ← → arrow keys to navigate"
- ✅ Toast auto-dismisses after 3 seconds
- ✅ Only shows once per session

### 2. Haptic Feedback

#### Test Case 2.1: Answer Selection
**Steps:**
1. Select an answer choice (tap once)
2. Feel for vibration feedback

**Expected Result:**
- ✅ Light tap vibration (10ms duration)
- ✅ Immediate response (no delay)

**Test on:**
- [ ] iPhone
- [ ] Android

#### Test Case 2.2: Correct Answer Submission
**Steps:**
1. Select correct answer
2. Submit answer
3. Feel for vibration pattern

**Expected Result:**
- ✅ Success pattern: [15ms, 50ms pause, 20ms]
- ✅ Double-pulse celebration feel

#### Test Case 2.3: Incorrect Answer Submission
**Steps:**
1. Select incorrect answer
2. Submit answer
3. Feel for vibration pattern

**Expected Result:**
- ✅ Error pattern: [10ms, 40ms pause, 10ms, 40ms pause, 10ms]
- ✅ Triple-pulse error feel

#### Test Case 2.4: Streak Milestone
**Steps:**
1. Answer 3 questions correctly in a row
2. Feel for vibration on 3rd correct answer

**Expected Result:**
- ✅ Celebration pattern: [20ms, 60ms pause, 20ms, 60ms pause, 30ms]
- ✅ Toast message: "🔥 3 in a row! You're on fire!"

**Test milestones:**
- [ ] 3 correct streak
- [ ] 5 correct streak
- [ ] 10 correct streak

#### Test Case 2.5: Timer Warning
**Steps:**
1. Enable timed mode (Settings → Timed Mode)
2. Set timer to 15 seconds
3. Start question
4. Wait for 10 second mark

**Expected Result:**
- ✅ Warning vibration (200ms) at 10 seconds
- ✅ Timer display turns red
- ✅ Pulsing animation on timer

### 3. Swipe Gestures

#### Test Case 3.1: Question Navigation - Swipe Left
**Steps:**
1. View question 1
2. Swipe left on question content (not on answer)
3. Verify transition to question 2

**Expected Result:**
- ✅ Smooth transition to next question
- ✅ Visual feedback (transform effect) during swipe
- ✅ Arrow indicator (→) appears on right during swipe
- ✅ Subtle haptic feedback
- ✅ Minimum 80px swipe required

**Test on:**
- [ ] iPhone
- [ ] Android
- [ ] Various swipe speeds (slow, medium, fast)

#### Test Case 3.2: Question Navigation - Swipe Right
**Steps:**
1. View question 2 or later
2. Swipe right on question content
3. Verify transition to previous question

**Expected Result:**
- ✅ Smooth transition to previous question
- ✅ Arrow indicator (←) appears on left during swipe
- ✅ Subtle haptic feedback

#### Test Case 3.3: Answer Elimination - Swipe Left
**Steps:**
1. View question with multiple answers
2. Swipe left on an answer choice (not the question)
3. Verify answer is crossed out

**Expected Result:**
- ✅ Answer text has strikethrough
- ✅ Answer opacity reduced to 50%
- ✅ Visual hint "✕ Cross out" during swipe
- ✅ Light haptic feedback
- ✅ Minimum 60px swipe required

**Test on:**
- [ ] First answer (A)
- [ ] Middle answer (C)
- [ ] Last answer (E)

#### Test Case 3.4: Answer Restoration - Swipe Right
**Steps:**
1. Eliminate an answer (swipe left)
2. Swipe right on the same eliminated answer
3. Verify answer is restored

**Expected Result:**
- ✅ Strikethrough removed
- ✅ Full opacity restored
- ✅ Visual hint "↺ Undo" during swipe
- ✅ Light haptic feedback

#### Test Case 3.5: Swipe Gesture Conflicts
**Objective:** Verify swipes don't conflict with scrolling

**Steps:**
1. View long question (vignette + explanations)
2. Attempt vertical scroll (up/down)
3. Verify scrolling works normally
4. Attempt horizontal swipe
5. Verify navigation works

**Expected Result:**
- ✅ Vertical scrolling not blocked by swipe detection
- ✅ Diagonal swipes ignored (requires mostly horizontal motion)
- ✅ Maximum vertical distance for swipe: 100px

### 4. Double-Tap to Submit

#### Test Case 4.1: Quick Answer Selection
**Steps:**
1. View unanswered question
2. Double-tap an answer choice quickly (<500ms between taps)
3. Verify answer is selected AND submitted

**Expected Result:**
- ✅ Answer selected (highlighted)
- ✅ Answer immediately submitted
- ✅ Feedback banner appears
- ✅ Explanation section shows
- ✅ Medium haptic feedback

**Test on:**
- [ ] iPhone
- [ ] Android
- [ ] Various answer positions

#### Test Case 4.2: Double-Tap Prevention on Submitted
**Steps:**
1. Submit an answer normally (single tap + submit button)
2. Try double-tapping another answer

**Expected Result:**
- ✅ Nothing happens (answer already submitted)
- ✅ No duplicate submissions

### 5. Long-Press Quick Navigation

#### Test Case 5.1: Flag Button Long-Press
**Steps:**
1. View a question
2. Press and hold flag button for 500ms
3. Release

**Expected Result:**
- ✅ Quick navigation menu appears
- ✅ Options shown:
  - Jump to next unanswered
  - Jump to next flagged
  - Jump to next incorrect
- ✅ Medium haptic feedback on menu open

**Test on:**
- [ ] iPhone
- [ ] Android

#### Test Case 5.2: Quick Navigation - Jump to Unanswered
**Steps:**
1. Answer questions 1-3
2. Long-press flag button on question 4
3. Select "Jump to next unanswered"

**Expected Result:**
- ✅ Menu appears with option
- ✅ Jumps to question 5 (or next unanswered)
- ✅ Menu closes
- ✅ Medium haptic feedback

#### Test Case 5.3: Quick Navigation - No More Questions
**Steps:**
1. Answer all questions
2. Long-press flag button

**Expected Result:**
- ✅ Toast message: "No more questions to jump to"
- ✅ No menu appears

### 6. Pull-to-Refresh

#### Test Case 6.1: Enable Pull-to-Refresh
**Steps:**
1. Open Settings modal
2. Enable "Pull-to-Refresh" toggle
3. Save settings

**Expected Result:**
- ✅ Setting saved in localStorage
- ✅ Toast: "Settings saved!"
- ✅ Medium haptic feedback

#### Test Case 6.2: Pull-to-Refresh - Randomize Questions
**Steps:**
1. Ensure pull-to-refresh is enabled
2. Scroll to top of question display
3. Pull down on question content
4. Pull at least 120px
5. Hold for at least 300ms
6. Release

**Expected Result:**
- ✅ Visual indicator appears (spinning ↻ icon)
- ✅ Text changes: "Pull to randomize questions" → "Release to randomize"
- ✅ Success haptic on release
- ✅ Toast: "🔀 Questions randomized!"
- ✅ Question order shuffled
- ✅ Progress preserved
- ✅ Current question may change

**Test on:**
- [ ] iPhone
- [ ] Android

#### Test Case 6.3: Pull-to-Refresh - Accidental Prevention
**Steps:**
1. Quickly swipe down (< 300ms)
2. Or pull < 120px
3. Release

**Expected Result:**
- ✅ Randomization does NOT trigger
- ✅ Indicator retracts smoothly
- ✅ No haptic feedback

### 7. Dark Mode

#### Test Case 7.1: Automatic Dark Mode Detection
**Steps:**
1. Set device to dark mode (OS level)
2. Open TBank in new browser session
3. Observe theme

**Expected Result:**
- ✅ Dark theme applied automatically
- ✅ Colors:
  - Background: #1a202c (very dark blue-gray)
  - Surface: #2d3748 (dark blue-gray)
  - Text: #edf2f7 (light gray)
- ✅ All elements readable

**Test on:**
- [ ] iPhone with iOS dark mode
- [ ] Android with system dark mode

#### Test Case 7.2: Manual Dark Mode Toggle
**Steps:**
1. Open TBank (any theme)
2. Open Settings
3. Toggle "Dark Mode" checkbox
4. Save settings

**Expected Result:**
- ✅ Theme changes immediately
- ✅ Preference saved in localStorage
- ✅ Smooth transition animation
- ✅ Toast confirmation

#### Test Case 7.3: Dark Mode - Color Contrast
**Objective:** Verify all text is readable in dark mode

**Elements to check:**
- [ ] Question vignette text
- [ ] Question text
- [ ] Answer choices (unselected)
- [ ] Answer choices (selected)
- [ ] Answer choices (correct - green)
- [ ] Answer choices (incorrect - red)
- [ ] Explanation text
- [ ] Menu text
- [ ] Button text
- [ ] Toast notifications

**Expected Result:**
- ✅ Minimum contrast ratio: 4.5:1 (WCAG AA)
- ✅ Preferred contrast ratio: 7:1 (WCAG AAA)
- ✅ No washed-out or invisible text

### 8. iOS-Specific Features

#### Test Case 8.1: Safe Area Insets
**Devices:** iPhone X and later (with notch)

**Steps:**
1. Open TBank on iPhone with notch
2. View header
3. View navigation buttons at bottom
4. Check menu panel on right

**Expected Result:**
- ✅ Header content not hidden by notch
- ✅ Navigation buttons not hidden by home indicator
- ✅ Menu panel respects safe areas
- ✅ No content cut off on any edge

**Test on:**
- [ ] iPhone 12/13/14 (standard notch)
- [ ] iPhone 14 Pro (Dynamic Island)
- [ ] Landscape orientation

#### Test Case 8.2: Status Bar Integration
**Steps:**
1. Install TBank to home screen (iOS)
2. Launch from home screen icon
3. Observe status bar

**Expected Result:**
- ✅ Status bar visible
- ✅ Status bar style: black-translucent
- ✅ Status bar text readable
- ✅ App content starts below status bar

#### Test Case 8.3: Keyboard Handling
**Steps:**
1. Open Settings modal
2. Tap on timer duration input field
3. Observe modal behavior

**Expected Result:**
- ✅ Keyboard appears
- ✅ Modal content resizes to fit available space
- ✅ Input field visible above keyboard
- ✅ Modal height: max 90% of visual viewport height

**Test on:**
- [ ] iPhone portrait
- [ ] iPhone landscape
- [ ] iPad

#### Test Case 8.4: Momentum Scrolling
**Steps:**
1. View long question with explanation
2. Quickly swipe up/down to scroll
3. Observe scroll behavior

**Expected Result:**
- ✅ Smooth momentum scrolling (iOS native feel)
- ✅ Scroll continues after finger lift
- ✅ Rubber-band effect at top/bottom
- ✅ No janky or stuttering motion

### 9. PWA Features

#### Test Case 9.1: Install Prompt (Android/Chrome)
**Steps:**
1. Visit TBank in Chrome (Android or desktop)
2. Answer 5 questions
3. Wait for install prompt

**Expected Result:**
- ✅ Install banner appears at bottom
- ✅ Text: "Install TBank - Add to your home screen..."
- ✅ "Install" and "Not now" buttons visible
- ✅ Tapping "Install" shows native install dialog

**Note:** Prompt may not show if app already installed or user previously dismissed

#### Test Case 9.2: Manual Installation (iOS)
**Steps:**
1. Open TBank in Safari (iOS)
2. Tap Share button
3. Tap "Add to Home Screen"
4. Confirm

**Expected Result:**
- ✅ Icon appears on home screen
- ✅ Launch opens full-screen app
- ✅ No Safari UI visible
- ✅ Splash screen shows briefly

#### Test Case 9.3: Offline Functionality
**Steps:**
1. Visit TBank online (first time)
2. Navigate through 2-3 questions
3. Enable airplane mode or disconnect WiFi
4. Refresh page
5. Navigate to different questions

**Expected Result:**
- ✅ Page loads offline
- ✅ All questions accessible
- ✅ Images load from cache
- ✅ Navigation works normally
- ✅ Only limitation: cannot fetch new question banks

**Test on:**
- [ ] iPhone (airplane mode)
- [ ] Android (airplane mode)
- [ ] Desktop (network offline in DevTools)

#### Test Case 9.4: Service Worker Update
**Steps:**
1. Open TBank
2. Keep tab open for 1+ hours
3. Check console for Service Worker messages

**Expected Result:**
- ✅ Service Worker checks for updates every hour
- ✅ If update available, prompts user to refresh
- ✅ After refresh, new version loads

### 10. Sharing

#### Test Case 10.1: Share Results (Mobile)
**Steps:**
1. Answer at least 10 questions
2. Open menu → "End Session & Review"
3. Tap "📤 Share Results" button

**Expected Result (iOS/Android):**
- ✅ Native share sheet appears
- ✅ Share text includes:
  - "TBank Quiz Results 📊"
  - Questions answered
  - Score percentage
  - Streak information
- ✅ Can share to messaging apps, email, etc.

**Expected Result (Desktop):**
- ✅ Results copied to clipboard
- ✅ Toast: "Results copied to clipboard!"

**Test on:**
- [ ] iPhone (native share)
- [ ] Android (native share)
- [ ] Desktop Chrome (clipboard)
- [ ] Desktop Firefox (clipboard)

---

## Regression Testing

### Critical Path Tests
Run these tests before every release:

1. **Welcome Screen Visibility**
   - [ ] Mobile shows gestures, NOT keyboard shortcuts
   - [ ] Desktop shows keyboard shortcuts, NOT gestures
   - [ ] Dark mode works on both platforms

2. **Core Navigation**
   - [ ] Swipe left/right works on mobile
   - [ ] Arrow keys work on desktop
   - [ ] Buttons work on all platforms

3. **Answer Submission**
   - [ ] Single tap + submit button works
   - [ ] Double-tap works on mobile
   - [ ] Enter key works on desktop

4. **Progress Tracking**
   - [ ] Answered questions marked correctly
   - [ ] Correct/incorrect tracked
   - [ ] Percentage calculated accurately

5. **Dark Mode**
   - [ ] Toggles correctly
   - [ ] Persists across page reloads
   - [ ] All elements readable

### Cross-Browser Tests
Test on all major browsers quarterly:

- [ ] Chrome (Windows, macOS, Android)
- [ ] Safari (iOS, macOS)
- [ ] Firefox (Windows, macOS, Android)
- [ ] Edge (Windows, macOS)
- [ ] Samsung Internet (Android)

---

## Accessibility Testing

### Touch Target Sizing (WCAG AAA)

**Minimum sizes:**
- Buttons: 44×44px
- Answer choices: 64px height
- Interactive elements: 44×44px

**Test with:**
- [ ] Fingers (not stylus)
- [ ] Gloves (if possible)
- [ ] Large finger size simulation

### Screen Reader Testing

**iOS VoiceOver:**
1. Enable VoiceOver (Settings → Accessibility)
2. Navigate through question
3. Verify all elements announced correctly

**Expected:**
- [ ] Question text announced
- [ ] Answer choices announced
- [ ] Button labels clear
- [ ] Status messages announced

**Android TalkBack:**
1. Enable TalkBack (Settings → Accessibility)
2. Navigate through question
3. Verify all elements announced correctly

### Keyboard Navigation (Desktop)

**Test without mouse:**
1. Tab through all interactive elements
2. Use arrow keys for navigation
3. Use Enter to submit

**Expected:**
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] All functionality accessible

---

## Performance Testing

### Load Time Metrics

**First Visit (with network):**
- Target: < 2 seconds to interactive
- [ ] Measure: Time to welcome screen render
- [ ] Measure: Time to first question render

**Subsequent Visits (from cache):**
- Target: < 500ms to interactive
- [ ] Measure: Service Worker cache hit
- [ ] Measure: Time to render

**Tools:**
- Chrome DevTools → Lighthouse
- Network tab → Throttling (3G, 4G)
- Performance tab → Record page load

### Runtime Performance

**Swipe Gesture Response Time:**
- Target: < 16ms frame time (60fps)
- [ ] Measure: Transform animation smoothness
- [ ] Measure: No dropped frames during swipe

**Haptic Feedback Latency:**
- Target: < 50ms from user action
- [ ] Measure: Time from tap to vibration
- [ ] Use high-speed camera if needed

### Memory Usage

**Test session:**
1. Answer all 52 questions
2. Navigate back and forth
3. Toggle dark mode multiple times
4. Check for memory leaks

**Expected:**
- [ ] Memory usage stable (no continuous growth)
- [ ] No console errors
- [ ] Smooth performance throughout

**Tools:**
- Chrome DevTools → Memory tab
- Take heap snapshots at intervals
- Compare snapshots for leaks

---

## Issue Reporting

### Bug Report Template

```markdown
**Platform:** iOS 15.7 / Android 12 / Desktop Chrome 120
**Device:** iPhone 12 / Pixel 6 / MacBook Pro
**Browser:** Safari 15.7 / Chrome 120
**Viewport:** 390×844px

**Issue:**
Brief description of the problem

**Steps to Reproduce:**
1. Open TBank
2. Navigate to question 3
3. Swipe left on answer B
4. Observe behavior

**Expected Behavior:**
Answer B should be crossed out with strikethrough

**Actual Behavior:**
Answer B does not respond to swipe gesture

**Screenshots:**
[Attach screenshots if applicable]

**Console Errors:**
[Paste any console errors]

**Additional Context:**
- Dark mode enabled: Yes/No
- Installed as PWA: Yes/No
- Offline: Yes/No
```

### Priority Levels

**P0 - Critical (Fix immediately):**
- App crashes or doesn't load
- Data loss
- Security vulnerabilities
- Complete feature failure on major platform

**P1 - High (Fix in next release):**
- Feature not working as designed on some devices
- UX significantly degraded
- Accessibility blocker

**P2 - Medium (Fix in upcoming sprint):**
- Minor feature issues
- Edge case bugs
- Visual inconsistencies

**P3 - Low (Backlog):**
- Nice-to-have improvements
- Minor visual tweaks
- Enhancement requests

---

## Testing Schedule

### Pre-Release (Every PR)
- [ ] Quick test (5 min)
- [ ] Critical path tests (15 min)
- [ ] Affected feature tests (varies)

### Release Candidate (Before merge to main)
- [ ] Full feature test suite (60-90 min)
- [ ] Cross-browser tests (30 min)
- [ ] Accessibility spot check (15 min)

### Quarterly (Every 3 months)
- [ ] Complete test suite (2-3 hours)
- [ ] Performance benchmarks
- [ ] Cross-browser comprehensive
- [ ] Accessibility audit
- [ ] Device lab testing (real devices)

### Annual (Yearly)
- [ ] Full accessibility audit
- [ ] Security penetration testing
- [ ] Performance optimization review
- [ ] User testing sessions

---

## Automated Testing (Future)

### Recommended Tools

**Visual Regression:**
- Percy.io or BackstopJS
- Screenshot comparisons
- Cross-browser screenshots

**End-to-End:**
- Playwright or Cypress
- Automated user flows
- Mobile device simulation

**Accessibility:**
- axe DevTools
- Pa11y CI
- WAVE browser extension

### Test Coverage Goals

**Phase 1 (Current):**
- ✅ Manual testing documented
- ✅ Critical path identified

**Phase 2 (Next):**
- [ ] Visual regression for welcome screen
- [ ] E2E tests for critical paths
- [ ] Automated accessibility scans

**Phase 3 (Future):**
- [ ] Full E2E test suite
- [ ] Performance budgets
- [ ] Continuous accessibility testing

---

## Appendix

### Device Testing Checklist

**iOS Devices:**
- [ ] iPhone SE (2020) - 375×667px
- [ ] iPhone 12/13 - 390×844px
- [ ] iPhone 14 Pro Max - 428×926px
- [ ] iPad Mini - 768×1024px

**Android Devices:**
- [ ] Pixel 4a - 360×800px
- [ ] Pixel 6 - 412×915px
- [ ] Samsung Galaxy S21 - 384×854px
- [ ] Tablet 10" - 800×1280px

**Desktop Browsers:**
- [ ] Chrome 120+ (Windows)
- [ ] Firefox 120+ (Windows)
- [ ] Safari 17+ (macOS)
- [ ] Edge 120+ (Windows)

### Testing Tools

**Mobile Emulation:**
- Chrome DevTools → Device Mode
- Safari → Responsive Design Mode
- BrowserStack (cloud testing)
- LambdaTest (cloud testing)

**Performance:**
- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance panel

**Accessibility:**
- axe DevTools browser extension
- WAVE browser extension
- iOS VoiceOver
- Android TalkBack

**Visual Regression:**
- Percy.io
- BackstopJS
- Chromatic

---

**Last Updated:** 2025-11-08
**Maintained By:** TBank Development Team
**Version:** 1.0.0
