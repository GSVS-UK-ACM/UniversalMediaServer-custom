# UMSC-M1-001: Dedicated Linux runner

The owner authorised SSH setup, runner registration, required tool provisioning,
Git pushes and installation of the UMS update on 21 October 2026.

## Installed state

- Repository runner ID: `2`.
- Runner name: `gsvs-ums-custom`.
- Labels: `self-hosted`, `Linux`, `X64`, `ums-custom-ci`.
- Host platform: Ubuntu 26.04.1 LTS, x86-64.
- Runner version at setup: 2.338.0, automatic updates enabled.
- Lifecycle: enabled user systemd service, lingering enabled.
- Tools: Maven 3.9.16, private Java 17 maintenance runtime, workflow-selected
  Liberica Java 17, official UMS FFmpeg and MediaInfo 26.05.
- Provisioning: private user directories. No system package installation or
  changes to the existing planner runner services were required.
- SSH address and credentials remain in private local configuration.

See `docs/runbooks/SELF_HOSTED_CI.md` for service and recovery instructions.

## Verification history

Workflow run `39594077028` tests commit
`5504b45a8b224a01289a52f390bab151211bc10a`.

1. Attempt 1 ran 532 tests with 18 failures, two errors and 18 skips. Missing
   unversioned JNA library links caused MediaInfo loading failures and affected
   parsing/search tests. Final workspace cleanup passed.
2. After fixing library links, attempt 2 ran 532 tests with one failure, two
   errors and eight skips. Remaining failures were the Jetty connection-timeout
   test and two FFmpeg tests. Final workspace cleanup passed.
3. Refreshing the runner's saved PATH and repeating the suite produced the same
   three failures. The focused folder-art, renderer and playback tests passed.
   Final workspace cleanup passed.

The baseline at `9599bee06635a5653fe06f4c1aa3ed2b91dffcd9`, before the folder
feature, reproduces the same Jetty timeout failure, both in the focused
eight-test comparison and in the full suite. Its FFmpeg tests pass in both
runs. The feature branch's shared-process FFmpeg failures therefore cannot be
claimed as reproduced baseline failures. The final workflow uses fresh JVMs
per test class to check for shared-configuration interference. Assertions are
unchanged.

The timeout assertion requires `SocketTimeoutException` from an external
unroutable address. This LAN returns `SocketException` instead. The assertion
has not been weakened or skipped.

The full baseline ran 527 tests: one failure, no errors and eight skips. Its
only failure was the same timeout assertion. The final feature workflow is run
`39638146430`, job `119354264443`, against commit
`a10969834f01b481bd4e248e298d0d055a309ae1`. Its separate 12-test custom-fork
regression step passed. The full suite ran 532 tests with one failure, no errors
and eight skips. Both FFmpeg tests passed with JVM isolation. The only remaining
failure is the reproduced baseline Jetty timeout assertion.

The job completed in 4m14s. Final cleanup passed. Independent SSH inspection
confirmed a clean Git worktree, no `target` or `.ci-profile` directory, valid
Bash syntax, an active runner service, enabled lingering and an online idle
runner with the expected labels. The temporary baseline worktree was removed
after both comparisons; its source remains recoverable from the baseline Git
commit. Private test logs were retained outside the repository.

UMSC-M1-001 is complete. UMSC-M1-002 tracks the existing network-dependent test.
