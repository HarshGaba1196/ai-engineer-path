
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

function pathsView(){
  const card = t => {
    const m=pathMastery(t), cur=isCurrent(t), started=!!root.paths[t.id] && m>0;
    return `<a class="card path-card ${cur?"cur":""}" href="#path-${t.id}">
      <span class="pc-from">${esc(t.from)}</span>
      <span class="pc-to">${arrow}<b>${esc(t.to)}</b></span>
      <span class="pc-meta num">${trackPhases(t).length} phases · ~${trackWeeks(t)} wks</span>
      ${cur?'<span class="pill good">Your path</span>':started?`<span class="pill prog">${pct(m)} done</span>`:""}
      ${started||cur?`<span class="bar ${m>=0.8?"good":""}"><i style="width:${pct(m)}"></i></span>`:""}
    </a>`;
  };
  return `<div class="hero"><div><div class="label" style="color:var(--xp)">Choose your path</div><h1 style="margin-top:4px">Where are you now, and where do you want to go?</h1>
    <p class="muted">Tap a path to see what's inside. Each path keeps its own progress, XP and badges. Your daily streak counts across all of them.</p>
    ${root.track?`<div class="home-hero-actions"><a class="btn" href="#dashboard">Continue: ${esc(TRACK.from)} → ${esc(TRACK.to)}</a></div>`:""}</div></div>
    <h2 class="sec-h">Technical paths</h2><div class="paths">${TRACKS.filter(t=>t.tech).map(card).join("")}</div>
    <h2 class="sec-h">Non-technical paths</h2><div class="paths">${TRACKS.filter(t=>!t.tech).map(card).join("")}</div>`;
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
  document.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.track, changed = needsPick || id!==TRACK.id;
    root.track=id; quizRun=null; initTrack(); lastLevel=levelInfo().level; persist(); renderPlayer();   // picking a path isn't study activity, so no streak day
    if(changed) toast(`Path set: ${TRACK.from} → ${TRACK.to}`);
    go("dashboard");
  });
}
