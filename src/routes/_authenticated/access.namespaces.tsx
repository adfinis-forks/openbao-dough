import { createFileRoute } from '@tanstack/react-router';
import { Namespaces } from '@/features/Namespaces/Namespaces';

export const Route = createFileRoute('/_authenticated/access/namespaces')({
  component: Namespaces,
});
