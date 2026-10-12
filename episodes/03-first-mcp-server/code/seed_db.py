"""
Episode 2 — seed a SQLite database that stands in for an enterprise order-management system.

Tables: orders, shipments, hs_codes. ~200 deterministic rows (fixed random seed).
Run once:  python seed_db.py
"""
import random
import sqlite3
from datetime import date, timedelta
from pathlib import Path

DB = Path(__file__).parent / "trade_orders.db"
random.seed(42)

HS_CODES = [
    ("0304.62", "Frozen catfish (pangasius) fillets", 30.0),
    ("0306.17", "Frozen shrimps and prawns", 30.0),
    ("1006.30", "Semi-milled or wholly milled rice", 70.0),
    ("0902.30", "Black tea, fermented, in packs <= 3 kg", 100.0),
    ("0904.11", "Pepper, neither crushed nor ground", 70.0),
    ("5205.11", "Cotton yarn, single, uncombed", 10.0),
    ("8471.30", "Portable digital computers (laptops)", 0.0),
    ("8517.12", "Telephones for cellular networks", 15.0),
    ("3004.90", "Medicaments, measured doses", 10.0),
    ("8708.99", "Motor vehicle parts and accessories", 15.0),
]
PORTS = ["Chennai", "Nhava Sheva", "Mundra", "Visakhapatnam", "Kolkata"]
ORIGINS = ["Ho Chi Minh City", "Shanghai", "Singapore", "Dubai", "Rotterdam", "Colombo"]
CUSTOMERS = [f"C-{1000 + i}" for i in range(25)]
STATUSES = ["booked", "in_transit", "at_port", "customs_hold", "delivered"]


def main() -> None:
    if DB.exists():
        DB.unlink()
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.executescript(
        """
        CREATE TABLE hs_codes (code TEXT PRIMARY KEY, description TEXT NOT NULL, basic_duty_pct REAL NOT NULL);
        CREATE TABLE orders (
            order_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, hs_code TEXT NOT NULL REFERENCES hs_codes(code),
            qty_mt REAL NOT NULL, value_usd REAL NOT NULL, order_date TEXT NOT NULL, status TEXT NOT NULL
        );
        CREATE TABLE shipments (
            shipment_id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(order_id),
            origin_port TEXT NOT NULL, dest_port TEXT NOT NULL, container_no TEXT NOT NULL,
            etd TEXT NOT NULL, eta TEXT NOT NULL, status TEXT NOT NULL, delay_days INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX ix_ship_status ON shipments(status);
        CREATE INDEX ix_ship_dest ON shipments(dest_port);
        """
    )
    cur.executemany("INSERT INTO hs_codes VALUES (?,?,?)", HS_CODES)

    start = date(2026, 6, 1)
    for i in range(120):
        code, _, _ = random.choice(HS_CODES)
        qty = round(random.uniform(5, 80), 1)
        value = round(qty * random.uniform(800, 4000), 2)
        od = start + timedelta(days=random.randint(0, 110))
        status = random.choice(["open", "shipped", "closed"])
        cur.execute("INSERT INTO orders VALUES (?,?,?,?,?,?,?)",
                    (f"A-{7000 + i}", random.choice(CUSTOMERS), code, qty, value, od.isoformat(), status))
        if status != "open":
            etd = od + timedelta(days=random.randint(3, 15))
            eta = etd + timedelta(days=random.randint(10, 30))
            sstatus = "delivered" if status == "closed" else random.choice(STATUSES[:4])
            delay = random.choice([0, 0, 0, 2, 4, 7, 12]) if sstatus != "delivered" else 0
            cur.execute("INSERT INTO shipments VALUES (?,?,?,?,?,?,?,?,?)",
                        (f"S-{9000 + i}", f"A-{7000 + i}", random.choice(ORIGINS), random.choice(PORTS),
                         f"MSKU{random.randint(1000000, 9999999)}", etd.isoformat(), eta.isoformat(), sstatus, delay))
    con.commit()
    n_o = cur.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    n_s = cur.execute("SELECT COUNT(*) FROM shipments").fetchone()[0]
    print(f"seeded {DB.name}: {len(HS_CODES)} hs_codes, {n_o} orders, {n_s} shipments")
    con.close()


if __name__ == "__main__":
    main()
