# Deployment Setup

This project uses GitHub Actions with `nx affected` to automatically deploy only the apps that have changes to Coolify.

## How It Works

1. When you push to `main`, GitHub Actions runs
2. It checks which apps are affected by the changes using `nx affected`
3. Only affected apps trigger their Coolify deployment webhooks
4. Coolify rebuilds and deploys only the affected apps

## Setup Instructions

### 1. Get Coolify API Token

1. Go to Coolify Settings
2. Navigate to **API** or **Tokens** section
3. Create a new API token
4. Copy the token (you'll only see it once!)

### 2. Get Application UUIDs

For each application in Coolify:

1. Go to the application settings
2. Find the UUID (in the URL or settings, looks like: `ykg808g004sco4gwo4sogo08`)

You'll need:
- UUID for `myhost`
- UUID for `mymemory`

### 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - **Name**: `COOLIFY_API_TOKEN`
   - **Value**: Your Coolify API token

   - **Name**: `COOLIFY_URL`
   - **Value**: Your Coolify URL (e.g., `http://54.36.121.9:8000`)

   - **Name**: `COOLIFY_UUID_MYHOST`
   - **Value**: UUID for myhost application

   - **Name**: `COOLIFY_UUID_MYMEMORY`
   - **Value**: UUID for mymemory application

### 4. Configure Coolify Applications

For both applications in Coolify:

1. **Disable automatic deployments** on git push (Settings → uncheck "Deploy on push")
2. Make sure the Dockerfile paths are correct:
   - myhost: `apps/myhost/Dockerfile`
   - mymemory: `apps/mymemory/Dockerfile`

### 5. Test the Setup

1. Make a change to one app (e.g., edit a file in `apps/myhost/`)
2. Commit and push to `main`
3. Go to **GitHub Actions** tab to see the workflow run
4. Only the affected app should trigger deployment
5. Check Coolify to see the deployment

## Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy Affected Apps** workflow
3. Click **Run workflow**
4. Choose the branch
5. Click **Run workflow**

## Troubleshooting

### All apps deploy even when only one changed

- Check that your commit history is preserved (don't squash all commits)
- The workflow compares `HEAD` with `origin/main`

### API call doesn't trigger deployment

- Verify API token is correct in GitHub Secrets
- Check that UUIDs are correct for each app
- Verify the Coolify URL is accessible from GitHub Actions
- Look at GitHub Actions logs for the curl response
- Check Coolify logs for API errors

### npm install hangs in the workflow

- The workflow only does a minimal install for `nx` commands
- It doesn't build anything, just checks affected projects
- If it hangs, add `timeout-minutes: 10` to the install step
