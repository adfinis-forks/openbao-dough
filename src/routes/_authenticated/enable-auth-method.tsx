import { createFileRoute } from '@tanstack/react-router';
import { EnableAuthMethodView } from '../../features/auth/EnableAuthMethodView';

export const Route = createFileRoute('/_authenticated/enable-auth-method')({
  component: EnableAuthMethodView,
});
