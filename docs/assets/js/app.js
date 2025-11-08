(function () {
  // Constants
  const CONSTANTS = {
    DEFAULT_TIMER_DURATION: 90,
    KEYBOARD_HINT_DELAY: 2000,
    KEYBOARD_HINT_DISPLAY: 4000,
    TOAST_DURATION: 3000,
    TOAST_FADE_IN: 100,
    TOAST_FADE_OUT: 300,
    STREAK_ANIMATION_DELAY: 600,
    MILESTONE_ANIMATION_DELAY: 800,
    TIME_EXPIRED_DELAY: 1500,
    TIMER_WARNING_THRESHOLD: 10,
    STREAK_MILESTONES: [3, 5, 10],
    QUESTION_MILESTONES: [10, 25, 40, 52]
  };

  // Security helper - sanitize HTML to prevent XSS
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Haptic feedback engine for iOS/mobile devices
  const HapticEngine = {
    isSupported: 'vibrate' in navigator && typeof navigator.vibrate === 'function',
    enabled: localStorage.getItem('hapticsEnabled') !== 'false', // Default true for backwards compatibility

    // Try to vibrate, with error handling
    _vibrate: function(pattern) {
      if (!this.isSupported || !this.enabled) return false;

      try {
        return navigator.vibrate(pattern);
      } catch (e) {
        console.warn('[Haptic] Vibration failed:', e);
        return false;
      }
    },

    // Light tap feedback (10ms) - for selections, toggles
    light: function() {
      this._vibrate(10);
    },

    // Medium tap feedback (20ms) - for confirmations
    medium: function() {
      this._vibrate(20);
    },

    // Success pattern - for correct answers, achievements
    success: function() {
      this._vibrate([15, 50, 20]);
    },

    // Error pattern - for incorrect answers
    error: function() {
      this._vibrate([10, 40, 10, 40, 10]);
    },

    // Warning pattern - for timer warnings
    warning: function() {
      this._vibrate(200);
    },

    // Celebration pattern - for milestones
    celebration: function() {
      this._vibrate([20, 60, 20, 60, 30]);
    },

    // Subtle feedback - for navigation, minimal disruption (5ms)
    subtle: function() {
      this._vibrate(5);
    }
  };

  // Global swipe management state
  let swipesEnabled = true;

  // Disable/enable swipes globally (useful for modals)
  function setSwipesEnabled(enabled) {
    swipesEnabled = enabled;
  }

  // Swipe gesture detection for mobile
  function initSwipeGesture(element, options = {}) {
    // Skip if already initialized (prevent duplicate listeners)
    if (element._swipeInitialized) {
      return;
    }
    element._swipeInitialized = true;

    const minSwipeDistance = options.minDistance || 60;
    const maxVerticalDistance = options.maxVerticalDistance || 80;
    const threshold = options.threshold || 30;
    const excludeSelectors = options.excludeSelectors || []; // Elements to ignore

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;
    let touchStartTarget = null;

    const handleTouchStart = (e) => {
      // Check if swipes are globally disabled
      if (!swipesEnabled) {
        touchStartTarget = null;
        return;
      }

      // Check if touch started on an excluded element or any modal
      touchStartTarget = e.target;
      if (touchStartTarget.closest('.modal:not([hidden])') ||
          touchStartTarget.closest('.tour-overlay') ||
          touchStartTarget.closest('.highlight-toolbar')) {
        touchStartTarget = null;
        return;
      }

      if (excludeSelectors.length > 0) {
        for (const selector of excludeSelectors) {
          if (touchStartTarget.closest(selector)) {
            touchStartTarget = null; // Ignore this swipe
            return;
          }
        }
      }

      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = false;
    };

    const handleTouchMove = (e) => {
      if (!touchStartTarget) return; // Skip if started on excluded element

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Only track horizontal swipes (not vertical scrolls)
      if (Math.abs(deltaX) > threshold && deltaY < maxVerticalDistance) {
        isSwiping = true;
        element.classList.add('swiping');

        // Show visual hints
        if (deltaX < -threshold) {
          element.classList.add('swipe-left-hint');
          element.classList.remove('swipe-right-hint');
        } else if (deltaX > threshold) {
          element.classList.add('swipe-right-hint');
          element.classList.remove('swipe-left-hint');
        }

        // Apply transform to follow finger
        element.style.transform = `translateX(${deltaX * 0.3}px)`;
      }
    };

    const handleTouchEnd = (e) => {
      if (!touchStartTarget) return; // Skip if started on excluded element

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Reset visual state
      element.classList.remove('swiping', 'swipe-left-hint', 'swipe-right-hint');
      element.style.transform = '';

      // Only trigger if it's a valid swipe
      if (!isSwiping || deltaY > maxVerticalDistance) {
        touchStartTarget = null;
        return;
      }

      // Swipe left
      if (deltaX < -minSwipeDistance) {
        if (options.onSwipeLeft) {
          options.onSwipeLeft(element);
        }
      }
      // Swipe right
      else if (deltaX > minSwipeDistance) {
        if (options.onSwipeRight) {
          options.onSwipeRight(element);
        }
      }

      touchStartTarget = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Store cleanup function
    element._swipeCleanup = () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element._swipeInitialized = false;
      delete element._swipeCleanup;
    };
  }

  // Cleanup swipe gestures for an element
  function _cleanupSwipeGesture(element) {
    if (element._swipeCleanup) {
      element._swipeCleanup();
    }
  }

  // State management
  const STATE_VERSION = 1; // Increment when state structure changes
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = {}; // { questionIndex: { selected: 'A', submitted: true, correct: true, timeSpent: 45, flagged: false, eliminated: [], highlights: [] } }
  let showWelcome = true; // Show welcome screen on first load
  let keyboardHintShown = false; // Track if keyboard hint was shown
  let currentStreak = 0; // Track consecutive correct answers
  let bestStreak = 0; // Track best streak
  let milestonesShown = []; // Track which milestones have been shown

  // Timer state (load from localStorage if available)
  let timedMode = localStorage.getItem('timedMode') === 'true';
  let timerDuration = parseInt(localStorage.getItem('timerDuration')) || CONSTANTS.DEFAULT_TIMER_DURATION; // seconds per question
  let currentTimer = null;
  let timerSeconds = 0;
  let timerPaused = false;
  let questionStartTime = null;

  // Dark mode state
  let darkModeEnabled = false;

  // Pull-to-refresh state (load from localStorage if available)
  let pullToRefreshEnabled = localStorage.getItem('pullToRefresh') === 'true';

  // Haptic feedback state (load from localStorage, default true)
  let hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false';

  // Highlighting state
  let highlightToolbar = null;
  let currentSelection = null;

  // DOM elements
  const questionDisplay = document.getElementById('question-display');
  const questionCounter = document.getElementById('question-counter');
  const progressBar = document.getElementById('progress-bar');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const skipBtn = document.getElementById('skip-btn');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const questionMenu = document.getElementById('question-menu');
  const questionGrid = document.getElementById('question-grid');
  const answeredCount = document.getElementById('answered-count');
  const correctCount = document.getElementById('correct-count');
  const percentageDisplay = document.getElementById('percentage');
  const showAllBtn = document.getElementById('show-all-btn');
  const showIncorrectBtn = document.getElementById('show-incorrect-btn');
  const showUnansweredBtn = document.getElementById('show-unanswered-btn');
  const showFlaggedBtn = document.getElementById('show-flagged-btn');
  const topicMasterySection = document.getElementById('topic-mastery');
  const topicList = document.getElementById('topic-list');

  // Issue #7: Search elements
  const questionSearch = document.getElementById('question-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const searchResultsCount = document.getElementById('search-results-count');

  // New feature elements
  const timerDisplay = document.getElementById('timer-display');
  const timerText = document.getElementById('timer-text');
  const timerToggleBtn = document.getElementById('timer-toggle');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const pullToRefreshToggle = document.getElementById('pull-to-refresh-toggle');
  const hapticFeedbackToggle = document.getElementById('haptic-feedback-toggle');
  const timedModeToggle = document.getElementById('timed-mode-toggle');
  const timerDurationInput = document.getElementById('timer-duration');
  const timerDurationGroup = document.getElementById('timer-duration-group');
  const settingsSaveBtn = document.getElementById('settings-save');
  const endSessionBtn = document.getElementById('end-session-btn');
  const exportNotesBtn = document.getElementById('export-notes-btn');
  const resetProgressBtn = document.getElementById('reset-progress-btn');
  const sessionSummaryModal = document.getElementById('session-summary-modal');
  const summaryContent = document.getElementById('summary-content');
  const summaryClose = document.getElementById('summary-close');
  const summaryShare = document.getElementById('summary-share');
  const summaryContinue = document.getElementById('summary-continue');
  const summaryReset = document.getElementById('summary-reset');

  // Save quiz state to localStorage (Issue #2 - Progress persistence)
  let lastSaveNotification = 0;
  function saveState(showNotification = false) {
    try {
      const state = {
        version: STATE_VERSION,
        timestamp: Date.now(),
        currentQuestionIndex,
        userAnswers,
        showWelcome,
        keyboardHintShown,
        currentStreak,
        bestStreak,
        milestonesShown
      };

      localStorage.setItem('quizState', JSON.stringify(state));
      console.debug('[State] Progress saved');

      // Show subtle save notification (Issue #2) - throttled to avoid spam
      const now = Date.now();
      if (showNotification && (now - lastSaveNotification > 3000)) {
        lastSaveNotification = now;
        showToast('✓ Progress auto-saved', 'success');
      }
    } catch (error) {
      console.warn('[State] Failed to save progress:', error);
      // Fail silently - don't disrupt user experience
    }
  }

  // Load quiz state from localStorage
  function loadState() {
    try {
      const savedState = localStorage.getItem('quizState');
      if (!savedState) {
        console.info('[State] No saved progress found');
        return false;
      }

      const state = JSON.parse(savedState);

      // Check version compatibility
      if (state.version !== STATE_VERSION) {
        console.warn('[State] Saved state version mismatch, resetting');
        localStorage.removeItem('quizState');
        return false;
      }

      // Restore state
      currentQuestionIndex = state.currentQuestionIndex || 0;
      userAnswers = state.userAnswers || {};
      showWelcome = state.showWelcome !== undefined ? state.showWelcome : true;
      keyboardHintShown = state.keyboardHintShown || false;
      currentStreak = state.currentStreak || 0;
      bestStreak = state.bestStreak || 0;
      milestonesShown = state.milestonesShown || [];

      const ageInDays = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
      console.info(`[State] Loaded progress from ${ageInDays.toFixed(1)} days ago`);

      return true;
    } catch (error) {
      console.warn('[State] Failed to load progress:', error);
      localStorage.removeItem('quizState');
      return false;
    }
  }

  // Clear saved state
  function clearState() {
    try {
      localStorage.removeItem('quizState');
      console.info('[State] Progress cleared');
    } catch (error) {
      console.warn('[State] Failed to clear progress:', error);
    }
  }

  // Validate question data structure
  function validateQuestions(data) {
    const errors = [];

    // Validate top-level structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format: expected object');
    }

    if (!data.questionBank || typeof data.questionBank !== 'object') {
      throw new Error('Invalid data format: missing questionBank');
    }

    if (!Array.isArray(data.questionBank.questions)) {
      throw new Error('Invalid data format: questions must be an array');
    }

    const questions = data.questionBank.questions;

    // Validate each question
    questions.forEach((question, index) => {
      const qNum = index + 1;

      // Required fields
      if (!question.questionText || typeof question.questionText !== 'string') {
        errors.push(`Question ${qNum}: missing or invalid questionText`);
      }

      if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
        errors.push(`Question ${qNum}: missing or invalid correctAnswer`);
      }

      // Validate answer choices
      if (!Array.isArray(question.answerChoices) || question.answerChoices.length !== 5) {
        errors.push(`Question ${qNum}: must have exactly 5 answer choices`);
      } else {
        const letters = new Set();
        let correctCount = 0;

        question.answerChoices.forEach((choice, cIndex) => {
          if (!choice.letter || typeof choice.letter !== 'string') {
            errors.push(`Question ${qNum}, Choice ${cIndex + 1}: missing or invalid letter`);
          } else {
            if (letters.has(choice.letter)) {
              errors.push(`Question ${qNum}: duplicate letter "${choice.letter}"`);
            }
            letters.add(choice.letter);
          }

          if (!choice.text || typeof choice.text !== 'string') {
            errors.push(`Question ${qNum}, Choice ${cIndex + 1}: missing or invalid text`);
          }

          if (typeof choice.isCorrect !== 'boolean') {
            errors.push(`Question ${qNum}, Choice ${cIndex + 1}: missing or invalid isCorrect`);
          } else if (choice.isCorrect) {
            correctCount++;
          }
        });

        // Validate exactly one correct answer
        if (correctCount !== 1) {
          errors.push(`Question ${qNum}: must have exactly one correct answer (found ${correctCount})`);
        }

        // Validate correctAnswer matches a choice letter
        if (question.correctAnswer && !letters.has(question.correctAnswer)) {
          errors.push(`Question ${qNum}: correctAnswer "${question.correctAnswer}" does not match any choice letter`);
        }
      }
    });

    if (errors.length > 0) {
      console.error('[Validation] Question validation failed:', errors);
      throw new Error(`Question validation failed: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more)` : ''}`);
    }

    return true;
  }

  // Retry helper with exponential backoff
  async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isNetworkError = error.name === 'TypeError' || error.message.includes('fetch');

        // Don't retry non-network errors
        if (!isNetworkError || isLastAttempt) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Load questions from JSON
  async function loadQuestions(isRetry = false) {
    // Show loading indicator
    questionDisplay.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <div class="loading-spinner"></div>
        <p>${isRetry ? 'Retrying...' : 'Loading questions...'}</p>
      </div>
    `;

    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch('assets/question_banks/all_questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        return await response.json();
      });

      // Validate question data structure
      validateQuestions(data);

      questions = data.questionBank.questions;
      console.info(`[App] Loaded and validated ${questions.length} questions`);
      initializeQuiz();
    } catch (error) {
      console.error('Failed to load questions:', error);
      let errorMessage;
      let showRetryButton = false;

      if (error.message && error.message.includes('validation')) {
        errorMessage = 'Question data is malformed. Please contact support.';
      } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        showRetryButton = true;
      } else {
        errorMessage = 'Error loading questions. Please try refreshing the page.';
        showRetryButton = true;
      }

      questionDisplay.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <p class="error">${escapeHtml(errorMessage)}</p>
          ${showRetryButton ? '<button id="retry-load-btn" class="button-primary" style="margin-top: 1rem;">Retry</button>' : ''}
        </div>
      `;

      // Add retry button listener
      if (showRetryButton) {
        document.getElementById('retry-load-btn')?.addEventListener('click', () => {
          loadQuestions(true);
        });
      }
    }
  }

  // Initialize quiz
  function initializeQuiz() {
    if (questions.length === 0) return;

    // Load saved state before building grid
    const stateLoaded = loadState();

    buildQuestionGrid();

    // Show welcome screen or go straight to questions
    if (showWelcome) {
      renderWelcomeScreen();
    } else {
      renderQuestion();

      // Show toast if resuming from saved state
      if (stateLoaded && Object.keys(userAnswers).length > 0) {
        const answered = Object.values(userAnswers).filter(a => a.submitted).length;
        setTimeout(() => {
          showToast(`✓ Resumed session (${answered} questions answered)`, 'success');
        }, 500);
      }
    }
  }

  // Render welcome screen
  function renderWelcomeScreen() {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

    const controlsHint = isMobile ? `
      <div class="mobile-gestures">
        <p><strong>Mobile Gestures:</strong></p>
        <p>👆 Swipe questions left/right to navigate</p>
        <p>👆 Swipe answers left to eliminate, right to restore</p>
        <p>👆 Double-tap an answer to select & submit</p>
        <p>👆 Long-press flag button for quick navigation</p>
      </div>
    ` : `
      <div class="keyboard-shortcuts">
        <p><strong>Keyboard shortcuts:</strong></p>
        <p>← → Navigate questions  •  Enter Submit answer</p>
      </div>
    `;

    const html = `
      <div class="welcome-screen">
        <div class="welcome-content">
          <h1>Welcome to TBank</h1>
          <p class="welcome-subtitle">Congenital Heart Disease Question Bank</p>

          <div class="welcome-stats">
            <div class="stat-item">
              <span class="stat-number">${questions.length}</span>
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

          <div class="welcome-features">
            <div class="welcome-feature">⏱️ Optional timed mode</div>
            <div class="welcome-feature">🚩 Flag questions for review</div>
            <div class="welcome-feature">📊 Detailed performance analytics</div>
          </div>

          <div class="welcome-actions">
            <button class="welcome-start-btn" id="start-test-btn">
              Start Test
            </button>
            <button class="welcome-tour-btn" id="start-tour-btn">
              📱 Take a Tour
            </button>
          </div>

          ${controlsHint}
        </div>
      </div>
    `;

    questionDisplay.innerHTML = html;

    // Hide navigation buttons on welcome screen
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';

    // Add event listeners
    document.getElementById('start-test-btn').addEventListener('click', startTest);
    document.getElementById('start-tour-btn').addEventListener('click', startTour);
  }

  // Start the test
  function startTest() {
    showWelcome = false;
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'inline-block';
    renderQuestion();

    // Show keyboard hint after a moment
    setTimeout(showKeyboardHint, CONSTANTS.KEYBOARD_HINT_DELAY);
  }

  // Interactive tutorial system
  function startTour() {
    const tourSteps = [
      {
        title: 'Welcome to TBank! 👋',
        content: 'TBank is optimized for mobile learning with advanced features designed to enhance your study experience. Let\'s explore what makes it special!',
        highlight: null,
        screenshot: null
      },
      {
        title: 'Dark Mode 🌙',
        content: `Study comfortably day or night with automatic dark mode.<br><br>
                  <strong>Features:</strong><br>
                  • Automatic system theme detection<br>
                  • Manual toggle in ⚙️ Settings<br>
                  • Easy on the eyes for long study sessions`,
        highlight: '#settings-btn',
        screenshot: '⚙️'
      },
      {
        title: 'Haptic Feedback 📳',
        content: `Feel the difference with intelligent haptic feedback:<br><br>
                  <strong>Vibrations for:</strong><br>
                  • Answer selection (light tap)<br>
                  • Correct answers (success pattern)<br>
                  • Incorrect answers (error pattern)<br>
                  • Streaks & milestones (celebration)<br>
                  • Timer warnings (alert vibration)`,
        highlight: null,
        screenshot: '📳'
      },
      {
        title: 'Advanced Gestures 👆',
        content: `Navigate effortlessly with touch gestures:<br><br>
                  <strong>Swipe left/right on question:</strong> Navigate<br>
                  <strong>Swipe left on answer:</strong> Cross out (eliminate)<br>
                  <strong>Swipe right:</strong> Undo elimination<br>
                  <strong>Double-tap answer:</strong> Select & submit<br>
                  <strong>Long-press flag button:</strong> Quick navigation menu`,
        highlight: null,
        screenshot: '👆'
      },
      {
        title: 'Pull-to-Refresh 🔄',
        content: `Want to practice in random order?<br><br>
                  <strong>How to use:</strong><br>
                  1. Enable in ⚙️ Settings<br>
                  2. Pull down at top of question<br>
                  3. Release to randomize all questions<br><br>
                  Your progress is preserved!`,
        highlight: '#settings-btn',
        screenshot: '🔄'
      },
      {
        title: 'Share Your Progress 📤',
        content: `Celebrate your achievements!<br><br>
                  After completing questions, use the share button to:<br>
                  • Share results with study partners<br>
                  • Track your improvement<br>
                  • Motivate yourself and others<br><br>
                  Uses native mobile sharing (or clipboard on desktop)`,
        highlight: null,
        screenshot: '📤'
      },
      {
        title: 'Question Menu ☰',
        content: `Quick access to all features:<br><br>
                  • View all questions at a glance<br>
                  • Filter by answered/unanswered/flagged<br>
                  • See your progress and accuracy<br>
                  • End session to review results<br>
                  • Reset progress anytime`,
        highlight: '#menu-toggle',
        screenshot: '☰'
      },
      {
        title: 'Install as App 📱',
        content: `For the best experience, install TBank:<br><br>
                  <strong>On iPhone:</strong><br>
                  Safari → Share → Add to Home Screen<br><br>
                  <strong>On Android:</strong><br>
                  Chrome → Menu → Install App<br><br>
                  Works offline after installation!`,
        highlight: null,
        screenshot: '📱'
      },
      {
        title: 'Ready to Begin! 🚀',
        content: `You're all set to start learning!<br><br>
                  <strong>Quick Tips:</strong><br>
                  • Use timed mode for exam practice<br>
                  • Flag difficult questions for review<br>
                  • Check explanations for every answer<br>
                  • Track your progress in the menu<br><br>
                  Good luck with your studies!`,
        highlight: null,
        screenshot: '🎓'
      }
    ];

    let currentStep = 0;

    function showTourStep(stepIndex) {
      const step = tourSteps[stepIndex];

      // Remove any existing highlights
      document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

      // Create tour overlay
      const overlay = document.createElement('div');
      overlay.className = 'tour-overlay';
      overlay.innerHTML = `
        <div class="tour-modal">
          <div class="tour-header">
            <span class="tour-step-indicator">Step ${stepIndex + 1} of ${tourSteps.length}</span>
            <button class="tour-close" aria-label="Close tour">&times;</button>
          </div>
          <div class="tour-content">
            ${step.screenshot ? `<div class="tour-icon">${step.screenshot}</div>` : ''}
            <h2>${step.title}</h2>
            <div class="tour-description">${step.content}</div>
          </div>
          <div class="tour-footer">
            <button class="tour-btn tour-btn-secondary" id="tour-skip">Skip Tour</button>
            <div class="tour-nav-buttons">
              ${stepIndex > 0 ? '<button class="tour-btn tour-btn-secondary" id="tour-prev">← Previous</button>' : ''}
              <button class="tour-btn tour-btn-primary" id="tour-next">
                ${stepIndex < tourSteps.length - 1 ? 'Next →' : 'Start Test!'}
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Highlight element if specified
      if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
          element.classList.add('tour-highlight');
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Add event listeners
      overlay.querySelector('.tour-close').addEventListener('click', () => {
        HapticEngine.light();
        closeTour(overlay);
      });

      overlay.querySelector('#tour-skip').addEventListener('click', () => {
        HapticEngine.light();
        closeTour(overlay);
      });

      const prevBtn = overlay.querySelector('#tour-prev');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          HapticEngine.light();
          currentStep--;
          overlay.remove();
          showTourStep(currentStep);
        });
      }

      overlay.querySelector('#tour-next').addEventListener('click', () => {
        HapticEngine.medium();
        currentStep++;
        overlay.remove();

        if (currentStep >= tourSteps.length) {
          // Tour complete, start the test
          localStorage.setItem('tourCompleted', 'true');
          closeTour();
          startTest();
        } else {
          showTourStep(currentStep);
        }
      });

      // Show with animation
      setTimeout(() => overlay.classList.add('show'), 10);
    }

    function closeTour(overlay) {
      document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
      if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
      } else {
        document.querySelectorAll('.tour-overlay').forEach(el => {
          el.classList.remove('show');
          setTimeout(() => el.remove(), 300);
        });
      }
    }

    // Start the tour
    showTourStep(0);
  }

  // Show keyboard hint toast (desktop only)
  function showKeyboardHint() {
    if (keyboardHintShown) return;

    // Don't show keyboard hints on mobile/touch devices
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    if (isMobile) return;

    keyboardHintShown = true;
    showToast('💡 Tip: Use ← → arrow keys to navigate', 'info');
  }

  // Build question grid for menu
  function buildQuestionGrid() {
    questionGrid.innerHTML = '';
    questions.forEach((q, index) => {
      const btn = document.createElement('button');
      btn.className = 'grid-question-btn';
      btn.textContent = index + 1;

      // Add flag indicator if question is flagged
      if (userAnswers[index]?.flagged) {
        const flagIcon = document.createElement('span');
        flagIcon.className = 'grid-flag-icon';
        flagIcon.textContent = '🚩';
        btn.appendChild(flagIcon);
      }

      // Issue #6: Add note indicator if question has a note
      if (loadNote(index)) {
        const noteIcon = document.createElement('span');
        noteIcon.className = 'grid-note-icon';
        noteIcon.textContent = '📝';
        noteIcon.setAttribute('aria-label', 'Has note');
        btn.appendChild(noteIcon);
      }

      btn.onclick = () => jumpToQuestion(index);
      questionGrid.appendChild(btn);
    });
  }

  // Timer functions
  function startTimer() {
    if (!timedMode || currentTimer) return;

    timerSeconds = timerDuration;
    questionStartTime = Date.now();
    updateTimerDisplay();

    currentTimer = setInterval(() => {
      if (!timerPaused) {
        timerSeconds--;
        updateTimerDisplay();

        // Warning at threshold
        if (timerSeconds === CONSTANTS.TIMER_WARNING_THRESHOLD) {
          timerDisplay.classList.add('timer-warning');
          HapticEngine.warning(); // Warning haptic at 10 seconds
        }

        // Time's up
        if (timerSeconds <= 0) {
          stopTimer();
          handleTimeExpired();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
    // Issue #8: Remove all timer warning classes
    timerDisplay.classList.remove('timer-warning', 'timer-caution');

    // Record time spent if question is being submitted
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      if (!userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex] = {};
      }
      userAnswers[currentQuestionIndex].timeSpent = timeSpent;
      questionStartTime = null;
    }
  }

  function pauseTimer() {
    timerPaused = true;
    timerToggleBtn.textContent = '▶';
    timerToggleBtn.setAttribute('aria-label', 'Resume timer');
    timerToggleBtn.setAttribute('aria-pressed', 'true'); // Issue #10: Update ARIA pressed state
  }

  function resumeTimer() {
    timerPaused = false;
    timerToggleBtn.textContent = '⏸';
    timerToggleBtn.setAttribute('aria-label', 'Pause timer');
    timerToggleBtn.setAttribute('aria-pressed', 'false'); // Issue #10: Update ARIA pressed state
  }

  // Issue #8: Enhanced timer display with color warnings
  function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Add color states based on remaining time (Issue #8)
    timerDisplay.classList.remove('timer-caution', 'timer-warning');

    if (timerSeconds <= CONSTANTS.TIMER_WARNING_THRESHOLD) {
      // Critical: 10 seconds or less - red with pulse
      timerDisplay.classList.add('timer-warning');
    } else if (timerSeconds <= 30) {
      // Caution: 30 seconds or less - yellow
      timerDisplay.classList.add('timer-caution');
    }
    // Normal: more than 30 seconds - default gray
  }

  function handleTimeExpired() {
    // Auto-submit if an answer is selected, otherwise just mark as skipped
    const answer = userAnswers[currentQuestionIndex];
    if (answer?.selected && !answer.submitted) {
      handleSubmit();
    } else {
      showToast('⏰ Time expired! Moving to next question', 'warning');
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          goToNext();
        }
      }, CONSTANTS.TIME_EXPIRED_DELAY);
    }
  }

  // Toggle flag on current question
  function toggleFlag() {
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = {};
    }
    userAnswers[currentQuestionIndex].flagged = !userAnswers[currentQuestionIndex].flagged;
    HapticEngine.light(); // Light haptic for flag toggle
    saveState(); // Save state when flagging
    renderQuestion();
    updateQuestionGrid();
  }

  // Pull-to-refresh functionality for question display
  function initPullToRefresh() {
    const questionDisplay = document.getElementById('question-display');
    let pullStartY = 0;
    let pullStartTime = 0;
    let pulling = false;
    let pullIndicator = null;

    // Create pull indicator
    function createPullIndicator() {
      if (!pullIndicator) {
        pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-indicator';
        pullIndicator.innerHTML = '<div class="pull-icon">↻</div><div class="pull-text">Pull to randomize questions</div>';
        questionDisplay.insertBefore(pullIndicator, questionDisplay.firstChild);
      }
      return pullIndicator;
    }

    // Update pull indicator based on distance
    function updatePullIndicator(distance) {
      const indicator = createPullIndicator();
      const threshold = 120; // Increased from 80px to 120px
      const percentage = Math.min((distance / threshold) * 100, 100);

      indicator.style.height = `${Math.min(distance, threshold)}px`;
      indicator.style.opacity = percentage / 100;

      const icon = indicator.querySelector('.pull-icon');
      icon.style.transform = `rotate(${percentage * 3.6}deg)`;

      if (percentage >= 100) {
        indicator.classList.add('ready');
        indicator.querySelector('.pull-text').textContent = 'Release to randomize';
      } else {
        indicator.classList.remove('ready');
        indicator.querySelector('.pull-text').textContent = 'Pull to randomize questions';
      }
    }

    // Handle touch start
    questionDisplay.addEventListener('touchstart', (e) => {
      // Only activate if feature is enabled, at top of scroll, and not already pulling
      if (pullToRefreshEnabled && questionDisplay.scrollTop === 0 && !pulling) {
        pullStartY = e.touches[0].clientY;
        pullStartTime = Date.now();
      }
    }, { passive: false });

    // Handle touch move
    questionDisplay.addEventListener('touchmove', (e) => {
      // Only proceed if enabled and started from top
      if (!pullToRefreshEnabled || pullStartY === 0) return;

      if (questionDisplay.scrollTop === 0) {
        const pullDistance = e.touches[0].clientY - pullStartY;

        // Prevent browser's pull-to-refresh when pulling down at top
        if (pullDistance > 0) {
          e.preventDefault();
        }

        // Only start showing indicator after 40px pull (prevents accidental triggers)
        if (pullDistance > 40) {
          pulling = true;
          updatePullIndicator(pullDistance - 40); // Offset by 40px
        }
      }
    }, { passive: false });

    // Handle touch end
    questionDisplay.addEventListener('touchend', (_e) => {
      if (pulling && pullIndicator) {
        const threshold = 120;
        const currentHeight = parseInt(pullIndicator.style.height) || 0;
        const pullDuration = Date.now() - pullStartTime;

        // Require threshold AND minimum duration (300ms prevents quick accidental swipes)
        if (currentHeight >= threshold && pullDuration >= 300) {
          // Trigger randomize
          HapticEngine.success();
          pullIndicator.classList.add('triggered');
          pullIndicator.querySelector('.pull-text').textContent = 'Randomizing...';

          setTimeout(() => {
            randomizeQuestions();
            removePullIndicator();
          }, 500);
        } else {
          removePullIndicator();
        }
      }

      pullStartY = 0;
      pullStartTime = 0;
      pulling = false;
    });

    // Remove pull indicator
    function removePullIndicator() {
      if (pullIndicator) {
        pullIndicator.classList.add('hiding');
        setTimeout(() => {
          if (pullIndicator && pullIndicator.parentNode) {
            pullIndicator.remove();
            pullIndicator = null;
          }
        }, 300);
      }
    }

    // Additional prevention: block browser pull-to-refresh on document level
    // This prevents browser refresh when user is at the top of the page
    let docTouchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      if (pullToRefreshEnabled && (window.scrollY === 0 || document.body.scrollTop === 0 || questionDisplay.scrollTop === 0)) {
        docTouchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (pullToRefreshEnabled && docTouchStartY > 0) {
        const touchY = e.touches[0].clientY;
        const pullDistance = touchY - docTouchStartY;

        // Prevent browser pull-to-refresh when pulling down while at page top
        if (pullDistance > 0 && (window.scrollY === 0 || document.body.scrollTop === 0 || questionDisplay.scrollTop === 0)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      docTouchStartY = 0;
    }, { passive: true });
  }

  // Randomize question order
  function randomizeQuestions() {
    // Fisher-Yates shuffle algorithm
    const shuffledIndices = [...Array(questions.length).keys()];
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    // Create a mapping from old indices to new indices
    const newUserAnswers = {};
    shuffledIndices.forEach((oldIndex, newIndex) => {
      if (userAnswers[oldIndex]) {
        // Deep copy to avoid shared array references
        const oldAnswer = userAnswers[oldIndex];
        newUserAnswers[newIndex] = {
          ...oldAnswer,
          // Deep copy arrays only if they exist, preserving undefined if not
          eliminated: oldAnswer.eliminated ? [...oldAnswer.eliminated] : oldAnswer.eliminated,
          highlights: oldAnswer.highlights ? [...oldAnswer.highlights] : oldAnswer.highlights
        };
      }
    });

    // Shuffle the questions array
    const shuffledQuestions = shuffledIndices.map(i => questions[i]);
    questions.splice(0, questions.length, ...shuffledQuestions);

    // Update user answers with new indices
    userAnswers = newUserAnswers;

    // Reset to first question
    currentQuestionIndex = 0;

    // Save state after randomization
    saveState();

    // Re-render
    renderQuestion();
    updateQuestionGrid();

    showToast('🔀 Questions randomized!', 'success');
  }

  // Show quick navigation menu (long-press on flag button)
  function showQuickNavMenu() {
    // Find next unanswered question
    const nextUnanswered = questions.findIndex((q, idx) =>
      idx > currentQuestionIndex && !userAnswers[idx]?.submitted
    );

    // Find next flagged question
    const nextFlagged = questions.findIndex((q, idx) =>
      idx > currentQuestionIndex && userAnswers[idx]?.flagged
    );

    // Find next incorrect question
    const nextIncorrect = questions.findIndex((q, idx) =>
      idx > currentQuestionIndex && userAnswers[idx]?.submitted && !userAnswers[idx]?.correct
    );

    // Build menu options
    const options = [];
    if (nextUnanswered !== -1) {
      options.push({
        label: `Jump to next unanswered (Q${nextUnanswered + 1})`,
        action: () => jumpToQuestion(nextUnanswered)
      });
    }
    if (nextFlagged !== -1) {
      options.push({
        label: `Jump to next flagged (Q${nextFlagged + 1})`,
        action: () => jumpToQuestion(nextFlagged)
      });
    }
    if (nextIncorrect !== -1) {
      options.push({
        label: `Jump to next incorrect (Q${nextIncorrect + 1})`,
        action: () => jumpToQuestion(nextIncorrect)
      });
    }

    // If no options available, just show a message
    if (options.length === 0) {
      showToast('No more questions to jump to', 'info');
      return;
    }

    // Create and show menu
    const menu = document.createElement('div');
    menu.className = 'quick-nav-menu';
    menu.innerHTML = `
      <div class="quick-nav-header">
        <span>Quick Navigation</span>
        <button class="quick-nav-close" aria-label="Close">&times;</button>
      </div>
      <div class="quick-nav-options">
        ${options.map((opt, idx) => `
          <button class="quick-nav-option" data-index="${idx}">${opt.label}</button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(menu);

    // Add event listeners
    const closeBtn = menu.querySelector('.quick-nav-close');
    closeBtn.addEventListener('click', () => {
      HapticEngine.light();
      menu.classList.remove('show');
      setTimeout(() => menu.remove(), 300);
    });

    menu.querySelectorAll('.quick-nav-option').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        HapticEngine.medium();
        options[idx].action();
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 300);
      });
    });

    // Close on backdrop click
    menu.addEventListener('click', (e) => {
      if (e.target === menu) {
        HapticEngine.light();
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 300);
      }
    });

    // Show with animation
    setTimeout(() => menu.classList.add('show'), 10);
  }

  // Toggle elimination of an answer choice
  function toggleElimination(letter) {
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = {};
    }
    if (!userAnswers[currentQuestionIndex].eliminated) {
      userAnswers[currentQuestionIndex].eliminated = [];
    }

    const eliminated = userAnswers[currentQuestionIndex].eliminated;
    const index = eliminated.indexOf(letter);

    if (index > -1) {
      // Remove from eliminated
      eliminated.splice(index, 1);
    } else {
      // Add to eliminated
      eliminated.push(letter);
    }

    HapticEngine.light(); // Light haptic for elimination toggle
    saveState(); // Save state when eliminating answers

    renderQuestion();
  }

  // Text highlighting functions
  function initializeHighlighting() {
    // Only initialize once
    if (highlightToolbar) return;

    // Create highlight toolbar
    highlightToolbar = document.createElement('div');
    highlightToolbar.className = 'highlight-toolbar';
    highlightToolbar.innerHTML = `
      <button class="highlight-yellow-btn" data-color="yellow" title="Yellow highlight"></button>
      <button class="highlight-green-btn" data-color="green" title="Green highlight"></button>
      <button class="highlight-blue-btn" data-color="blue" title="Blue highlight"></button>
      <button class="highlight-pink-btn" data-color="pink" title="Pink highlight"></button>
      <button class="clear-btn" data-action="clear" title="Remove highlight">×</button>
    `;
    document.body.appendChild(highlightToolbar);

    // Add click handlers to toolbar buttons
    highlightToolbar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', handleHighlightAction);
    });

    // Listen for text selection (only add listener once)
    document.addEventListener('mouseup', handleTextSelection);
  }

  function handleTextSelection(_e) {
    // Hide toolbar first
    if (highlightToolbar) {
      highlightToolbar.classList.remove('show');
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length === 0) {
      return;
    }

    // Check if selection is within question content
    const questionContent = document.querySelector('.question-content');
    if (!questionContent || !questionContent.contains(selection.anchorNode)) {
      return;
    }

    // Don't show toolbar if answer already submitted
    const answer = userAnswers[currentQuestionIndex];
    if (answer?.submitted) {
      return;
    }

    currentSelection = selection;

    // Position and show toolbar
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (highlightToolbar) {
      highlightToolbar.style.left = `${rect.left + (rect.width / 2) - 75}px`;
      highlightToolbar.style.top = `${rect.top - 50}px`;
      highlightToolbar.classList.add('show');
    }
  }

  function handleHighlightAction(e) {
    e.preventDefault();
    e.stopPropagation();

    const color = e.target.getAttribute('data-color');
    const action = e.target.getAttribute('data-action');

    if (action === 'clear') {
      // Remove all highlights from current selection
      if (currentSelection) {
        try {
          const range = currentSelection.getRangeAt(0);
          const container = range.commonAncestorContainer;

          // Find and remove highlight spans within the selection
          const parent = container.nodeType === 3 ? container.parentElement : container;
          if (parent && parent.classList && parent.classList.contains('highlight')) {
            // If the selection itself is a highlight, unwrap it
            const text = parent.textContent;
            const textNode = document.createTextNode(text);
            parent.parentNode.replaceChild(textNode, parent);
          }
        } catch (err) {
          console.warn('Could not remove highlight:', err);
        }
      }

      if (highlightToolbar) {
        highlightToolbar.classList.remove('show');
      }
      currentSelection.removeAllRanges();
      return;
    }

    if (!currentSelection || !color) return;

    try {
      const range = currentSelection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = `highlight highlight-${color}`;

      // Add click handler to remove highlight
      span.onclick = function(e) {
        e.preventDefault();
        const text = this.textContent;
        const textNode = document.createTextNode(text);
        this.parentNode.replaceChild(textNode, this);
      };

      range.surroundContents(span);

      // Save highlight to state (simplified - real implementation would need better serialization)
      if (!userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex] = {};
      }
      if (!userAnswers[currentQuestionIndex].highlights) {
        userAnswers[currentQuestionIndex].highlights = [];
      }

      currentSelection.removeAllRanges();
    } catch (err) {
      console.warn('Could not apply highlight:', err);
    }

    if (highlightToolbar) {
      highlightToolbar.classList.remove('show');
    }
  }

  // Render current question
  function renderQuestion() {
    const question = questions[currentQuestionIndex];
    const answer = userAnswers[currentQuestionIndex];
    const isSubmitted = answer?.submitted || false;

    // Save scroll position to restore after render (iOS fix)
    const scrollY = window.scrollY || window.pageYOffset;

    // Update header with question ID (Issue #25)
    questionCounter.textContent = `Question #${currentQuestionIndex + 1} of ${questions.length}`;
    questionCounter.title = `Click to copy question ID`;
    questionCounter.style.cursor = 'pointer';
    updateProgressBar();
    updateNavigationButtons();
    updateQuestionGrid();

    // Build question HTML
    let html = '<div class="question-content">';

    // Feedback banner (shown after submission)
    if (isSubmitted) {
      const isCorrect = answer.correct;
      const encouragingMessages = {
        correct: [
          '✓ Excellent! You nailed it!',
          '✓ Perfect! Great clinical reasoning!',
          '✓ Correct! You\'re mastering this!',
          '✓ Outstanding! Keep it up!',
          '✓ Brilliant! Well done!'
        ],
        incorrect: [
          '✗ Not quite, but let\'s learn why',
          '✗ Good try! Here\'s the key insight',
          '✗ Close! Let\'s break this down',
          '✗ Learning opportunity ahead',
          '✗ Let\'s explore the correct answer'
        ]
      };

      const messages = isCorrect ? encouragingMessages.correct : encouragingMessages.incorrect;
      const message = messages[Math.floor(Math.random() * messages.length)];

      // Add role="status" for screen reader announcements
      html += `<div class="feedback-banner ${isCorrect ? 'correct' : 'incorrect'} feedback-animate" role="status" aria-live="polite">`;
      html += message;
      html += '</div>';
    }

    // Question metadata with flag button
    html += '<div class="question-meta">';
    const meta = [question.subject, question.system, question.topic].filter(Boolean).join(' • ');
    if (meta) html += `<p class="meta-text">${escapeHtml(meta)}</p>`;

    // Flag button
    const isFlagged = answer?.flagged || false;
    html += `<button id="flag-btn" class="flag-btn ${isFlagged ? 'flagged' : ''}" aria-label="${isFlagged ? 'Unflag question' : 'Flag question for review'}">
      ${isFlagged ? '🚩 Flagged' : '🏳️ Flag'}
    </button>`;

    // Issue #26: Previous Explanation link (if previous question was answered)
    if (currentQuestionIndex > 0 && userAnswers[currentQuestionIndex - 1]?.submitted) {
      html += `<button id="prev-explanation-btn" class="prev-explanation-btn" aria-label="View previous explanation">
        ← Previous Explanation
      </button>`;
    }

    html += '</div>';

    // Question stem
    html += '<div class="question-stem">';

    // Show vignette (clinical case) if present
    if (question.vignette) {
      html += `<p class="vignette">${escapeHtml(question.vignette)}</p>`;
    }

    // Show question text (the actual question being asked)
    if (question.questionText) {
      html += `<p class="question-text" id="question-text-${currentQuestionIndex}"><strong>${escapeHtml(question.questionText)}</strong></p>`;
    }

    html += '</div>';

    // Answer choices - wrapped in fieldset for proper accessibility
    html += '<fieldset class="answer-choices" aria-labelledby="question-text-' + currentQuestionIndex + '">';
    html += '<legend class="sr-only">Select the best answer from the choices below</legend>';
    question.answerChoices.forEach((choice) => {
      const letter = choice.letter;
      const isSelected = answer?.selected === letter;
      const isCorrect = choice.isCorrect;
      const isEliminated = answer?.eliminated?.includes(letter) || false;

      let choiceClass = 'answer-choice';
      if (isSubmitted) {
        if (isCorrect) choiceClass += ' answer-correct';
        if (isSelected && !isCorrect) choiceClass += ' answer-incorrect';
      }
      if (isSelected && !isSubmitted) choiceClass += ' answer-selected';
      if (isEliminated && !isSubmitted) choiceClass += ' eliminated';

      const disabled = isSubmitted ? 'disabled' : '';
      const checked = isSelected ? 'checked' : '';

      html += `<label class="${choiceClass}">`;
      // Issue #10: Add comprehensive ARIA labels for answer choices
      let ariaLabel = `Answer ${letter}: ${choice.text}`;
      if (isEliminated) ariaLabel += ' (crossed out)';
      if (isSubmitted && isCorrect) ariaLabel += ' - Correct answer';
      if (isSubmitted && isSelected && !isCorrect) ariaLabel += ' - Incorrect (your answer)';
      html += `<input type="radio" name="answer" value="${escapeHtml(letter)}" ${checked} ${disabled} aria-label="${escapeHtml(ariaLabel)}" />`;
      html += `<span class="choice-letter" aria-hidden="true">${escapeHtml(letter)}</span>`;
      html += `<span class="choice-text" aria-hidden="true">${escapeHtml(choice.text)}</span>`;

      // Add eliminate button (only show before submission)
      if (!isSubmitted) {
        const eliminateLabel = isEliminated ? `Undo cross out for answer ${letter}` : `Cross out answer ${letter}`;
        html += `<button class="eliminate-btn" data-choice="${letter}" type="button" aria-label="${eliminateLabel}">
          ${isEliminated ? 'Undo' : 'Cross out'}
        </button>`;
      }

      if (isSubmitted && isCorrect) html += '<span class="choice-icon" aria-hidden="true">✓</span>';
      if (isSubmitted && isSelected && !isCorrect) html += '<span class="choice-icon" aria-hidden="true">✗</span>';
      html += '</label>';
    });
    html += '</fieldset>';

    // Explanation (shown after submission) - Enhanced for Issues #1 and #4
    if (isSubmitted) {
      html += '<div class="explanation-section" id="explanation-section" role="region" aria-labelledby="explanation-heading-' + currentQuestionIndex + '">';
      html += '<h3 id="explanation-heading-' + currentQuestionIndex + '">📚 Explanation</h3>';

      // Add TL;DR section with educational objective (Issue #4)
      if (question.educationalObjective) {
        html += `<div class="tldr-section">
          <div class="tldr-header">💡 <strong>TL;DR - Key Takeaway</strong></div>
          <div class="tldr-content">${escapeHtml(question.educationalObjective)}</div>
        </div>`;
      }

      // Correct answer explanation in highlighted box (Issue #1)
      if (question.explanation?.correct) {
        html += `<div class="explanation-correct">
          <div class="explanation-heading">✓ Why ${escapeHtml(question.correctAnswer)} is Correct</div>
          <div class="explanation-content">${escapeHtml(question.explanation.correct)}</div>
        </div>`;
      }

      // Show rationale for user's incorrect answer in highlighted box (Issue #1)
      if (!answer.correct && question.explanation?.incorrect) {
        const incorrectRationale = question.explanation.incorrect[answer.selected];
        if (incorrectRationale) {
          html += `<div class="explanation-incorrect">
            <div class="explanation-heading">✗ Why ${escapeHtml(answer.selected)} is Incorrect</div>
            <div class="explanation-content">${escapeHtml(incorrectRationale)}</div>
          </div>`;
        }
      }

      // Collapsible detailed explanation (Issue #4)
      if (question.keyFacts && question.keyFacts.length > 0) {
        html += '<div class="detailed-explanation">';
        html += '<button class="toggle-details-btn" data-expanded="true">📖 <span>Hide Detailed Explanation</span></button>';
        html += '<div class="details-content" style="display: block;">';
        html += '<div class="explanation-text"><strong>Key Facts:</strong><ul>';
        question.keyFacts.forEach(fact => {
          html += `<li>${escapeHtml(fact)}</li>`;
        });
        html += '</ul></div>';
        html += '</div>';
        html += '</div>';
      }

      // Action buttons for explanation (Issues #24, #28)
      const questionId = `Q${currentQuestionIndex + 1}`;
      const githubIssueUrl = `https://github.com/stevetodman/tbank/issues/new?title=Error%20in%20${questionId}&body=Question%20ID:%20${questionId}%0A%0ADescribe%20the%20error:%0A`;
      html += `<div class="explanation-actions">
        <button id="reset-question-btn" class="reset-question-btn">🔄 Reset This Question</button>
        <a href="${githubIssueUrl}" target="_blank" class="report-error-btn">🐛 Report Error</a>
      </div>`;

      // Issue #6: Notes section
      const existingNote = loadNote(currentQuestionIndex);
      const noteText = existingNote ? existingNote.text : '';
      const noteDate = existingNote ? existingNote.date : '';
      const maxChars = 1000;

      html += `<div class="notes-section">
        <div class="notes-header">
          <h4>📝 Personal Notes</h4>
          ${existingNote ? `<span class="note-date">Last edited: ${noteDate}</span>` : ''}
        </div>
        <div class="notes-editor">
          <textarea
            id="note-textarea"
            class="note-textarea"
            placeholder="Add your personal notes, insights, or mnemonics for this question..."
            maxlength="${maxChars}"
            aria-label="Personal notes for this question"
          >${escapeHtml(noteText)}</textarea>
          <div class="notes-footer">
            <div class="notes-char-count">
              <span id="char-count">${noteText.length}</span>/${maxChars}
            </div>
            <div class="notes-actions">
              ${existingNote ? `<button id="delete-note-btn" class="note-action-btn note-delete-btn" aria-label="Delete note">🗑️ Delete</button>` : ''}
              <button id="save-note-btn" class="note-action-btn note-save-btn" aria-label="Save note">💾 Save Note</button>
            </div>
          </div>
        </div>
        <div class="notes-formatting-hint">
          <strong>Tip:</strong> Use ** for <strong>bold</strong>, * for <em>italic</em>, - for bullet points
        </div>
      </div>`;

      html += '</div>';
    }

    // Issue #29: Show Answer button (before submission)
    if (!isSubmitted && answer?.selected) {
      html += `<div class="show-answer-section">
        <button id="show-answer-btn" class="show-answer-btn">👁️ Show Answer</button>
        <p class="show-answer-hint">See the correct answer without submitting</p>
      </div>`;
    }

    html += '</div>';
    questionDisplay.innerHTML = html;

    // Add event listeners to radio buttons
    if (!isSubmitted) {
      document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', handleAnswerSelection);
      });

      // Add double-tap to submit on mobile
      if (window.innerWidth <= 768) {
        document.querySelectorAll('.answer-choice').forEach((choiceElement) => {
          let lastTap = 0;
          choiceElement.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            // Double tap detected (between 50ms and 350ms for more intentional taps)
            if (tapLength >= 50 && tapLength < 350) {
              e.preventDefault();

              // Get the radio button in this choice
              const radio = choiceElement.querySelector('input[name="answer"]');
              if (radio && !radio.disabled) {
                // Select the answer if not already selected
                if (!radio.checked) {
                  radio.checked = true;
                  handleAnswerSelection({ target: radio });
                }

                // Visual feedback for double-tap
                choiceElement.style.transform = 'scale(0.98)';
                setTimeout(() => {
                  choiceElement.style.transform = '';
                }, 100);

                // Submit immediately
                setTimeout(() => {
                  if (!answer?.submitted && submitBtn && !submitBtn.disabled) {
                    HapticEngine.medium(); // Medium haptic for quick submit
                    handleSubmit();
                  }
                }, 100);
              }
            }
            lastTap = currentTime;
          });
        });
      }
    }

    // Add flag button event listener with long-press support
    const flagBtn = document.getElementById('flag-btn');
    if (flagBtn) {
      let longPressTimer = null;
      let longPressTriggered = false;

      flagBtn.addEventListener('touchstart', (_e) => {
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
          longPressTriggered = true;
          HapticEngine.medium();
          showQuickNavMenu();
        }, 500); // 500ms for long press
      }, { passive: true });

      flagBtn.addEventListener('touchend', (_e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
        if (!longPressTriggered) {
          toggleFlag();
        }
      });

      flagBtn.addEventListener('touchcancel', (_e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
      });

      // For desktop/non-touch devices, use regular click
      flagBtn.addEventListener('click', (_e) => {
        // Only handle click if it's not a touch device
        if (!('ontouchstart' in window)) {
          toggleFlag();
        }
      });

      // Also support mousedown/mouseup for desktop long-press
      flagBtn.addEventListener('mousedown', (_e) => {
        if ('ontouchstart' in window) return; // Skip on touch devices
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
          longPressTriggered = true;
          showQuickNavMenu();
        }, 500);
      });

      flagBtn.addEventListener('mouseup', (_e) => {
        if ('ontouchstart' in window) return;
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
        // Click is handled by the click event listener
      });

      flagBtn.addEventListener('mouseleave', (_e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
      });
    }

    // Add eliminate button event listeners
    if (!isSubmitted) {
      document.querySelectorAll('.eliminate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const choice = e.target.getAttribute('data-choice');
          toggleElimination(choice);
        });
      });
    }

    // Add swipe gestures to answer choices on mobile
    if (!isSubmitted && window.innerWidth <= 768) {
      document.querySelectorAll('.answer-choice').forEach(choiceElement => {
        // Get the choice letter from the input
        const input = choiceElement.querySelector('input[name="answer"]');
        if (!input) return;

        const letter = input.value;
        const isEliminated = answer?.eliminated?.includes(letter) || false;

        initSwipeGesture(choiceElement, {
          onSwipeLeft: (_element) => {
            // Swipe left to eliminate (only if not already eliminated)
            if (!isEliminated) {
              toggleElimination(letter);
            }
          },
          onSwipeRight: (_element) => {
            // Swipe right to undo elimination (only if eliminated)
            const currentEliminated = userAnswers[currentQuestionIndex]?.eliminated?.includes(letter) || false;
            if (currentEliminated) {
              toggleElimination(letter);
            }
          }
        });
      });
    }

    // Update submit and skip button state (Issue #23)
    const hasSelection = answer?.selected;
    submitBtn.disabled = !hasSelection || isSubmitted;
    if (isSubmitted) {
      submitBtn.style.display = 'none';
      skipBtn.hidden = true;
    } else {
      submitBtn.style.display = 'inline-block';
      // Show skip button only if question is not yet answered
      skipBtn.hidden = false;
    }

    // Start timer for this question if in timed mode and not already submitted
    if (!isSubmitted) {
      stopTimer(); // Stop any existing timer
      if (timedMode) {
        startTimer();
      } else if (!questionStartTime) {
        // Track time even without timer visible
        questionStartTime = Date.now();
      }
    }

    // Add swipe gesture to question display for navigation (mobile only)
    // Exclude answer choices so their swipe gestures don't conflict
    if (window.innerWidth <= 768 && !isSubmitted) {
      const questionContent = document.querySelector('.question-content');
      if (questionContent) {
        initSwipeGesture(questionContent, {
          minDistance: 80, // Longer swipe required for question navigation
          maxVerticalDistance: 100,
          excludeSelectors: ['.answer-choice', '.answer-choices'], // Don't trigger on answer choices
          onSwipeLeft: () => {
            // Swipe left = Next question
            if (currentQuestionIndex < questions.length - 1) {
              goToNext();
            }
          },
          onSwipeRight: () => {
            // Swipe right = Previous question
            if (currentQuestionIndex > 0) {
              goToPrevious();
            }
          }
        });
      }
    }

    // Event listener for toggle details button (Issue #4)
    if (isSubmitted) {
      const toggleBtn = document.querySelector('.toggle-details-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const expanded = toggleBtn.getAttribute('data-expanded') === 'true';
          const detailsContent = document.querySelector('.details-content');
          const btnText = toggleBtn.querySelector('span');

          if (expanded) {
            detailsContent.style.display = 'none';
            btnText.textContent = 'Show Detailed Explanation';
            toggleBtn.setAttribute('data-expanded', 'false');
          } else {
            detailsContent.style.display = 'block';
            btnText.textContent = 'Hide Detailed Explanation';
            toggleBtn.setAttribute('data-expanded', 'true');
          }
        });
      }
    }

    // Event listener for question counter click to copy ID (Issue #25)
    questionCounter.addEventListener('click', () => {
      const questionId = `Q${currentQuestionIndex + 1}`;
      navigator.clipboard.writeText(questionId).then(() => {
        showToast(`Question ID ${questionId} copied to clipboard`, 'success');
      }).catch(() => {
        showToast('Failed to copy question ID', 'error');
      });
    });

    // Event listener for Previous Explanation button (Issue #26)
    const prevExplanationBtn = document.getElementById('prev-explanation-btn');
    if (prevExplanationBtn) {
      prevExplanationBtn.addEventListener('click', () => {
        HapticEngine.light();
        goToPrevious();
        // Scroll to explanation after navigating
        setTimeout(() => {
          const explanationSection = document.getElementById('explanation-section');
          if (explanationSection) {
            explanationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      });
    }

    // Event listener for Reset Question button (Issue #28)
    const resetQuestionBtn = document.getElementById('reset-question-btn');
    if (resetQuestionBtn) {
      resetQuestionBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset this question? Your answer will be cleared.')) {
          // Clear the answer for this question
          delete userAnswers[currentQuestionIndex];
          HapticEngine.medium();
          saveState();
          renderQuestion();
          updateQuestionGrid();
          updateStats();
          showToast('Question reset - try again!', 'info');
        }
      });
    }

    // Event listener for Show Answer button (Issue #29)
    const showAnswerBtn = document.getElementById('show-answer-btn');
    if (showAnswerBtn) {
      showAnswerBtn.addEventListener('click', () => {
        // Find the correct answer choice
        const question = questions[currentQuestionIndex];
        const correctChoice = question.answerChoices.find(c => c.isCorrect);

        if (correctChoice) {
          // Highlight the correct answer temporarily
          const answerChoices = document.querySelectorAll('.answer-choice');
          answerChoices.forEach(choice => {
            const radio = choice.querySelector('input[name="answer"]');
            if (radio && radio.value === correctChoice.letter) {
              choice.classList.add('answer-peek');
              // Remove highlight after 3 seconds
              setTimeout(() => {
                choice.classList.remove('answer-peek');
              }, 3000);
            }
          });

          HapticEngine.light();
          showToast(`The correct answer is ${correctChoice.letter}`, 'info');
        }
      });
    }

    // Event listeners for Notes feature (Issue #6)
    const noteTextarea = document.getElementById('note-textarea');
    const charCount = document.getElementById('char-count');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');

    if (noteTextarea && charCount) {
      // Update character count as user types
      noteTextarea.addEventListener('input', () => {
        charCount.textContent = noteTextarea.value.length;
      });
    }

    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => {
        const noteText = noteTextarea.value.trim();
        const success = saveNote(currentQuestionIndex, noteText);

        if (success) {
          HapticEngine.medium();
          showToast('Note saved successfully!', 'success');
          // Re-render to update the note date and delete button
          renderQuestion();
          updateQuestionGrid(); // Update grid to show note indicator
        } else {
          showToast('Failed to save note. Please try again.', 'error');
        }
      });
    }

    if (deleteNoteBtn) {
      deleteNoteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
          const success = deleteNote(currentQuestionIndex);

          if (success) {
            HapticEngine.medium();
            showToast('Note deleted', 'info');
            // Re-render to remove the note
            renderQuestion();
            updateQuestionGrid(); // Update grid to remove note indicator
          } else {
            showToast('Failed to delete note. Please try again.', 'error');
          }
        }
      });
    }

    // Scroll to top or explanation section (Issue #1 - auto-scroll to explanation)
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (isSubmitted) {
        // If just submitted, scroll to explanation section
        const explanationSection = document.getElementById('explanation-section');
        if (explanationSection) {
          explanationSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      } else if (window.innerWidth <= 768) {
        // On mobile, scroll to question display smoothly
        const questionDisplay = document.getElementById('question-display');
        if (questionDisplay) {
          questionDisplay.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } else {
        // On desktop, restore scroll position (iOS fix)
        window.scrollTo(0, scrollY);
      }
    });
  }

  // Handle answer selection
  function handleAnswerSelection(event) {
    const selected = event.target.value;
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = {};
    }
    userAnswers[currentQuestionIndex].selected = selected;
    userAnswers[currentQuestionIndex].submitted = false;
    submitBtn.disabled = false;

    // Haptic feedback on selection
    HapticEngine.light();

    // Save state
    saveState();
  }

  // Handle submit answer
  function handleSubmit() {
    const answer = userAnswers[currentQuestionIndex];
    if (!answer || !answer.selected) return;

    // Stop timer and record time spent
    stopTimer();

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correctAnswer;
    const isCorrect = answer.selected === correctAnswer;

    userAnswers[currentQuestionIndex].submitted = true;
    userAnswers[currentQuestionIndex].correct = isCorrect;

    // Issue #10: Screen reader announcement for result
    const answerLetter = answer.selected;
    if (isCorrect) {
      announceToScreenReader(`Correct! Your answer ${answerLetter} is the right choice.`);
    } else {
      announceToScreenReader(`Incorrect. You selected ${answerLetter}. The correct answer is ${correctAnswer}.`);
    }

    // Haptic feedback based on correctness
    if (isCorrect) {
      HapticEngine.success();
    } else {
      HapticEngine.error();
    }

    // Update streak tracking
    if (isCorrect) {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      // Show streak notification for milestones
      if (CONSTANTS.STREAK_MILESTONES.includes(currentStreak)) {
        setTimeout(() => showStreakNotification(currentStreak), CONSTANTS.STREAK_ANIMATION_DELAY);
      }
    } else {
      currentStreak = 0;
    }

    // Save state after submission with notification (Issue #2)
    saveState(true);

    renderQuestion();
    updateStats();

    // Check for milestone celebrations
    checkMilestones();
  }

  // Create confetti animation
  // Issue #35: Less intrusive confetti
  function createConfetti() {
    const colors = ['#3182ce', '#38a169', '#e53e3e', '#d69e2e', '#805ad5', '#dd6b20'];
    const confettiCount = 25; // Reduced from 50 to 25

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.3 + 's';
      confetti.style.animationDuration = (Math.random() * 1.5 + 2) + 's'; // Faster: 2-3.5s instead of 2-4s

      // Randomize size and shape (slightly smaller)
      const size = Math.random() * 6 + 3; // 3-9px instead of 4-12px
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';

      document.body.appendChild(confetti);

      // Remove confetti after animation (faster cleanup)
      setTimeout(() => confetti.remove(), 3000); // 3s instead of 4s
    }
  }

  // Show streak notification - Issue #35: Less intrusive
  function showStreakNotification(streak) {
    const messages = {
      3: '🔥 3 in a row!',
      5: '🌟 5 correct in a row!',
      10: '🎯 10 in a row! Incredible!'
    };

    // Medium haptic instead of celebration (less intense)
    HapticEngine.medium();

    // Confetti only for 10+ streak (Issue #35: less intrusive)
    if (streak >= 10) {
      createConfetti();
    }

    showToast(messages[streak] || `🔥 ${streak} in a row!`, 'success');
  }

  // Check and show milestone celebrations
  function checkMilestones() {
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;

    CONSTANTS.QUESTION_MILESTONES.forEach(milestone => {
      if (answered === milestone && !milestonesShown.includes(milestone)) {
        milestonesShown.push(milestone);
        setTimeout(() => showMilestoneCelebration(milestone), CONSTANTS.MILESTONE_ANIMATION_DELAY);
      }
    });
  }

  // Show milestone celebration
  function showMilestoneCelebration(milestone) {
    const correct = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const percentage = Math.round((correct / milestone) * 100);

    const messages = {
      10: '🎉 10 Questions Down!',
      25: '🚀 Halfway There! 25 Questions!',
      40: '⭐ Almost There! 40 Questions!',
      52: '🏆 Test Complete! Congratulations!'
    };

    // Celebration haptic for question milestones
    HapticEngine.celebration();

    // Confetti for all milestones (more for bigger milestones)
    createConfetti();
    if (milestone >= 40) {
      // Extra confetti burst for major milestones
      setTimeout(() => createConfetti(), 200);
    }

    const overlay = document.createElement('div');
    overlay.className = 'milestone-overlay';
    overlay.innerHTML = `
      <div class="milestone-card">
        <h2>${messages[milestone]}</h2>
        <p class="milestone-stats">${correct} correct • ${percentage}% accuracy</p>
        <p class="milestone-encouragement">
          ${percentage >= 80 ? 'Outstanding performance! Keep it up!' :
    percentage >= 70 ? 'Great work! You\'re doing well!' :
      'Every question is a learning opportunity!'}
        </p>
        <button class="milestone-continue-btn" onclick="this.parentElement.parentElement.remove()">
          ${milestone === 52 ? 'Review Results' : 'Continue'}
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('show'), 100);
  }

  // Navigation
  function goToPrevious() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      HapticEngine.subtle(); // Subtle haptic for navigation
      saveState(); // Save navigation state
      renderQuestion();
    }
  }

  function goToNext() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      HapticEngine.subtle(); // Subtle haptic for navigation
      saveState(); // Save navigation state
      renderQuestion();
    }
  }

  function jumpToQuestion(index) {
    currentQuestionIndex = index;
    saveState(); // Save navigation state
    renderQuestion();
    closeMenu();
  }

  // Update navigation buttons
  function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;

    // Issue #10: Update ARIA disabled states
    prevBtn.setAttribute('aria-disabled', currentQuestionIndex === 0 ? 'true' : 'false');
    nextBtn.setAttribute('aria-disabled', currentQuestionIndex === questions.length - 1 ? 'true' : 'false');
  }

  // Update progress bar
  // Issue #27: Add progress bar tooltip
  function updateProgressBar() {
    const answeredQuestions = Object.values(userAnswers).filter(a => a.submitted).length;
    const correctQuestions = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const percentage = (answeredQuestions / questions.length) * 100;
    const accuracyPercentage = answeredQuestions > 0 ? Math.round((correctQuestions / answeredQuestions) * 100) : 0;

    progressBar.style.width = `${percentage}%`;

    // Issue #10: Update ARIA attributes for progress bar
    const progressBarContainer = progressBar.parentElement;
    progressBarContainer.setAttribute('aria-valuenow', Math.round(percentage));
    progressBarContainer.setAttribute('aria-valuetext', `${answeredQuestions} of ${questions.length} questions answered, ${accuracyPercentage}% correct`);

    // Add tooltip with detailed progress (Issue #27)
    const tooltipText = answeredQuestions > 0
      ? `Progress: ${answeredQuestions}/${questions.length} questions answered (${Math.round(percentage)}%)\nAccuracy: ${correctQuestions}/${answeredQuestions} correct (${accuracyPercentage}%)`
      : `Progress: 0/${questions.length} questions answered - Let's get started!`;

    progressBar.title = tooltipText;
    progressBar.parentElement.title = tooltipText; // Also add to container for better UX
  }

  // Update question grid styling
  function updateQuestionGrid() {
    const buttons = questionGrid.querySelectorAll('.grid-question-btn');
    buttons.forEach((btn, index) => {
      btn.classList.remove('current', 'answered', 'correct', 'incorrect');

      if (index === currentQuestionIndex) {
        btn.classList.add('current');
      }

      const answer = userAnswers[index];
      if (answer?.submitted) {
        btn.classList.add('answered');
        if (answer.correct) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('incorrect');
        }
      }
    });
  }

  // Update stats in menu
  function updateStats() {
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;
    const correct = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    // Add emoji based on performance
    let emoji = '📊';
    if (percentage >= 90) emoji = '🏆';
    else if (percentage >= 80) emoji = '🌟';
    else if (percentage >= 70) emoji = '✨';
    else if (percentage >= 60) emoji = '💪';

    answeredCount.textContent = `${answered}/${questions.length} answered`;
    correctCount.textContent = `${correct} correct ${emoji}`;

    // Show percentage with encouragement
    let encouragement = '';
    if (percentage >= 80) encouragement = ' Outstanding!';
    else if (percentage >= 70) encouragement = ' Great!';
    else if (percentage >= 60) encouragement = ' Good!';

    percentageDisplay.textContent = `${percentage}%${encouragement}`;

    // Add streak display if active
    if (currentStreak >= 2) {
      percentageDisplay.textContent += ` 🔥 ${currentStreak} streak`;
    }
  }

  // Filter question grid by type
  function filterQuestionGrid(filterType) {
    const buttons = questionGrid.querySelectorAll('.grid-question-btn');
    buttons.forEach((btn, index) => {
      const answer = userAnswers[index];
      let show = true;

      if (filterType === 'incorrect') {
        show = answer?.submitted && !answer.correct;
      } else if (filterType === 'unanswered') {
        show = !answer?.submitted;
      } else if (filterType === 'flagged') {
        show = answer?.flagged === true;
      }
      // 'all' shows everything (show = true)

      btn.style.display = show ? '' : 'none';
    });

    // Update active button styling
    showAllBtn.classList.toggle('active', filterType === 'all');
    showIncorrectBtn.classList.toggle('active', filterType === 'incorrect');
    showUnansweredBtn.classList.toggle('active', filterType === 'unanswered');
    showFlaggedBtn.classList.toggle('active', filterType === 'flagged');

    // Issue #10: Update ARIA pressed states for filter buttons
    showAllBtn.setAttribute('aria-pressed', filterType === 'all' ? 'true' : 'false');
    showIncorrectBtn.setAttribute('aria-pressed', filterType === 'incorrect' ? 'true' : 'false');
    showUnansweredBtn.setAttribute('aria-pressed', filterType === 'unanswered' ? 'true' : 'false');
    showFlaggedBtn.setAttribute('aria-pressed', filterType === 'flagged' ? 'true' : 'false');
  }

  // Issue #7: Search functionality
  function searchQuestions(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    let matchCount = 0;

    const buttons = questionGrid.querySelectorAll('.grid-question-btn');
    buttons.forEach((btn, index) => {
      const question = questions[index];
      let matches = false;

      // Search across question text, topic, and keywords
      const searchableText = [
        question.vignette || '',
        question.questionText || '',
        question.topic || '',
        ...(question.answerChoices?.map(c => c.text) || [])
      ].join(' ').toLowerCase();

      matches = searchableText.includes(lowerSearchTerm);

      // Show/hide based on match
      btn.style.display = matches ? '' : 'none';
      if (matches) matchCount++;
    });

    // Update results count
    updateSearchResultsCount(matchCount, searchTerm);

    // Deactivate all filter buttons when searching
    showAllBtn.classList.remove('active');
    showIncorrectBtn.classList.remove('active');
    showUnansweredBtn.classList.remove('active');
    showFlaggedBtn.classList.remove('active');

    // Update ARIA states
    showAllBtn.setAttribute('aria-pressed', 'false');
    showIncorrectBtn.setAttribute('aria-pressed', 'false');
    showUnansweredBtn.setAttribute('aria-pressed', 'false');
    showFlaggedBtn.setAttribute('aria-pressed', 'false');

    // Announce results to screen readers
    announceToScreenReader(`Search found ${matchCount} matching question${matchCount !== 1 ? 's' : ''}`);
  }

  function clearSearch() {
    questionSearch.value = '';
    clearSearchBtn.hidden = true;
    searchResultsCount.hidden = true;

    // Show all questions
    const buttons = questionGrid.querySelectorAll('.grid-question-btn');
    buttons.forEach(btn => {
      btn.style.display = '';
    });

    // Re-activate "All" filter
    filterQuestionGrid('all');

    // Announce to screen readers
    announceToScreenReader('Search cleared, showing all questions');
  }

  function updateSearchResultsCount(count, searchTerm) {
    searchResultsCount.hidden = false;

    if (count === 0) {
      searchResultsCount.className = 'search-results-count no-results';
      searchResultsCount.textContent = `No questions found matching "${searchTerm}"`;
    } else {
      searchResultsCount.className = 'search-results-count';
      searchResultsCount.textContent = `Found ${count} question${count !== 1 ? 's' : ''} matching "${searchTerm}"`;
    }
  }

  // Update topic mastery display
  function updateTopicMastery() {
    const topicStats = {};

    // Collect statistics by topic
    questions.forEach((q, index) => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0, answered: 0 };
      }

      const answer = userAnswers[index];
      if (answer?.submitted) {
        topicStats[topic].answered++;
        topicStats[topic].total++;
        if (answer.correct) {
          topicStats[topic].correct++;
        }
      }
    });

    // Only show if at least one question has been answered
    const hasAnswered = Object.values(userAnswers).some(a => a.submitted);
    if (!hasAnswered) {
      topicMasterySection.hidden = true;
      return;
    }

    topicMasterySection.hidden = false;

    // Build topic list HTML
    let html = '';
    const sortedTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.answered > 0)
      .sort(([a], [b]) => a.localeCompare(b));

    sortedTopics.forEach(([topic, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      let statusEmoji = '📚';
      let statusClass = '';

      if (percentage >= 90) {
        statusEmoji = '🏆';
        statusClass = 'mastery-excellent';
      } else if (percentage >= 80) {
        statusEmoji = '⭐';
        statusClass = 'mastery-great';
      } else if (percentage >= 70) {
        statusEmoji = '✓';
        statusClass = 'mastery-good';
      } else if (percentage >= 60) {
        statusEmoji = '💪';
        statusClass = 'mastery-fair';
      } else {
        statusEmoji = '📖';
        statusClass = 'mastery-review';
      }

      html += `
        <div class="topic-item ${statusClass}">
          <div class="topic-header">
            <span class="topic-emoji">${statusEmoji}</span>
            <span class="topic-name">${topic}</span>
          </div>
          <div class="topic-stats">
            <span class="topic-score">${stats.correct}/${stats.total}</span>
            <span class="topic-percentage">${percentage}%</span>
          </div>
          <div class="topic-bar">
            <div class="topic-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    topicList.innerHTML = html;
  }

  // Menu controls
  function openMenu() {
    questionMenu.hidden = false;
    document.body.style.overflow = 'hidden';
    setSwipesEnabled(false); // Disable swipes when menu is open

    // Issue #10: Update ARIA expanded state and trap focus
    menuToggle.setAttribute('aria-expanded', 'true');
    trapFocus(questionMenu);

    // Issue #30: Pause timer when modal opens
    if (timedMode && currentTimer && !timerPaused) {
      pauseTimer();
    }

    updateStats();
    updateTopicMastery();
  }

  function closeMenu() {
    questionMenu.hidden = true;
    document.body.style.overflow = '';
    setSwipesEnabled(true); // Re-enable swipes when menu is closed

    // Issue #10: Update ARIA expanded state and remove focus trap
    menuToggle.setAttribute('aria-expanded', 'false');
    removeFocusTrap(questionMenu);

    // Issue #30: Resume timer when modal closes
    if (timedMode && currentTimer && timerPaused) {
      resumeTimer();
    }
  }

  // Generic toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), CONSTANTS.TOAST_FADE_IN);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), CONSTANTS.TOAST_FADE_OUT);
    }, CONSTANTS.TOAST_DURATION);
  }

  // Issue #10: Screen reader announcements
  function announceToScreenReader(message) {
    const srAnnouncements = document.getElementById('sr-announcements');
    if (srAnnouncements) {
      // Clear previous announcement
      srAnnouncements.textContent = '';
      // Trigger reflow to ensure screen readers pick up the change
      void srAnnouncements.offsetHeight;
      // Set new announcement
      srAnnouncements.textContent = message;
    }
  }

  // Issue #10: Focus trap for modals
  let lastFocusedElement = null;
  const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Save currently focused element
    lastFocusedElement = document.activeElement;

    // Focus first element
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    // Add keydown listener for focus trapping
    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleFocusTrap);
    modal.dataset.focusTrapActive = 'true';

    // Store the handler so we can remove it later
    modal._focusTrapHandler = handleFocusTrap;
  }

  function removeFocusTrap(modal) {
    if (modal._focusTrapHandler) {
      modal.removeEventListener('keydown', modal._focusTrapHandler);
      delete modal._focusTrapHandler;
      delete modal.dataset.focusTrapActive;
    }

    // Restore focus to last focused element
    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus();
    }
  }

  // Dark mode functions
  function initDarkMode() {
    // Check localStorage for saved preference
    const savedDarkMode = localStorage.getItem('darkMode');

    // Default to light mode - only apply dark mode if user explicitly toggled it
    darkModeEnabled = savedDarkMode === 'true';

    applyDarkMode();
  }

  function applyDarkMode() {
    const root = document.documentElement;
    if (darkModeEnabled) {
      root.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      root.style.colorScheme = 'light';
    }
  }

  function toggleDarkMode(enabled) {
    darkModeEnabled = enabled;
    applyDarkMode();
    localStorage.setItem('darkMode', enabled.toString());
  }

  // Initialize pull-to-refresh setting
  function initPullToRefreshSetting() {
    const savedSetting = localStorage.getItem('pullToRefresh');
    if (savedSetting !== null) {
      pullToRefreshEnabled = savedSetting === 'true';
    }
  }

  // Settings modal functions
  function openSettings() {
    settingsModal.hidden = false;
    settingsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setSwipesEnabled(false); // Disable swipes when modal is open

    // Issue #10: Trap focus in modal
    trapFocus(settingsModal);

    // Issue #30: Pause timer when modal opens
    if (timedMode && currentTimer && !timerPaused) {
      pauseTimer();
    }

    darkModeToggle.checked = darkModeEnabled;
    pullToRefreshToggle.checked = pullToRefreshEnabled;
    hapticFeedbackToggle.checked = hapticsEnabled;
    timedModeToggle.checked = timedMode;
    timerDurationInput.value = timerDuration;
    timerDurationGroup.hidden = !timedMode;
  }

  function closeSettings() {
    settingsModal.hidden = true;
    settingsModal.style.display = 'none';
    document.body.style.overflow = '';
    setSwipesEnabled(true); // Re-enable swipes when modal is closed

    // Issue #10: Remove focus trap
    removeFocusTrap(settingsModal);

    // Issue #30: Resume timer when modal closes
    if (timedMode && currentTimer && timerPaused) {
      resumeTimer();
    }
  }

  function saveSettings() {
    // Save dark mode setting
    toggleDarkMode(darkModeToggle.checked);

    // Save pull-to-refresh setting
    pullToRefreshEnabled = pullToRefreshToggle.checked;
    localStorage.setItem('pullToRefresh', pullToRefreshEnabled.toString());

    // Save haptic feedback setting
    hapticsEnabled = hapticFeedbackToggle.checked;
    HapticEngine.enabled = hapticsEnabled;
    localStorage.setItem('hapticsEnabled', hapticsEnabled.toString());

    // Save timer settings
    const wasTimedMode = timedMode;
    const oldTimerDuration = timerDuration;
    timedMode = timedModeToggle.checked;
    timerDuration = parseInt(timerDurationInput.value);

    // Persist timer settings to localStorage
    localStorage.setItem('timedMode', timedMode.toString());
    localStorage.setItem('timerDuration', timerDuration.toString());

    // Show/hide timer display
    timerDisplay.hidden = !timedMode;

    // If switching from untimed to timed mode on current question
    if (!wasTimedMode && timedMode && !userAnswers[currentQuestionIndex]?.submitted) {
      startTimer();
    }
    // If timer duration changed while in timed mode, restart timer
    else if (wasTimedMode && timedMode && oldTimerDuration !== timerDuration && !userAnswers[currentQuestionIndex]?.submitted) {
      stopTimer();
      startTimer();
    }

    // If switching from timed to untimed, stop timer
    if (wasTimedMode && !timedMode) {
      stopTimer();
    }

    HapticEngine.medium(); // Medium haptic for settings save

    closeSettings();
    showToast('Settings saved!', 'success');
  }

  // Issue #11: Keyboard shortcuts help modal
  function showKeyboardShortcutsHelp() {
    // Check if modal already exists
    let helpModal = document.getElementById('keyboard-shortcuts-modal');

    if (!helpModal) {
      // Create modal dynamically
      helpModal = document.createElement('div');
      helpModal.id = 'keyboard-shortcuts-modal';
      helpModal.className = 'modal';
      helpModal.hidden = false;
      helpModal.innerHTML = `
        <div class="modal-content keyboard-shortcuts-modal">
          <div class="modal-header">
            <h2>⌨️ Keyboard Shortcuts</h2>
            <button id="keyboard-shortcuts-close" class="close-btn" aria-label="Close keyboard shortcuts">&times;</button>
          </div>
          <div class="modal-body">
            <div class="shortcuts-section">
              <h3>Navigation</h3>
              <div class="shortcut-item">
                <kbd>←</kbd> <kbd>→</kbd>
                <span>Previous / Next question</span>
              </div>
              <div class="shortcut-item">
                <kbd>M</kbd>
                <span>Open question menu</span>
              </div>
              <div class="shortcut-item">
                <kbd>Esc</kbd>
                <span>Close menu or modal</span>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>Answering Questions</h3>
              <div class="shortcut-item">
                <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> <kbd>E</kbd>
                <span>Select answer choice</span>
              </div>
              <div class="shortcut-item">
                <kbd>Enter</kbd> or <kbd>S</kbd>
                <span>Submit answer</span>
              </div>
              <div class="shortcut-item">
                <kbd>F</kbd>
                <span>Flag question for review</span>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>After Submitting</h3>
              <div class="shortcut-item">
                <kbd>Space</kbd>
                <span>Toggle detailed explanation</span>
              </div>
            </div>

            <div class="shortcuts-section">
              <h3>Help</h3>
              <div class="shortcut-item">
                <kbd>?</kbd>
                <span>Show this help menu</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="keyboard-shortcuts-ok" class="button-primary">Got it!</button>
          </div>
        </div>
      `;

      document.body.appendChild(helpModal);

      // Add event listeners
      const closeBtn = document.getElementById('keyboard-shortcuts-close');
      const okBtn = document.getElementById('keyboard-shortcuts-ok');

      const closeModal = () => {
        helpModal.hidden = true;
        document.body.style.overflow = '';
        HapticEngine.light();
      };

      closeBtn.addEventListener('click', closeModal);
      okBtn.addEventListener('click', closeModal);

      // Close on background click
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          closeModal();
        }
      });
    } else {
      helpModal.hidden = false;
    }

    document.body.style.overflow = 'hidden';
    HapticEngine.light();
  }

  // Issue #6: Notes management
  function saveNote(questionIndex, noteText) {
    try {
      const notes = JSON.parse(localStorage.getItem('questionNotes') || '{}');

      if (noteText.trim().length === 0) {
        // If note is empty, delete it
        delete notes[questionIndex];
      } else {
        notes[questionIndex] = {
          text: noteText.trim(),
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
          questionId: `Q${questionIndex + 1}`
        };
      }

      localStorage.setItem('questionNotes', JSON.stringify(notes));
      return true;
    } catch (error) {
      console.warn('[Notes] Failed to save:', error);
      return false;
    }
  }

  function loadNote(questionIndex) {
    try {
      const notes = JSON.parse(localStorage.getItem('questionNotes') || '{}');
      return notes[questionIndex] || null;
    } catch (error) {
      console.warn('[Notes] Failed to load:', error);
      return null;
    }
  }

  function deleteNote(questionIndex) {
    try {
      const notes = JSON.parse(localStorage.getItem('questionNotes') || '{}');
      delete notes[questionIndex];
      localStorage.setItem('questionNotes', JSON.stringify(notes));
      return true;
    } catch (error) {
      console.warn('[Notes] Failed to delete:', error);
      return false;
    }
  }

  function getAllNotes() {
    try {
      return JSON.parse(localStorage.getItem('questionNotes') || '{}');
    } catch (error) {
      console.warn('[Notes] Failed to retrieve all notes:', error);
      return {};
    }
  }

  function exportNotesAsText() {
    const notes = getAllNotes();
    const noteCount = Object.keys(notes).length;

    if (noteCount === 0) {
      return 'No notes to export.';
    }

    let exportText = `TBank Study Notes\n`;
    exportText += `Exported: ${new Date().toLocaleString()}\n`;
    exportText += `Total Notes: ${noteCount}\n`;
    exportText += `${'='.repeat(60)}\n\n`;

    // Sort by question index
    const sortedNotes = Object.entries(notes)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    sortedNotes.forEach(([index, note]) => {
      const question = questions[parseInt(index)];
      const topic = question?.topic || 'General';

      exportText += `${note.questionId} - ${topic}\n`;
      exportText += `Date: ${note.date}\n`;
      exportText += `${'-'.repeat(60)}\n`;
      exportText += `${note.text}\n`;
      exportText += `\n${'='.repeat(60)}\n\n`;
    });

    return exportText;
  }

  // Issue #9: Session history management
  function saveSessionHistory(sessionData) {
    try {
      let history = JSON.parse(localStorage.getItem('sessionHistory') || '[]');

      // Add current session with timestamp
      history.push({
        ...sessionData,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString()
      });

      // Keep only last 20 sessions to avoid localStorage limits
      if (history.length > 20) {
        history = history.slice(-20);
      }

      localStorage.setItem('sessionHistory', JSON.stringify(history));
    } catch (error) {
      console.warn('[Session History] Failed to save:', error);
    }
  }

  function getSessionHistory() {
    try {
      return JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    } catch (error) {
      console.warn('[Session History] Failed to retrieve:', error);
      return [];
    }
  }

  function getHistoricalComparison(currentPercentage, currentAnswered) {
    const history = getSessionHistory();
    if (history.length === 0) return null;

    // Get previous sessions with similar question counts (±5 questions)
    const comparableSessions = history.filter(s =>
      Math.abs(s.answered - currentAnswered) <= 5
    );

    if (comparableSessions.length === 0) return { isFirstSession: true };

    const lastSession = comparableSessions[comparableSessions.length - 1];
    const avgPercentage = Math.round(
      comparableSessions.reduce((sum, s) => sum + s.percentage, 0) / comparableSessions.length
    );

    const improvement = currentPercentage - lastSession.percentage;
    const vsAverage = currentPercentage - avgPercentage;

    return {
      lastSession,
      improvement,
      vsAverage,
      avgPercentage,
      sessionCount: history.length
    };
  }

  // Session summary functions
  function showSessionSummary() {
    setSwipesEnabled(false); // Disable swipes when summary modal is open
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;
    const correct = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const incorrect = answered - correct;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const flagged = Object.values(userAnswers).filter(a => a.flagged).length;

    // Calculate time statistics
    const timesSpent = Object.values(userAnswers).filter(a => a.timeSpent).map(a => a.timeSpent);
    const totalTime = timesSpent.reduce((sum, time) => sum + time, 0);
    const avgTime = timesSpent.length > 0 ? Math.round(totalTime / timesSpent.length) : 0;

    // Calculate topic performance
    const topicStats = {};
    questions.forEach((q, index) => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }

      const answer = userAnswers[index];
      if (answer?.submitted) {
        topicStats[topic].total++;
        if (answer.correct) {
          topicStats[topic].correct++;
        }
      }
    });

    // Sort topics by performance (worst first)
    const sortedTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([topic, stats]) => ({
        topic,
        ...stats,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }))
      .sort((a, b) => a.percentage - b.percentage);

    // Issue #9: Get historical comparison
    const comparison = getHistoricalComparison(percentage, answered);

    // Issue #9: Identify questions where too slow
    const slowQuestions = Object.entries(userAnswers)
      .filter(([_, answer]) => answer.submitted && answer.timeSpent && answer.timeSpent > timerDuration * 1.5)
      .map(([index, answer]) => ({
        index: parseInt(index),
        timeSpent: answer.timeSpent,
        topic: questions[index]?.topic || 'General'
      }));

    // Issue #9: Get weakest topic
    const weakestTopic = sortedTopics.length > 0 ? sortedTopics[0] : null;

    // Issue #9: Generate recommendations
    const recommendations = [];
    if (weakestTopic && weakestTopic.percentage < 70) {
      recommendations.push(`Focus on ${weakestTopic.topic} (${weakestTopic.percentage}% accuracy)`);
    }
    if (slowQuestions.length > 3) {
      recommendations.push(`Practice time management - ${slowQuestions.length} questions took too long`);
    }
    if (flagged > 0) {
      recommendations.push(`Review ${flagged} flagged question${flagged > 1 ? 's' : ''}`);
    }
    if (incorrect > correct && answered > 5) {
      recommendations.push('Review fundamental concepts before continuing');
    }
    if (avgTime > timerDuration && timedMode) {
      recommendations.push(`Aim for ${timerDuration}s per question (current avg: ${avgTime}s)`);
    }

    // Issue #9: Save this session to history
    saveSessionHistory({
      answered,
      correct,
      incorrect,
      percentage,
      avgTime,
      totalTime,
      topicStats: sortedTopics
    });

    const html = `
      <div class="summary-stats">
        <div class="summary-stat-card">
          <div class="stat-number">${answered}</div>
          <div class="stat-label">Questions Answered</div>
        </div>
        <div class="summary-stat-card ${percentage >= 70 ? 'stat-success' : ''}">
          <div class="stat-number">${percentage}%</div>
          <div class="stat-label">Overall Accuracy</div>
        </div>
        <div class="summary-stat-card stat-success">
          <div class="stat-number">${correct}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="summary-stat-card stat-error">
          <div class="stat-number">${incorrect}</div>
          <div class="stat-label">Incorrect</div>
        </div>
      </div>

      ${comparison && !comparison.isFirstSession ? `
        <div class="summary-comparison">
          <h3>📊 Performance Trend</h3>
          <div class="comparison-stats">
            ${comparison.improvement !== 0 ? `
              <div class="comparison-item ${comparison.improvement > 0 ? 'comparison-positive' : 'comparison-negative'}">
                <span class="comparison-icon">${comparison.improvement > 0 ? '📈' : '📉'}</span>
                <span class="comparison-text">
                  ${comparison.improvement > 0 ? '+' : ''}${comparison.improvement}% vs last session
                  <span class="comparison-detail">(${comparison.lastSession.percentage}% → ${percentage}%)</span>
                </span>
              </div>
            ` : ''}
            ${comparison.vsAverage !== 0 ? `
              <div class="comparison-item ${comparison.vsAverage > 0 ? 'comparison-positive' : 'comparison-neutral'}">
                <span class="comparison-icon">${comparison.vsAverage > 0 ? '⭐' : '📊'}</span>
                <span class="comparison-text">
                  ${comparison.vsAverage > 0 ? '+' : ''}${comparison.vsAverage}% vs your average
                  <span class="comparison-detail">(avg: ${comparison.avgPercentage}% over ${comparison.sessionCount} session${comparison.sessionCount > 1 ? 's' : ''})</span>
                </span>
              </div>
            ` : ''}
            ${comparison.improvement === 0 && comparison.vsAverage === 0 ? `
              <div class="comparison-item comparison-neutral">
                <span class="comparison-icon">📊</span>
                <span class="comparison-text">
                  Consistent with your average (${comparison.avgPercentage}% over ${comparison.sessionCount} session${comparison.sessionCount > 1 ? 's' : ''})
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${recommendations.length > 0 ? `
        <div class="summary-recommendations">
          <h3>💡 Personalized Recommendations</h3>
          <ul class="recommendations-list">
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${slowQuestions.length > 0 && timedMode ? `
        <div class="summary-slow-questions">
          <h3>⏱️ Time Management</h3>
          <p class="slow-questions-intro">
            <strong>${slowQuestions.length} question${slowQuestions.length > 1 ? 's' : ''}</strong> took longer than expected (>${Math.round(timerDuration * 1.5)}s):
          </p>
          <div class="slow-questions-list">
            ${slowQuestions.slice(0, 5).map(sq => `
              <div class="slow-question-item">
                <span class="slow-question-number">Q${sq.index + 1}</span>
                <span class="slow-question-topic">${sq.topic}</span>
                <span class="slow-question-time">${sq.timeSpent}s</span>
              </div>
            `).join('')}
            ${slowQuestions.length > 5 ? `<div class="slow-questions-more">... and ${slowQuestions.length - 5} more</div>` : ''}
          </div>
        </div>
      ` : ''}

      ${timesSpent.length > 0 ? `
        <div class="summary-time">
          <h3>Time Analysis</h3>
          <div class="time-stats">
            <div><strong>Total time:</strong> ${Math.floor(totalTime / 60)}m ${totalTime % 60}s</div>
            <div><strong>Average per question:</strong> ${avgTime}s</div>
            ${avgTime > timerDuration ? `<div class="time-warning">⚠️ Consider practicing under timed conditions (${timerDuration}s target)</div>` : ''}
          </div>
        </div>
      ` : ''}

      ${sortedTopics.length > 0 ? `
        <div class="summary-topics">
          <h3>Topic Performance</h3>
          <div class="summary-topic-list">
            ${sortedTopics.map(t => `
              <div class="summary-topic-item">
                <div class="summary-topic-header">
                  <span class="summary-topic-name">${t.topic}</span>
                  <span class="summary-topic-score">${t.correct}/${t.total} (${t.percentage}%)</span>
                </div>
                <div class="summary-topic-bar">
                  <div class="summary-topic-bar-fill ${t.percentage >= 70 ? 'fill-success' : t.percentage >= 50 ? 'fill-warning' : 'fill-error'}" style="width: ${t.percentage}%"></div>
                </div>
                ${t.percentage < 70 ? '<div class="summary-topic-suggestion">📚 Review this topic</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${flagged > 0 ? `
        <div class="summary-flagged">
          <p>🚩 You have <strong>${flagged} flagged question${flagged > 1 ? 's' : ''}</strong> to review</p>
        </div>
      ` : ''}

      ${answered < questions.length ? `
        <div class="summary-incomplete">
          <p>📝 ${questions.length - answered} questions remaining</p>
        </div>
      ` : `
        <div class="summary-complete">
          <p>🎉 Congratulations! You've completed all ${questions.length} questions!</p>
          ${percentage >= 80 ? '<p>Outstanding performance! 🏆</p>' : percentage >= 70 ? '<p>Great work! Keep it up! ⭐</p>' : '<p>Review the topics above and try again! 💪</p>'}
        </div>
      `}
    `;

    summaryContent.innerHTML = html;

    // Show share button if Web Share API or Clipboard API is supported
    if (navigator.share || (navigator.clipboard && navigator.clipboard.writeText)) {
      summaryShare.hidden = false;
    }

    sessionSummaryModal.hidden = false;
    sessionSummaryModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Issue #10: Trap focus in modal
    trapFocus(sessionSummaryModal);

    // Issue #30: Pause timer when modal opens
    if (timedMode && currentTimer && !timerPaused) {
      pauseTimer();
    }

    closeMenu();
  }

  function closeSessionSummary() {
    sessionSummaryModal.hidden = true;
    sessionSummaryModal.style.display = 'none';
    document.body.style.overflow = '';
    setSwipesEnabled(true); // Re-enable swipes when modal is closed

    // Issue #10: Remove focus trap
    removeFocusTrap(sessionSummaryModal);

    // Issue #30: Resume timer when modal closes
    if (timedMode && currentTimer && timerPaused) {
      resumeTimer();
    }
  }

  // Web Share API - Share progress
  function shareSessionResults() {
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;
    const correct = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    const shareText = 'TBank Quiz Results 📊\n\n' +
      `Questions: ${answered}/${questions.length}\n` +
      `Score: ${percentage}% (${correct}/${answered} correct)\n` +
      `Streak: ${bestStreak} correct in a row 🔥\n\n` +
      'Study congenital heart disease with TBank!';

    const shareData = {
      title: 'TBank Quiz Results',
      text: shareText,
      url: window.location.href
    };

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData)
        .then(() => {
          HapticEngine.success();
          showToast('Results shared successfully!', 'success');
        })
        .catch((error) => {
          // User cancelled or error occurred
          if (error.name !== 'AbortError') {
            console.warn('[Share] Error sharing:', error);
            showToast('Unable to share results', 'error');
          }
        });
    } else if (navigator.share) {
      // Fallback for browsers that support share but not canShare
      navigator.share(shareData)
        .then(() => {
          HapticEngine.success();
          showToast('Results shared successfully!', 'success');
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.warn('[Share] Error sharing:', error);
            showToast('Unable to share results', 'error');
          }
        });
    } else {
      // Web Share API not supported - copy to clipboard as fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            HapticEngine.medium();
            showToast('Results copied to clipboard!', 'success');
          })
          .catch((error) => {
            console.warn('[Share] Error copying to clipboard:', error);
            showToast('Unable to share results', 'error');
          });
      } else {
        showToast('Sharing not supported on this device', 'error');
      }
    }
  }

  // Issue #6: Export notes function
  function handleExportNotes() {
    const notes = getAllNotes();
    const noteCount = Object.keys(notes).length;

    if (noteCount === 0) {
      showToast('No notes to export yet. Add notes to questions first!', 'info');
      return;
    }

    const exportText = exportNotesAsText();

    // Try to download as file first
    try {
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `TBank_Notes_${date}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      HapticEngine.success();
      showToast(`Exported ${noteCount} note${noteCount > 1 ? 's' : ''} successfully!`, 'success');
    } catch (_error) {
      // Fallback to clipboard - error intentionally unused
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(exportText)
          .then(() => {
            HapticEngine.medium();
            showToast(`${noteCount} note${noteCount > 1 ? 's' : ''} copied to clipboard!`, 'success');
          })
          .catch((err) => {
            console.warn('[Export Notes] Error:', err);
            showToast('Failed to export notes', 'error');
          });
      } else {
        showToast('Export not supported on this device', 'error');
      }
    }
  }

  // Reset progress function
  function resetProgress() {
    // Close any open modals first
    closeSessionSummary();
    closeSettings();

    if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      return;
    }

    userAnswers = {};
    currentStreak = 0;
    bestStreak = 0;
    milestonesShown = [];
    currentQuestionIndex = 0;
    showWelcome = true; // Reset to show welcome screen

    // Clear saved state from localStorage
    clearState();

    stopTimer();
    closeMenu();

    // Re-initialize to show welcome screen
    initializeQuiz();
    updateStats();

    showToast('Progress reset. Starting fresh!', 'success');
  }

  // Handle skip question (Issue #23)
  function handleSkip() {
    // Mark as skipped
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = {};
    }
    userAnswers[currentQuestionIndex].skipped = true;

    // Save state
    saveState();

    // Update grid
    updateQuestionGrid();

    // Haptic feedback
    HapticEngine.subtle();

    // Move to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      goToNext();
      showToast('Question skipped', 'info');
    } else {
      showToast('No more questions. Review skipped questions from the menu.', 'info');
    }
  }

  // Event listeners
  prevBtn.addEventListener('click', goToPrevious);
  nextBtn.addEventListener('click', goToNext);
  submitBtn.addEventListener('click', handleSubmit);
  skipBtn.addEventListener('click', handleSkip);
  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);

  // Filter button event listeners
  showAllBtn.addEventListener('click', () => filterQuestionGrid('all'));
  showIncorrectBtn.addEventListener('click', () => filterQuestionGrid('incorrect'));
  showUnansweredBtn.addEventListener('click', () => filterQuestionGrid('unanswered'));
  showFlaggedBtn.addEventListener('click', () => filterQuestionGrid('flagged'));

  // Issue #7: Search event listeners
  questionSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm.length > 0) {
      searchQuestions(searchTerm);
      clearSearchBtn.hidden = false;
    } else {
      clearSearch();
    }
  });

  clearSearchBtn.addEventListener('click', clearSearch);

  // New feature event listeners
  settingsBtn.addEventListener('click', openSettings);
  settingsClose.addEventListener('click', closeSettings);
  settingsSaveBtn.addEventListener('click', saveSettings);
  timedModeToggle.addEventListener('change', (e) => {
    timerDurationGroup.hidden = !e.target.checked;
  });
  timerToggleBtn.addEventListener('click', () => {
    if (timerPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  });
  endSessionBtn.addEventListener('click', showSessionSummary);
  exportNotesBtn.addEventListener('click', handleExportNotes);
  resetProgressBtn.addEventListener('click', resetProgress);
  summaryClose.addEventListener('click', closeSessionSummary);
  summaryShare.addEventListener('click', shareSessionResults);
  summaryContinue.addEventListener('click', closeSessionSummary);
  summaryReset.addEventListener('click', resetProgress);

  // Issue #11: Enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts if user is typing in an input/textarea
    const target = e.target;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Don't trigger shortcuts if any modal is open (except menu close with Escape)
    const modalOpen = !settingsModal.hidden || !sessionSummaryModal.hidden;

    // Help modal shortcut (always available)
    if (e.key === '?' && !isTyping) {
      e.preventDefault();
      showKeyboardShortcutsHelp();
      return;
    }

    // Close modals with Escape
    if (e.key === 'Escape') {
      if (!questionMenu.hidden) {
        closeMenu();
        return;
      }
      if (!settingsModal.hidden) {
        closeSettings();
        return;
      }
      if (!sessionSummaryModal.hidden) {
        closeSessionSummary();
        return;
      }
      // Close keyboard shortcuts help if open
      const helpModal = document.getElementById('keyboard-shortcuts-modal');
      if (helpModal && !helpModal.hidden) {
        helpModal.hidden = true;
        document.body.style.overflow = '';
        return;
      }
    }

    // Don't trigger other shortcuts if modal is open or user is typing
    if (modalOpen || isTyping) return;

    // Menu toggle
    if (e.key.toLowerCase() === 'm' && questionMenu.hidden) {
      e.preventDefault();
      openMenu();
      return;
    }

    // Navigation shortcuts (when menu is closed)
    if (questionMenu.hidden) {
      // Arrow key navigation
      if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
        e.preventDefault();
        goToPrevious();
        return;
      }
      if (e.key === 'ArrowRight' && !nextBtn.disabled) {
        e.preventDefault();
        goToNext();
        return;
      }

      // Submit shortcuts
      if ((e.key === 'Enter' || e.key.toLowerCase() === 's') && !submitBtn.disabled && submitBtn.style.display !== 'none') {
        e.preventDefault();
        handleSubmit();
        return;
      }

      // Flag question
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFlag();
        return;
      }

      // Answer selection shortcuts (A-E)
      const answer = userAnswers[currentQuestionIndex];
      const isSubmitted = answer?.submitted;

      if (!isSubmitted) {
        const key = e.key.toLowerCase();
        if (key >= 'a' && key <= 'e') {
          e.preventDefault();
          const answerLetter = key.toUpperCase();
          const question = questions[currentQuestionIndex];

          // Check if this answer choice exists
          const choice = question.answerChoices.find(c => c.letter === answerLetter);
          if (choice) {
            const radio = document.querySelector(`input[name="answer"][value="${answerLetter}"]`);
            if (radio) {
              radio.checked = true;
              // Trigger the change event to update state
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          return;
        }
      }

      // Toggle explanation details (Space key)
      if (e.key === ' ' && isSubmitted) {
        const toggleBtn = document.querySelector('.toggle-details-btn');
        if (toggleBtn) {
          e.preventDefault();
          toggleBtn.click();
          return;
        }
      }
    }
  });

  // Initialize highlighting (only once)
  initializeHighlighting();

  // iOS Keyboard Detection and Modal Adjustment
  function initKeyboardHandling() {
    if (!window.visualViewport) return;

    window.visualViewport.addEventListener('resize', () => {
      const modal = document.querySelector('.modal:not([hidden])');
      if (modal && window.visualViewport.height < window.innerHeight) {
        // Keyboard is open
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.maxHeight = `${window.visualViewport.height * 0.9}px`;
        }
      } else {
        // Keyboard is closed, reset
        const modalContent = modal?.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.maxHeight = '';
        }
      }
    });
  }

  // Performance monitoring (production only)
  function initPerformanceMonitoring() {
    // Only run performance monitoring in production (not localhost)
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      if ('PerformanceObserver' in window) {
        try {
          // Monitor Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.info('[Performance] LCP:', Math.round(lastEntry.startTime), 'ms');
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // Monitor First Input Delay (FID) / Interaction to Next Paint (INP)
          const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              console.info('[Performance] FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

          // Monitor Cumulative Layout Shift (CLS)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            console.info('[Performance] CLS:', clsValue.toFixed(4));
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // Silently fail if PerformanceObserver not supported
        }
      }
    }
  }

  // Offline/Online detection
  function initOfflineSupport() {
    window.addEventListener('offline', () => {
      showToast('You are offline. Your progress is still saved locally.', 'warning');
    });

    window.addEventListener('online', () => {
      showToast('Back online!', 'success');
    });

    // Show initial offline status if offline
    if (!navigator.onLine) {
      setTimeout(() => {
        showToast('You are currently offline. The app will still work!', 'info');
      }, 1000);
    }
  }

  // Service Worker Registration for PWA support
  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/tbank/sw.js')
          .then((registration) => {
            console.info('[App] Service Worker registered successfully:', registration.scope);

            // Cache question banks after registration
            registration.active?.postMessage({ type: 'CACHE_QUESTION_BANKS' });

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch((error) => {
            console.error('[App] Service Worker registration failed:', error);
          });

        // Handle service worker updates
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          console.info('[App] New service worker activated, reloading...');
          window.location.reload();
        });
      });
    } else {
      console.warn('[App] Service Workers are not supported in this browser');
    }
  }

  // PWA Install Prompt
  function initInstallPrompt() {
    let deferredPrompt = null;
    const installPromptShown = localStorage.getItem('installPromptShown');

    // Capture the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt = e;

      console.info('[App] Install prompt available');

      // Show install prompt after user has answered a few questions (engagement check)
      const answeredCount = Object.values(userAnswers).filter(a => a.submitted).length;

      // Show after 5 questions answered, and only if not shown before
      if (answeredCount >= 5 && !installPromptShown) {
        showInstallPrompt(deferredPrompt);
      }
    });

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      console.info('[App] PWA installed successfully');
      localStorage.setItem('installPromptShown', 'true');
      deferredPrompt = null;
      showToast('📱 App installed! Access from your home screen', 'success');
    });
  }

  function showInstallPrompt(deferredPrompt) {
    // Don't show on iOS (they use their own Add to Home Screen flow)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) return;

    const installBanner = document.createElement('div');
    installBanner.className = 'install-prompt';
    installBanner.innerHTML = `
      <div class="install-prompt-content">
        <div class="install-prompt-icon">📱</div>
        <div class="install-prompt-text">
          <strong>Install TBank</strong>
          <p>Add to your home screen for quick access and offline use</p>
        </div>
        <div class="install-prompt-actions">
          <button class="install-prompt-btn install-btn-primary" id="install-accept">Install</button>
          <button class="install-prompt-btn install-btn-secondary" id="install-dismiss">Not now</button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);
    setTimeout(() => installBanner.classList.add('show'), 100);

    // Handle install acceptance
    document.getElementById('install-accept')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.info('[App] Install prompt outcome:', outcome);

        if (outcome === 'accepted') {
          HapticEngine.success();
        }

        localStorage.setItem('installPromptShown', 'true');
        installBanner.remove();
        deferredPrompt = null;
      }
    });

    // Handle dismissal
    document.getElementById('install-dismiss')?.addEventListener('click', () => {
      HapticEngine.light();
      localStorage.setItem('installPromptShown', 'true');
      installBanner.classList.remove('show');
      setTimeout(() => installBanner.remove(), 300);
    });
  }

  // Initialize timer display based on saved settings
  function initTimerSettings() {
    timerDisplay.hidden = !timedMode;
  }

  // Handle page visibility changes for timer
  function initVisibilityHandler() {
    let hiddenTime = null;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - pause timer and record when
        if (timedMode && currentTimer && !timerPaused) {
          hiddenTime = Date.now();
          pauseTimer();
        }
      } else {
        // Page is visible again - resume timer and adjust time
        if (timedMode && currentTimer && timerPaused && hiddenTime) {
          const hiddenDuration = Date.now() - hiddenTime;
          // Adjust questionStartTime to compensate for hidden duration
          if (questionStartTime) {
            questionStartTime += hiddenDuration;
          }
          hiddenTime = null;
          resumeTimer();
        }
      }
    });
  }

  // Initialize app
  initDarkMode();
  initPullToRefreshSetting();
  initTimerSettings();
  initVisibilityHandler();
  loadQuestions();
  initPerformanceMonitoring();
  initKeyboardHandling();
  initPullToRefresh();
  initOfflineSupport();
  initServiceWorker();
  initInstallPrompt();
})();
