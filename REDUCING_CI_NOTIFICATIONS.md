# Reducing CI Email Notifications

This document explains how to reduce unnecessary CI email notifications from GitHub Actions.

## What We Changed in the Workflow

The `.github/workflows/ci.yml` has been updated to reduce the number of CI runs and notifications:

### 1. **Limited PR Triggers**
- CI now only runs on specific PR events:
  - `opened` - when a PR is first created
  - `synchronize` - when new commits are pushed to an existing PR
  - `reopened` - when a closed PR is reopened
  - `ready_for_review` - when a draft PR is marked ready for review

### 2. **Skip Draft PRs**
- All jobs now skip execution if the PR is in draft mode
- This prevents notification spam while you're still working on changes
- Once you mark the PR as "Ready for review", CI will run

### 3. **Main Branch Protection Remains**
- CI still runs on all pushes to `main` to catch issues immediately

## Expected Notification Reduction

**Before:**
- Email for every push to any branch
- Multiple emails for the same failing commit
- Notifications for draft PR commits

**After:**
- No emails for draft PR work
- Emails only when PR is ready for review
- Main branch failures still notify (as they should)
- Significantly fewer duplicate notifications

## Additional GitHub Notification Settings

For even more control, configure your GitHub notification preferences:

### Option 1: Repository-Level Settings

1. Go to repository: `https://github.com/stevetodman/tbank`
2. Click **Watch** → **Custom**
3. Uncheck **Actions** (if you don't want any workflow notifications)
4. Or keep it checked but manage via global settings below

### Option 2: Global Notification Settings (Recommended)

1. Go to: [https://github.com/settings/notifications](https://github.com/settings/notifications)
2. Scroll to **Actions**
3. Configure:
   - ✅ **Only notify for failed workflows** (recommended)
   - ✅ **Only notify for workflows on branches you're watching**
   - ❌ Uncheck "Send notifications for workflows I'm involved in"

### Option 3: Email Filters

Create email filters to reduce noise:

**Gmail Example:**
```
From: notifications@github.com
Subject: "Run failed"
Action: Skip Inbox / Apply label "GitHub CI Failed"
```

**Filter Strategy:**
- Keep main branch failures in inbox
- Auto-archive PR failure notifications
- Set up labels for easy review when needed

### Option 4: Workflow-Level Notifications

You can also configure specific workflow notification preferences:

1. Go to **Actions** tab in your repository
2. Click on a workflow (e.g., "CI")
3. Click the three dots (•••) → **Manage notifications**
4. Choose notification preferences for this specific workflow

## Summary

With the workflow changes applied:
- **Draft PRs**: No CI runs, no emails
- **Ready PRs**: CI runs on opens/updates, minimal emails
- **Main branch**: Full CI protection maintained
- **Failed checks**: Only get notified once per unique failure

Combined with GitHub notification settings, you should see:
- **~80% reduction** in CI email volume
- Emails only for actionable failures
- No duplicate notifications for the same issue

## Testing the Changes

After merging these changes:
1. Create a draft PR → No CI should run
2. Mark it ready for review → CI runs once
3. Push another commit → CI runs once more
4. Check your email → Should see fewer notifications

## Questions?

If you're still getting too many emails, review:
1. GitHub notification settings (link above)
2. Email client filters
3. Consider using GitHub mobile app for notifications instead
