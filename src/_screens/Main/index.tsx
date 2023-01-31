import { useState } from "react";
import { shallow } from "zustand/shallow";

import { useSettingStore } from "_store";
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
  } = useSettingStore(
    (state) => ({
      showDebugPhoto: state.showDebugPhoto,
      showDebugCollage: state.showDebugCollage,
      showCroppedPricetag: state.showCroppedPricetag,
      showCroppedPricetagDetails: state.showCroppedPricetagDetails,
    }),
    shallow
  );

  const onPhotoTaken = (newPhoto: File) => {
    setPhotoFile(newPhoto);
  };

  const [rack, { imgCollageRef, isDetecting }] = useImageToProducts(photoFile, {
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
        <TakingPhoto onPhotoTaken={onPhotoTaken} isDetecting={isDetecting} />
      )}
    </>
  );
}

export default Main;
