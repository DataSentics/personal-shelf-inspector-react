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
  height?: string | number;
};

function Footer(props: Props) {
  const { maxWidth, height } = props;

  const todayYear = new Date().getFullYear();

  return (
    <Box
      bg="gray.100"
      as="footer"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height={height}
      display="flex"
      alignItems="center"
    >
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
