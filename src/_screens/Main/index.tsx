import { useState } from "react";
import { shallow } from "zustand/shallow";

import { useSettingStore } from "_store";
import { useImageToProducts } from "_hooks";

import TakingPhoto from "./components/TakingPhoto";
import { RackDisplay } from "_components";

function Main() {
  const [photoFile, setPhotoFile] = useState<File>();

  const { showDebugPhoto, showDebugCollage } = useSettingStore(
    (state) => ({
      showDebugPhoto: state.showDebugPhoto,
      showDebugCollage: state.showDebugCollage,
    }),
    shallow
  );

  const onPhotoTaken = (newPhoto: File) => {
    setPhotoFile(newPhoto);
  };

  const [rack, { imgCollageRef, isDetecting }] = useImageToProducts(photoFile, {
    showDebugCollage,
    showDebugPhoto,
  });

  return (
    <>
      {!rack ? (
        <TakingPhoto onPhotoTaken={onPhotoTaken} isDetecting={isDetecting} />
      ) : (
        <>
          <RackDisplay rack={rack} imgCollageRef={imgCollageRef} />
        </>
      )}
    </>
  );
}

export default Main;
