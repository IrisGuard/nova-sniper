# Nova Sniper Base44 Sync Setup
Write-Host "🔄 Setting up Base44 repository sync..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\nova-sniper-40448af6"

# Add Base44 remote as upstream
Write-Host "🌐 Adding Base44 remote..." -ForegroundColor Yellow
git remote add base44 https://github.com/base44dev/nova-sniper-40448af6.git

# Fetch from Base44
Write-Host "📥 Fetching from Base44..." -ForegroundColor Yellow
git fetch base44

# Check remotes
Write-Host "🔗 Current remotes:" -ForegroundColor Yellow
git remote -v

Write-Host "✅ Base44 sync setup complete!" -ForegroundColor Green
Write-Host "📋 Available remotes:" -ForegroundColor Cyan
Write-Host "  - origin: https://github.com/IrisGuard/nova-sniper" -ForegroundColor White
Write-Host "  - base44: https://github.com/base44dev/nova-sniper-40448af6" -ForegroundColor White

Write-Host ""
Write-Host "🔄 To sync with Base44 in the future, use:" -ForegroundColor Yellow
Write-Host "  git fetch base44" -ForegroundColor White
Write-Host "  git merge base44/main" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
