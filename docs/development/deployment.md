# Deployment Guide

This guide covers deploying NexChat to production environments.

## Prerequisites

- Firebase project set up ([Firebase Setup](../setup/firebase.md))
- Environment variables configured
- Tests passing (`npm run test -- --run`)
- Build succeeding (`npm run build`)

## Build for Production

```bash
npm run build
```

This generates optimized files in `dist/`:

```
dist/
├── index.html
├── assets/
│   ├── js/
│   │   ├── index-[hash].js           # Main bundle
│   │   ├── vendor-react-[hash].js    # React core
│   │   ├── vendor-mui-[hash].js      # MUI components
│   │   ├── vendor-firebase-[hash].js # Firebase SDK
│   │   └── vendor-i18n-[hash].js     # i18next
│   ├── css/
│   │   └── index-[hash].css          # Styles
│   └── fonts/                        # If custom fonts used
```

### Build Optimizations

- **ES2022 target**: Modern JavaScript, smaller bundles
- **Tree shaking**: Unused code eliminated
- **Manual chunking**: Dependencies split for optimal caching
- **Console stripping**: `console.log/debug/trace` removed in production
- **Source maps**: Hidden from public, available for Sentry
- **Minification**: Code minified with esbuild

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables from `.env.local`
   - Set environment (Production, Preview, Development)

4. **Deploy**:
   ```bash
   vercel --prod
   ```

**Automatic Deployments**: Connect your GitHub repo for automatic deployments on push.

### Netlify

1. **Install Netlify CLI**:

   ```bash
   npm i -g netlify-cli
   ```

2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`

4. **Deploy**:

   ```bash
   netlify deploy --prod
   ```

5. **Configure Environment Variables**:
   - Go to Netlify Dashboard → Site settings → Environment variables
   - Add all required variables

### Firebase Hosting

1. **Install Firebase CLI**:

   ```bash
   npm i -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Hosting**:

   ```bash
   firebase init hosting
   ```
   - Public directory: `dist`
   - Single-page app: Yes
   - Automatic builds: No

3. **Build and Deploy**:

   ```bash
   npm run build
   firebase deploy --only hosting
   ```

4. **Configure Environment Variables**:
   - Firebase Hosting doesn't support environment variables natively
   - Use Firebase Functions or inject at build time

### Docker

**Dockerfile**:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and Run**:

```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY=your_key \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your_domain \
  --build-arg VITE_FIREBASE_PROJECT_ID=your_project \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=your_bucket \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender \
  --build-arg VITE_FIREBASE_APP_ID=your_app \
  -t nexchat .

docker run -p 80:80 nexchat
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test Google Sign-In flow
- [ ] Check Firestore Security Rules are published
- [ ] Verify Sentry is receiving errors (if configured)
- [ ] Test real-time message sync
- [ ] Check mobile responsiveness
- [ ] Verify environment variables are set
- [ ] Test error boundaries (trigger a test error)

## Monitoring

### Sentry Error Tracking

If Sentry is configured, monitor:

- New errors in Sentry dashboard
- Error frequency and trends
- User impact (how many users affected)
- Release health

### Firebase Console

Monitor:

- Firestore reads/writes (cost tracking)
- Authentication sign-ins
- Performance metrics

### Vercel/Netlify Analytics

- Page views and unique visitors
- Performance scores (Lighthouse)
- Build times and deployment frequency

## Rollback Strategy

### Vercel

```bash
vercel rollback
```

### Netlify

```bash
netlify rollback
```

### Manual

```bash
# Deploy previous version
git checkout <previous-commit>
npm run build
# Deploy dist/ manually
```

## Security Considerations

### Firestore Security Rules

Ensure security rules are **published** and restrictive:

- Users can only access their own data
- Room members can only access their rooms
- Messages are immutable (no updates)

### Environment Variables

- Never commit `.env.local` to version control
- Use platform secrets management (Vercel, Netlify)
- Rotate Firebase keys if compromised

### HTTPS

- Always deploy with HTTPS (Vercel/Netlify do this automatically)
- Firebase Auth requires HTTPS in production

### Content Security Policy (Optional)

Add CSP headers for additional security:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
"
/>
```

## Performance Optimization

### Caching Strategy

```nginx
# Cache static assets for 1 year
location /assets {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location / {
  add_header Cache-Control "no-cache";
}
```

### CDN

Vercel and Netlify automatically serve assets from CDN. For custom deployments:

- Use Cloudflare CDN
- Configure cache headers
- Enable Brotli compression

### Bundle Analysis

Analyze bundle size:

```bash
npm run build -- --mode production
npx vite-bundle-analyzer dist/assets/js/*.js
```

Look for:

- Unexpected large dependencies
- Duplicate dependencies
- Unused code

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### "Missing required environment variables" in Production

- **Cause**: Environment variables not set in deployment platform
- **Solution**: Add variables to platform's environment settings

### Blank Page After Deployment

- **Cause**: Missing `index.html` or incorrect base path
- **Solution**: Verify `dist/index.html` exists, check Vite `base` config

### 404 on Page Refresh

- **Cause**: Server not configured for SPA routing
- **Solution**: Configure server to redirect all routes to `index.html`

### Firebase Auth Redirect Loop

- **Cause**: Domain not in Authorized Domains
- **Solution**: Add production domain to Firebase Authentication settings

### CORS Errors

- **Cause**: Firestore Security Rules blocking access
- **Solution**: Verify security rules allow your domain
