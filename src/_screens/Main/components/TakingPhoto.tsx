import { Box, Button, Heading } from "@chakra-ui/react";
import { InputHTMLAttributes } from "react";
import { MdPhotoCamera } from "react-icons/md";

import { Camera } from "_components";

const HEADING_TITLE = "Personal \nShelf \nInspector";

type Props = {
  onPhotoTaken?: (photo: File) => void;
  isDetecting?: boolean;
  inputCapture?: InputHTMLAttributes<HTMLInputElement>["capture"];
};

function TakingPhoto(props: Props) {
  const { onPhotoTaken, isDetecting, inputCapture } = props;

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

      <Box display="flex" justifyContent="flex-start">
        <Camera onPhotoTaken={onPhotoTaken} inputCapture={inputCapture}>
          <Button
            isLoading={isDetecting}
            loadingText="Detekuju"
            spinnerPlacement="end"
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
