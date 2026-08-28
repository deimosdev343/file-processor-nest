from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field
 
class _Camel(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

class Metric(_Camel):
  name: str
  expression: str
  confidence: str
  aggregation: str
  description: str
  required_columns: list[str] = Field(alias="requiredColumns")
  suggested_breakdowns: list[str] = Field(alias="suggestedBreakdowns")

class MetricsRequest(_Camel):
  delimiter: str
  has_header: bool = Field(alias="hasHeader")
  column_names: list[str] = Field(alias="columnNames")
  metrics: list[Metric]
  cardinality: dict[str, int]
    
 
 
class BreakdownRow(_Camel):
  key: str | None
  value: float | None

class Breakdown(_Camel):
  column: str
  rows: list[BreakdownRow]

class MetricResult(_Camel):
  name: str
  expression: str
  confidence: str
  aggregation: str
  description: str
  overall: float | None = None
  breakdowns: list[Breakdown] = Field(default_factory=list)
  # Present only when the metric couldn't run; mirrors the TS optionals.
  skipped: str | None = None
  error: str | None = None
 
 
 


  