import type { ReactNode } from "react";
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  type ModalProps,
} from "@chakra-ui/react";

interface Props extends ModalProps {
  closeButton?: boolean;
  header?: ReactNode;
}

function Modal({
  closeButton = true,
  isCentered = true,
  header,
  children,
  ...modalProps
}: Props) {
  return (
    <ChakraModal isCentered={isCentered} {...modalProps}>
      <ModalOverlay />
      <ModalContent m={4}>
        {header && <ModalHeader>{header}</ModalHeader>}
        {closeButton && <ModalCloseButton />}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  );
}

export default Modal;
