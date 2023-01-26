import { Link as RouterLink } from "react-router-dom";
import { Box, Button } from "@chakra-ui/react";

import { Paths } from "_router";
import SettingSwitch from "./components/SettingSwitch";

function Settings() {
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

      <Button to={Paths.HOME} as={RouterLink} mt={5}>
        Go back home
      </Button>
    </Box>
  );
}

export default Settings;
