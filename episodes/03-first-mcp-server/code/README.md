# Episode 3 code — your first MCP server (over the ERP)

| File | What it is |
| --- | --- |
| `server.py` | MCP server: three read-only tools over the ERP database — Inventory, Sales, Finance. |
| `server_starter.py` | Live-coding version, five TODOs. |
| `agent_mcp.py` | Episode 2's loop with tools discovered from the server instead of imported. |
| `claude_desktop_config.example.json` | Paste into Claude Desktop's config (absolute paths, venv python). |

Needs the ERP database seeded first — see `INSTRUCTIONS.md` at the repo root.

```bash
npx @modelcontextprotocol/inspector python server.py
python agent_mcp.py "Which open sales orders cannot ship because stock is short, and do those customers have overdue invoices?"
```
