import { createFileRoute } from '@tanstack/react-router';
import { PoliciesView } from '../../features/policies/PoliciesView';

export const Route = createFileRoute('/_authenticated/policies')({
  component: PoliciesView,
});
