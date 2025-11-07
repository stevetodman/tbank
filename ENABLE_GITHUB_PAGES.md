# How to Enable GitHub Pages - Fix 403 Error

## Current Status

✅ **Deployment workflow is installed and ran successfully**
- Workflow file exists: `.github/workflows/deploy-pages.yml`
- Workflow ran: "Deploy to GitHub Pages #1" completed successfully
- Branch: `main` is up to date

❌ **GitHub Pages is NOT enabled in repository settings**
- Site returns: **403 Forbidden** (not 404)
- Error message: "Access denied"
- Root cause: Pages feature not activated

## Why You're Getting 403 Instead of the Site

The workflow successfully uploaded the `docs/` folder as an artifact, but GitHub Pages is not enabled in your repository settings. Without Pages enabled, GitHub won't serve the content even though the workflow completes successfully.

A **403 Forbidden** error means:
- The GitHub Pages URL exists as an endpoint
- But the Pages feature isn't enabled to serve content
- Access is denied because Pages isn't configured

## SOLUTION: Enable GitHub Pages (2 minutes)

### Step 1: Go to Repository Settings

Visit: **https://github.com/stevetodman/tbank/settings/pages**

### Step 2: Configure the Source

Under "Build and deployment":

1. **Source**: Select **"GitHub Actions"** from the dropdown
   - ⚠️ DO NOT select "Deploy from a branch"
   - The dropdown should say "GitHub Actions"

2. You should see a note that says:
   > "Your site will be deployed from the GitHub Actions workflow in your repository"

3. **Click "Save"** if there's a save button (sometimes it auto-saves)

### Step 3: Wait for Deployment

- The workflow should automatically trigger (or wait for next push to main)
- Check workflow status: https://github.com/stevetodman/tbank/actions
- Deployment takes 1-2 minutes

### Step 4: Verify the Site

Visit: **https://stevetodman.github.io/tbank/**

You should see the TBank homepage, not a 403 error.

## Alternative: Manual Trigger

If the workflow doesn't auto-trigger after enabling Pages:

1. Go to: https://github.com/stevetodman/tbank/actions/workflows/deploy-pages.yml
2. Click "Run workflow" button (top right)
3. Select branch: `main`
4. Click green "Run workflow" button
5. Wait 1-2 minutes
6. Check: https://stevetodman.github.io/tbank/

## What to Expect After Enabling

1. **First deployment**: Takes 2-3 minutes
2. **Site URL**: https://stevetodman.github.io/tbank/
3. **Automatic updates**: Every push to `main` will redeploy
4. **Deployment status**: Visible at https://github.com/stevetodman/tbank/deployments

## Verification Checklist

After enabling Pages, verify:

- [ ] Main page loads: https://stevetodman.github.io/tbank/
- [ ] No 403 or 404 errors
- [ ] CSS styles are applied
- [ ] Navigation menu works
- [ ] Interactive practice page: https://stevetodman.github.io/tbank/questions/
- [ ] Question data loads correctly

## Still Having Issues?

If you still see errors after enabling Pages:

1. Check deployment status: https://github.com/stevetodman/tbank/deployments
2. Check workflow runs: https://github.com/stevetodman/tbank/actions
3. Look for any failed workflow runs or error messages
4. Try manually triggering the workflow
5. Check browser cache (try incognito/private mode)

## Why This Happened

The workflow was added and runs successfully, but GitHub Pages is a repository feature that must be explicitly enabled in Settings. The workflow can upload artifacts all day, but without Pages enabled, GitHub won't create the hosting environment to serve the content.

This is a one-time configuration step that's separate from the workflow itself.
