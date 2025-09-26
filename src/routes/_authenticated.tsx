import { Layout } from '@layout/Layout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  component: Layout,
});