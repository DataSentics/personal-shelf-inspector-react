import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import Footer from "./Footer";

const CONTAINER_MAX_W = "container.md" as const;

function Root() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Container as="main" flex="1" maxWidth={CONTAINER_MAX_W} paddingBlock={2}>
        <Outlet />
      </Container>

      <Footer maxWidth={CONTAINER_MAX_W} />
    </Box>
  );
}

export default Root;
