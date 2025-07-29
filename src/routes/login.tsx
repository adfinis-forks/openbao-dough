import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Login } from '../pages/Login';
import { setAuthState } from './__root';

const LoginComponent = () => {
  const navigate = useNavigate();
  return (
    <Login
      onLogin={() => {
        setAuthState(true);
        navigate({ to: '/dashboard' });
      }}
    />
  );
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});
