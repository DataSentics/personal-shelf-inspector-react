import {
  Box,
  Container,
  Text,
  Link as ChakraLink,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { Modal } from "_components";
import { AllSettings } from "_features/settings";

const FONT_SIZE = "xs" as const;

type Props = {
  maxWidth: string | number;
  height?: string | number;
};

function Footer(props: Props) {
  const { maxWidth, height } = props;

  const modalProps = useDisclosure();

  const todayYear = new Date().getFullYear();

  return (
    <Box
      bg="blackAlpha.300"
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
          <Box
            as={"button"}
            type="button"
            role="button"
            onClick={modalProps.onOpen}
            fontSize={FONT_SIZE}
          >
            Settings
          </Box>
        </Stack>
      </Container>

      <Modal {...modalProps} header="Settings" blockScrollOnMount={false}>
        <AllSettings />
      </Modal>
    </Box>
  );
}

export default Footer;
