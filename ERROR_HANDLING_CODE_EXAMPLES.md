# Detailed Error Handling Issues - Code Examples

## Issue #1: Unprotected Global localStorage Access

### Location: `/home/user/tbank/docs/assets/js/app.js` Lines 236-250

**CURRENT CODE (PROBLEMATIC)**:
```javascript
// Timer state (load from localStorage if available)
let timedMode = localStorage.getItem('timedMode') === 'true';
let timerDuration = parseInt(localStorage.getItem('timerDuration')) || CONSTANTS.DEFAULT_TIMER_DURATION;
let currentTimer = null;
let timerSeconds = 0;
let timerPaused = false;
let questionStartTime = null;

// Dark mode state
let darkModeEnabled = false;

// Pull-to-refresh state (load from localStorage if available)
let pullToRefreshEnabled = localStorage.getItem('pullToRefresh') === 'true';

// Haptic feedback state (load from localStorage, default true)
let hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false';
```

**PROBLEMS**:
1. No error handling if localStorage is disabled
2. No error handling if localStorage throws quota exceeded error
3. No error handling for private/incognito mode browsers
4. Direct execution at module scope - no try-catch protection

**RECOMMENDED FIX**:
```javascript
// Helper function for safe localStorage access
function safeLocalStorageGet(key, defaultValue) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn(`[Storage] Failed to read ${key}:`, error);
    return defaultValue;
  }
}

// Timer state (load from localStorage if available)
let timedMode = safeLocalStorageGet('timedMode', 'false') === 'true';
let timerDuration = parseInt(safeLocalStorageGet('timerDuration', CONSTANTS.DEFAULT_TIMER_DURATION.toString())) || CONSTANTS.DEFAULT_TIMER_DURATION;
let currentTimer = null;
let timerSeconds = 0;
let timerPaused = false;
let questionStartTime = null;

// Dark mode state
let darkModeEnabled = false;

// Pull-to-refresh state (load from localStorage if available)
let pullToRefreshEnabled = safeLocalStorageGet('pullToRefresh', 'false') === 'true';

// Haptic feedback state (load from localStorage, default true)
let hapticsEnabled = safeLocalStorageGet('hapticsEnabled', 'true') !== 'false';
```

---

## Issue #2: Unhandled Async Initialization

### Location: `/home/user/tbank/docs/assets/js/app.js` Line 3804

**CURRENT CODE (PROBLEMATIC)**:
```javascript
// Initialize app
initDarkMode();
initPullToRefreshSetting();
initTimerSettings();
initVisibilityHandler();
loadQuestions();  // <-- UNHANDLED ASYNC OPERATION
initPerformanceMonitoring();
initKeyboardHandling();
initPullToRefresh();
initOfflineSupport();
initServiceWorker();
initInstallPrompt();
```

**PROBLEM**: loadQuestions() is an async function that can throw errors, but it's called without any error handling.

**RECOMMENDED FIX**:
```javascript
// Initialize app
initDarkMode();
initPullToRefreshSetting();
initTimerSettings();
initVisibilityHandler();

// Load questions with error handling
(async () => {
  try {
    await loadQuestions();
  } catch (error) {
    console.error('[App] Failed to initialize questions:', error);
    // Show fallback UI
    questionDisplay.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <p class="error">Failed to load questions. Please refresh the page.</p>
        <button onclick="location.reload()" class="button-primary">Refresh Page</button>
      </div>
    `;
  }
})();

initPerformanceMonitoring();
initKeyboardHandling();
initPullToRefresh();
initOfflineSupport();
initServiceWorker();
initInstallPrompt();
```

---

## Issue #3: Silent Failures in Event Listeners

### Location: `/home/user/tbank/docs/assets/js/app.js` Line 1325

**CURRENT CODE (PROBLEMATIC)**:
```javascript
// Listen for text selection (only add listener once)
document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection(_e) {
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
  // ... rest of function
}
```

**PROBLEMS**:
1. No error handling if window.getSelection() fails (some browsers)
2. No error handling if selection.getRangeAt(0) fails
3. Accessing selection.anchorNode without null check
4. No try-catch around DOM operations that could fail

**RECOMMENDED FIX**:
```javascript
document.addEventListener('mouseup', (e) => {
  try {
    handleTextSelection(e);
  } catch (error) {
    console.warn('[Selection] Error handling text selection:', error);
    // Silently fail - don't disrupt user experience
  }
});

function handleTextSelection(_e) {
  try {
    // Hide toolbar first
    if (highlightToolbar) {
      highlightToolbar.classList.remove('show');
    }

    const selection = window.getSelection();
    if (!selection) {
      return; // getSelection() failed
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length === 0) {
      return;
    }

    // Check if selection is within question content
    const questionContent = document.querySelector('.question-content');
    if (!questionContent || !selection.anchorNode || !questionContent.contains(selection.anchorNode)) {
      return;
    }

    // Position and show toolbar
    if (selection.rangeCount === 0) {
      return; // No ranges available
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (highlightToolbar) {
      highlightToolbar.style.left = `${rect.left + (rect.width / 2) - 75}px`;
      highlightToolbar.style.top = `${rect.top - 50}px`;
      highlightToolbar.classList.add('show');
    }
  } catch (error) {
    console.warn('[Selection] Error in handleTextSelection:', error);
    // Silently fail - don't disrupt user experience
  }
}
```

---

## Issue #4: Unhandled Promise Rejections in Service Worker

### Location: `/home/user/tbank/docs/sw.js` Lines 107-111

**CURRENT CODE (PROBLEMATIC)**:
```javascript
// Cache question banks and other assets for future use
if (url.pathname.includes('.json') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js')) {
  caches.open(RUNTIME_CACHE)
    .then((cache) => {
      console.log('[SW] Caching runtime asset:', url.pathname);
      cache.put(request, responseToCache);  // NO ERROR HANDLING!
    });
}
```

**PROBLEMS**:
1. cache.put() can reject (quota exceeded, invalid response, etc.)
2. No .catch() handler
3. Promise rejection goes unhandled in Service Worker
4. Silent failure could prevent caching of important assets

**RECOMMENDED FIX**:
```javascript
// Cache question banks and other assets for future use
if (url.pathname.includes('.json') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js')) {
  caches.open(RUNTIME_CACHE)
    .then((cache) => {
      console.log('[SW] Caching runtime asset:', url.pathname);
      return cache.put(request, responseToCache);
    })
    .catch((error) => {
      console.warn('[SW] Failed to cache asset:', url.pathname, error);
      // Fail silently - the response is still returned to user
    });
}
```

---

## Issue #5: Missing Global Error Handler for Unhandled Rejections

### Location: `/home/user/tbank/docs/assets/js/app.js` (Should be added)

**CURRENT**: No global error handler exists

**RECOMMENDED ADDITION**:
```javascript
// Add at the beginning of the IIFE (app.js), before other code

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[App] Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack
  });
  
  // Prevent default handling (logging to console)
  event.preventDefault();
  
  // Optionally show user-friendly notification
  showToast('An unexpected error occurred. The app may not work correctly.', 'error');
});

// Global error handler for synchronous errors
window.addEventListener('error', (event) => {
  // Skip errors from extensions and cross-origin scripts
  if (event.filename && !event.filename.includes('/tbank/')) {
    return;
  }
  
  console.error('[App] Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // Log to external service in production
  // sendErrorToServer(event);
});
```

---

## Issue #6: JSON Parsing Without Error Handling in Service Worker

### Location: `/home/user/tbank/docs/sw.js` Line 148

**CURRENT CODE (PROBLEMATIC)**:
```javascript
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};  // NO ERROR HANDLING!

  const options = {
    body: data.body || 'New questions available!',
    icon: '/tbank/assets/icons/icon-192x192.png',
    // ...
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TBank', options)
  );
});
```

**PROBLEMS**:
1. event.data.json() can throw SyntaxError if JSON is malformed
2. No try-catch around the JSON parsing
3. Unhandled error in Service Worker
4. showNotification might fail due to invalid title/body

**RECOMMENDED FIX**:
```javascript
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.warn('[SW] Failed to parse push notification JSON:', error);
      // Try to treat as plain text
      data = { body: event.data.text() };
    }
  }

  const options = {
    body: (data.body || 'New questions available!').substring(0, 200),
    icon: '/tbank/assets/icons/icon-192x192.png',
    badge: '/tbank/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/tbank/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      (data.title || 'TBank').substring(0, 100),
      options
    ).catch((error) => {
      console.error('[SW] Failed to show notification:', error);
    })
  );
});
```

---

## Issue #7: Touch Event Handler Without Error Handling

### Location: `/home/user/tbank/docs/assets/js/app.js` Lines 1118-1138

**CURRENT CODE (PROBLEMATIC)**:
```javascript
document.addEventListener('touchstart', (e) => {
  if (pullToRefreshEnabled && (window.scrollY === 0 || document.body.scrollTop === 0 || questionDisplay.scrollTop === 0)) {
    docTouchStartY = e.touches[0].clientY;  // NO NULL CHECK ON e.touches!
  }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (pullToRefreshEnabled && docTouchStartY > 0) {
    const touchY = e.touches[0].clientY;  // COULD THROW!
    // ...
  }
}, { passive: false });
```

**PROBLEMS**:
1. No check if e.touches array has elements
2. Could throw TypeError if e.touches is empty
3. No error handling wrapper around handler
4. Could disrupt user experience

**RECOMMENDED FIX**:
```javascript
function safeTouchHandler(handler) {
  return function(event) {
    try {
      if (!event.touches || event.touches.length === 0) {
        return;
      }
      handler(event);
    } catch (error) {
      console.warn('[Touch] Error handling touch event:', error);
    }
  };
}

document.addEventListener('touchstart', safeTouchHandler((e) => {
  if (pullToRefreshEnabled && (window.scrollY === 0 || document.body.scrollTop === 0 || questionDisplay.scrollTop === 0)) {
    docTouchStartY = e.touches[0].clientY;
  }
}), { passive: false });

document.addEventListener('touchmove', safeTouchHandler((e) => {
  if (pullToRefreshEnabled && docTouchStartY > 0) {
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - docTouchStartY;
    // ...
  }
}), { passive: false });

document.addEventListener('touchend', safeTouchHandler(() => {
  docTouchStartY = 0;
}), { passive: true });
```

---

## Issue #8: Incomplete Service Worker Cache Activation

### Location: `/home/user/tbank/docs/sw.js` Lines 49-65

**CURRENT CODE (POTENTIAL ISSUE)**:
```javascript
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);  // Could reject
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});
```

**PROBLEMS**:
1. If any cache.delete() fails, Promise.all() rejects
2. No .catch() handler for cleanup failures
3. Could prevent service worker activation
4. Silent failure of cleanup operations

**RECOMMENDED FIX**:
```javascript
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName)
                .catch((error) => {
                  console.warn('[SW] Failed to delete cache:', cacheName, error);
                  // Don't re-throw - continue activation
                });
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Activation failed:', error);
        throw error; // Re-throw to fail activation and retry later
      })
  );
});
```

---

## Summary of Patterns

| Pattern | Location | Severity | Fix |
|---------|----------|----------|-----|
| Unprotected localStorage | app.js:236-250 | HIGH | Create helper function |
| Unhandled async init | app.js:3804 | HIGH | Wrap in try-catch |
| Missing event handler errors | app.js:1325+ | MEDIUM | Add try-catch wrappers |
| Unhandled promise in SW | sw.js:107-111 | MEDIUM | Add .catch() |
| No global error handler | All files | MEDIUM-HIGH | Add listeners |
| JSON parse without catch | sw.js:148 | MEDIUM | Wrap in try-catch |
| Touch event unchecked | app.js:1118+ | MEDIUM | Validate array length |
| Promise.all without catch | sw.js:49-65 | LOW-MEDIUM | Add .catch() |

