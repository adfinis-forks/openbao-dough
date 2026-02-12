import { createFileRoute } from '@tanstack/react-router';
import { SealView } from '@/features/seal/SealView';

export const Route = createFileRoute('/_authenticated/settings/seal')({
  component: SealView,
});
