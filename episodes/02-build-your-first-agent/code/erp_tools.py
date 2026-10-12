"""
Episode 2 — the ERP tools the agent can call. Backed by the ERP database (erp/ package).

Four tools across three modules. Episode 3 puts these behind an MCP server; the loop in returns_agent.py won't change.

    Sales      get_sales_order, check_return_policy
    Approval   request_approval            (human-in-the-loop)
    Inventory  create_return               (restock-pending stock move)
    Finance    create_return               (credit note)
    CRM        create_return               (case note)
"""
from __future__ import annotations

import json
import os
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))  # repo root, so `erp` imports in episodes
from sqlalchemy import func, insert, select, text

from erp.db import get_engine
from erp.schema import RETURN_POLICY, cases, credit_notes, customers, invoices, items, sales_order_lines, sales_orders, stock_moves

COMPANY = os.environ.get("ERP_COMPANY", "ACME")   # tenant — injected by the caller, never chosen by the model
TODAY = date(2026, 10, 12)                        # frozen so the demo numbers match the seed
engine = get_engine()


def _next_id(con, table, prefix: str, start: int) -> str:
    n = con.execute(select(func.count()).select_from(table).where(table.c.company_id == COMPANY)).scalar() or 0
    return f"{prefix}-{start + n + 1}"


def get_sales_order(order_id: str) -> dict:
    """Sales: fetch a sales order with its lines, customer and delivery date."""
    oid = order_id.strip().upper()
    with engine.connect() as con:
        so = con.execute(select(sales_orders).where(sales_orders.c.id == oid, sales_orders.c.company_id == COMPANY)).mappings().first()
        if not so:
            return {"error": f"sales order {order_id} not found"}
        cust = con.execute(select(customers).where(customers.c.id == so["customer_id"])).mappings().first()
        lines = con.execute(select(sales_order_lines.c.sku, sales_order_lines.c.qty, sales_order_lines.c.unit_price, items.c.name)
                            .join(items, items.c.sku == sales_order_lines.c.sku).where(sales_order_lines.c.order_id == oid)).mappings().all()
        inv = con.execute(select(invoices.c.id, invoices.c.status).where(invoices.c.order_id == oid)).mappings().first()
    return {"order_id": oid, "customer": dict(cust), "lines": [dict(l) for l in lines], "delivered_on": so["delivered_on"],
            "status": so["status"], "invoice": dict(inv) if inv else None}


def check_return_policy(order_id: str, sku: str, qty: int, reason: str) -> dict:
    """Sales: check whether a return is allowed and whether a human must approve it."""
    oid = order_id.strip().upper()
    with engine.connect() as con:
        so = con.execute(select(sales_orders).where(sales_orders.c.id == oid, sales_orders.c.company_id == COMPANY)).mappings().first()
        if not so:
            return {"error": "sales order not found"}
        line = con.execute(select(sales_order_lines).where(sales_order_lines.c.order_id == oid, sales_order_lines.c.sku == sku)).mappings().first()
    if not line:
        return {"eligible": False, "reason": f"{sku} is not on {oid}"}
    if qty > line["qty"]:
        return {"eligible": False, "reason": f"only {line['qty']} units of {sku} were sold on this order"}
    if not so["delivered_on"]:
        return {"eligible": False, "reason": "order not delivered yet"}
    days = (TODAY - so["delivered_on"]).days
    value = float(qty * line["unit_price"])
    ok_reason = reason in RETURN_POLICY["accepted_reasons"]
    return {"eligible": days <= RETURN_POLICY["window_days"] and ok_reason, "days_since_delivery": days,
            "window_days": RETURN_POLICY["window_days"], "return_value": value, "reason_accepted": ok_reason,
            "needs_human_approval": value >= RETURN_POLICY["auto_approve_below"]}


def request_approval(order_id: str, summary: str) -> dict:
    """Approval: pause and ask a human. Irreversible or high-value actions never run without one."""
    print(f"\n[APPROVAL NEEDED] {order_id}: {summary}")
    answer = input("Approve this return? (y/n): ").strip().lower()
    return {"approved": answer == "y"}


def create_return(order_id: str, sku: str, qty: int, reason: str) -> dict:
    """Inventory + Finance + CRM: book the return in one transaction."""
    oid = order_id.strip().upper()
    with engine.begin() as con:
        so = con.execute(select(sales_orders).where(sales_orders.c.id == oid, sales_orders.c.company_id == COMPANY)).mappings().first()
        line = con.execute(select(sales_order_lines).where(sales_order_lines.c.order_id == oid, sales_order_lines.c.sku == sku)).mappings().first()
        inv = con.execute(select(invoices).where(invoices.c.order_id == oid)).mappings().first()
        if not (so and line and inv):
            return {"error": "order, line or invoice not found"}
        value = float(qty * line["unit_price"])
        cn_id = _next_id(con, credit_notes, "CN", 40000)
        sm_id = _next_id(con, stock_moves, "SM", 70000)
        case_id = _next_id(con, cases, "CASE", 9000)
        con.execute(insert(credit_notes).values(id=cn_id, company_id=COMPANY, invoice_id=inv["id"], customer_id=so["customer_id"],
                                                amount=value, issued_on=TODAY, reason=reason))
        con.execute(insert(stock_moves).values(id=sm_id, company_id=COMPANY, sku=sku, qty=qty, from_location="customer", to_location="RETURNS-QC",
                                               status="restock_pending", reason=reason, ref_doc=oid, moved_on=TODAY))
        con.execute(insert(cases).values(id=case_id, company_id=COMPANY, customer_id=so["customer_id"], order_id=oid, kind="return",
                                         note=f"Return of {qty} x {sku} ({reason}). {cn_id} issued against {inv['id']}; {sm_id} created.",
                                         opened_on=TODAY, status="open"))
    print(f"\n[FINANCE]   credit note {cn_id}  {value:,.0f} against {inv['id']}")
    print(f"[INVENTORY] stock move  {sm_id}  {qty} x {sku} -> RETURNS-QC (restock_pending)")
    print(f"[CRM]       case        {case_id}")
    return {"ok": True, "credit_note": cn_id, "stock_move": sm_id, "case": case_id, "amount": value}


TOOLS = [
    {"name": "get_sales_order",
     "description": "Fetch a sales order (format 'SO-7781') with its lines, customer, delivery date and invoice. Always call this first.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}},
    {"name": "check_return_policy",
     "description": "Check if returning qty of sku from an order is allowed (return window, accepted reason, quantity sold) and whether a human must approve. Call before any return.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "sku": {"type": "string"}, "qty": {"type": "integer"},
                      "reason": {"type": "string", "enum": RETURN_POLICY["accepted_reasons"]}}, "required": ["order_id", "sku", "qty", "reason"]}},
    {"name": "request_approval",
     "description": "Ask a human to approve a return. Use only when check_return_policy says needs_human_approval is true. Do not proceed unless approved.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "summary": {"type": "string"}}, "required": ["order_id", "summary"]}},
    {"name": "create_return",
     "description": "Book the return: credit note (Finance), restock-pending stock move (Inventory), case note (CRM). Only when eligible and, if required, approved.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}, "sku": {"type": "string"}, "qty": {"type": "integer"},
                      "reason": {"type": "string"}}, "required": ["order_id", "sku", "qty", "reason"]}},
]
HANDLERS = {"get_sales_order": get_sales_order, "check_return_policy": check_return_policy,
            "request_approval": request_approval, "create_return": create_return}


def dumps(obj) -> str:
    return json.dumps(obj, default=str)
