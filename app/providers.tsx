'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { useState, ReactNode } from 'react'
import { getQueryClient } from '@/lib/query-client'
import { AuthProvider } from '@/src/features/authentication/hooks/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create query client on mount to ensure it's only created once per page load
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
          <Toaster />
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
