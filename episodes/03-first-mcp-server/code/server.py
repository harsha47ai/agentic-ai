"""
Episode 2 — your first MCP server for an enterprise data source.

Exposes three READ-ONLY tools over a SQLite order-management DB (see seed_db.py).
Any MCP client — Claude Desktop, the Inspector, or our own agent (agent_mcp.py) — can call them.

Run:         python server.py                      (stdio transport)
Inspect:     npx @modelcontextprotocol/inspector python server.py
"""
import json
import sqlite3
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DB = Path(__file__).parent / "trade_orders.db"
MAX_ROWS = 25  # enterprise rule: the model will ask for everything; never hand it everything

mcp = FastMCP("trade-orders")


def _query(sql: str, params: tuple = ()) -> list[dict]:
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)  # read-only connection, by design
    con.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in con.execute(sql, params).fetchall()]
    finally:
        con.close()


@mcp.tool()
def get_order(order_id: str) -> str:
    """Fetch one order by its id (format 'A-7001') with its HS code description and any linked shipment.
    Use this when the user names a specific order. Returns JSON, or an error field if not found."""
    rows = _query(
        """SELECT o.*, h.description AS hs_description, h.basic_duty_pct,
                  s.shipment_id, s.origin_port, s.dest_port, s.eta, s.status AS shipment_status, s.delay_days
           FROM orders o JOIN hs_codes h ON h.code = o.hs_code
           LEFT JOIN shipments s ON s.order_id = o.order_id
           WHERE o.order_id = ?""",
        (order_id.strip().upper(),),
    )
    return json.dumps(rows[0] if rows else {"error": f"order {order_id} not found"}, indent=2)


@mcp.tool()
def search_shipments(status: str = "", dest_port: str = "", min_delay_days: int = 0, limit: int = 10) -> str:
    """Search shipments. Filters are optional and combine with AND:
    status in {booked, in_transit, at_port, customs_hold, delivered}; dest_port e.g. 'Chennai';
    min_delay_days to find delayed shipments. limit is capped at 25. Returns a JSON list, newest ETA first."""
    limit = max(1, min(int(limit), MAX_ROWS))
    where, params = ["1=1"], []
    if status:
        where.append("s.status = ?"); params.append(status.strip().lower())
    if dest_port:
        where.append("LOWER(s.dest_port) = ?"); params.append(dest_port.strip().lower())
    if min_delay_days:
        where.append("s.delay_days >= ?"); params.append(int(min_delay_days))
    rows = _query(
        f"""SELECT s.shipment_id, s.order_id, o.customer_id, s.origin_port, s.dest_port, s.eta, s.status, s.delay_days
            FROM shipments s JOIN orders o ON o.order_id = s.order_id
            WHERE {' AND '.join(where)} ORDER BY s.eta DESC LIMIT ?""",
        (*params, limit),
    )
    return json.dumps({"count": len(rows), "limit": limit, "results": rows}, indent=2)


@mcp.tool()
def lookup_hs_code(description: str) -> str:
    """Find HS codes whose description matches a product keyword (e.g. 'shrimp', 'rice', 'laptop').
    Returns code, description and basic customs duty %. Use before answering any duty or classification question."""
    rows = _query(
        "SELECT code, description, basic_duty_pct FROM hs_codes WHERE LOWER(description) LIKE ? LIMIT ?",
        (f"%{description.strip().lower()}%", MAX_ROWS),
    )
    return json.dumps(rows if rows else {"error": f"no HS code matches '{description}'"}, indent=2)


if __name__ == "__main__":
    mcp.run()
