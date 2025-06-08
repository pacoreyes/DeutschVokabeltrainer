let verbs = [];
let currentVerb = {};
let currentMode = "";

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

function loadVerbs() {
  const sheetURL = "https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json";
  return fetch(sheetURL)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      verbs = json.table.rows.map(row => ({
        eng: row.c[0]?.v,
        inf: row.c[1]?.v,
        third: row.c[2]?.v,
        pret: row.c[3]?.v,
        part2: row.c[4]?.v
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
  document.getElementById('continue').classList.add('hidden');

  document.getElementById('submit').onclick = () => checkAnswer(expected);
  document.getElementById('skip').onclick = () => showFeedback(false, expected);
  document.getElementById('continue').onclick = () => nextQuestion();
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
  document.getElementById('continue').classList.remove('hidden');
}

function formatVerbInfo(verb) {
  return `\nENG: ${verb.eng}\nInfinitiv: ${verb.inf}, 3rd: ${verb.third}, Präteritum: ${verb.pret}, Partizip II: ${verb.part2}`;
}
