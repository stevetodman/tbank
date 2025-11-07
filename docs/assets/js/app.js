(function () {
  // State management
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = {}; // { questionIndex: { selected: 'A', submitted: true, correct: true } }
  let showWelcome = true; // Show welcome screen on first load
  let keyboardHintShown = false; // Track if keyboard hint was shown
  let currentStreak = 0; // Track consecutive correct answers
  let bestStreak = 0; // Track best streak
  let milestonesShown = []; // Track which milestones have been shown

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
  const topicMasterySection = document.getElementById("topic-mastery");
  const topicList = document.getElementById("topic-list");

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
      btn.onclick = () => jumpToQuestion(index);
      questionGrid.appendChild(btn);
    });
  }

  // Render current question
  function renderQuestion() {
    const question = questions[currentQuestionIndex];
    const answer = userAnswers[currentQuestionIndex];
    const isSubmitted = answer?.submitted || false;

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

      html += `<div class="feedback-banner ${isCorrect ? 'correct' : 'incorrect'} feedback-animate">`;
      html += message;
      html += '</div>';
    }

    // Question metadata
    html += '<div class="question-meta">';
    const meta = [question.subject, question.system, question.topic].filter(Boolean).join(' • ');
    if (meta) html += `<p class="meta-text">${meta}</p>`;
    html += '</div>';

    // Question stem
    html += '<div class="question-stem">';

    // Show vignette (clinical case) if present
    if (question.vignette) {
      html += `<p class="vignette">${question.vignette}</p>`;
    }

    // Show question text (the actual question being asked)
    if (question.questionText) {
      html += `<p class="question-text"><strong>${question.questionText}</strong></p>`;
    }

    html += '</div>';

    // Answer choices
    html += '<div class="answer-choices">';
    question.answerChoices.forEach((choice) => {
      const letter = choice.letter;
      const isSelected = answer?.selected === letter;
      const isCorrect = choice.isCorrect;

      let choiceClass = 'answer-choice';
      if (isSubmitted) {
        if (isCorrect) choiceClass += ' answer-correct';
        if (isSelected && !isCorrect) choiceClass += ' answer-incorrect';
      }
      if (isSelected && !isSubmitted) choiceClass += ' answer-selected';

      const disabled = isSubmitted ? 'disabled' : '';
      const checked = isSelected ? 'checked' : '';

      html += `<label class="${choiceClass}">`;
      html += `<input type="radio" name="answer" value="${letter}" ${checked} ${disabled} />`;
      html += `<span class="choice-letter">${letter}</span>`;
      html += `<span class="choice-text">${choice.text}</span>`;
      if (isSubmitted && isCorrect) html += '<span class="choice-icon">✓</span>';
      if (isSubmitted && isSelected && !isCorrect) html += '<span class="choice-icon">✗</span>';
      html += '</label>';
    });
    html += '</div>';

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

    // Update submit button state
    const hasSelection = answer?.selected;
    submitBtn.disabled = !hasSelection || isSubmitted;
    if (isSubmitted) {
      submitBtn.style.display = 'none';
    } else {
      submitBtn.style.display = 'inline-block';
    }
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
      }
      // 'all' shows everything (show = true)

      btn.style.display = show ? '' : 'none';
    });

    // Update active button styling
    showAllBtn.classList.toggle('active', filterType === 'all');
    showIncorrectBtn.classList.toggle('active', filterType === 'incorrect');
    showUnansweredBtn.classList.toggle('active', filterType === 'unanswered');
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

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (questionMenu.hidden) {
      if (e.key === 'ArrowLeft' && !prevBtn.disabled) goToPrevious();
      if (e.key === 'ArrowRight' && !nextBtn.disabled) goToNext();
      if (e.key === 'Enter' && !submitBtn.disabled && submitBtn.style.display !== 'none') handleSubmit();
    }
  });

  // Initialize
  loadQuestions();
})();
