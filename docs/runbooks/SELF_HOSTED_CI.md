# Self-hosted Linux CI

## Trust boundary

This public repository uses a private owner-managed runner only for pushes to
`feature/**` by the repository owner and manual dispatches by that owner. Do not
add `pull_request`, `pull_request_target` or issue-driven triggers to the
self-hosted workflow. Disable the runner before changing that boundary.

The runner registration, host address and credentials stay outside Git.

At the time this route was added, the repository had no direct collaborator
other than `xboxnuker-rgb`. Recheck that condition before enabling the runner.
If another account gains write access, disable the feature-branch push route
until the trust boundary is reviewed.

## One-time runner setup

Create a repository runner from **Settings > Actions > Runners > New
self-hosted runner**. Install it as a second dedicated runner instance on the
GSVS Linux box and add the custom label `ums-custom-ci`. Keep the default
`self-hosted`, `Linux` and `X64` labels.

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

## Dispatch and evidence

1. Push the `feature/**` task branch. Its exact commit queues automatically.
2. Confirm the runner reports online and idle with all four expected labels.
3. If a rerun is needed after this workflow reaches `main`, dispatch
   **Self-hosted Linux verification** against the task branch.
4. Record the exact commit, run URL, job ID, runner name and labels in the task
   report.
5. Confirm the final cleanup step passed, including after any test failure.

The workflow runs the upstream Linux verification command:

```bash
mvn --batch-mode verify -P testing -DdisableXmlReport=true
```

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
