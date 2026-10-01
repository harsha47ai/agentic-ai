# The Agentic Enterprise

Code, slides and scripts for the YouTube series **The Agentic Enterprise** — building agentic AI that survives real enterprise software: tenancy, permissions, data and ROI included.

| # | Episode | Folder |
| --- | --- | --- |
| 1 | What an AI agent actually is — and isn't — in enterprise software | `01-what-is-an-agent/` |
| 2 | Build your first MCP server for an enterprise data source | `02-first-mcp-server/` (coming) |
| 3 | An export-compliance agent in 20 minutes | `03-export-compliance-agent/` (coming) |
| 4 | Where agents sit in a multi-tenant SaaS | `04-agents-in-multitenant-saas/` (coming) |

Each episode folder has `slides/`, `script/`, `code/` and `assets/`.

## Quick start (Episode 1 basic agent)

```bash
cd 01-what-is-an-agent/code
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
python basic_agent.py "Customer 1042 wants a refund for order A-7781, it arrived damaged"
```

## Episode backlog

Tracked as GitHub issues. To create them after pushing: `scripts/create_issues.sh` (needs the GitHub CLI, `brew install gh`).

## Links

See [LINKS.md](LINKS.md) for the reading list behind each episode.
