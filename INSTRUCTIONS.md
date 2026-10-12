# Instructions — set up and run everything

Works on macOS and Linux. Windows: use WSL2.

## 0. What you need

| Tool | Why | Install |
| --- | --- | --- |
| Python 3.11+ | all code | `brew install python` |
| Docker Desktop | Postgres for the ERP | https://www.docker.com/products/docker-desktop/ |
| Node 18+ | MCP Inspector (Episode 3) | `brew install node` |
| An Anthropic API key | the agents | https://console.anthropic.com/ |
| Claude Desktop (optional) | Episode 3 plug-in demo | https://claude.ai/download |

## 1. Clone and create the environment (once)

```bash
git clone https://github.com/harsha47ai/agentic-ai.git
cd agentic-ai
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then put your ANTHROPIC_API_KEY in .env
```

Load the env in every new terminal: `source .venv/bin/activate && set -a && source .env && set +a`

## 2. Start Postgres and seed the ERP with dummy data

```bash
docker compose up -d            # Postgres 16 on localhost:5432, user/pass/db = erp/erp/erp
python -m erp.seed              # drops + recreates all tables, loads the dummy data
```

Expected output: `seeded: companies=2, users=10, customers=42, suppliers=12, items=50, warehouses=4, stock_levels=100, ... sales_orders=303, ... invoices=222, ... purchase_orders=30, employees=40`

What's in it: two companies (tenants) — **ACME** (Hyderabad electronics distributor) and **NORTH** (Pune industrial supplies). Each has customers, suppliers, items, two warehouses with stock, 150 sales orders with lines, invoices (open / paid / overdue), purchase orders and employees. The seed is deterministic (fixed random seed), so your numbers match the videos.

Fixed demo records (company ACME):

| Record | Why it exists |
| --- | --- |
| `SO-7781` · C-1042 · 5 × WH-204 + 2 × KB-110 · delivered 4 days ago | small return → auto-approved |
| `SO-7790` · C-2210 · 10 × MN-27Q · delivered 41 days ago | outside 30-day window → refused |
| `SO-7795` · C-1042 · 3 × MN-27Q · delivered 6 days ago, INR 73,500 | over the 25,000 threshold → human approval |
| `INV-30117` (open), `INV-30044` (paid), `INV-30131` (open) | invoices for the three orders |

No Docker? Use SQLite instead: set `DATABASE_URL=sqlite:///erp.db` in `.env`, then `python -m erp.seed`. Everything else is identical.

Reset at any time: `python -m erp.seed` (it drops and recreates). Wipe Postgres completely: `docker compose down -v`.

Look at the data: `docker exec -it erp-postgres psql -U erp -d erp` then e.g. `SELECT id, customer_id, total, status FROM sales_orders WHERE company_id='ACME' ORDER BY order_date DESC LIMIT 10;`

## 3. Episode 2 — build your first agent

```bash
cd episodes/02-build-your-first-agent/code
python -m pytest -q                    # 14 tests (tools + agent loop) with no API key; 16 with ANTHROPIC_API_KEY set
python returns_agent.py "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
python returns_agent.py "Nova Distributors want to return all 10 monitors on SO-7790, changed their mind"
python returns_agent.py "C-1042 says all 3 monitors on SO-7795 are defective and wants to return them"
python workflow.py "arrived damaged"   # same job as a fixed workflow, for comparison
```

Run 1 books a credit note, a stock move and a case. Run 2 is refused (outside window). Run 3 pauses for your `y/n`.
Live-coding on camera: open `agent_starter.py` and follow `../script/live-coding.md`.

## 4. Episode 3 — your first MCP server

```bash
cd episodes/03-first-mcp-server/code
npx @modelcontextprotocol/inspector python server.py     # browser UI to call the tools
python agent_mcp.py "Which open sales orders cannot ship because stock is short, and do those customers have overdue invoices?"
```

Claude Desktop: copy the entry in `claude_desktop_config.example.json` into
`~/Library/Application Support/Claude/claude_desktop_config.json`, replace the paths with absolute ones
(the venv python and `server.py`), restart Claude Desktop, and ask it a question about ACME's stock or invoices.

## 5. Switching tenant

Every tool filters by `ERP_COMPANY` (default `ACME`). `ERP_COMPANY=NORTH python returns_agent.py ...` sees only Northline's data. The model never chooses the tenant — the deployment does. That is the point of Episode 4.

## 6. Troubleshooting

- `connection refused` on 5432 → `docker compose ps`; wait for `healthy`.
- `ModuleNotFoundError: erp` → run from the repo root or the episode's `code/` folder (both add the root to `sys.path`).
- Claude Desktop doesn't list the server → relative path or system python in the config. Use absolute paths and the `.venv` python.
- Agent never calls a tool → read the tool `description`; that is the only thing the model sees.
- Costs: each agent run is 3–6 model calls on Sonnet; well under a cent per run.
