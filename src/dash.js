
/* ---------- dashboard: player banner, quest map, daily, badges ---------- */
function dashboard(){
  const L=levelInfo(), s=streak(), today=studiedToday(), ms=PHASES.map((_,i)=>mastery(i));
  const np=nextPhase(), earned=state.badges||{}, nEarned=BADGES.filter(b=>earned[b[0]]).length;
  const overall=ms.reduce((a,b)=>a+b,0)/ms.length;
  const next = np==null ? {label:"Fight the boss", href:"#exam"} : nextAction(np);
  const recent=(state.history||[]).slice(-5).reverse();
  return `
  <section class="player-banner card">
    <div class="pb-lvl"><div class="pb-ring">${ring(L.prog,112,10,"var(--line)","var(--xp)")}<div class="pb-num"><span class="num">${L.level}</span><small>LEVEL</small></div></div></div>
    <div class="pb-main">
      <div class="label" style="color:var(--xp)">Rank ${L.level} of ${RANKS.length}</div>
      <h1>${esc(L.name)}</h1>
      <p class="muted">${esc(L.tag)}</p>
      <div class="pb-xp"><div class="bar xp"><i style="width:${pct(L.prog)}"></i></div><span class="num">${L.xp} XP${L.next!=null?` · ${L.toNext} to <b>${esc(rankName(L.level))}</b>`:" · max rank"}</span></div>
      <div class="pb-actions"><a class="btn" href="${next.href}">${esc(next.label)}</a>${dailyDone()?"":`<a class="btn sec" href="#daily">${flame(false)} Daily challenge</a>`}</div>
    </div>
    <div class="pb-side">
      <div class="streak-box ${today?"lit":""}"><div class="sb-flame">${flame(today).replace('width="14" height="14"','width="34" height="34"')}</div><div><b class="num">${s}</b><span>day streak</span></div></div>
      <p class="muted" style="font-size:12.5px">${today?"You've studied today. Streak safe.":s?"Study today to keep your streak alive.":"Study today to start a streak."}</p>
      <div class="week">${weekDots()}</div>
    </div>
  </section>

  <div class="kpis">
    <div class="card kpi"><div class="label">Overall mastery</div><b>${pct(overall)}</b><div class="bar ${overall>=0.8?"good":""}" style="margin-top:8px"><i style="width:${pct(overall)}"></i></div></div>
    <div class="card kpi"><div class="label">Phases mastered</div><b>${ms.filter(m=>m>=0.8).length}<span class="muted" style="font-size:16px"> / ${PHASES.length}</span></b><small>80% mastery each</small></div>
    <div class="card kpi"><div class="label">Badges</div><b>${nEarned}<span class="muted" style="font-size:16px"> / ${BADGES.length}</span></b><small>${nEarned?"Keep collecting":"Earn your first one today"}</small></div>
    <div class="card kpi"><div class="label">Best streak</div><b>${bestStreak()}<span class="muted" style="font-size:16px"> days</span></b><small>${(state.days||[]).length} study days total</small></div>
  </div>

  <div class="grid2">
    <div class="card"><div class="card-h"><div><h2>Quest map</h2><p class="muted" style="font-size:13px;margin-top:2px">${PHASES.length} worlds from ${esc(TRACK.from.toLowerCase())} to ${esc(TRACK.to.toLowerCase())}. Master each one at 80%. <a href="#paths">Switch path</a></p></div></div>
      <div class="quest">${questMap(ms, np)}</div></div>
    <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
      ${dailyCard()}
      <div class="card"><div class="card-h"><h2>How XP works</h2></div>
        <ul class="hist">${XP_RULES.map(([t,v])=>`<li><span>${t}</span><span class="num" style="color:var(--xp);font-weight:600">+${v}</span></li>`).join("")}</ul></div>
      <div class="card"><div class="card-h"><h2>Training loss</h2><div class="legend"><span><i></i>You</span><span><i class="d"></i>All mastered</span></div></div>
        <div class="card-b"><svg id="curve" viewBox="0 0 560 190" role="img" aria-label="Loss curve by phase">${curve(ms)}</svg></div></div>
    </div>
  </div>

  <div class="card"><div class="card-h"><div><h2>Badges</h2><p class="muted" style="font-size:13px;margin-top:2px">${nEarned} of ${BADGES.length} unlocked</p></div></div>
    <div class="badges">${BADGES.map(b=>badgeHTML(b, earned[b[0]])).join("")}</div></div>

  <div class="card"><div class="card-h"><div><h2>How to study each phase</h2><p class="muted" style="font-size:13px;margin-top:2px">About an hour a day. Reading alone won't make it stick; the exercises and builds do.</p></div></div>
    <ol class="method">${[["Read the lesson","10–15 min. Each concept has a short lesson with an example."],
      ["Run the example","Type the code yourself instead of copying it, then change something and see what breaks."],
      ["Ask the tutor","Stuck? Ask for a simpler explanation, an analogy from your field or a worked example."],
      ["Do the exercise","Every lesson ends with a 10-minute task. Tick the lesson only when you can explain it without notes."],
      ["Watch or read the resource","Use the linked course or video for depth on the topics you found hardest."],
      ["Quiz, then build","Pass the quiz at 80%, then do the build task. The build is where the learning really sets in."]]
      .map(([t,d])=>`<li><b>${t}</b><span class="muted">${d}</span></li>`).join("")}</ol></div>

  <div class="card"><div class="card-h"><h2>Recent activity</h2></div>
    ${recent.length?`<ul class="hist">${recent.map(h=>`<li><span>${h.k==="e"?"Boss battle":"Quiz · "+esc(PHASES[idx(h.p)]?.title||"")}</span><span class="num muted">${fmtDate(h.at)} · <b style="color:var(--ink)">${pct(h.s)}</b></span></li>`).join("")}</ul>`
      :`<p class="empty">No quizzes taken yet. Your quiz and boss results will appear here.</p>`}</div>`;
}
function weekDots(){
  const set=new Set(state.days||[]), out=[], d=new Date(); d.setDate(d.getDate()-6);
  for(let i=0;i<7;i++){ const k=dayKey(d), on=set.has(k); out.push(`<span class="wd ${on?"on":""} ${i===6?"today":""}" title="${k}"><i></i>${"SMTWTFS"[d.getDay()]}</span>`); d.setDate(d.getDate()+1); }
  return out.join("");
}
function questMap(ms, np){
  const xs=[8,38,62,38,8,38,62,38,8,38];
  return PHASES.map((p,i)=>{
    const m=ms[i], done=m>=0.8, cur=i===np;
    return `<a class="qnode ${done?"done":""} ${cur?"cur":""}" href="#p-${p.id}" style="--x:${xs[i%xs.length]}%">
      <span class="qn-dot">${ring(m,64,6,"var(--line)",done?"var(--good)":"var(--accent)")}<span class="qn-in num">${done?"✓":i+1}</span>${cur?`<span class="qn-tag">You are here</span>`:""}</span>
      <span class="qn-txt"><b>${esc(p.title)}</b><small class="num">${pct(m)} · ${p.weeks}</small></span></a>`;
  }).join("");
}
function dailyCard(){
  if(dailyDone()){ const d=state.daily; return `<div class="card daily done"><div class="card-b"><div class="label" style="color:var(--flame)">Daily challenge</div><h2 style="margin-top:4px">Done for today: ${d.c}/5</h2><p class="muted" style="font-size:14px;margin-top:4px">You earned +${d.c*15} XP. A new set of questions unlocks in about ${hoursToMidnight()} hours.</p></div></div>`; }
  return `<div class="card daily"><div class="card-b"><div class="label" style="color:var(--flame)">Daily challenge</div><h2 style="margin-top:4px">5 questions, mixed topics</h2><p class="muted" style="font-size:14px;margin:4px 0 14px">One try per day. +15 XP for each correct answer, and it counts towards your streak.</p><a class="btn flame-btn" href="#daily">${flame(false)} Start today's challenge</a></div></div>`;
}
function dailyDoneHTML(){
  const d=state.daily;
  return `<div class="runner"><div class="card result"><div class="big num">${d.c}/5</div><h2>Today's challenge is done</h2><p class="muted">You earned +${d.c*15} XP. A new challenge unlocks in about ${hoursToMidnight()} hours.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px"><a class="btn" href="#dashboard">Back to dashboard</a></div></div></div>`;
}
function bindDashboard(){}
