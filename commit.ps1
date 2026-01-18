param(
    [Parameter(Mandatory=$true)]
    [string]$message
)

$gitPath = "C:\Program Files\Git\cmd\git.exe"

if (-not (Test-Path $gitPath)) {
    Write-Error "Git executable not found at $gitPath"
    exit 1
}

Write-Host "Adding files..."
& $gitPath add .

Write-Host "Committing with message: $message"
& $gitPath commit -m "$message"

Write-Host "Status:"
& $gitPath status
