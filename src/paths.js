
/* ---------- paths: picker cards, detail page, per-path progress ---------- */
let needsPick = false;
function initTrack(){
  needsPick = !root.track;
  setTrack(root.track || "backend");
  useTrackState(TRACK.id);
  const sub = $("brandSub"); if(sub) sub.textContent = needsPick ? "Your leap into AI" : `${TRACK.from} → ${TRACK.to}`;
}
/* mastery of one module inside one path's own progress */
function moduleMastery(p, d){
  const c=(d.concepts[p.id]||[]).length/p.concepts.length, q=d.quiz[p.id]??0, b=d.build[p.id]?1:0;
  return 0.4*c + 0.4*q + 0.2*b;
}
function pathData(t){ return Object.assign(blank(), root.paths[t.id]||{}); }
function pathMastery(t){ const d=pathData(t), ps=trackPhases(t); return ps.reduce((a,p)=>a+moduleMastery(p,d),0)/ps.length; }
const isCurrent = t => !needsPick && t.id===TRACK.id;
const arrow = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--xp)" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

/* ---------- home: route map, path finder, filters, cards ---------- */
const LOOK = {backend:["{ }","--accent"], frontend:["</>","--xp"], devops:["∞","--good"], qa:["✓","--amber"], analyst:["Σ","--teal"], dataeng:["⇶","--sky"], security:["◈","--bad"], fullstack:["⧉","--indigo"], datasci:["∂","--cyan"], pmgr:["▦","--brown"], writer:["¶","--mint"], mobile:["▯","--lime"], ba:["≡","--slate"], pm:["◎","--flame"], ux:["◐","--plum"], nontech:["★","--rose"]};
let homeFilter = "all", finder = {step:0, tech:null, pick:null};
const FINDER_Q2 = {
  tech:{q:"What do you mostly work on?", o:[["Backend services and APIs","backend"],["Web interfaces","frontend"],["Full-stack web development","fullstack"],["Mobile apps (iOS or Android)","mobile"],["Infrastructure, CI/CD and cloud","devops"],["Testing and quality","qa"],["Data analysis, SQL and dashboards","analyst"],["Data pipelines and warehouses","dataeng"],["Data science and modelling","datasci"],["Security and threat detection","security"]]},
  non:{q:"Which is closest to your role?", o:[["Product management","pm"],["UX, UI or product design","ux"],["Business analysis and requirements","ba"],["Project or delivery management","pmgr"],["Technical writing or documentation","writer"],["Something else: operations, marketing, HR, sales, support, finance…","nontech"]]}};

function pathsView(){
  const nMods = new Set(TRACKS.flatMap(t=>t.modules)).size;
  const nLessons = [...new Set(TRACKS.flatMap(t=>t.modules))].reduce((a,id)=>a+(LESSONS[id]||[]).length,0);
  const nQs = [...new Set(TRACKS.flatMap(t=>t.modules))].reduce((a,id)=>a+MODULES.find(m=>m.id===id).quiz.length,0);
  return `<section class="home-hero">
    <div class="hh-text">
      <div class="label" style="color:var(--xp)">${TRACKS.length} career paths into AI</div>
      <h1>Make your leap into AI, from the job you already have</h1>
      <p class="muted">Pick where you are today. Each path builds on skills you already have and takes you, lesson by lesson, to a new AI role.</p>
      <div class="hh-stats num">
        <span><b data-count="${TRACKS.length}">${TRACKS.length}</b>paths</span>
        <span><b data-count="${nMods}">${nMods}</b>modules</span>
        <span><b data-count="${nLessons}">${nLessons}</b>lessons</span>
        <span><b data-count="${nQs}">${nQs}</b>quiz questions</span>
      </div>
      <div class="home-hero-actions">
        ${root.track?`<a class="btn" href="#dashboard">Continue: ${esc(TRACK.to)}</a>`:""}
        <button class="btn ${root.track?"sec":""}" id="findBtn">Find my path</button>
      </div>
    </div>
    <div class="hh-map card" aria-label="Route map from current roles to AI roles">${routeMap()}<p class="map-hint">Hover or tap a role to see where it leads</p></div>
  </section>
  <section class="card finder" id="finder" ${finder.step?"":"hidden"}></section>
  <div class="home-bar">
    <h2>All paths</h2>
    <div class="seg" role="tablist" aria-label="Filter paths">${[["all","All"],["tech","Technical"],["non","Non-technical"]].map(([k,l])=>`<button role="tab" data-filter="${k}" aria-selected="${homeFilter===k}">${l}</button>`).join("")}</div>
  </div>
  <div class="paths" id="pathGrid">${pathCards()}</div>`;
}
function pathCards(){
  return TRACKS.filter(t=>homeFilter==="all" || (homeFilter==="tech")===t.tech).map((t,i)=>{
    const m=pathMastery(t), cur=isCurrent(t), started=!!root.paths[t.id] && m>0, ps=trackPhases(t), [g,c]=LOOK[t.id];
    return `<a class="card path-card ${cur?"cur":""} ${finder.pick===t.id?"match":""}" href="#path-${t.id}" data-id="${t.id}" style="--c:var(${c});--i:${i}">
      <span class="pc-top"><span class="pc-glyph num">${esc(g)}</span>${cur?'<span class="pill good">Your path</span>':started?`<span class="pill prog">${pct(m)} done</span>`:finder.pick===t.id?'<span class="pill warn">Best match</span>':""}</span>
      <span class="pc-from">${esc(t.from)}</span>
      <span class="pc-to">${arrow}<b>${esc(t.to)}</b></span>
      <span class="pc-meta num">${ps.length} phases · ~${trackWeeks(t)} weeks · ${t.tech?"Technical":"No coding"}</span>
      ${started||cur?`<span class="bar ${m>=0.8?"good":""}"><i style="width:${pct(m)}"></i></span>`:""}
      <span class="pc-peek"><span class="label">First up</span>${ps.slice(0,3).map(p=>`<span>${esc(p.title)}</span>`).join("")}<span class="muted">+${ps.length-3} more · See details →</span></span>
    </a>`;
  }).join("");
}
function routeMap(){
  const W=610, n=TRACKS.length, H=Math.max(320, 48+n*28), y=i=>34+i*(H-68)/(n-1), hx=W/2, hy=H/2;
  const rows = TRACKS.map((t,i)=>{
    const [,c]=LOOK[t.id];
    return `<g class="route" data-id="${t.id}" tabindex="0" role="link" aria-label="${esc(t.from)} to ${esc(t.to)}" style="--c:var(${c})">
      <path class="rl" d="M150 ${y(i)} C ${hx-60} ${y(i)}, ${hx-60} ${hy}, ${hx-26} ${hy}"/>
      <path class="rl" d="M${hx+26} ${hy} C ${hx+60} ${hy}, ${hx+60} ${y(i)}, ${W-175} ${y(i)}"/>
      <circle class="rd" cx="150" cy="${y(i)}" r="5"/><circle class="rd" cx="${W-175}" cy="${y(i)}" r="5"/>
      <text class="rt" x="140" y="${y(i)+4}" text-anchor="end">${esc(t.short||t.from)}</text>
      <text class="rt to" x="${W-165}" y="${y(i)+4}">${esc(t.to.replace("professional","pro"))}</text>
      <rect x="0" y="${y(i)-16}" width="${W}" height="32" fill="transparent"/>
    </g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="map" role="img">
    <text x="140" y="14" text-anchor="end" class="mh">YOU TODAY</text><text x="${W-165}" y="14" class="mh">YOUR AI ROLE</text>
    ${rows}
    <circle class="hub-glow" cx="${hx}" cy="${hy}" r="34"/><circle class="hub" cx="${hx}" cy="${hy}" r="24"/>
    <text x="${hx}" y="${hy+5}" text-anchor="middle" class="hub-t">AI</text>
  </svg>`;
}
function renderFinder(){
  const el=$("finder"); if(!el) return;
  el.hidden = !finder.step;
  if(!finder.step) return;
  let body;
  if(finder.step===1) body = `<div class="label">Question 1 of 2</div><h2>Do you write code in your job?</h2>
    <div class="f-opts"><button class="f-opt" data-tech="1"><b>Yes</b><span>I build or test software</span></button><button class="f-opt" data-tech="0"><b>No</b><span>I work with people, products or processes</span></button></div>`;
  else if(finder.step===2){ const q=FINDER_Q2[finder.tech?"tech":"non"];
    body = `<div class="label">Question 2 of 2</div><h2>${q.q}</h2><div class="f-opts">${q.o.map(([l,id])=>`<button class="f-opt" data-pick="${id}"><span class="pc-glyph num" style="--c:var(${LOOK[id][1]})">${esc(LOOK[id][0])}</span><b>${esc(l)}</b></button>`).join("")}</div>`; }
  else { const t=trackById(finder.pick);
    body = `<div class="label" style="color:var(--good)">Your best match</div>
      <div class="f-result"><span class="pc-glyph num big" style="--c:var(${LOOK[t.id][1]})">${esc(LOOK[t.id][0])}</span>
      <div><div class="pd-route"><span>${esc(t.from)}</span>${arrow}<h2>${esc(t.to)}</h2></div><p class="muted">${esc(t.tagline)}</p>
      <p class="muted num" style="font-size:13px;margin-top:4px">${trackPhases(t).length} phases · about ${trackWeeks(t)} weeks at an hour a day</p></div></div>
      <div class="home-hero-actions"><a class="btn" href="#path-${t.id}">See this path</a><button class="btn sec" id="fRestart">Start over</button></div>`; }
  el.innerHTML = `<button class="f-close" id="fClose" aria-label="Close path finder">×</button>${body}`;
  el.querySelectorAll("[data-tech]").forEach(b=>b.onclick=()=>{ finder.tech=b.dataset.tech==="1"; finder.step=2; renderFinder(); });
  el.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{ finder.pick=b.dataset.pick; finder.step=3; homeFilter="all"; renderFinder(); refreshGrid(); highlight(finder.pick, true); });
  $("fClose").onclick=()=>{ finder={step:0,tech:null,pick:null}; renderFinder(); refreshGrid(); highlight(null); };
  if($("fRestart")) $("fRestart").onclick=()=>{ finder={step:1,tech:null,pick:null}; renderFinder(); refreshGrid(); highlight(null); };
}
function refreshGrid(){
  const g=$("pathGrid"); if(!g) return;
  g.innerHTML=pathCards(); bindCards();
  document.querySelectorAll("[data-filter]").forEach(b=>b.setAttribute("aria-selected", b.dataset.filter===homeFilter));
}
let pinned=null;
function highlight(id, pin){
  if(pin!==undefined) pinned = pin ? id : null;
  const on = id || pinned;
  document.querySelector(".map")?.classList.toggle("focus", !!on);
  document.querySelectorAll(".route").forEach(r=>r.classList.toggle("on", r.dataset.id===on));
  document.querySelectorAll(".path-card").forEach(c=>c.classList.toggle("lit", c.dataset.id===on));
}
function bindCards(){
  document.querySelectorAll(".path-card").forEach(c=>{ c.onmouseenter=()=>highlight(c.dataset.id); c.onmouseleave=()=>highlight(null); c.onfocus=()=>highlight(c.dataset.id); });
}
function countUp(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-count]").forEach(el=>{
    const end=+el.dataset.count, t0=performance.now();
    (function f(t){ const k=Math.min(1,(t-t0)/900); el.textContent=Math.round(end*(1-Math.pow(1-k,3))); if(k<1) requestAnimationFrame(f); })(t0);
  });
}
function bindHome(){
  $("findBtn").onclick=()=>{ finder={step:1,tech:null,pick:null}; renderFinder(); $("finder").scrollIntoView({behavior:"smooth",block:"center"}); };
  document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{ homeFilter=b.dataset.filter; refreshGrid(); });
  document.querySelectorAll(".route").forEach(r=>{
    const id=r.dataset.id;
    r.onmouseenter=()=>highlight(id); r.onmouseleave=()=>highlight(null);
    r.onclick=()=>{ if(pinned===id) go("path-"+id); else { highlight(id,true); document.querySelector(`.path-card[data-id="${id}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest"}); } };
    r.onkeydown=e=>{ if(e.key==="Enter") go("path-"+id); };
  });
  bindCards(); renderFinder(); countUp();
  if(finder.pick) highlight(finder.pick, true);
}

function pathDetail(t){
  const ps=trackPhases(t), d=pathData(t), m=pathMastery(t), cur=isCurrent(t), started=m>0;
  const L=levelInfoFor(t, d);
  return `<a href="#paths" class="back">← All paths</a>
  <section class="card pd-hero">
    <div class="pd-top"><span class="pill ${t.tech?"prog":"warn"}">${t.tech?"Technical":"Non-technical"}</span>${cur?'<span class="pill good">Your path</span>':""}</div>
    <div class="pd-route"><span>${esc(t.from)}</span>${arrow}<h1>${esc(t.to)}</h1></div>
    <p class="muted" style="max-width:62ch">${esc(t.tagline)}</p>
    <div class="pd-stats num">
      <span><b>${ps.length}</b>phases</span><span><b>~${trackWeeks(t)}</b>weeks</span>
      <span><b>${ps.reduce((a,p)=>a+p.concepts.length,0)}</b>lessons</span><span><b>${t.overlap}</b>skill overlap</span>
    </div>
    ${started?`<div class="pd-prog"><div style="display:flex;justify-content:space-between;font-size:13px"><span>Your progress on this path · Level ${L.level} ${esc(L.name)}</span><b class="num">${pct(m)}</b></div><div class="bar ${m>=0.8?"good":""}"><i style="width:${pct(m)}"></i></div></div>`:""}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-track="${t.id}">${cur?"Continue this path":started?"Switch to this path":"Start this path"}</button>${cur?"":`<a class="btn sec" href="#paths">Compare paths</a>`}</div>
  </section>
  <div class="layout">
    <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
      <div class="card"><div class="card-h"><h2>What you'll learn</h2><span class="muted" style="font-size:13px">In this order</span></div>
        <ol class="pd-mods">${ps.map((p,i)=>{ const mm=moduleMastery(p,d); return `<li><span class="pd-n num ${mm>=0.8?"done":""}">${mm>=0.8?"✓":i+1}</span><div><b>${esc(p.title)}</b> <span class="muted num" style="font-size:12px">· ${p.weeks}</span><p class="muted">${esc(p.why)}</p><div class="pd-concepts">${p.concepts.map(c=>`<span>${esc(c[0])}</span>`).join("")}</div></div>${started?`<span class="num muted" style="font-size:12px">${pct(mm)}</span>`:""}</li>`; }).join("")}</ol></div>
    </div>
    <div class="aside">
      <div class="card"><div class="card-h"><h2>Good fit if you know</h2></div><div class="card-b"><div class="stack">${t.stack.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div></div></div>
      <div class="card"><div class="card-h"><h2>What you'll build</h2></div><ul class="hist">${ps.map(p=>`<li><span>${esc(p.build.title)}</span></li>`).join("")}</ul></div>
    </div>
  </div>`;
}
/* level for any path's data, without switching to it */
function levelInfoFor(t, d){
  const prev=[state, PHASES, TRACK]; state=d; TRACK=t; PHASES=trackPhases(t);
  try{ return levelInfo(); } finally { [state, PHASES, TRACK]=prev; }
}
function bindPaths(){
  if($("findBtn")) bindHome();
  document.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.track, changed = needsPick || id!==TRACK.id;
    root.track=id; quizRun=null; initTrack(); lastLevel=levelInfo().level; persist(); renderPlayer();   // picking a path isn't study activity, so no streak day
    if(changed) toast(`Path set: ${TRACK.from} → ${TRACK.to}`);
    go("dashboard");
  });
}
