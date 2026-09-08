# T041 Desktop E2E Evidence

Captured: 2026-09-06

Command, executed under Node `24.20.0`:

```bash
npm run test:e2e -- --project=desktop-1024 --project=desktop-1280 --project=desktop-1440
```

Result: **28 passed in 1.3 minutes**. The run used the isolated E2E PostgreSQL database, `APIYI_API_KEY=e2e-disabled`, and an unreachable loopback AI endpoint. Provider calls and image generation/editing endpoint calls: **0**.

## Coverage

Each width ran the same nine workbench checks after the shared authenticated setup:

- unverified prompt variants remain visibly disabled with a precise reason;
- project-center template actions remain reachable;
- project loading remains usable when template loading fails;
- result and project card density remains bounded;
- adding a node does not remount the canvas;
- node drag is one undo transaction with canonical selection;
- edge dragging does not auto-pan the viewport;
- Dock, zoom, canvas geometry, modal focus trap, delayed async responses and focus restoration remain correct;
- theme picker state and focus restoration remain correct.

## Retained Artifacts

- `playwright-report/index.html`
- `test-results/.last-run.json` reports `status=passed` and no failed tests.
- Six attached screenshots are retained in `playwright-report/data/`: two each at 1024x768, 1280x720 and 1440x900. Their SHA-256 values are:
  - 1024x768: `0cb3ec4ac8c876c8f7f4a70de69e4a504a808a1716f4f870ed69fd4afde3661c`, `f6e9dbb89851140ae106d96eb7b2cc79c0fe459e3562e72521eb93808662e93e`
  - 1280x720: `dfd9af66c83a83309afb3acc9ccbb0b237084eb28803d69be081ad1d43524f47`, `d6d4e056e9bbd7a0c537243f010b09b2c2608af4f1b1d7c3b4d98214b7fa0a34`
  - 1440x900: `260ee28a7c5ac70fcd175981ba262cb1b53dd0839951f3399330378616338fde`, `e9faaf27d34d5fc863814ca908dcc135a03930edbaa4ee05c3b8221f56e726d9`

No overlap, focus, readable-error or stale async-response defect was reproduced in these automated desktop scenarios.
