import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

export type BooleanSettings =
  | "showDebugPhoto"
  | "showDebugCollage"
  | "showCroppedPricetag"
  | "showCroppedPricetagDetails"
  | "allowPhotoGallery";

type SettingState = Record<BooleanSettings, boolean> & {
  setBoolSetting: (name: BooleanSettings, newValue: boolean) => void;
};

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      showDebugPhoto: false,
      showDebugCollage: false,
      showCroppedPricetag: false,
      showCroppedPricetagDetails: false,
      allowPhotoGallery: false,
      setBoolSetting: (name, newValue) => set(() => ({ [name]: newValue })),
    }),
    { name: "setting-store" }
  )
);
export const useSettngStoreValues = () => {
  const {
    showDebugPhoto,
    showDebugCollage,
    showCroppedPricetag,
    showCroppedPricetagDetails,
    allowPhotoGallery,
  } = useSettingStore(
    (state) => ({
      showDebugPhoto: state.showDebugPhoto,
      showDebugCollage: state.showDebugCollage,
      showCroppedPricetag: state.showCroppedPricetag,
      showCroppedPricetagDetails: state.showCroppedPricetagDetails,
      allowPhotoGallery: state.allowPhotoGallery,
    }),
    shallow
  );

  return {
    showDebugPhoto,
    showDebugCollage,
    showCroppedPricetag,
    showCroppedPricetagDetails,
    allowPhotoGallery,
  };
};
