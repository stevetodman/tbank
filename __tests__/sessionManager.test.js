import { beforeEach, describe, expect, it } from 'vitest';
import { SessionManager } from '../docs/assets/js/sessionManager.js';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

function buildMultipleChoiceQuestion(prompt = 'Sample prompt?') {
  return {
    type: 'multiple-choice',
    prompt,
    options: [
      { label: 'First option', isCorrect: true },
      { label: 'Second option' }
    ],
    tags: ['cardiology'],
    reference: 'https://example.com'
  };
}

describe('SessionManager', () => {
  let storage;
  let manager;

  beforeEach(() => {
    storage = new MemoryStorage();
    manager = new SessionManager(storage, 'test-key');
  });

  it('creates a session and sets it active', () => {
    const session = manager.createSession({ name: 'Morning Lecture', accessCode: 'MS2-2025' });
    expect(session.name).toBe('Morning Lecture');
    expect(manager.getState().activeSessionId).toBe(session.id);
    expect(manager.getSessions()).toHaveLength(1);
  });

  it('adds questions with incremented order', () => {
    const session = manager.createSession({ name: 'Demo' });
    const questionA = manager.addQuestion(session.id, buildMultipleChoiceQuestion('First?'));
    const questionB = manager.addQuestion(session.id, buildMultipleChoiceQuestion('Second?'));

    expect(questionA.order).toBe(0);
    expect(questionB.order).toBe(1);
    const stored = manager.getSessionById(session.id);
    expect(stored.questions).toHaveLength(2);
    expect(stored.questions[0].options.some((option) => option.isCorrect)).toBe(true);
  });

  it('reorders questions and preserves order metadata', () => {
    const session = manager.createSession({ name: 'Reorder' });
    const first = manager.addQuestion(session.id, buildMultipleChoiceQuestion('A?'));
    const second = manager.addQuestion(session.id, buildMultipleChoiceQuestion('B?'));
    const third = manager.addQuestion(session.id, buildMultipleChoiceQuestion('C?'));

    manager.reorderQuestion(session.id, third.id, 0);
    const reordered = manager.getSessionById(session.id);

    expect(reordered.questions[0].id).toBe(third.id);
    expect(reordered.questions[0].order).toBe(0);
    expect(reordered.questions[1].order).toBe(1);
    expect(reordered.questions[2].order).toBe(2);

    manager.reorderQuestion(session.id, first.id, 2);
    const reReordered = manager.getSessionById(session.id);
    expect(reReordered.questions[2].id).toBe(first.id);
  });

  it('sets current question and toggles polling state', () => {
    const session = manager.createSession({ name: 'Poll' });
    const question = manager.addQuestion(session.id, buildMultipleChoiceQuestion());

    manager.setCurrentQuestion(session.id, question.id);
    let updated = manager.getSessionById(session.id);
    expect(updated.currentQuestionId).toBe(question.id);
    expect(updated.isPolling).toBe(true);

    manager.togglePolling(session.id, false);
    updated = manager.getSessionById(session.id);
    expect(updated.currentQuestionId).toBeNull();
    expect(updated.isPolling).toBe(false);
  });

  it('exports and imports session payload', () => {
    const session = manager.createSession({ name: 'Export Demo' });
    manager.addQuestion(session.id, buildMultipleChoiceQuestion('Example?'));

    const exported = manager.exportSession(session.id);
    expect(exported).toContain('Export Demo');

    const newManager = new SessionManager(new MemoryStorage(), 'import-key');
    const importedSession = newManager.importSession(exported);
    expect(importedSession.name).toBe('Export Demo');
    expect(importedSession.questions).toHaveLength(1);
  });

  it('throws on unsupported question type', () => {
    const session = manager.createSession({ name: 'Errors' });
    expect(() =>
      manager.addQuestion(session.id, {
        type: 'essay',
        prompt: 'Unsupported question',
        options: []
      })
    ).toThrow(/Unsupported question type/);
  });

  it('rejects multiple choice questions without a correct option', () => {
    const session = manager.createSession({ name: 'Validation' });
    expect(() =>
      manager.addQuestion(session.id, {
        type: 'multiple-choice',
        prompt: 'Pick one',
        options: [
          { label: 'Option 1' },
          { label: 'Option 2' }
        ]
      })
    ).toThrow(/correct option/);
  });
});
