const pptxgen = require("pptxgenjs");
const { make } = require("../../../brand/theme");
const pres = new pptxgen();
const T = make(pres);
const { ORANGE, INK, GREY, GREY2, LINE, WHITE, TINT, SANS, MONO, RED, TEAL } = T.C;
pres.title = "Ep 3 — Build your first MCP server for the ERP";
const EP = "Arthashastra Learning · The Agentic Enterprise · Ep 3";

T.cover("03", "Build your first MCP server\nfor the ERP", null,
  "Last episode the tools were Python functions in the same process. Today they move behind an MCP server — and any MCP client (Claude Desktop, Cursor, our own agent) can use them with zero glue code. Promise the build: three tools over Inventory, Sales and Finance, tested in the Inspector, plugged in twice.");

{
  const s = T.light("Three outcomes, then the problem MCP solves.", "Episode 3 · What you'll get", "Tools any agent can use — with zero glue code", EP);
  [["Know what MCP is — and isn't", "tools, resources, prompts; the plug, not the appliance"], ["Ship a working MCP server", "3 read-only tools over Inventory, Sales, Finance — one file"], ["Plug it in twice", "Claude Desktop, and the returns agent from Episode 2"]].forEach(([h, d], i) => {
    const x = 0.5 + i * 3.05; T.card(s, x, 2.0, 2.85, 1.9); T.num(s, i + 1, x + 0.25, 2.25); T.h(s, h, x + 0.25, 2.75, 2.4, 0.6, 15); T.p(s, d, x + 0.25, 3.3, 2.4, 0.5);
  });
  T.callout(s, "ONE QUESTION", "“Which open orders can't ship because stock is short — and do those customers owe us money?” Three modules, one answer.", 0.5, 4.15, 9, 0.75);
}

{
  const s = T.light("Every agent needs every module. Before: N × M custom integrations. After: one protocol, one server per module, any client. The USB-C line lands with every audience.", "The problem", "N agents × M modules", EP);
  T.mono(s, "BEFORE — 9 CUSTOM INTEGRATIONS", 0.5, 1.95, 4.2, 0.3, 9, RED);
  const ag = ["Returns agent", "Reorder agent", "Collections agent"], md = ["Inventory", "Sales", "Finance"];
  ag.forEach((t, i) => T.box(s, t, 0.5, 2.35 + i * 0.75, 1.5, 0.5, INK, TINT, 9));
  md.forEach((t, i) => T.box(s, t, 3.2, 2.35 + i * 0.75, 1.3, 0.5, INK, TINT, 9));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const y1 = 2.6 + i * 0.75, y2 = 2.6 + j * 0.75; s.addShape(pres.shapes.LINE, { x: 2.0, y: Math.min(y1, y2), w: 1.2, h: Math.abs(y2 - y1), flipV: y1 > y2, line: { color: RED, width: 0.75 } }); }
  T.mono(s, "AFTER — 3 SERVERS, ANY CLIENT", 5.2, 1.95, 4.3, 0.3, 9, TEAL);
  ag.forEach((t, i) => T.box(s, t, 5.2, 2.35 + i * 0.75, 1.4, 0.5, INK, TINT, 9));
  T.box(s, "MCP", 6.85, 2.35, 0.7, 2.0, ORANGE, WHITE, 11);
  md.forEach((t, i) => { T.box(s, t + " server", 7.8, 2.35 + i * 0.75, 1.7, 0.5, INK, TINT, 9); s.addShape(pres.shapes.LINE, { x: 6.6, y: 2.6 + i * 0.75, w: 0.25, h: 0, line: { color: TEAL, width: 0.75 } }); s.addShape(pres.shapes.LINE, { x: 7.55, y: 2.6 + i * 0.75, w: 0.25, h: 0, line: { color: TEAL, width: 0.75 } }); });
  T.callout(s, "MCP", "is USB-C for tools: one plug, any device.", 0.5, 4.6, 9, 0.45);
}

{
  const s = T.light("Client and server, JSON-RPC between them. A server exposes three kinds of things. Today: tools over stdio. Streamable HTTP is the remote transport — a later episode, with auth.", "What MCP is", "Client ↔ server, over JSON-RPC", EP);
  T.box(s, "MCP client\n(Claude, Cursor, your agent)", 0.5, 2.0, 2.4, 0.9, INK, TINT, 10);
  s.addShape(pres.shapes.LINE, { x: 2.95, y: 2.45, w: 1.4, h: 0, line: { color: ORANGE, width: 1.25, beginArrowType: "triangle", endArrowType: "triangle" } });
  s.addText("JSON-RPC 2.0", { x: 2.95, y: 2.1, w: 1.4, h: 0.3, fontFace: MONO, fontSize: 8, color: ORANGE, align: "center", isTextBox: true, margin: 0 });
  s.addText("stdio · Streamable HTTP", { x: 2.85, y: 2.55, w: 1.6, h: 0.3, fontFace: SANS, fontSize: 8.5, color: GREY2, align: "center", isTextBox: true, margin: 0 });
  T.box(s, "MCP server\n(one per module)", 4.4, 2.0, 2.3, 0.9, ORANGE, WHITE, 10);
  T.arrow(s, 6.75, 2.45, 0.5);
  T.box(s, "ERP database\n(Postgres)", 7.3, 2.0, 2.2, 0.9, INK, TINT, 10);
  T.mono(s, "A SERVER EXPOSES THREE THINGS", 0.5, 3.15, 9, 0.3, 9, ORANGE);
  [["Tools", "actions the model can call — functions with a schema", "today"], ["Resources", "data the client can read — records, files, URIs", "later"], ["Prompts", "reusable templates the client can offer the user", "later"]].forEach(([h, d, t], i) => {
    const x = 0.5 + i * 3.05; T.card(s, x, 3.5, 2.85, 1.2, i === 0); T.h(s, h, x + 0.25, 3.62, 1.8, 0.35, 15);
    s.addText(t, { x: x + 1.9, y: 3.65, w: 0.7, h: 0.3, fontFace: MONO, fontSize: 8, color: i === 0 ? ORANGE : GREY2, align: "right", isTextBox: true, margin: 0 }); T.p(s, d, x + 0.25, 4.0, 2.4, 0.6, 10.5);
  });
}

{
  const s = T.light("Three things people assume MCP gives them. It doesn't. The third one bites in the enterprise: OAuth is in the spec for HTTP, but WHAT a caller may do is still your code and your policy.", "What MCP is NOT", "The plug, not the appliance", EP);
  [["An agent framework", "No loop, no planning, no memory. Your agent still owns all of that."], ["An orchestrator", "It doesn't decide which server to call or in what order. The model does."], ["Authorization", "OAuth exists for HTTP transports. Who may do what is still your code and your policy."]].forEach(([h, d], i) => {
    const x = 0.5 + i * 3.05; T.card(s, x, 2.0, 2.85, 2.0);
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fill: { color: RED } });
    s.addText("✕", { x: x + 0.25, y: 2.25, w: 0.36, h: 0.36, fontFace: SANS, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    T.h(s, h, x + 0.25, 2.75, 2.4, 0.4, 14); T.p(s, d, x + 0.25, 3.15, 2.4, 0.8);
  });
  T.callout(s, "MCP", "standardises how tools are described and called — nothing more.", 0.5, 4.2, 9, 0.6);
}

{
  const s = T.light("Our ERP database: Postgres, seeded, two companies. Walk the path: agent → client → server → database. The three tools each read one module.", "The data source", "The ERP database, three modules, three tools", EP);
  [["items · warehouses · stock_levels", "Inventory", "get_item_stock(sku)"], ["customers · sales_orders · sales_order_lines", "Sales", "search_sales_orders(status, customer_id, limit)"], ["invoices · credit_notes", "Finance", "get_invoice(invoice_id)"]].forEach(([tb, m, tool], i) => {
    const y = 1.95 + i * 0.85; T.card(s, 0.5, y, 5.8, 0.7); T.h(s, m, 0.7, y + 0.08, 1.4, 0.3, 13); T.mono(s, tb, 2.0, y + 0.1, 2.5, 0.3, 8, GREY); T.mono(s, tool, 2.0, y + 0.38, 4.2, 0.3, 8.5, ORANGE);
  });
  ["Agent", "MCP client", "MCP server", "Postgres"].forEach((t, i) => { const y = 1.95 + i * 0.68; T.box(s, t, 6.7, y, 2.8, 0.45, i === 2 ? ORANGE : INK, i === 2 ? WHITE : TINT, 10); if (i < 3) s.addShape(pres.shapes.LINE, { x: 8.1, y: y + 0.45, w: 0, h: 0.23, line: { color: GREY2, width: 1, endArrowType: "triangle" } }); });
  T.mono(s, "docker compose up -d   ·   python -m erp.seed", 0.5, 4.6, 6, 0.3, 9, INK);
  T.p(s, "2 companies · 50 items · 303 orders · 222 invoices — fixed seed, same numbers as the video", 0.5, 4.85, 9, 0.3, 9, GREY2);
}

{
  const s = T.light("Switch to screen. server_starter.py has the helpers. Type the import, the FastMCP instance, the run call. That's a server. No tools yet.", "Live code 1", "The server skeleton", EP);
  T.code(s, ["from mcp.server.fastmcp import FastMCP", "", { t: "mcp = FastMCP(\"erp\")", c: "FF7A33" }, "", "# ... tools go here ...", "", "if __name__ == \"__main__\":", { t: "    mcp.run()   # stdio transport by default", c: "FF7A33" }], 0.5, 1.95, 5.6, 2.4, 11);
  [["FastMCP", "the high-level server class in the official Python SDK — decorators, not boilerplate"], ["mcp.run()", "speaks JSON-RPC over stdin/stdout; the client launches it as a subprocess"], ["No tools yet", "a server with zero tools is valid — the client lists an empty set"]].forEach(([h, d], i) => {
    const y = 1.95 + i * 0.85; T.mono(s, h, 6.4, y, 3.1, 0.3, 10, TEAL); T.p(s, d, 6.4, y + 0.3, 3.1, 0.55, 10);
  });
  T.mono(s, "pip install mcp sqlalchemy psycopg[binary]", 0.5, 4.5, 5.6, 0.3, 9, GREY2);
}

{
  const s = T.light("One decorator per tool. The signature becomes the input schema; the DOCSTRING becomes the description the model reads. Then search_sales_orders and get_invoice the same way. Point at MAX_ROWS and at COMPANY.", "Live code 2", "Three tools, one pattern", EP);
  T.code(s, [{ t: "@mcp.tool()", c: "FF7A33" }, "def get_item_stock(sku: str) -> str:", { t: "    \"\"\"Inventory: stock on hand and reserved for one SKU", c: "4FB3BF" }, { t: "    (e.g. 'WH-204') across warehouses, plus reorder level.", c: "4FB3BF" },
    { t: "    Use when asked whether something is in stock.\"\"\"", c: "4FB3BF" }, "    with engine.connect() as con:", "        item = con.execute(select(items)", { t: "            .where(items.c.sku == sku, items.c.company_id == COMPANY)", c: "FF8A80" }, "        ).mappings().first()",
    "        ...", "    return _j({\"sku\": ..., \"available_total\": total, ...})", "", { t: "@mcp.tool()", c: "FF7A33" }, "def search_sales_orders(status=\"\", customer_id=\"\", limit=10) -> str:", { t: "    limit = max(1, min(int(limit), MAX_ROWS))   # cap it", c: "FF8A80" }], 0.5, 1.95, 5.9, 2.95, 9);
  [["Signature = schema", "type hints become the JSON schema the client sends to the model", ORANGE], ["Docstring = description", "the ONLY thing the model reads to decide when to call it", TEAL], ["Cap and filter", "MAX_ROWS caps every list. COMPANY filters every query — from the environment, never the model.", RED]].forEach(([h, d, c], i) => {
    const y = 1.95 + i * 1.0; T.mono(s, h, 6.65, y, 2.85, 0.25, 9, c); T.p(s, d, 6.65, y + 0.27, 2.85, 0.7, 10);
  });
}

{
  const s = T.light("Test it like an API before any agent touches it. The Inspector launches the server, lists tools, calls them with arguments and shows the raw JSON-RPC. Call all three on camera.", "Test it", "Before any agent touches it", EP);
  T.code(s, ["npx @modelcontextprotocol/inspector python server.py"], 0.5, 1.95, 9, 0.55, 11);
  [["Connect", "Inspector launches server.py as a subprocess over stdio"], ["List tools", "three tools, schemas and docstrings — exactly what a model sees"], ["Call each one", "get_item_stock WH-204 · search_sales_orders confirmed · get_invoice INV-30117"], ["Read the wire", "the raw JSON-RPC request and response — this is all MCP is"]].forEach(([h, d], i) => {
    const y = 2.7 + i * 0.52; T.num(s, i + 1, 0.5, y + 0.06, 0.34); T.h(s, h, 1.05, y + 0.02, 2.0, 0.45, 13); T.p(s, d, 3.1, y + 0.08, 6.4, 0.45, 10.5);
  });
  T.p(s, "Opens at localhost:6274 — keep it on a second screen while recording.", 0.5, 4.8, 9, 0.3, 9, GREY2);
}

{
  const s = T.light("The zero-glue moment. One JSON entry in Claude Desktop's config, restart, ask in plain English. Three tool calls, three modules. You wrote no client code.", "Plug it in · 1", "Claude Desktop", EP);
  T.code(s, ["{", "  \"mcpServers\": {", { t: "    \"erp\": {", c: "FF7A33" }, "      \"command\": \".../.venv/bin/python\",", "      \"args\": [\".../code/server.py\"],", "      \"env\": { \"DATABASE_URL\": \"postgresql+psycopg://...\",", "               \"ERP_COMPANY\": \"ACME\" }", "    }", "  }", "}"], 0.5, 1.95, 5.2, 2.5, 9.5);
  T.mono(s, "~/Library/Application Support/Claude/claude_desktop_config.json", 0.5, 4.5, 5.2, 0.3, 7.5, GREY2);
  T.card(s, 6.0, 1.95, 3.5, 2.85, true);
  T.mono(s, "ASK IN PLAIN ENGLISH", 6.25, 2.1, 3.1, 0.3, 8, TEAL);
  s.addText("“Which confirmed orders for ACME can't ship because stock is short, and do any of those customers have overdue invoices?”", { x: 6.25, y: 2.45, w: 3.1, h: 1.2, fontFace: SANS, fontSize: 11.5, italic: true, color: INK, isTextBox: true, margin: 0, valign: "top" });
  T.p(s, "→ search_sales_orders\n→ get_item_stock per SKU\n→ get_invoice for the flagged customers\n→ zero client code", 6.25, 3.7, 3.1, 1.0, 9.5);
}

{
  const s = T.light("Back to Episode 2's loop. Two lines change: tools from list_tools(), execution through call_tool(). The loop is untouched. The agent doesn't care where tools live.", "Plug it in · 2", "Our own agent — two lines change", EP);
  T.mono(s, "EPISODE 2", 0.5, 1.95, 4.4, 0.3, 9, GREY2);
  T.code(s, ["from erp_tools import TOOLS, HANDLERS", "", "out = HANDLERS[block.name](**block.input)"], 0.5, 2.3, 4.4, 1.3, 9.5);
  T.mono(s, "EPISODE 3", 5.1, 1.95, 4.4, 0.3, 9, ORANGE);
  T.code(s, [{ t: "listed = await session.list_tools()", c: "FF7A33" }, "tools  = [{name, description, inputSchema} ...]", { t: "out = await session.call_tool(block.name, block.input)", c: "FF7A33" }], 5.1, 2.3, 4.4, 1.3, 9.5);
  T.callout(s, "WHY IT MATTERS", "the same server now serves Claude Desktop, Cursor, your agent and the next team's agent. Tool logic lives once, next to the data, owned by the team that owns the data.", 0.5, 3.85, 9, 0.95);
}

{
  const s = T.light("Four rules before this server goes anywhere near production. Each is a later episode. Say the tenant one twice: never trust the model to add the WHERE clause.", "What breaks in the enterprise", "Four rules before this server leaves your laptop", EP);
  [["Read-only by default", "no UPDATE tool until identity and approval exist (Ep 15)", TEAL], ["Cap and paginate", "MAX_ROWS on every list. The model asks for everything; the server decides.", TEAL],
   ["Tenant filter server-side", "COMPANY comes from the deployment, injected into every query. Never trust the model to add WHERE.", ORANGE], ["Log every call", "tool, args, caller, company, latency — your audit trail and your eval set (Ep 9, 10)", TEAL]].forEach(([h, d, c], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.5 + col * 4.6, y = 1.95 + row * 1.35; T.card(s, x, y, 4.4, 1.2, c === ORANGE);
    T.num(s, i + 1, x + 0.25, y + 0.22, 0.34); T.h(s, h, x + 0.75, y + 0.18, 3.5, 0.4, 14); T.p(s, d, x + 0.75, y + 0.58, 3.5, 0.55, 10.5);
  });
}

T.closing("Recap", [["MCP =", "tools · resources · prompts over JSON-RPC. One server, any client."], ["WE SHIPPED", "3 read-only tools over Inventory, Sales, Finance"], ["PLUGGED IN", "Claude Desktop with one config entry; our agent with two lines"], ["BEFORE PROD", "read-only · caps · tenant filter server-side · log every call"]],
  "Episode 4 — Where agents sit in a multi-tenant ERP.",
  "Recap, then next episode: the architecture question — where agents sit in a multi-tenant ERP. Ask them to star the repo and open an issue with the module they want next.");

pres.writeFile({ fileName: "ep03-first-mcp-server.pptx" }).then(f => console.log("wrote", f));
