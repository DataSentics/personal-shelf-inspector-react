import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { Paths } from "_router";

function Settings() {
  return (
    <div>
      <ChakraLink to={Paths.HOME} as={RouterLink}>
        Go back home
      </ChakraLink>
    </div>
  );
}

export default Settings;
