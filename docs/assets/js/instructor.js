/* eslint-env browser */

import { SessionManager, QUESTION_TYPES } from './sessionManager.js';
import { escapeHtml } from './utils.js';

const manager = new SessionManager();
let editingQuestionId = null;

const elements = {
  sessionForm: document.getElementById('session-form'),
  sessionName: document.getElementById('session-name'),
  sessionCode: document.getElementById('session-code'),
  sessionList: document.getElementById('session-list'),
  sessionStats: document.getElementById('session-stats'),
  sessionCount: document.getElementById('session-count'),
  questionCount: document.getElementById('question-count'),
  lastUpdated: document.getElementById('last-updated'),
  sessionPanel: document.getElementById('session-panel'),
  sessionEmpty: document.getElementById('session-empty'),
  sessionContent: document.getElementById('session-content'),
  activeSessionName: document.getElementById('active-session-name'),
  activeSessionCode: document.getElementById('active-session-code'),
  pollingStatus: document.getElementById('polling-status'),
  pollingLabel: document.getElementById('polling-label'),
  currentQuestionLabel: document.getElementById('current-question-label'),
  preparedCount: document.getElementById('prepared-count'),
  questionForm: document.getElementById('question-form'),
  questionFormTitle: document.getElementById('question-form-title'),
  questionType: document.getElementById('question-type'),
  questionPrompt: document.getElementById('question-prompt'),
  questionNotes: document.getElementById('question-notes'),
  questionReference: document.getElementById('question-reference'),
  questionTags: document.getElementById('question-tags'),
  optionsContainer: document.getElementById('options-container'),
  addOptionBtn: document.getElementById('add-option-btn'),
  saveQuestionBtn: document.getElementById('save-question-btn'),
  preparedQuestions: document.getElementById('prepared-questions'),
  startFirstBtn: document.getElementById('start-first-btn'),
  stopPollingBtn: document.getElementById('stop-polling-btn'),
  nextQuestionBtn: document.getElementById('next-question-btn'),
  previousQuestionBtn: document.getElementById('previous-question-btn'),
  renameSessionBtn: document.getElementById('rename-session-btn'),
  editCodeBtn: document.getElementById('edit-code-btn'),
  exportSessionBtn: document.getElementById('export-session-btn'),
  importSessionInput: document.getElementById('import-session-input'),
  deleteSessionBtn: document.getElementById('delete-session-btn'),
  questionCardTemplate: document.getElementById('question-card-template')
};

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Never';
  }

  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    return formatter.format(timestamp);
  } catch (error) {
    console.warn('[Instructor] Failed to format timestamp', error);
    return new Date(timestamp).toLocaleString();
  }
}

function humanizeType(type) {
  switch (type) {
    case 'multiple-choice':
      return 'Multiple choice';
    case 'open-response':
      return 'Open response';
    case 'likert':
      return 'Likert scale';
    case 'image':
      return 'Image prompt';
    default:
      return type;
  }
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function focusElement(element) {
  if (!element) return;
  requestAnimationFrame(() => element.focus({ preventScroll: false }));
}

function getActiveSession() {
  return manager.getActiveSession();
}

function updateSessionStats() {
  const state = manager.getState();
  const sessions = state.sessions;
  const totalQuestions = sessions.reduce((total, session) => total + session.questions.length, 0);

  if (sessions.length === 0) {
    elements.sessionStats.hidden = true;
    return;
  }

  elements.sessionStats.hidden = false;
  elements.sessionCount.textContent = `${sessions.length} prepared session${sessions.length === 1 ? '' : 's'}`;
  elements.questionCount.textContent = `${totalQuestions} total question${totalQuestions === 1 ? '' : 's'}`;
  elements.lastUpdated.textContent = `Last updated ${formatTimestamp(state.lastUpdated)}`;
}

function createSessionButton(session) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.sessionId = session.id;
  button.innerHTML = `
    <strong>${escapeHtml(session.name)}</strong>
    <small>${session.questions.length} question${session.questions.length === 1 ? '' : 's'}</small>
  `;

  if (manager.getState().activeSessionId === session.id) {
    button.classList.add('active');
  }

  button.addEventListener('click', () => {
    manager.setActiveSession(session.id);
    render();
    elements.sessionPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return button;
}

function renderSessionList() {
  const sessions = manager.getSessions();
  clearChildren(elements.sessionList);

  if (sessions.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No sessions prepared yet. Start by creating one above.';
    empty.className = 'empty-state';
    elements.sessionList.appendChild(empty);
    return;
  }

  sessions
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((session) => {
      elements.sessionList.appendChild(createSessionButton(session));
    });
}

function updatePollingStatus(session) {
  if (!session) {
    elements.pollingStatus.dataset.status = 'inactive';
    elements.pollingStatus.textContent = 'Polling inactive';
    elements.pollingLabel.textContent = 'Inactive';
    elements.currentQuestionLabel.textContent = 'None';
    return;
  }

  if (session.isPolling && session.currentQuestionId) {
    elements.pollingStatus.dataset.status = 'live';
    elements.pollingStatus.textContent = 'Live polling';
    elements.pollingLabel.textContent = 'Live';
    const currentQuestion = session.questions.find((question) => question.id === session.currentQuestionId);
    elements.currentQuestionLabel.textContent = currentQuestion ? `Q${currentQuestion.order + 1}` : 'None';
  } else if (session.currentQuestionId && !session.isPolling) {
    elements.pollingStatus.dataset.status = 'staging';
    elements.pollingStatus.textContent = 'Ready to launch';
    elements.pollingLabel.textContent = 'Staging';
    const currentQuestion = session.questions.find((question) => question.id === session.currentQuestionId);
    elements.currentQuestionLabel.textContent = currentQuestion ? `Q${currentQuestion.order + 1}` : 'None';
  } else {
    elements.pollingStatus.dataset.status = 'inactive';
    elements.pollingStatus.textContent = 'Polling inactive';
    elements.pollingLabel.textContent = 'Inactive';
    elements.currentQuestionLabel.textContent = 'None';
  }
}

function renderTags(container, tags) {
  clearChildren(container);
  if (!tags || tags.length === 0) return;

  tags.forEach((tag) => {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.textContent = tag;
    container.appendChild(chip);
  });
}

function renderQuestionCard(question, session) {
  const node = elements.questionCardTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.questionId = question.id;
  node.dataset.active = session.currentQuestionId === question.id ? 'true' : 'false';
  node.querySelector('h3').textContent = `Q${question.order + 1}`;
  node.querySelector('.question-type').textContent = humanizeType(question.type);
  node.querySelector('.question-prompt').textContent = question.prompt;
  renderTags(node.querySelector('.tag-list'), question.tags);

  node.querySelector('.card-actions').addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    switch (action) {
      case 'start':
        manager.setCurrentQuestion(session.id, question.id);
        render();
        break;
      case 'edit':
        beginQuestionEdit(question);
        break;
      case 'move-up':
        manager.reorderQuestion(session.id, question.id, question.order - 1);
        render();
        break;
      case 'move-down':
        manager.reorderQuestion(session.id, question.id, question.order + 1);
        render();
        break;
      case 'delete':
        if (window.confirm('Delete this question? This cannot be undone.')) {
          manager.removeQuestion(session.id, question.id);
          if (editingQuestionId === question.id) {
            resetQuestionForm();
          }
          render();
        }
        break;
      default:
        break;
    }
  });

  return node;
}

function renderPreparedQuestions(session) {
  clearChildren(elements.preparedQuestions);
  if (!session || session.questions.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No questions yet. Use the form above to prepare your poll deck.';
    elements.preparedQuestions.appendChild(empty);
    return;
  }

  session.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((question) => {
      elements.preparedQuestions.appendChild(renderQuestionCard(question, session));
    });
}

function ensureOptionsContainer(type) {
  const shouldShowOptions = type === 'multiple-choice' || type === 'likert';
  elements.optionsContainer.hidden = !shouldShowOptions;
  elements.addOptionBtn.hidden = !shouldShowOptions;

  if (!shouldShowOptions) {
    clearChildren(elements.optionsContainer);
    return;
  }

  if (elements.optionsContainer.childElementCount === 0) {
    const defaults = type === 'likert'
      ? [
          { label: 'Strongly disagree' },
          { label: 'Disagree' },
          { label: 'Neutral' },
          { label: 'Agree' },
          { label: 'Strongly agree' }
        ]
      : [
          { label: 'Option A', isCorrect: true },
          { label: 'Option B' }
        ];

    defaults.forEach((option) => addOptionRow(option));
  }
}

function addOptionRow(option = {}) {
  const row = document.createElement('div');
  row.className = 'option-row';

  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'correct-option';
  radio.value = option.id || '';
  radio.checked = Boolean(option.isCorrect);
  radio.title = 'Mark as correct';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Answer choice';
  input.value = option.label ? option.label : '';
  input.required = true;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.setAttribute('aria-label', 'Remove option');
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(radio);
  row.appendChild(input);
  row.appendChild(removeBtn);
  elements.optionsContainer.appendChild(row);
}

function collectOptions(type) {
  const rows = Array.from(elements.optionsContainer.querySelectorAll('.option-row'));
  const options = [];
  let correctId = null;

  rows.forEach((row, index) => {
    const textInput = row.querySelector('input[type="text"]');
    const radio = row.querySelector('input[type="radio"]');
    const label = textInput.value.trim();
    if (!label) return;

    const id = radio.value || null;
    const optionId = id || `option_${index}_${Date.now()}`;
    const option = {
      id: optionId,
      label,
      value: label,
      order: index,
      isCorrect: type === 'multiple-choice' ? radio.checked : false
    };

    options.push(option);
    if (radio.checked && type === 'multiple-choice') {
      correctId = optionId;
    }
  });

  return { options, correctId };
}

function resetQuestionForm() {
  editingQuestionId = null;
  elements.questionForm.reset();
  elements.questionFormTitle.textContent = 'Prepare a question';
  elements.saveQuestionBtn.textContent = 'Add question';
  ensureOptionsContainer(elements.questionType.value);
}

function beginQuestionEdit(question) {
  editingQuestionId = question.id;
  elements.questionFormTitle.textContent = `Editing Q${question.order + 1}`;
  elements.saveQuestionBtn.textContent = 'Save changes';
  elements.questionType.value = question.type;
  elements.questionPrompt.value = question.prompt;
  elements.questionNotes.value = question.notes || '';
  elements.questionReference.value = question.reference || '';
  elements.questionTags.value = (question.tags || []).join(', ');

  clearChildren(elements.optionsContainer);
  if (question.options && question.options.length > 0) {
    question.options
      .sort((a, b) => a.order - b.order)
      .forEach((option) => addOptionRow(option));
  }

  ensureOptionsContainer(question.type);
  focusElement(elements.questionPrompt);
}

function parseTags(input) {
  if (!input) return [];
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, all) => tag.length > 0 && all.indexOf(tag) === index);
}

function handleSessionCreation(event) {
  event.preventDefault();
  const name = elements.sessionName.value.trim();
  const code = elements.sessionCode.value.trim();

  if (!name) {
    return;
  }

  try {
    const session = manager.createSession({ name, accessCode: code });
    resetQuestionForm();
    render();
    elements.sessionForm.reset();
    focusElement(elements.activeSessionName);
    console.info('[Instructor] Created session', session.id);
  } catch (error) {
    window.alert(error.message);
  }
}

function buildQuestionPayload() {
  const session = getActiveSession();
  if (!session) {
    throw new Error('Select a session before adding questions');
  }

  const type = elements.questionType.value;
  if (!QUESTION_TYPES.includes(type)) {
    throw new Error('Unsupported question type');
  }

  const prompt = elements.questionPrompt.value.trim();
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const tags = parseTags(elements.questionTags.value);
  const notes = elements.questionNotes.value.trim();
  const reference = elements.questionReference.value.trim();

  const payload = {
    type,
    prompt,
    tags,
    notes,
    reference
  };

  if (type === 'multiple-choice' || type === 'likert') {
    const { options, correctId } = collectOptions(type);
    if (options.length < 2) {
      throw new Error('Provide at least two answer options');
    }

    if (type === 'multiple-choice' && !options.some((option) => option.isCorrect)) {
      throw new Error('Select the correct answer');
    }

    payload.options = options.map((option) => ({
      ...option,
      isCorrect: type === 'multiple-choice' ? option.isCorrect : false
    }));

    if (type === 'multiple-choice') {
      payload.correctOptionId = correctId;
      payload.options = payload.options.map((option) => ({
        ...option,
        isCorrect: option.id === correctId
      }));
    }
  }

  return payload;
}

function handleQuestionSubmit(event) {
  event.preventDefault();

  try {
    const payload = buildQuestionPayload();
    const session = getActiveSession();
    if (!session) {
      throw new Error('Select a session before adding questions');
    }

    if (editingQuestionId) {
      manager.updateQuestion(session.id, editingQuestionId, payload);
    } else {
      manager.addQuestion(session.id, payload);
    }

    resetQuestionForm();
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

function handleStartFirstQuestion() {
  const session = getActiveSession();
  if (!session || session.questions.length === 0) return;
  const firstQuestion = session.questions[0];
  manager.setCurrentQuestion(session.id, firstQuestion.id);
  render();
}

function handleNextQuestion() {
  const session = getActiveSession();
  if (!session) return;
  const next = manager.getNextQuestion(session.id);
  if (next) {
    manager.setCurrentQuestion(session.id, next.id);
    render();
  }
}

function handlePreviousQuestion() {
  const session = getActiveSession();
  if (!session) return;
  const prev = manager.getPreviousQuestion(session.id);
  if (prev) {
    manager.setCurrentQuestion(session.id, prev.id);
    render();
  }
}

function handleStopPolling() {
  const session = getActiveSession();
  if (!session) return;
  manager.togglePolling(session.id, false);
  render();
}

function handleRenameSession() {
  const session = getActiveSession();
  if (!session) return;

  const name = window.prompt('Rename session', session.name);
  if (!name) return;
  try {
    manager.renameSession(session.id, name);
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

function handleUpdateCode() {
  const session = getActiveSession();
  if (!session) return;

  const code = window.prompt('Update access code', session.accessCode || '');
  if (code === null) return;
  manager.updateAccessCode(session.id, code);
  render();
}

function handleExportSession() {
  const session = getActiveSession();
  if (!session) return;

  try {
    const json = manager.exportSession(session.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.replace(/\s+/g, '_').toLowerCase()}_session.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    window.alert(error.message);
  }
}

function handleImportSession(event) {
  const session = getActiveSession();
  if (!session) return;

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      manager.importSession(reader.result, { targetSessionId: session.id, replaceExisting: false });
      render();
    } catch (error) {
      window.alert(error.message);
    } finally {
      elements.importSessionInput.value = '';
    }
  };
  reader.readAsText(file);
}

function handleDeleteSession() {
  const session = getActiveSession();
  if (!session) return;

  if (window.confirm(`Delete session "${session.name}"? This cannot be undone.`)) {
    manager.deleteSession(session.id);
    resetQuestionForm();
    render();
  }
}

function renderActiveSession() {
  const session = getActiveSession();

  if (!session) {
    elements.sessionContent.hidden = true;
    elements.sessionEmpty.hidden = false;
    updatePollingStatus(null);
    elements.preparedCount.textContent = '0';
    return;
  }

  elements.sessionEmpty.hidden = true;
  elements.sessionContent.hidden = false;
  elements.activeSessionName.textContent = session.name;
  elements.activeSessionCode.textContent = session.accessCode ? `Access code: ${session.accessCode}` : 'No access code';
  elements.preparedCount.textContent = String(session.questions.length);
  updatePollingStatus(session);
  renderPreparedQuestions(session);
}

function bindEvents() {
  elements.sessionForm?.addEventListener('submit', handleSessionCreation);
  elements.questionForm?.addEventListener('submit', handleQuestionSubmit);
  elements.questionType?.addEventListener('change', (event) => {
    ensureOptionsContainer(event.target.value);
  });
  elements.addOptionBtn?.addEventListener('click', () => addOptionRow());
  elements.startFirstBtn?.addEventListener('click', handleStartFirstQuestion);
  elements.stopPollingBtn?.addEventListener('click', handleStopPolling);
  elements.nextQuestionBtn?.addEventListener('click', handleNextQuestion);
  elements.previousQuestionBtn?.addEventListener('click', handlePreviousQuestion);
  elements.renameSessionBtn?.addEventListener('click', handleRenameSession);
  elements.editCodeBtn?.addEventListener('click', handleUpdateCode);
  elements.exportSessionBtn?.addEventListener('click', handleExportSession);
  elements.importSessionInput?.addEventListener('change', handleImportSession);
  elements.deleteSessionBtn?.addEventListener('click', handleDeleteSession);
}

function render() {
  renderSessionList();
  renderActiveSession();
  updateSessionStats();
}

function init() {
  bindEvents();
  ensureOptionsContainer(elements.questionType.value);
  render();
}

init();
