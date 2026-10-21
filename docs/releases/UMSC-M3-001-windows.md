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

The owner authorised installation. Deployment status is pending completion of
the Linux baseline comparison. The old jar and backup profile remain available
for rollback. Do not overwrite the database with an older copy while UMS is
running.
