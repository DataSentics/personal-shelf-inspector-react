import { useState } from "react";
import { Button, Heading } from "@chakra-ui/react";
import { shallow } from "zustand/shallow";

import { Camera } from "_components";
import { useSettingStore } from "_store";
import { useImageToProducts } from "_hooks";

function Main() {
  const [photoFile, setPhotoFile] = useState<File>();

  const { showDebugPhoto, showDebugCollage } = useSettingStore((state) => ({
    showDebugPhoto: state.showDebugPhoto,
    showDebugCollage: state.showDebugCollage,
    shallow,
  }));

  const onPhotoTaken = (newPhoto: File) => {
    setPhotoFile(newPhoto);
  };

  const [rack] = useImageToProducts(photoFile, {
    showDebugCollage,
    showDebugPhoto,
  });

  return (
    <>
      <Heading>Personal Shelf Inspector</Heading>

      <Camera onPhotoTaken={onPhotoTaken} inputCapture={false}>
        <Button>Take photos</Button>
      </Camera>
    </>
  );
}

export default Main;
