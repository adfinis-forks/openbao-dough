import { createFileRoute } from '@tanstack/react-router';
import { AuditView } from '../../features/audit/AuditView';

export const Route = createFileRoute('/_authenticated/audit')({
  component: AuditView,
});
