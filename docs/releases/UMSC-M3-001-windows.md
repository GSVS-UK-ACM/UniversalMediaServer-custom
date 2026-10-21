# UMSC-M3-001 Windows update

## Package

- Version: UMS 15.9.0-SNAPSHOT with custom playback modes and folder artwork.
- Runtime filename: `ums-15.9.0-folder-artwork.jar`.
- Source feature commit: `5d745afc75775ff3b16d1af1eb0a4e26dfe80fe2`.
- Packaging checkout: `65bfc6e68` (later commits only added verification records).
- SHA-256: `D69ED1CF25D49B02A1F554E873E101F586F9A2977B88299E94C7B246C0784212`.
- Size: 69,524,913 bytes.
- Package command: `mvn --batch-mode -P testing -DskipTests -Doffline package`.
- Windows native test resources were prepared separately with
  `mvn --batch-mode -P testing-windows -DskipTests package`.

Tests were run separately before packaging. Packaging with `skipTests` is not
additional test evidence.

## Runtime verification

The new jar was started with a separate copy of the existing Windows profile
and database, using different ports and a new UPnP identity.

- Startup completed, database opened and transcoding engines initialised.
- UPnP browsing returned the shared library and film folders.
- An actual film folder thumbnail and its direct video's thumbnail returned
  identical HTTP image bytes (SHA-256
  `32BC0DFCBF82130B769CB5D6D72614AB58959F7F9DE4AB5F91065529CA0B7855`).
- A request for bytes 1,048,576 through 1,049,599 of the original video returned
  HTTP 206 with the expected Content-Range and exactly 1,024 bytes.
- The old and new jars' server-icon resources matched by SHA-256.

This verifies server startup, browsing, artwork inheritance and byte-range
delivery. Phone and TV playback acceptance still belongs to the owner.

## Recovery and delivery

Before testing, the stopped installation's complete profile and database,
previous custom jar and launch script were copied to a private timestamped
backup. Live configuration was not used by the isolated test process.

The owner authorised installation. Automatic approval review then blocked the
installation command because the retained earlier instruction required explicit
confirmation that UMS was shut down. The command did not execute. Read-only
inspection showed the live instance stopped and only the isolated verification
instance running. A shutdown/installation confirmation request is pending.
The completed isolated test process has since been stopped as cleanup.

### Installed checkpoint, 21 October 2026

The owner subsequently explicitly confirmed shutdown and approved installation.
The elevated installer completed successfully. The installed jar matches the
package SHA-256 above, and the Windows startup helper now selects this package.
UMS was started normally and is listening on its media and web ports.

Live UPnP browsing succeeded. A real film folder and its direct video's artwork
both returned HTTP 200 with identical bytes. A direct-file request with the VLC
user agent returned HTTP 206, exactly 1,024 bytes and the expected Content-Range.
An earlier probe reused isolated-instance object IDs and returned UPnP 701;
rediscovering the live tree resolved it. A range probe without the VLC user
agent selected a transcoded resource and ended prematurely. This is not claimed
as a successful transcoded seek test. Device playback remains owner verification.

The deployment is installed, not merged or publicly released. The earlier
pending-confirmation record above is superseded by this checkpoint.

The old jar and backup profile remain available for rollback. Do not overwrite
the database with an older copy while UMS is running.
