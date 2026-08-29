 
from __future__ import annotations
 
import logging
import os
import tempfile
import uuid

 
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
 
from .metrics import MetricRunner
from .models import MetricResult, MetricsRequest
 

logging.basicConfig(level=logging.INFO)
 
app = FastAPI(title="Dataset Analysis Service", version="0.1.0")
runner = MetricRunner()

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
 
@app.post("/metrics", response_model=list[MetricResult])
async def run_metrics(
    file: UploadFile = File(...),
    spec: str = Form(...),
) -> list[MetricResult]:
    try:
        req = MetricsRequest.model_validate_json(spec)
    except ValidationError as err:
        # 422 mirrors how the Nest side treats a malformed analysis contract.
        raise HTTPException(status_code=422, detail=err.errors()) from err
 
    tmp_path = os.path.join(tempfile.gettempdir(), f"ds-{uuid.uuid4()}.csv")
    content = await file.read()
    with open(tmp_path, "wb") as fh:
        fh.write(content)
 
    try:
        return runner.run(
            csv_path=tmp_path,
            delimiter=req.delimiter,
            column_names=req.column_names,
            has_header=req.has_header,
            metrics=req.metrics,
            cardinality=req.cardinality,
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
