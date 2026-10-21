# Universal Media Server Custom

This repository is the GSVS-maintained UMS fork. Keep custom changes small,
tested and easy to replay when `upstream/main` moves.

## Working rules

- `origin` is `xboxnuker-rgb/UniversalMediaServer-custom`; `upstream` is the
  official Universal Media Server repository.
- Record durable custom work in `docs/BACKLOG.md`, `docs/HANDOVER.md` and the
  matching `docs/tasks/` report.
- Use the repository's owner-triggered self-hosted workflow for compatible
  Linux checks. Do not route public pull requests to the private GSVS runner.
- Run relevant Windows checks when a change affects the Windows build or live
  installation.
- Do not install over the live UMS instance, stop its service, or restart it
  without the owner's explicit approval for that deployment step.
- Do not commit local UMS profiles, databases, logs, media paths, credentials,
  downloaded binaries or build output.

See `docs/TESTING.md` for exact checks and the Linux runner contract.
