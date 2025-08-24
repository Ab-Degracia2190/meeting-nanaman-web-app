import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PrimaryLoader from "@/components/partials/loaders/Primary";

const NotFound = lazy(() => import("@/components/pages/errors/404"));
const Panel = lazy(() => import("@/components/pages/contents/Panel"));
const VideoCallRoom = lazy(() => import("@/components/pages/contents/room/VideoCallRoom"));

const LoaderFallback = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <PrimaryLoader overlay />
    </div>
);

const routes = createBrowserRouter([
    { 
        path: "/", 
        element: <Suspense fallback={<LoaderFallback />}><Panel /></Suspense> 
    },
    { 
        path: "/room/:roomId", 
        element: <Suspense fallback={<LoaderFallback />}><VideoCallRoom /></Suspense> 
    },
    { 
        path: "/not-found", 
        element: <Suspense fallback={<LoaderFallback />}><NotFound /></Suspense> 
    },
    { 
        path: "*", 
        element: <Navigate to="/not-found" replace /> 
    },
]);

export default routes;