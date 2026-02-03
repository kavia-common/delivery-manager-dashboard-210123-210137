# Troubleshooting Guide

## Build Errors

### "Cannot find module './832.js'" or similar chunk errors

**Symptoms:**
- Error during `npm run dev` or `npm start`
- Message: `Cannot find module './832.js'` or similar numbered chunk
- Error in webpack-runtime.js

**Root Cause:**
This error occurs when the Next.js build cache (`.next` directory) becomes corrupted or contains references to webpack chunks that no longer exist. This typically happens when:
- Dependencies are updated between builds
- Build process is interrupted (Ctrl+C during build)
- Switching between branches with different dependencies
- Webpack chunk splitting strategy changes between builds

**Solution:**

1. **Clean build cache and rebuild:**
   ```bash
   npm run clean
   npm run build
   ```

2. **If that doesn't work, deep clean:**
   ```bash
   rm -rf .next out node_modules/.cache
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **For development, just clean and restart:**
   ```bash
   npm run clean
   npm run dev
   ```

**Prevention:**
- Use `npm run build:clean` for production builds to ensure a clean slate
- Don't commit `.next` or `out` directories (already in .gitignore)
- After updating dependencies, run `npm run clean` before building
- If switching Git branches with dependency changes, clean before building

## Static Export Issues

This project uses `output: "export"` in `next.config.ts`, which means:
- All pages must be statically exportable (no server-side runtime features)
- No API routes (use external backend)
- No dynamic routes that can't be pre-generated
- No Server Components with dynamic data fetching at request time

If you see errors about unsupported features, verify you're not using:
- API routes in `app/api/`
- `getServerSideProps` or `getStaticProps` (use client-side fetching)
- Server Actions
- Dynamic routes without `generateStaticParams`

## Development Server

If the dev server port is in use:
```bash
# Next.js will automatically try the next available port
npm run dev
# Or specify a port manually
PORT=3001 npm run dev
```

## Static Preview

To preview the production static build locally:
```bash
npm run build
npx serve@latest out -l 3002
```
