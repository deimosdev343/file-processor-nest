TABLE = "dataset"
BREAKDOWN_LIMIT = 50 
# Skip breakdowns on columns with more distinct values than this
# (was MAX_BREAKDOWN_CARDINALITY). Keeps GROUP BYs from exploding.
MAX_BREAKDOWN_CARDINALITY = 100
 
MAX_CORRELATION_COLUMNS = 25   # 25 cols -> 300 pairs -> 600 aggregates in one SELECT
MIN_PAIR_COUNT = 30            # below this an r is noise; drop the pair