import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      offset={{ top: 16, right: 16 }}
      mobileOffset={{ top: 16, right: 16, left: 16 }}
      toastOptions={{
        style: {
          fontFamily: 'var(--font)',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: '8px',
          boxShadow: 'var(--shadow-elevated)',
        },
      }}
    />
  );
}
