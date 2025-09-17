# Auto Push Setup - Αυτόματο push μετά από κάθε commit
Write-Host "🔧 Setting up auto-push after commits..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\nova-sniper-40448af6"

# Create post-commit hook directory if it doesn't exist
$hookDir = ".git\hooks"
if (!(Test-Path $hookDir)) {
    New-Item -ItemType Directory -Path $hookDir -Force
}

# Create post-commit hook for auto-push
$postCommitHook = @"
#!/bin/sh
# Auto push to GitHub after each commit
echo "🚀 Auto-pushing to GitHub..."
git push origin main
echo "✅ Push complete!"
"@

# Write the hook file
$postCommitHook | Out-File -FilePath ".git\hooks\post-commit" -Encoding UTF8

# Make the hook executable (Windows)
if (Test-Path ".git\hooks\post-commit") {
    Write-Host "✅ Auto-push hook created successfully!" -ForegroundColor Green
    Write-Host "📋 Now every commit will automatically push to GitHub" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to create hook" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Setup complete! From now on:" -ForegroundColor Yellow
Write-Host "  1. Make changes to your code" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor White
Write-Host "  3. git commit -m 'your message'" -ForegroundColor White
Write-Host "  4. 🚀 Automatic push to GitHub!" -ForegroundColor Green
