(function () {
  const select = document.getElementById("question-set-select");
  const searchInput = document.getElementById("question-search");
  const systemFilter = document.getElementById("system-filter");
  const list = document.getElementById("question-list");
  const summary = document.getElementById("question-summary");
  const statusSection = document.querySelector("section[aria-live]");
  const currentYear = document.getElementById("current-year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  let activeSetId = null;
  let fullQuestionSet = [];

  function setBusy(isBusy) {
    if (!statusSection) return;
    statusSection.setAttribute("aria-busy", String(isBusy));
  }

  function createOption(set) {
    const option = document.createElement("option");
    option.value = set.id;
    option.textContent = `${set.title} (${set.questionCount})`;
    return option;
  }

  function populateSelect() {
    if (!select) return;
    select.innerHTML = "";
    QUESTION_SETS.forEach((set) => {
      select.appendChild(createOption(set));
    });
  }

  function populateSystems(questions) {
    if (!systemFilter) return;
    const systems = Array.from(
      new Set(
        questions
          .map((q) => q.system || q.blueprintCategory || "")
          .filter((value) => value && value.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    const currentValue = systemFilter.value;
    systemFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All systems";
    systemFilter.appendChild(allOption);
    systems.forEach((system) => {
      const option = document.createElement("option");
      option.value = system;
      option.textContent = system;
      systemFilter.appendChild(option);
    });

    if (systems.includes(currentValue)) {
      systemFilter.value = currentValue;
    }
  }

  function toggleAnswerVisibility(button, answer) {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    answer.hidden = expanded;
    button.textContent = expanded ? "Show explanation" : "Hide explanation";
  }

  function createAnswerChoices(question) {
    if (!question.answerChoices || question.answerChoices.length === 0) return null;
    const list = document.createElement("ol");
    list.className = "answer-choices";
    question.answerChoices.forEach((choice) => {
      const item = document.createElement("li");
      item.innerHTML = `<strong>${choice.letter}.</strong> ${choice.text}`;
      if (choice.isCorrect) {
        item.classList.add("answer-correct");
      }
      list.appendChild(item);
    });
    return list;
  }

  function createRationaleList(question) {
    const explanations = question.explanation || {};
    const incorrect = explanations.incorrect || {};
    const hasCorrectLetter = typeof question.correctAnswer === "string" && question.correctAnswer.length > 0;

    const reasonMap = new Map();
    if (hasCorrectLetter && typeof explanations.correct === "string" && explanations.correct.trim().length > 0) {
      reasonMap.set(question.correctAnswer.trim(), explanations.correct.trim());
    }
    Object.entries(incorrect).forEach(([letter, rationale]) => {
      if (typeof rationale === "string" && rationale.trim().length > 0) {
        reasonMap.set(letter.trim(), rationale.trim());
      }
    });

    if (!question.answerChoices || question.answerChoices.length === 0 || reasonMap.size === 0) {
      return null;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "question-rationales";

    const heading = document.createElement("p");
    heading.className = "rationales-heading";
    heading.textContent = "Answer rationales";
    wrapper.appendChild(heading);

    const list = document.createElement("dl");
    list.className = "rationale-list";

    question.answerChoices.forEach((choice) => {
      const letter = choice.letter?.trim();
      if (!letter || !reasonMap.has(letter)) return;

      const item = document.createElement("div");
      item.className = "rationale-item";
      const isCorrect = choice.isCorrect || (hasCorrectLetter && letter === question.correctAnswer.trim());
      if (isCorrect) {
        item.classList.add("rationale-item--correct");
      }

      const term = document.createElement("dt");
      term.textContent = `${letter}. ${choice.text}`;
      item.appendChild(term);

      const detail = document.createElement("dd");
      detail.textContent = reasonMap.get(letter);
      item.appendChild(detail);

      list.appendChild(item);
    });

    if (list.children.length === 0) {
      return null;
    }

    wrapper.appendChild(list);
    return wrapper;
  }

  function createQuestionCard(question) {
    const item = document.createElement("article");
    item.className = "question-item";
    item.setAttribute("role", "listitem");

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.textContent = `${question.id}. ${question.title}`;
    header.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "question-meta";

    const difficulty = question.difficultyLabel || (question.difficulty ? `Difficulty ${question.difficulty}` : null);
    const fields = [
      question.subject,
      question.system,
      difficulty,
      question.topic,
      question.subtopic,
    ].filter(Boolean);
    meta.textContent = fields.join(" • ");
    header.appendChild(meta);

    const stem = document.createElement("p");
    stem.className = "question-stem";
    stem.textContent = question.questionText || question.vignette || "";

    const answerChoices = createAnswerChoices(question);

    const toggle = document.createElement("button");
    toggle.className = "toggle-answer";
    toggle.type = "button";
    toggle.textContent = "Show explanation";
    toggle.setAttribute("aria-expanded", "false");

    const answer = document.createElement("div");
    answer.className = "question-answer";

    const correct = document.createElement("p");
    correct.innerHTML = `<strong>Correct answer:</strong> ${question.correctAnswer || "See explanation"}`;
    answer.appendChild(correct);

    if (question.explanation?.correct) {
      const explanation = document.createElement("p");
      explanation.textContent = question.explanation.correct;
      answer.appendChild(explanation);
    }

    if (question.educationalObjective) {
      const objective = document.createElement("p");
      objective.innerHTML = `<strong>Objective:</strong> ${question.educationalObjective}`;
      answer.appendChild(objective);
    }

    if (question.keyFacts && question.keyFacts.length > 0) {
      const keyFactTitle = document.createElement("p");
      keyFactTitle.innerHTML = "<strong>Key facts:</strong>";
      answer.appendChild(keyFactTitle);
      const factList = document.createElement("ul");
      question.keyFacts.forEach((fact) => {
        const li = document.createElement("li");
        li.textContent = fact;
        factList.appendChild(li);
      });
      answer.appendChild(factList);
    }

    const rationales = createRationaleList(question);
    if (rationales) {
      answer.appendChild(rationales);
    }

    answer.hidden = true;
    toggle.addEventListener("click", () => toggleAnswerVisibility(toggle, answer));

    item.append(header, stem);
    if (answerChoices) {
      item.appendChild(answerChoices);
    }
    item.append(toggle, answer);

    return item;
  }

  function renderQuestions(questions) {
    if (!list) return;
    list.innerHTML = "";
    if (questions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No questions match the current filters.";
      list.appendChild(empty);
      summary.textContent = "";
      return;
    }

    const fragment = document.createDocumentFragment();
    questions.map(createQuestionCard).forEach((card) => fragment.appendChild(card));
    list.appendChild(fragment);
    summary.textContent = `${questions.length} question${questions.length === 1 ? "" : "s"} shown.`;
  }

  function normalise(text) {
    return text.toLowerCase().trim();
  }

  function filterQuestions() {
    const term = normalise(searchInput?.value || "");
    const system = systemFilter?.value || "";

    const filtered = fullQuestionSet.filter((question) => {
      const haystack = normalise(
        [
          question.title,
          question.questionText,
          question.vignette,
          question.subject,
          question.system,
          question.topic,
          (question.tags || []).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
      );
      const matchesTerm = !term || haystack.includes(term);
      const matchesSystem = !system || question.system === system || question.blueprintCategory === system;
      return matchesTerm && matchesSystem;
    });

    renderQuestions(filtered);
  }

  async function loadQuestionSet(id) {
    if (activeSetId === id) {
      filterQuestions();
      return;
    }

    const selected = QUESTION_SETS.find((set) => set.id === id);
    if (!selected) {
      renderQuestions([]);
      return;
    }

    activeSetId = id;
    setBusy(true);
    summary.textContent = "Loading questions...";

    try {
      const response = await fetch(`../${selected.downloads.json}`);
      if (!response.ok) {
        throw new Error(`Failed to load question set: ${response.status}`);
      }
      const data = await response.json();
      fullQuestionSet = data.questionBank?.questions || [];
      populateSystems(fullQuestionSet);
      filterQuestions();
      summary.textContent = `${fullQuestionSet.length} questions loaded from ${selected.title}.`;
    } catch (error) {
      console.error(error);
      summary.textContent = "We couldn't load that question set. Please try again.";
      fullQuestionSet = [];
      populateSystems(fullQuestionSet);
      renderQuestions(fullQuestionSet);
    } finally {
      setBusy(false);
    }
  }

  function initialiseFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("set");
    const fallback = QUESTION_SETS[0]?.id;
    const initial = QUESTION_SETS.some((set) => set.id === requested) ? requested : fallback;
    if (select) {
      select.value = initial || "";
    }
    if (initial) {
      loadQuestionSet(initial);
    }
  }

  populateSelect();
  initialiseFromQuery();

  select?.addEventListener("change", (event) => {
    const id = event.target.value;
    loadQuestionSet(id);
  });

  searchInput?.addEventListener("input", filterQuestions);
  systemFilter?.addEventListener("change", filterQuestions);
})();
