import {
  Box,
  Container,
  Text,
  Link as ChakraLink,
  Stack,
} from "@chakra-ui/react";

import { Link } from "_components";
import { Paths } from "_router";

const FONT_SIZE = "xs" as const;

type Props = {
  maxWidth: string | number;
};

function Footer(props: Props) {
  const { maxWidth } = props;

  const todayYear = new Date().getFullYear();

  return (
    <Box bg="gray.100" as="footer">
      <Container
        display="flex"
        justifyContent="space-between"
        maxW={maxWidth}
        paddingBlock={1}
      >
        <Text fontSize={FONT_SIZE}>
          © {todayYear}{" "}
          <ChakraLink isExternal href="https://datasentics.com/">
            Datasentics
          </ChakraLink>
        </Text>

        <Stack direction="row">
          <Text fontSize={FONT_SIZE}>
            <Link to={Paths.SETTINGS}>Settings</Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
