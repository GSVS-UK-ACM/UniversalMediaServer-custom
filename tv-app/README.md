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

Without `-Target`, this only signs a package. The SDK is responsible for signing
and deployment; an unsigned ZIP is not an installable TV app. No USB workaround
or certificate bypass is used. Uninstall through the TV's Apps menu. Uninstall
deletes TV-local resume/home state, not the UMS library.

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
