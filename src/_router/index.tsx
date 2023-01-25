import { createBrowserRouter } from "react-router-dom";
import Main from "_screens/Main";
import Settings from "_screens/Settings";

export enum Paths {
  HOME = "/",
  SETTINGS = "/settings",
}

const router = createBrowserRouter([
  {
    path: Paths.HOME,
    element: <Main />,
  },
  {
    path: Paths.SETTINGS,
    element: <Settings />,
  },
]);

export default router;
