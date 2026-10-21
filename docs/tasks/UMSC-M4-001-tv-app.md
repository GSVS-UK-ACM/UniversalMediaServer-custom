# UMSC-M4-001: Kids TV Samsung frontend

- Status: IN_PROGRESS
- Owner: Codex, authorised by repository owner on 21 October 2026.
- Branch: `feature/umsc-m3-001-folder-thumbnails`
- Baseline: `9aa187e9f`, with UMSC-M3-002 source work retained separately.

## Product and architecture

Small packaged Tizen 5.5 web application for the owner's 2020 Samsung TV.
Owner accepts developer-mode network installation instead of USB. UI owns its
artwork shelves, category/folder navigation, search and player. UMS remains the
media source and decides direct play/transcoding using the TV renderer. No
Samsung built-in Sources UI replacement, media relocation or global flattening.

The client uses existing read-only UPnP ContentDirectory HTTP APIs. No new
unauthenticated server API, external relay, cloud account or library scan.
Connect using a private device-description URL; keep deployment configuration
outside Git. Browse paginates and renders server-provided artwork itself.
Search uses the server's subtree Search action, not a client recursive scan.
Home previews read at most six direct child collections sequentially.

Samsung AVPlay is the production playback adapter; an HTML video fallback is
only for workstation UI development. TV-local progress and watched status are
not phone/account synchronisation. The app never writes media or the UMS DB.

## Acceptance

- D-pad, OK and Back navigate, with visible focus and no keyboard dependency.
- Artwork shelves and folder categories use real UMS browse results.
- Search finds titles in the selected Home library via server Search.
- Native AVPlay opens a playable URL, handles errors and returns to browsing.
- TV-local resume/watched markers survive app restart.
- Validate parsing, pagination, XML escaping, URL restrictions and player state.
- Run compatible automated checks on the existing GSVS runner.
- Package with the Samsung certificate for this TV. Keep keys/certs private.
- Actual TV install, native playback, audio, pause, seek and restart require
  device evidence, not browser mocks or an unsigned ZIP.

## Delivery boundary

Network install is authorised. Owner must enable Developer Mode. SDK and
Samsung certificate setup may require account interaction; do not accept new
legal terms or expose credentials on their behalf. Live UMS restart is still
separately owner-controlled. UMSC-M3-002 remains pending verification/deployment.

## Platform references

- https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html
- https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html
- https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html
- https://developer.samsung.com/smarttv/develop/faq/application-installation.html

## Workstation checkpoint

Node 26.5.0: `npm ci --ignore-scripts`, `npm run check`, `npm test` and
`npm run build` pass. Thirteen contracts cover XML and pagination, same-server
URL policy, search, progress identity and mocked AVPlay lifecycle/error handling.
These are not native media playback evidence.

The same DLNA client connected to the live existing UMS instance, browsed two
root entries and 19 kids entries with artwork, and subtree search returned two
matching results. Requests are read-only and do not trigger a library rescan.
Actual addresses/titles are kept out of this portable report.

Official baseline SDK docs now deprecate the old Eclipse Tizen Studio IDE.
Use the current CLI installer, TV extension and Samsung certificate tooling:
https://github.com/Samsung/tizen-docs/blob/master/docs/sdk-tools/baseline-sdk/setup/install-sdk.md
