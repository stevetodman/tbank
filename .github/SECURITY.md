# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take the security of TBank seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** open a public issue

Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Report via GitHub Security Advisories

Use GitHub's [private vulnerability reporting](https://github.com/stevetodman/tbank/security/advisories/new) feature.

### 3. Include Details

Please provide:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information (optional)

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2-4 weeks
  - Low: Next release cycle

## 🛡️ Security Measures

TBank implements the following security practices:

### Code Security
- ✅ **XSS Prevention**: All user inputs sanitized via `escapeHtml()`
- ✅ **Content Security Policy**: Strict CSP headers
- ✅ **No eval()**: No dynamic code execution
- ✅ **CodeQL scanning**: Automated vulnerability detection
- ✅ **Dependabot**: Automated dependency updates

### Data Privacy
- ✅ **No tracking**: Zero analytics or user tracking
- ✅ **Local storage only**: All data stored on device
- ✅ **No accounts**: No user registration or authentication
- ✅ **No external APIs**: No third-party data sharing

### Infrastructure
- ✅ **Static hosting**: Served via GitHub Pages (no server-side code)
- ✅ **HTTPS only**: Enforced secure connections
- ✅ **Service Worker**: Secure offline caching

## 🔍 Known Security Considerations

### localStorage Usage
TBank uses `localStorage` for:
- User preferences (dark mode, timer settings)
- Quiz progress (answered questions, flagged items)
- Session statistics

**Risk**: Data is not encrypted at rest. Do not store sensitive information.

**Mitigation**: TBank does not collect or store any personally identifiable information (PII) or Protected Health Information (PHI).

### Third-Party Dependencies
All npm dependencies are:
- Scanned by Dependabot
- Audited by CodeQL
- Limited to dev dependencies only (zero runtime dependencies)

## 📋 Disclosure Policy

- Security vulnerabilities will be publicly disclosed after a fix is released
- Credit will be given to security researchers who report vulnerabilities (with permission)
- We follow responsible disclosure practices

## 📞 Contact

For security-related questions that are not vulnerabilities:
- Open a [Discussion](https://github.com/stevetodman/tbank/discussions)
- Use the `security` label

---

Thank you for helping keep TBank and its users safe! 🙏
