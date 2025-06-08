let verbs = [];
let currentVerb = {};
let currentMode = "";

const footerBtn = document.getElementById('footer-btn');

document.getElementById('home').addEventListener('click', showMenu);
document.getElementById('reload').addEventListener('click', () => {
  loadVerbs();
});

// initial load
loadVerbs();

document.querySelectorAll('#main-menu button').forEach(btn =>
  btn.addEventListener('click', () => startGame(btn.dataset.mode))
);

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

function loadVerbs() {
  const sheetURL = "https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json";
  return fetch(sheetURL)
    .then(res => res.text())
    .then(data => {
      const start = data.indexOf("(") + 1;
      const end = data.lastIndexOf(")");
      const json = JSON.parse(data.slice(start, end));
      verbs = json.table.rows.slice(1).map(row => ({
        inf: row.c[0]?.v,
        third: row.c[1]?.v,
        pret: row.c[2]?.v,
        part2: row.c[3]?.v,
        eng: row.c[4]?.v
      })).filter(v => v.eng && v.inf);
    });
}

function nextQuestion() {
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  currentVerb = v;

  const formTypes = ["inf", "third", "pret", "part2"];
  let form = "";
  let question = "";
  let expected = "";

  if (currentMode === "eng-deu") {
    form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `Translate "${v.eng}" into German (${form})`;
    expected = v[form];
  } else if (currentMode === "deu-eng") {
    form = formTypes[Math.floor(Math.random() * formTypes.length)];
    question = `Translate "${v[form]}" into English`;
    expected = v.eng;
  } else if (currentMode === "deu-deu") {
    const from = formTypes[Math.floor(Math.random() * formTypes.length)];
    let to;
    do {
      to = formTypes[Math.floor(Math.random() * formTypes.length)];
    } while (to === from);
    question = `Give the ${to} form of "${v[from]}"`;
    expected = v[to];
  }

  document.getElementById('question').textContent = question;
  document.getElementById('answer').value = "";
  document.getElementById('feedback').classList.add('hidden');

  document.getElementById('submit').onclick = () => checkAnswer(expected);
  footerBtn.textContent = "Skip Word";
  footerBtn.onclick = () => showFeedback(false, expected);
}

function checkAnswer(expected) {
  const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
  const correct = userAnswer === expected.toLowerCase();
  showFeedback(correct, expected);
}

function showFeedback(correct, expected) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = correct
    ? `✅ Correct! ${formatVerbInfo(currentVerb)}`
    : `❌ Incorrect. Correct answer: ${expected}\n${formatVerbInfo(currentVerb)}`;
  feedback.className = correct ? "correct" : "incorrect";
  feedback.classList.remove('hidden');
  footerBtn.textContent = "Continue";
  footerBtn.onclick = () => nextQuestion();
}

function formatVerbInfo(verb) {
  return `\nENG: ${verb.eng}\nInfinitiv: ${verb.inf}, 3rd: ${verb.third}, Präteritum: ${verb.pret}, Partizip II: ${verb.part2}`;
}
