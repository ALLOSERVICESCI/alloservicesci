#!/bin/bash

# EAS Update Deployment Scripts for Allô Services CI
# These scripts demonstrate how to publish Over-The-Air (OTA) updates

echo "🚀 Allô Services CI - EAS Update Deployment Scripts"
echo "=================================================="

# Function to publish update to preview channel
publish_preview() {
    echo "📦 Publishing update to PREVIEW channel..."
    echo ""
    echo "Command to run:"
    echo "eas update --channel preview --message \"Preview update: $(date '+%Y-%m-%d %H:%M')\""
    echo ""
    echo "This will:"
    echo "- Build the JavaScript bundle"
    echo "- Upload to Expo's CDN"
    echo "- Make it available to preview builds"
    echo "- Update automatically on app restart"
}

# Function to publish update to production channel
publish_production() {
    echo "🌟 Publishing update to PRODUCTION channel..."
    echo ""
    echo "Command to run:"
    echo "eas update --channel production --message \"Production update: $(date '+%Y-%m-%d %H:%M')\""
    echo ""
    echo "This will:"
    echo "- Build the JavaScript bundle"
    echo "- Upload to Expo's CDN"
    echo "- Make it available to production builds"
    echo "- Update automatically on app launch"
}

# Function to check update status
check_updates() {
    echo "📊 Checking update status..."
    echo ""
    echo "Commands to run:"
    echo "eas update:list --channel preview"
    echo "eas update:list --channel production"
    echo ""
    echo "This will show:"
    echo "- List of published updates"
    echo "- Update IDs and timestamps"
    echo "- Which builds are receiving updates"
}

# Function to rollback updates
rollback_update() {
    echo "🔄 Rolling back updates..."
    echo ""
    echo "Commands to run:"
    echo "eas update --channel preview --message \"Rollback to previous version\""
    echo "# Or use specific update ID:"
    echo "eas update:republish --channel preview --update-id <UPDATE_ID>"
    echo ""
    echo "This will:"
    echo "- Revert to a previous working version"
    echo "- Provide immediate fix for critical issues"
    echo "- Maintain app functionality"
}

# Function to build new standalone app
build_app() {
    echo "📱 Building standalone app..."
    echo ""
    echo "Commands to run:"
    echo "# For internal testing:"
    echo "eas build --platform all --profile preview"
    echo ""
    echo "# For production release:"
    echo "eas build --platform all --profile production"
    echo ""
    echo "This will:"
    echo "- Create installable app files (APK/AAB for Android, IPA for iOS)"
    echo "- Include the latest JavaScript code"
    echo "- Set up proper update channels"
}

# Function to submit to app stores
submit_app() {
    echo "🏪 Submitting to app stores..."
    echo ""
    echo "Commands to run:"
    echo "# Submit to Google Play Store:"
    echo "eas submit --platform android --profile production"
    echo ""
    echo "# Submit to Apple App Store:"
    echo "eas submit --platform ios --profile production"
    echo ""
    echo "This will:"
    echo "- Upload builds to respective app stores"
    echo "- Handle store submission process"
    echo "- Require proper credentials and certificates"
}

echo "Available commands:"
echo "1. publish_preview    - Publish OTA update to preview channel"
echo "2. publish_production - Publish OTA update to production channel"
echo "3. check_updates      - Check status of published updates"
echo "4. rollback_update    - Rollback to previous update"
echo "5. build_app          - Build new standalone app"
echo "6. submit_app         - Submit app to stores"
echo ""

# Run the requested function
case "$1" in
    "preview")
        publish_preview
        ;;
    "production")
        publish_production
        ;;
    "status")
        check_updates
        ;;
    "rollback")
        rollback_update
        ;;
    "build")
        build_app
        ;;
    "submit")
        submit_app
        ;;
    *)
        echo "Usage: $0 {preview|production|status|rollback|build|submit}"
        echo ""
        echo "Examples:"
        echo "./deploy-updates.sh preview      # Publish to preview channel"
        echo "./deploy-updates.sh production   # Publish to production channel"
        echo "./deploy-updates.sh status       # Check update status"
        ;;
esac

echo ""
echo "🔗 Useful EAS Update Documentation:"
echo "- https://docs.expo.dev/eas-update/introduction/"
echo "- https://docs.expo.dev/eas-update/deployment/"
echo "- https://docs.expo.dev/eas-update/develop-faster/"
echo ""
echo "⚠️  Remember:"
echo "- Updates only affect JavaScript code, not native code changes"
echo "- Native changes require new builds"
echo "- Test updates thoroughly before production release"
echo "- Keep runtime versions synchronized"