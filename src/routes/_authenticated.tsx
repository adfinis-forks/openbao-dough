import { createFileRoute, redirect } from '@tanstack/react-router';
import { Layout } from '../shared/layout/Layout';
import { getAuthState } from './__root';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!getAuthState()) {
      throw redirect({ to: '/login' });
    }
  },
  component: Layout,
});
