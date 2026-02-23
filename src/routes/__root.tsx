import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
});
