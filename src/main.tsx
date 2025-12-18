import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App.tsx";
import "./index.css";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Lazy load pages for better initial bundle size
const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InventarioPage = lazy(() => import("./pages/InventarioPage"));
const VentasPage = lazy(() => import("./pages/VentasPage"));
const ComprasPage = lazy(() => import("./pages/ComprasPage"));
const PrediccionPage = lazy(() => import("./pages/PrediccionPage"));
const EquiposPage = lazy(() => import("./pages/EquiposPage"));
const ProveedoresPage = lazy(() => import("./pages/ProveedoresPage"));
const ConfiguracionPage = lazy(() => import("./pages/ConfiguracionPage"));
const SoportePage = lazy(() => import("./pages/SoportePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Index />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "inventario",
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventarioPage />
              </Suspense>
            ),
          },
          {
            path: "ventas",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VentasPage />
              </Suspense>
            ),
          },
          {
            path: "compras",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ComprasPage />
              </Suspense>
            ),
          },
          {
            path: "prediccion",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PrediccionPage />
              </Suspense>
            ),
          },
          {
            path: "equipos",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EquiposPage />
              </Suspense>
            ),
          },
          {
            path: "proveedores",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProveedoresPage />
              </Suspense>
            ),
          },
          {
            path: "configuracion",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ConfiguracionPage />
              </Suspense>
            ),
          },
          {
            path: "soporte",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SoportePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
