// Utility functions for TBank
// These functions are used by app.js and can be tested independently

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} unsafe - Potentially unsafe HTML string
 * @returns {string} - Escaped HTML string safe for insertion
 */
export function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (modifies in place)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Normalize text for searching (lowercase, trim)
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export function normalizeText(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim();
}

/**
 * Calculate percentage with rounding
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(correct, total) {
  if (!total || total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Format time in seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatTime(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds); // Floor to handle decimals
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate question bank data structure
 * @param {Object} data - Question bank data
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
export function validateQuestionBank(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format: expected object' };
  }

  if (!data.questionBank || typeof data.questionBank !== 'object') {
    return { valid: false, error: 'Missing or invalid questionBank property' };
  }

  if (!Array.isArray(data.questionBank.questions)) {
    return { valid: false, error: 'Missing or invalid questions array' };
  }

  const questions = data.questionBank.questions;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== 'object') {
      return { valid: false, error: `Question ${i} is not an object` };
    }

    const requiredFields = ['id', 'title'];
    for (const field of requiredFields) {
      if (!q[field]) {
        return { valid: false, error: `Question ${i} missing required field: ${field}` };
      }
    }

    if (!q.vignette && !q.questionText) {
      return { valid: false, error: `Question ${i} missing both vignette and questionText` };
    }

    if (q.answerChoices && !Array.isArray(q.answerChoices)) {
      return { valid: false, error: `Question ${i} answerChoices is not an array` };
    }
  }

  return { valid: true };
}
