import { Box } from "@chakra-ui/react";

import { SettingSwitch } from "./SettingSwitch";

export function AllSettings() {
  return (
    <Box mt={2}>
      <SettingSwitch settingName="showDebugPhoto">
        Show debug photo
      </SettingSwitch>

      <SettingSwitch settingName="showDebugCollage">
        Show debug collage
      </SettingSwitch>

      <SettingSwitch settingName="showCroppedPricetag">
        Show cropped pricetag
      </SettingSwitch>

      <SettingSwitch settingName="showCroppedPricetagDetails">
        Show cropped pricetag details
      </SettingSwitch>

      <SettingSwitch settingName="allowPhotoGallery">
        Allow gallery as camera input
      </SettingSwitch>
    </Box>
  );
}
