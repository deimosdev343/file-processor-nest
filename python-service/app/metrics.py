
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
  
class MetricRunner:
  def run(
        self,
        csv_path: str,
        delimiter: str,
        column_names: list[str],
        has_header: bool,
        metrics: list[Metric],
        cardinality: dict[str, int]
  ) -> list[MetricResult]:
    con = duckdb.connect(":memory:")
    path = _sql_str(csv_path)
    delim = _sql_str(delimiter)
    names = ", ".join("'" + _sql_str(n) + "'" for n in column_names)
    con.execute(
      f"CREATE TABLE {TABLE} AS SELECT * FROM read_csv('{path}', "
      f"delim='{delim}', header={'true' if has_header else 'false'}, "
      f"names=[{names}], ignore_errors=true)"
    )
    con.execute("SET enable_external_access=false")
    results =  [self._run_metric(con, m, cardinality) for m in metrics]
    con.close()
    return results
