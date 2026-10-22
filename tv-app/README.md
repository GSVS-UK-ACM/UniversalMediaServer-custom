# UMS TV Client for Samsung

A small Tizen 5.5 web app for the custom UMS fork. It draws its own artwork
shelves and category browsing rather than relying on the TV's DLNA folder icons.
The Samsung native AVPlay player opens UMS media URLs. The PC still handles
transcoding when its renderer profile requires it.

## First build

Requires Node 22 or newer for development. The packaged app has no Node runtime
and no third-party runtime dependencies. Its browser code targets the 2020 TV
engine, with no optional chaining, CSS grid dependency or modern DOM replacement
APIs. Physical TV verification is still required.

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
```

Optionally create ignored `connection.local.json` before building:

```json
{"descriptionUrl":"http://YOUR-PC:5001/dev/YOUR-UMS-UUID/desc"}
```

The server UUID is in the UMS profile. Keep actual LAN addresses and identities
out of Git. The connection screen is also available inside the app.
Optional private `displayName` and `iconFile` settings customise the installed
app name and PNG launcher artwork. `iconFile` is a build-time filesystem path,
not exported in the runtime connection JSON. Keep family names and private
artwork in ignored local configuration, not public source or release notes.
Choose a collection and select **Use this collection as Home** to make the app
open there next time. Home loads previews for at most six direct collections.
Search uses UMS's existing subtree search; it does not scan or alter media.

## Automatic startup and optional router wake

The app checks UMS first. An unreachable configured server shows **Getting your
films ready…**, then retries every five seconds after each completed probe.
If a private wake overlay exists for that server, it asks the always-on FRITZ!Box
to send Wake-on-LAN. Wake requests are at least 30 seconds apart and limited to
three per foreground connection session. Once the library loads there are no
background polls or wake keepalives. Hiding/exiting the app cancels recovery;
returning to it checks UMS again. Opening the app, not TV power-on itself, is the
trigger unless the TV resumes this app automatically.

Example additions to ignored `connection.local.json` (use your own values):

```json
{"wake":{"descriptionUrl":"http://fritz.box:49000/tr64desc.xml","macAddress":"02:00:00:00:00:01"}}
```

This calls only the discovered same-router Hosts action
`X_AVM-DE_WakeOnLANByMACAddress`. It never enables auto-wake, edits router/PC
settings, keeps a Linux helper awake or supplies router credentials. If router
authentication is required, do not put an administrator password in the app.
Use the phone wake app as a fallback; automatic UMS reconnection still works.
The PC must already support waking from the power state you use. An accepted
router action is not proof that an asleep or shut-down PC actually woke.

A reachable, temporarily empty library gets six bounded checks, then displays
its real empty state. Authentication/configuration errors are shown rather
than treated as a sleeping PC. A changed manual server URL cannot wake the
private default PC. Private router/MAC values stay outside Git and public builds.

Workstation browser fixture modes are `TV_STARTUP_SCENARIO=online`, `offline`
and `empty` with `node scripts/browser-check.cjs`. They use synthetic endpoints,
not real power changes. See `docs/tasks/UMSC-M4-002-wake-reconnect.md` for the
physical TV and wake-cycle acceptance boundary.

## Samsung Developer Mode and signing

1. On the TV, open Apps and its settings. Enter `12345` using the remote's
   number keypad. Some firmware opens the dialog from the main Apps screen.
2. Turn Developer Mode on. Enter the development PC's LAN address, not the TV
   address. Reboot the TV.
3. Install the official Tizen baseline CLI, Samsung TV extension and current
   Samsung Certificate Extension. The account owner must review/accept SDK
   terms and sign in where required. Do not use the retired Eclipse IDE.
4. Connect the TV in Device Manager, record its DUID in a Samsung distributor
   certificate, and enable **Permit to install applications**. Retain the
   author certificate securely for future updates with the same application ID.
5. Package with an existing named certificate profile:

```powershell
./scripts/package.ps1 -TizenCli 'PATH/TO/tizen.bat' -CertificateProfile 'PROFILE' -Target 'TV_TARGET_NAME'
```

With neither `-Target` nor `-Serial`, this only signs a package. The SDK is responsible for signing
and deployment; an unsigned ZIP is not an installable TV app. No USB workaround
or certificate bypass is used. Uninstall through the TV's Apps menu. Uninstall
deletes TV-local resume/home state, not the UMS library.

Use `-Serial 'TV_ADDRESS:26101'` instead of `-Target` to select a connected SDB
device directly. With neither option the script only builds and signs. The
helper builds through the official SDK, then copies the signed output to the
shell-safe transport filename `UMSTVClient.wgt`. This does not change the app's
displayed name or signature. Device deployment must never use a private label
containing spaces or shell metacharacters as its transport filename.

## Controls and limits

- D-pad moves focus. OK opens a category or plays a video. Back returns.
- During playback: OK toggles pause, Left/Right seek 30 seconds, Back stops.
- Native stream limitations still apply to seeking and media compatibility.
- Resume and watched markers are private to this TV. They are not account or
  phone synchronisation. Recent entries re-resolve URLs before playback.
- App backgrounding stops playback and returns to the library.
- Server unreachable, empty folders, missing images, search failures and native
  player errors show visible messages. No network or database reset is required.
- No remote-access configuration, external analytics or internet relay.
- Device certificate creation and native codec/audio/seek acceptance are not
  proven by the Node tests or workstation browser preview.

References: [TV connection](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html),
[AVPlay](https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html),
[installation policy](https://developer.samsung.com/smarttv/develop/faq/application-installation.html).
