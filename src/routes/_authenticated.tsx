import { Layout } from '@layout/Layout';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getAuthState } from './__root';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!getAuthState()) {
      throw redirect({ to: '/login' });
    }
  },
  component: Layout,
});
