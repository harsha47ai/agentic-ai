"""
Tests for the AGENT LOOP in returns_agent.py (not just the tools).

Two layers:
  1. Scripted model (no API key): a fake Anthropic client plays the model and returns a fixed sequence of
     tool calls. This checks the loop does plan → act → observe → repeat, feeds results back, stops on
     end_turn, respects MAX_STEPS, and really writes to the ERP database. Runs in CI.
  2. Live model (needs ANTHROPIC_API_KEY): the real model on the three on-camera cases. Skipped without a key.

Run:  python -m pytest -q
"""
from __future__ import annotations

import builtins
import json
import os
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

os.environ.setdefault("DATABASE_URL", f"sqlite:///{Path(__file__).parent / '.test-erp.db'}")
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from erp import seed  # noqa: E402

seed.main(os.environ["DATABASE_URL"])

import erp_tools  # noqa: E402
import returns_agent  # noqa: E402


# ---------------------------------------------------------------- scripted model
def _text(t):
    return SimpleNamespace(type="text", text=t)


def _tool(name, inp, i):
    return SimpleNamespace(type="tool_use", id=f"toolu_{i}", name=name, input=inp)


class ScriptedClient:
    """Plays the model: each entry in `turns` is what the model 'says' on that call."""

    def __init__(self, turns):
        self.turns = list(turns)
        self.calls = []  # every messages.create() call, so tests can inspect what the model was shown

        client = self

        class _Messages:
            def create(self, **kw):
                client.calls.append({**kw, "messages": list(kw["messages"])})  # snapshot: the loop grows the list in place
                if not client.turns:
                    raise AssertionError("model called more times than scripted")
                content = client.turns.pop(0)
                stop = "tool_use" if any(b.type == "tool_use" for b in content) else "end_turn"
                return SimpleNamespace(content=content, stop_reason=stop)

        self.messages = _Messages()


def run_with(monkeypatch, turns, goal="return 2 x WH-204 from SO-7781, damaged"):
    client = ScriptedClient(turns)
    monkeypatch.setattr(returns_agent.anthropic, "Anthropic", lambda: client)
    return returns_agent.run(goal), client


# ---------------------------------------------------------------- loop behaviour
def test_happy_path_books_the_return(monkeypatch):
    before = erp_tools.get_sales_order("SO-7781")
    out, client = run_with(monkeypatch, [
        [_tool("get_sales_order", {"order_id": "SO-7781"}, 1)],
        [_tool("check_return_policy", {"order_id": "SO-7781", "sku": "WH-204", "qty": 2, "reason": "damaged"}, 2)],
        [_tool("create_return", {"order_id": "SO-7781", "sku": "WH-204", "qty": 2, "reason": "damaged"}, 3)],
        [_text("Return booked. Credit note issued against INV-30117.")],
    ])
    assert out.startswith("Return booked")
    assert len(client.calls) == 4                      # 3 tool rounds + the final answer
    # every call sees the system prompt, the tools and the growing history
    assert all(c["system"] == returns_agent.SYSTEM and c["tools"] is erp_tools.TOOLS for c in client.calls)
    assert [len(c["messages"]) for c in client.calls] == [1, 3, 5, 7]
    # the tool RESULT of step 1 was fed back as a user turn before step 2
    fed_back = json.loads(client.calls[1]["messages"][2]["content"][0]["content"])
    assert fed_back["customer"]["id"] == "C-1042" and fed_back["invoice"]["id"] == "INV-30117"
    # and the ERP really changed: a credit note now exists for that invoice
    from sqlalchemy import select
    from erp.schema import credit_notes
    with erp_tools.engine.connect() as con:
        cns = con.execute(select(credit_notes).where(credit_notes.c.invoice_id == "INV-30117")).mappings().all()
    assert cns and float(cns[-1]["amount"]) == 6400.0
    assert before["invoice"]["id"] == "INV-30117"


def test_stops_when_model_gives_final_text(monkeypatch):
    out, client = run_with(monkeypatch, [[_text("Nothing to do.")]])
    assert out == "Nothing to do." and len(client.calls) == 1


def test_refusal_path_books_nothing(monkeypatch):
    from sqlalchemy import func, select
    from erp.schema import credit_notes
    with erp_tools.engine.connect() as con:
        n_before = con.execute(select(func.count()).select_from(credit_notes)).scalar()
    out, client = run_with(monkeypatch, [
        [_tool("get_sales_order", {"order_id": "SO-7790"}, 1)],
        [_tool("check_return_policy", {"order_id": "SO-7790", "sku": "MN-27Q", "qty": 10, "reason": "changed_mind"}, 2)],
        [_text("Outside the 30-day window; nothing booked.")],
    ], goal="return all 10 monitors on SO-7790, changed mind")
    policy = json.loads(client.calls[2]["messages"][4]["content"][0]["content"])
    assert policy["eligible"] is False and policy["days_since_delivery"] == 41
    with erp_tools.engine.connect() as con:
        assert con.execute(select(func.count()).select_from(credit_notes)).scalar() == n_before
    assert "nothing booked" in out.lower()


def test_approval_path_waits_for_a_human(monkeypatch):
    asked = []
    monkeypatch.setattr(builtins, "input", lambda prompt: (asked.append(prompt), "y")[1])
    out, client = run_with(monkeypatch, [
        [_tool("get_sales_order", {"order_id": "SO-7795"}, 1)],
        [_tool("check_return_policy", {"order_id": "SO-7795", "sku": "MN-27Q", "qty": 3, "reason": "defective"}, 2)],
        [_tool("request_approval", {"order_id": "SO-7795", "summary": "3 x MN-27Q, INR 73,500"}, 3)],
        [_tool("create_return", {"order_id": "SO-7795", "sku": "MN-27Q", "qty": 3, "reason": "defective"}, 4)],
        [_text("Approved and booked.")],
    ], goal="all 3 monitors on SO-7795 are defective")
    assert asked, "the loop never paused for a human"
    approval = json.loads(client.calls[3]["messages"][6]["content"][0]["content"])
    assert approval["approved"] is True and out == "Approved and booked."


def test_declined_approval_is_fed_back(monkeypatch):
    monkeypatch.setattr(builtins, "input", lambda _: "n")
    out, client = run_with(monkeypatch, [
        [_tool("request_approval", {"order_id": "SO-7795", "summary": "x"}, 1)],
        [_text("Declined by approver; nothing booked.")],
    ])
    assert json.loads(client.calls[1]["messages"][2]["content"][0]["content"])["approved"] is False


def test_parallel_tool_calls_in_one_turn_all_run(monkeypatch):
    out, client = run_with(monkeypatch, [
        [_tool("get_sales_order", {"order_id": "SO-7781"}, 1), _tool("get_sales_order", {"order_id": "SO-7795"}, 2)],
        [_text("done")],
    ])
    results = client.calls[1]["messages"][2]["content"]
    assert [r["tool_use_id"] for r in results] == ["toolu_1", "toolu_2"]


def test_step_limit_stops_a_runaway_loop(monkeypatch):
    monkeypatch.setattr(returns_agent, "MAX_STEPS", 3)
    out, client = run_with(monkeypatch, [[_tool("get_sales_order", {"order_id": "SO-7781"}, i)] for i in range(10)])
    assert out.startswith("Stopped: step limit") and len(client.calls) == 3


# ---------------------------------------------------------------- live model
needs_key = pytest.mark.skipif(not os.environ.get("ANTHROPIC_API_KEY"), reason="set ANTHROPIC_API_KEY for the live test")


@needs_key
def test_live_books_small_return(monkeypatch):
    monkeypatch.setattr(builtins, "input", lambda _: "y")
    out = returns_agent.run("Customer C-1042 wants to return 1 unit of WH-204 from SO-7781, arrived damaged")
    assert "CN-" in out or "credit" in out.lower()


@needs_key
def test_live_refuses_outside_window():
    out = returns_agent.run("Nova Distributors want to return all 10 monitors on SO-7790, changed their mind")
    assert "CN-" not in out and ("window" in out.lower() or "not eligible" in out.lower() or "cannot" in out.lower())
