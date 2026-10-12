const pptxgen = require("pptxgenjs");
const { make } = require("../../../brand/theme");
const pres = new pptxgen();
const T = make(pres);
const { ORANGE, INK, GREY, GREY2, LINE, WHITE, TINT, SANS, MONO, RED, TEAL } = T.C;
pres.title = "Ep 1 — What an AI agent actually is — and isn't — in enterprise software";

// 1 cover
T.cover("01", "What an AI agent actually is —\nand isn't — in enterprise software", null,
  "Hook in 20 seconds: 'Every vendor now sells agents. Most of them are a chatbot with a new logo. In ten minutes you'll know the difference — and the three things that break the moment you put one inside enterprise software. And over this series we're going to build an open-source ERP where every module has its agents.'");

// 2 hook
{
  const s = T.light("Set the contract: three outcomes. Then the series promise — an open-source agentic ERP, built in public, one module per few episodes.",
    "Episode 1 · What you'll get", "Most “agents” are a chatbot with a new logo.");
  [["Tell an agent from a workflow", "in 10 seconds, in any vendor demo"],
   ["Name the 5 parts", "every real agent is built from"],
   ["Spot the 3 breakpoints", "when an agent goes inside enterprise software"]].forEach(([h, d], i) => {
    const x = 0.5 + i * 3.05;
    T.card(s, x, 2.0, 2.85, 1.9);
    T.num(s, i + 1, x + 0.25, 2.25);
    T.h(s, h, x + 0.25, 2.75, 2.4, 0.6, 15);
    T.p(s, d, x + 0.25, 3.3, 2.4, 0.5);
  });
  T.callout(s, "THE SERIES", "We build an open-source agentic ERP in public — inventory, sales, finance, procurement, HR — one module at a time. Today is the vocabulary.", 0.5, 4.15, 9, 0.75);
}

// 3 definition
{
  const s = T.light("Say it slowly, twice. Point at the three words. Remove any one and you have something useful — but not an agent.", "The one-line definition", null);
  s.addText([{ text: "An agent is an LLM that ", options: { color: INK } }, { text: "decides", options: { color: ORANGE } }, { text: " what to do next — in a ", options: { color: INK } },
             { text: "loop", options: { color: ORANGE } }, { text: " — using ", options: { color: INK } }, { text: "tools", options: { color: ORANGE } }, { text: ", until a goal is met.", options: { color: INK } }],
    { x: 0.5, y: 1.1, w: 9, h: 1.9, fontFace: SANS, fontSize: 30, bold: true, charSpacing: -1, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  [["decides", "the model picks the next action — not the developer"], ["loop", "plan → act → observe → repeat"], ["tools", "it can touch systems: APIs, databases, other agents"]].forEach(([w, d], i) => {
    const x = 0.5 + i * 3.05;
    T.card(s, x, 3.2, 2.85, 1.3, true);
    T.mono(s, w.toUpperCase(), x + 0.25, 3.35, 2.4, 0.3, 10, ORANGE);
    T.p(s, d, x + 0.25, 3.7, 2.4, 0.7, 11.5, INK);
  });
  T.p(s, "Remove any one of the three and it isn't an agent.", 0.5, 4.65, 9, 0.3, 10, GREY2);
}

// 4 spectrum
{
  const s = T.light("The slide people screenshot. The question that places any system on this line: who decides the control flow? Left: the developer wrote it. Right: the model chooses at runtime. Further right = more autonomy = more governance you owe.", "Autonomy", "It's a spectrum, not a switch");
  const st = ["Chatbot", "Prompt chain", "Workflow with LLM steps", "Agent", "Multi-agent system"];
  st.forEach((t, i) => { const x = 0.5 + i * 1.85; T.box(s, t, x, 2.05, 1.6, 0.95, i >= 3 ? ORANGE : INK, i >= 3 ? WHITE : TINT, 11); if (i < 4) T.arrow(s, x + 1.63, 2.52, 0.2); });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 3.35, w: 9, h: 0, line: { color: LINE, width: 1 } });
  T.mono(s, "DEVELOPER DECIDES THE FLOW", 0.5, 3.45, 4, 0.3, 9, GREY2);
  s.addText("MODEL DECIDES THE FLOW", { x: 5.5, y: 3.45, w: 4, h: 0.3, fontFace: MONO, fontSize: 9, color: GREY2, align: "right", isTextBox: true, margin: 0 });
  T.callout(s, "RULE", "the further right you go, the more autonomy you get — and the more governance you owe. Most enterprise problems are solved well in the middle.", 0.5, 4.0, 9, 0.85);
}

// 5 loop
{
  const s = T.light("Draw it live if you can. Goal in; plan; act by calling a tool; observe the result; back to plan. It stops when the model decides the goal is met — or when YOU stop it with a cap on steps, cost or time. The cap is the part demos leave out.", "Mechanics", "The agent loop");
  const b = [["Goal", TEAL], ["Plan", ORANGE], ["Act", ORANGE], ["Observe", ORANGE], ["Done", TEAL]];
  const sub = ["what the user wants", "model picks next step", "call a tool", "read the result", "or a limit is hit"];
  b.forEach(([t, c], i) => { const x = 0.5 + i * 1.85; s.addText(sub[i], { x, y: 1.85, w: 1.6, h: 0.3, fontFace: SANS, fontSize: 9, color: GREY2, align: "center", isTextBox: true, margin: 0 });
    T.box(s, t, x, 2.2, 1.6, 0.8, c, WHITE, 14); if (i < 4) T.arrow(s, x + 1.63, 2.6, 0.2); });
  s.addShape(pres.shapes.LINE, { x: 5.0, y: 3.0, w: 0, h: 0.4, line: { color: ORANGE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: 3.15, y: 3.4, w: 1.85, h: 0, line: { color: ORANGE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: 3.15, y: 3.0, w: 0, h: 0.4, flipV: true, line: { color: ORANGE, width: 1.25, endArrowType: "triangle" } });
  s.addText("repeat until the goal is met", { x: 3.0, y: 3.45, w: 2.2, h: 0.3, fontFace: MONO, fontSize: 9, color: ORANGE, align: "center", isTextBox: true, margin: 0 });
  T.callout(s, "STOP CONDITIONS", "are not optional. An agent without a cap on steps, cost and time isn't a product — it's a bill. Set all three before the first demo.", 0.5, 4.0, 9, 0.85);
}

// 6 five parts
{
  const s = T.light("Parts 1–3 get you a demo. 4–5 get you something that survives production. Every architecture review of an 'agent' should ask for all five.", "Anatomy", "The 5 parts of every agent");
  [["Model", "the reasoning engine — picks actions, reads results"], ["Instructions", "system prompt, policies, what it may and may not do"],
   ["Tools", "APIs, databases, MCP servers, other agents"], ["Memory", "short-term context + long-term store, per user and per company"],
   ["Loop + limits", "orchestration, stop conditions, step / cost / time caps"]].forEach(([h, d], i) => {
    const y = 1.95 + i * 0.58;
    T.num(s, i + 1, 0.5, y + 0.08, 0.34);
    T.h(s, h, 1.05, y, 2.1, 0.5, 14);
    T.p(s, d, 3.1, y + 0.03, 3.9, 0.5, 11);
  });
  T.card(s, 7.3, 1.95, 2.2, 2.85, true);
  s.addText([{ text: "1–3\n", options: { fontSize: 26, bold: true, color: INK } }, { text: "get you a demo\n\n", options: { fontSize: 11, color: GREY } },
             { text: "4–5\n", options: { fontSize: 26, bold: true, color: ORANGE } }, { text: "get you something that survives production", options: { fontSize: 11, color: GREY } }],
    { x: 7.5, y: 2.1, w: 1.8, h: 2.6, fontFace: SANS, isTextBox: true, margin: 0, valign: "top" });
}

// 7 not an agent
{
  const s = T.light("Be fair: these are often the RIGHT answer — cheaper, predictable, testable. The point is naming. Don't let 'agent' into the architecture review when the model never chooses anything.", "Vocabulary", "What is NOT an agent");
  [["Chatbot with retrieval (RAG)", "Answers questions. Never acts. No tools beyond search."],
   ["Pipeline with one LLM step", "The developer decided the flow. The model fills in a blank."],
   ["Rules engine + LLM classifier", "No loop. No tool choice. One call, one label."]].forEach(([h, d], i) => {
    const x = 0.5 + i * 3.05;
    T.card(s, x, 2.0, 2.85, 1.95);
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fill: { color: RED } });
    s.addText("✕", { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fontFace: SANS, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    T.h(s, h, x + 0.25, 2.75, 2.4, 0.55, 14);
    T.p(s, d, x + 0.25, 3.3, 2.4, 0.6);
  });
  T.callout(s, "SAY IT", "These are often the right answer. Just don't call them agents in the architecture review.", 0.5, 4.15, 9, 0.75);
}

// 8 agent vs code
{
  const s = T.light("The question the sceptical architect is already asking: how is this different from code, a scheduler, a rules engine? Structurally an agent IS code — a for loop calling a function. The difference is who writes the branch conditions. In code they were written before the program ran. In an agent, each branch is computed at runtime by the model from the goal and whatever the last tool returned. That buys coverage of the long tail and costs predictability — which is why limits, approvals and evals are not optional.", "The real difference", "Who writes the branch?");
  const cols = [["", 0.5, 2.0], ["WHAT IT DECIDES", 2.5, 2.4], ["WHO WROTE THE DECISION", 4.95, 2.2], ["HANDLES THE UNEXPECTED?", 7.2, 2.3]];
  cols.forEach(([h, x, w]) => T.mono(s, h, x, 2.05, w, 0.25, 8, ORANGE));
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 2.33, w: 9, h: 0, line: { color: LINE, width: 0.75 } });
  [["Scheduler", "cron, Airflow", "when to run a fixed thing", "the developer", "No", GREY],
   ["Workflow / state machine", "", "which fixed step comes next", "the developer", "No — it takes the else branch", GREY],
   ["Rules engine", "", "from explicit rules", "the rule author", "Only cases the rules cover", GREY],
   ["Agent", "", "from the goal + what the last tool returned", "the model, at runtime", "Yes — including cases nobody wanted", ORANGE]].forEach(([h, sub, a, b, c, col], i) => {
    const y = 2.42 + i * 0.54;
    if (i === 3) s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: y - 0.05, w: 9, h: 0.5, fill: { color: TINT }, line: { color: LINE, width: 0.5 } });
    T.h(s, h, 0.6, y + 0.03, 1.9, 0.4, 12); if (sub) T.p(s, sub, 0.6, y + 0.24, 1.9, 0.25, 8, GREY2);
    T.p(s, a, 2.5, y + 0.05, 2.4, 0.45, 10.5, INK); T.p(s, b, 4.95, y + 0.05, 2.2, 0.45, 10.5, i === 3 ? ORANGE : INK); T.p(s, c, 7.2, y + 0.05, 2.3, 0.45, 10.5, col === ORANGE ? ORANGE : GREY);
  });
  T.callout(s, "RULE", "code decides before it runs; an agent decides as it runs. Use a workflow whenever the rules are known, an agent only when they aren't — and pay for it with limits, approvals and evals.", 0.5, 4.55, 9, 0.6);
}

// 9 example: same problem four ways
{
  const s = T.light("One ERP problem, four ways. SCHEDULER: every night at 02:00 run reorder_check.py — for every item below reorder level, create a PO for the default qty at the default supplier. The scheduler decided WHEN; the script author decided WHAT, once, for all items forever. If the default supplier is on holiday, the PO goes out anyway. WORKFLOW: fixed steps — below level, check open POs, draft PO, approval if over 50k, wait for GRN, close. Every transition drawn on a whiteboard before go-live. A supplier saying 'we can ship half, rest in 3 weeks' matches no transition, so it lands in an exception queue. RULES ENGINE: a table procurement maintains — Audio and stock under 20, order 100 from S-500; lead_days over 7, order 1.5x; March, hold non-essentials. Business users can edit it, but a new SKU category with no rule means nothing happens, silently. AGENT: goal 'keep WH-204 in stock without over-ordering', tools for stock, open POs, quotes, forecast, approval, create_po. It sees 12 left, notices an open PO covers 50, finds the forecast needs 80 next week, gets two quotes, sees the usual supplier's lead time jumped to 14 days, picks the alternate at 5% more, and asks a human because the value crosses the threshold. Nobody wrote that sequence. The cost: tomorrow it might choose differently — hence the approval gate, the PO cap, and an eval set of past reorder situations. Close with: in a mature ERP the agent sits on top of the other three.", "Example", "Same problem, four ways: WH-204 is running low");
  [["Scheduler", "02:00 nightly: every item below reorder level → PO for default qty at default supplier", "Supplier on holiday? The PO goes out anyway.", GREY],
   ["Workflow", "below level → check open POs → draft PO → approval if > 50k → wait for GRN → close", "\"We can ship half, rest in 3 weeks\" matches no transition → exception queue.", GREY],
   ["Rules engine", "Audio & stock < 20 → order 100 from S-500 · lead > 7 days → 1.5× qty · March → hold", "New SKU category with no rule → nothing happens, silently.", GREY],
   ["Agent", "Goal: keep WH-204 in stock without over-ordering. Sees 12 left, open PO covers 50, forecast needs 80, usual supplier now 14 days → alternate at +5% → asks a human (over threshold)", "Nobody wrote that sequence. Tomorrow it may choose differently — so: approval gate, PO cap, evals.", ORANGE]].forEach(([h, a, b, c], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.95 + row * 1.32;
    T.card(s, x, y, 4.4, 1.2, c === ORANGE); T.h(s, h, x + 0.2, y + 0.1, 2.5, 0.3, 13);
    s.addText(c === ORANGE ? "DECIDES AS IT RUNS" : "DECIDED BEFORE IT RAN", { x: x + 2.0, y: y + 0.14, w: 2.2, h: 0.25, fontFace: MONO, fontSize: 7, color: c === ORANGE ? ORANGE : GREY2, align: "right", isTextBox: true, margin: 0 });
    T.p(s, a, x + 0.2, y + 0.42, 4.0, 0.5, 9, INK); T.p(s, b, x + 0.2, y + 0.88, 4.0, 0.3, 8.5, c === ORANGE ? ORANGE : GREY);
  });
  T.callout(s, "IN A MATURE ERP", "the agent sits on top of the other three: the scheduler wakes it, the workflow gives it approval and audit, the rules engine sets the limits it may not break.", 0.5, 4.6, 9, 0.5);
}

// 10 where agents live in an ERP
{
  const s = T.light("The series map. Every one of these is a loop over tools with an approval in the middle. We build them in this order: sales returns first (next episode), then MCP, then the platform concerns.", "The series", "Where agents live in an ERP");
  [["Sales / CRM", "quote-to-order · returns · lead triage", "Ep 2"], ["Inventory", "reorder · stock exceptions", "Ep 6"], ["Finance", "invoice matching · month-end reconciliation", "Ep 12, 26"],
   ["Procurement", "supplier search · PO approval", "Ep 6–8"], ["HR", "leave · expense approvals", "later"], ["Platform", "identity · tenancy · evals · tracing · guardrails · cost", "Ep 4, 9–11, 15, 25"]].forEach(([h, d, e], i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.5 + col * 3.05, y = 1.95 + row * 1.35;
    T.card(s, x, y, 2.85, 1.2, i === 0);
    T.h(s, h, x + 0.25, y + 0.15, 1.8, 0.35, 14);
    s.addText(e, { x: x + 1.9, y: y + 0.17, w: 0.75, h: 0.3, fontFace: MONO, fontSize: 8, color: ORANGE, align: "right", isTextBox: true, margin: 0 });
    T.p(s, d, x + 0.25, y + 0.55, 2.4, 0.6, 10.5);
  });
  T.p(s, "Every one is a loop over tools with an approval in the middle.", 0.5, 4.7, 9, 0.3, 10, GREY2);
}

// 9 identity
{
  const s = T.light("First breakpoint. The agent posts a credit note to the ledger — as whom? Walk the three options. The enterprise answer is the third: its own identity, scoped per company, per user, per task, least-privilege tools.", "What breaks in the enterprise · 1 of 3", "Identity: the agent posts to the ledger — as whom?");
  [["Service account", "Simple. Over-privileged. One prompt injection away from every company's books.", RED, "✕"],
   ["The user's token", "Scoped right — but how do you delegate it safely to a process that runs for minutes?", ORANGE, "~"],
   ["Agent identity", "Its own principal, scoped per company, per user, per task. Least-privilege tools. Auditable.", TEAL, "✓"]].forEach(([h, d, c, m], i) => {
    const x = 0.5 + i * 3.05;
    T.card(s, x, 2.0, 2.85, 2.3, i === 2);
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fill: { color: c } });
    s.addText(m, { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fontFace: SANS, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    T.h(s, h, x + 0.25, 2.75, 2.4, 0.4, 14);
    T.p(s, d, x + 0.25, 3.15, 2.4, 1.1);
  });
  T.p(s, "Episode 15 goes deep on delegated auth and least-privilege tools.", 0.5, 4.55, 9, 0.3, 10, GREY2);
}

// 10 tenancy
{
  const s = T.light("Second breakpoint: one ERP, many companies. Memory, tools and retrieval each have to be isolated per company — or you've shipped a data leak with a chat window. The company filter is a column on every table from day one, set by the deployment, never by the model.", "What breaks in the enterprise · 2 of 3", "Tenancy: one ERP, many companies");
  T.box(s, "Agent\n(model + loop)", 0.5, 2.65, 2.0, 1.3, ORANGE, WHITE, 13);
  [["Memory", "per-company store, never shared context"], ["Tools", "company_id injected server-side on every call"], ["Retrieval", "index partitioned, filtered before ranking"]].forEach(([h, d], i) => {
    const y = 2.15 + i * 0.9;
    T.arrow(s, 2.6, y + 0.35, 0.5);
    T.card(s, 3.2, y, 2.9, 0.75);
    T.h(s, h, 3.4, y + 0.08, 2.5, 0.3, 13); T.p(s, d, 3.4, y + 0.4, 2.6, 0.35, 9.5);
    ["ACME", "NORTH", "C3"].forEach((t, j) => { const x = 6.4 + j * 1.05; T.box(s, t, x, y + 0.12, 0.9, 0.5, TEAL, WHITE, 9); });
  });
  T.mono(s, "COMPANIES — ISOLATED AT EVERY LAYER", 6.4, 1.85, 3.1, 0.3, 8, TEAL);
  T.p(s, "Get one lane wrong and you've built a data leak with a chat window.", 0.5, 4.75, 9, 0.3, 10, GREY2);
}

// 11 accountability
{
  const s = T.light("Third breakpoint. Who approved the credit note? How do you audit a decision the model made at step 7 of 12? Four things before an agent touches production — each one is an episode.", "What breaks in the enterprise · 3 of 3", "Accountability: who answers for step 7 of 12?");
  [["Trace every step", "every model call, tool call and result, tied to a user and a company"],
   ["Human-in-the-loop", "irreversible or high-value actions pause for a person — by design, not by prompt"],
   ["Caps on steps, cost, time", "a runaway loop is a budget incident; the cap is the circuit breaker"],
   ["Evals before release", "a test set of real tasks, scored, run on every change — like any other software"]].forEach(([h, d], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.95 + row * 1.35;
    T.card(s, x, y, 4.4, 1.2);
    T.num(s, i + 1, x + 0.25, y + 0.22, 0.34);
    T.h(s, h, x + 0.75, y + 0.18, 3.5, 0.4, 14);
    T.p(s, d, x + 0.75, y + 0.58, 3.5, 0.55, 10.5);
  });
  T.p(s, "Episodes 9, 10, 18 and 25 cover each of these in depth.", 0.5, 4.7, 9, 0.3, 10, GREY2);
}

// 13 policies vs guardrails
{
  const s = T.light("Policies are the rules about what the agent MAY do, written by the business. Guardrails are the mechanisms that enforce them whatever the model decides. A policy in the system prompt is a request; a guardrail in code is a guarantee. The model can be wrong, misled by an injected instruction in a customer message, or drift between versions — so every policy that matters gets a guardrail too. Walk the five layers. Then point out that Episode 2's agent already has four of them without naming them: check_return_policy encodes the thresholds, request_approval is the human gate, MAX_STEPS is a runtime cap, qty-over-sold is a tool guardrail. Input and output checks are the gap Episode 25 fills.", "Keeping it safe", "Policies vs guardrails");
  T.card(s, 0.5, 1.95, 3.3, 2.55, true);
  T.h(s, "Policies", 0.7, 2.08, 2.9, 0.35, 15); T.mono(s, "WRITTEN BY THE BUSINESS", 0.7, 2.42, 2.9, 0.25, 7.5, ORANGE);
  T.p(s, "Scope — what it exists to do, what it never touches\nThresholds — auto-approve under 25,000; above needs a named approver\nData boundaries — one company; no PII in prompts or logs\nBehaviour — check policy before booking; escalate when unsure", 0.7, 2.72, 2.95, 1.4, 9.5, INK);
  T.p(s, "Goes in the system prompt — a request, not a guarantee.", 0.7, 4.12, 2.95, 0.35, 8.5, GREY);
  T.h(s, "Guardrails", 4.1, 1.98, 3, 0.3, 15); T.mono(s, "ENFORCED IN CODE", 6.9, 2.05, 2.6, 0.25, 7.5, ORANGE);
  [["Input", "sanitise the request; catch injected instructions; check identity and company"],
   ["Tool", "least privilege; schema checks; caps; tenant filter server-side; read-only by default"],
   ["Output", "no leaked data; no invented document numbers; no claimed actions that didn't happen"],
   ["Runtime", "step cap; cost budget; timeout; kill switch per agent"],
   ["Human-in-the-loop", "pause on irreversible or high-value actions, with full context attached"]].forEach(([h, d], i) => {
    const y = 2.35 + i * 0.44; T.num(s, i + 1, 4.1, y + 0.04, 0.28); T.h(s, h, 4.5, y, 1.8, 0.35, 11); T.p(s, d, 6.3, y + 0.02, 3.2, 0.42, 8.5);
  });
  T.callout(s, "RULE", "a policy says what it should do; a guardrail makes sure it can't do otherwise. Write both — never rely on the prompt alone. Episode 25 builds the full set.", 0.5, 4.6, 9, 0.5);
}

// 14 closing
T.closing("Recap", [["AGENT =", "decides + loop + tools"], ["5 PARTS", "model · instructions · tools · memory · loop + limits"], ["3 BREAKPOINTS", "identity · tenancy · accountability"]],
  "Episode 2 — Build your first AI agent: a sales-returns agent for the ERP, live, in one Python file.",
  "Recap in 30 seconds, then the call to action: next episode we build the first agent live, inside the ERP.");

pres.writeFile({ fileName: "ep01-what-is-an-agent.pptx" }).then(f => console.log("wrote", f));
