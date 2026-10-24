# UMSC-M5-005: First physical TV feedback

- Status: VERIFYING
- Owner: Codex, 23 October 2026.
- Baseline: `210bc7f2de53780cdc706c98d80956e728c4a58b` plus preserved local
  M5-004 deployment documentation. Installed runtime is 0.2.0 at `d2d59a7d1`.
- Branch: `feature/umsc-m3-001-folder-thumbnails`.

## Scope and acceptance

Owner reports the wall mostly works and bootstrap code setup accepts, confirms
and saves a personal code on the real TV. Re-entry with that code and playback
were being tested separately. Never record the personal code. Missing artwork
is accepted for later audit, not permission to fetch or replace posters now.

Reported faults: dwell info does not appear, tiles show names without year/type,
number fields are awkward with the remote, Save cannot be reached and adult
scrollbars show through settings. Owner prefers 5x3 rather than 7x5.
Owner then corrected the dwell report: the supplied photo shows working info,
and confirmed that real playback starts. No dwell-timer or player change is
needed. Sound/seek/full queues and progress are not independently confirmed.
Parental re-entry failed after repeated attempts and reopening. Entry uses
physical numeric buttons. Owner requests recovery, not a total data wipe.

Implement a 5x3 fresh default without overwriting valid saved preferences,
always-visible tile title/year/type, preserve working stationary-selection dwell and
remote-only density adjustment/Save/Back. Isolate modal scrolling from the
underlying library. Do not guess missing years, use bad UMS plots/artwork,
wipe progress, rename media or restart UMS. Reset ONLY the parental credential
once as explicitly requested, then require normal personal-code setup again.

## Verification and delivery boundary

Add browser regressions using only arrows/OK/Back for size adjustment and Save,
not mouse clicks or number-field fill. Check dwell after movement/repeat and
restoration, visible metadata with and without artwork, modal focus/scroll
containment, density persistence, existing gate and queue flows. Run syntax,
unit/build and browser startup scenarios. Approved Linux runner contract is
unchanged; no hosted substitute. Source changes need their own CI evidence.

Prepare fixes locally while the owner tests 0.2.0. No install/relaunch while
they test. A new package/update requires a fresh explicit installation approval.
Preserve the installed signed package privately and distinguish local checks
from actual Samsung acceptance. Owner subsequently approved the 0.2.1 CI push
and in-place TV update after checks, including a one-time code-only reset.

## Implemented fixes and root-cause limits

0.2.0 rendered only the artwork/fallback name per tile; year/type existed in
the selected caption/info. New per-tile captions keep all labels visible, with
unknown years absent rather than invented. New button controls use explicit
remote focus paths. The generic input handler formerly swallowed Left/Right/Up,
and geometric navigation from a number field could miss Save. The opaque modal
now hides underlying scroll surfaces, contains panel scroll and restores focus
after its backdrop state closes. Fresh default is 5x3, valid saved sizes remain.

Code inspection identified a separate race: OK while PBKDF2 is pending previously
reset the gate/generation and played the selected film. A browser regression
delays deriveBits by 350 ms, enters the saved code then immediately presses OK;
it must reach Adults without starting a film. 0.2.1 consumes OK while checking.
Digit timeout rises from 4 to 15 seconds with navigation/visibility cancellation
and existing attempt cooldown retained. This is a demonstrated race, not proof
of the specific owner's failed re-entry. No personal code was collected.

Private signed-build recovery uses a fresh nonce, consumed before removing only
the credential. Same-nonce relaunch keeps a subsequently saved new code.
Storage failure remains locked. Recovery is not in default/public config; its
actual request, package and private LAN/title data stay out of Git.

## Verification checkpoint

Workstation Node 26.5.0 / npm 11.17.0: syntax, 54 unit contracts and build pass.
Full online browser flow passes in Chrome, including keyboard-only Columns,
Rows, Save and Back; both artwork/missing-art metadata; held-arrow dwell;
unambiguous old progress; bootstrap/change/re-entry; slow verification + OK;
modal scroll/focus; preserved valid density and invalid-density fallback.
Offline/empty/recovery variants and Linux CI are being completed. No new TV
package installed at this checkpoint. Final evidence will be appended below.

## Final candidate evidence, 23 October 2026

- Source `4ead7ea2f2786d7b8f370fad016b2deb41a967cd` is committed and PUSHED
  with owner approval, not merged or publicly released.
- Final syntax, 54 unit contracts and build pass. `TV_CHROMIUM_PATH` selects
  workstation Chrome. `node scripts/browser-check.cjs` passes for
  `TV_STARTUP_SCENARIO=online`, `offline`, `empty` and online with
  `TV_CODE_RECOVERY=1`. Recovery starts with a synthetic corrupt credential,
  preserves existing progress and does not erase the new code on reload.
- `TV_DESCRIPTION_URL` read-only live catalogue/render check passes. The
  private screenshot was inspected at 1920x1080: 5x3 wall, readable per-tile
  title/year/type with and without artwork, centred frame. No live media played
  by this check. Owner playback confirmation relates to installed 0.2.0.
- Existing official SDK build/sign, without Target/Serial, produced private
  `UMSTVClient.wgt` version 0.2.1, app ID `GSVSUMSTVC.TVClient`, SHA-256
  `D939C92ECAB8BAC039204E64C7470166F62A66FA55B97D8719BE52F71C10AC65`.
  All eight runtime JS/HTML/CSS files match current source bytes; both signatures
  exist. 773 exact names and 770 progress aliases remain; private index path is
  absent. The owner-requested one-time code recovery is included privately.
  Installed 0.2.0 and candidate 0.2.1 signed packages are retained privately.
- [Linux run 39878299561](https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/actions/runs/39878299561),
  job `120169255007`, uses `gsvs-ums-custom` with
  `self-hosted,Linux,X64,ums-custom-ci`, at the source commit above. Custom Java
  regressions and app syntax/tests/build pass. Full suite and cleanup results
  will be appended after completion, not inferred from successful app checks.

Package is not installed at this evidence checkpoint. Owner has authorised
in-place deployment after checks. Preserve progress/Home/density/queue keys,
never uninstall. After first launch remove the recovery request from local
build configuration; the signed package's consumed nonce remains a no-op on
later launches. Ask owner to enter bootstrap 12345, choose a fresh code twice,
return to kids and re-enter parents before declaring code recovery accepted.

## Completed verification and deployment checkpoint

Linux run above completed in 4m23s. Custom Java and Node 22 app syntax/54
contracts/build pass. Full command `mvn --batch-mode verify -P testing
-DdisableXmlReport=true -DreuseForks=false` reports 538 tests, one failure,
zero errors and eight skips. Sole failure remains
`JettyStreamClientImplTest.testJettyClientConnectTimeout:144`, expecting
`SocketTimeoutException` but receiving `SocketException`, tracked as M1-002.
Cleanup passes. Workflow whitespace step is skipped after the failure; local
`git diff --check` passes. Overall CI is FAILURE, not all-green. No server Java
source or assertions changed.

Owner-approved in-place deployment completed 23 October. Rehashed package
matches `D939C92ECAB8BAC039204E64C7470166F62A66FA55B97D8719BE52F71C10AC65`.
Author certificate chains match the prior installed 0.2.0 recovery package.
Official CLI install and run both exit 0: successful install and launched PID
642, debug 0. Same app ID/author, no uninstall or total storage reset, no UMS
restart/upgrade, no media changes or DVD import. Private packages and separate
deployment evidence remain outside Git.

The signed package requests one-time credential-only recovery. Its actual
reset, new-code re-entry, remote sizing/Save and visual acceptance await the
owner. No secret was collected or TV storage dumped. Remove the private
recovery request from future local build configuration after delivery. Do not
rebuild/resign and mistake different output for the installed hash.

Installed runtime source is `4ead7ea2f2786d7b8f370fad016b2deb41a967cd`.
Follow-up documentation does not change that package. No merge/public release.
Single canonical Hub row is updated locally, not pushed; metrics unchanged,
no Android rebuild or viewer acceptance. M5-005 remains VERIFYING until physical
checks pass. Final DVD/artwork/content/duplicate/root/migration audits remain
separate work.

## Owner acceptance update, 23 October 2026

Owner confirms 0.2.1 reset the code and accepted the newly configured parental
code on re-entry. The size-changing menu works and looks good on the physical
TV. Owner prefers 5x3, large artwork and text at the bottom of tiles. Preserve
that layout. Some labels remain missing; defer investigation/correction to
the visual/library audit rather than claiming the library is complete.

This is owner-observed code recovery/re-entry, remote size controls and layout
acceptance, not a direct TV storage inspection or proof of every label. No
additional app build, install, reset, server action or media change. This
acceptance update is local documentation only, not pushed. Keep M5-005 VERIFYING
for an explicit scrollbar-bleed check; audio/seek, full queues, old-progress
retention and physical wake remain in the existing broader acceptance work.
