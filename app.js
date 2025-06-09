const BASE_URL =
  'https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json';

const SHEETS = {
  regular: 'regular',
  irregular: 'irregular'
};

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
  'english':'English',
  'pattern':'Pattern',
  'example':'Example'
};

const content = document.getElementById('content');
const footerBtn = document.getElementById('footerBtn');
//footerBtn.className='wideBtn';

async function fetchSheet(sheetName){
  const res = await fetch(`${BASE_URL}&sheet=${encodeURIComponent(sheetName)}`);
  const text = await res.text();
  const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}')+1));
  const rows = json.table.rows;
  const headers = rows[0].c.map(c=>c.v);
  return rows.slice(1).map(r=>{
    const obj={};
    r.c.forEach((cell,i)=>obj[headers[i]]=cell?cell.v:'');
    return obj;
  });
}

async function loadSheets(ids) {
  const data = await Promise.all(ids.map(fetchSheet));
  return data.flat();
}

async function fetchData() {
  const data = await loadSheets([SHEETS.regular, SHEETS.irregular]);
  verbs = data.filter(v => v.focus === 'x' && v.learned !== 'x');
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
    prompt = `What is the <span>${names[askForm]}</span> of "<span>${current[showForm]}</span>" (${names[showForm]})?`;
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
  let msg = correct ? `<h2 class="correctAnswer">Correct!</h2><p>Correct answer: ${expected}</p>` :
    `<h2 class="incorrectAnswer">Incorrect: ${val.toLowerCase()}</h2><p>Correct answer: ${expected}</h2>`;
  const detailKeys = [...forms, 'english', 'pattern', 'example'];
  msg += '<ul id="details">';
  detailKeys.forEach(key => {
    const label = names[key] || key;
    const value = current[key] || '';
    msg += `<li><strong>${label}:</strong> ${value}</li>`;
  });
  msg += '</ul>';
  content.innerHTML = msg;
  footerBtn.textContent = 'Continue';
  footerBtn.onclick = () => nextQuestion();
}

document.getElementById('homeBtn').onclick=showMenu;
document.getElementById('reloadBtn').onclick=async()=>{await fetchData();showMenu();};

fetchData().then(showMenu);
