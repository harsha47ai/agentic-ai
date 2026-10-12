"""
LIVE-CODING STARTER — Episode 2.
The DB helper is pre-written. You type: the FastMCP instance, three @mcp.tool() functions, and mcp.run().
The finished version is server.py.
"""
import json
import sqlite3
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DB = Path(__file__).parent / "trade_orders.db"
MAX_ROWS = 25


def _query(sql: str, params: tuple = ()) -> list[dict]:
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in con.execute(sql, params).fetchall()]
    finally:
        con.close()


# TODO 1 — create the server:  mcp = FastMCP("trade-orders")


# TODO 2 — get_order(order_id) -> str   (docstring = what the model reads!)


# TODO 3 — search_shipments(status="", dest_port="", min_delay_days=0, limit=10) -> str  (cap limit at MAX_ROWS)


# TODO 4 — lookup_hs_code(description) -> str


# TODO 5 — run it
if __name__ == "__main__":
    pass
