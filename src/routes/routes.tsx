import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/components/pages/contents/home/auth/provider';
import HomePage from '@/components/pages/contents/home/index';
import SignIn from '@/components/pages/contents/home/auth/sign-in';
import OAuthCallback from '@/components/pages/contents/home/auth/callback';
import VideoCallRoom from '@/components/pages/contents/home/layouts/meetings/meeting-room';
import NotFound from '@/components/pages/errors/404';

// Root layout component that provides AuthProvider context
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "auth/google/callback",
        element: <OAuthCallback />,
      },
      {
        path: "room/:roomId",
        element: <VideoCallRoom />,
      },
      {
        path: "not-found",
        element: <NotFound />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
export { router };