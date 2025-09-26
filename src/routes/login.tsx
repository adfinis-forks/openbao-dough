import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Login } from '../pages/Login';

const LoginComponent = () => {
  const navigate = useNavigate();
  return (
    <Login
      onLogin={() => {
        navigate({ to: '/dashboard' });
      }}
    />
  );
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});
