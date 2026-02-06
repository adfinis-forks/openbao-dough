import { createFileRoute, useLocation } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/$')({
  component: NotFound,
});

export function NotFound() {
  const location = useLocation();

  return (
    <div className="not-found">
      <h1>404 Not Found</h1>
      <p>
        Nothing found at <code>{location.pathname}</code>
      </p>
    </div>
  );
}
