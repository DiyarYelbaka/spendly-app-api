# PROGRESS.md ve NEXT_STEPS.md güncelleme scripti (PowerShell)
# Kullanım: .\scripts\update-progress.ps1 "Yapılan iş açıklaması"

param(
    [Parameter(Mandatory=$true)]
    [string]$Description
)

$Date = Get-Date -Format "yyyy-MM-dd"

# PROGRESS.md'ye ekle
$ProgressFile = "docs\PROGRESS.md"
$NewEntry = "- ✅ $Description - $Date"

Add-Content -Path $ProgressFile -Value ""
Add-Content -Path $ProgressFile -Value $NewEntry

Write-Host "✅ PROGRESS.md güncellendi: $Description" -ForegroundColor Green

