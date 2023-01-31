import { create } from "zustand";
import { persist } from "zustand/middleware";

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
