
from __future__ import annotations
 
import logging
import math
from decimal import Decimal
 
import duckdb
 
from .config import BREAKDOWN_LIMIT, MAX_BREAKDOWN_CARDINALITY, TABLE
from .models import Breakdown, BreakdownRow, Metric, MetricResult

 
def _quote_ident(name: str) -> str:
    """Double-quote a SQL identifier, escaping embedded quotes. (was `quote`)"""
    return '"' + name.replace('"', '""') + '"'
 
 
def _sql_str(value: str) -> str:
    """Escape a value destined for a single-quoted SQL string literal."""
    return value.replace("'", "''")
 
def _to_num(v: object) -> float | int | None:
  """
    convert duckDB cell to json-friendly number.
    none, infinity -> none
    numbers -> numbers
  """
  if v is None:
    return None
  if isinstance(v, bool):
    return int(v)
  if isinstance(v, int):
    return v
  try:
    n = float(v) if not isinstance(v, Decimal) else float(v)
  except(TypeError, ValueError):
    return None
  if math.isnan(n) or math.isinf(n):
    return n
  