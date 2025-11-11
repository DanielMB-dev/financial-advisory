# DevOps Quick Start Guide

This is a condensed version of the full DevOps plan. For complete details, see [`devops.md`](./devops.md).

## Prerequisites Checklist

Before starting implementation, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier is fine)
- [ ] Supabase account (free tier is fine)
- [ ] Sentry account (free tier is fine)
- [ ] Node.js 20.x installed
- [ ] Git configured locally

## Quick Setup (30 Minutes)

### 1. Environment Setup (10 min)

```bash
# Clone and install
git clone <your-repo>
cd financial-advisor
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your values
# You'll need Supabase URL and keys
```

### 2. Supabase Setup (10 min)

1. Go to https://app.supabase.com
2. Create project: `financial-advisor-dev`
3. Copy these from Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Paste into `.env.local`

### 3. Vercel Setup (10 min)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables (copy from `.env.local`)
4. Deploy!

## Critical Files to Create

### 1. `.env.example`

See full file in `devops.md` → Environment Configuration section

### 2. `.github/workflows/pr-check.yml`

See full file in `devops.md` → CI/CD Pipeline Design section

### 3. `lib/env.ts`

Environment validation with Zod - see `devops.md`

### 4. `next.config.ts` (update)

Add security headers - see `devops.md` → Security Configuration

## First Week Priorities

### Day 1-2: Repository & Environments

- Set up GitHub secrets
- Create Supabase projects (dev, staging, prod)
- Configure Vercel
- Test local development

### Day 3-4: CI/CD

- Create PR check workflow
- Create deployment workflows
- Test workflows with a dummy PR

### Day 5: Monitoring

- Set up Sentry
- Add error tracking
- Configure alerts

### Day 6-7: Security & Testing

- Add security headers
- Implement rate limiting
- Write first tests

## Essential GitHub Secrets

Add these in: Repository Settings → Secrets and variables → Actions

```
VERCEL_TOKEN              # From https://vercel.com/account/tokens
VERCEL_ORG_ID            # From Vercel project settings
VERCEL_PROJECT_ID        # From Vercel project settings
SUPABASE_SERVICE_ROLE_KEY # From Supabase project settings
SUPABASE_DB_URL          # From Supabase database settings
SENTRY_AUTH_TOKEN        # From Sentry (if using)
```

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run linter
npm run type-check            # TypeScript check

# Database (with Supabase CLI)
supabase init                 # Initialize Supabase
supabase start               # Start local Supabase
supabase db push             # Push migrations

# Testing (to be set up)
npm run test                 # Run tests
npm run test:watch          # Watch mode
```

## Common Issues & Solutions

### Issue: Build fails on Vercel

**Solution:** Check environment variables are set in Vercel dashboard

### Issue: Database connection fails

**Solution:** Verify `SUPABASE_SERVICE_ROLE_KEY` is correct and has no extra spaces

### Issue: CI/CD workflow fails

**Solution:** Ensure all GitHub secrets are properly configured

### Issue: Sentry not tracking errors

**Solution:** Check `NEXT_PUBLIC_SENTRY_DSN` is set and Sentry is enabled

## Deployment Workflow

```
Create PR → Automatic checks run → Preview deployed
    ↓
Review code → Approve PR
    ↓
Merge to main → Tests run → Production deploy
    ↓
Health check → Monitor errors → Success!
```

## Emergency Rollback

If something breaks in production:

1. **Fastest (30 seconds):**
   - Go to Vercel dashboard
   - Deployments tab
   - Find last working version
   - Click "Promote to Production"

2. **Alternative (1 minute):**
   ```bash
   vercel ls  # List deployments
   vercel promote <deployment-url>  # Promote old deployment
   ```

## Security Checklist

Before going to production:

- [ ] All secrets in environment variables (not in code)
- [ ] RLS enabled on all database tables
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Dependencies scanned for vulnerabilities
- [ ] Sentry error tracking active

## Cost Estimate

**Early Stage (Free Tier):**

- Vercel: $0/month
- Supabase: $0/month
- Sentry: $0/month
- GitHub Actions: $0/month
- Domain: ~$1/month
  **Total: ~$1/month**

**Growth Stage:**

- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Sentry Team: $26/month
  **Total: ~$71/month**

## Next Steps

1. Read the full DevOps plan: [`devops.md`](./devops.md)
2. Follow the 6-week implementation checklist
3. Start with Phase 1: Foundation
4. Join community Discord servers for support
5. Set up monitoring dashboards

## Important Notes

- **Never commit `.env.local`** - it contains secrets!
- **Always test in staging** before production
- **Monitor error rates** after every deployment
- **Document everything** you learn
- **Ask for help** when stuck

## Support

- Full documentation: [`devops.md`](./devops.md)
- Session context: [`../../sessions/context_session_initial-setup.md`](../../sessions/context_session_initial-setup.md)
- Team chat: [To be set up]
- On-call: [To be set up]

---

**Quick Start Version:** 1.0
**Last Updated:** October 30, 2025
**For detailed information, see the full DevOps plan.**
