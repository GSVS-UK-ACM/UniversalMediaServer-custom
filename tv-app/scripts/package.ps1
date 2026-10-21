param(
    [Parameter(Mandatory = $true)][string]$TizenCli,
    [Parameter(Mandatory = $true)][string]$CertificateProfile,
    [string]$Target,
    [string]$Serial
)
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $appRoot 'dist'
if (-not (Test-Path -LiteralPath $TizenCli -PathType Leaf)) { throw 'Select the installed official Tizen CLI.' }
if (-not (Test-Path -LiteralPath (Join-Path $dist 'config.xml'))) { throw 'Run npm run build first.' }
if ($Target -and $Serial) { throw 'Choose either Target or Serial, not both.' }
$compiled = Join-Path $dist '.buildResult'
& $TizenCli build-web -out .buildResult -- $dist
if ($LASTEXITCODE -ne 0) { throw 'Tizen web build failed.' }
# The SDK owns certificate handling. Never pass passwords or key material in
# arguments, logs or the repository. The named profile must already exist.
& $TizenCli package -t wgt -s $CertificateProfile -- $compiled
if ($LASTEXITCODE -ne 0) { throw 'Tizen signing failed. Check the Samsung certificate profile and TV DUID.' }
$package = Get-ChildItem -LiteralPath $compiled -Filter '*.wgt' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $package) { throw 'The SDK did not produce a WGT package.' }
# Some TV installer paths fail silently on spaces or shell metacharacters.
# Rename only the transport file. The signed bytes and displayed app name stay
# unchanged, and the same private certificate remains valid for future updates.
$safePackage = Join-Path $compiled 'UMSTVClient.wgt'
if ($package.FullName -ne $safePackage) {
    Copy-Item -LiteralPath $package.FullName -Destination $safePackage -Force
}
Get-FileHash -LiteralPath $safePackage -Algorithm SHA256
$destination = @()
if ($Serial) { $destination = @('-s', $Serial) }
elseif ($Target) { $destination = @('-t', $Target) }
if ($destination.Count) {
    $installArguments = @('install', '-n', 'UMSTVClient.wgt') + $destination + @('--', $compiled)
    & $TizenCli @installArguments
    if ($LASTEXITCODE -ne 0) { throw 'TV installation failed. Check Developer Mode and permit-to-install.' }
    $runArguments = @('run', '-p', 'GSVSUMSTVC.TVClient') + $destination
    & $TizenCli @runArguments
    if ($LASTEXITCODE -ne 0) { throw 'Installed, but launching UMS TV Client failed.' }
}
