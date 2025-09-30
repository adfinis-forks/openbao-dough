import { Layout } from '@layout/Layout';
import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard } from '@/shared/components/AuthGuard';

function AuthenticatedLayout() {
  return (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  );
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});
