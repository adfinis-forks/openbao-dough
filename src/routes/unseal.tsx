import { createFileRoute } from '@tanstack/react-router';
import { UnsealView } from '@/features/seal/UnsealView';

export const Route = createFileRoute('/unseal')({
  component: UnsealView,
});
