
/* ---------- game layer: XP, ranks, streaks, badges, celebrations ---------- */
const RANKS = [
  [0,    "Hello World",        "Just booted up. Every model starts with random weights."],
  [100,  "Tokenizer",          "You're breaking big ideas into pieces."],
  [250,  "Vector Voyager",     "You can find meaning in a list of numbers."],
  [450,  "Gradient Descender", "Always heading downhill, in the good way."],
  [700,  "Backprop Apprentice","You learn from every mistake, layer by layer."],
  [1000, "Attention Seeker",   "You know exactly where to focus."],
  [1350, "Prompt Whisperer",   "Models listen when you talk."],
  [1750, "RAG Wrangler",       "Your answers are grounded in facts."],
  [2200, "Agent Architect",    "You build things that think and act."],
  [2700, "AI Engineer",        "Shipped, evaluated and running in production."]];
const XP_RULES = [["Lesson understood",20],["Quiz best score","up to 50"],["Build task done",100],["Boss battle best","up to 150"],["Daily challenge","15 per correct"]];

const F = () => (state.flags = state.flags || {});
const lessonsDone = () => Object.values(state.concepts).reduce((a,l)=>a+l.length,0);
const buildsDone = () => Object.values(state.build).filter(Boolean).length;
const masteredCount = () => PHASES.filter((_,i)=>mastery(i)>=0.8).length;
function xp(){
  return lessonsDone()*20
    + Math.round(Object.values(state.quiz).reduce((a,v)=>a+v,0)*50)
    + buildsDone()*100
    + Math.round((state.exam||0)*150)
    + (state.bonus||0);
}
const rankName = l => l===RANKS.length-1 ? TRACK.rank : RANKS[l][1];
function levelInfo(x=xp()){
  const th=l=>Math.round(RANKS[l][0]*Math.max(0.5,PHASES.length/10));   // shorter paths need less XP per rank
  let l=0; while(l<RANKS.length-1 && x>=th(l+1)) l++;
  const lo=th(l), hi=l<RANKS.length-1?th(l+1):null;
  return {level:l+1, name:rankName(l), tag:RANKS[l][2], xp:x, next:hi, prog: hi==null?1:(x-lo)/(hi-lo), toNext: hi==null?0:hi-x};
}

/* streaks: one entry per local calendar day with activity */
const dayKey = (d=new Date()) => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function recordDay(){ const t=dayKey(); root.days=root.days||[]; if(!root.days.includes(t)){ root.days.push(t); root.days=root.days.slice(-400); } }
function streak(){
  const set=new Set(root.days||[]); const d=new Date();
  if(!set.has(dayKey(d))) d.setDate(d.getDate()-1);
  let n=0; while(set.has(dayKey(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function bestStreak(){
  const days=[...(root.days||[])].sort(); let best=0, run=0, prev=null;
  for(const k of days){ const t=new Date(k+"T12:00:00"); run = prev && (t-prev)/864e5<1.5 ? run+1 : 1; best=Math.max(best,run); prev=t; }
  return best;
}
const studiedToday = () => (root.days||[]).includes(dayKey());

const BADGES = [
  ["first-lesson","n₁","First neuron","Mark your first lesson as understood",()=>lessonsDone()>=1],
  ["ten-lessons","×10","Ten layers deep","Understand 10 lessons",()=>lessonsDone()>=10],
  ["first-quiz","?","Hello, quiz","Finish your first phase quiz",()=>Object.keys(state.quiz).length>=1],
  ["perfect","0.0","Zero loss","Score 100% on a phase quiz",()=>Object.values(state.quiz).some(v=>v>=1)],
  ["combo","×5","On a roll","Answer 5 questions in a row correctly",()=>!!F().combo5],
  ["speed","<60s","Fast inference","Score 80%+ on a quiz in under 60 seconds",()=>!!F().speed],
  ["streak3","3d","Warm start","Study 3 days in a row",()=>bestStreak()>=3],
  ["streak7","7d","Weekly epoch","Study 7 days in a row",()=>bestStreak()>=7],
  ["build","</>","Shipped it","Finish your first build task",()=>buildsDone()>=1],
  ["build5","v5","Production ready","Finish 5 build tasks",()=>buildsDone()>=5],
  ["phase","∇","Converged","Master your first phase",()=>masteredCount()>=1],
  ["half","½","Halfway there","Master half the phases in your path",()=>masteredCount()>=Math.ceil(PHASES.length/2)],
  ["tutor","λ","Curious mind","Ask the AI tutor a question",()=>!!F().tutor],
  ["daily","24h","Daily driver","Complete a daily challenge",()=>!!F().daily],
  ["boss","♛","Boss slayer","Beat the boss battle with 80% or more",()=>(state.exam||0)>=0.8],
  ["all","AI","Path complete","Master every phase in your path",()=>masteredCount()===PHASES.length]];
function checkBadges(){
  state.badges=state.badges||{}; const fresh=[];
  for(const b of BADGES){ if(!state.badges[b[0]] && b[4]()){ state.badges[b[0]]=Date.now(); fresh.push(b); } }
  return fresh;
}
function badgeHTML(b, earned){
  return `<div class="badge ${earned?"on":""}" title="${esc(b[3])}"><span class="bg-glyph">${esc(b[1])}</span><b>${esc(b[2])}</b><small>${earned?"Earned "+fmtDate(earned):esc(b[3])}</small></div>`;
}

/* save = record activity, award badges, persist, celebrate */
let lastLevel = null;
let lastXp = null;
function save(){
  recordDay();
  const fresh = checkBadges();
  logXp();
  persist();
  const L = levelInfo().level;
  if(lastLevel!=null && L>lastLevel) levelUp(L);
  else if(fresh.length){ confetti(60); }
  if(fresh.length) setTimeout(()=>fresh.forEach((b,i)=>setTimeout(()=>toast(`Badge unlocked: ${b[2]}`),i*2400)), lastLevel!=null&&L>lastLevel?2600:0);
  lastLevel = L;
  renderPlayer();
}
function quietSync(){ checkBadges(); lastLevel = levelInfo().level; lastXp = xp(); renderPlayer(); }
/* XP earned per calendar day (all paths), used for the daily goal and the activity heatmap */
function logXp(){
  const now = xp();
  if(lastXp!=null && now>lastXp){
    const k=dayKey(), goal=root.goal||50;
    root.xpLog=root.xpLog||{};
    const before=root.xpLog[k]||0; root.xpLog[k]=before+(now-lastXp);
    const keys=Object.keys(root.xpLog).sort(); if(keys.length>400) delete root.xpLog[keys[0]];
    if(before<goal && root.xpLog[k]>=goal) setTimeout(()=>{ toast(`Daily goal reached: ${root.xpLog[k]} XP today`); confetti(90); }, 400);
  }
  lastXp = now;
}
const xpToday = () => (root.xpLog||{})[dayKey()]||0;

function levelUp(L){
  const r=[0,rankName(L-1),RANKS[L-1][2]];
  const el=$("levelup");
  el.innerHTML=`<div class="lu-card" role="dialog" aria-modal="true" aria-labelledby="luTitle">
    <div class="label" style="color:var(--xp)">Level up</div>
    <div class="lu-num num">${L}</div>
    <h2 id="luTitle">${esc(r[1])}</h2>
    <p class="muted">${esc(r[2])}</p>
    <button class="btn" id="luClose">Keep going</button></div>`;
  el.hidden=false; $("luClose").focus();
  const close=()=>{ el.hidden=true; };
  $("luClose").onclick=close; el.onclick=e=>{ if(e.target===el) close(); };
  confetti(180);
}

/* sidebar player card + topbar chips */
function renderPlayer(){
  const L=levelInfo(), s=streak(), today=studiedToday();
  const card=$("player"); if(!card) return;
  card.innerHTML=`<div class="pl-top"><div class="pl-lvl num" aria-label="Level ${L.level}">${L.level}</div><div style="min-width:0"><b>${esc(L.name)}</b><span>${L.next==null?"Max rank reached":L.toNext+" XP to "+esc(rankName(L.level))}</span></div></div>
    <div class="pl-bar"><i style="width:${pct(L.prog)}"></i></div>
    <div class="pl-stats"><span class="${today?"lit":""}" title="${today?"You studied today":"Study today to keep your streak"}">${flame(today)} <b class="num">${s}</b> day streak</span><span><b class="num">${L.xp}</b> XP</span></div>`;
  $("chips").innerHTML=`<span class="tchip ${today?"lit":""}" title="Day streak">${flame(today)}<b class="num">${s}</b></span><span class="tchip xpchip" title="Total XP"><b class="num">${L.xp}</b> XP</span>`;
}
const flame = lit => `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="${lit?"var(--flame)":"none"}" stroke="${lit?"var(--flame)":"currentColor"}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

/* confetti on a throwaway canvas */
function confetti(count=120){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=document.createElement("canvas"); cv.className="confetti"; document.body.appendChild(cv);
  const ctx=cv.getContext("2d"), dpr=devicePixelRatio||1, W=innerWidth, H=innerHeight;
  cv.width=W*dpr; cv.height=H*dpr; ctx.scale(dpr,dpr);
  const cs=getComputedStyle(document.documentElement);
  const cols=["--accent","--xp","--flame","--good","--amber"].map(v=>cs.getPropertyValue(v).trim()||"#888");
  const ps=Array.from({length:count},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,w:6+Math.random()*6,h:8+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[Math.floor(Math.random()*cols.length)]}));
  const t0=performance.now();
  (function frame(t){
    ctx.clearRect(0,0,W,H);
    for(const p of ps){ p.vy+=.35; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore(); }
    if(t-t0<2600) requestAnimationFrame(frame); else cv.remove();
  })(t0);
}

/* daily challenge: same 5 questions for everyone on a given day */
function seeded(seedStr){ let h=1779033703^seedStr.length; for(let i=0;i<seedStr.length;i++){ h=Math.imul(h^seedStr.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; }
function dailyItems(){
  const rnd=seeded("daily-"+dayKey()), pool=PHASES.flatMap((p,i)=>p.quiz.map(q=>({...q,from:i})));
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,5);
}
const dailyDone = () => state.daily && state.daily.date===dayKey();
function hoursToMidnight(){ const n=new Date(), m=new Date(n); m.setHours(24,0,0,0); return Math.max(1,Math.ceil((m-n)/36e5)); }

const CHEERS = ["Loss ↓","Gradient approved","Converged!","Nailed it","Low perplexity","Ground truth","Signal, not noise","Clean inference"];
const OOPS = ["Hallucination detected","Overfit!","Loss ↑","Retrieval miss","Wrong token","Needs more epochs"];
const pick = a => a[Math.floor(Math.random()*a.length)];
