import type { ReactNode } from "react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  to: string;
  children: ReactNode;
};

function Link(props: Props) {
  const { to, children } = props;

  return (
    <ChakraLink as={RouterLink} to={to}>
      {children}
    </ChakraLink>
  );
}

export default Link;
