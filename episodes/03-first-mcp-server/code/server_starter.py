"""
LIVE-CODING STARTER — Episode 3. Imports and helpers pre-written; you type the FastMCP instance,
three @mcp.tool() functions and mcp.run(). Finished version: server.py.
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

COMPANY = os.environ.get("ERP_COMPANY", "ACME")
MAX_ROWS = 25
engine = get_engine()


def _j(obj) -> str:
    return json.dumps(obj, default=str, indent=2)


# TODO 1 — mcp = FastMCP("erp")

# TODO 2 — get_item_stock(sku) -> str          (Inventory; docstring is what the model reads)

# TODO 3 — search_sales_orders(status="", customer_id="", limit=10) -> str   (Sales; cap limit at MAX_ROWS)

# TODO 4 — get_invoice(invoice_id) -> str      (Finance)

# TODO 5 — run it
if __name__ == "__main__":
    pass
