# Arthashastra Learning · Episode 2 — live-coding run sheet

Target: 18–20 min. Slides 4 min, live code 9 min, two plug-ins 4 min, enterprise rules + recap 3 min.

## Before you hit record

- [ ] `cd 02-first-mcp-server/code && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- [ ] `python seed_db.py` — confirm it prints `120 orders, 85 shipments`
- [ ] `node --version` ≥ 18 (for `npx @modelcontextprotocol/inspector`); run the Inspector once so npx has it cached
- [ ] Claude Desktop installed; config entry from `claude_desktop_config.example.json` pasted with **absolute paths** and the venv python; Claude Desktop restarted and the hammer/tools icon shows `trade-orders` — do this BEFORE recording, it's the slowest step to debug
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
| 11:00 | 9 | Inspector: connect, list, call all three, show raw JSON-RPC. |
| 13:00 | 10 | Claude Desktop: show the config, ask the Chennai question, watch the tool call. |
| 15:00 | 11 | `agent_mcp.py`: diff vs Episode 1, run it. |
| 16:30 | 12 | Four enterprise rules. |
| 18:00 | 13 | Recap, next episode, repo. |

## Live-coding checkpoints

**Checkpoint 1 — skeleton**
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("trade-orders")

if __name__ == "__main__":
    mcp.run()
```
Say: "That's a valid MCP server. It has no tools, but a client can already connect and ask."

**Checkpoint 2 — get_order (type the docstring slowly)**
```python
@mcp.tool()
def get_order(order_id: str) -> str:
    """Fetch one order by its id (format 'A-7001') with its HS code description and any linked shipment.
    Use this when the user names a specific order. Returns JSON, or an error field if not found."""
    rows = _query(
        """SELECT o.*, h.description AS hs_description, h.basic_duty_pct,
                  s.shipment_id, s.origin_port, s.dest_port, s.eta, s.status AS shipment_status, s.delay_days
           FROM orders o JOIN hs_codes h ON h.code = o.hs_code
           LEFT JOIN shipments s ON s.order_id = o.order_id
           WHERE o.order_id = ?""",
        (order_id.strip().upper(),),
    )
    return json.dumps(rows[0] if rows else {"error": f"order {order_id} not found"}, indent=2)
```
Say: "The signature is the schema. The docstring is the only thing the model reads. Write it for the model: when to use it, what format the id is, what comes back."

**Checkpoint 3 — search_shipments (point at the cap)**
```python
@mcp.tool()
def search_shipments(status: str = "", dest_port: str = "", min_delay_days: int = 0, limit: int = 10) -> str:
    """Search shipments. Filters are optional and combine with AND:
    status in {booked, in_transit, at_port, customs_hold, delivered}; dest_port e.g. 'Chennai';
    min_delay_days to find delayed shipments. limit is capped at 25. Returns a JSON list, newest ETA first."""
    limit = max(1, min(int(limit), MAX_ROWS))
    where, params = ["1=1"], []
    if status:
        where.append("s.status = ?"); params.append(status.strip().lower())
    if dest_port:
        where.append("LOWER(s.dest_port) = ?"); params.append(dest_port.strip().lower())
    if min_delay_days:
        where.append("s.delay_days >= ?"); params.append(int(min_delay_days))
    rows = _query(
        f"""SELECT s.shipment_id, s.order_id, o.customer_id, s.origin_port, s.dest_port, s.eta, s.status, s.delay_days
            FROM shipments s JOIN orders o ON o.order_id = s.order_id
            WHERE {' AND '.join(where)} ORDER BY s.eta DESC LIMIT ?""",
        (*params, limit),
    )
    return json.dumps({"count": len(rows), "limit": limit, "results": rows}, indent=2)
```
Say: "`MAX_ROWS` is a product decision. The model will ask for everything. The server decides what it gets."

**Checkpoint 4 — lookup_hs_code (fast, you've shown the pattern)**
```python
@mcp.tool()
def lookup_hs_code(description: str) -> str:
    """Find HS codes whose description matches a product keyword (e.g. 'shrimp', 'rice', 'laptop').
    Returns code, description and basic customs duty %. Use before answering any duty or classification question."""
    rows = _query(
        "SELECT code, description, basic_duty_pct FROM hs_codes WHERE LOWER(description) LIKE ? LIMIT ?",
        (f"%{description.strip().lower()}%", MAX_ROWS),
    )
    return json.dumps(rows if rows else {"error": f"no HS code matches '{description}'"}, indent=2)
```

## Demo runs

```bash
npx @modelcontextprotocol/inspector python server.py
#   get_order        → order_id: A-7001
#   search_shipments → dest_port: Chennai, min_delay_days: 4, limit: 5
#   lookup_hs_code   → description: shrimp

python agent_mcp.py "Which shipments to Chennai are delayed by 4 days or more? And what duty applies to frozen shrimp?"
```

Claude Desktop prompt: *"Which shipments to Chennai are delayed by more than 4 days, and which customers should I call first?"* — expect `search_shipments` then one or more `get_order` calls.

Expected from the seed (fixed seed 42): Chennai + delay ≥ 4 returns S-9076 (customs_hold, 12 days) first. Shrimp → HS 0306.17, 30% duty.

## If something breaks on camera

- Inspector won't start → `npx` cache; switch to `python agent_mcp.py`, which exercises the same tools.
- Claude Desktop doesn't show the server → nine times out of ten it's a relative path or the system python instead of the venv. Show the fix; it's a real lesson.
- Model doesn't call a tool → read the docstring aloud, improve it, re-run. That IS the lesson of slide 8.
- Typo → fix on camera.

## After recording

- [ ] `git checkout -- code/server_starter.py` (restore the TODOs)
- [ ] Clips: the USB-C line (slide 3), "the docstring is what the model reads" (slide 8), the Claude Desktop tool call (slide 10)
- [ ] LinkedIn post: the N×M diagram as the image
