# Testing

## Family artwork (0.3.0)

`node --test test/*.test.cjs` in tv-app covers explicit same-server sidecars,
downward inheritance, deeper override/update/removal, image-validation failure,
duplicate choices, cancellation, identity preservation and seed-tool safety.
The online/offline/empty browser fixtures exercise parent-only artwork preview
and refreshed images with the personal code retained. `TV_CODE_RECOVERY=1`
remains a synthetic fixture only, never a deployment configuration.

`TV_USER_AGENT` optionally sets the live test browser's renderer identity when
using `TV_DESCRIPTION_URL`. Record the profile and catalogue replay separately
from physical Samsung acceptance. Never interpret image HTTP success or local
scene scoring as owner approval of every picture. Private media/source/hash
journals, live snapshots and contact sheets stay outside Git.

## Workstation checks

Use Maven 3.8.6 or newer with Java 17. The focused folder-art check is:

```powershell
mvn -Dtest=RealFolderThumbnailTest test
```

Also run `git diff --check`. Windows runtime acceptance is separate from source
or unit-test verification.

## GSVS Linux runner

Compatible automated checks run through `.github/workflows/self-hosted-verify.yml`
on the private GSVS Linux box. The dedicated runner labels are:

- `self-hosted`
- `Linux`
- `X64`
- `ums-custom-ci`

The workflow is owner-only because this is a public repository. It runs for an
owner push to `feature/**` and can also be dispatched manually after the
workflow reaches the default branch. It must not gain a `pull_request` trigger
while using a private self-hosted runner. The runner is persistent and handles
one UMS job at a time. Preparation and always-run cleanup remove only known
generated paths inside the verified GitHub workspace.

The host must already provide Git, Java 17, Maven, `libmms0`, `libzen`, and
`libmediainfo`. Ordinary jobs must not use `sudo` or alter host packages.

Runner `gsvs-ums-custom` is registered and managed by the user service template
in `scripts/ci/ums-custom-ci.service`. Its Java, Maven, FFmpeg and native
libraries are provisioned in private user directories. The workflow reports
the 12 custom-fork tests separately, then runs the full suite with a fresh JVM
per test class. Its synthetic UMS profile stays inside `.ci-profile/` and is
removed by final cleanup.

See `docs/runbooks/SELF_HOSTED_CI.md` for registration, dispatch, cleanup and
recovery.

## Samsung TV app

`tv-app/` has pinned development-only dependencies and native browser runtime
code. CI selects Node 22, runs `npm ci --ignore-scripts`, `npm run check`,
`npm test`, then `npm run build`. Output and private connection configuration
are ignored. These checks do not sign a TV package or verify native AVPlay.
Optional workstation browser checks use `node scripts/browser-check.cjs` from
`tv-app/`, with `TV_CHROMIUM_PATH` for a locally installed Chrome binary.
`TV_DESCRIPTION_URL` switches that check to read-only live UMS rendering.
Its CORS bridge exists only in the test browser, never on the UMS server.

Family UI fixtures use that same entry point and require no private files.
They cover fixed-centre/reversible movement, dwell, direct play, full TV queues
with rotating starts, forced initial code replacement, code-change/storage-full
behaviour, parent search/Reset Home/density and kids lock after hide/relaunch.
Pure family and name-planner contracts run under `npm test`. Naming authority
tests inject conflicting online titles and ensure file labels win without the
wrong poster/plot or a file modification date becoming a release year.

0.2.1 fixtures also assert tile year/type with or without artwork, a 5x3 fresh
default, saved density preservation, arrows-only adjustment/Save/Back, modal
scroll isolation and OK during deliberately slow PBKDF2 verification.
`TV_CODE_RECOVERY=1` runs the same full browser flow with a synthetic corrupt
old credential and one-shot private recovery. Subsequent reload/code re-entry
must preserve the replacement code and existing progress. Never use a real PIN
or recovery nonce in test fixtures or CI configuration.

Startup recovery contracts are in `tv-app/test/startup.test.cjs`. Browser fixture
startup modes use `TV_STARTUP_SCENARIO=online`, `offline` or `empty` with the
same browser-check command. They verify wake/reconnect sequencing without real
power changes. Real Samsung router access, sleep/shutdown wake and retained
TV-local state require owner-supervised device checks after approved install.
