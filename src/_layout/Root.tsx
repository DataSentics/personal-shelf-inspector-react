import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

function Root() {
  return (
    <Container maxWidth="container.md" paddingBlock={2}>
      <Outlet />
    </Container>
  );
}

export default Root;
