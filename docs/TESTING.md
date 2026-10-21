# Testing

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
