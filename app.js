let verbs = [];
let currentVerb = {};
let currentMode = "";

// Base URL for the Google Sheet containing both tabs
const sheetBaseURL =
  "https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json&sheet=";

// Map of verb form codes to their display names
const verbFormMap = {
  "inf": "Infinitive",
  "third": "3rd Person",
  "pret": "Präteritum",
  "part2": "Partizip II"
};

const footerBtn = document.getElementById('footer-btn');

document.getElementById('home').addEventListener('click', showMenu);
document.getElementById('reload').addEventListener('click', () => {
  loadVerbs();
});

// initial load
loadVerbs().then(() => {
  console.log(`Loaded ${verbs.length} verbs. First few verbs:`, verbs.slice(0, 3));
});

document.querySelectorAll('#main-menu button').forEach(btn =>
  btn.addEventListener('click', () => startGame(btn.dataset.mode))
);

// Add listener for the irregular verb button
document.addEventListener('DOMContentLoaded', () => {
  const irregularBtn = document.getElementById('irregular-verb-btn');
  if (irregularBtn) {
    irregularBtn.addEventListener('click', () => {
      requestIrregularVerb();
    });
  }
});

function startGame(mode) {
  currentMode = mode;
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  loadVerbs().then(() => {
    nextQuestion();
  });
}

function showMenu() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('main-menu').classList.remove('hidden');
}

function fetchSheet(sheetName, type) {
  const url = sheetBaseURL + encodeURIComponent(sheetName);
  return fetch(url)
    .then(res => res.text())
    .then(data => {
      const start = data.indexOf("(") + 1;
      const end = data.lastIndexOf(")");
      const json = JSON.parse(data.slice(start, end));
      return json.table.rows.slice(1).map(row => {
        const entry = {
          inf: row.c[0]?.v,
          third: row.c[1]?.v,
          pret: row.c[2]?.v,
          part2: row.c[3]?.v,
          eng: row.c[4]?.v,
          type,
        };
        if (type === 'irregular') {
          entry.pattern = row.c[5]?.v;
        } else {
          entry.pattern = 'Regular (-en → -t → -te → ge-t)';
        }
        return entry;
      }).filter(v =>
        v.inf && v.third && v.pret && v.part2 && v.eng &&
        (type !== 'irregular' || v.pattern)
      );
    })
    .catch(err => {
      console.error(`Failed to load ${type} verbs`, err);
      return [];
    });
}

function loadVerbs() {
  const fetchRegular = fetchSheet('regelmäßige', 'regular');
  const fetchIrregular = fetchSheet('unregelmäßige', 'irregular');

  return Promise.all([fetchRegular, fetchIrregular]).then(([regular, irregular]) => {
    verbs = [...regular, ...irregular];
    console.log(`Loaded ${regular.length} regular verbs and ${irregular.length} irregular verbs`);
  });
}

function nextQuestion() {
  // Safety check to ensure we have verbs loaded
  if (!verbs || verbs.length === 0) {
    console.error("No verbs available");
    document.getElementById('question').textContent = "Error: No verbs available. Please reload the page.";
    return;
  }

  // Get a list of valid verbs for the current mode
  // For deu-deu, ensure we have both regular and irregular verbs
  const validVerbs = verbs.filter(v => 
    v.inf && v.third && v.pret && v.part2 && v.eng
  );

  // Pick a random verb from the combined list for all modes
  let v = validVerbs[Math.floor(Math.random() * validVerbs.length)];

  // Safety check in case we still don't have a valid verb
  if (!v || !v.inf) {
    console.error("Failed to find a valid verb");
    v = {
      inf: "spielen",
      third: "spielt",
      pret: "spielte",
      part2: "gespielt",
      eng: "to play"
    };
  }

  currentVerb = v;

  const formTypes = ["inf", "third", "pret", "part2"];
  let form = "";
  let question = "";
  let expected = "";

  if (currentMode === "eng-deu") {
    form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `What is the ${verbFormMap[form]} for the English verb "${v.eng}"?`;
    expected = v[form];
  } else if (currentMode === "deu-eng") {
    form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `What is the English verb for "${v[form]}" (${verbFormMap[form]})?`;
    expected = v.eng;
  } else if (currentMode === "deu-deu") {
    const from = formTypes[Math.floor(Math.random() * formTypes.length)];
    let to;
    do {
      to = formTypes[Math.floor(Math.random() * formTypes.length)];
    } while (to === from);
    question = `What is the ${verbFormMap[to]} form of "${v[from]}" (${verbFormMap[from]})?`;
    expected = v[to];
  }

  document.getElementById('question').textContent = question;
  document.getElementById('answer').value = "";
  document.getElementById('feedback').classList.add('hidden');

  document.getElementById('submit').onclick = () => checkAnswer(expected);
  footerBtn.textContent = "Skip Word";
  footerBtn.onclick = (event) => {
    event.preventDefault(); // Prevent default button behavior
    // Skip directly to next question without validation or feedback
    nextQuestion();
  };
}

function checkAnswer(expected) {
  const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
  const correct = userAnswer === expected.toLowerCase();
  showFeedback(correct, expected);
}

function showFeedback(correct, expected) {
  const feedback = document.getElementById('feedback');
  feedback.innerHTML = correct
    ? `<p class="result">✅ Correct!</p>${formatVerbInfo(currentVerb)}`
    : `<p class="result">❌ Incorrect. Correct answer: <strong>${expected}</strong></p>${formatVerbInfo(currentVerb)}`;
  feedback.className = correct ? "correct" : "incorrect";
  feedback.classList.remove('hidden');
  footerBtn.textContent = "Continue";
  footerBtn.onclick = () => nextQuestion();
}

function formatVerbInfo(verb) {
  const isIrregular = verb.type === 'irregular';
  const pattern = isIrregular
    ? verb.pattern
    : 'Regular (-en → -t → -te → ge-t)';

  let infoHTML = `
    <div class="verb-info">
      <h3>Verb Information</h3>
      <p class="eng-translation"><strong>English:</strong> ${verb.eng}</p>
      <div class="verb-forms">
        <p><strong>${verbFormMap.inf}:</strong> ${verb.inf}</p>
        <p><strong>${verbFormMap.third}:</strong> ${verb.third}</p>
        <p><strong>${verbFormMap.pret}:</strong> ${verb.pret}</p>
        <p><strong>${verbFormMap.part2}:</strong> ${verb.part2}</p>
      </div>`;

  // Add pattern section
  infoHTML += `
    <div class="verb-pattern">`;

  if (isIrregular) {
    infoHTML += `
      <p><strong>Pattern:</strong> ${pattern}</p>
      <p class="note">This is an irregular verb.</p>`;
  } else {
    infoHTML += `
      <p><strong>Pattern:</strong> ${pattern}</p>
      <p class="note">This is a regular verb.</p>`;
  }

  infoHTML += `
    </div>
  </div>`;

  return infoHTML;
}


// Function to specifically request an irregular verb question
function requestIrregularVerb() {
  // Safety check
  if (!verbs || verbs.length === 0) {
    console.error("No verbs available");
    return;
  }

  // Find all irregular verbs
  const irregularVerbs = verbs.filter(v =>
    v.inf && v.third && v.pret && v.part2 && v.eng && v.type === 'irregular'
  );

  console.log(`Found ${irregularVerbs.length} irregular verbs`);

  if (irregularVerbs.length === 0) {
    document.getElementById('question').textContent = "No irregular verbs found in the database. Please reload.";
    return;
  }

  // Select a random irregular verb
  const v = irregularVerbs[Math.floor(Math.random() * irregularVerbs.length)];
  currentVerb = v;

  // Generate question based on current mode
  const formTypes = ["inf", "third", "pret", "part2"];
  let question = "";
  let expected = "";

  if (currentMode === "eng-deu") {
    const form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `What is the ${verbFormMap[form]} for the English verb "${v.eng}"? (Irregular verb practice)`;
    expected = v[form];
  } else if (currentMode === "deu-eng") {
    const form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `What is the English verb for "${v[form]}" (${verbFormMap[form]})? (Irregular verb practice)`;
    expected = v.eng;
  } else if (currentMode === "deu-deu") {
    const from = formTypes[Math.floor(Math.random() * formTypes.length)];
    let to;
    do {
      to = formTypes[Math.floor(Math.random() * formTypes.length)];
    } while (to === from);
    question = `What is the ${verbFormMap[to]} form of "${v[from]}"? (Irregular verb practice)`;
    expected = v[to];
  }

  // Update UI
  document.getElementById('question').textContent = question;
  document.getElementById('answer').value = "";
  document.getElementById('feedback').classList.add('hidden');

  document.getElementById('submit').onclick = () => checkAnswer(expected);
  footerBtn.textContent = "Skip Word";
  footerBtn.onclick = (event) => {
    event.preventDefault();
    nextQuestion();
  };
}
