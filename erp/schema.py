"""
ERP schema v0 — the tables the first episodes need. Grows one module at a time.

Modules:  core (companies, users)  ·  sales/crm (customers, sales_orders, cases)
          inventory (items, warehouses, stock_levels, stock_moves)  ·  finance (invoices, credit_notes)
          procurement (suppliers, purchase_orders)  ·  hr (employees)

Every business table carries company_id — tenancy is a column from day one, never bolted on.
"""
from sqlalchemy import (Column, Date, ForeignKey, Integer, MetaData, Numeric, String, Table, Text, UniqueConstraint)

metadata = MetaData()

companies = Table("companies", metadata,
    Column("id", String, primary_key=True), Column("name", String, nullable=False), Column("currency", String(3), nullable=False))

users = Table("users", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("role", String, nullable=False))  # admin | sales | finance | warehouse | agent

customers = Table("customers", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("segment", String), Column("credit_limit", Numeric(14, 2)),
    Column("city", String), Column("email", String))

suppliers = Table("suppliers", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("lead_days", Integer), Column("city", String))

items = Table("items", metadata,
    Column("sku", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("category", String), Column("unit_price", Numeric(12, 2), nullable=False),
    Column("unit_cost", Numeric(12, 2)), Column("reorder_level", Integer, default=0), Column("supplier_id", ForeignKey("suppliers.id")))

warehouses = Table("warehouses", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("city", String))

stock_levels = Table("stock_levels", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("sku", ForeignKey("items.sku"), nullable=False), Column("warehouse_id", ForeignKey("warehouses.id"), nullable=False),
    Column("on_hand", Integer, nullable=False, default=0), Column("reserved", Integer, nullable=False, default=0),
    UniqueConstraint("sku", "warehouse_id"))

stock_moves = Table("stock_moves", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("sku", ForeignKey("items.sku"), nullable=False), Column("qty", Integer, nullable=False),
    Column("from_location", String, nullable=False), Column("to_location", String, nullable=False),
    Column("status", String, nullable=False), Column("reason", String), Column("ref_doc", String), Column("moved_on", Date))

sales_orders = Table("sales_orders", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("customer_id", ForeignKey("customers.id"), nullable=False), Column("order_date", Date, nullable=False),
    Column("delivered_on", Date), Column("status", String, nullable=False),  # draft | confirmed | delivered | closed
    Column("warehouse_id", ForeignKey("warehouses.id")), Column("total", Numeric(14, 2)))

sales_order_lines = Table("sales_order_lines", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("order_id", ForeignKey("sales_orders.id"), nullable=False), Column("sku", ForeignKey("items.sku"), nullable=False),
    Column("qty", Integer, nullable=False), Column("unit_price", Numeric(12, 2), nullable=False))

invoices = Table("invoices", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("customer_id", ForeignKey("customers.id"), nullable=False), Column("order_id", ForeignKey("sales_orders.id")),
    Column("issued_on", Date, nullable=False), Column("due_on", Date, nullable=False),
    Column("amount", Numeric(14, 2), nullable=False), Column("paid", Numeric(14, 2), nullable=False, default=0),
    Column("status", String, nullable=False))  # open | paid | overdue

credit_notes = Table("credit_notes", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("invoice_id", ForeignKey("invoices.id"), nullable=False), Column("customer_id", ForeignKey("customers.id"), nullable=False),
    Column("amount", Numeric(14, 2), nullable=False), Column("issued_on", Date, nullable=False), Column("reason", String))

cases = Table("cases", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("customer_id", ForeignKey("customers.id"), nullable=False), Column("order_id", ForeignKey("sales_orders.id")),
    Column("kind", String, nullable=False), Column("note", Text), Column("opened_on", Date, nullable=False), Column("status", String, nullable=False))

purchase_orders = Table("purchase_orders", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("supplier_id", ForeignKey("suppliers.id"), nullable=False), Column("sku", ForeignKey("items.sku"), nullable=False),
    Column("qty", Integer, nullable=False), Column("unit_cost", Numeric(12, 2), nullable=False),
    Column("ordered_on", Date, nullable=False), Column("expected_on", Date), Column("status", String, nullable=False))

employees = Table("employees", metadata,
    Column("id", String, primary_key=True), Column("company_id", ForeignKey("companies.id"), nullable=False),
    Column("name", String, nullable=False), Column("department", String), Column("manager_id", String), Column("leave_balance", Integer, default=0))

RETURN_POLICY = {"window_days": 30, "auto_approve_below": 25000.0,
                 "accepted_reasons": ["damaged", "wrong_item", "defective", "changed_mind"]}
