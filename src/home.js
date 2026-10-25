
/* ---------- home: streak & goals panel, path search ---------- */
const GOALS = [[20,"Casual"],[50,"Regular"],[100,"Serious"]];
const MILESTONES = [3,7,14,30,60,100,180,365];
let homeQuery = "";

function totalXpAllPaths(){
  return TRACKS.filter(t=>root.paths[t.id]).reduce((a,t)=>a+levelInfoFor(t, pathData(t)).xp,0);
}
function heatLevel(k){
  const x=(root.xpLog||{})[k]||0;
  if(x>=100) return 4; if(x>=50) return 3; if(x>=25) return 2; if(x>0 || (root.days||[]).includes(k)) return 1; return 0;
}
function heatmap(){
  const weeks=12, today=new Date(), start=new Date(today);
  start.setDate(start.getDate()-today.getDay()-(weeks-1)*7);          // Sunday, 12 weeks ago
  let cols="";
  for(let w=0; w<weeks; w++){
    let cells="";
    for(let d=0; d<7; d++){
      const day=new Date(start); day.setDate(start.getDate()+w*7+d);
      const k=dayKey(day), future=day>today, x=(root.xpLog||{})[k]||0;
      const label=day.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
      cells+= future ? `<i class="hm-cell fut"></i>` : `<i class="hm-cell l${heatLevel(k)} ${k===dayKey()?"today":""}" data-tip="${label}: ${x?`+${x} XP`:(root.days||[]).includes(k)?"studied":"no activity"}" tabindex="0"></i>`;
    }
    cols+=`<span class="hm-col">${cells}</span>`;
  }
  return `<div class="hm">${cols}</div>`;
}
function countdownText(){
  const n=new Date(), m=new Date(n); m.setHours(24,0,0,0);
  const mins=Math.max(0,Math.round((m-n)/60000));
  return `${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}m`;
}
function streakPanel(){
  const s=streak(), best=bestStreak(), today=studiedToday(), goal=root.goal||50, xt=xpToday();
  const next=MILESTONES.find(m=>m>s) || s+100, prevM=[0,...MILESTONES].filter(m=>m<=s).pop()||0;
  const L = root.track ? levelInfo() : null, total=totalXpAllPaths(), gp=Math.min(1,xt/goal);
  const nBadges = Object.values(root.paths).reduce((a,p)=>a+Object.keys(p.badges||{}).length,0);
  const msg = today ? `<b>Streak safe for today.</b> Come back tomorrow to make it ${s+1}.`
            : s ? `<b>Your ${s}-day streak ends in <span id="spCountdown">${countdownText()}</span>.</b> One lesson or the daily challenge keeps it alive.`
            : `<b>Start a streak today.</b> One lesson is enough to light the flame.`;
  const cta = !root.track ? `<button class="btn" id="spPick">Pick a path to start</button>`
            : `${dailyDone()?"":`<a class="btn flame-btn" href="#daily">${flame(false)} Today's challenge · 5 min</a>`}<a class="btn ${dailyDone()?"":"sec"}" href="#dashboard">Continue: ${esc(TRACK.to)}</a>`;
  return `<section class="card streak-panel ${today?"safe":s?"risk":""}" aria-label="Your streak and goals">
    <div class="sp-cell sp-streak">
      <div class="sp-flame ${today?"lit":""}">${flame(today).replace('width="14" height="14"','width="56" height="56"')}</div>
      <div class="sp-num"><b class="num">${s}</b><span>day streak</span></div>
      <p class="sp-msg">${msg}</p>
      <div class="sp-mile"><div class="sp-mile-h"><span>Next: <b>${next}-day</b> streak</span><span class="num">${s}/${next}</span></div><div class="bar flame"><i style="width:${pct((s-prevM)/(next-prevM))}"></i></div><small class="muted">Best streak: <b class="num">${best}</b> days</small></div>
    </div>
    <div class="sp-cell sp-goal">
      <div class="label">Today's goal</div>
      <div class="goal-ring">${ring(gp,108,10,"var(--line)",gp>=1?"var(--good)":"var(--xp)")}<div class="gr-in"><b class="num">${xt}</b><span class="num">/ ${goal} XP</span></div></div>
      <div class="seg goal-seg" role="radiogroup" aria-label="Daily XP goal">${GOALS.map(([v,l])=>`<button role="radio" data-goal="${v}" aria-checked="${goal===v}" aria-selected="${goal===v}">${l}<small class="num">${v}</small></button>`).join("")}</div>
      <small class="muted">${gp>=1?"Goal reached. Nice work!":`${goal-xt} XP to go today`}</small>
    </div>
    <div class="sp-cell sp-level">
      ${L?`<div class="label">Level · ${esc(TRACK.to)}</div>
      <div class="sp-lvl-row"><span class="pl-lvl num big">${L.level}</span><div><b>${esc(L.name)}</b><small class="muted num">${L.xp} XP${L.next!=null?` · ${L.toNext} to ${esc(rankName(L.level))}`:""}</small></div></div>
      <div class="bar xp"><i style="width:${pct(L.prog)}"></i></div>`:`<div class="label">Level</div><p class="muted" style="font-size:14px">Pick a path to start earning XP and levelling up.</p>`}
      <div class="sp-totals num"><span><b>${total}</b>total XP</span><span><b>${nBadges}</b>badges</span><span><b>${(root.days||[]).length}</b>study days</span></div>
    </div>
    <div class="sp-cell sp-heat">
      <div class="label">Last 12 weeks</div>
      ${heatmap()}
      <div class="hm-foot"><span id="hmTip" class="muted">Hover a day to see your XP</span><span class="hm-legend">Less <i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i> More</span></div>
    </div>
    <div class="sp-cta">${cta}</div>
  </section>`;
}
let countdownTimer=null;
function bindStreakPanel(){
  document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{ root.goal=+b.dataset.goal; persist(); rerenderStreak(); toast(`Daily goal: ${root.goal} XP`); });
  const tip=$("hmTip");
  document.querySelectorAll(".hm-cell[data-tip]").forEach(c=>{ const show=()=>{ tip.textContent=c.dataset.tip; }; c.onmouseenter=show; c.onfocus=show; c.onclick=show; });
  if($("spPick")) $("spPick").onclick=()=>{ $("pathSearch")?.focus(); $("pathSearch")?.scrollIntoView({behavior:"smooth",block:"center"}); };
  clearInterval(countdownTimer);
  countdownTimer=setInterval(()=>{ const el=$("spCountdown"); if(el) el.textContent=countdownText(); else clearInterval(countdownTimer); }, 30000);
}
function rerenderStreak(){ const el=document.querySelector(".streak-panel"); if(!el) return; el.outerHTML=streakPanel(); bindStreakPanel(); }

/* search: every word must match the role, skills, modules or topics of a path */
const hayCache={};
function haystack(t){
  if(hayCache[t.id]) return hayCache[t.id];
  const ps=trackPhases(t);
  const parts=[[t.from,"role"],[t.to,"role"],[t.short||"","role"],[t.tagline,"about"],[t.tech?"technical coding":"non-technical no coding","type"],
    ...t.stack.map(s=>[s,"skill"]), ...ps.map(p=>[p.title,"module"]), ...ps.flatMap(p=>p.concepts.map(c=>[c[0],"topic: "+p.title]))];
  return hayCache[t.id]=parts.map(([text,kind])=>({text, low:text.toLowerCase(), kind}));
}
function searchMatch(t, q){
  const words=q.toLowerCase().split(/\s+/).filter(Boolean); if(!words.length) return {ok:true};
  const hay=haystack(t); let why=null;
  for(const w of words){
    const hit=hay.find(h=>h.low.includes(w)); if(!hit) return {ok:false};
    if(!why && !["role","about","type"].includes(hit.kind)) why=hit;
  }
  return {ok:true, why};
}
function markText(text, q){
  let out=esc(text);
  q.toLowerCase().split(/\s+/).filter(w=>w.length>1).forEach(w=>{ out=out.replace(new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>"); });
  return out;
}
document.addEventListener("keydown",e=>{
  if(e.key!=="/" || ["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) return;
  const s=$("pathSearch"); if(s){ e.preventDefault(); s.focus(); s.scrollIntoView({behavior:"smooth",block:"center"}); }
});

/* ---------- role showcase: cycles through paths, showing skills kept and skills added ---------- */
const GENERIC = ["aifound","promptpro","aigov","aileader","aiwork"];
const SHOW_MS = 5500;
let showIdx = 0, showPaused = false, showElapsed = 0, showTimer = null, typeTimer = null;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function showcaseHTML(){
  if(root.track && !showTimer) showIdx = Math.max(0, TRACKS.findIndex(t=>t.id===root.track));
  return `<div class="card showcase" id="showcase" aria-roledescription="carousel" aria-label="Career path showcase">
    <div class="sc-top">
      <label class="sc-pick">I'm a<select id="scSel" aria-label="Choose your current role">${TRACKS.map((t,i)=>`<option value="${i}" ${i===showIdx?"selected":""}>${esc(t.from)}</option>`).join("")}</select></label>
      <div class="sc-ctrl">
        <button id="scPrev" aria-label="Previous role">‹</button>
        <button id="scPlay" aria-label="Pause">${reducedMotion()?"▶":"❚❚"}</button>
        <button id="scNext" aria-label="Next role">›</button>
      </div>
    </div>
    <div id="scBody" aria-live="polite">${showcaseInner(TRACKS[showIdx])}</div>
    <div class="sc-prog"><i id="scBar"></i></div>
  </div>`;
}
function showcaseInner(t){
  const ps=trackPhases(t), [g,c]=LOOK[t.id];
  const keep=t.stack.slice(0,4);
  const distinct=ps.filter(p=>!GENERIC.includes(p.id)), add=(distinct.length>=3?distinct:ps).slice(0,4).map(p=>p.title);
  const lessons=ps.reduce((a,p)=>a+p.concepts.length,0);
  return `<div class="sc-body" style="--c:var(${c})">
    <div class="sc-route">
      <div class="sc-from"><span class="pc-glyph num">${esc(g)}</span><div><small>Today</small><b>${esc(t.from)}</b></div></div>
      <div class="sc-arrow" aria-hidden="true"><span class="sc-line"></span><span class="sc-weeks num">~${trackWeeks(t)} weeks</span></div>
      <div class="sc-to"><small>You become</small><h2 class="sc-typed" data-text="${esc(t.to)}">${esc(t.to)}</h2></div>
    </div>
    <div class="sc-skills">
      <div><div class="label">Skills you keep</div><div class="sc-chips">${keep.map((s,i)=>`<span class="sc-chip keep" style="--d:${i}">${esc(s)}</span>`).join("")}</div></div>
      <div><div class="label">Skills you'll add</div><div class="sc-chips">${add.map((s,i)=>`<span class="sc-chip add" style="--d:${i+keep.length}">+ ${esc(s)}</span>`).join("")}</div></div>
    </div>
    <div class="sc-foot"><span class="muted num">${ps.length} phases · ${lessons} lessons · ${t.tech?"Technical":"No coding"}</span><a class="btn" href="#path-${t.id}">See this path →</a></div>
  </div>`;
}
function showcaseTo(id, pause){
  const i=TRACKS.findIndex(t=>t.id===id); if(i<0 || !$("scBody")) return;
  if(pause) setShowPaused(true);
  setShow(i);
}
function setShow(i){
  showIdx=(i+TRACKS.length)%TRACKS.length; showElapsed=0;
  $("scBody").innerHTML=showcaseInner(TRACKS[showIdx]);
  $("scSel").value=String(showIdx);
  typeIn();
}
function typeIn(){
  const h=document.querySelector(".sc-typed"); clearInterval(typeTimer);
  if(!h || reducedMotion()) return;
  const full=h.dataset.text; let n=0; h.textContent=""; h.classList.add("typing");
  typeTimer=setInterval(()=>{ n++; h.textContent=full.slice(0,n); if(n>=full.length){ clearInterval(typeTimer); h.classList.remove("typing"); } }, 45);
}
function setShowPaused(p){
  showPaused=p; const b=$("scPlay"); if(!b) return;
  b.textContent=p?"▶":"❚❚"; b.setAttribute("aria-label", p?"Play":"Pause");
}
function bindShowcase(){
  const box=$("showcase"); if(!box) return;
  $("scPrev").onclick=()=>{ setShowPaused(true); setShow(showIdx-1); };
  $("scNext").onclick=()=>{ setShowPaused(true); setShow(showIdx+1); };
  $("scPlay").onclick=()=>setShowPaused(!showPaused);
  $("scSel").onchange=e=>{ setShowPaused(true); setShow(+e.target.value); };
  let hover=false;
  box.onmouseenter=()=>hover=true; box.onmouseleave=()=>hover=false;
  if(reducedMotion()) setShowPaused(true);
  clearInterval(showTimer);
  showTimer=setInterval(()=>{
    if(!$("showcase")){ clearInterval(showTimer); showTimer=null; return; }
    if(showPaused || hover || document.hidden) return;
    showElapsed+=100; $("scBar").style.width=Math.min(100,showElapsed/SHOW_MS*100)+"%";
    if(showElapsed>=SHOW_MS) setShow(showIdx+1);
  },100);
  typeIn();
}
