# Linting Issues to Fix

## Current Status

**Total Issues:** 230
- **Errors:** 13 (must fix)
- **Warnings:** 217 (style issues, can auto-fix)

## Critical Errors (13)

### Unused Event Parameters (12)

These event handler parameters are defined but never used. Replace `e` with `_e` to indicate intentionally unused:

| File | Line | Issue |
|------|------|-------|
| app.js | 749 | `(e) =>` → `(_e) =>` |
| app.js | 966 | `(e) =>` → `(_e) =>` |
| app.js | 1268 | `(e) =>` → `(_e) =>` |
| app.js | 1277 | `(e) =>` → `(_e) =>` |
| app.js | 1286 | `(e) =>` → `(_e) =>` |
| app.js | 1293 | `(e) =>` → `(_e) =>` |
| app.js | 1301 | `(e) =>` → `(_e) =>` |
| app.js | 1310 | `(e) =>` → `(_e) =>` |
| app.js | 1318 | `(e) =>` → `(_e) =>` |
| app.js | 1348 | `(element) =>` → `(_element) =>` |
| app.js | 1354 | `(element) =>` → `(_element) =>` |
| app.js | 2176 | `(e) =>` → `(_e) =>` |

### Prefer Const (1)

| File | Line | Issue | Fix |
|------|------|-------|-----|
| app.js | 1897 | `let html` is never reassigned | Change to `const html` |

## Style Warnings (217)

Most warnings are about quote style (double quotes vs single quotes). These can be auto-fixed:

```bash
npm run lint:fix
```

This will automatically fix:
- Quote style (212 instances)
- Some indentation issues (2 instances)

## How to Fix

### Option 1: Auto-fix what's possible

```bash
npm run lint:fix
```

This fixes ~212 warnings automatically.

### Option 2: Manual fixes

1. Replace unused event parameters with `_e` or `_element`
2. Change `let html` to `const html` on line 1897

### Option 3: Suppress in existing code

For legacy code that's working correctly, we can adjust ESLint rules to be more lenient:

```javascript
// eslint.config.js
rules: {
  'no-unused-vars': ['warn', {  // Change to 'warn' instead of 'error'
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }],
  'prefer-const': 'warn' // Change to 'warn' instead of 'error'
}
```

## Priority

1. **HIGH**: Fix the `prefer-const` error (line 1897) - actual code quality issue
2. **MEDIUM**: Replace unused event parameters with `_e` - improves code clarity
3. **LOW**: Fix quote style warnings - consistency, not functionality

## Notes

- All errors are in `app.js` (legacy IIFE code)
- No errors in test files
- No errors in `utils.js` (new module code)
- The 5 console.log warnings are intentional (performance monitoring)
