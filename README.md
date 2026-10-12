# Arthashastra Learning — The Agentic Enterprise

An open-source **agentic ERP**, built in public one episode at a time. Every module ships with its agents, its MCP server and its guardrails. Examples come from inventory, sales/CRM, procurement, finance and HR.

**Start here → [INSTRUCTIONS.md](INSTRUCTIONS.md)** (setup, Postgres, dummy data, running each episode).

## Episodes

| # | Episode | Folder | Status |
| --- | --- | --- | --- |
| 1 | What an AI agent actually is — and isn't — in enterprise software | `episodes/01-what-is-an-agent/` | slides |
| 2 | Build your first AI agent: a sales-returns agent for the ERP | `episodes/02-build-your-first-agent/` | code + run sheet |
| 3 | Build your first MCP server for the ERP (Inventory · Sales · Finance) | `episodes/03-first-mcp-server/` | code + run sheet |
| 4 | Where agents sit in a multi-tenant ERP | `episodes/04-…` | planned |

Each episode folder has `slides/`, `script/` (the live-coding run sheet), `code/` and `assets/`. The full 28-episode roadmap is in the Issues tab (`scripts/create_issues.sh` creates them).

## The ERP

```
erp/            shared data layer every episode builds on
  schema.py     tables for core, sales/crm, inventory, finance, procurement, hr — company_id on every business table
  seed.py       deterministic dummy data: 2 companies, 42 customers, 50 items, 303 sales orders, 222 invoices, …
  db.py         DATABASE_URL → Postgres (docker compose) or SQLite
docker-compose.yml   Postgres 16
```

| Module | Tables today | Agents (episode) |
| --- | --- | --- |
| Core | companies, users | identity (15), tenancy (4) |
| Sales / CRM | customers, sales_orders, sales_order_lines, cases | returns agent (2), lead triage (later) |
| Inventory | items, warehouses, stock_levels, stock_moves | reorder agent (6) |
| Finance | invoices, credit_notes | invoice matching (12), reconciliation (26) |
| Procurement | suppliers, purchase_orders | supplier search, PO approval (6–8) |
| HR | employees | leave approvals (reserve) |

Stack: Python 3.11, SQLAlchemy, Postgres, Claude API, MCP. MIT licence.

## Links

[LINKS.md](LINKS.md) — the reading list behind each episode.
