# UMSC-M4-002: Router wake and automatic TV reconnect

- Status: VERIFYING
- Baseline: `c49809a5a0e24ab3ea518ebe342f69d038fc1ab4`.
- Branch: `feature/umsc-m3-001-folder-thumbnails`.
- Owner request, 22 October 2026: kids open the app, it checks UMS, wakes the PC
  only if needed, retries and loads content automatically. Both computers may
  sleep, so use the always-on router, not a Linux relay. Phones already provide
  a working manual WoL fallback. Minimal unused uptime is a product constraint.

## Design and scope

`startup.js` owns generation-fenced serial recovery and the FRITZ!Box Hosts wake
action. Probe first. Only unreachable failures may send wake requests; reachable
HTTP failures, auth errors and empty folders do not trigger wakes. Three wake
attempts at least 30 seconds apart are allowed per foreground connection
session. Five-second connection retries continue until ready. All retries stop
when ready, hidden, exited or changing the target. A late old response cannot
replace the new server. A genuinely empty library is accepted after six checks.

The app shows a child-friendly waiting screen instead of a settings prompt or
misleading empty library while the PC starts. Router failure leaves connection
recovery active and points to the existing phone fallback. Router/MAC settings
are private build overlays, bound to the intended UMS URL. No router credentials
are stored. No automatic router/PC power setting or UMS service change is made.
The app does not intercept TV power-on. Launch/resume is its wake trigger.

Official router action reference:
https://fritz.support/resources/TR-064_Hosts.pdf

The actual router advertises Hosts:1, its wake action and a single MAC input.
A scoped test for the already-awake media PC returned HTTP 200 and the expected
SOAP response, without credentials or a router setting change. This verifies
the LAN action, not delivery from the Samsung app or a physical wake cycle.

## Verification plan and deployment boundary

Node contract tests cover wake ordering/bounds, serial timers, late callbacks,
hidden cancellation, auth failures, empty recovery, private router validation,
same-origin control resolution and the exact wake-only SOAP action. Workstation
browser fixtures cover online, offline-to-ready and empty-to-populated startup,
followed by existing navigation/player/Back/search checks. Official SDK build
and signing preserve application identity, owner label/icon and author cert.

The approved `gsvs-ums-custom` Linux runner currently reports offline, with
labels `self-hosted,Linux,X64,ums-custom-ci`. Compatible Linux verification is
pending. Do not substitute cloud compute or silently wake another computer.
Workstation checks remain useful but are not Linux or Samsung acceptance.

The owner explicitly approved updating the TV app after workstation checks.
Do not stop UMS, reboot,
sleep or shut down either computer as a test without owner approval. Keep the
previous signed package for recovery. Update in place, never uninstall just to
replace the app, since uninstall removes private progress/home state.

## Remaining physical checks

With the owner present, open the updated app while UMS is online: no wake call.
Then shut down/sleep the PC at the owner's chosen time and open/resume the app:
the PC must wake, UMS must start without login, and the same app view must load
the library without closing/reopening. Hide the app during a retry and verify
no later wakes. Test the normal remote, artwork and a playable title afterwards.
Actual sleep/shutdown wake support remains the owner's hardware prerequisite.

## Verified and installed checkpoint, 22 October 2026

- Node 26.5.0: `npm run check`, `npm test` and `npm run build` passed. All 30
  contracts passed, including late-result cancellation and no wake after stop.
- Installed Chrome with `TV_CHROMIUM_PATH`: `node scripts/browser-check.cjs`
  passed for `TV_STARTUP_SCENARIO=online`, `offline` and `empty`. Each includes
  navigation, player adapter, Back and search. Offline recovered after two
  failed probes without reopening and sent one synthetic wake. Online and
  temporarily empty scenarios sent none. These are fixture, not real wake tests.
- `TV_DESCRIPTION_URL` workstation run passed read-only live UMS browsing and
  rendering. No live CORS setting, service restart or renderer-mode change.
- Official CLI 2.5.25 `build-web -out .buildResult -- <private dist>` and
  `package -t wgt -s <existing owner profile> -- <compiled directory>` passed.
- Package version 0.1.1, application `GSVSUMSTVC.TVClient`, transport filename
  `UMSTVClient.wgt`, SHA-256
  `F91B841CABF82936E9DA5FFF2E8278EEF6651EAFBFC506A61D7407FC89129C94`.
- Checked required manifest/config/JS/icon/signature entries. Packaged `app.js`
  and `startup.js` bytes match source. Private wake overlay exists and packaged
  icon bytes match the private original. Actual label, MAC, router URL and
  certificate/key files stay outside Git. Previous signed 0.1.0 is retained;
  new signed 0.1.1 also has a separate private recovery copy.
- With explicit owner approval, SDK install completed at 100% and reported
  `Tizen application is successfully installed`. The SDK then reported
  `Tizen application is successfully launched`. No uninstall was used.
- Linux runner still reports offline. No cloud fallback or unapproved Linux
  wake was used. Java source is unchanged; the last recorded full-suite baseline
  failure remains separate. Remote launch is not visual/native playback,
  physical power-state wake or proof of persisted TV state.

`git diff --check` passes. Source/delivery checkpoint and the consolidated Hub
entry are recorded with the final repository commits. No public binary release
or merge is included. Physical tests above remain the next action.

Final installed app source: `61ba1dc8572e51b8b5597181f3fed8c2b2a7c832`.
An additional regression guards hiding during router-description retrieval:
the pending response is discarded before sending the wake POST. The final
30-contract suite and offline browser scenario passed, then the SDK build,
signing, source-byte check and in-place TV install/launch passed again. This
supersedes the interim 0.1.1 candidate whose hash began `970E0FC1`.

Self-hosted run [39788185008](https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/actions/runs/39788185008)
for that final source is queued while the approved runner is offline. No Linux
pass is claimed. Consolidated Hub update is pushed at
`255ee010c54ec53083d02ac605447f1a1e061bfd`, preserving the independently added
LAN Waker project. The UMS row still appears exactly once. This is a README-only
catalogue update, not a Hub Android rebuild or observed viewer refresh.
