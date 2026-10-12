"""
Database connection for the ERP.

DATABASE_URL picks the backend:
  postgresql+psycopg://erp:erp@localhost:5432/erp   (default — docker compose up -d)
  sqlite:///erp.db                                   (quick local run, no Docker)
  sqlite:///:memory:                                 (tests)
"""
from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

DEFAULT_URL = "postgresql+psycopg://erp:erp@localhost:5432/erp"


def get_engine(url: str | None = None) -> Engine:
    url = url or os.environ.get("DATABASE_URL", DEFAULT_URL)
    kwargs = {"future": True}
    if url.startswith("sqlite"):
        from sqlalchemy.pool import StaticPool
        kwargs.update(connect_args={"check_same_thread": False}, poolclass=StaticPool)
    return create_engine(url, **kwargs)
