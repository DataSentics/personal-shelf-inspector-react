import { ReactNode } from "react";
import { FormControl, FormLabel, Switch } from "@chakra-ui/react";

import { BooleanSettings, useSettingStore } from "_store";

type Props = {
  settingName: BooleanSettings;
  children: ReactNode;
};

function SettingSwitch(props: Props) {
  const { settingName, children } = props;

  const settingValue = useSettingStore((state) => state[settingName]);
  const setBoolSetting = useSettingStore((state) => state.setBoolSetting);

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        id={`${settingName}_elem`}
        isChecked={settingValue}
        onChange={(e) => setBoolSetting(settingName, e.target.checked)}
      />
      <FormLabel htmlFor={`${settingName}_elem`} mb={0} ml={2}>
        {children}
      </FormLabel>
    </FormControl>
  );
}

export default SettingSwitch;
