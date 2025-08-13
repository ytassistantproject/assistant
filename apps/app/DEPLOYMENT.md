# Deployment Guide for YouTube Assist App

## Vercel Deployment Setup

### 1. Environment Variables
In your Vercel dashboard, add the following environment variable:
- **Name**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (the one currently in openaiService.ts)

### 2. Update Browser Extension
Replace the API endpoint in `browser-extension/features/summarize/services/openaiService.ts`:
```typescript
// Change this line:
const response = await fetch('https://your-vercel-app.vercel.app/api/openai', {
// To your actual Vercel deployment URL (found in Vercel dashboard)
```

### 3. Deployment Steps
1. Push your changes to GitHub
2. Vercel will automatically deploy from your GitHub repository
3. Get your deployment URL from the Vercel dashboard
4. Update the browser extension with the new URL
5. Test the extension

### 4. Local Development
For local HTTPS development:
```bash
npm run dev:https
```

For local HTTP development:
```bash
npm run dev
```

### 5. Important Notes
- Vercel handles SSL automatically (no need for custom certificates in production)
- The custom server.js is only for local HTTPS development
- Environment variables must be set in Vercel dashboard, not in code

---
**Last updated**: $(date) - Force deployment trigger 