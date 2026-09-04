(() => {
  "use strict";

  const STORAGE_KEY = "mr-pham-human-potential-practice-journal-v1";
  const modeTitles = {
    daily: "Daily evidence",
    weekly: "Weekly pattern",
    cycle: "Four-week cycle",
  };

  const fieldGroups = {
    daily: [
      ["session", "Reflection window", "Use only a broad, genuinely non-identifying session label. Do not use a learner code, exact class label, or identifying date.", 3],
      ["mission", "What was this moment meant to make possible?", "Name the human capacity, learning purpose, or shared outcome.", 3],
      ["evidence", "What did I directly observe?", "Record observable evidence, not a personality, diagnosis, motive, or inner state.", 6],
      ["interpretation", "What story or interpretation did I add?", "Treat this as a possibility to test, not a fact.", 5],
      ["missingPerspective", "Who or what may hold part of the picture?", "Keep attributable comments inside the approved human process.", 5],
      ["nextMove", "What is the smallest humane move worth testing?", "Prefer a reversible action that protects learning and dignity.", 5],
      ["successSignal", "What observable signal will tell me whether it helped?", "Decide before the next attempt what you will look for.", 4],
      ["uncertainty", "What remains uncertain?", "Name the evidence still missing and what would change your mind.", 4],
    ],
    weekly: [
      ["weeklyWindow", "Week or review window", "Compare only genuinely comparable moments and conditions.", 3],
      ["recurringPattern", "What pattern appeared more than once?", "Describe the pattern in the work or conditions, not as a label for a person.", 6],
      ["contradiction", "What evidence did not fit the pattern?", "Contradictions protect reflection from becoming confirmation bias.", 5],
      ["changedMyMind", "What changed my first interpretation?", "Include the influence of another perspective without identifying its source.", 5],
      ["weeklyTest", "What one practice will I test next week?", "Choose one controllable change and one success signal.", 5],
      ["energyProtected", "What protected or drained human energy?", "Notice what made care, attention, and collaboration more sustainable.", 5],
    ],
    cycle: [
      ["cycleWindow", "Four-week or monthly review window", "Use a complete cycle only when the evidence and coverage are sufficient.", 3],
      ["comparableEvidence", "Which evidence is genuinely comparable?", "Name differences in purpose, duration, support, conditions, or unusual events.", 6],
      ["trend", "What trend may be emerging?", "Describe direction and recurrence without claiming that the journal caused it.", 6],
      ["changedConditions", "What else changed around the evidence?", "Record confounders before treating a difference as growth.", 5],
      ["confidence", "How confident am I, and why?", "State coverage, uncertainty, and evidence that could still disconfirm the pattern.", 5],
      ["carryTuneDrop", "What will I carry, tune, or drop?", "The accountable human makes the decision.", 5],
      ["nextQuestion", "What question should guide the next cycle?", "Let the next inquiry remain open enough to learn.", 4],
    ],
  };

  const data = {};
  Object.values(fieldGroups).flat().forEach(([key]) => {
    data[key] = "";
  });

  let mode = "daily";
  const form = document.getElementById("journal-form");
  const fieldsRoot = document.getElementById("journal-fields");
  const modeTitle = document.getElementById("journal-mode-title");
  const status = document.getElementById("journal-status");
  const copyButton = document.getElementById("copy-draft");
  const downloadButton = document.getElementById("download-draft");
  const clearButton = document.getElementById("clear-journal");
  const gateInputs = [
    document.getElementById("gate-authorized"),
    document.getElementById("gate-private"),
    document.getElementById("gate-reviewed"),
  ];

  function setStatus(message) {
    status.textContent = message;
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStatus("Saved in this browser.");
    } catch {
      setStatus("Local saving is unavailable. Download a copy before leaving.");
    }
  }

  function hasContent() {
    return fieldGroups[mode].some(([key]) => data[key].trim());
  }

  function gatePassed() {
    return gateInputs.every((input) => input.checked);
  }

  function refreshActions() {
    const enabled = gatePassed() && hasContent();
    copyButton.disabled = !enabled;
    downloadButton.disabled = !enabled;
  }

  function buildDraft() {
    const entries = fieldGroups[mode]
      .filter(([key]) => data[key].trim())
      .map(([key, label]) => `${label}\n${data[key].trim()}`)
      .join("\n\n");

    return `HUMAN-GOVERNED REFLECTION COMPANION

PURPOSE
Help me study my own practice evidence without profiling people, inventing certainty, or taking responsibility away from me.

BOUNDARIES
- Treat observation, interpretation, and uncertainty as different things.
- Do not diagnose, label, infer personality or inner state, or rank a person.
- Do not accept pseudonyms, learner codes, exact dates, class labels, or combinations that could link the reflection to a person.
- Changing or removing a name does not make information anonymous or create permission.
- Do not turn a score or repeated pattern into proof of cause.
- Challenge my first reading and identify relevant evidence that may be missing.
- Offer alternatives and reversible tests; do not make the decision for me.
- If the information may identify someone or appears sensitive, confidential, safeguarding-related, diagnostic, or high-stakes, stop and tell me to return to the authorized human process.

REVIEW MODE
${modeTitles[mode]}

MY REFLECTION
${entries || "No reflection has been entered yet."}

YOUR RESPONSE
1. Separate direct evidence from interpretation.
2. Name the strongest supported pattern and the most important contradiction.
3. Identify what remains unknown and what evidence could change the reading.
4. Offer two plausible alternative interpretations.
5. Suggest one small, humane, reversible test and an observable success signal.
6. End with a short Human Check: what I should challenge, verify, decide, and review myself.

The final judgment and responsibility remain mine.`;
  }

  function renderFields() {
    fieldsRoot.replaceChildren();
    modeTitle.textContent = modeTitles[mode];

    fieldGroups[mode].forEach(([key, labelText, hintText, rows]) => {
      const label = document.createElement("label");
      label.className = "journal-field";

      const title = document.createElement("span");
      title.textContent = labelText;

      const hint = document.createElement("small");
      hint.textContent = hintText;

      const textarea = document.createElement("textarea");
      textarea.rows = rows;
      textarea.value = data[key];
      textarea.dataset.field = key;
      textarea.addEventListener("input", () => {
        data[key] = textarea.value;
        save();
        refreshActions();
      });

      label.append(title, hint, textarea);
      fieldsRoot.append(label);
    });

    refreshActions();
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(buildDraft());
      setStatus("AI review draft copied. Read it once more before sharing it anywhere.");
    } catch {
      setStatus("Copying is unavailable in this browser. Download the review draft instead.");
    }
  }

  function downloadDraft() {
    const blob = new Blob([buildDraft()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `human-potential-${mode}-reflection.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Reflection downloaded to your device.");
  }

  function clearJournal() {
    if (!window.confirm("Clear every daily, weekly, and four-week entry stored in this browser?")) return;
    Object.keys(data).forEach((key) => {
      data[key] = "";
    });
    window.localStorage.removeItem(STORAGE_KEY);
    renderFields();
    setStatus("All locally stored journal entries were cleared.");
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-selected", selected ? "true" : "false");
      });
      renderFields();
    });
  });

  gateInputs.forEach((input) => input.addEventListener("change", refreshActions));
  form.addEventListener("submit", (event) => event.preventDefault());
  copyButton.addEventListener("click", copyDraft);
  downloadButton.addEventListener("click", downloadDraft);
  clearButton.addEventListener("click", clearJournal);

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(data).forEach((key) => {
        if (typeof parsed[key] === "string") data[key] = parsed[key];
      });
    }
    setStatus("Stored only in this browser.");
  } catch {
    setStatus("Local saving is unavailable. You can still write and download your reflection.");
  }

  renderFields();
})();
