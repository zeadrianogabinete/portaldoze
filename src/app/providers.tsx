import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/query-client';
import { AuthContext, useAuthProvider } from '@/shared/hooks/useAuth';
import { useTheme } from '@/shared/hooks/useTheme';

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
