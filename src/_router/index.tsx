import { createBrowserRouter } from "react-router-dom";
import Root from "_layout/Root";
import Main from "_screens/Main";
import NotFound from "_screens/NotFound";

export enum Paths {
  HOME = "/",
  SETTINGS = "settings",
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: Paths.HOME,
        element: <Main />,
      },
    ],
  },
]);

export default router;
