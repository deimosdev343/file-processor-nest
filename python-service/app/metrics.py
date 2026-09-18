
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
    return None
  return n


logger = logging.getLogger("metric-runner")

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
  
  def _run_metric(
    self, con: duckdb.DuckDBPyConnection, metric: Metric, cardinality: dict[str, int]
  ) -> MetricResult:
    base = MetricResult(
      name=metric.name,
      expression=metric.expression,
      confidence=metric.confidence,
      aggregation=metric.aggregation,
      description=metric.description,
      overall=None,
      breakdowns=[],
    )
    missing = [c for c in metric.required_columns if c not in cardinality]
    if missing:
      base.skipped = f"references unknown column(s): {', '.join(missing)}"
      return base

    try: 
      rows = con.execute(
        f"SELECT ({metric.expression}) AS value FROM {TABLE}"
      ).fetchall()
      base.overall = _to_num(rows[0][0]) if rows else None
    except Exception as err:
      base.error = str(err) or "unknown execution error"
      return base
    
    for col in metric.suggested_breakdowns:
      distinct = cardinality.get(col)
      if distinct is None:
        continue
      if distinct > MAX_BREAKDOWN_CARDINALITY:
        continue
      q = _quote_ident(col)
      
      try:
        rows = con.execute(
            f"SELECT {q} AS key, ({metric.expression}) AS value FROM {TABLE} "
            f"GROUP BY {q} ORDER BY value DESC NULLS LAST LIMIT {BREAKDOWN_LIMIT}"
        ).fetchall()
        base.breakdowns.append(
            Breakdown(
                column=col,
                rows=[
                    BreakdownRow(
                        key=None if r[0] is None else str(r[0]),
                        value=_to_num(r[1]),
                    )
                    for r in rows
                ],
            )
        )
      except Exception as err:
        logger.warning(
            "Breakdown %s by %s failed: %s", metric.name, col, err
        )
    return base



