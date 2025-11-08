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
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Haptic feedback engine for iOS/mobile devices
  const HapticEngine = {
    isSupported: 'vibrate' in navigator,

    // Light tap feedback (10ms) - for selections, toggles
    light: function() {
      if (this.isSupported) {
        navigator.vibrate(10);
      }
    },

    // Medium tap feedback (20ms) - for confirmations
    medium: function() {
      if (this.isSupported) {
        navigator.vibrate(20);
      }
    },

    // Success pattern - for correct answers, achievements
    success: function() {
      if (this.isSupported) {
        navigator.vibrate([15, 50, 20]);
      }
    },

    // Error pattern - for incorrect answers
    error: function() {
      if (this.isSupported) {
        navigator.vibrate([10, 40, 10, 40, 10]);
      }
    },

    // Warning pattern - for timer warnings
    warning: function() {
      if (this.isSupported) {
        navigator.vibrate(200);
      }
    },

    // Celebration pattern - for milestones
    celebration: function() {
      if (this.isSupported) {
        navigator.vibrate([20, 60, 20, 60, 30]);
      }
    },

    // Subtle feedback - for navigation, minimal disruption (5ms)
    subtle: function() {
      if (this.isSupported) {
        navigator.vibrate(5);
      }
    }
  };

  // Swipe gesture detection for mobile
  function initSwipeGesture(element, options = {}) {
    const minSwipeDistance = options.minDistance || 60;
    const maxVerticalDistance = options.maxVerticalDistance || 80;
    const threshold = options.threshold || 30;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    element.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = false;
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
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
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Reset visual state
      element.classList.remove('swiping', 'swipe-left-hint', 'swipe-right-hint');
      element.style.transform = '';

      // Only trigger if it's a valid swipe
      if (!isSwiping || deltaY > maxVerticalDistance) {
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
    }, { passive: true });
  }

  // State management
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = {}; // { questionIndex: { selected: 'A', submitted: true, correct: true, timeSpent: 45, flagged: false, eliminated: [], highlights: [] } }
  let showWelcome = true; // Show welcome screen on first load
  let keyboardHintShown = false; // Track if keyboard hint was shown
  let currentStreak = 0; // Track consecutive correct answers
  let bestStreak = 0; // Track best streak
  let milestonesShown = []; // Track which milestones have been shown

  // Timer state
  let timedMode = false;
  let timerDuration = CONSTANTS.DEFAULT_TIMER_DURATION; // seconds per question
  let currentTimer = null;
  let timerSeconds = 0;
  let timerPaused = false;
  let questionStartTime = null;

  // Dark mode state
  let darkModeEnabled = false;

  // Pull-to-refresh state
  let pullToRefreshEnabled = false;

  // Highlighting state
  let highlightToolbar = null;
  let currentSelection = null;

  // DOM elements
  const questionDisplay = document.getElementById("question-display");
  const questionCounter = document.getElementById("question-counter");
  const progressBar = document.getElementById("progress-bar");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const questionMenu = document.getElementById("question-menu");
  const questionGrid = document.getElementById("question-grid");
  const answeredCount = document.getElementById("answered-count");
  const correctCount = document.getElementById("correct-count");
  const percentageDisplay = document.getElementById("percentage");
  const showAllBtn = document.getElementById("show-all-btn");
  const showIncorrectBtn = document.getElementById("show-incorrect-btn");
  const showUnansweredBtn = document.getElementById("show-unanswered-btn");
  const showFlaggedBtn = document.getElementById("show-flagged-btn");
  const topicMasterySection = document.getElementById("topic-mastery");
  const topicList = document.getElementById("topic-list");

  // New feature elements
  const timerDisplay = document.getElementById("timer-display");
  const timerText = document.getElementById("timer-text");
  const timerToggleBtn = document.getElementById("timer-toggle");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const settingsClose = document.getElementById("settings-close");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const pullToRefreshToggle = document.getElementById("pull-to-refresh-toggle");
  const timedModeToggle = document.getElementById("timed-mode-toggle");
  const timerDurationInput = document.getElementById("timer-duration");
  const timerDurationGroup = document.getElementById("timer-duration-group");
  const settingsSaveBtn = document.getElementById("settings-save");
  const endSessionBtn = document.getElementById("end-session-btn");
  const resetProgressBtn = document.getElementById("reset-progress-btn");
  const sessionSummaryModal = document.getElementById("session-summary-modal");
  const summaryContent = document.getElementById("summary-content");
  const summaryClose = document.getElementById("summary-close");
  const summaryShare = document.getElementById("summary-share");
  const summaryContinue = document.getElementById("summary-continue");
  const summaryReset = document.getElementById("summary-reset");

  // Load questions from JSON
  async function loadQuestions() {
    // Show loading indicator
    questionDisplay.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <div class="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    `;

    try {
      const response = await fetch("assets/question_banks/all_questions.json");
      if (!response.ok) throw new Error("Failed to load questions");
      const data = await response.json();
      questions = data.questionBank.questions;
      initializeQuiz();
    } catch (error) {
      console.error('Failed to load questions:', error);
      const errorMessage = error.message && error.message.includes('fetch')
        ? 'Network error. Please check your connection and refresh the page.'
        : 'Error loading questions. Please try refreshing the page.';
      questionDisplay.innerHTML = `<p class="error">${escapeHtml(errorMessage)}</p>`;
    }
  }

  // Initialize quiz
  function initializeQuiz() {
    if (questions.length === 0) return;
    buildQuestionGrid();

    // Show welcome screen or go straight to questions
    if (showWelcome) {
      renderWelcomeScreen();
    } else {
      renderQuestion();
    }
  }

  // Render welcome screen
  function renderWelcomeScreen() {
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

          <div class="keyboard-shortcuts">
            <p><strong>Keyboard shortcuts:</strong></p>
            <p>← → Navigate questions  •  Enter Submit answer</p>
          </div>
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
        content: `TBank is optimized for mobile learning with advanced features designed to enhance your study experience. Let's explore what makes it special!`,
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

  // Show keyboard hint toast
  function showKeyboardHint() {
    if (keyboardHintShown) return;
    keyboardHintShown = true;
    showToast('💡 Tip: Use ← → arrow keys to navigate', 'info');
  }

  // Build question grid for menu
  function buildQuestionGrid() {
    questionGrid.innerHTML = "";
    questions.forEach((q, index) => {
      const btn = document.createElement("button");
      btn.className = "grid-question-btn";
      btn.textContent = index + 1;

      // Add flag indicator if question is flagged
      if (userAnswers[index]?.flagged) {
        const flagIcon = document.createElement("span");
        flagIcon.className = "grid-flag-icon";
        flagIcon.textContent = "🚩";
        btn.appendChild(flagIcon);
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
    timerDisplay.classList.remove('timer-warning');

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
  }

  function resumeTimer() {
    timerPaused = false;
    timerToggleBtn.textContent = '⏸';
    timerToggleBtn.setAttribute('aria-label', 'Pause timer');
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    }, { passive: true });

    // Handle touch move
    questionDisplay.addEventListener('touchmove', (e) => {
      // Only proceed if enabled and started from top
      if (!pullToRefreshEnabled || pullStartY === 0) return;

      if (questionDisplay.scrollTop === 0) {
        const pullDistance = e.touches[0].clientY - pullStartY;

        // Only start showing indicator after 40px pull (prevents accidental triggers)
        if (pullDistance > 40) {
          pulling = true;
          updatePullIndicator(pullDistance - 40); // Offset by 40px

          // Prevent default scrolling when pulling significantly
          if (pullDistance > 50) {
            e.preventDefault();
          }
        }
      }
    }, { passive: false });

    // Handle touch end
    questionDisplay.addEventListener('touchend', (e) => {
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
        newUserAnswers[newIndex] = { ...userAnswers[oldIndex] };
      }
    });

    // Shuffle the questions array
    const shuffledQuestions = shuffledIndices.map(i => questions[i]);
    questions.splice(0, questions.length, ...shuffledQuestions);

    // Update user answers with new indices
    userAnswers = newUserAnswers;

    // Reset to first question
    currentQuestionIndex = 0;

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

  function handleTextSelection(e) {
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

    // Update header
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
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
      html += `<input type="radio" name="answer" value="${escapeHtml(letter)}" ${checked} ${disabled} />`;
      html += `<span class="choice-letter">${escapeHtml(letter)}</span>`;
      html += `<span class="choice-text">${escapeHtml(choice.text)}</span>`;

      // Add eliminate button (only show before submission)
      if (!isSubmitted) {
        html += `<button class="eliminate-btn" data-choice="${letter}" type="button">
          ${isEliminated ? 'Undo' : 'Cross out'}
        </button>`;
      }

      if (isSubmitted && isCorrect) html += '<span class="choice-icon">✓</span>';
      if (isSubmitted && isSelected && !isCorrect) html += '<span class="choice-icon">✗</span>';
      html += '</label>';
    });
    html += '</fieldset>';

    // Explanation (shown after submission)
    if (isSubmitted) {
      html += '<div class="explanation-section">';
      html += '<h3>Explanation</h3>';

      if (question.explanation?.correct) {
        html += `<div class="explanation-text"><strong>Why ${escapeHtml(question.correctAnswer)} is correct:</strong><br>${escapeHtml(question.explanation.correct)}</div>`;
      }

      // Show rationale for user's incorrect answer
      if (!answer.correct && question.explanation?.incorrect) {
        const incorrectRationale = question.explanation.incorrect[answer.selected];
        if (incorrectRationale) {
          html += `<div class="explanation-text"><strong>Why ${escapeHtml(answer.selected)} is incorrect:</strong><br>${escapeHtml(incorrectRationale)}</div>`;
        }
      }

      if (question.educationalObjective) {
        html += `<div class="explanation-text"><strong>Educational Objective:</strong><br>${escapeHtml(question.educationalObjective)}</div>`;
      }

      if (question.keyFacts && question.keyFacts.length > 0) {
        html += '<div class="explanation-text"><strong>Key Facts:</strong><ul>';
        question.keyFacts.forEach(fact => {
          html += `<li>${escapeHtml(fact)}</li>`;
        });
        html += '</ul></div>';
      }

      html += '</div>';
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

            // Double tap detected (within 500ms)
            if (tapLength < 500 && tapLength > 0) {
              e.preventDefault();

              // Get the radio button in this choice
              const radio = choiceElement.querySelector('input[name="answer"]');
              if (radio && !radio.disabled) {
                // Select the answer if not already selected
                if (!radio.checked) {
                  radio.checked = true;
                  handleAnswerSelection({ target: radio });
                }

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

      flagBtn.addEventListener('touchstart', (e) => {
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
          longPressTriggered = true;
          HapticEngine.medium();
          showQuickNavMenu();
        }, 500); // 500ms for long press
      }, { passive: true });

      flagBtn.addEventListener('touchend', (e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
        if (!longPressTriggered) {
          toggleFlag();
        }
      });

      flagBtn.addEventListener('touchcancel', (e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
      });

      // For desktop/non-touch devices, use regular click
      flagBtn.addEventListener('click', (e) => {
        // Only handle click if it's not a touch device
        if (!('ontouchstart' in window)) {
          toggleFlag();
        }
      });

      // Also support mousedown/mouseup for desktop long-press
      flagBtn.addEventListener('mousedown', (e) => {
        if ('ontouchstart' in window) return; // Skip on touch devices
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
          longPressTriggered = true;
          showQuickNavMenu();
        }, 500);
      });

      flagBtn.addEventListener('mouseup', (e) => {
        if ('ontouchstart' in window) return;
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
        // Click is handled by the click event listener
      });

      flagBtn.addEventListener('mouseleave', (e) => {
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
          onSwipeLeft: (element) => {
            // Swipe left to eliminate (only if not already eliminated)
            if (!isEliminated) {
              toggleElimination(letter);
            }
          },
          onSwipeRight: (element) => {
            // Swipe right to undo elimination (only if eliminated)
            const currentEliminated = userAnswers[currentQuestionIndex]?.eliminated?.includes(letter) || false;
            if (currentEliminated) {
              toggleElimination(letter);
            }
          }
        });
      });
    }

    // Update submit button state
    const hasSelection = answer?.selected;
    submitBtn.disabled = !hasSelection || isSubmitted;
    if (isSubmitted) {
      submitBtn.style.display = 'none';
    } else {
      submitBtn.style.display = 'inline-block';
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
    if (window.innerWidth <= 768 && !isSubmitted) {
      const questionContent = document.querySelector('.question-content');
      if (questionContent) {
        initSwipeGesture(questionContent, {
          minDistance: 80, // Longer swipe required for question navigation
          maxVerticalDistance: 100,
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

    // Scroll to top of question display on mobile for better UX
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (window.innerWidth <= 768) {
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

    renderQuestion();
    updateStats();

    // Check for milestone celebrations
    checkMilestones();
  }

  // Show streak notification
  function showStreakNotification(streak) {
    const messages = {
      3: '🔥 3 in a row! You\'re on fire!',
      5: '🌟 5 correct in a row! Amazing streak!',
      10: '🎯 10 in a row! Incredible mastery!'
    };

    // Celebration haptic for streak milestones
    HapticEngine.celebration();

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
      renderQuestion();
    }
  }

  function goToNext() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      HapticEngine.subtle(); // Subtle haptic for navigation
      renderQuestion();
    }
  }

  function jumpToQuestion(index) {
    currentQuestionIndex = index;
    renderQuestion();
    closeMenu();
  }

  // Update navigation buttons
  function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
  }

  // Update progress bar
  function updateProgressBar() {
    const answeredQuestions = Object.values(userAnswers).filter(a => a.submitted).length;
    const percentage = (answeredQuestions / questions.length) * 100;
    progressBar.style.width = `${percentage}%`;
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
    updateStats();
    updateTopicMastery();
  }

  function closeMenu() {
    questionMenu.hidden = true;
    document.body.style.overflow = '';
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

  // Dark mode functions
  function initDarkMode() {
    // Check localStorage for saved preference
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedDarkMode !== null) {
      // User has manually set a preference
      darkModeEnabled = savedDarkMode === 'true';
    } else {
      // No saved preference, check system preference
      darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    applyDarkMode();
  }

  function applyDarkMode() {
    if (darkModeEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
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
    darkModeToggle.checked = darkModeEnabled;
    pullToRefreshToggle.checked = pullToRefreshEnabled;
    timedModeToggle.checked = timedMode;
    timerDurationInput.value = timerDuration;
    timerDurationGroup.hidden = !timedMode;
  }

  function closeSettings() {
    settingsModal.hidden = true;
    settingsModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function saveSettings() {
    // Save dark mode setting
    toggleDarkMode(darkModeToggle.checked);

    // Save pull-to-refresh setting
    pullToRefreshEnabled = pullToRefreshToggle.checked;
    localStorage.setItem('pullToRefresh', pullToRefreshEnabled.toString());

    // Save timer settings
    const wasTimedMode = timedMode;
    timedMode = timedModeToggle.checked;
    timerDuration = parseInt(timerDurationInput.value);

    // Show/hide timer display
    timerDisplay.hidden = !timedMode;

    // If switching from untimed to timed mode on current question
    if (!wasTimedMode && timedMode && !userAnswers[currentQuestionIndex]?.submitted) {
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

  // Session summary functions
  function showSessionSummary() {
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

    let html = `
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
    closeMenu();
  }

  function closeSessionSummary() {
    sessionSummaryModal.hidden = true;
    sessionSummaryModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Web Share API - Share progress
  function shareSessionResults() {
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;
    const correct = Object.values(userAnswers).filter(a => a.submitted && a.correct).length;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    const shareText = `TBank Quiz Results 📊\n\n` +
      `Questions: ${answered}/${questions.length}\n` +
      `Score: ${percentage}% (${correct}/${answered} correct)\n` +
      `Streak: ${bestStreak} correct in a row 🔥\n\n` +
      `Study congenital heart disease with TBank!`;

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

    stopTimer();
    closeMenu();

    // Re-initialize to show welcome screen
    initializeQuiz();
    updateStats();

    showToast('Progress reset. Starting fresh!', 'success');
  }

  // Event listeners
  prevBtn.addEventListener('click', goToPrevious);
  nextBtn.addEventListener('click', goToNext);
  submitBtn.addEventListener('click', handleSubmit);
  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);

  // Filter button event listeners
  showAllBtn.addEventListener('click', () => filterQuestionGrid('all'));
  showIncorrectBtn.addEventListener('click', () => filterQuestionGrid('incorrect'));
  showUnansweredBtn.addEventListener('click', () => filterQuestionGrid('unanswered'));
  showFlaggedBtn.addEventListener('click', () => filterQuestionGrid('flagged'));

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
  resetProgressBtn.addEventListener('click', resetProgress);
  summaryClose.addEventListener('click', closeSessionSummary);
  summaryShare.addEventListener('click', shareSessionResults);
  summaryContinue.addEventListener('click', closeSessionSummary);
  summaryReset.addEventListener('click', resetProgress);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (questionMenu.hidden) {
      if (e.key === 'ArrowLeft' && !prevBtn.disabled) goToPrevious();
      if (e.key === 'ArrowRight' && !nextBtn.disabled) goToNext();
      if (e.key === 'Enter' && !submitBtn.disabled && submitBtn.style.display !== 'none') handleSubmit();
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
        } catch (e) {
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
            console.log('[App] Service Worker registered successfully:', registration.scope);

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
          console.log('[App] New service worker activated, reloading...');
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

      console.log('[App] Install prompt available');

      // Show install prompt after user has answered a few questions (engagement check)
      const answeredCount = Object.values(userAnswers).filter(a => a.submitted).length;

      // Show after 5 questions answered, and only if not shown before
      if (answeredCount >= 5 && !installPromptShown) {
        showInstallPrompt(deferredPrompt);
      }
    });

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[App] PWA installed successfully');
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
        console.log('[App] Install prompt outcome:', outcome);

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

  // Initialize app
  initDarkMode();
  initPullToRefreshSetting();
  loadQuestions();
  initPerformanceMonitoring();
  initKeyboardHandling();
  initPullToRefresh();
  initOfflineSupport();
  initServiceWorker();
  initInstallPrompt();
})();
