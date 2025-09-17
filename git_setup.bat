@echo off
echo Setting up GitHub integration for Nova Sniper...

echo Checking git status...
git status

echo Adding remote origin...
git remote -v

echo Checking if we need to force push...
git push -f origin main

echo Setup complete!
pause
