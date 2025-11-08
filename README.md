# TBank: Congenital Heart Disease Question Bank for MS2 Students

**An interactive, GitHub-hosted question bank designed for second-year medical students preparing for USMLE Step 1.**

TBank provides high-yield board-style questions on congenital heart disease, with detailed explanations, structured metadata, and an easy-to-use browser interface. Quiz yourself anytime, anywhere—no downloads or installations required.

## 🎯 For Students: Start Quizzing

**[Launch Interactive Quiz →](https://stevetodman.github.io/tbank/)**

### How to Use TBank

1. **Interactive Browser Quizzing** (Recommended)
   - Visit the [interactive question player](https://stevetodman.github.io/tbank/)
   - Work through questions at your own pace
   - Reveal detailed explanations when ready
   - Track your progress with the question menu
   - **No login, no downloads, no hassle**

2. **Download for Offline Study**
   - Browse [available question sets](https://stevetodman.github.io/tbank/#question-sets)
   - Download in Markdown or JSON format
   - Import into Anki, Notion, or your preferred study tool

3. **Fork & Personalize**
   - Fork this repository to your own GitHub account
   - Track your progress with notes and annotations
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
✅ **Searchable and filterable** by topic, system, difficulty
✅ **Mobile-friendly** interface for studying on the go
✅ **Open-source** and community-driven
✅ **Free forever** with no paywalls or subscriptions

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

This is a static GitHub Pages site with zero dependencies:
- **Frontend:** Pure HTML/CSS/JavaScript (no frameworks)
- **Hosting:** GitHub Pages (free, automatic deployment)
- **Content:** Dual-format (Markdown for reading, JSON for data)
- **Build:** Python sync script (stdlib only)

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

- **Interactive Web** (primary use case)
- **Markdown** (human-readable, great for GitHub/Notion)
- **JSON** (structured data for Anki, custom tools)

## 🗺️ Roadmap

### Current Content (52 questions)
- ✅ Tetralogy of Fallot fundamentals
- ✅ Shunt lesions (VSD, ASD, PDA)
- ✅ Transposition and ductal-dependent lesions
- ✅ Genetic syndromes (Williams, DiGeorge, Turner)
- ✅ Vascular rings and paradoxical emboli
- ✅ Maternal risk factors and teratology
- ✅ Rare structural defects and complications

### Planned Expansions
- 🔄 Neonatal cyanosis differential diagnosis
- 🔄 Congenital heart disease imaging (CXR, echo)
- 🔄 Surgical management timelines
- 🔄 Eisenmenger syndrome and shunt reversal
- 🔄 Additional syndromic associations

Want to help expand TBank? Submit questions via pull request!

## 🔒 Security & Privacy

- ✅ No user tracking or analytics
- ✅ No personal data collection
- ✅ Content Security Policy enforced
- ✅ All data stored locally in browser
- ✅ Open-source and auditable

## 📜 License

MIT License - Free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

TBank is built by medical students, for medical students. Contributions from the community help keep this resource free and high-quality.

---

**Ready to start studying?** [Launch Interactive Quiz →](https://stevetodman.github.io/tbank/)

**Have questions or feedback?** [Open an issue](https://github.com/stevetodman/tbank/issues) or contribute improvements!
