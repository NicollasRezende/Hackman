Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Encode-Command([string]$Command) {
  $bytes = [System.Text.Encoding]::Unicode.GetBytes($Command)
  return [Convert]::ToBase64String($bytes)
}

function Import-DotEnv([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $lines = Get-Content -LiteralPath $Path -ErrorAction Stop
  foreach ($line in $lines) {
    $t = ""
    if ($null -ne $line) { $t = $line.Trim() }
    if ($t.Length -eq 0) { continue }
    if ($t.StartsWith("#")) { continue }
    $idx = $t.IndexOf("=")
    if ($idx -lt 1) { continue }
    $key = $t.Substring(0, $idx).Trim()
    $value = $t.Substring($idx + 1)
    if ($value.StartsWith('"') -and $value.EndsWith('"') -and $value.Length -ge 2) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    [Environment]::SetEnvironmentVariable($key, $value, "Process")
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

Import-DotEnv (Join-Path $root ".env")
Import-DotEnv (Join-Path $root "backend\.env")

$cors = [Environment]::GetEnvironmentVariable("CORS_ALLOWED_ORIGINS", "Process")
if ([string]::IsNullOrWhiteSpace($cors)) {
  $cors = "*"
} else {
  if ($cors -notmatch "^\*$") { $cors = "$cors,*" }
}
[Environment]::SetEnvironmentVariable("CORS_ALLOWED_ORIGINS", $cors, "Process")

$backendDir = Join-Path $root "backend"

$mvnwCmdPath = Join-Path $backendDir "mvnw.cmd"
$backendRunnerKind = $null
if (Test-Path -LiteralPath $mvnwCmdPath) {
  $backendRunnerKind = "mvnw-cmd"
} else {
  $mvn = Get-Command mvn -ErrorAction SilentlyContinue
  if ($null -ne $mvn) {
    $backendRunnerKind = "mvn"
  }
}

if ($null -eq $backendRunnerKind) {
  throw "Não foi possível iniciar o backend. Verifique se existe backend\mvnw.cmd ou instale o Maven (mvn) no Windows."
}

$orKey = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($orKey)) {
  Write-Host "Aviso: OPENROUTER_API_KEY não está definida. O chat vai cair no fallback." -ForegroundColor Yellow
}

Write-Host "Iniciando backend (Spring)..." -ForegroundColor Cyan
$backendRunnerLabel = $backendRunnerKind
Write-Host ("Backend runner: " + $backendRunnerLabel) -ForegroundColor DarkGray

$backendCmd = @'
try {
  $runnerKind = '__BACKEND_RUNNER_KIND__'

  if ($runnerKind -eq 'mvnw-cmd') {
    & '.\mvnw.cmd' spring-boot:run
  } elseif ($runnerKind -eq 'mvn') {
    & 'mvn' spring-boot:run
  } else {
    throw 'Nenhum runner do backend encontrado.'
  }
} catch {
  Write-Host ''
  Write-Host 'Backend finalizou com erro:' -ForegroundColor Red
  Write-Host `$_.Exception.Message -ForegroundColor Red
  Read-Host 'Pressione Enter para fechar'
}
'@
$backendCmd = $backendCmd.
  Replace('__BACKEND_RUNNER_KIND__', $backendRunnerKind).
  Replace('__BACKEND_RUNNER_KIND__', $backendRunnerKind)
try {
  $backend = Start-Process -FilePath "powershell.exe" -WorkingDirectory $backendDir -ArgumentList @(
    "-NoProfile",
    "-NoExit",
    "-EncodedCommand", (Encode-Command $backendCmd)
  ) -PassThru -ErrorAction Stop
} catch {
  Write-Host "Falha ao iniciar backend: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host "Pressione Enter para fechar"
  exit 1
}

Write-Host "Iniciando frontend (Vite)..." -ForegroundColor Cyan
$frontendCmd = @"
try {
  npm run dev
} catch {
  Write-Host ''
  Write-Host 'Frontend finalizou com erro:' -ForegroundColor Red
  Write-Host `$_.Exception.Message -ForegroundColor Red
  Read-Host 'Pressione Enter para fechar'
}
"@
try {
  $frontend = Start-Process -FilePath "powershell.exe" -WorkingDirectory $root -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-EncodedCommand", (Encode-Command $frontendCmd)
  ) -PassThru -ErrorAction Stop
} catch {
  Write-Host "Falha ao iniciar frontend: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host "Pressione Enter para fechar"
  exit 1
}

Write-Host "" 
Write-Host "Rodando:" -ForegroundColor Green
Write-Host "  Backend PID:  $($backend.Id) (porta 8080)" -ForegroundColor Green
Write-Host "  Frontend PID: $($frontend.Id) (porta 5173/5174)" -ForegroundColor Green
Write-Host "" 
Write-Host "Para parar, feche as duas janelas abertas." -ForegroundColor Yellow
