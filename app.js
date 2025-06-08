const base = 'https://docs.google.com/spreadsheets/d/1JiJrQCHym8USlLnTQhVtFCX4N1XtqW8S6flhEX6y-VE/gviz/tq?tqx=out:json';
let verbs = [];
let mode = '';
let current = null;
let expected = '';
const forms = ['infinitive','er/sie/es','präteritum','partizipII'];
const names = { 'infinitive':'Infinitiv','er/sie/es':'er/sie/es','präteritum':'Präteritum','partizipII':'Partizip II','english':'English' };
const content = document.getElementById('content');
const footerBtn = document.getElementById('footerBtn');

async function fetchSheet(gid){
  const res = await fetch(`${base}&gid=${encodeURIComponent(gid)}`);
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

async function fetchData(){
  const sheets=['0','unregelmäßige'];
  const data=await Promise.all(sheets.map(fetchSheet));
  verbs=data.flat();
}

function showMenu(){
  mode='';
  content.innerHTML=`<div id="menu">
  <button data-mode="eng-deu">Verbs eng &gt; deu</button>
  <button data-mode="deu-eng">Verbs deu &gt; eng</button>
  <button data-mode="deu-deu">Deu &gt; deu</button>
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
    prompt = `What is the ${names[askForm]} of "${current.english}"?`;
    expected = current[askForm];
  }else if(mode==='deu-eng'){
    showForm = forms[Math.floor(Math.random()*forms.length)];
    prompt = `What is the English of "${current[showForm]}"?`;
    expected = current.english;
  }else if(mode==='deu-deu'){
    showForm = forms[Math.floor(Math.random()*forms.length)];
    const others = forms.filter(f=>f!==showForm);
    askForm = others[Math.floor(Math.random()*others.length)];
    prompt = `What is the ${names[askForm]} of "${current[showForm]}"?`;
    expected = current[askForm];
  }
  content.innerHTML=`<p>${prompt}</p><input id="answer" autocomplete="off"><button id="submitBtn">Submit</button>`;
  const input=document.getElementById('answer');
  input.focus();
  input.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});
  document.getElementById('submitBtn').onclick=checkAnswer;
  footerBtn.textContent='Skip word';
  footerBtn.onclick=()=>nextQuestion();
  footerBtn.style.display='block';
}

function checkAnswer(){
  const val=document.getElementById('answer').value.trim();
  const correct=val.toLowerCase()===expected.toLowerCase();
  let msg= correct?'<p>Correct!</p>':`<p>Incorrect. Correct answer: ${expected}</p>`;
  msg+=`<p>${current.english}: ${current['infinitive']}, ${current['er/sie/es']}, ${current['präteritum']}, ${current['partizipII']}</p>`;
  content.innerHTML=msg;
  footerBtn.textContent='Continue';
  footerBtn.onclick=()=>nextQuestion();
}

document.getElementById('homeBtn').onclick=showMenu;
document.getElementById('reloadBtn').onclick=async()=>{await fetchData();showMenu();};

fetchData().then(showMenu);
