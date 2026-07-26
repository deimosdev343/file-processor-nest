import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { parse } from 'csv-parse/sync';

import datasetAnalysisConfig from './data-analysis.config';
import { ColumnProfile, DatasetProfile, InferredType } from './interfaces/dataset.profile';

//regex for checking whether field is a date
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/;

//set for checking if field is boolean
const BOOL_SET = new Set(['true', 'false', 'yes', 'no', '0', '1', 't', 'f']);
const TYPE_SAMPLE_LIMIT = 5_000;
