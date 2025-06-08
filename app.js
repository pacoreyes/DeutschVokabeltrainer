const BASE_URL =
  'https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json';

const SHEETS = {
  regular: 'regelmäßige',
  irregular: 'unregelmäßige'
};

const REGULAR_PATTERN = 'ge + Stamm + t';

let verbs = [];
let mode = '';
let current = null;
let expected = '';

const forms = ['infinitive','er/sie/es','präteritum','partizipII'];
const names = { 
  'infinitive':'Infinitiv',
  'er/sie/es':'3rd Person',
  'präteritum':'Präteritum',
  'partizipII':'Partizip II',
  'english':'English'
};

const content = document.getElementById('content');
const footerBtn = document.getElementById('footerBtn');

async function fetchSheet(sheetName, isRegular){
  try {
    const res = await fetch(`${BASE_URL}&gid=${encodeURIComponent(sheetName)}`);
    if(!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}')+1));
    const rows = json.table.rows;
    const headers = rows[0].c.map(c => c.v);
    return rows.slice(1).map(r => {
      const obj = {};
      r.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : '';
      });
      if (isRegular && !obj.pattern) {
        obj.pattern = REGULAR_PATTERN;
      }
      return obj;
    });
  } catch (err) {
    console.error('Error loading sheet', sheetName, err);
    return [];
  }
}

async function loadSheets(defs) {
  const data = await Promise.all(
    defs.map(d => fetchSheet(d.name, d.isRegular))
  );
  return data.flat();
}

async function fetchData() {
  verbs = await loadSheets([
    { name: SHEETS.regular, isRegular: true },
    { name: SHEETS.irregular, isRegular: false }
  ]);
}

function showMenu(){
  mode='';
  content.innerHTML=`<div id="menu">
  <button data-mode="eng-deu">Verbs eng &gt; deu</button>
  <button data-mode="deu-eng">Verbs deu &gt; eng</button>
  <button data-mode="deu-deu">Verbs deu &gt; deu</button>
  </div>`;
  footerBtn.style.display='none';
  document.querySelectorAll('#menu button').forEach(btn=>btn.onclick=()=>startQuiz(btn.dataset.mode));
}

function startQuiz(m){
  mode = m;
  nextQuestion();
}

function nextQuestion(){
  current = verbs[Math.floor(Math.random()*verbs.length)];
  let prompt='';
  let showForm, askForm;
  if(mode==='eng-deu'){
    askForm = forms[Math.floor(Math.random()*forms.length)];
    prompt = `What is the <span>${names[askForm]}</span> of "<span>${current.english}</span>"?`;
    expected = current[askForm];
  }else if(mode==='deu-eng'){
    showForm = forms[Math.floor(Math.random()*forms.length)];
    prompt = `What is the English of "<span>${current[showForm]}</span>"?`;
    expected = current.english;
  }else if(mode==='deu-deu'){
    showForm = forms[Math.floor(Math.random()*forms.length)];
    const others = forms.filter(f=>f!==showForm);
    askForm = others[Math.floor(Math.random()*others.length)];
    prompt = `What is the <span>${names[askForm]}</span> of "<span>${current[showForm]}</span>"?`;
    expected = current[askForm];
  }

  content.innerHTML=`<p id="prompt">${prompt}</p><input id="answer" autocomplete="off"><button id="submitBtn">Submit</button>`;
  const input=document.getElementById('answer');
  input.focus();
  input.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});
  document.getElementById('submitBtn').onclick=checkAnswer;
  document.getElementById('submitBtn').classList.add('wideBtn');
  footerBtn.textContent='Skip word';
  footerBtn.onclick=()=>nextQuestion();
  footerBtn.style.display='block';
}

function checkAnswer(){
  const val = document.getElementById('answer').value.trim();
  const correct = val.toLowerCase() === expected.toLowerCase();
  let msg = correct
    ? '<p>Correct!</p>'
    : `<p>Incorrect. Correct answer: ${expected}</p>`;

  const details = `
    <p>${current.english}</p>
    <p>${names.infinitive}: ${current['infinitive']}</p>
    <p>${names['er/sie/es']}: ${current['er/sie/es']}</p>
    <p>${names.präteritum}: ${current['präteritum']}</p>
    <p>${names.partizipII}: ${current['partizipII']}</p>
    <p>Pattern: ${current.pattern || REGULAR_PATTERN}</p>
  `;

  content.innerHTML = msg + details;
  footerBtn.textContent = 'Continue';
  footerBtn.onclick = () => nextQuestion();
}

document.getElementById('homeBtn').onclick=showMenu;
document.getElementById('reloadBtn').onclick=async()=>{await fetchData();showMenu();};

fetchData().then(showMenu);
