# gate-check

Run the local delivery pre-checks (advisory; GitHub Actions stays authoritative).

Iteration:

- Focused tests for changed files + `tsc --noEmit`.
- `ast-grep scan --config sgconfig.yml src server scripts e2e`
- `npx depcruise --config .dependency-cruiser.cjs src server scripts e2e`

Delivery:

- `npm run check`, `npm run build`, `git diff --check`, plus both scans.
- Report degraded gates; never claim them passed.
