# Upstream lineage, maintenance and rights

## Repository lineage

The GitHub fork network is:

1. [omsi6/omsi6.github.io](https://github.com/omsi6/omsi6.github.io) — original upstream repository in this network.
2. [lloyd-delacroix/omsi-loops](https://github.com/lloyd-delacroix/omsi-loops) — a fork of omsi6's repository.
3. [dmchurch/omsi-loops](https://github.com/dmchurch/omsi-loops) — forked from Lloyd's repository; branch `dmchurch` is the developed line.
4. [step3software/outer-loops](https://github.com/step3software/outer-loops) — forked from dmchurch; default branch `dmchurch`.

At the documentation baseline, `step3software/outer-loops` and the latest `dmchurch/omsi-loops` default branch point to the same game commit, `fe4a349efb799a56ab548018caca1a1a1aea0c8f` (March 23, 2025). The Lloyd `main` branch points to `5008c4a1faca102af543b4f9369f6cef4b763823` (August 6, 2022). These are **snapshot facts**, not promises of future freshness.

This fork is not a clean-sheet game. Preserve attribution to upstream contributors, existing source history and any notices. Review new upstream code before importing it. A parent GitHub fork label is metadata; retaining it is not required to fetch a different source as an additional Git remote.

## License/rights status — unresolved

At this baseline GitHub's metadata reports **no license** for `step3software/outer-loops` or its immediate parent and Lloyd's fork. No explicit license was located in the checked-in root tree. Public source and permission to use GitHub's Fork feature do **not** grant unrestricted rights to modify, redistribute or commercialize the software or artwork outside GitHub's applicable terms.

Before distributing a branded commercial build, sublicensing, or publishing substantial derivations outside the fork network, determine copyright ownership and secure appropriate permissions/licenses. Do not invent an SPDX identifier, claim public-domain status, remove notices, or treat this note as legal clearance.

## Safe upstream intake

- Inspect all candidate upstream branches and commit histories; compare actual functionality, not commit age alone.
- Work on an integration branch based on current `dmchurch`. Do not force-reset your fork to Lloyd or merge another fork solely to change GitHub's displayed parent.
- Use the exact commits or patches required. Review conflicts in `actionList.js`, `saving.js`, `lang/en-EN/game.xml`, `predictor.js` and `views/` carefully, especially incompatible persistent data structures.
- Confirm origin, copyright notices and licensing rights for every imported code/asset. Resolve permission uncertainty before redistribution.
- Run syntax/XML checks plus the full affected smoke matrix; record save and predictor compatibility explicitly.
- Open a dedicated PR describing imported commits, scope, regressions and unresolved rights. Never sync directly onto the default branch without review.

## Useful commands

These are examples for a local Git clone, not actions performed on your behalf:

```sh
git remote -v
git remote add dmchurch https://github.com/dmchurch/omsi-loops.git
git remote add lloyd https://github.com/lloyd-delacroix/omsi-loops.git
git fetch --all --prune
git log --oneline --left-right dmchurch...dmchurch/dmchurch
```

If a named remote already exists, inspect it rather than re-adding it. Keep an upstream review separate from unrelated feature work.
