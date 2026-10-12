"""Tool tests that need no API key. They seed a throwaway SQLite DB:  python -m pytest -q"""
import builtins
import os
import sys
from pathlib import Path

os.environ["DATABASE_URL"] = f"sqlite:///{Path(__file__).parent / '.test-erp.db'}"
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from erp import seed  # noqa: E402

seed.main(os.environ["DATABASE_URL"])
import erp_tools as t  # noqa: E402


def test_order_lookup():
    so = t.get_sales_order("so-7781")
    assert so["customer"]["id"] == "C-1042" and len(so["lines"]) == 2 and so["invoice"]["id"] == "INV-30117"


def test_small_return_auto_approves():
    p = t.check_return_policy("SO-7781", "WH-204", 2, "damaged")
    assert p["eligible"] and not p["needs_human_approval"] and p["return_value"] == 6400.0


def test_outside_window_is_refused():
    p = t.check_return_policy("SO-7790", "MN-27Q", 10, "changed_mind")
    assert not p["eligible"] and p["days_since_delivery"] == 41


def test_large_recent_return_needs_human():
    p = t.check_return_policy("SO-7795", "MN-27Q", 3, "defective")
    assert p["eligible"] and p["needs_human_approval"] and p["return_value"] == 73500.0


def test_cannot_return_more_than_sold():
    assert not t.check_return_policy("SO-7781", "WH-204", 6, "damaged")["eligible"]


def test_create_return_writes_three_documents():
    out = t.create_return("SO-7781", "WH-204", 1, "damaged")
    assert out["ok"] and out["amount"] == 3200.0 and out["credit_note"].startswith("CN-") and out["stock_move"].startswith("SM-")


def test_approval_reads_input(monkeypatch):
    monkeypatch.setattr(builtins, "input", lambda _: "y")
    assert t.request_approval("SO-7795", "test")["approved"]
