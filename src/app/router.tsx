import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { AuditView } from '../features/audit/AuditView';
import { AuthMethodsView } from '../features/auth/AuthMethodsView';
import { Dashboard } from '../features/dashboard/Dashboard';
import { PoliciesView } from '../features/policies/PoliciesView';
import { SecretsView } from '../features/secrets/SecretsView';
import { SystemView } from '../features/system/SystemView';
import { Login } from '../pages/Login';
import { Layout } from '../shared/layout/Layout';

// Auth state - in a real app, this would come from context/store
let isAuthenticated = false;

export const setAuthState = (authenticated: boolean) => {
  isAuthenticated = authenticated;
};

export const getAuthState = () => isAuthenticated;

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  beforeLoad: () => {
    // Redirect from root based on auth state
    if (window.location.pathname === '/') {
      if (isAuthenticated) {
        throw redirect({ to: '/dashboard' });
      } else {
        throw redirect({ to: '/login' });
      }
    }
  },
});

// Login component with navigation
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

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginComponent,
});

// Layout route for authenticated users
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: () => {
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: Layout,
});

// Protected routes under layout
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: Dashboard,
});

const secretsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/secrets',
  component: SecretsView,
});

const policiesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/policies',
  component: PoliciesView,
});

const authRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/auth',
  component: AuthMethodsView,
});

const auditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/audit',
  component: AuditView,
});

const systemRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/system',
  component: SystemView,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    dashboardRoute,
    secretsRoute,
    policiesRoute,
    authRoute,
    auditRoute,
    systemRoute,
  ]),
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
