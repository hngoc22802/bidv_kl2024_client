
  import { Navigate, createBrowserRouter } from "react-router-dom";
  import type { RouteObject } from "react-router";
  import { lazy } from "react";
import { getPrefix } from "@/constant";

  const LoginPage = lazy(() => import("@/pages/login-page"));
  const RegisterPage = lazy(() => import("@/pages/register-page"));
  const MainPage = lazy(() => import("@/pages/main-page"));

  const routeList: RouteObject[] = [
    {
      path: "",
      element: <Navigate to={"/login"} />
    },
    {
      path: getPrefix(),
      children: [
        {
          path: "login",
          element: <LoginPage />
        },
        {
          path: "register",
          element: <RegisterPage />
        },
        {
          path: "business",
          element: <MainPage />
        },
      ]
    },
  ];
  
  const RenderRouter = createBrowserRouter(routeList);
  
  export default RenderRouter;
  