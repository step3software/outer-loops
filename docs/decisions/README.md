# Architecture decision records

Use an ADR for changes that alter long-lived contracts: runtime architecture, persistence format, queue semantics, zone numbering, test strategy, data ownership, worker model, cloud dependency, major balancing framework or upstream distribution policy.

Create a numbered Markdown file such as `0001-descriptive-decision.md` using [TEMPLATE.md](TEMPLATE.md). Decision statuses: **Proposed**, **Accepted**, **Superseded** or **Rejected**. A proposal is not authorization to implement or merge.

Each ADR should document alternatives, assumptions, tradeoffs, save/predictor compatibility, test evidence and the consequence of reversal. Once accepted, update relevant system guides; if superseded, link to the replacement. Do not retroactively claim that an undocumented historic architectural choice was formally approved.

No project-authored ADR has been adopted at this baseline.
