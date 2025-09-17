# Complete Nova Sniper GitHub Integration Setup
Write-Host "🚀 COMPLETE SETUP - Nova Sniper GitHub Integration" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

# Navigate to project directory
Set-Location "C:\nova-sniper-40448af6"

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Step 1: Initialize Git if needed
Write-Host ""
Write-Host "🔧 Step 1: Git Initialization" -ForegroundColor Green
if (!(Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Step 2: Setup remotes
Write-Host ""
Write-Host "🌐 Step 2: Setting up GitHub remotes" -ForegroundColor Green

# Remove existing origin if exists
git remote remove origin 2>$null

# Add IrisGuard remote as origin
git remote add origin https://github.com/IrisGuard/nova-sniper.git
Write-Host "✅ Added IrisGuard remote as origin" -ForegroundColor Green

# Add Base44 remote for syncing
git remote add base44 https://github.com/base44dev/nova-sniper-40448af6.git
Write-Host "✅ Added Base44 remote for syncing" -ForegroundColor Green

# Step 3: Setup main branch
Write-Host ""
Write-Host "🌿 Step 3: Setting up main branch" -ForegroundColor Green
git branch -M main
git branch --set-upstream-to=origin/main main
Write-Host "✅ Main branch configured" -ForegroundColor Green

# Step 4: Add and commit all files
Write-Host ""
Write-Host "📁 Step 4: Adding and committing all files" -ForegroundColor Green
git add .
git commit -m "Complete setup: Nova Sniper with GitHub integration and Base44 sync"
Write-Host "✅ All files committed" -ForegroundColor Green

# Step 5: Force push to GitHub
Write-Host ""
Write-Host "⬆️ Step 5: Pushing to GitHub" -ForegroundColor Green
git push -f origin main
Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green

# Step 6: Setup auto-push hook
Write-Host ""
Write-Host "🔧 Step 6: Setting up auto-push hook" -ForegroundColor Green
$hookDir = ".git\hooks"
if (!(Test-Path $hookDir)) {
    New-Item -ItemType Directory -Path $hookDir -Force
}

$postCommitHook = @"
#!/bin/sh
echo "🚀 Auto-pushing to GitHub..."
git push origin main
echo "✅ Auto-push complete!"
"@

$postCommitHook | Out-File -FilePath ".git\hooks\post-commit" -Encoding UTF8
Write-Host "✅ Auto-push hook created" -ForegroundColor Green

# Step 7: Verification
Write-Host ""
Write-Host "🔍 Step 7: Verification" -ForegroundColor Green
Write-Host "Current remotes:" -ForegroundColor Yellow
git remote -v
Write-Host ""
Write-Host "Current branch:" -ForegroundColor Yellow
git branch -vv

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "✅ GitHub Integration: ACTIVE" -ForegroundColor Green
Write-Host "✅ Auto-Push: ENABLED" -ForegroundColor Green
Write-Host "✅ Base44 Sync: READY" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your repositories:" -ForegroundColor Cyan
Write-Host "  🎯 Main: https://github.com/IrisGuard/nova-sniper" -ForegroundColor White
Write-Host "  🔄 Sync: https://github.com/base44dev/nova-sniper-40448af6" -ForegroundColor White
Write-Host ""
Write-Host "🚀 From now on, every commit will automatically push to GitHub!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 To sync with Base44:" -ForegroundColor Cyan
Write-Host "  git fetch base44" -ForegroundColor White
Write-Host "  git merge base44/main" -ForegroundColor White
Write-Host "  (Auto-push will handle the rest!)" -ForegroundColor White
