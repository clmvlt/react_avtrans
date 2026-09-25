import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from './ThemeProvider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          {/* Même placement que les toasts du Vue : en haut à droite, sous la navbar (top-16) */}
          <Toaster
            position="top-right"
            offset={{ top: 64, right: 16 }}
            mobileOffset={{ top: 64, left: 12, right: 12 }}
            closeButton
            toastOptions={{
              classNames: {
                success: '[&_[data-icon]]:text-success',
                error: '[&_[data-icon]]:text-destructive',
                warning: '[&_[data-icon]]:text-warning',
                info: '[&_[data-icon]]:text-info',
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  )
}
