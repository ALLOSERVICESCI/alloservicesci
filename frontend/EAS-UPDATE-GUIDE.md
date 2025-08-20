# EAS Update (OTA) Deployment Guide

## Overview
EAS Updates enables Over-The-Air (OTA) updates for the Allô Services CI mobile app. This allows you to push JavaScript code changes directly to users without requiring them to download a new version from app stores.

## Configuration Status ✅
The app is now configured for EAS Updates with:
- **Update channels**: `preview` and `production`
- **Runtime version**: Based on app version
- **Automatic updates**: Enabled on app load
- **Fallback timeout**: 10 seconds

## Quick Start

### Prerequisites
1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Login to Expo: `eas login`
3. Ensure you're in the `/app/frontend` directory

### Publishing Updates

#### Preview Channel (Testing)
```bash
cd /app/frontend
eas update --channel preview --message "Test update - new premium features"
```

#### Production Channel (Live Users)
```bash
cd /app/frontend
eas update --channel production --message "Production update - bug fixes"
```

### Using the Deploy Script
```bash
# Navigate to scripts directory
cd /app/frontend/scripts

# Publish to preview
./deploy-updates.sh preview

# Publish to production
./deploy-updates.sh production

# Check update status
./deploy-updates.sh status

# See all options
./deploy-updates.sh
```

## Update Workflow

### 1. Development & Testing
- Make code changes in your development environment
- Test thoroughly using Expo Go or development builds
- Publish to preview channel for staging tests

### 2. Preview Deployment
```bash
eas update --channel preview --message "Feature: Added new category content"
```
- Internal team testing
- QA validation
- User acceptance testing

### 3. Production Deployment
```bash
eas update --channel production --message "Release: Premium content and bug fixes"
```
- Live user deployment
- Monitor for issues
- Roll back if needed

### 4. Rollback (if needed)
```bash
# Rollback to previous update
eas update:republish --channel production --update-id <PREVIOUS_UPDATE_ID>
```

## What Can Be Updated via OTA

### ✅ JavaScript Changes (OTA Compatible)
- UI components and screens
- Business logic
- API endpoints and data fetching
- Styling and layout
- Text content and translations
- App navigation

### ❌ Native Changes (Requires New Build)
- Adding new permissions
- Installing new native dependencies
- Changing app.json configuration
- Updating Expo SDK version
- Modifying native code

## Monitoring Updates

### Check Update Status
```bash
# List all updates for preview channel
eas update:list --channel preview

# List all updates for production channel
eas update:list --channel production

# View specific update details
eas update:view <UPDATE_ID>
```

### Update Analytics
- Monitor update adoption rates in Expo dashboard
- Track rollback rates and user engagement
- Review crash reports and user feedback

## Best Practices

### 1. Testing Strategy
- Always test updates in preview channel first
- Use development builds for comprehensive testing
- Validate on both iOS and Android
- Test with different network conditions

### 2. Deployment Safety
- Deploy during low-traffic hours
- Monitor app performance post-deployment
- Have rollback plan ready
- Keep update messages descriptive

### 3. Version Management
- Use semantic versioning for updates
- Tag important releases
- Maintain update changelog
- Coordinate with app store releases

## Emergency Procedures

### Critical Bug Fix
```bash
# Quick fix to production
eas update --channel production --message "HOTFIX: Critical payment issue resolved"
```

### Immediate Rollback
```bash
# Find previous working update
eas update:list --channel production

# Rollback to specific update
eas update:republish --channel production --update-id <WORKING_UPDATE_ID>
```

## Configuration Files

### `eas.json` - Build and Update Configuration
- Defines build profiles and channels
- Sets environment variables per channel
- Configures update channels

### `app.json` - App Configuration
- Update URL and settings
- Runtime version policy
- Update behavior configuration

## Troubleshooting

### Update Not Appearing
1. Check update channel matches build
2. Verify runtime version compatibility
3. Force close and restart app
4. Check network connectivity

### Build Failing
1. Verify EAS CLI is updated
2. Check build logs in Expo dashboard
3. Ensure all dependencies are compatible
4. Clear cache and retry

## Support Resources
- [EAS Update Documentation](https://docs.expo.dev/eas-update/)
- [Expo Dashboard](https://expo.dev/accounts/alloservicesci/projects)
- [EAS CLI Reference](https://docs.expo.dev/eas-update/deployment/)

---

**⚠️ Important**: Always test updates thoroughly before production deployment. OTA updates affect all users immediately and cannot be undone automatically.