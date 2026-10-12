const pptxgen = require("pptxgenjs");
const { make } = require("../../../brand/theme");
const pres = new pptxgen();
const T = make(pres);
const { ORANGE, INK, GREY, GREY2, LINE, WHITE, TINT, SANS, MONO, RED, TEAL } = T.C;
pres.title = "Ep 2 — Build your first AI agent: a sales-returns agent for the ERP";
const EP = "Arthashastra Learning · The Agentic Enterprise · Ep 2";

T.cover("02", "Build your first AI agent:\na sales-returns agent for the ERP", null,
  "Last time: what an agent is. Today: one Python file, one API key, a working agent inside a real ERP flow. We write the loop live, give it four ERP tools, and watch it take different paths on three cases.");

{
  const s = T.light("Three outcomes, then straight to the use case.", "Episode 2 · What you'll get", "One Python file. One API key. A working agent.", EP);
  [["Write the loop from scratch", "~15 lines: plan, done?, act + observe, limit"], ["Give it 4 ERP tools", "Sales, Approval, Inventory + Finance + CRM"], ["Watch it choose", "three cases, three different paths — one of them stops for you"]].forEach(([h, d], i) => {
    const x = 0.5 + i * 3.05; T.card(s, x, 2.0, 2.85, 1.9); T.num(s, i + 1, x + 0.25, 2.25); T.h(s, h, x + 0.25, 2.75, 2.4, 0.6, 15); T.p(s, d, x + 0.25, 3.3, 2.4, 0.5);
  });
  T.callout(s, "THE SERIES", "every episode adds a module or an agent to one open-source ERP. Two slides on that, then we build.", 0.5, 4.15, 9, 0.75);
}

// 3 our ERP
{
  const s = T.light("Thirty seconds on what we are building across the series. Six modules, boring stack, two seeded companies. The one design decision to say out loud: company_id on every business table from day one.", "The ERP", "One ERP, built in public, one module at a time", EP);
  [["Core", "companies · users — tenancy from day one"], ["Sales / CRM", "customers · sales orders · cases"], ["Inventory", "items · warehouses · stock levels · stock moves"],
   ["Finance", "invoices · credit notes"], ["Procurement", "suppliers · purchase orders"], ["HR", "employees"]].forEach(([h, d], i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.5 + col * 2.15, y = 1.95 + row * 1.0;
    T.card(s, x, y, 2.0, 0.85, i === 1); T.h(s, h, x + 0.2, y + 0.12, 1.7, 0.3, 13); T.p(s, d, x + 0.2, y + 0.45, 1.7, 0.4, 9);
  });
  T.card(s, 7.1, 1.95, 2.4, 2.0, true);
  T.mono(s, "STACK", 7.3, 2.08, 2.0, 0.25, 8, ORANGE); T.p(s, "Python 3.11 · SQLAlchemy · Postgres 16 (Docker) · Claude API · MCP · MIT", 7.3, 2.33, 2.05, 0.6, 9.5, INK);
  T.mono(s, "SEED DATA", 7.3, 2.95, 2.0, 0.25, 8, ORANGE); T.p(s, "2 companies (ACME, NORTH) · 42 customers · 50 items · 303 sales orders · 222 invoices · fixed seed", 7.3, 3.2, 2.05, 0.6, 9.5, INK);
  T.callout(s, "RULE", "every business table carries company_id. Tenancy is a column from day one, never bolted on.", 0.5, 4.1, 9, 0.6);
}

// 4 setting up the workspace
{
  const s = T.light("Five minutes, once. Show each command running if you have time; otherwise show the expected output. Say the no-Docker and Windows notes. INSTRUCTIONS.md has everything.", "Setup", "Clone, start Postgres, seed, test — five minutes, once", EP);
  [["Clone", "git clone https://github.com/harsha47ai/agentic-ai && cd agentic-ai"],
   ["Environment", "python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"],
   ["Data", "docker compose up -d && python -m erp.seed      → seeded: companies=2 … sales_orders=303 … invoices=222"],
   ["Key + tests", "cp .env.example .env  (add ANTHROPIC_API_KEY)  ·  cd episodes/02-build-your-first-agent/code && python -m pytest -q  → 14 passed"]].forEach(([h, c], i) => {
    const y = 1.95 + i * 0.62; T.num(s, i + 1, 0.5, y + 0.08, 0.34); T.h(s, h, 1.0, y + 0.03, 1.5, 0.4, 13);
    s.addShape(pres.shapes.RECTANGLE, { x: 2.55, y, w: 4.45, h: 0.5, fill: { color: "111111" } });
    s.addText(c, { x: 2.7, y, w: 4.2, h: 0.5, fontFace: MONO, fontSize: 7.5, color: "E6E6E6", isTextBox: true, margin: 0, valign: "middle" });
  });
  T.card(s, 7.2, 1.95, 2.3, 2.4, true);
  T.mono(s, "NO DOCKER?", 7.4, 2.08, 2.0, 0.25, 8, ORANGE); T.p(s, "DATABASE_URL=sqlite:///erp.db — everything else is identical", 7.4, 2.33, 1.95, 0.6, 9, INK);
  T.mono(s, "WINDOWS", 7.4, 2.95, 2.0, 0.25, 8, ORANGE); T.p(s, "WSL2 + Docker Desktop", 7.4, 3.2, 1.95, 0.3, 9, INK);
  T.mono(s, "FULL GUIDE", 7.4, 3.55, 2.0, 0.25, 8, ORANGE); T.p(s, "INSTRUCTIONS.md in the repo", 7.4, 3.8, 1.95, 0.4, 9, INK);
  T.p(s, "Pre-seeded demo orders:  SO-7781 auto-approve  ·  SO-7790 refused  ·  SO-7795 needs a human", 0.5, 4.55, 9, 0.3, 10, GREY);
}

{
  const s = T.light("The use case. A return is a great first agent because it is boring and it crosses three modules. Say the three documents it must produce.", "The use case", "A customer return touches three modules", EP);
  s.addText("“Customer C-1042 wants to return 2 units of WH-204 from sales order SO-7781 — arrived damaged.”", { x: 0.5, y: 1.9, w: 9, h: 0.5, fontFace: SANS, fontSize: 13, italic: true, color: GREY, isTextBox: true, margin: 0 });
  [["Sales / CRM", "the order, the return policy, a case note", "get_sales_order · check_return_policy"], ["Inventory", "a restock-pending stock move to RETURNS-QC", "create_return"], ["Finance", "a credit note against the invoice", "create_return"]].forEach(([h, d, t], i) => {
    const x = 0.5 + i * 3.05; T.card(s, x, 2.55, 2.85, 1.65, i === 0); T.h(s, h, x + 0.25, 2.7, 2.4, 0.35, 15); T.p(s, d, x + 0.25, 3.1, 2.4, 0.5); T.mono(s, t, x + 0.25, 3.7, 2.4, 0.4, 8.5, ORANGE);
  });
  T.callout(s, "RULE", "returns over the threshold or outside the window never book themselves — the agent asks a human, by design.", 0.5, 4.35, 9, 0.6);
}

{
  const s = T.light("Transition before the live code. Four steps; we type only step 3. Tools and master data are already in erp_tools.py and the database.", "Building your first agent", "Four steps — we type one of them", EP);
  [["Set up", "pip install anthropic · docker compose up · python -m erp.seed", "2 min", TEAL], ["Define the tools", "4 functions + JSON schemas in erp_tools.py — the model reads the descriptions", "pre-written", TEAL],
   ["Write the loop", "plan → done? → act + observe → repeat, capped by MAX_STEPS", "we type this", ORANGE], ["Run it three times", "SO-7781 books · SO-7790 refused · SO-7795 waits for a human", "3 min", TEAL]].forEach(([h, d, t, c], i) => {
    const y = 1.95 + i * 0.7; T.num(s, i + 1, 0.5, y + 0.1, 0.36); T.h(s, h, 1.05, y + 0.05, 2.2, 0.5, 14); T.p(s, d, 3.3, y + 0.08, 4.7, 0.6, 10.5);
    s.addShape(pres.shapes.RECTANGLE, { x: 8.2, y: y + 0.15, w: 1.3, h: 0.3, fill: { color: c === ORANGE ? ORANGE : TINT }, line: { color: c === ORANGE ? ORANGE : LINE, width: 0.75 } });
    s.addText(t, { x: 8.2, y: y + 0.15, w: 1.3, h: 0.3, fontFace: MONO, fontSize: 8, bold: true, color: c === ORANGE ? WHITE : TEAL, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  });
  T.p(s, "agent_starter.py — tools pre-written, three TODOs where the loop goes", 0.5, 4.8, 9, 0.3, 10, GREY2);
}

{
  const s = T.light("The tools. Signature becomes the schema; the description is the ONLY thing the model reads to decide when to call it. Write it for the model: when, what format, what comes back.", "The tools", "Four tools the model can call", EP);
  [["get_sales_order", "Sales", "order, lines, customer, delivery date, invoice. Always first."], ["check_return_policy", "Sales", "window, accepted reason, quantity sold — and whether a human must approve"],
   ["request_approval", "Approval", "pauses for a person. Only when policy says so. Stop if declined."], ["create_return", "Inventory · Finance · CRM", "credit note + stock move + case, in one transaction"]].forEach(([n, m, d], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.95 + row * 1.3; T.card(s, x, y, 4.4, 1.15, i === 2);
    T.mono(s, n, x + 0.25, y + 0.15, 2.8, 0.3, 11, INK); s.addText(m, { x: x + 2.6, y: y + 0.15, w: 1.6, h: 0.3, fontFace: MONO, fontSize: 8, color: ORANGE, align: "right", isTextBox: true, margin: 0 });
    T.p(s, d, x + 0.25, y + 0.5, 3.9, 0.6, 10.5);
  });
  T.callout(s, "DESCRIPTION = CONTRACT", "the model never sees your code, only the description. Vague description, wrong tool.", 0.5, 4.6, 9, 0.45);
}

{
  const s = T.light("Live-code this. Three parts: the model call (plan), the stop check (done), the tool execution (act + observe). Then point at MAX_STEPS — the limit.", "Live code", "The whole agent is one loop", EP);
  T.code(s, ["for step in range(1, MAX_STEPS + 1):", { t: "    resp = client.messages.create(model=MODEL, system=SYSTEM,", c: "FF7A33" }, { t: "        tools=TOOLS, messages=messages)", c: "FF7A33" },
    "    messages.append({\"role\": \"assistant\", \"content\": resp.content})", "", { t: "    if resp.stop_reason != \"tool_use\":", c: "4FB3BF" }, { t: "        return text_of(resp)", c: "4FB3BF" }, "",
    "    results = []", "    for block in resp.content:", "        if block.type == \"tool_use\":", { t: "            out = HANDLERS[block.name](**block.input)", c: "FF7A33" },
    "            results.append(tool_result(block.id, out))", "    messages.append({\"role\": \"user\", \"content\": results})", "", { t: "return \"Stopped: step limit reached.\"", c: "FF8A80" }], 0.5, 1.95, 5.9, 2.95, 9.5);
  [["PLAN", "the model sees goal, tools and every result so far — and picks", ORANGE], ["DONE", "no tool requested → the model thinks the goal is met", TEAL], ["ACT + OBSERVE", "run what it asked, feed the result back, go around", ORANGE], ["LIMIT", "MAX_STEPS = 8. Cap cost and time too in production", RED]].forEach(([h, d, c], i) => {
    const y = 1.95 + i * 0.74; T.mono(s, h, 6.65, y, 2.85, 0.25, 9, c); T.p(s, d, 6.65, y + 0.26, 2.85, 0.5, 10);
  });
}

{
  const s = T.light("Run 1. Narrate each tool call as it prints. Pause on step 2 — nobody told it to check policy; it chose to, because the description said 'call before any return'.", "Run 1 · SO-7781", "4 days old, INR 6,400 — booked automatically", EP);
  T.code(s, [{ t: "$ python returns_agent.py \"Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged\"", c: "9AA6B2" }, "",
    "[step 1] tool=get_sales_order      input={\"order_id\": \"SO-7781\"}", { t: "[step 2] tool=check_return_policy  input={\"order_id\": \"SO-7781\", \"sku\": \"WH-204\", \"qty\": 2, \"reason\": \"damaged\"}", c: "FF7A33" },
    "[step 3] tool=create_return        input={...}", "", "[FINANCE]   credit note CN-40001  6,400 against INV-30117", "[INVENTORY] stock move  SM-70001  2 x WH-204 -> RETURNS-QC (restock_pending)", "[CRM]       case        CASE-9001", "",
    "FINAL: Return booked for C-1042: 2 x WH-204 from SO-7781 (damaged). Credit note CN-40001 issued", "       against INV-30117; stock move SM-70001 created for QC."], 0.5, 1.95, 9, 2.6, 9);
  T.callout(s, "WATCH STEP 2", "nobody told it to check policy. The description did. That is the model choosing.", 0.5, 4.65, 9, 0.45);
}

{
  const s = T.light("Runs 2 and 3 side by side. Same code, different paths. Run 3 stops and waits for you — type y on camera. This is human-in-the-loop in its simplest form.", "Runs 2 and 3", "Same loop, different paths", EP);
  T.mono(s, "SO-7790 · 41 DAYS OLD", 0.5, 1.95, 4.4, 0.3, 9, RED);
  T.code(s, ["[step 1] tool=get_sales_order", "[step 2] tool=check_return_policy", { t: "         -> eligible: false, days: 41, window: 30", c: "FF8A80" }, "",
    "FINAL: This return falls outside the 30-day", "window (delivered 41 days ago). Nothing has", "been booked; please escalate to the sales", "manager if an exception is wanted."], 0.5, 2.3, 4.4, 2.2, 9);
  T.mono(s, "SO-7795 · INR 73,500 · OVER THRESHOLD", 5.1, 1.95, 4.4, 0.3, 9, ORANGE);
  T.code(s, ["[step 1] tool=get_sales_order", "[step 2] tool=check_return_policy", { t: "         -> eligible: true, needs_human_approval: true", c: "FF7A33" }, { t: "[step 3] tool=request_approval", c: "FF7A33" }, "",
    { t: "[APPROVAL NEEDED] SO-7795: 3 x MN-27Q, INR 73,500", c: "FFFFFF" }, { t: "Approve this return? (y/n): _", c: "FFFFFF" }, "", "[step 4] tool=create_return   (only after y)"], 5.1, 2.3, 4.4, 2.2, 9);
  T.p(s, "No code changed between the three runs. The policy result changed what the model decided to do next.", 0.5, 4.65, 9, 0.4, 10.5, GREY);
}

{
  const s = T.light("Side by side with workflow.py. Same job. In the workflow every line was written by you; in the agent the model chose the sequence. Neither is better — but only one is an agent.", "Workflow vs agent", "Same job. Who decided the flow?", EP);
  T.mono(s, "WORKFLOW.PY", 0.5, 1.95, 4.4, 0.3, 9, TEAL);
  T.code(s, ["reason = classify_reason(text)      # LLM step", "order  = get_sales_order(so)         # fixed", "policy = check_return_policy(...)    # fixed", "if not policy['eligible']: return", "if policy['needs_human_approval']:", "    request_approval(...)", "create_return(...)                   # fixed", "", { t: "Every line written by the developer.", c: "9AA6B2" }], 0.5, 2.3, 4.4, 2.2, 9);
  T.mono(s, "RETURNS_AGENT.PY", 5.1, 1.95, 4.4, 0.3, 9, ORANGE);
  T.code(s, ["for step in range(MAX_STEPS):", "    resp = model(goal, tools, history)", "    if done: return", "    run what it asked; append results", "", "", "", "", { t: "The model chose each tool, each time.", c: "9AA6B2" }], 5.1, 2.3, 4.4, 2.2, 9);
  T.callout(s, "PICK THE WORKFLOW", "when the steps are known and fixed. Pick the agent when the next step depends on what the last one returned.", 0.5, 4.65, 9, 0.45);
}

{
  const s = T.light("What we skipped, on purpose. Each is a later episode. Say the tenant one clearly: COMPANY came from an environment variable, not from the model.", "What we skipped (on purpose)", "This agent is not production-ready — yet", EP);
  [["Real data over MCP", "tools are Python functions in-process. Next episode they move behind an MCP server.", "Ep 3"], ["Identity", "the agent used the app's DB credentials. It needs its own, scoped per task.", "Ep 15"],
   ["Tracing and evals", "we read print statements. Production needs traces and a scored test set.", "Ep 9–10"], ["Guardrails", "nothing checks the model's inputs and outputs. Yet.", "Ep 25"]].forEach(([h, d, e], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.95 + row * 1.3; T.card(s, x, y, 4.4, 1.15);
    T.h(s, h, x + 0.25, y + 0.15, 3.0, 0.35, 14); s.addText(e, { x: x + 3.3, y: y + 0.17, w: 0.85, h: 0.3, fontFace: MONO, fontSize: 8, color: ORANGE, align: "right", isTextBox: true, margin: 0 }); T.p(s, d, x + 0.25, y + 0.5, 3.9, 0.6, 10.5);
  });
  T.callout(s, "ONE THING WE DID RIGHT", "the tenant (ERP_COMPANY) is set by the deployment and injected into every query. The model never picks it.", 0.5, 4.6, 9, 0.45);
}

T.closing("Recap", [["AGENT =", "a loop over tools with a limit — ~15 lines"], ["TOOLS", "the description is the contract; the model reads nothing else"], ["3 RUNS", "booked · refused · waited for a human — same code"]],
  "Episode 3 — Build your first MCP server for the ERP: Inventory, Sales and Finance tools any agent can use.",
  "Recap, then the hook for Episode 3: the tools go behind an MCP server, and the loop doesn't change by a single line.");

pres.writeFile({ fileName: "ep02-build-your-first-agent.pptx" }).then(f => console.log("wrote", f));
