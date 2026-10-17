# Agent thread prompt: documentation maintenance

> Repository: `https://github.com/step3software/outer-loops`
>
> Read root and `docs/AGENTS.md`. Audit `docs/README.md`, source code and current docs against the scope [topic or whole repository]. Work on a docs branch from `dmchurch` and open a PR; do not merge.
>
> Ground all factual statements in actual code, commit metadata or test evidence. Treat `actionList.js` as the executable source of truth, `data/actionList.xml` as experimental editor content, and `lang/en-EN/game.xml` as localization. Repair wrong links, command drift, omitted failure modes and contradictory persistence claims. Update the action catalog whenever actions change. Clearly label proposed or unverified behavior.
>
> Do not modify gameplay or CI as an incidental cleanup. Run `npm run check` and `python scripts/check-xml.py` when available. Report coverage and any material unresolved facts in the PR; do not imply that a doc review proves runtime functionality.

## Coverage checklist

Agent rules and branch target; architecture/entry points; gameplay/actions/zones; save migration; challenges/prestige; predictor/worker; UI/localization; editor; setup; validation; testing gaps; provenance/rights; ADRs; workflow prompts; relative links.
