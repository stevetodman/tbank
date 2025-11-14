const globalScope = typeof globalThis !== 'undefined' ? globalThis : {};
const globalConsole = globalScope.console;
const globalCrypto = globalScope.crypto;

const DEFAULT_STATE = Object.freeze({
  sessions: [],
  activeSessionId: null,
  lastUpdated: 0
});

const QUESTION_TYPES = ['multiple-choice', 'open-response', 'likert', 'image'];

function now() {
  return Date.now();
}

function generateId(prefix = 'id') {
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}_${globalCrypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${now()}`;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function normalizeString(value) {
  if (!value) return '';
  return String(value).trim();
}

function sanitizeTags(tags = []) {
  return tags
    .map((tag) => normalizeString(tag))
    .filter((tag, index, all) => tag.length > 0 && all.indexOf(tag) === index);
}

function buildOption(option, index) {
  const label = normalizeString(option?.label);
  const value = normalizeString(option?.value ?? label);

  return {
    id: option?.id || generateId('option'),
    label,
    value,
    order: typeof option?.order === 'number' ? option.order : index,
    isCorrect: Boolean(option?.isCorrect)
  };
}

function sanitizeQuestionPayload(question, order) {
  const type = normalizeString(question?.type).toLowerCase();
  if (!QUESTION_TYPES.includes(type)) {
    throw new Error(`Unsupported question type: ${question?.type}`);
  }

  const prompt = normalizeString(question?.prompt || question?.questionText);
  if (!prompt) {
    throw new Error('Question prompt is required');
  }

  const explanation = normalizeString(question?.explanation);
  const notes = normalizeString(question?.notes);
  const reference = normalizeString(question?.reference);
  const tags = sanitizeTags(question?.tags || []);
  const media = question?.media && typeof question.media === 'object' ? { ...question.media } : {};

  let options = [];
  let correctOptionId = null;

  if (type === 'multiple-choice' || type === 'likert') {
    const rawOptions = Array.isArray(question?.options) ? question.options : [];
    if (rawOptions.length === 0) {
      throw new Error('Multiple choice and likert questions require options');
    }
    options = rawOptions.map(buildOption);

    if (type === 'multiple-choice') {
      const correctOption = options.find((option) => option.isCorrect);
      if (!correctOption) {
        throw new Error('Multiple choice questions require a correct option');
      }
      correctOptionId = correctOption.id;
    }
  }

  return {
    id: question?.id || generateId('question'),
    type,
    prompt,
    options,
    correctOptionId,
    explanation,
    notes,
    reference,
    tags,
    media,
    createdAt: question?.createdAt || now(),
    updatedAt: now(),
    order
  };
}

function upgradeState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return cloneState(DEFAULT_STATE);
  }

  const state = cloneState(DEFAULT_STATE);
  state.activeSessionId = rawState.activeSessionId || null;
  state.lastUpdated = typeof rawState.lastUpdated === 'number' ? rawState.lastUpdated : now();

  if (Array.isArray(rawState.sessions)) {
    state.sessions = rawState.sessions.map((session) => {
      const questions = Array.isArray(session?.questions)
        ? session.questions.map((question, index) => {
            try {
              return sanitizeQuestionPayload(question, index);
            } catch (error) {
              if (globalConsole && typeof globalConsole.warn === 'function') {
                globalConsole.warn('[SessionManager] Skipping invalid question during upgrade', error);
              }
              return null;
            }
          }).filter(Boolean)
        : [];

      return {
        id: session?.id || generateId('session'),
        name: normalizeString(session?.name) || 'Untitled Session',
        accessCode: normalizeString(session?.accessCode),
        createdAt: session?.createdAt || now(),
        updatedAt: now(),
        currentQuestionId: session?.currentQuestionId || null,
        isPolling: Boolean(session?.isPolling),
        questions
      };
    });
  }

  return state;
}

export class SessionManager {
  constructor(storage, storageKey = 'tbank.instructor.state') {
    if (!storage) {
      const localStorage = globalScope.localStorage;
      if (localStorage) {
        this.storage = localStorage;
      } else {
        const memoryStore = new Map();
        this.storage = {
          getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) : null),
          setItem: (key, value) => memoryStore.set(key, String(value)),
          removeItem: (key) => memoryStore.delete(key),
          clear: () => memoryStore.clear()
        };
      }
    } else {
      this.storage = storage;
    }

    this.storageKey = storageKey;
    this.state = this._loadState();
  }

  _loadState() {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) {
        return cloneState(DEFAULT_STATE);
      }
      const parsed = JSON.parse(raw);
      return upgradeState(parsed);
    } catch (error) {
      if (globalConsole && typeof globalConsole.warn === 'function') {
        globalConsole.warn('[SessionManager] Failed to load state, resetting', error);
      }
      return cloneState(DEFAULT_STATE);
    }
  }

  _persist() {
    const state = { ...this.state, lastUpdated: now() };
    this.storage.setItem(this.storageKey, JSON.stringify(state));
  }

  _updateSession(sessionId, updater) {
    const sessionIndex = this.state.sessions.findIndex((session) => session.id === sessionId);
    if (sessionIndex === -1) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const session = this.state.sessions[sessionIndex];
    const updatedSession = { ...session };
    const result = updater(updatedSession);
    this.state.sessions[sessionIndex] = { ...updatedSession, updatedAt: now() };
    this._persist();
    return result ?? this.state.sessions[sessionIndex];
  }

  getState() {
    return cloneState(this.state);
  }

  getSessions() {
    return this.state.sessions.map((session) => ({ ...session, questions: [...session.questions] }));
  }

  getActiveSession() {
    if (!this.state.activeSessionId) return null;
    return this.getSessionById(this.state.activeSessionId);
  }

  getSessionById(sessionId) {
    const session = this.state.sessions.find((item) => item.id === sessionId);
    if (!session) return null;
    return {
      ...session,
      questions: session.questions.map((question) => ({ ...question, options: question.options.map((option) => ({ ...option })) }))
    };
  }

  createSession({ name, accessCode } = {}) {
    const normalizedName = normalizeString(name);
    if (!normalizedName) {
      throw new Error('Session name is required');
    }

    const session = {
      id: generateId('session'),
      name: normalizedName,
      accessCode: normalizeString(accessCode),
      createdAt: now(),
      updatedAt: now(),
      currentQuestionId: null,
      isPolling: false,
      questions: []
    };

    this.state.sessions.push(session);
    this.state.activeSessionId = session.id;
    this._persist();
    return this.getSessionById(session.id);
  }

  renameSession(sessionId, name) {
    const normalizedName = normalizeString(name);
    if (!normalizedName) {
      throw new Error('Session name cannot be empty');
    }

    this._updateSession(sessionId, (session) => {
      session.name = normalizedName;
    });
    return this.getSessionById(sessionId);
  }

  updateAccessCode(sessionId, accessCode) {
    this._updateSession(sessionId, (session) => {
      session.accessCode = normalizeString(accessCode);
    });
    return this.getSessionById(sessionId);
  }

  deleteSession(sessionId) {
    const index = this.state.sessions.findIndex((session) => session.id === sessionId);
    if (index === -1) {
      return false;
    }

    this.state.sessions.splice(index, 1);
    if (this.state.activeSessionId === sessionId) {
      this.state.activeSessionId = this.state.sessions[0]?.id || null;
    }
    this._persist();
    return true;
  }

  setActiveSession(sessionId) {
    if (sessionId === null) {
      this.state.activeSessionId = null;
      this._persist();
      return null;
    }

    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    this.state.activeSessionId = sessionId;
    this._persist();
    return session;
  }

  addQuestion(sessionId, question) {
    let createdQuestion;
    this._updateSession(sessionId, (session) => {
      const order = session.questions.length;
      createdQuestion = sanitizeQuestionPayload(question, order);
      session.questions.push(createdQuestion);
    });
    return this.getQuestion(sessionId, createdQuestion.id);
  }

  updateQuestion(sessionId, questionId, updates) {
    let updatedQuestion = null;
    this._updateSession(sessionId, (session) => {
      const index = session.questions.findIndex((question) => question.id === questionId);
      if (index === -1) {
        throw new Error(`Question not found: ${questionId}`);
      }

      const merged = { ...session.questions[index], ...updates };
      const sanitized = sanitizeQuestionPayload(merged, session.questions[index].order);
      session.questions[index] = sanitized;
      updatedQuestion = sanitized;
    });
    return this.getQuestion(sessionId, updatedQuestion.id);
  }

  removeQuestion(sessionId, questionId) {
    let removed = false;
    this._updateSession(sessionId, (session) => {
      const index = session.questions.findIndex((question) => question.id === questionId);
      if (index === -1) {
        return;
      }

      session.questions.splice(index, 1);
      session.questions.forEach((question, idx) => {
        question.order = idx;
      });
      if (session.currentQuestionId === questionId) {
        session.currentQuestionId = null;
        session.isPolling = false;
      }
      removed = true;
    });
    return removed;
  }

  reorderQuestion(sessionId, questionId, targetIndex) {
    if (targetIndex < 0) {
      targetIndex = 0;
    }

    this._updateSession(sessionId, (session) => {
      const index = session.questions.findIndex((question) => question.id === questionId);
      if (index === -1) {
        throw new Error(`Question not found: ${questionId}`);
      }

      const [question] = session.questions.splice(index, 1);
      const boundedIndex = Math.min(targetIndex, session.questions.length);
      session.questions.splice(boundedIndex, 0, question);
      session.questions.forEach((item, idx) => {
        item.order = idx;
      });
    });
    return this.getQuestion(sessionId, questionId);
  }

  setCurrentQuestion(sessionId, questionId) {
    this._updateSession(sessionId, (session) => {
      if (questionId === null) {
        session.currentQuestionId = null;
        session.isPolling = false;
        return;
      }

      const exists = session.questions.some((question) => question.id === questionId);
      if (!exists) {
        throw new Error(`Question not found: ${questionId}`);
      }

      session.currentQuestionId = questionId;
      session.isPolling = true;
    });
    return this.getQuestion(sessionId, questionId);
  }

  togglePolling(sessionId, isPolling) {
    this._updateSession(sessionId, (session) => {
      session.isPolling = Boolean(isPolling);
      if (!session.isPolling) {
        session.currentQuestionId = null;
      }
    });
    return this.getSessionById(sessionId);
  }

  getQuestion(sessionId, questionId) {
    const session = this.getSessionById(sessionId);
    if (!session) return null;
    const question = session.questions.find((item) => item.id === questionId);
    return question ? { ...question, options: question.options.map((option) => ({ ...option })) } : null;
  }

  getNextQuestion(sessionId) {
    const session = this.getSessionById(sessionId);
    if (!session || session.questions.length === 0) return null;

    if (!session.currentQuestionId) {
      return session.questions[0];
    }

    const currentIndex = session.questions.findIndex((question) => question.id === session.currentQuestionId);
    const nextIndex = Math.min(currentIndex + 1, session.questions.length - 1);
    return session.questions[nextIndex];
  }

  getPreviousQuestion(sessionId) {
    const session = this.getSessionById(sessionId);
    if (!session || session.questions.length === 0) return null;

    if (!session.currentQuestionId) {
      return session.questions[0];
    }

    const currentIndex = session.questions.findIndex((question) => question.id === session.currentQuestionId);
    const previousIndex = Math.max(currentIndex - 1, 0);
    return session.questions[previousIndex];
  }

  exportSession(sessionId) {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return JSON.stringify({ version: 1, session }, null, 2);
  }

  importSession(payload, { replaceExisting = false, targetSessionId } = {}) {
    let data = payload;
    if (typeof payload === 'string') {
      try {
        data = JSON.parse(payload);
      } catch {
        throw new Error('Invalid JSON payload');
      }
    }

    if (data?.session) {
      return this._importSessionObject(data.session, { replaceExisting, targetSessionId });
    }

    if (Array.isArray(data?.sessions)) {
      return data.sessions.map((session) =>
        this._importSessionObject(session, { replaceExisting, targetSessionId })
      );
    }

    throw new Error('Unsupported import format');
  }

  _importSessionObject(sessionData, { replaceExisting, targetSessionId }) {
    const sanitizedQuestions = Array.isArray(sessionData?.questions)
      ? sessionData.questions.map((question, index) => sanitizeQuestionPayload(question, index))
      : [];

    if (targetSessionId) {
      this._updateSession(targetSessionId, (session) => {
        session.questions = replaceExisting ? sanitizedQuestions : [...session.questions, ...sanitizedQuestions];
        session.questions.forEach((question, index) => {
          question.order = index;
        });
      });
      return this.getSessionById(targetSessionId);
    }

    const session = {
      id: sessionData?.id || generateId('session'),
      name: normalizeString(sessionData?.name) || 'Imported Session',
      accessCode: normalizeString(sessionData?.accessCode),
      createdAt: sessionData?.createdAt || now(),
      updatedAt: now(),
      currentQuestionId: null,
      isPolling: false,
      questions: sanitizedQuestions
    };

    this.state.sessions.push(session);
    this.state.activeSessionId = session.id;
    this._persist();
    return this.getSessionById(session.id);
  }
}

export { QUESTION_TYPES };
