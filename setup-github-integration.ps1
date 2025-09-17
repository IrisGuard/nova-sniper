# Nova Sniper GitHub Integration Setup
Write-Host "🚀 Setting up GitHub Integration for Nova Sniper..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\nova-sniper-40448af6"

# Check current Git status
Write-Host "📋 Checking Git status..." -ForegroundColor Yellow
git status

# Check existing remotes
Write-Host "🔗 Checking existing remotes..." -ForegroundColor Yellow
git remote -v

# Add or update origin remote
Write-Host "🌐 Setting up GitHub remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/IrisGuard/nova-sniper.git

# Ensure we're on main branch
Write-Host "🌿 Setting up main branch..." -ForegroundColor Yellow
git branch -M main

# Add all files if not already staged
Write-Host "📁 Adding all files..." -ForegroundColor Yellow
git add .

# Commit if there are changes
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Setup: GitHub integration and project sync"
}

# Force push to GitHub (since remote may have different history)
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Yellow
git push -f origin main

# Set upstream
git branch --set-upstream-to=origin/main main

Write-Host "✅ GitHub integration setup complete!" -ForegroundColor Green
Write-Host "📊 Repository: https://github.com/IrisGuard/nova-sniper" -ForegroundColor Cyan
