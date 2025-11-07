(function () {
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
  let timerDuration = 90; // seconds per question
  let currentTimer = null;
  let timerSeconds = 0;
  let timerPaused = false;
  let questionStartTime = null;

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
  const timedModeToggle = document.getElementById("timed-mode-toggle");
  const timerDurationInput = document.getElementById("timer-duration");
  const timerDurationGroup = document.getElementById("timer-duration-group");
  const settingsSaveBtn = document.getElementById("settings-save");
  const endSessionBtn = document.getElementById("end-session-btn");
  const resetProgressBtn = document.getElementById("reset-progress-btn");
  const sessionSummaryModal = document.getElementById("session-summary-modal");
  const summaryContent = document.getElementById("summary-content");
  const summaryClose = document.getElementById("summary-close");
  const summaryContinue = document.getElementById("summary-continue");
  const summaryReset = document.getElementById("summary-reset");

  // Load questions from JSON
  async function loadQuestions() {
    try {
      const response = await fetch("assets/question_banks/all_questions.json");
      if (!response.ok) throw new Error("Failed to load questions");
      const data = await response.json();
      questions = data.questionBank.questions;
      initializeQuiz();
    } catch (error) {
      console.error(error);
      questionDisplay.innerHTML = '<p class="error">Failed to load questions. Please refresh the page.</p>';
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

          <button class="welcome-start-btn" id="start-test-btn">
            Start Test
          </button>

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

    // Add event listener for start button
    document.getElementById('start-test-btn').addEventListener('click', startTest);
  }

  // Start the test
  function startTest() {
    showWelcome = false;
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'inline-block';
    renderQuestion();

    // Show keyboard hint after a moment
    setTimeout(showKeyboardHint, 2000);
  }

  // Show keyboard hint toast
  function showKeyboardHint() {
    if (keyboardHintShown) return;
    keyboardHintShown = true;

    const toast = document.createElement('div');
    toast.className = 'keyboard-hint-toast';
    toast.innerHTML = '💡 Tip: Use ← → arrow keys to navigate';
    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 100);

    // Fade out after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
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

        // Warning at 10 seconds
        if (timerSeconds === 10) {
          timerDisplay.classList.add('timer-warning');
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
      }, 1500);
    }
  }

  // Toggle flag on current question
  function toggleFlag() {
    if (!userAnswers[currentQuestionIndex]) {
      userAnswers[currentQuestionIndex] = {};
    }
    userAnswers[currentQuestionIndex].flagged = !userAnswers[currentQuestionIndex].flagged;
    renderQuestion();
    updateQuestionGrid();
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
    if (meta) html += `<p class="meta-text">${meta}</p>`;

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
      html += `<p class="vignette">${question.vignette}</p>`;
    }

    // Show question text (the actual question being asked)
    if (question.questionText) {
      html += `<p class="question-text" id="question-text-${currentQuestionIndex}"><strong>${question.questionText}</strong></p>`;
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
      html += `<input type="radio" name="answer" value="${letter}" ${checked} ${disabled} />`;
      html += `<span class="choice-letter">${letter}</span>`;
      html += `<span class="choice-text">${choice.text}</span>`;

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
        html += `<div class="explanation-text"><strong>Why ${question.correctAnswer} is correct:</strong><br>${question.explanation.correct}</div>`;
      }

      // Show rationale for user's incorrect answer
      if (!answer.correct && question.explanation?.incorrect) {
        const incorrectRationale = question.explanation.incorrect[answer.selected];
        if (incorrectRationale) {
          html += `<div class="explanation-text"><strong>Why ${answer.selected} is incorrect:</strong><br>${incorrectRationale}</div>`;
        }
      }

      if (question.educationalObjective) {
        html += `<div class="explanation-text"><strong>Educational Objective:</strong><br>${question.educationalObjective}</div>`;
      }

      if (question.keyFacts && question.keyFacts.length > 0) {
        html += '<div class="explanation-text"><strong>Key Facts:</strong><ul>';
        question.keyFacts.forEach(fact => {
          html += `<li>${fact}</li>`;
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
    }

    // Add flag button event listener
    const flagBtn = document.getElementById('flag-btn');
    if (flagBtn) {
      flagBtn.addEventListener('click', toggleFlag);
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

    // Restore scroll position for iOS (prevent scroll to top)
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
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

    // Update streak tracking
    if (isCorrect) {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      // Show streak notification for 3, 5, 10 in a row
      if (currentStreak === 3 || currentStreak === 5 || currentStreak === 10) {
        setTimeout(() => showStreakNotification(currentStreak), 600);
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

    const toast = document.createElement('div');
    toast.className = 'streak-toast';
    toast.innerHTML = messages[streak] || `🔥 ${streak} in a row!`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Check and show milestone celebrations
  function checkMilestones() {
    const answered = Object.values(userAnswers).filter(a => a.submitted).length;
    const milestones = [10, 25, 40, 52];

    milestones.forEach(milestone => {
      if (answered === milestone && !milestonesShown.includes(milestone)) {
        milestonesShown.push(milestone);
        setTimeout(() => showMilestoneCelebration(milestone), 800);
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
      renderQuestion();
    }
  }

  function goToNext() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
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
    updateStats();
    updateTopicMastery();
  }

  function closeMenu() {
    questionMenu.hidden = true;
  }

  // Generic toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Settings modal functions
  function openSettings() {
    settingsModal.hidden = false;
    settingsModal.style.display = 'flex';
    timedModeToggle.checked = timedMode;
    timerDurationInput.value = timerDuration;
    timerDurationGroup.hidden = !timedMode;
  }

  function closeSettings() {
    settingsModal.hidden = true;
    settingsModal.style.display = 'none';
  }

  function saveSettings() {
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

    closeSettings();
    showToast(timedMode ? `Timed mode enabled (${timerDuration}s per question)` : 'Timed mode disabled', 'success');
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
    sessionSummaryModal.hidden = false;
    sessionSummaryModal.style.display = 'flex';
    closeMenu();
  }

  function closeSessionSummary() {
    sessionSummaryModal.hidden = true;
    sessionSummaryModal.style.display = 'none';
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

  // Initialize app
  loadQuestions();
})();
