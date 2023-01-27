import { useState } from "react";
import { shallow } from "zustand/shallow";

import { useSettingStore } from "_store";
import { useImageToProducts } from "_hooks";

import TakingPhoto from "./components/TakingPhoto";

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

  const [rack] = useImageToProducts(photoFile, {
    showDebugCollage,
    showDebugPhoto,
  });

  return (
    <>
      <TakingPhoto onPhotoTaken={onPhotoTaken} />
    </>
  );
}

export default Main;
