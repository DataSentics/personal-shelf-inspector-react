import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

function Root() {
  return (
    <Box paddingTop={2} paddingInline={3}>
      <Outlet />
    </Box>
  );
}

export default Root;
