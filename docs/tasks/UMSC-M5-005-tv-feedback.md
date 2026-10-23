# UMSC-M5-005: First physical TV feedback

- Status: IN_PROGRESS
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
