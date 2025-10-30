// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    // Facebook blocked errors
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
  ],

  // Don't send PII (Personally Identifiable Information)
  sendDefaultPii: false,

  // Before send hook - sanitize data
  beforeSend(event, hint) {
    // Don't send events if Sentry is disabled
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'false') {
      return null
    }

    // Filter out sensitive data from request bodies
    if (event.request?.data) {
      event.request.data = '[Filtered]'
    }

    return event
  },
})
