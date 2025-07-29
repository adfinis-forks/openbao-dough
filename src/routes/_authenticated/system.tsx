import { createFileRoute } from '@tanstack/react-router';
import { SystemView } from '../../features/system/SystemView';

export const Route = createFileRoute('/_authenticated/system')({
  component: SystemView,
});
