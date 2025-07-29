import { createFileRoute } from '@tanstack/react-router';
import { AuthMethodsView } from '../../features/auth/AuthMethodsView';

export const Route = createFileRoute('/_authenticated/auth')({
  component: AuthMethodsView,
});
