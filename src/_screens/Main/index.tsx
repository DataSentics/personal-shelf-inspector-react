import { useState } from "react";

import { useSettngStoreValues } from "_store";
import { useImageToProducts } from "_hooks";

import TakingPhoto from "./components/TakingPhoto";
import { RackDisplay } from "_components";

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

  const [rack, { isDetecting }] = useImageToProducts(photoFile, {
    showDebugCollage,
    showDebugPhoto,
    doPricetagImgs: showCroppedPricetag || showCroppedPricetagDetails,
  });

  return (
    <>
      {rack ? (
        <RackDisplay
          rack={rack}
          showPricetagImgs={showCroppedPricetag}
          showPricetagDetailsImgs={showCroppedPricetagDetails}
        />
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
