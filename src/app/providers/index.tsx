import { ReactNode } from 'react';
import { AuthProvider } from '@features/auth/providers/AuthProvider';

/**
 * کامپوننتی که تمام Providerهای سراسری اپلیکیشن را در بر می‌گیرد
 */
interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {/* سایر Providerها در اینجا اضافه می‌شوند */}
      {/* <ThemeProvider> */}
      {/* <ChatProvider> */}
      {children}
    </AuthProvider>
  );
}