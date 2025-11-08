# TBank: Congenital Heart Disease Question Bank for Medical Students

**A progressive web app designed for medical students preparing for USMLE Step 1.**

TBank provides high-yield board-style questions on congenital heart disease, with detailed explanations, haptic feedback, offline support, and a native app-like experience. Study anytime, anywhere—on your phone, tablet, or desktop.

## 🎯 For Students: Start Quizzing

**[Launch Interactive Quiz →](https://stevetodman.github.io/tbank/)**

### 📱 Best Experience: Install as App (Recommended)

**On iPhone/iPad:**
1. Visit [TBank](https://stevetodman.github.io/tbank/) in Safari
2. Tap the Share button (□↑)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Launch from your home screen for full-screen, offline access!

**On Android/Chrome:**
1. Visit [TBank](https://stevetodman.github.io/tbank/)
2. Tap "Install" when prompted (or menu → "Install app")
3. Launch from your home screen!

**Benefits of Installing:**
- ✨ Works offline after first visit
- ✨ Full-screen experience (no browser UI)
- ✨ Faster loading with intelligent caching
- ✨ Haptic feedback on touch devices
- ✨ Native app-like performance
- ✨ Quick access from home screen

### 🌐 Or Use in Browser (No Install Required)

Visit [TBank](https://stevetodman.github.io/tbank/) in any modern browser and start studying immediately. No account, no login, no friction.

### 📚 Alternative Study Methods

1. **Download for Offline Study**
   - Browse available question sets
   - Download in Markdown or JSON format
   - Import into Anki, Notion, or your preferred study tool

2. **Fork & Personalize**
   - Fork this repository to your own GitHub account
   - Add personal notes and annotations
   - Sync updates as new questions are added

## 📚 Available Content

### Part 1: Tetralogy of Fallot and Shunt Lesions
**8 questions** | **Intermediate difficulty**
- Tetralogy of Fallot pathophysiology and squatting physiology
- Shunt dynamics (VSD, ASD)
- Foundational hemodynamics

### Part 2: PDA, Transposition, and Genetic Syndromes
**8 questions** | **Intermediate difficulty**
- Patent ductus arteriosus management
- Transposition of the great arteries
- Chromosomal syndromes with CHD

### Part 3: Advanced Syndromes and Hemodynamics
**16 questions** | **Advanced difficulty**
- Williams syndrome and DiGeorge syndrome
- Cardiomyopathy workups
- Oxygen saturation step-ups and catheterization data

### Part 4: Vascular Anomalies and Transition Physiology
**5 questions** | **Advanced difficulty**
- Vascular rings and airway compression
- Paradoxical emboli (PFO)
- Neonatal circulation transitions
- Turner syndrome cardiac manifestations

### Part 5: Maternal Risk Factors, Rare Defects, and Complications
**15 questions** | **Advanced difficulty**
- Maternal diabetes and CHD risk
- Rare structural anomalies
- Complications and complex presentations
- Advanced pathophysiology

**Total: 52 questions across 5 question sets**

## 🔍 What Makes TBank Different

✅ **Board-style clinical vignettes** matching USMLE Step 1 format
✅ **Detailed explanations** for correct AND incorrect answers
✅ **Educational objectives** reinforce high-yield concepts
✅ **Key facts sections** for rapid review
✅ **Progressive Web App** with offline support and installability
✅ **Haptic feedback** for enhanced mobile learning experience
✅ **Advanced gestures** - swipe to navigate, double-tap to submit
✅ **Works offline** after first visit (PWA caching)
✅ **Searchable and filterable** by topic, system, difficulty
✅ **Open-source** and community-driven
✅ **Free forever** with no paywalls or subscriptions

## 📱 Mobile Features (iPhone & Android)

TBank is optimized for mobile studying with advanced touch interactions:

### Haptic Feedback
- **Answer selection** - Light tap when you select an answer
- **Correct answer** - Success pattern (double pulse celebration)
- **Incorrect answer** - Error pattern (triple pulse feedback)
- **Streak milestones** - Celebration burst at 3, 5, 10 correct in a row
- **Question milestones** - Celebrate hitting 10, 25, 40, 52 questions
- **Timer warnings** - Long vibration at 10 seconds remaining
- **Navigation** - Subtle feedback when moving between questions

### Advanced Gestures
- **Swipe left/right on question** - Navigate between questions
- **Swipe left on answer** - Cross out (eliminate) wrong answers
- **Swipe right on answer** - Undo elimination
- **Double-tap answer** - Quick select and submit
- **Visual feedback** - See arrows and hints during swipes

### iPhone-Specific Optimizations
- Full-screen mode when installed from home screen
- iOS status bar integration (black-translucent)
- Safe area support for all iPhone models (including notch)
- Optimized touch targets (minimum 44x44px)
- iOS momentum scrolling
- Keyboard detection and modal adjustment

### Offline Capability
- Works completely offline after first visit
- Intelligent caching of questions and static assets
- Service Worker for background updates
- Progress saved locally in browser

## 🚀 For Contributors: Adding Questions

Want to contribute your own high-yield questions? We welcome submissions!

### Quick Start for Contributors

1. **Fork this repository** to your GitHub account
2. **Add questions** to the appropriate file in `question_banks/`
   - Follow the [style guide](CONTRIBUTING.md) for board-style formatting
   - Include detailed explanations and educational objectives
3. **Sync to the site:**
   ```bash
   python3 scripts/sync_question_banks.py
   ```
4. **Test locally:**
   ```bash
   python3 -m http.server 8000 --directory docs
   # Visit http://localhost:8000
   ```
5. **Submit a pull request** with your new questions

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed style conventions and review process.

## 🛠️ Technical Details

### For Developers

This is a Progressive Web App (PWA) hosted on GitHub Pages:
- **Frontend:** Pure HTML/CSS/JavaScript (zero frameworks)
- **PWA Features:** Service Worker, Web App Manifest, offline support
- **Hosting:** GitHub Pages (free, automatic deployment)
- **Content:** Dual-format (Markdown for reading, JSON for data)
- **Build:** Python sync script (stdlib only)
- **Mobile:** Haptic feedback, advanced gestures, iOS optimizations

### Architecture

**Progressive Enhancement:**
- All features use feature detection (`'vibrate' in navigator`)
- Graceful degradation on unsupported devices
- Desktop experience unchanged, mobile enhanced
- No breaking changes across platforms

**Key Technologies:**
- **Vibration API** - Haptic feedback patterns
- **Service Worker API** - Offline caching and updates
- **Web App Manifest** - Installability and app icons
- **Touch Events** - Gesture detection (swipe, double-tap)
- **Visual Viewport API** - iOS keyboard handling
- **Safe Area Insets** - iOS notch support

### Local Development

```bash
# Clone the repository
git clone https://github.com/stevetodman/tbank.git
cd tbank

# Sync question banks
python3 scripts/sync_question_banks.py

# Start local server
python3 -m http.server 8000 --directory docs

# Visit http://localhost:8000
```

### Deploy Your Own Instance

1. Fork this repository
2. Enable GitHub Pages in Settings → Pages
3. Set source to: **Deploy from branch** → `main` → `/docs`
4. Visit `https://<your-username>.github.io/tbank/`

## 📖 Question Bank Structure

Each question includes:
- **Clinical vignette** (board-style scenario)
- **5 multiple-choice options** (A-E)
- **Correct answer** with comprehensive explanation
- **Incorrect answer rationales** explaining why distractors are wrong
- **Educational objective** (key learning point)
- **Rapid review pearls** (high-yield facts)
- **Metadata** (difficulty, topic, subtopic, estimated time)

### Available Formats

- **Interactive PWA** (recommended - full features)
- **Interactive Web** (browser-based, no install)
- **Markdown** (human-readable, great for GitHub/Notion)
- **JSON** (structured data for Anki, custom tools)

### File Structure

```
tbank/
├── docs/                          # GitHub Pages root
│   ├── index.html                 # Main quiz interface
│   ├── manifest.webmanifest       # PWA configuration
│   ├── sw.js                      # Service Worker (offline support)
│   ├── assets/
│   │   ├── js/
│   │   │   ├── app.js             # Core quiz logic + haptics + PWA
│   │   │   ├── questionData.js    # Question set definitions
│   │   │   └── questionsPage.js   # Browse questions page
│   │   ├── css/
│   │   │   ├── styles.css         # General styling
│   │   │   └── questions.css      # Quiz + mobile styles
│   │   ├── icons/                 # PWA/iOS app icons
│   │   │   ├── icon.svg           # Source icon
│   │   │   └── README.md          # Icon generation guide
│   │   └── question_banks/
│   │       ├── all_questions.json # Aggregated questions
│   │       └── chd_part*.json     # Individual sets
├── question_banks/                # Source question content (Markdown)
└── scripts/
    └── sync_question_banks.py     # Syncs MD → JSON
```

## 🗺️ Roadmap

### ✅ Completed Features

**Content (52 questions)**
- ✅ Tetralogy of Fallot fundamentals
- ✅ Shunt lesions (VSD, ASD, PDA)
- ✅ Transposition and ductal-dependent lesions
- ✅ Genetic syndromes (Williams, DiGeorge, Turner)
- ✅ Vascular rings and paradoxical emboli
- ✅ Maternal risk factors and teratology
- ✅ Rare structural defects and complications

**Mobile Experience**
- ✅ Progressive Web App (PWA) support
- ✅ Offline capability with Service Worker
- ✅ Haptic feedback (15 interaction points)
- ✅ Advanced gestures (swipe navigation, double-tap submit)
- ✅ iOS-specific optimizations (status bar, safe areas)
- ✅ Install prompt and home screen installation
- ✅ Full-screen mode on mobile

### 🔄 Planned Enhancements

**Content Expansion**
- 🔄 Neonatal cyanosis differential diagnosis
- 🔄 Congenital heart disease imaging (CXR, echo)
- 🔄 Surgical management timelines
- 🔄 Eisenmenger syndrome and shunt reversal
- 🔄 Additional syndromic associations

**UX Improvements**
- 🔄 Dark mode support
- 🔄 Progress persistence across sessions
- 🔄 Share functionality (Web Share API)
- 🔄 Long-press gestures for advanced features
- 🔄 Pull-to-refresh question randomization

Want to help expand TBank? Submit questions or features via pull request!

## 🔒 Security & Privacy

- ✅ **No tracking or analytics** - Zero third-party services
- ✅ **No personal data collection** - No accounts, no login
- ✅ **Content Security Policy enforced** - XSS protection
- ✅ **All data stored locally** - Browser storage and Service Worker cache
- ✅ **Open-source and auditable** - View the code on GitHub
- ✅ **PWA caching is local only** - Offline data stays on your device
- ✅ **No server-side storage** - Static hosting, no backend

**What Gets Stored Locally:**
- Question bank JSON files (cached for offline use)
- App assets (HTML, CSS, JS) for fast loading
- Install prompt preference (localStorage)
- Service Worker registration

**What Never Gets Stored:**
- Your answers or progress (session-only)
- Personal information
- Usage analytics
- Tracking data

## ❓ FAQ

**Q: Do I need to install the app?**
A: No! It works perfectly in any browser. Installation is optional but recommended for offline access and haptic feedback.

**Q: Does it work offline?**
A: Yes! After your first visit, the app caches everything locally. You can study even without internet.

**Q: Will my progress be saved?**
A: Progress is saved during your current session but resets when you close the tab. We plan to add persistent progress in a future update.

**Q: Does haptic feedback work on my device?**
A: Haptic feedback works on most modern smartphones (iPhone, Android). It requires the Vibration API, which is supported in Safari iOS, Chrome Android, and other mobile browsers.

**Q: How do I update the app?**
A: The Service Worker automatically checks for updates every hour. Close and reopen the app to get the latest version.

**Q: Can I use this on desktop?**
A: Absolutely! TBank works on desktop browsers too. Haptic feedback and gestures are mobile-only, but all core features work everywhere.

**Q: Is my data private?**
A: Yes! Everything runs locally in your browser. No data is sent to servers. No tracking. No analytics.

## 📜 License

MIT License - Free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

TBank is built by medical students, for medical students. Contributions from the community help keep this resource free and high-quality.

Special thanks to all contributors who've helped make TBank the best mobile study experience for USMLE prep!

---

**Ready to start studying?** [Launch Interactive Quiz →](https://stevetodman.github.io/tbank/)

**Install for best experience:** Follow the installation instructions above for offline access and haptic feedback!

**Have questions or feedback?** [Open an issue](https://github.com/stevetodman/tbank/issues) or contribute improvements!
