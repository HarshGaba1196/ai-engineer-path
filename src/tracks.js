
/* ---------- career paths: each path is an ordered list of modules, with role-specific bridges and builds ---------- */
MODULES.push(...MODULES_EXTRA);
const TRACKS = [
{ id:"backend", from:"Backend engineer", to:"AI engineer", rank:"AI Engineer", tech:true,
  tagline:"Build LLM apps, RAG, agents and production AI systems on top of your Java and Spring skills.",
  stack:["Java","Spring Boot","Microservices","Python (basic)","Angular"],
  learner:"a backend engineer who knows Java, Spring Boot, microservices, basic Python and Angular",
  analogy:"Java, Spring Boot or microservices",
  overlap:"High", modules:["py","math","ml","dl","llm","api","rag","agents","evals","ops"], bridges:{}, builds:{} },

{ id:"frontend", from:"Frontend engineer", to:"AI product engineer", rank:"AI Product Engineer", tech:true,
  tagline:"Build the interfaces people actually use AI through: streaming chat, copilots, generative UI and on-device models.",
  stack:["TypeScript","Angular / React","CSS","Browser APIs","REST"],
  learner:"a frontend engineer who knows TypeScript, Angular or React, CSS, browser APIs and REST",
  analogy:"TypeScript, Angular/React, RxJS or browser APIs",
  overlap:"Medium–high", modules:["llm","tsai","aiux","rag","agents","browserai","evals","ops"],
  bridges:{
    llm:"Tokens are the payload size of every AI request, and the context window is like a hard limit on request body size. Knowing them explains why chat UIs slow down and why long pastes fail.",
    rag:"RAG is search plus a template. You already build search UIs; now the results go to the model instead of the user, and you show them back as citations.",
    agents:"An agent loop is like a state machine driven by the model's next action. In the UI, each tool call is a step you can show, approve or cancel.",
    evals:"Evals are your Jest/Playwright suites for prompts. A golden dataset is your fixture set; run it in CI on every prompt change.",
    ops:"Your production habits still apply: error boundaries, retries, rate limiting, analytics. AI adds prompt injection through user content and token cost per interaction."},
  builds:{
    llm:{title:"Look inside a model from JavaScript",steps:["Use a tokenizer library (for example gpt-tokenizer) to count tokens for English, code and another language.","Build a small page that shows the token count live as the user types.","Call a model at temperature 0 and 1 five times each and display the differences side by side.","Embed 20 sentences with Transformers.js and show each one's nearest neighbour."]},
    rag:{title:"Docs Q&A with citations in TypeScript",steps:["Collect 50 docs pages, chunk them in Node and embed them.","Store vectors in Postgres with pgvector (or a hosted vector DB).","Build an /ask route that retrieves the top chunks and streams an answer with numbered citations.","In the UI, make each citation open the source passage in a side panel."]},
    agents:{title:"A shopping assistant agent with visible steps",steps:["Give an agent three tools: searchProducts, getProductDetails and addToCart.","Show each tool call in the UI as a step card while the agent works.","Require a confirmation click before addToCart runs.","Cap the agent at 6 steps and show a clear message if it stops early."]},
    evals:{title:"Evals for your assistant in CI",steps:["Write 30 test conversations for your assistant, including 5 it should refuse.","Write code checks: valid JSON, citations present, under a word limit.","Add an LLM-as-judge rubric for helpfulness and hand-check 10 grades.","Run the suite with promptfoo in GitHub Actions on every pull request."]},
    ops:{title:"Capstone: ship an AI feature to production",steps:["Combine your streaming chat, RAG and agent into one app with authentication.","Add rate limits per user, cost logging per request and error tracking.","Test 10 prompt injections through user input and uploaded files, and fix what gets through.","Deploy it (Vercel, Netlify or your cloud), write a README with a demo GIF and share it."]}} },

{ id:"devops", from:"DevOps / SRE engineer", to:"LLMOps engineer", rank:"LLMOps Engineer", tech:true,
  tagline:"Run AI in production: model serving on GPUs, LLM gateways, pipelines, observability and cost control.",
  stack:["Linux","Docker","Kubernetes","CI/CD","Terraform","Monitoring"],
  learner:"a DevOps/SRE engineer who knows Linux, Docker, Kubernetes, CI/CD, Terraform, monitoring and scripting",
  analogy:"Kubernetes, CI/CD, observability or infrastructure",
  overlap:"High", modules:["py","llm","api","mlops","serving","gateway","evals","ops"],
  bridges:{
    py:"Python is the language of ML tooling, much like Bash and Go are for infrastructure. You'll read and write training scripts, small FastAPI services and automation around models.",
    llm:"Treat a model like a service with unusual resource needs: memory scales with context length and concurrency, and latency scales with output length. Tokens are your new unit of capacity planning.",
    api:"Calling LLM APIs is calling a rate-limited, metered external dependency. Timeouts, retries, circuit breakers and quotas matter from day one.",
    evals:"Evals are the health checks and release gates of AI systems. Wire them into pipelines the same way you gate deployments on integration tests.",
    ops:"This is your home ground: SLOs, tracing, incident response and cost. AI adds new signals (tokens, quality scores) and new incidents (bad answers, injection, runaway agents)."},
  builds:{
    py:{title:"Automation scripts for an ML platform",steps:["Write a Python CLI (with typer or argparse) that lists models in a registry or files in a bucket.","Add a FastAPI health endpoint that reports model version and GPU availability.","Use asyncio to check 20 endpoints concurrently and print latency.","Package it with uv and run it in a container."]},
    llm:{title:"Capacity-plan a model",steps:["Tokenize sample traffic and compute average input and output tokens per request.","Run a small model locally with Ollama and measure tokens per second.","Estimate how many requests per second one GPU can serve at your traffic shape.","Write a one-page capacity plan with the numbers."]},
    api:{title:"A resilient LLM client service",steps:["Build a small service (FastAPI or Spring Boot) that calls a model API.","Add timeouts, retries with backoff and jitter, and a circuit breaker.","Log tokens, latency and cost per request as structured logs.","Load-test it and watch how it behaves when you inject 429 errors."]},
    evals:{title:"Eval gates in a deployment pipeline",steps:["Write 30 golden test cases for an LLM endpoint.","Add a pipeline stage that runs them and computes a pass rate.","Block deployment if the pass rate drops more than 5 points from the last release.","Store results per run and graph them over time."]},
    ops:{title:"Capstone: production LLM platform",steps:["Combine your gateway, a self-hosted model and a hosted model behind one endpoint.","Add OpenTelemetry tracing, dashboards for latency, tokens and cost, and SLO alerts.","Write runbooks for provider outage, cost spike and prompt-injection incident.","Run a game day: break something on purpose and practise the response."]}} },

{ id:"qa", from:"QA / test engineer", to:"AI evals engineer", rank:"AI Evals Engineer", tech:true,
  tagline:"Become the person who decides whether AI is good enough to ship: evals, graders, red-teaming and quality platforms.",
  stack:["Test design","Selenium / Playwright","JUnit / pytest","CI","Bug triage"],
  learner:"a QA/test engineer who knows test design, automation frameworks (Selenium, Playwright, JUnit or pytest), CI pipelines and bug triage",
  analogy:"test design, test automation or bug triage",
  overlap:"High", modules:["py","llm","api","rag","evals","evalsys","redteam","ops"],
  bridges:{
    py:"pytest is the centre of most Python eval tooling. Fixtures, parametrized tests and plugins work the same way you know from other frameworks.",
    llm:"LLMs are non-deterministic systems under test. Sampling settings, context limits and hallucinations explain most of the 'flaky' behaviour you'll see.",
    api:"To test AI features well, you need to know how they're built: prompts, structured output and tool calls are the components you'll write tests against.",
    rag:"RAG has two parts you can test separately, like a search service and a renderer. Retrieval tests check the right documents come back; generation tests check the answer uses them faithfully.",
    evals:"This is your core skill set applied to AI. Golden datasets are test suites, graders are assertions, and error analysis is bug triage at scale.",
    ops:"Production quality is monitoring plus testing: you'll sample real traffic, track quality scores, and turn incidents into new regression cases."},
  builds:{
    py:{title:"pytest toolkit for LLM tests",steps:["Write a pytest suite that calls a function returning text and checks length, keywords and JSON validity.","Use @pytest.mark.parametrize to load cases from a CSV.","Add a fixture that caches model responses to make reruns fast and cheap.","Run it in GitHub Actions and publish an HTML report."]},
    llm:{title:"Characterise model behaviour",steps:["Pick 10 prompts and run each 5 times at temperature 0 and 5 times at 1.","Measure how often answers differ and in what ways.","Find 3 prompts that cause hallucinations and document them as bug reports.","Write a short test strategy for non-deterministic output."]},
    api:{title:"A testable LLM feature",steps:["Build a small function that turns a support ticket into JSON: category, priority, summary.","Write unit tests for the parsing and validation code with mocked model responses.","Write integration tests that call the real model on 20 cases.","Report pass rates for each field separately."]},
    rag:{title:"Build and test a small RAG system",steps:["Build a minimal RAG over 30 documents (any framework).","Write 20 questions with the document id that answers each, and test retrieval hit rate.","Write faithfulness tests: does the answer contain claims not in the retrieved text?","Change chunk size and show how both metrics move."]},
    ops:{title:"Capstone: quality plan for an AI product",steps:["Write a full test strategy for an AI feature: offline evals, red-teaming, online monitoring.","Set up production sampling with automated grading on a schedule.","Create a dashboard with quality, safety and cost trends.","Run a release review: decide go or no-go with evidence, as you would sign off a release."]}} },

{ id:"pm", from:"Product manager", to:"AI product manager", rank:"AI Product Manager", tech:false,
  tagline:"Decide what AI to build, define what good looks like, and ship AI features users trust. No coding required.",
  stack:["Discovery","Roadmaps","Metrics","Stakeholders","User research"],
  learner:"a product manager who knows discovery, roadmaps, metrics and working with engineering teams, but doesn't code",
  analogy:"product management: discovery, roadmaps, metrics or stakeholder work",
  overlap:"High", modules:["aifound","promptpro","aipm","aiux","aiship","aigov"],
  bridges:{
    aifound:"You don't need to build models, but you need an accurate mental model of them, like knowing how your payment provider works without writing its code.",
    promptpro:"Prompting is the fastest way for a PM to prototype. A good prompt is a mini spec: context, goal, constraints and examples.",
    aiux:"You'll make the calls on these trade-offs with design: how much to automate, how to show uncertainty, and what users can do when the AI is wrong.",
    aigov:"Responsible AI is part of the product: it affects risk reviews, launch approvals and user trust. Bring legal and security in early, as you would for payments or privacy."},
  builds:{
    aiux:{title:"Spec the AI experience",steps:["For your opportunity from AI product discovery, map the user journey including AI states: thinking, unsure, wrong, refused.","Decide where AI acts automatically and where users approve.","Specify citations, feedback controls and fallbacks.","Review the spec with a designer and an engineer, and capture their concerns."]}} },

{ id:"nontech", from:"Any non-technical role", to:"AI-powered professional", rank:"AI-Powered Pro", tech:false,
  tagline:"Use AI to do your current job far better: prompting, daily workflows, no-code automation, and leading AI in your team.",
  stack:["Operations","Marketing","HR","Sales","Support","Finance"],
  learner:"a non-technical professional (for example in operations, marketing, HR, sales, finance or support) who wants to use AI to do their job better, without coding",
  analogy:"everyday office work",
  overlap:"Any role", modules:["aifound","promptpro","aiwork","nocode","aigov","aileader"], bridges:{}, builds:{} }
];

let PHASES = [], TRACK = TRACKS[0];
const trackById = id => TRACKS.find(t=>t.id===id);
function trackPhases(t){ return t.modules.map(id=>{ const m=MODULES.find(x=>x.id===id); return {...m, bridge:t.bridges[id]||m.bridge, build:t.builds[id]||m.build}; }); }
function trackWeeks(t){ return trackPhases(t).reduce((a,p)=>a+parseInt(p.weeks),0); }
function setTrack(id){ TRACK = trackById(id) || TRACKS[0]; PHASES = trackPhases(TRACK); }
