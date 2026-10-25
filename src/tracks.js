
/* ---------- career paths: each path is an ordered list of modules, with role-specific bridges and builds ---------- */
MODULES.push(...MODULES_EXTRA);
const TRACKS = [
{ id:"backend", short:"Backend", from:"Backend engineer", to:"AI engineer", rank:"AI Engineer", tech:true,
  tagline:"Build LLM apps, RAG, agents and production AI systems on top of your Java and Spring skills.",
  stack:["Java","Spring Boot","Microservices","Python (basic)","Angular"],
  learner:"a backend engineer who knows Java, Spring Boot, microservices, basic Python and Angular",
  analogy:"Java, Spring Boot or microservices",
  overlap:"High", modules:["py","math","ml","dl","llm","api","rag","agents","evals","ops"], bridges:{}, builds:{} },

{ id:"frontend", short:"Frontend", from:"Frontend engineer", to:"AI product engineer", rank:"AI Product Engineer", tech:true,
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

{ id:"devops", short:"DevOps / SRE", from:"DevOps / SRE engineer", to:"LLMOps engineer", rank:"LLMOps Engineer", tech:true,
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

{ id:"qa", short:"QA / test", from:"QA / test engineer", to:"AI evals engineer", rank:"AI Evals Engineer", tech:true,
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

{ id:"analyst", from:"Data analyst", to:"Data scientist", rank:"Data Scientist", tech:true, short:"Data analyst",
  tagline:"Go from reporting what happened to predicting what will happen: statistics, experiments, machine learning and LLMs for data.",
  stack:["SQL","Excel","BI dashboards","Basic Python","Business metrics"],
  learner:"a data analyst who knows SQL, Excel, BI tools like Power BI or Tableau, business metrics and some Python",
  analogy:"SQL queries, spreadsheets or dashboards",
  overlap:"Medium–high", modules:["py","math","stats","ml","dsflow","llm","llmdata"],
  bridges:{
    py:"pandas is SQL and Excel in code: filters are WHERE clauses, groupby is GROUP BY, and merge is a JOIN. Most of your analysis instincts carry straight over.",
    math:"You don't need proofs. Focus on intuition: vectors for embeddings, gradients for how models learn, and probabilities for what model outputs mean.",
    ml:"A model is a formula learned from historical data, like a forecast in Excel that fits itself. Your feel for business metrics helps you pick the right evaluation metric.",
    llm:"LLMs read and write text the way your SQL reads tables. Knowing their limits, like hallucination and token costs, matters before you trust them with data."},
  builds:{
    py:{title:"Rebuild a dashboard in pandas",steps:["Pick a report you build in SQL or Excel today.","Rebuild it in a Jupyter notebook with pandas: load, clean, group and pivot.","Add two charts with matplotlib or seaborn.","Turn the notebook into a script that runs end to end and saves the charts."]},
    math:{title:"Gradient descent by hand",steps:["In a notebook, fit a straight line to sales vs ad spend with your own gradient descent loop.","Plot the loss as it trains.","Compare your result with numpy.polyfit.","Write three sentences explaining what the slope means to a stakeholder."]},
    ml:{title:"Your first predictive model",steps:["Pick a business question with a yes/no outcome, such as 'will this customer churn?'.","Train logistic regression and a random forest with scikit-learn.","Compare them with precision and recall and explain which matters for the business.","Present the top 3 drivers to a non-technical colleague."]},
    llm:{title:"Explore what LLMs can do with your data",steps:["Ask an LLM to summarise 20 customer comments and check its accuracy.","Count tokens for a typical comment and estimate the cost of 100,000.","Try the same prompt at temperature 0 and 1 and compare consistency.","List 3 analysis tasks where you'd trust it and 3 where you wouldn't."]}} },

{ id:"dataeng", from:"Data engineer", to:"ML engineer", rank:"ML Engineer", tech:true, short:"Data engineer",
  tagline:"Use your pipeline skills to build, ship and run machine learning: features, training, RAG data and model serving.",
  stack:["SQL","Python","Spark / dbt","Airflow","Data warehouses","Cloud"],
  learner:"a data engineer who knows SQL, Python, Spark or dbt, Airflow, data warehouses and cloud data platforms",
  analogy:"data pipelines, warehouses, orchestration or data quality",
  overlap:"High", modules:["math","ml","dl","llm","features","rag","mlops","serving"],
  bridges:{
    math:"Just enough math to read model code: vectors and matrices are arrays with shapes, and gradients are how training updates weights. Think of shapes like schemas.",
    ml:"Training is a batch job that turns a table into a model. Your strengths in joins, time windows and data quality decide whether models work in production.",
    dl:"Deep learning training is a long-running, GPU-heavy pipeline. Data loaders are your ingestion layer, and checkpoints are your restartable state.",
    llm:"Tokens are the unit of cost and capacity, and embeddings are a new column type you'll compute and store at scale.",
    rag:"RAG is a search index fed by a pipeline. Ingestion, chunking, embedding and incremental updates are data engineering problems with a model at the end.",
    mlops:"Experiment tracking, model registries and pipeline orchestration will feel familiar: it's DataOps with models as the artifacts.",
    serving:"Serving models is running a stateful, latency-sensitive service. Batch inference fits your existing pipelines; online inference adds GPUs and autoscaling."},
  builds:{
    ml:{title:"Training pipeline in your orchestrator",steps:["Build an Airflow (or Dagster) DAG that extracts training data and trains a scikit-learn model.","Add a data validation task before training.","Store the model and metrics as versioned artifacts.","Add a batch inference task that writes predictions back to the warehouse."]},
    dl:{title:"GPU training job with checkpoints",steps:["Train a small PyTorch model on a public dataset with a custom Dataset and DataLoader.","Save checkpoints every epoch and resume from one after a restart.","Run it on a cloud GPU and record time and cost.","Write a short runbook for the job."]},
    llm:{title:"Embeddings at scale",steps:["Embed 100,000 short texts with a sentence-transformers model in batches.","Measure throughput on CPU vs GPU.","Store vectors in Postgres with pgvector or Parquet files.","Estimate the cost to re-embed everything with a hosted API instead."]},
    rag:{title:"Production RAG ingestion pipeline",steps:["Build a pipeline that pulls documents from a source (wiki, S3 or a database) on a schedule.","Chunk and embed only new or changed documents.","Upsert into a vector store with metadata and access tags.","Add monitoring for pipeline lag and failed documents."]}} },

{ id:"ux", from:"UX / UI designer", to:"AI UX designer", rank:"AI UX Designer", tech:false, short:"UX designer",
  tagline:"Design how people work with AI: conversations, trust, prototypes with real models and responsible experiences.",
  stack:["User research","Interaction design","Prototyping","Figma","Content design"],
  learner:"a UX/UI designer who knows user research, interaction design, prototyping in Figma and content design, but doesn't code",
  analogy:"UX design, research and prototyping",
  overlap:"Medium", modules:["aifound","promptpro","aiux","convdesign","protoai","aigov"],
  bridges:{
    aifound:"You don't need to build models, but you need to know their materials and limits, the way you understand what a browser or a screen size allows.",
    promptpro:"Prompts are content design for machines. The skills you use to write clear microcopy and briefs make you good at writing prompts.",
    aiux:"This is your core craft applied to AI: expectations, states, trust and feedback. Your research instincts help you find where AI helps and where it gets in the way.",
    aigov:"Responsible AI is a design responsibility too: disclosure, consent, fairness and keeping users in control are decisions you make in the interface."},
  builds:{
    aiux:{title:"Redesign an AI feature end to end",steps:["Audit an AI feature in a product you use: list confusing moments and trust problems.","Design improved onboarding, loading, error and refusal states.","Add citations and a feedback control and explain what each logs.","Present the redesign as a short case study with before and after."]},
    aigov:{title:"Design for trust and consent",steps:["Pick an AI feature that uses personal data.","Design the disclosure, consent and opt-out moments.","Design how a user challenges or corrects an AI decision.","Review your designs against the EU AI Act transparency rules."]}} },

{ id:"pm", short:"Product manager", from:"Product manager", to:"AI product manager", rank:"AI Product Manager", tech:false,
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

{ id:"nontech", short:"Non-technical", from:"Any non-technical role", to:"AI-powered professional", rank:"AI-Powered Pro", tech:false,
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
