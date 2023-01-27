import { Box, Button, Heading } from "@chakra-ui/react";
import { MdPhotoCamera } from "react-icons/md";

import { Camera } from "_components";

const HEADING_TITLE = "Personal \nShelf \nInspector";

type Props = {
  onPhotoTaken?: (photo: File) => void;
};

function TakingPhoto(props: Props) {
  const { onPhotoTaken } = props;

  return (
    <>
      <Heading
        as="h1"
        size="4xl"
        lineHeight={1.15}
        fontWeight="normal"
        whiteSpace="pre-line"
        marginBlock={24}
      >
        {HEADING_TITLE}
      </Heading>

      <Box display="flex" justifyContent="center">
        <Camera onPhotoTaken={onPhotoTaken} inputCapture={false}>
          <Button
            // colorScheme="brand"
            size="xl"
            rightIcon={<MdPhotoCamera />}
            iconSpacing="10"
          >
            Vyfotit
          </Button>
        </Camera>
      </Box>
    </>
  );
}

export default TakingPhoto;
