import { Layout } from '@layout/Layout';
import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard } from '@/shared/components/AuthGuard';
import { useHealthCheck } from '@/shared/hooks/useHealthCheck';

function AuthenticatedLayout() {
  useHealthCheck();
  
  return (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  );
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});
