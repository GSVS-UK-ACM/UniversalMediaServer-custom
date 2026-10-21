# UMSC-M1-003: Windows service startup

- Status: VERIFYING
- Baseline: `1983236e8c028a447b9d28c58dfa4321e14aaea3`.
- Branch: `feature/umsc-m3-001-folder-thumbnails`.
- Authority: Owner explicitly requested pre-login service startup while keeping
  the custom build and current settings. A brief UMS restart is part of that
  migration. No PC reboot or sign-out is authorised.

## Plan and protected contracts

Use the already installed Tanuki wrapper behind the GUI's Install as Windows
service button. Pin its classpath to the installed custom jar, specify the
existing profile explicitly, use headless mode and disable interactive desktop
service behaviour. No new service-wrapper download or build upgrade is needed.

The installed jar matches the working folder-artwork candidate:
`D69ED1CF25D49B02A1F554E873E101F586F9A2977B88299E94C7B246C0784212`.
Media is on a fixed local NTFS drive rather than a login-mapped network drive.
Keep the same server UUID, shares, renderer modes, database and scan settings.
The separately staged server-branding candidate remains uninstalled.

Use the built-in LocalService account without a stored user password. Give
that account Modify access only to the existing UMS profile; media access
remains read-only through existing filesystem permissions. Use automatic
delayed startup, network dependencies and restart-on-failure recovery.

Back up the old wrapper configuration, profile/database after graceful exit,
profile root ACL and the two UMS login shortcuts outside Git. Use the supported
local Process.Exit API, not a forced Java kill. Disable only those exact
shortcuts, recoverably, after service health succeeds. Keep private staging
scripts, settings, logs, media paths and backups outside the repository.

## Verification and remaining acceptance

Planned Windows checks: parse the staged helper, install/start through SCM,
verify service account/start mode/dependencies/recovery, trace the listener to
its Java child in session zero, confirm explicit jar/profile arguments and
same device identity, browse the existing share, and request artwork/media byte
ranges. Compare protected configuration hashes across the transition.

An actual boot left at the login screen remains owner-observed acceptance.
Session-zero runtime checks establish service operation, not a tested cold boot
or physical TV playback. Linux checks are not applicable to this private
Windows service configuration change. No Java/app source changes are planned.

## Recovery contract

Stop the specific service, remove its registration, restore the saved wrapper
configuration and profile root ACL, restore the two saved startup shortcuts,
then start the previous desktop custom jar. Do not overwrite the live database
with an older backup just to undo service startup. Preserve the private backup
as a separate disaster-recovery option. Use the web settings UI while running
as a service; launching another desktop server would compete for the same ports
and database.

## Installed checkpoint, 22 October 2026

The first helper attempt received HTTP 401 from the local Process.Exit API and
made no service change. The owner then explicitly quit UMS from its tray.
After a new administrator approval, installation through the bundled wrapper
succeeded. No forced process termination or authentication change was used.

- Service name: `UniversalMediaServer`; display name: `Universal Media Server`.
- Account: `NT AUTHORITY\LocalService`, with no owner password stored.
- Startup: automatic delayed (`Start=2`, `DelayedAutostart=1`), dependent on
  `Tcpip` and `Dnscache`.
- Recovery: `sc.exe qfailure UniversalMediaServer` confirms restart after
  60 seconds, 60 seconds and 120 seconds, reset after 86400 seconds.
- Java and wrapper both run in session zero. The wrapper runtime log confirms
  the explicit existing profile/database and headless service JVM arguments.
- Installed custom jar hash is unchanged from the identity recorded above.
- Byte-for-byte checks pass for main settings, shared-folder settings and
  renderer playback modes. All private renderer profile hashes also match.
- Same DLNA device description and server identity return HTTP 200.
- Bounded SOAP Browse finds the existing share and its kids category (21 entries
  in that category). Folder artwork returns HTTP 200. An existing direct-play
  item returns HTTP 206 with exactly 1024 bytes for `Range: bytes=0-1023`.
- Both specific UMS startup shortcuts were moved to the private backup, not
  deleted. The backup also includes the stopped profile/database, old wrapper
  config, root ACL and original shortcut copies. It remains outside Git.

The first smoke helper assumed the server listened on loopback; the retained
configuration binds its media port to the LAN address. Using that configured
address fixed the test connection. An initial sample selected UnknownRenderer
transcoding and reproduced the already recorded premature byte-range response.
The direct-play sample passes; transcoded range/seek is not claimed fixed or
accepted. No renderer or transcoding setting was changed to obtain this pass.

Private staging commands were `Install-Service.ps1` through elevated Windows
PowerShell 5.1 and `Verify-Service.ps1` through workstation PowerShell. The
installer AST syntax and wrapper duplicate-key checks passed before use. The
verification helper records only bounded read-only runtime checks, not a
recursive scan. Final repository whitespace validation is `git diff --check`.
There are no Java or TV app source changes, so their suites were not rerun.
Linux cannot verify Windows SCM/session-zero behaviour; no hosted CI substitute
was used. Preserve the separately recorded existing Java baseline test failure.

Remaining acceptance: reboot at the owner's chosen time, leave Windows at the
login screen, wait for delayed startup and open the TV app or DLNA source.
No reboot, sign-out, actual TV playback or simulated service-failure restart
was performed by the agent. The PC must stay powered and awake to serve media.

## Future updates and project manager

This installation uses the protected installed `ums.jar`, which is the verified
custom build, rather than a user-writable runtime jar. Any future UMS installer
may replace that jar, wrapper config or startup shortcuts. Stop the service
with owner approval, back up current state, install the intended custom build,
verify its hash and service profile binding, then repeat browse/media checks.
Do not re-enable login startup or silently replace the pending branding build.

The single consolidated Projects Hub entry already covers the fork and TV app,
with direct handover/backlog links. This private startup-mode deployment does
not change public package availability, metrics or project identity, so no new
entry or Android rebuild is needed.
