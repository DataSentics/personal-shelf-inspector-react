import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  FormControl,
  FormLabel,
  Link as ChakraLink,
  Switch,
} from "@chakra-ui/react";

import { Paths } from "_router";
import { useSettingStore } from "_store";
import SettingSwitch from "./components/SettingSwitch";

function Settings() {
  // const showDebugPhotos = useSettingStore((state) => state.showDebugPhoto);
  // const setBoolSetting = useSettingStore((state) => state.setBoolSetting);
  // console.log(showDebugPhotos);

  // const [isChecked, setIsChecked] = useState(false);

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

      <ChakraLink to={Paths.HOME} as={RouterLink}>
        Go back home
      </ChakraLink>
    </Box>
  );
}

export default Settings;
