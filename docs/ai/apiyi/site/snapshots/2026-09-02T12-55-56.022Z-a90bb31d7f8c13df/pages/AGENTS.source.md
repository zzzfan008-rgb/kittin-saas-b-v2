> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AGENTS

# Repository Guidelines

## Project Structure & Module Organization

* Content lives in `.mdx` files. Key folders: `api-reference/`, `api-capabilities/`, `scenarios/`, `faq/`, `wiki/`, `essentials/`, `code-demo/`, `images/`, `public/`, `logo/`. Site config is `docs.json`.
* Add new pages under the closest topical folder and reference them in `docs.json` so they appear in navigation.
* Put screenshots in `images/` and static files in `public/`. Keep runnable examples in `code-demo/`.

## Build, Test, and Development Commands

* `npm i -g mintlify` — install Mintlify CLI.
* `mintlify dev` — run local preview from repo root (where `docs.json` is).
* `mintlify install` — reinstall dependencies if preview fails.

## Coding Style & Naming Conventions

* Clear, concise English; prefer active voice and short sentences.
* Use Markdown/MDX idioms. Headings are hierarchical (`#`, `##`, `###`). One H1 per page.
* Filenames: kebab-case, descriptive (e.g., `token-management.mdx`). Images: kebab-case (e.g., `hero-dark.png`).
* Always include alt text for images: `![Alt text](../images/example.png)`.
* Specify language fences for code blocks: `bash, `python, \`\`\`js. Keep lines \< 100 chars when reasonable.

## Testing Guidelines

* No unit tests. Validate via `mintlify dev` with zero errors/warnings.
* Manually verify: internal links, code block rendering, images, tables, and that new pages are linked in `docs.json`.
* Keep demos executable; never hard-code secrets. Use placeholders like `YOUR_API_KEY`.

## Commit & Pull Request Guidelines

* Commits: concise and scoped. Suggested prefixes: `docs:`, `wiki:`, `faq:`, `api-ref:`, `demo:` (e.g., `docs: add token limits guide`).
* PRs must include: brief purpose, affected paths, screenshots for visual changes, and linked issues.
* Keep PRs small and focused. Update `docs.json` and related assets in the same PR.

## Security & Configuration Tips

* Do not commit real API keys or credentials in examples or logs. Redact tokens in images.
* Optimize large assets (>1MB) before adding to `images/`. Prefer `.webp` where acceptable.
