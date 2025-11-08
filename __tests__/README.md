# TBank Test Suite

Comprehensive unit tests for TBank's JavaScript utilities and core functions.

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Coverage

Current coverage targets:
- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%

### Security-Critical Functions

The following functions have comprehensive test coverage due to security implications:

1. **`escapeHtml()`** - XSS prevention
   - Tests all special characters (< > & " ')
   - Tests script injection prevention
   - Tests event handler injection prevention
   - Edge cases: null, undefined, empty string

2. **`validateQuestionBank()`** - Data integrity
   - Tests valid question bank structure
   - Tests all validation error paths
   - Tests missing required fields
   - Tests invalid data types

## Test Files

| File | Purpose | Functions Tested |
|------|---------|------------------|
| `utils.test.js` | Utility function tests | escapeHtml, shuffleArray, normalizeText, calculatePercentage, formatTime, validateQuestionBank |

## Writing New Tests

### Test Structure

```javascript
import { describe, it, expect } from 'vitest';
import { functionName } from '../docs/assets/js/utils.js';

describe('functionName - Description', () => {
  it('should describe expected behavior', () => {
    expect(functionName(input)).toBe(expectedOutput);
  });

  it('should handle edge case', () => {
    expect(functionName(edgeCase)).toBe(expectedResult);
  });
});
```

### Best Practices

1. **Test one thing per test** - Each `it()` should verify one specific behavior
2. **Use descriptive test names** - Should read like documentation
3. **Test edge cases** - null, undefined, empty, boundary values
4. **Test error conditions** - Invalid inputs, missing data
5. **Security-critical functions** - Extra thorough testing

### Running Specific Tests

```bash
# Run tests in a specific file
npm test utils.test.js

# Run tests matching a pattern
npm test -- -t "escapeHtml"
```

## CI Integration

Tests run automatically in GitHub Actions on:
- Every push to main branch
- Every pull request

See `.github/workflows/ci.yml` for configuration.

## Coverage Reports

After running `npm run test:coverage`, view the HTML coverage report:

```bash
open coverage/index.html
```

Coverage thresholds are enforced:
- Pull requests must maintain >70% coverage
- Failed coverage checks will block merges

## Debugging Tests

### VSCode

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

### Browser DevTools

```bash
npm run test:ui
```

Opens Vitest UI in browser with detailed test results and debugging.

## Troubleshooting

### Tests fail with module errors

Ensure `type: "module"` is in `package.json` for ES6 imports.

### Coverage too low

Add tests for untested functions in `docs/assets/js/utils.js`.

### Tests are slow

Use `.skip()` or `.only()` to run specific tests during development:

```javascript
it.skip('should skip this test', () => {
  // Temporarily skipped
});

it.only('should only run this test', () => {
  // Only this test runs
});
```
