param(
  [string]$BackendBaseUrl = "auto",
  [string]$Message = "preciso de medico",
  [string]$SessionId = "sess_teste_1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Json([string]$Url) {
  try {
    return Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec 15
  } catch {
    Write-Host "Falha GET: $Url" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    return $null
  }
}

function Post-Json([string]$Url, $Body) {
  try {
    return Invoke-RestMethod -Method Post -Uri $Url -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10) -TimeoutSec 30
  } catch {
    Write-Host "Falha POST: $Url" -ForegroundColor Red
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      Write-Host ("HTTP " + [int]$_.Exception.Response.StatusCode) -ForegroundColor Red
    }
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
  }
}

if ($BackendBaseUrl -eq "auto") {
  $candidates = @("http://localhost:8080", "http://localhost:8081")
  $picked = $null
  foreach ($c in $candidates) {
    try {
      Invoke-RestMethod -Method Get -Uri (($c.TrimEnd("/") + "/api/v1/health")) -TimeoutSec 5 | Out-Null
      $picked = $c
      break
    } catch {
    }
  }
  if ($null -eq $picked) {
    Write-Host "Não consegui encontrar o backend em 8080/8081." -ForegroundColor Red
    exit 1
  }
  $BackendBaseUrl = $picked
}

$healthUrl = ($BackendBaseUrl.TrimEnd("/") + "/api/v1/health")
$orStatusUrl = ($BackendBaseUrl.TrimEnd("/") + "/api/v1/openrouter/status")
$chatUrl = ($BackendBaseUrl.TrimEnd("/") + "/api/v1/chat")

Write-Host "Testando backend em: $BackendBaseUrl" -ForegroundColor Cyan

$health = Get-Json $healthUrl
$hs = "UNKNOWN"
if ($null -ne $health -and $null -ne $health.status) { $hs = [string]$health.status }
Write-Host ("Health: " + $hs) -ForegroundColor Green

$or = Get-Json $orStatusUrl
if ($null -ne $or) {
  $configured = $false
  $model = ""
  if ($null -ne $or.configured) { $configured = [bool]$or.configured }
  if ($null -ne $or.model) { $model = [string]$or.model }
  Write-Host ("OpenRouter configured: " + $configured) -ForegroundColor Green
  if ($model.Length -gt 0) { Write-Host ("OpenRouter model: " + $model) -ForegroundColor Green }
} else {
  Write-Host "OpenRouter status: indisponível (endpoint /api/v1/openrouter/status não respondeu)." -ForegroundColor Yellow
}

$resp = Post-Json $chatUrl @{ message = $Message; sessionId = $SessionId }

Write-Host "" 
Write-Host "Resposta do /api/v1/chat:" -ForegroundColor Cyan
Write-Host ("tag.cls: " + $resp.tag.cls)
Write-Host ("tag.txt: " + $resp.tag.txt)
Write-Host ("intro:   " + $resp.intro)
if ($resp.meta) {
  Write-Host ("model:   " + $resp.meta.model)
  Write-Host ("respId:  " + $resp.meta.responseId)
  Write-Host ("sessId:  " + $resp.meta.sessionId)
}

Write-Host "" 
if ($resp.tag -and $resp.tag.txt -match "indispon") {
  Write-Host "STATUS: FALLBACK (provavelmente OPENROUTER_API_KEY nao configurada no backend)." -ForegroundColor Yellow
  Write-Host "Configure OPENROUTER_API_KEY no ambiente do backend e reinicie o Spring." -ForegroundColor Yellow
} else {
  Write-Host "STATUS: OK (resposta do assistente gerada)." -ForegroundColor Green
}
