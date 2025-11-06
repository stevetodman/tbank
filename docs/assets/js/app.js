(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("primary-nav");
  if (navToggle && navLinks) {
    navLinks.setAttribute("aria-expanded", navToggle.getAttribute("aria-expanded") || "false");
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.setAttribute("aria-expanded", String(!expanded));
    });
  }

  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const searchInput = document.getElementById("search-input");
  const difficultyFilter = document.getElementById("difficulty-filter");
  const grid = document.getElementById("question-set-grid");
  const downloadList = document.getElementById("download-list");

  function createTag(tag) {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = tag;
    return span;
  }

  function createQuestionCard(set) {
    const article = document.createElement("article");
    article.className = "card question-card";
    article.setAttribute("role", "listitem");

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = set.title;
    header.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "muted";
    subtitle.textContent = set.subtitle;
    header.appendChild(subtitle);

    const badgeGroup = document.createElement("div");
    badgeGroup.className = "badge-group";

    const difficultyBadge = document.createElement("span");
    difficultyBadge.className = "badge badge--difficulty";
    difficultyBadge.textContent = set.difficulty;
    badgeGroup.appendChild(difficultyBadge);

    set.tags.forEach((tag) => badgeGroup.appendChild(createTag(tag)));
    header.appendChild(badgeGroup);

    const description = document.createElement("p");
    description.textContent = set.description;

    const metadata = document.createElement("p");
    metadata.className = "muted";
    metadata.textContent = `${set.questionCount} questions`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const interactiveLink = document.createElement("a");
    interactiveLink.href = set.interactivePath;
    interactiveLink.textContent = "Open interactive view";
    interactiveLink.setAttribute("aria-label", `Open ${set.title} in the interactive question player`);
    actions.appendChild(interactiveLink);

    const markdownLink = document.createElement("a");
    markdownLink.href = set.downloads.markdown;
    markdownLink.textContent = "Download Markdown";
    markdownLink.download = "";
    actions.appendChild(markdownLink);

    const jsonLink = document.createElement("a");
    jsonLink.href = set.downloads.json;
    jsonLink.textContent = "Download JSON";
    jsonLink.download = "";
    actions.appendChild(jsonLink);

    article.append(header, description, metadata, actions);
    return article;
  }

  function createDownloadCard(set) {
    const article = document.createElement("article");
    article.className = "card download-card";
    article.setAttribute("role", "listitem");

    const title = document.createElement("h3");
    title.textContent = set.title;

    const blurb = document.createElement("p");
    blurb.textContent = `${set.questionCount} question pack • ${set.subtitle}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const markdownLink = document.createElement("a");
    markdownLink.href = set.downloads.markdown;
    markdownLink.textContent = "Markdown";
    markdownLink.download = "";

    const jsonLink = document.createElement("a");
    jsonLink.href = set.downloads.json;
    jsonLink.textContent = "JSON";
    jsonLink.download = "";

    actions.append(markdownLink, jsonLink);
    article.append(title, blurb, actions);
    return article;
  }

  function render(list) {
    if (grid) {
      grid.innerHTML = "";
      if (list.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No question sets match your filters yet.";
        empty.className = "muted";
        grid.appendChild(empty);
      } else {
        list.map(createQuestionCard).forEach((card) => grid.appendChild(card));
      }
    }
  }

  function renderDownloads(list) {
    if (downloadList) {
      downloadList.innerHTML = "";
      list.map(createDownloadCard).forEach((card) => downloadList.appendChild(card));
    }
  }

  function normalise(text) {
    return text.toLowerCase().trim();
  }

  function filterSets() {
    const term = normalise(searchInput?.value || "");
    const difficulty = difficultyFilter?.value || "";

    const filtered = QUESTION_SETS.filter((set) => {
      const matchesDifficulty = !difficulty || set.difficulty === difficulty;
      const haystack = normalise([set.title, set.subtitle, set.description, set.tags.join(" ")].join(" "));
      const matchesTerm = !term || haystack.includes(term);
      return matchesDifficulty && matchesTerm;
    });

    render(filtered);
  }

  if (grid) {
    render(QUESTION_SETS);
  }
  if (downloadList) {
    renderDownloads(QUESTION_SETS);
  }

  searchInput?.addEventListener("input", filterSets);
  difficultyFilter?.addEventListener("change", filterSets);
})();
