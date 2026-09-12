# Upload Normalization Optimization

Captured: 2026-09-06T09:07:23.605Z

The deterministic 1600x1200 high-entropy fixture was processed locally. Provider calls and image generation/editing endpoints: **0**.

| Encoder | Samples | p95 | Output bytes | Output dimensions |
| --- | ---: | ---: | ---: | --- |
| Legacy mozjpeg | 3 | 5597.935 ms | 1452662 | 1241x931 |
| Default libjpeg | 3 | 299.507 ms | 1469374 | 1204x903 |

p95 reduction: 94.65% (18.69x). Output remains JPEG, uses the same quality range and 4:4:4 chroma subsampling, and remains below 1500000 bytes.

Rollback: set `UPLOAD_NORMALIZATION_MOZJPEG=true` and restart the service. No database or stored-document migration is required.
