
/* ---------- state & storage ---------- */
const KEY = "ai-path-progress-v1";
const blank = () => ({concepts:{}, quiz:{}, build:{}, exam:null, history:[], bonus:0, flags:{}, badges:{}, daily:null});
/* root holds what's shared (chosen path, study days); each path has its own progress object, and `state` points at the current one */
let root = {v:2, track:null, days:[], paths:{}};
let state = blank();
function useTrackState(id){ root.paths[id] = Object.assign(blank(), root.paths[id]||{}); state = root.paths[id]; }
function migrate(o){
  if(!o) return {v:2, track:null, days:[], paths:{}};
  if(o.v===2) return Object.assign({v:2, track:null, days:[], paths:{}}, o);
  // v1 kept one progress object shared by every path: give each module's progress to exactly one path,
  // the active path if it has that module, otherwise the first path that does
  const r={v:2, track:o.track||null, days:o.days||[], paths:{}};
  const any=Object.keys(o.concepts||{}).length||Object.keys(o.quiz||{}).length||Object.keys(o.build||{}).length||o.exam!=null;
  if(!any) return r;
  r.track = r.track || "backend";
  const active=TRACKS.find(t=>t.id===r.track)||TRACKS[0];
  const owner=k=>active.modules.includes(k) ? active.id : TRACKS.find(t=>t.modules.includes(k))?.id;
  for(const t of TRACKS){
    const pick=obj=>Object.fromEntries(Object.entries(obj||{}).filter(([k])=>owner(k)===t.id));
    const p={...blank(), concepts:pick(o.concepts), quiz:pick(o.quiz), build:pick(o.build)};
    if(t.id===r.track) Object.assign(p,{exam:o.exam??null, history:o.history||[], bonus:o.bonus||0, flags:o.flags||{}, badges:o.badges||{}, daily:o.daily||null});
    if(t.id===r.track || Object.keys(p.concepts).length || Object.keys(p.quiz).length || Object.keys(p.build).length) r.paths[t.id]=p;
  }
  return r;
}
let docRef = null, saveTimer = null, quizRun = null, synced = false;

function loadLocal(){ try{ const s = localStorage.getItem(KEY); if(s) root = migrate(JSON.parse(s)); }catch(e){} }
function saveLocal(){ try{ localStorage.setItem(KEY, JSON.stringify(root)); }catch(e){} }
function persist(){
  saveLocal();
  if(!docRef) return;
  clearTimeout(saveTimer);
  setSync("Saving…", synced);
  saveTimer = setTimeout(async ()=>{
    try{ await docRef.set({progress: JSON.stringify(root), updated: Date.now()}); setSync("Synced to your account", true); }
    catch(e){ setSync("Saved on this device · sync failed", false); }
  }, 600);
}
function setSync(t, ok){ synced = ok; document.getElementById("sync").innerHTML = `<span class="dot ${ok?"ok":""}"></span>${t}`; }
async function connect(){
  if(!window.claude?.use) return;
  try{
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if(!db || !user) return;
    const uid = await user.id(); if(!uid) return;
    docRef = db.doc("data/users/" + uid + "/progress");
    const snap = await docRef.get();
    if(snap.exists){ root = migrate(JSON.parse(snap.data().progress || "{}")); saveLocal(); initTrack(); quietSync(); route(); }
    else if(hasProgress()) save();
    setSync("Synced to your account", true);
  }catch(e){}
}
const hasProgress = () => Object.values(root.paths).some(p=>Object.keys(p.concepts||{}).length || Object.keys(p.quiz||{}).length || Object.keys(p.build||{}).length || p.exam!=null);

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pct = x => Math.round(x*100) + "%";
const idx = id => PHASES.findIndex(p=>p.id===id);
function parts(i){ const p=PHASES[i]; return {c:(state.concepts[p.id]||[]).length/p.concepts.length, q:state.quiz[p.id]??null, b:!!state.build[p.id]}; }
function mastery(i){ const x=parts(i); return 0.4*x.c + 0.4*(x.q??0) + 0.2*(x.b?1:0); }
function status(i){ const m=mastery(i); return m>=0.8?["Mastered","good"]:m>0?["In progress","prog"]:["Not started",""]; }
function nextPhase(){ const i = PHASES.findIndex((_,k)=>mastery(k)<0.8); return i<0?null:i; }
function nextAction(i){
  const p=PHASES[i], x=parts(i);
  if(x.c<1){ const done=new Set(state.concepts[p.id]||[]); const k=p.concepts.findIndex((_,j)=>!done.has(j)); return {label:"Read lesson: "+p.concepts[k][0], href:"#p-"+p.id+"-l"+k}; }
  if((x.q??0)<0.8) return {label:"Take the quiz", href:"#p-"+p.id+"-quiz"};
  if(!x.b) return {label:"Finish the build task", href:"#p-"+p.id+"-build"};
  return {label:"Review phase", href:"#p-"+p.id};
}
function ring(v, size=20, stroke=3, track="var(--side-line)", col){
  const r=(size-stroke)/2, c=2*Math.PI*r, color = col || (v>=0.8?"var(--good)":"var(--accent)");
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c*v).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`;
}
function toast(t){ const el=$("toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2200); }
const fmtDate = ts => new Date(ts).toLocaleDateString(undefined,{day:"numeric",month:"short"});

/* ---------- sidebar ---------- */
function renderNav(r){
  const cur = ["phase","quiz","build","lesson"].includes(r.name) ? r.id : null;
  const icon = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  $("nav").innerHTML =
    `<a href="#dashboard" class="${r.name==="dashboard"?"on":""}">${icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>')}<span class="t">Dashboard</span><span></span></a>
     <a href="#paths" class="${r.name==="paths"||r.name==="pathdetail"?"on":""}">${icon('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>')}<span class="t">Home: all paths</span><span></span></a>
     <a href="#exam" class="${r.name==="exam"||r.name==="examrun"?"on":""}">${icon('<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>')}<span class="t">Boss battle</span><span class="m">${state.exam!=null?pct(state.exam):""}</span></a>
     <a href="#daily" class="${r.name==="daily"?"on":""}">${flame(dailyDone())}<span class="t">Daily challenge</span><span class="m">${dailyDone()?"Done":"New"}</span></a>
     <div class="nav-h">Curriculum</div>` +
    PHASES.map((p,i)=>{ const m=mastery(i); return `<a href="#p-${p.id}" class="${cur===p.id?"on":""}">${ring(m)}<span class="t">${i+1}. ${esc(p.title)}</span><span class="m">${pct(m)}</span></a>`; }).join("");
}

/* ---------- routing ---------- */
function parse(){
  const h = location.hash.slice(1);
  if(h==="exam") return {name:"exam"};
  if(h==="exam-run") return {name:"examrun"};
  if(h==="daily") return {name:"daily"};
  if(h==="" || h==="paths" || h==="home") return {name:"paths"};
  if(h==="dashboard") return {name:"dashboard"};
  const pd = h.match(/^path-([a-z]+)$/); if(pd && trackById(pd[1])) return {name:"pathdetail", id:pd[1]};
  const l = h.match(/^p-([a-z]+)-l(\d)$/);
  if(l && idx(l[1])>=0 && +l[2] < PHASES[idx(l[1])].concepts.length) return {name:"lesson", id:l[1], k:+l[2]};
  const m = h.match(/^p-([a-z]+)(?:-(quiz|build))?$/);
  if(m && idx(m[1])>=0) return {name: m[2]||"phase", id:m[1]};
  return {name:"paths"};
}
function route(){
  let r = parse();
  const homeView = r.name==="paths" || r.name==="pathdetail";
  if(!homeView && !root.track){ history.replaceState(null, "", "#paths"); r = {name:"paths"}; }   // a course page needs a chosen path
  $("app").classList.toggle("home", r.name==="paths" || r.name==="pathdetail");
  $("app").classList.remove("open");
  renderNav(r);
  const np = nextPhase();
  const cb = $("continueBtn");
  if(np==null){ cb.href="#exam"; cb.querySelector(".lbl").textContent="Fight the boss"; }
  else { const a=nextAction(np); cb.href=a.href; cb.querySelector(".lbl").textContent="Continue: phase "+(np+1); }
  const v = $("view");
  if(r.name==="pathdetail"){ const t=trackById(r.id); crumbs(["Paths", `${t.from} → ${t.to}`]); v.innerHTML = pathDetail(t); bindPaths(); return; }
  if(r.name==="paths"){ crumbs(["Choose your path"]); v.innerHTML = pathsView(); bindPaths(); return; }
  if(r.name==="dashboard"){ crumbs(["Dashboard"]); v.innerHTML = dashboard(); bindDashboard(); }
  else if(r.name==="exam"){ crumbs(["Boss battle"]); v.innerHTML = examHome(); bindExamHome(); }
  else if(r.name==="examrun"){ if(quizRun?.mode!=="exam") startExam(); crumbs(["Boss battle","Fight"]); renderRunner(); }
  else if(r.name==="daily"){ crumbs(["Daily challenge"]); if(quizRun?.mode==="daily") renderRunner(); else if(dailyDone()){ v.innerHTML=dailyDoneHTML(); } else { startDaily(); renderRunner(); } }
  else if(r.name==="lesson"){
    const i = idx(r.id), p = PHASES[i];
    crumbs(["Curriculum", `Phase ${i+1}: ${p.title}`, p.concepts[r.k][0]]);
    v.innerHTML = lessonView(i, r.k); bindLesson(i, r.k);
  }
  else {
    const i = idx(r.id), p = PHASES[i];
    crumbs(["Curriculum", `Phase ${i+1}: ${p.title}`]);
    if(r.name==="quiz"){ if(quizRun?.mode!=="quiz" || quizRun.phase!==i) startQuiz(i); }
    v.innerHTML = phaseView(i, r.name);
    bindPhase(i, r.name);
  }
}
function crumbs(list){ $("crumbs").innerHTML = list.map((c,k)=>k===list.length-1?`<b>${esc(c)}</b>`:esc(c)).join(" &nbsp;/&nbsp; "); }
function go(h){ if(location.hash==="#"+h) route(); else location.hash = h; }

/* ---------- dashboard ---------- */
function curve(ms){
  const W=560,H=190,L=36,R=12,T=14,B=28,n=ms.length;
  const x=i=>L+(W-L-R)*i/n, y=v=>T+(H-T-B)*(1-v);
  let loss=1; const pts=[[x(0),y(1)]];
  ms.forEach((m,i)=>{ loss-=m/n; pts.push([x(i+1),y(Math.max(0,loss))]); });
  const line=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  let g="";
  [0,.25,.5,.75,1].forEach(v=>{ g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="10.5" font-family="var(--f-mono)" fill="var(--faint)">${v.toFixed(2)}</text>`; });
  for(let i=0;i<=n;i++) g+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10.5" font-family="var(--f-mono)" fill="var(--faint)">${i===0?"start":i}</text>`;
  const last=pts[pts.length-1];
  return g+`<path d="M${x(0)} ${y(1)} L${x(n)} ${y(0)}" stroke="var(--faint)" stroke-dasharray="4 4" fill="none"/>`+
    `<path d="${line} L${x(n)} ${y(0)} L${x(0)} ${y(0)} Z" fill="var(--accent)" fill-opacity=".09"/>`+
    `<path d="${line}" stroke="var(--accent)" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`+
    `<circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`+
    `<text x="${last[0]-8}" y="${last[1]-10}" text-anchor="end" font-size="11" font-weight="600" font-family="var(--f-mono)" fill="var(--ink)">${Math.max(0,loss).toFixed(2)}</text>`;
}
/* ---------- phase ---------- */
function phaseView(i, tab){
  const p=PHASES[i], m=mastery(i), [st,cl]=status(i), x=parts(i);
  const tabs=[["phase","Overview",""],["quiz","Quiz",x.q!=null?pct(x.q):""],["build","Build task",x.b?"✓":""]];
  const body = tab==="quiz" ? `<div id="runner"></div>` : tab==="build" ? buildTab(p) : overviewTab(p);
  const prev = i>0?`<a class="btn sec" href="#p-${PHASES[i-1].id}">← Phase ${i}</a>`:`<span></span>`;
  const nxt = i<PHASES.length-1?`<a class="btn sec" href="#p-${PHASES[i+1].id}">Phase ${i+2} →</a>`:`<a class="btn sec" href="#exam">Exam →</a>`;
  const aside = tab==="quiz" ? "" : `<div class="aside">
    <div class="card"><div class="card-h"><h2>Phase progress</h2><span class="pill ${cl}">${st}</span></div>
      <div class="card-b" style="display:flex;flex-direction:column;gap:14px">
        <div class="score-big">${ring(m,64,7,"var(--line)")}<div><b class="num" style="font-size:24px">${pct(m)}</b><div class="muted" style="font-size:13px">mastery · 80% to pass</div></div></div>
        ${[["Concepts",x.c,Math.round(x.c*p.concepts.length)+"/"+p.concepts.length],["Quiz best",x.q??0,x.q!=null?pct(x.q):"Not taken"],["Build task",x.b?1:0,x.b?"Done":"Not done"]].map(([l,v,t])=>`<div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>${l}</span><span class="num muted">${t}</span></div><div class="bar ${v>=0.8?"good":""}"><i style="width:${pct(v)}"></i></div></div>`).join("")}
      </div></div>
    <div class="pager">${prev}${nxt}</div></div>`;
  return `<div class="ph-head"><div><div class="label">Phase ${i+1} of ${PHASES.length} · ${p.weeks}</div><h1 style="margin-top:4px">${esc(p.title)}</h1><p class="muted">${esc(p.why)}</p></div></div>
    <div class="seg" role="tablist">${tabs.map(([k,l,b])=>`<button role="tab" data-h="p-${p.id}${k==="phase"?"":"-"+k}" aria-selected="${tab===k}">${l}${b?` <span class="num" style="font-weight:500;opacity:.8">· ${b}</span>`:""}</button>`).join("")}</div>
    ${tab==="quiz"?body:`<div class="layout"><div style="display:flex;flex-direction:column;gap:20px;min-width:0">${body}</div>${aside}</div>`}`;
}
function overviewTab(p){
  const done=new Set(state.concepts[p.id]||[]);
  return `<div class="bridge"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 17c3-6 15-6 18 0M3 17v3M21 17v3M12 11v9"/></svg><div><div class="label">Bridge from your stack</div><p>${esc(p.bridge)}</p></div></div>
    <div class="card"><div class="card-h"><div><h2>Lessons</h2><p class="muted" style="font-size:13px;margin-top:2px">Read each lesson, try the exercise, and ask the tutor about anything unclear. Tick it when you can explain it without notes.</p></div><span class="num muted" id="cCount">${done.size}/${p.concepts.length}</span></div>
      <ul class="concepts">${p.concepts.map(([t,d],k)=>`<li class="lrow"><input type="checkbox" id="c-${p.id}-${k}" data-k="${k}" ${done.has(k)?"checked":""} aria-label="Mark ${esc(t)} as understood"><a href="#p-${p.id}-l${k}"><span><span class="ln num">Lesson ${k+1}</span><b>${esc(t)}</b><span class="d">${esc(d)}</span></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></a></li>`).join("")}</ul></div>
    <div class="card"><div class="card-h"><h2>Study resources</h2><span class="muted" style="font-size:13px">Free · open in a new tab</span></div>
      <ul class="res">${p.res.map(([k,t,u,d])=>`<li><a href="${u}" target="_blank" rel="noopener"><span class="k">${k}</span><span><b>${esc(t)}</b><span class="d">${esc(d)}</span></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a></li>`).join("")}</ul></div>
    <div class="card"><div class="card-b" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap"><div><h3>Ready to test yourself?</h3><p class="muted" style="font-size:14px">${p.quiz.length} questions with explanations. Your best score counts.</p></div><a class="btn" href="#p-${p.id}-quiz">Start quiz</a></div></div>`;
}
function buildTab(p){
  return `<div class="card task"><div class="card-h"><div><div class="label" style="color:var(--amber)">Hands-on project</div><h2 style="margin-top:2px">${esc(p.build.title)}</h2></div></div>
    <ol>${p.build.steps.map(s=>`<li><span>${esc(s)}</span></li>`).join("")}</ol>
    <label class="done-row"><input type="checkbox" id="buildDone" ${state.build[p.id]?"checked":""}><span><b>I finished this build</b><br><span class="muted" style="font-size:13px">Counts for 20% of this phase's mastery.</span></span></label></div>
    <p class="muted" style="font-size:14px">Push each build to a public GitHub repo with a short README. By phase 10 you'll have a portfolio that shows the whole journey.</p>`;
}
function bindPhase(i, tab){
  const p=PHASES[i];
  document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>go(b.dataset.h));
  if(tab==="phase"){
    document.querySelectorAll(".concepts input").forEach(cb=>cb.onchange=()=>{
      const set=new Set(state.concepts[p.id]||[]);
      cb.checked?set.add(+cb.dataset.k):set.delete(+cb.dataset.k);
      state.concepts[p.id]=[...set]; save();
      const y=scrollY; route(); scrollTo(0,y);
      if(cb.checked && set.size===p.concepts.length) toast("All concepts covered. Time for the quiz.");
    });
  }
  if(tab==="build"){ $("buildDone").onchange=e=>{ state.build[p.id]=e.target.checked; save(); route(); if(e.target.checked) toast("Build marked as done"); }; }
  if(tab==="quiz") renderRunner();
}

/* ---------- lessons ---------- */
const inline = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
function md(src){
  return src.split(/```[a-zA-Z]*\n?/).map((part,i)=>{
    if(i%2) return `<pre class="code">${esc(part.replace(/\n$/,""))}</pre>`;
    const out=[]; let list=null;
    const flush=()=>{ if(list){ out.push(`<${list.t}>${list.items.join("")}</${list.t}>`); list=null; } };
    part.split("\n").forEach(line=>{
      const fmt = t => inline(t).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
      let m;
      if(!line.trim()){ flush(); return; }
      if((m=line.match(/^#{1,4}\s+(.*)/))){ flush(); out.push(`<h4>${fmt(m[1])}</h4>`); return; }
      if((m=line.match(/^\s*[-*]\s+(.*)/))){ if(!list||list.t!=="ul"){ flush(); list={t:"ul",items:[]}; } list.items.push(`<li>${fmt(m[1])}</li>`); return; }
      if((m=line.match(/^\s*\d+[.)]\s+(.*)/))){ if(!list||list.t!=="ol"){ flush(); list={t:"ol",items:[]}; } list.items.push(`<li>${fmt(m[1])}</li>`); return; }
      flush(); out.push(`<p>${fmt(line)}</p>`);
    });
    flush(); return out.join("");
  }).join("");
}
const TUTOR_PROMPTS = [["Explain it more simply","Explain this concept more simply, as if I'm new to it, in under 150 words."],
  ["Analogy from my field","Explain this concept with an analogy from my background, then point out where the analogy breaks down."],
  ["Worked example","Show me a small, complete worked example of this concept and walk through it step by step. Use code only if it fits my role."],
  ["Quiz me","Ask me 3 short questions to check my understanding of this concept. Put the answers at the end under a heading 'Answers'."],
  ["Common mistakes","What do people commonly misunderstand or get wrong about this concept in real projects?"]];
const tutorChats = {};
let tutorCtl = null;

function lessonView(i, k){
  const p=PHASES[i], L=LESSONS[p.id][k], [title, sum]=p.concepts[k], done=new Set(state.concepts[p.id]||[]), key=p.id+"-"+k;
  const n=p.concepts.length;
  const prev = k>0 ? `<a class="btn sec" href="#p-${p.id}-l${k-1}">← Previous lesson</a>` : `<a class="btn sec" href="#p-${p.id}">← Phase overview</a>`;
  const next = k<n-1 ? `<a class="btn" href="#p-${p.id}-l${k+1}">Next lesson →</a>` : `<a class="btn" href="#p-${p.id}-quiz">Take the phase quiz →</a>`;
  return `<div class="ph-head"><div><div class="label">Phase ${i+1} · Lesson ${k+1} of ${n}</div><h1 style="margin-top:4px">${esc(title)}</h1><p class="muted">${esc(sum)}</p></div></div>
  <div class="layout"><div style="display:flex;flex-direction:column;gap:20px;min-width:0">
    <article class="card lesson"><div class="card-b">
      ${L.p.map(t=>`<p>${inline(t)}</p>`).join("")}
      ${L.code?`<div class="label" style="margin-top:6px">Example</div><pre class="code">${esc(L.code)}</pre>`:""}
      <div class="try"><div class="label" style="color:var(--amber)">Try it · about 10 minutes</div><p>${inline(L.try)}</p></div>
    </div>
    <label class="done-row"><input type="checkbox" id="lessonDone" ${done.has(k)?"checked":""}><span><b>I can explain this without notes</b><br><span class="muted" style="font-size:13px">Marks the concept as understood for this phase.</span></span></label></article>
    <section class="card tutor" aria-label="AI tutor"><div class="card-h"><div><h2>Ask the tutor</h2><p class="muted" style="font-size:13px;margin-top:2px">Claude answers using this lesson and your background. Uses your Claude account.</p></div>
      ${(tutorChats[key]||[]).length?`<button class="btn sec" id="tClear" style="padding:5px 10px;font-size:13px">Clear chat</button>`:""}</div>
      <div class="card-b" style="display:flex;flex-direction:column;gap:14px">
        <div class="chips">${TUTOR_PROMPTS.map(([l],j)=>`<button class="chipbtn" data-j="${j}">${l}</button>`).join("")}</div>
        <div id="tLog" class="tlog">${(tutorChats[key]||[]).map(m=>m.role==="user"?`<div class="tq">${esc(m.show||m.content)}</div>`:`<div class="ta">${md(m.content)}</div>`).join("")}</div>
        <form id="tForm" class="tform"><textarea id="tInput" rows="2" placeholder="Ask anything about ${esc(title)}…"></textarea>
          <div class="tactions"><span class="hint">Enter to send · Shift+Enter for a new line</span><button class="btn sec" type="button" id="tStop" hidden>Stop</button><button class="btn" type="submit" id="tSend">Ask</button></div></form>
      </div></section>
    <div class="pager">${prev}${next}</div>
  </div>
  <div class="aside"><div class="card"><div class="card-h"><h2>Phase ${i+1} lessons</h2><span class="num muted">${done.size}/${n}</span></div>
    <ul class="lnav">${p.concepts.map(([t],j)=>`<li><a href="#p-${p.id}-l${j}" class="${j===k?"on":""}"><span class="chk ${done.has(j)?"on":""}">${done.has(j)?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>':""}</span><span>${esc(t)}</span></a></li>`).join("")}</ul>
    <div class="card-b" style="border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px"><a class="btn sec" href="#p-${p.id}-quiz" style="justify-content:center">Phase quiz</a><a class="btn sec" href="#p-${p.id}-build" style="justify-content:center">Build task</a></div></div>
    <div class="card"><div class="card-h"><h2>Go deeper</h2></div><ul class="res">${p.res.slice(0,2).map(([kd,t,u])=>`<li><a href="${u}" target="_blank" rel="noopener" style="grid-template-columns:minmax(0,1fr) 16px"><span><b>${esc(t)}</b><span class="d">${kd}</span></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a></li>`).join("")}</ul></div>
  </div></div>`;
}
function bindLesson(i, k){
  const p=PHASES[i], key=p.id+"-"+k;
  $("lessonDone").onchange=e=>{
    const set=new Set(state.concepts[p.id]||[]);
    e.target.checked?set.add(k):set.delete(k);
    state.concepts[p.id]=[...set]; save();
    if(e.target.checked) toast(set.size===p.concepts.length?"All lessons done. Time for the quiz.":"Marked as understood");
    const y=scrollY; route(); scrollTo(0,y);
  };
  if(!window.claude?.use){ document.querySelector(".tutor")?.remove(); return; }   // tutor needs Claude; hidden on the GitHub Pages copy
  document.querySelectorAll(".chipbtn").forEach(b=>b.onclick=()=>askTutor(i,k,TUTOR_PROMPTS[+b.dataset.j][1],TUTOR_PROMPTS[+b.dataset.j][0]));
  $("tForm").onsubmit=e=>{ e.preventDefault(); const q=$("tInput").value.trim(); if(q){ $("tInput").value=""; askTutor(i,k,q); } };
  $("tInput").onkeydown=e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); $("tForm").requestSubmit(); } };
  $("tStop").onclick=()=>tutorCtl?.abort();
  if($("tClear")) $("tClear").onclick=()=>{ delete tutorChats[key]; const y=scrollY; route(); scrollTo(0,y); };
}
function tutorContext(i,k){
  const p=PHASES[i], L=LESSONS[p.id][k];
  return `You are a patient, practical tutor inside a learning app. The learner is ${TRACK.learner}, moving towards the role of ${TRACK.to}.
They are studying phase ${i+1} "${p.title}", concept "${p.concepts[k][0]}" (${p.concepts[k][1]}).
Lesson text they just read:
<lesson>
${L.p.join("\n\n")}
${L.code?"\nExample code:\n"+L.code:""}
</lesson>
Answer their question clearly and accurately. Keep it under about 300 words unless they ask for more. Use analogies from ${TRACK.analogy} when they genuinely help. ${TRACK.tech?"Use short fenced code blocks for code.":"The learner doesn't code, so explain in plain language and avoid code unless they ask."} Format with simple Markdown (paragraphs, bullet lists, **bold**). If the question is unrelated to AI or software engineering, gently steer back to the lesson.`;
}
async function askTutor(i,k,question,label){
  const p=PHASES[i], key=p.id+"-"+k, log=$("tLog");
  if(tutorCtl) return;
  const chat = tutorChats[key] = tutorChats[key]||[];
  const sample = window.claude?.use ? await claude.use("sample") : null;
  log.insertAdjacentHTML("beforeend", `<div class="tq">${esc(label||question)}</div><div class="ta" id="tLive"><p class="muted">Thinking…</p></div>`);
  const live=$("tLive"); live.removeAttribute("id");
  live.scrollIntoView({block:"nearest",behavior:"smooth"});
  if(!sample){ live.innerHTML=`<p class="muted">The tutor works when this page is open in Claude. Use the lesson's resources below meanwhile.</p>`; return; }
  const turns = chat.slice(-6).map(m=>({role:m.role, content:m.content}));
  const input = turns.length ? [{role:"user", content: tutorContext(i,k)+"\n\nFirst question: "+turns[0].content}, ...turns.slice(1), {role:"user", content:question}]
                             : tutorContext(i,k)+"\n\nQuestion: "+question;
  tutorCtl = new AbortController();
  $("tSend").disabled=true; $("tStop").hidden=false;
  let answer="";
  try{
    const res = await sample(input, {signal:tutorCtl.signal, cache:false, onText:({text})=>{ answer=text; live.innerHTML=md(text); }});
    answer=res.text; live.innerHTML=md(answer);
    chat.push({role:"user",content:question,show:label||question},{role:"assistant",content:answer});
    if(!F().tutor){ F().tutor=true; save(); }
  }catch(e){
    const msg = {not_granted:"You didn't allow this page to use Claude. Reload the page to be asked again.",
      rate_limited:"Too many questions at once. Wait a minute and try again.",
      cancelled:"Stopped.", prompt_too_large:"This chat got too long. Clear the chat and ask again.",
      sampling_disabled:"Claude access is turned off for this account.", capability_disabled:"Claude access is turned off for this page."}[e?.code]
      || "The tutor couldn't answer just now. Try again in a moment.";
    const kept = e?.text || answer;
    live.innerHTML = (kept?md(kept):"") + `<p class="terr">${esc(msg)}</p>`;
    if(kept && e?.code==="cancelled") chat.push({role:"user",content:question,show:label||question},{role:"assistant",content:kept});
  }finally{
    tutorCtl=null;
    if($("tSend")){ $("tSend").disabled=false; $("tStop").hidden=true; }
  }
}

/* ---------- quiz engine: phase quiz, daily challenge, boss battle ---------- */
function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function prepQ(q){ const o=shuffle(q.o.map((_,i)=>i)); return {...q,o:o.map(i=>q.o[i]),a:o.indexOf(q.a)}; }
function newRun(mode, phase, items){ quizRun={mode, phase, items:items.map(prepQ), answers:[], pos:0, combo:0, best:0, hearts: mode==="exam"?3:null, t0:Date.now(), xp0:xp(), msg:null}; }
function startQuiz(i){ newRun("quiz", i, shuffle(PHASES[i].quiz)); }
function startExam(){ newRun("exam", -1, shuffle(PHASES.flatMap((p,i)=>p.quiz.map(q=>({...q,from:i})))).slice(0,15)); }
function startDaily(){ newRun("daily", -1, dailyItems()); }
function runnerEl(){ return quizRun.mode==="quiz" ? $("runner") : $("view"); }
const heart = full => `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 5 6.6 5c2 0 3.4 1.1 4.4 2.5C12 6.1 13.4 5 15.4 5c3.3 0 5.5 3.3 4.1 6.7C19.5 16.4 12 21 12 21z" fill="${full?"var(--bad)":"none"}" stroke="${full?"var(--bad)":"var(--faint)"}" stroke-width="1.8"/></svg>`;

function renderRunner(){
  const r=quizRun, el=runnerEl(); if(!el) return;
  const n=r.items.length, correct=r.answers.filter((a,i)=>a===r.items[i].a).length;
  if(r.pos>=n){ el.innerHTML = resultsHTML(r, correct, n); bindResults(r); return; }
  const q=r.items[r.pos], ans=r.answers[r.pos];
  const title = r.mode==="exam" ? `<div class="boss-h"><span class="label" style="color:var(--bad)">Boss battle</span><span class="hearts" aria-label="${r.hearts} lives left">${[0,1,2].map(h=>heart(h<r.hearts)).join("")}</span></div>`
              : r.mode==="daily" ? `<div class="boss-h"><span class="label" style="color:var(--flame)">Daily challenge · ${dayKey()}</span></div>` : "";
  el.innerHTML = `<div class="runner">${title}
    <div class="run-top"><span>Question <b class="num" style="color:var(--ink)">${r.pos+1}</b> of ${n}</span>
      <span class="combo ${r.combo>=2?"hot":""}" aria-live="polite">${r.combo>=2?flame(true)+` Combo ×${r.combo}`:`<span class="num">${correct}</span> correct`}</span></div>
    <div class="bar" style="margin-bottom:16px"><i style="width:${(r.pos+(ans!=null?1:0))/n*100}%"></i></div>
    <div class="card qcard ${ans!=null?(ans===q.a?"pop-ok":"shake"):""}">
      ${r.msg?`<div class="cheer ${ans===q.a?"ok":"no"}">${esc(r.msg)}</div>`:""}
      ${q.from!=null?`<div class="qmeta">Phase ${q.from+1} · ${esc(PHASES[q.from].title)}</div>`:""}
      <div class="qtext">${esc(q.q)}</div>
      ${q.code?`<pre class="code">${esc(q.code)}</pre>`:""}
      <div class="opts">${q.o.map((o,k)=>{ let c=""; if(ans!=null){ c = k===q.a?"right":k===ans?"wrong":"dim"; } return `<button class="opt ${c}" data-k="${k}" ${ans!=null?"disabled":""}><kbd>${"ABCD"[k]}</kbd><span>${esc(o)}</span></button>`; }).join("")}</div>
      ${ans!=null?`<div class="feedback ${ans===q.a?"ok":"no"}"><b>${ans===q.a?"Correct":"Not quite"}</b>${esc(q.e)}</div>`:""}
    </div>
    <div class="run-foot"><span class="hint">Keyboard: A–D to answer, Enter for next</span>
      <button class="btn" id="nextQ" ${ans==null?"disabled":""}>${r.pos===n-1||r.hearts===0?"See results":"Next question"}</button></div></div>`;
  el.querySelectorAll(".opt").forEach(b=>b.onclick=()=>answer(+b.dataset.k));
  $("nextQ").onclick=advance;
}
function answer(k){
  const r=quizRun; if(r.pos>=r.items.length || r.answers[r.pos]!=null) return;
  r.answers[r.pos]=k;
  if(k===r.items[r.pos].a){ r.combo++; r.best=Math.max(r.best,r.combo); if(r.combo>=5) F().combo5=true; r.msg=r.combo>=3?`${pick(CHEERS)} · ×${r.combo}`:pick(CHEERS); }
  else { r.combo=0; r.msg=pick(OOPS); if(r.hearts!=null) r.hearts--; }
  if(r.hearts===0) for(let i=r.pos+1;i<r.items.length;i++) r.answers[i]=-1;   // out of lives: the rest count as missed
  if(r.answers.filter(a=>a!=null).length===r.items.length) finish();
  renderRunner(); $("nextQ")?.focus();
}
function advance(){ const r=quizRun; if(r.answers[r.pos]==null) return; r.pos = r.hearts===0 ? r.items.length : r.pos+1; r.msg=null; renderRunner(); renderNav(parse()); scrollTo({top:0}); }
function finish(){
  const r=quizRun, c=r.answers.filter((a,i)=>a===r.items[i].a).length, s=c/r.items.length;
  r.secs=Math.round((Date.now()-r.t0)/1000);
  if(r.mode==="daily"){
    if(!dailyDone()){ state.daily={date:dayKey(), s, c}; state.bonus=(state.bonus||0)+c*15; F().daily=true; }
  } else {
    state.history=(state.history||[]).concat({k:r.mode==="exam"?"e":"q",p:r.mode==="exam"?null:PHASES[r.phase].id,s,at:Date.now()}).slice(-50);
    if(r.mode==="exam") state.exam=Math.max(state.exam??0,s);
    else { const id=PHASES[r.phase].id; state.quiz[id]=Math.max(state.quiz[id]??0,s); if(s>=0.8 && r.secs<60) F().speed=true; }
  }
  r.gained = null;
  save();
  r.gained = xp()-r.xp0;
  if(s===1) setTimeout(()=>confetti(160),300);
}
function resultsHTML(r, correct, n){
  const s=correct/n, exam=r.mode==="exam", daily=r.mode==="daily";
  const prevBest = exam ? state.exam : daily ? null : state.quiz[PHASES[r.phase].id];
  const head = exam ? (s>=0.8?"Victory! Boss defeated":r.hearts===0?"Defeated. The boss wins this round":"The boss survived. Try again")
             : s===1?"Perfect score. Zero loss!":s>=0.8?"Strong result":s>=0.5?"Good start. Review and retake":"Revisit the lessons, then retake";
  const actions = exam ? `<button class="btn" id="again">Fight again</button><a class="btn sec" href="#exam">Back to boss lair</a>`
    : daily ? `<a class="btn" href="#dashboard">Back to dashboard</a>`
    : `<button class="btn" id="again">Retake quiz</button><a class="btn sec" href="#p-${PHASES[r.phase].id}">Back to overview</a>${r.phase<PHASES.length-1?`<a class="btn sec" href="#p-${PHASES[r.phase+1].id}">Next phase →</a>`:""}`;
  return `<div class="runner" style="display:flex;flex-direction:column;gap:20px">
    <div class="card result">${ring(s,96,9,"var(--line)",s>=0.8?"var(--good)":s>=0.5?"var(--amber)":"var(--bad)")}
      <div class="big num">${correct}/${n}</div>
      <h2>${head}</h2>
      <div class="res-stats">
        <span><b class="num">${r.gained>0?"+"+r.gained:"0"}</b>XP earned</span>
        <span><b class="num">×${r.best}</b>best combo</span>
        <span><b class="num">${r.secs>=60?Math.floor(r.secs/60)+"m "+(r.secs%60)+"s":r.secs+"s"}</b>time</span>
        ${prevBest!=null?`<span><b class="num">${pct(Math.max(prevBest,s))}</b>best score</span>`:""}
      </div>
      ${daily?`<p class="muted">Next challenge in about ${hoursToMidnight()} hours. Come back tomorrow to keep your streak.</p>`:""}
      ${r.gained===0&&!daily?`<p class="muted" style="font-size:13px">XP comes from your best score, so beat it to earn more.</p>`:""}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px">${actions}</div></div>
    <div class="card"><div class="card-h"><h2>Review answers</h2></div>
      <ul class="review">${r.items.map((q,i)=>{ const a=r.answers[i], ok=a===q.a; return `<li><span class="mk ${ok?"ok":"no"}">${ok?"✓":"✗"}</span><div><p class="q">${esc(q.q)}</p>${ok?"":a>=0?`<p><span class="muted">Your answer:</span> ${esc(q.o[a])}</p>`:`<p class="muted">Not reached</p>`}<p><span class="muted">Correct:</span> ${esc(q.o[q.a])}</p><p class="muted" style="margin-top:4px">${esc(q.e)}</p></div></li>`; }).join("")}</ul></div></div>`;
}
function bindResults(r){ const b=$("again"); if(b) b.onclick=()=>{ r.mode==="exam"?startExam():startQuiz(r.phase); renderRunner(); scrollTo({top:0}); }; }
document.addEventListener("keydown",e=>{
  if(!$("levelup").hidden && e.key==="Escape"){ $("levelup").hidden=true; return; }
  if(!quizRun || !document.querySelector(".qcard") || e.metaKey||e.ctrlKey||e.altKey || e.target.tagName==="TEXTAREA") return;
  const k="abcd".indexOf(e.key.toLowerCase());
  if(k>=0 && k<quizRun.items[quizRun.pos]?.o.length){ answer(k); e.preventDefault(); }
  else if(e.key==="Enter" && quizRun.answers[quizRun.pos]!=null && document.activeElement?.tagName!=="A"){ advance(); e.preventDefault(); }
});

/* ---------- boss lair ---------- */
function examHome(){
  const ex=(state.history||[]).filter(h=>h.k==="e").slice(-8).reverse();
  return `<div class="boss-hero card"><div class="boss-glyph num" aria-hidden="true">♛</div><div>
      <div class="label" style="color:var(--bad)">Final boss</div><h1 style="margin-top:4px">The Checkpoint</h1>
      <p class="muted" style="margin-top:6px;max-width:60ch">15 random questions from all ${PHASES.length} phases of your path. You have 3 lives: each wrong answer costs one, and losing all three ends the fight. Score 80% to defeat the boss and earn the Boss slayer badge.</p>
      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center"><button class="btn danger-btn" id="startExam">Enter the battle</button><span class="hearts">${heart(1)}${heart(1)}${heart(1)}</span></div></div></div>
    <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="card kpi"><div class="label">Best score</div><b>${state.exam!=null?pct(state.exam):"–"}</b><small>${(state.exam||0)>=0.8?"Boss defeated":"80% to win"}</small></div>
      <div class="card kpi"><div class="label">Attempts</div><b>${(state.history||[]).filter(h=>h.k==="e").length}</b></div>
      <div class="card kpi"><div class="label">Question pool</div><b>${PHASES.reduce((a,p)=>a+p.quiz.length,0)}</b></div>
    </div>
    <div class="card"><div class="card-h"><h2>Past battles</h2></div>
      ${ex.length?`<ul class="hist">${ex.map(h=>`<li><span>${fmtDate(h.at)}</span><span class="pill ${h.s>=0.8?"good":h.s>=0.5?"warn":""}">${h.s>=0.8?"Victory · ":""}${pct(h.s)}</span></li>`).join("")}</ul>`:`<p class="empty">No battles yet. Your results will appear here.</p>`}</div>`;
}
function bindExamHome(){ $("startExam").onclick=()=>{ startExam(); go("exam-run"); }; }

/* ---------- shell ---------- */
$("menuBtn").onclick=()=>$("app").classList.add("open");
$("scrim").onclick=()=>$("app").classList.remove("open");
$("resetBox").addEventListener("click",e=>{
  const box=$("resetBox");
  if(e.target.id==="resetBtn") box.innerHTML=`<div class="confirm"><span>Erase progress on this path?</span><button class="danger" id="resetYes">Erase</button><button id="resetNo">Cancel</button></div>`;
  else if(e.target.id==="resetNo") box.innerHTML=`<button class="linkbtn" id="resetBtn">Reset progress</button>`;
  else if(e.target.id==="resetYes"){ root.paths[TRACK.id]=blank(); useTrackState(TRACK.id); quizRun=null; lastLevel=null; lastXp=xp(); persist(); renderPlayer(); box.innerHTML=`<button class="linkbtn" id="resetBtn">Reset progress</button>`; route(); toast("Path progress reset"); }
});
addEventListener("hashchange",()=>{ route(); scrollTo({top:0}); });
/* the AI tutor needs Claude; on the standalone (GitHub Pages) copy, announce it instead */
(function(){
  const KEY_SOON="ai-path-soon-dismissed"; let dismissed=false;
  try{ dismissed = localStorage.getItem(KEY_SOON)==="1"; }catch(e){}
  if(window.claude?.use || dismissed) return;
  $("soonBanner").hidden=false;
  $("soonClose").onclick=()=>{ $("soonBanner").hidden=true; try{ localStorage.setItem(KEY_SOON,"1"); }catch(e){} };
})();
loadLocal(); initTrack(); quietSync();
route(); connect();
