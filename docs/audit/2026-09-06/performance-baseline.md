# Performance Baseline

Captured: 2026-09-06T08:36:05.750Z

This is a comparison baseline for T031/T032, not a release approval. It used local PostgreSQL, local Sharp processing, and an isolated Chromium session. Provider calls and image generation/editing endpoints: **0**.

| Surface | Workload | Baseline |
| --- | --- | --- |
| Queue claim | 100 runs / 500 jobs / 20 claims | p95 3.481 ms; queries/claim p95 9 |
| Database transaction | BEGIN + SELECT 1 + COMMIT | p95 1.753 ms; 3 queries/operation |
| Image normalization | 1600x1200, 5771480 input bytes, 7 samples | p95 5625.232 ms; peak RSS delta 27049984 bytes; external delta 14799271 bytes |
| Desktop rendering | 100 nodes at 1280x720 | commit-to-stable-paint p95 245.8 ms; peak JS heap 44700000 bytes |
| Web bundle | 13 JS chunks | initial 515288 bytes / gzip 164400 bytes |

Machine: Apple M4, 10 logical CPUs, Node v24.20.0. Git HEAD b9b051f72fb9e0ce5514f8b646e9e3068ff9359c; dirty=true.
