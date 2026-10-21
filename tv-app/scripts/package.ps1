param(
    [Parameter(Mandatory = $true)][string]$TizenCli,
    [Parameter(Mandatory = $true)][string]$CertificateProfile,
    [string]$Target
)
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $appRoot 'dist'
if (-not (Test-Path -LiteralPath $TizenCli -PathType Leaf)) { throw 'Select the installed official Tizen CLI.' }
if (-not (Test-Path -LiteralPath (Join-Path $dist 'config.xml'))) { throw 'Run npm run build first.' }
# The SDK owns certificate handling. Never pass passwords or key material in
# arguments, logs or the repository. The named profile must already exist.
& $TizenCli package -t wgt -s $CertificateProfile -- $dist
if ($LASTEXITCODE -ne 0) { throw 'Tizen signing failed. Check the Samsung certificate profile and TV DUID.' }
$package = Get-ChildItem -LiteralPath $dist -Filter '*.wgt' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $package) { throw 'The SDK did not produce a WGT package.' }
Get-FileHash -LiteralPath $package.FullName -Algorithm SHA256
if ($Target) {
    & $TizenCli install -n $package.Name -t $Target -- $dist
    if ($LASTEXITCODE -ne 0) { throw 'TV installation failed. Check Developer Mode and permit-to-install.' }
    & $TizenCli run -p GSVSKidsTV.KidsTV -t $Target
    if ($LASTEXITCODE -ne 0) { throw 'Installed, but launching Kids TV failed.' }
}
