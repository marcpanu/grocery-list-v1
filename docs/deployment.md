# Deployment Guide

## Vercel Deployment

### Prerequisites
- Node.js 18.x
- Git repository
- Vercel account
- Project dependencies in correct location (not in devDependencies)

### Configuration Files

#### package.json
```json
{
  "name": "shopping-list",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "node node_modules/typescript/bin/tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### Deployment Steps

1. **Prepare Your Repository**
   - Ensure all changes are committed
   - Push to your main branch
   - Verify build works locally

2. **Connect to Vercel**
   - Log into Vercel
   - Create new project
   - Select your repository
   - Choose Vite framework preset

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node.js Version: 18.x

4. **Environment Variables**
   - No environment variables required for basic setup
   - Add any API keys or configuration as needed

5. **Deploy**
   - Click "Deploy"
   - Wait for build and deployment
   - Verify deployment success

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check build command in package.json
   - Verify all dependencies are in correct location
   - Review build logs for errors

2. **Runtime Errors**
   - Check browser console
   - Verify environment variables
   - Review server logs

3. **Performance Issues**
   - Enable automatic minification
   - Configure caching headers
   - Enable compression

### Monitoring

- Use Vercel Analytics
- Monitor build times
- Track deployment success rate
- Review performance metrics

### Automatic Deployments

- Enabled by default for main branch
- Configure preview deployments
- Set up branch protection rules

### Rollback Process

1. Go to project dashboard
2. Select "Deployments"
3. Find previous working deployment
4. Click "Promote to Production"

### Best Practices

1. **Version Control**
   - Use meaningful commit messages
   - Tag releases
   - Maintain clean branch history

2. **Testing**
   - Run tests before deployment
   - Test in preview environment
   - Verify critical paths

3. **Documentation**
   - Update deployment docs
   - Document configuration changes
   - Maintain changelog

4. **Security**
   - Review dependencies
   - Scan for vulnerabilities
   - Update regularly 