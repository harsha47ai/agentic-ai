# Arthashastra Learning · Episode 3 — live-coding run sheet

Target: 18–20 min. Slides 4 min, live code 9 min, two plug-ins 4 min, enterprise rules + recap 3 min.

## Before you hit record

- [ ] `cd episodes/03-first-mcp-server/code && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- [ ] From the repo root: `docker compose up -d && python -m erp.seed` (see INSTRUCTIONS.md)
- [ ] `node --version` ≥ 18 (for `npx @modelcontextprotocol/inspector`); run the Inspector once so npx has it cached
- [ ] Claude Desktop installed; config entry from `claude_desktop_config.example.json` pasted with **absolute paths** and the venv python; Claude Desktop restarted and the hammer/tools icon shows `erp` — do this BEFORE recording, it's the slowest step to debug
- [ ] `export ANTHROPIC_API_KEY=...` in the demo terminal — never on camera
- [ ] Open `server_starter.py` in the editor, `server.py` in a hidden tab
- [ ] Terminal ≥ 18pt, editor ≥ 16pt, notifications off
- [ ] Slides in presenter view with notes

## Segment plan

| Time | Slide | What you do |
| --- | --- | --- |
| 0:00 | 1–2 | Hook: last time mocks, today real. Three outcomes. |
| 0:45 | 3 | N×M problem. "MCP is USB-C for tools." |
| 1:45 | 4–5 | What MCP is (tools/resources/prompts, JSON-RPC, stdio vs HTTP). What it is not. |
| 3:30 | 6 | The data source. `python seed_db.py` on screen. |
| 4:30 | 7 | **Live code 1** — skeleton (checkpoint 1). |
| 5:30 | 8 | **Live code 2** — three tools (checkpoints 2–4). |
| 11:00 | 9 | Inspector: connect, list, call all three (WH-204, confirmed orders, INV-30117), show raw JSON-RPC. |
| 13:00 | 10 | Claude Desktop: show the config, ask the stock-and-invoices question, watch three tool calls. |
| 15:00 | 11 | `agent_mcp.py`: diff vs Episode 1, run it. |
| 16:30 | 12 | Four enterprise rules. |
| 18:00 | 13 | Recap, next episode, repo. |

## Live-coding checkpoints (type these, in this order)

Say what each block IS before you type it. Code is in `server.py`; `server_starter.py` has the TODO slots.

**Checkpoint 1 — skeleton**
```python
mcp = FastMCP("erp")

if __name__ == "__main__":
    mcp.run()
```
Say: "That's a valid MCP server. No tools yet, but a client can already connect and ask."

**Checkpoint 2 — get_item_stock (Inventory). Type the docstring slowly.**
Say: "The signature is the schema. The docstring is the only thing the model reads — when to use it, what the id looks like, what comes back."

**Checkpoint 3 — search_sales_orders (Sales). Point at the cap.**
Say: "`MAX_ROWS` is a product decision. The model will ask for everything. The server decides what it gets. And look at `COMPANY` — the tenant filter is in every query, set by the environment, never by the model."

**Checkpoint 4 — get_invoice (Finance). Fast — the pattern is established.**
Say: "Three modules, three tools, one server. Next episode we'll see why one server per module is the better shape."

## Demo runs

```bash
npx @modelcontextprotocol/inspector python server.py
#   get_item_stock       → sku: WH-204            (370 available across two warehouses, reorder level 20)
#   search_sales_orders  → status: confirmed, limit: 5
#   get_invoice          → invoice_id: INV-30117  (SO-7781, INR 26,800 open)

python agent_mcp.py "Which open sales orders cannot ship because stock is short, and do those customers have overdue invoices?"
```

Claude Desktop prompt: *"Which confirmed sales orders for ACME can't ship because stock is short, and do any of those customers have overdue invoices?"* — expect `search_sales_orders`, then `get_item_stock` per SKU, then `get_invoice` for the flagged customers. One question, three modules.

## If something breaks on camera

- Inspector won't start → `npx` cache; switch to `python agent_mcp.py`, which exercises the same tools.
- `connection refused` → Postgres isn't up: `docker compose up -d` from the repo root.
- Claude Desktop doesn't show the server → nine times out of ten it's a relative path or the system python instead of the venv. Show the fix; it's a real lesson.
- Model doesn't call a tool → read the docstring aloud, improve it, re-run. That IS the lesson of slide 8.
- Typo → fix on camera.

## After recording

- [ ] `git checkout -- code/server_starter.py` (restore the TODOs)
- [ ] Clips: the USB-C line (slide 3), "the docstring is what the model reads" (slide 8), the Claude Desktop tool call (slide 10)
- [ ] LinkedIn post: the N×M diagram as the image
