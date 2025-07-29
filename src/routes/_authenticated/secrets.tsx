import { createFileRoute } from '@tanstack/react-router';
import { SecretsView } from '../../features/secrets/SecretsView';

export const Route = createFileRoute('/_authenticated/secrets')({
  component: SecretsView,
});
