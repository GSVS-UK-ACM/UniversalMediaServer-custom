# Self-hosted Linux CI

## Trust boundary

This public repository uses a private owner-managed runner only for manual
dispatches by `xboxnuker-rgb` on `GSVS-UK-ACM/UniversalMediaServer-custom`. Do not
add `pull_request`, `pull_request_target` or issue-driven triggers to the
self-hosted workflow. Disable the runner before changing that boundary.

The runner registration, host address and credentials stay outside Git.

The organisation transfer added another trusted organisation administrator.
The automatic feature-branch push route was therefore removed during
`GHM-M1-001`. An organisation name cannot match a human actor, so the old
`github.actor == github.repository_owner` guard was replaced with an explicit
repository, event and operator check. Keep this manual-only boundary unless
the owner approves a separate review of runner access.

## One-time runner setup

The registered runner is `gsvs-ums-custom`, repository runner ID `2`, with labels
`self-hosted`, `Linux`, `X64` and `ums-custom-ci`. It runs on the GSVS Ubuntu
26.04 x64 host through a user systemd service. The owner authorised registration,
tool provisioning and installation on 21 October 2026.

The repository includes its service template at
`scripts/ci/ums-custom-ci.service`. Install it under the runner account's
`~/.config/systemd/user/`, reload the user manager and enable the service.
User lingering is enabled, so this service starts after reboot and survives an
SSH logout. The original planner services have separate installations.

To recreate registration, use **Settings > Actions > Runners > New self-hosted
runner** and the same label set. Send registration tokens over the approved
private SSH connection. Do not print or save them in the repository.

Before starting it, provision these host prerequisites through the normal box
maintenance process:

- Git
- Java 17
- Maven 3.8.6 or newer
- `libmms0`
- `libzen`
- `libmediainfo`

Do not put the short-lived registration token, runner service credentials or
host details in this repository. Configure the runner for one job at a time.

## Provisioned user tools

The runner account does not have passwordless sudo. Its UMS toolchain is
provisioned under `~/.local/share/ums-ci/`, without changing system packages:

- Runner 2.338.0, with normal automatic runner updates enabled.
- Temurin JDK 17.0.20.1+1 for runner maintenance. The workflow selects Liberica
  Java 17 through `setup-java` for test execution.
- Maven 3.9.16.
- The official UMS Linux FFmpeg binary, build
  `n8.1.3-2-g45e8e0a3ff-20260927`.
- MediaInfo 26.05, plus private extracted libzen and libmms packages.

The JDK and runner downloads were checked against GitHub release SHA-256
digests. Maven was checked against its published SHA-512 digest. Native package
dependencies were checked with `ldd` before the runner started.

`LD_LIBRARY_PATH` points to the private native library directory. That
directory needs both the versioned library files and unversioned JNA loader
links such as `libmediainfo.so`. The service PATH includes the private FFmpeg
and Maven directories. After changing that PATH, run the runner's `env.sh`
with the intended environment while it is idle, then restart its service. The
runner saves its own PATH snapshot during configuration.

CI sets `ums.profile.path` inside `.ci-profile/` under the job workspace. This
keeps synthetic test databases and configuration inside the cleanup boundary.

## Dispatch and evidence

1. Push the task branch without expecting automatic runner execution.
2. Confirm the runner reports online and idle with all four expected labels.
3. As `xboxnuker-rgb`, dispatch **Self-hosted Linux verification** against the
   reviewed task branch or `main`.
4. Record the exact commit, run URL, job ID, runner name and labels in the task
   report.
5. Confirm the final cleanup step passed, including after any test failure.

The workflow runs the upstream Linux verification command:

```bash
mvn --batch-mode verify -P testing -DdisableXmlReport=true -DreuseForks=false
```

It first runs the 12 focused custom-fork tests as a separately reported step.
Keep full-suite failures visible even if these focused tests pass.

The full suite uses a fresh JVM per test class because tests replace global
UMS configuration and engine state. This avoids class-order interference
without changing test assertions. The existing Jetty timeout test also depends
on the host network's handling of an external unroutable address. Preserve a
failure there and record the baseline result rather than changing the host's
routes or weakening the assertion.

## Cleanup and recovery

`scripts/ci/clean-self-hosted-runner.sh` refuses to run unless
`GITHUB_WORKSPACE` is the exact Git root. It removes only known UMS build and
browser-test output under that root. It does not sweep user directories, clear
shared tool caches, run `git clean`, or reset arbitrary tracked files. It
restores only Yarn's known generated `react-client/.yarn/install-state.gz`
cache state.

If labels do not match or the runner is offline, leave verification pending.
If cleanup fails, stop new jobs, inspect the exact Actions workspace on the
box, remove only the paths listed in the cleanup script, then rerun the manual
workflow. Do not substitute hosted Linux compute.
