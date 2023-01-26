import { Box, Button, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { Paths } from "_router";

function NotFound() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
    >
      <Heading mb={2}>Ooops...</Heading>
      <Heading>Page not found</Heading>

      <Button to={Paths.HOME} as={Link} mt={8}>
        Go back home
      </Button>
    </Box>
  );
}

export default NotFound;
