"""
Seed the ERP with deterministic dummy data (fixed random seed, so every viewer sees the same numbers).

    python -m erp.seed              # uses DATABASE_URL (default: local Postgres from docker compose)
    DATABASE_URL=sqlite:///erp.db python -m erp.seed

Two companies (tenants):  ACME  (Hyderabad electronics distributor, INR)  ·  NORTH (Pune industrial supplies, INR)
Volumes:  40 customers · 12 suppliers · 60 items · 4 warehouses · 300 sales orders · ~250 invoices · 30 POs · 40 employees
Fixed cases used on camera:
  SO-7781  ACME / C-1042  delivered 4 days ago, 5 x WH-204 + 2 x KB-110   → small return, auto-approved
  SO-7790  ACME / C-2210  delivered 41 days ago, 10 x MN-27Q              → outside window, refused
  SO-7795  ACME / C-1042  delivered 6 days ago, 3 x MN-27Q                → INR 73,500: needs human approval
"""
from __future__ import annotations

import random
import sys
from datetime import date, timedelta

from sqlalchemy import insert, text

from erp.db import get_engine
from erp.schema import (cases, companies, credit_notes, customers, employees, invoices, items, metadata,
                        purchase_orders, sales_order_lines, sales_orders, stock_levels, stock_moves, suppliers,
                        users, warehouses)

TODAY = date(2026, 10, 12)
rnd = random.Random(42)

COMPANIES = [("ACME", "Acme Electronics Distribution Pvt Ltd", "INR"), ("NORTH", "Northline Industrial Supplies Ltd", "INR")]
CITIES = ["Hyderabad", "Pune", "Chennai", "Bengaluru", "Mumbai", "Delhi", "Kolkata", "Ahmedabad"]
FIRST = ["Meridian", "Nova", "Sunrise", "Apex", "Blue Orchid", "Kaveri", "Vector", "Orbit", "Lotus", "Summit", "Delta", "Pioneer",
         "Saffron", "Granite", "Harbor", "Zenith", "Prime", "Crescent", "Ridge", "Evergreen"]
LAST = ["Retail", "Distributors", "Traders", "Enterprises", "Stores", "Mart", "Supplies", "Systems", "Solutions", "Agencies"]
CATS = {
    "ACME": [("Audio", ["Wireless headset", "Bluetooth speaker", "Earbuds", "Soundbar"]),
             ("Computing", ["Mechanical keyboard", "Wireless mouse", "USB-C dock", "Laptop stand", "Webcam"]),
             ("Displays", ["27in QHD monitor", "24in FHD monitor", "32in 4K monitor", "Monitor arm"]),
             ("Power", ["65W GaN charger", "20000mAh power bank", "Surge protector"])],
    "NORTH": [("Fasteners", ["Hex bolt M8 box", "Hex bolt M12 box", "Washer kit", "Anchor bolt set"]),
              ("Tools", ["Cordless drill", "Angle grinder", "Torque wrench", "Impact driver"]),
              ("Safety", ["Safety helmet", "Cut-resistant gloves", "Safety goggles", "Hi-vis vest"]),
              ("Bearings", ["Deep groove bearing 6204", "Pillow block UCP205", "Tapered bearing 30205"])],
}
PEOPLE = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sara", "Vihaan", "Anaya", "Ishaan", "Priya", "Arjun", "Nisha",
          "Rahul", "Sneha", "Karthik", "Pooja", "Aditya", "Riya", "Manish", "Lakshmi"]
SURN = ["Reddy", "Sharma", "Iyer", "Patel", "Khan", "Nair", "Rao", "Gupta", "Das", "Mehta"]


def d(days_ago: int) -> date:
    return TODAY - timedelta(days=days_ago)


def main(url: str | None = None) -> None:
    eng = get_engine(url)
    metadata.drop_all(eng)
    metadata.create_all(eng)
    rows: dict = {k: [] for k in ["companies", "users", "customers", "suppliers", "items", "warehouses", "stock_levels",
                                   "stock_moves", "sales_orders", "sales_order_lines", "invoices", "credit_notes", "cases",
                                   "purchase_orders", "employees"]}
    cust_n, sup_n, so_n, inv_n, po_n, emp_n, sm_n, case_n, cn_n = 1000, 500, 7000, 30000, 100, 1, 70000, 9000, 40000

    for cid, cname, cur in COMPANIES:
        rows["companies"].append({"id": cid, "name": cname, "currency": cur})
        for role in ["admin", "sales", "finance", "warehouse", "agent"]:
            rows["users"].append({"id": f"{cid.lower()}-{role}", "company_id": cid, "name": f"{role.title()} ({cid})", "role": role})

        # warehouses
        whs = [f"WH-{cid[:1]}1", f"WH-{cid[:1]}2"]
        for w, city in zip(whs, rnd.sample(CITIES, 2)):
            rows["warehouses"].append({"id": w, "company_id": cid, "name": f"{city} DC", "city": city})

        # suppliers
        sups = []
        for _ in range(6):
            sid = f"S-{sup_n}"; sup_n += 1; sups.append(sid)
            rows["suppliers"].append({"id": sid, "company_id": cid, "name": f"{rnd.choice(FIRST)} {rnd.choice(['Components', 'Imports', 'Industries', 'Manufacturing'])}",
                                      "lead_days": rnd.choice([3, 5, 7, 10, 14]), "city": rnd.choice(CITIES)})

        # items (30 per company)
        skus = []
        for cat, names in CATS[cid]:
            for i, n in enumerate(names):
                for variant in (["", " Pro"] if i < 2 else [""]):
                    sku = f"{cat[:2].upper()}-{rnd.randint(100, 999)}"
                    while any(r["sku"] == sku for r in rows["items"]):
                        sku = f"{cat[:2].upper()}-{rnd.randint(100, 999)}"
                    price = rnd.choice([450, 900, 1800, 3200, 5400, 8900, 12500, 24500, 42000])
                    rows["items"].append({"sku": sku, "company_id": cid, "name": n + variant, "category": cat, "unit_price": price,
                                          "unit_cost": round(price * rnd.uniform(0.55, 0.8), 2), "reorder_level": rnd.choice([10, 20, 50]),
                                          "supplier_id": rnd.choice(sups)})
                    skus.append(sku)
        # fixed SKUs for ACME demos
        if cid == "ACME":
            for sku, name, cat, price in [("WH-204", "Wireless headset, over-ear", "Audio", 3200), ("KB-110", "Mechanical keyboard, TKL", "Computing", 5400),
                                          ("MN-27Q", "27in QHD monitor", "Displays", 24500)]:
                rows["items"].append({"sku": sku, "company_id": cid, "name": name, "category": cat, "unit_price": price,
                                      "unit_cost": round(price * 0.7, 2), "reorder_level": 20, "supplier_id": sups[0]})
                skus.append(sku)

        # stock
        for sku in skus:
            for w in whs:
                on_hand = rnd.choice([0, 0, 5, 12, 30, 60, 120, 250])
                rows["stock_levels"].append({"sku": sku, "warehouse_id": w, "on_hand": on_hand, "reserved": min(on_hand, rnd.choice([0, 0, 3, 8]))})

        # customers
        custs = []
        for _ in range(20):
            c = f"C-{cust_n}"; cust_n += 1; custs.append(c)
            rows["customers"].append({"id": c, "company_id": cid, "name": f"{rnd.choice(FIRST)} {rnd.choice(LAST)} Pvt Ltd",
                                      "segment": rnd.choice(["retail", "wholesale", "online", "enterprise"]),
                                      "credit_limit": rnd.choice([200000, 500000, 1000000, 2500000]), "city": rnd.choice(CITIES),
                                      "email": f"accounts@{rnd.choice(FIRST).lower().replace(' ', '')}.example.com"})
        if cid == "ACME":
            for c, name in [("C-1042", "Meridian Retail Pvt Ltd"), ("C-2210", "Nova Distributors Ltd")]:
                rows["customers"].append({"id": c, "company_id": cid, "name": name, "segment": "retail" if c == "C-1042" else "wholesale",
                                          "credit_limit": 500000 if c == "C-1042" else 2000000, "city": "Hyderabad", "email": f"accounts@{name.split()[0].lower()}.example.com"})
                custs.append(c)

        # sales orders + lines + invoices
        for _ in range(150):
            so = f"SO-{so_n}"; so_n += 1
            cust = rnd.choice(custs); wh = rnd.choice(whs)
            age = rnd.randint(1, 120)
            status = rnd.choices(["delivered", "confirmed", "closed", "draft"], [0.55, 0.2, 0.2, 0.05])[0]
            lines, total = [], 0.0
            for sku in rnd.sample(skus, rnd.randint(1, 3)):
                price = next(r["unit_price"] for r in rows["items"] if r["sku"] == sku)
                qty = rnd.choice([1, 2, 3, 5, 10, 20]); total += qty * price
                lines.append({"order_id": so, "sku": sku, "qty": qty, "unit_price": price})
            delivered = d(age - rnd.randint(1, 5)) if status in ("delivered", "closed") else None
            rows["sales_orders"].append({"id": so, "company_id": cid, "customer_id": cust, "order_date": d(age), "delivered_on": delivered,
                                         "status": status, "warehouse_id": wh, "total": total})
            rows["sales_order_lines"].extend(lines)
            if status in ("delivered", "closed"):
                inv = f"INV-{inv_n}"; inv_n += 1
                issued = delivered; due = issued + timedelta(days=30)
                paid = total if status == "closed" or rnd.random() < 0.5 else rnd.choice([0.0, round(total * 0.5, 2)])
                istatus = "paid" if paid >= total else ("overdue" if due < TODAY else "open")
                rows["invoices"].append({"id": inv, "company_id": cid, "customer_id": cust, "order_id": so, "issued_on": issued,
                                         "due_on": due, "amount": total, "paid": paid, "status": istatus})

        # purchase orders
        for _ in range(15):
            po = f"PO-{po_n}"; po_n += 1
            sku = rnd.choice(skus); item = next(r for r in rows["items"] if r["sku"] == sku)
            age = rnd.randint(0, 40)
            rows["purchase_orders"].append({"id": po, "company_id": cid, "supplier_id": item["supplier_id"], "sku": sku, "qty": rnd.choice([50, 100, 200, 500]),
                                            "unit_cost": item["unit_cost"], "ordered_on": d(age), "expected_on": d(age) + timedelta(days=rnd.choice([5, 7, 14])),
                                            "status": rnd.choice(["open", "open", "received", "cancelled"])})

        # employees
        mgr = None
        for i in range(20):
            e = f"E-{emp_n:03d}"; emp_n += 1
            rows["employees"].append({"id": e, "company_id": cid, "name": f"{rnd.choice(PEOPLE)} {rnd.choice(SURN)}",
                                      "department": rnd.choice(["Sales", "Finance", "Warehouse", "Procurement", "HR"]),
                                      "manager_id": mgr if i else None, "leave_balance": rnd.randint(0, 24)})
            if i == 0:
                mgr = e

    # ---- fixed demo orders for ACME (overwrite random ones with the same ids if any) ----
    fixed = [
        ("SO-7781", "C-1042", 4, [("WH-204", 5), ("KB-110", 2)], "INV-30117", 0.0),
        ("SO-7790", "C-2210", 41, [("MN-27Q", 10)], "INV-30044", 245000.0),
        ("SO-7795", "C-1042", 6, [("MN-27Q", 3)], "INV-30131", 0.0),
    ]
    for so, cust, age, lines, inv, paid in fixed:
        rows["sales_orders"] = [r for r in rows["sales_orders"] if r["id"] != so]
        rows["sales_order_lines"] = [r for r in rows["sales_order_lines"] if r["order_id"] != so]
        rows["invoices"] = [r for r in rows["invoices"] if r["id"] != inv and r["order_id"] != so]
        price = {r["sku"]: r["unit_price"] for r in rows["items"]}
        total = sum(q * price[s] for s, q in lines)
        rows["sales_orders"].append({"id": so, "company_id": "ACME", "customer_id": cust, "order_date": d(age + 3), "delivered_on": d(age),
                                     "status": "delivered", "warehouse_id": "WH-A1", "total": total})
        rows["sales_order_lines"].extend({"order_id": so, "sku": s, "qty": q, "unit_price": price[s]} for s, q in lines)
        rows["invoices"].append({"id": inv, "company_id": "ACME", "customer_id": cust, "order_id": so, "issued_on": d(age), "due_on": d(age) + timedelta(days=30),
                                 "amount": total, "paid": paid, "status": "paid" if paid >= total else ("overdue" if d(age) + timedelta(days=30) < TODAY else "open")})

    tables = {"companies": companies, "users": users, "customers": customers, "suppliers": suppliers, "items": items, "warehouses": warehouses,
              "stock_levels": stock_levels, "stock_moves": stock_moves, "sales_orders": sales_orders, "sales_order_lines": sales_order_lines,
              "invoices": invoices, "credit_notes": credit_notes, "cases": cases, "purchase_orders": purchase_orders, "employees": employees}
    with eng.begin() as con:
        for name, tbl in tables.items():
            if rows[name]:
                con.execute(insert(tbl), rows[name])
    with eng.connect() as con:
        counts = {n: con.execute(text(f"SELECT COUNT(*) FROM {n}")).scalar() for n in tables}
    print("seeded:", ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
