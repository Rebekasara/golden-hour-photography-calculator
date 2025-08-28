# Vercel Deployment Guide

This guide will help you deploy the Golden Hour Calculator to Vercel with all necessary configurations.

## Prerequisites

- Vercel account ([sign up here](https://vercel.com))
- GitHub account with this repository
- API keys for external services

## Quick Deployment

### Option 1: Deploy Button

Click the deploy button in the README to automatically deploy to Vercel.

### Option 2: Manual Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

## Environment Variables

Add these environment variables in your Vercel project settings:

### Required Variables

```env
NEXTAUTH_SECRET=your-secret-key-32-chars-minimum
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
```

### Optional Variables

```env
DATABASE_URL=your-database-connection-string
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
UNSPLASH_APPLICATION_ID=your-unsplash-app-id
UNSPLASH_SECRET_KEY=your-unsplash-secret
PEXELS_API_KEY=your-pexels-api-key
```

## Getting API Keys

### OpenWeatherMap (Required)
1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add to `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### Unsplash (Optional)
1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key, Application ID, and Secret Key
4. Add to respective environment variables

### Pexels (Optional)
1. Visit [Pexels API](https://www.pexels.com/api/)
2. Sign up and generate an API key
3. Add to `PEXELS_API_KEY`

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to Storage tab
3. Create a new Postgres database
4. Copy the connection string to `DATABASE_URL`

### Option 2: External Database
Use any PostgreSQL provider (Supabase, PlanetScale, etc.) and add the connection string to `DATABASE_URL`.

### Option 3: SQLite (Development)
For development, you can use SQLite by setting:
```env
DATABASE_URL="file:./dev.db"
```

## Security Notes

- **Never commit `.env` files** to your repository
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Restrict API keys to your domain when possible
- Enable CORS protection in production

## Custom Domain

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to use your custom domain

## Troubleshooting

### Build Failures
- Check that all required environment variables are set
- Ensure API keys are valid and have proper permissions
- Review build logs in Vercel dashboard

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify database connection string
- Ensure all external APIs are accessible

### Performance Issues
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Optimize images and API calls

## Performance Optimization

- **Image Optimization**: Automatically handled by Next.js
- **Caching**: Static assets cached for 1 year
- **API Routes**: Optimized with 30s timeout
- **Bundle Analysis**: Run `pnpm build` to analyze bundle size

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Consider adding Sentry for error tracking
- **Uptime Monitoring**: Use services like Pingdom or UptimeRobot

## Support

If you encounter issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review the project's GitHub issues
3. Contact support through the repository

---

**Happy Deploying! 🚀**