(function () {
  // State management
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = {}; // { questionIndex: { selected: 'A', submitted: true, correct: true } }
  let showWelcome = true; // Show welcome screen on first load
  let keyboardHintShown = false; // Track if keyboard hint was shown

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

    renderQuestion();
    updateStats();
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

    answeredCount.textContent = `Answered: ${answered}/${questions.length}`;
    correctCount.textContent = `Correct: ${correct}`;
    percentageDisplay.textContent = `${percentage}%`;
  }

  // Menu controls
  function openMenu() {
    questionMenu.hidden = false;
    updateStats();
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
