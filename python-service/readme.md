# Dataset Analysis Service (Python)

Phase 1: a straight port of the NestJS `MetricAnalysisService` onto DuckDB's
Python bindings. One endpoint, `/metrics`, takes a CSV plus the LLM's metric
spec and returns computed results — identical in shape to the current Node path,
so you can diff the two before deleting `@duckdb/node-api` from the Nest side.

pandas / scipy / the deep-profiling work land in Phase 2, on top of the same
loaded frame.

## Run

```bash
cd python-service
pip install -r requirements.txt
uvicorn app.main:app --port 8100 --reload
```

`GET /health` → `{"status": "ok"}`

## /metrics

Multipart request:

- `file`: the raw CSV (the "re-send the file" handoff; swap for a Parquet
  handle in Phase 2)
- `spec`: JSON string, camelCase, matching what Nest already builds:

```json
{
  "delimiter": ",",
  "hasHeader": true,
  "columnNames": ["region", "revenue"],
  "cardinality": { "region": 3, "revenue": 6 },
  "metrics": [
    {
      "name": "Total revenue",
      "expression": "SUM(revenue)",
      "confidence": "high",
      "aggregation": "sum",
      "description": "Sum of revenue",
      "requiredColumns": ["revenue"],
      "suggestedBreakdowns": ["region"]
    }
  ]
}
```

Response is a JSON array of `MetricResult` (same fields as the TS interface:
`overall`, `breakdowns`, optional `skipped` / `error`).

## Trust boundary — read before changing metrics.py

`metric.expression` is executed as raw SQL. That is intentional: the LLM emits
SQL-like expressions and DuckDB is the executor. The safety guarantee comes from
one ordering rule in `MetricRunner.run`:

1. `read_csv(...)` loads the file **while** `enable_external_access` is on.
2. `SET enable_external_access=false` locks the connection **before** any
   metric expression runs.

Verified: after step 2, an expression like
`(SELECT COUNT(*) FROM read_csv('/etc/passwd'))` fails with a Permission Error
instead of touching the filesystem. Do not move the `SET` above the load
(read_csv would be blocked), and do not run expressions before it.