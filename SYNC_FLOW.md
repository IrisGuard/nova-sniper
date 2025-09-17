# 🔄 Nova Sniper Automatic Sync Flow

## 📊 Overview
This document describes the automatic synchronization flow for Nova Sniper between repositories.

## 🌊 Sync Flow
```
Base44 Repository → IrisGuard Repository → Render Deployment
     ↓                      ↓                      ↓
Real-time updates    GitHub Actions         Auto-deployment
```

## 🚀 Sync Methods

### 1. ⚡ Real-time Sync (Primary)
- **Trigger**: Every 5 minutes via cron
- **File**: `.github/workflows/sync.yml`
- **Speed**: Near real-time (max 5 min delay)
- **Conflict Resolution**: Automatic (prefers Base44 changes)

### 2. 🌐 Webhook Sync (Instant)
- **Trigger**: Repository dispatch events
- **File**: `.github/workflows/webhook-sync.yml`
- **Speed**: Instant (when webhook configured)
- **Purpose**: Zero-delay synchronization

### 3. 🏥 Health Check & Monitoring
- **Trigger**: Every 6 hours
- **File**: `.github/workflows/health-check.yml`
- **Purpose**: Ensures sync integrity and auto-fixes issues

## 🔧 Configuration

### Required Secrets
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `PAT_TOKEN`: Personal Access Token (if needed for private repos)

### Environment Variables
```yaml
BASE44_REPO: "base44dev/nova-sniper-40448af6"
TARGET_REPO: "IrisGuard/nova-sniper"
```

## 📋 Sync Features

### ✅ What's Included
- ✅ All source code files
- ✅ Configuration files
- ✅ Dependencies (package.json, etc.)
- ✅ Documentation updates
- ✅ Asset files
- ✅ Commit history preservation

### 🛡️ Conflict Resolution
- **Strategy**: Prefer Base44 changes
- **Method**: `--strategy-option=theirs`
- **Fallback**: Manual merge with Base44 priority

### 🚫 What's Excluded
- ❌ `.git` directory internals
- ❌ Temporary files
- ❌ Local development configs
- ❌ IDE-specific files

## 🔍 Monitoring

### Real-time Status
Check the **Actions** tab in GitHub to see:
- 🟢 Sync successful
- 🟡 Sync in progress
- 🔴 Sync failed (auto-retry enabled)

### Health Checks
- Runs every 6 hours
- Compares commit hashes
- Auto-triggers sync if out of sync
- Generates detailed reports

## 🚀 Deployment Flow

### To Render
1. **Base44** commits changes
2. **GitHub Action** syncs to IrisGuard (max 5 min)
3. **Render** detects push and auto-deploys
4. **Live site** updated (Render deployment time)

### Total Time
- **Best case**: ~2-3 minutes (webhook + Render)
- **Typical**: ~5-8 minutes (cron + Render)
- **Worst case**: ~11 minutes (retry + Render)

## 🔧 Manual Operations

### Force Sync
```bash
# Trigger manual sync
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/IrisGuard/nova-sniper/dispatches \
  -d '{"event_type":"sync-trigger"}'
```

### Check Sync Status
```bash
git fetch base44
git log --oneline HEAD..base44/main  # Changes not yet synced
git log --oneline base44/main..HEAD  # Local changes not in Base44
```

## 🛠️ Troubleshooting

### Sync Failed
1. Check Actions tab for error details
2. Manual sync: Go to Actions → Run workflow
3. Contact admin if persistent issues

### Out of Sync
1. Health check will auto-detect
2. Auto-trigger sync workflow
3. Manual intervention if needed

## 📞 Support
- **Repository**: https://github.com/IrisGuard/nova-sniper
- **Actions**: Check workflow runs for detailed logs
- **Status**: All sync operations are logged and monitored

---
*Last updated: $(date '+%Y-%m-%d')*
*Sync flow version: 2.0*
