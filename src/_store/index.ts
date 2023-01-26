import { create } from "zustand";

export type BooleanSettings =
  | "showDebugPhoto"
  | "showDebugCollage"
  | "showCroppedPricetag"
  | "showCroppedPricetagDetails";

type SettingState = Record<BooleanSettings, boolean> & {
  setBoolSetting: (name: BooleanSettings, newValue: boolean) => void;
};

export const useSettingStore = create<SettingState>((set) => ({
  showDebugPhoto: false,
  showDebugCollage: false,
  showCroppedPricetag: false,
  showCroppedPricetagDetails: false,
  setBoolSetting: (name, newValue) => set(() => ({ [name]: newValue })),
}));
