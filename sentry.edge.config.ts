// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Don't send PII (Personally Identifiable Information) - Critical for financial apps
  sendDefaultPii: false,

  // Before send hook - sanitize data
  beforeSend(event, _hint) {
    // Don't send events if Sentry is disabled
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'false') {
      return null
    }

    // Filter out sensitive data
    if (event.request?.data) {
      event.request.data = '[Filtered]'
    }

    return event
  },
})
