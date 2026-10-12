"""
Episode 3 — your first MCP server: three read-only tools over the ERP database.

    Inventory  get_item_stock(sku)
    Sales      search_sales_orders(status, customer_id, limit)
    Finance    get_invoice(invoice_id)

Any MCP client — Claude Desktop, the Inspector, or our own agent (agent_mcp.py) — can call them.
Run:       python server.py                      (stdio)
Inspect:   npx @modelcontextprotocol/inspector python server.py
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from mcp.server.fastmcp import FastMCP
from sqlalchemy import select

from erp.db import get_engine
from erp.schema import customers, invoices, items, sales_order_lines, sales_orders, stock_levels, warehouses

COMPANY = os.environ.get("ERP_COMPANY", "ACME")  # tenant filter — set by the deployment, never by the model
MAX_ROWS = 25                                    # the model will ask for everything; the server decides
engine = get_engine()
mcp = FastMCP("erp")


def _j(obj) -> str:
    return json.dumps(obj, default=str, indent=2)


@mcp.tool()
def get_item_stock(sku: str) -> str:
    """Inventory: stock on hand and reserved for one SKU (e.g. 'WH-204') across all warehouses, plus its reorder level.
    Use when asked whether something is in stock, how much is available, or whether it needs reordering."""
    with engine.connect() as con:
        item = con.execute(select(items).where(items.c.sku == sku.strip().upper(), items.c.company_id == COMPANY)).mappings().first()
        if not item:
            return _j({"error": f"item {sku} not found"})
        rows = con.execute(select(warehouses.c.id, warehouses.c.name, stock_levels.c.on_hand, stock_levels.c.reserved)
                           .join(stock_levels, stock_levels.c.warehouse_id == warehouses.c.id)
                           .where(stock_levels.c.sku == item["sku"])).mappings().all()
    total = sum(r["on_hand"] - r["reserved"] for r in rows)
    return _j({"sku": item["sku"], "name": item["name"], "reorder_level": item["reorder_level"], "available_total": total,
               "needs_reorder": total < (item["reorder_level"] or 0), "warehouses": [dict(r) for r in rows]})


@mcp.tool()
def search_sales_orders(status: str = "", customer_id: str = "", limit: int = 10) -> str:
    """Sales: search sales orders. Optional filters combine with AND: status in {draft, confirmed, delivered, closed};
    customer_id like 'C-1042'. limit is capped at 25. Returns newest first with customer name, total and line count."""
    limit = max(1, min(int(limit), MAX_ROWS))
    q = (select(sales_orders.c.id, sales_orders.c.customer_id, customers.c.name.label("customer"), sales_orders.c.order_date,
                sales_orders.c.status, sales_orders.c.total, sales_orders.c.warehouse_id)
         .join(customers, customers.c.id == sales_orders.c.customer_id).where(sales_orders.c.company_id == COMPANY))
    if status:
        q = q.where(sales_orders.c.status == status.strip().lower())
    if customer_id:
        q = q.where(sales_orders.c.customer_id == customer_id.strip().upper())
    q = q.order_by(sales_orders.c.order_date.desc()).limit(limit)
    with engine.connect() as con:
        rows = [dict(r) for r in con.execute(q).mappings().all()]
        for r in rows:
            r["lines"] = [dict(l) for l in con.execute(select(sales_order_lines.c.sku, sales_order_lines.c.qty)
                                                      .where(sales_order_lines.c.order_id == r["id"])).mappings().all()]
    return _j({"count": len(rows), "limit": limit, "results": rows})


@mcp.tool()
def get_invoice(invoice_id: str) -> str:
    """Finance: one invoice (e.g. 'INV-30117') with amount, paid, outstanding, due date and status (open / paid / overdue).
    Use for any question about what a customer owes or whether an invoice is overdue."""
    with engine.connect() as con:
        inv = con.execute(select(invoices).where(invoices.c.id == invoice_id.strip().upper(), invoices.c.company_id == COMPANY)).mappings().first()
    if not inv:
        return _j({"error": f"invoice {invoice_id} not found"})
    d = dict(inv); d["outstanding"] = float(d["amount"]) - float(d["paid"])
    return _j(d)


if __name__ == "__main__":
    mcp.run()
