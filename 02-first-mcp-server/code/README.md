# Episode 2 code — your first MCP server

| File | What it is |
| --- | --- |
| `seed_db.py` | Creates `trade_orders.db` (orders, shipments, hs_codes — 120 orders, 85 shipments). Run once. |
| `server.py` | The MCP server: three read-only tools over the DB, stdio transport. |
| `server_starter.py` | Live-coding version — DB helper pre-written, five TODOs. |
| `agent_mcp.py` | Episode 1's agent loop, with tools discovered from the MCP server instead of hardcoded. |
| `claude_desktop_config.example.json` | Entry to paste into Claude Desktop's config to use the server there. |

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python seed_db.py
npx @modelcontextprotocol/inspector python server.py     # test tools in the browser UI
export ANTHROPIC_API_KEY=sk-ant-...
python agent_mcp.py "Which shipments to Chennai are delayed by 4+ days?"
```

Claude Desktop config lives at `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS). Restart Claude Desktop after editing.
