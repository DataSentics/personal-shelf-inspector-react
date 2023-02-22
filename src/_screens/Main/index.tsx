import { useState } from "react";
import { MdRestartAlt } from "react-icons/md";
import { Button } from "@chakra-ui/react";
import { useSettngStoreValues } from "_store";
import { useImageToProducts } from "_hooks";
import { RackDisplay } from "_components";

import TakingPhoto from "./components/TakingPhoto";

function Main() {
  const [photoFile, setPhotoFile] = useState<File>();

  const {
    showDebugPhoto,
    showDebugCollage,
    showCroppedPricetag,
    showCroppedPricetagDetails,
    allowPhotoGallery,
  } = useSettngStoreValues();

  const inputCapture = allowPhotoGallery ? false : "environment";

  const onPhotoTaken = (newPhoto: File) => {
    setPhotoFile(newPhoto);
  };

  const [rack, { isDetecting, reset }] = useImageToProducts(photoFile, {
    showDebugCollage,
    showDebugPhoto,
    doPricetagImgs: showCroppedPricetag || showCroppedPricetagDetails,
  });

  const resetAll = () => {
    setPhotoFile(undefined);
    reset();
  };

  return (
    <>
      {rack ? (
        <>
          <RackDisplay
            rack={rack}
            showPricetagImgs={showCroppedPricetag}
            showPricetagDetailsImgs={showCroppedPricetagDetails}
          />
          <Button
            size="lg"
            leftIcon={<MdRestartAlt />}
            onClick={resetAll}
            mt={24}
            mb={12}
          >
            Začít znovu
          </Button>
        </>
      ) : (
        <TakingPhoto
          onPhotoTaken={onPhotoTaken}
          isDetecting={isDetecting}
          inputCapture={inputCapture}
        />
      )}
    </>
  );
}

export default Main;
