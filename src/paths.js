
/* ---------- path picker ---------- */
let needsPick = false;
function initTrack(){
  if(!state.track && hasProgress()) state.track = "backend";        // people who started before paths existed
  needsPick = !state.track;
  setTrack(state.track || "backend");
  const sub = $("brandSub"); if(sub) sub.textContent = needsPick ? "Your leap into AI" : `${TRACK.from} → ${TRACK.to}`;
}
function moduleMastery(p){
  const c=(state.concepts[p.id]||[]).length/p.concepts.length, q=state.quiz[p.id]??0, b=state.build[p.id]?1:0;
  return 0.4*c + 0.4*q + 0.2*b;
}
function pathsView(){
  const card = t => {
    const ps=trackPhases(t), m=ps.reduce((a,p)=>a+moduleMastery(p),0)/ps.length, cur=!needsPick && t.id===TRACK.id;
    return `<article class="card path ${cur?"cur":""}">
      <div class="path-h"><span class="pill ${t.tech?"prog":"warn"}">${t.tech?"Technical":"Non-technical"}</span>${cur?'<span class="pill good">Your path</span>':""}</div>
      <div class="path-route"><span>${esc(t.from)}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--xp)" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><b>${esc(t.to)}</b></div>
      <p class="muted">${esc(t.tagline)}</p>
      <div class="stack">${t.stack.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div>
      <div class="path-meta num"><span><b>${ps.length}</b> phases</span><span><b>~${trackWeeks(t)}</b> weeks</span><span><b>${t.overlap}</b> overlap</span></div>
      <ol class="path-mods">${ps.map(p=>`<li class="${moduleMastery(p)>=0.8?"done":""}">${esc(p.title)}</li>`).join("")}</ol>
      ${m>0?`<div class="bar ${m>=0.8?"good":""}"><i style="width:${pct(m)}"></i></div><small class="muted">${pct(m)} mastered so far</small>`:""}
      <button class="btn ${cur?"sec":""}" data-track="${t.id}">${cur?"Continue this path":m>0?"Switch to this path":"Start this path"}</button>
    </article>`;
  };
  return `<div class="hero"><div><div class="label" style="color:var(--xp)">Choose your path</div><h1 style="margin-top:4px">Where are you now, and where do you want to go?</h1>
    <p class="muted">Each path reuses shared modules, so anything you finish counts in every path that includes it. Your XP, streak and badges stay with you when you switch.</p></div></div>
    <h2 class="sec-h">Technical paths</h2><div class="paths">${TRACKS.filter(t=>t.tech).map(card).join("")}</div>
    <h2 class="sec-h">Non-technical paths</h2><div class="paths">${TRACKS.filter(t=>!t.tech).map(card).join("")}</div>`;
}
function bindPaths(){
  document.querySelectorAll("[data-track]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.track, changed = needsPick || id!==TRACK.id;
    state.track=id; quizRun=null; initTrack(); lastLevel=levelInfo().level; persist(); renderPlayer();   // picking a path isn't study activity, so no streak day
    if(changed) toast(`Path set: ${TRACK.from} → ${TRACK.to}`);
    go("dashboard");
  });
}
