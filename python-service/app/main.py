 
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
 
