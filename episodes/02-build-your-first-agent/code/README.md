# Episode 2 code — build your first AI agent

A sales-returns agent for the ERP. One return touches three modules: **Sales** (order, case), **Inventory** (restock-pending move), **Finance** (credit note).

| File | What it is |
| --- | --- |
| `erp_tools.py` | The four ERP tools, backed by the ERP database (`erp/` package). Pre-written; the model reads the `description` fields. |
| `returns_agent.py` | The agent: a ~15-line loop over the tools, capped by `MAX_STEPS`. |
| `agent_starter.py` | Live-coding version: same file with three TODOs where the loop goes. |
| `workflow.py` | The same job as a fixed workflow, for the side-by-side on camera. |
| `test_erp_tools.py` | Tool tests that run without an API key (they seed a throwaway SQLite DB). |

```bash
# one-time setup is in INSTRUCTIONS.md at the repo root (Postgres + seed)
python -m pytest -q                                   # tools work, no key needed
export ANTHROPIC_API_KEY=sk-ant-...
python returns_agent.py "Customer C-1042 wants to return 2 units of WH-204 from SO-7781, arrived damaged"
python returns_agent.py "Nova Distributors want to return all 10 monitors on SO-7790, changed their mind"
```

Case 1 (SO-7781): 4 days old, INR 6,400 → eligible, auto-approved → credit note + stock move + case note.
Case 2 (SO-7790): 41 days old → outside window → the agent refuses politely and books nothing.
Case 3 (SO-7795, INR 73,500): over the auto-approve threshold → `request_approval` waits for your `y`.

Episode 3 puts the same database behind an MCP server — the loop in `returns_agent.py` does not change.
