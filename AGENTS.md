# AGENTS.md

Guidance for humans and AI assistants working in this repository.

## Git commit message convention

Use a **type prefix**, then **author**, then **summary**. One line is preferred for the subject; add a body after a blank line when needed.

The middle segment is the **committer’s display name** (who is making the commit). It is **not** fixed text—use your own name or the name you use for this repo (e.g. match `git config user.name` or a team-agreed spelling). Examples below use `Bruce Zhang` only as a placeholder.

### Format

```text
<type> - <author> - <summary>
```

Examples (replace `<author>` with the actual committer):

- `feat - Bruce Zhang - separate skill content into schema-driven Markdown assets`
- `fix - Zhang - correct harness version sync on update`
- `docs - Bruce Zhang - document sparrow-ddd schema layout`

### Types

| Prefix     | Use when |
|------------|----------|
| `docs`     | Documentation only (README, CHANGELOG, `docs/`, comments in docs). |
| `feat`     | New or changed **product behavior** (features, CLI, skills, schema, generated output). Usually includes code. |
| `fix`      | Bug fixes (incorrect behavior, regressions, broken build/tests). |
| `refactor` | Code or structure changes that **do not** intentionally change user-visible behavior. |
| `test`     | Tests only (add/update/remove tests, test harness). |
| `chore`    | Everything else: tooling, CI, deps, formatting, repo hygiene, version bumps without feature narrative. |

### Notes

- Write the summary in clear English or 中文; keep it specific and imperative.
- Do **not** add tool-specific trailers (e.g. co-authored-by lines for editors) unless the project explicitly requires them.
- After editing `src/schemas/schema.yaml`, run `npm run sync-schema` before committing if `schema.json` is part of the change.


See `docs/contributing-content.md` for content editing workflow.
