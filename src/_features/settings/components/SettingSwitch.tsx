import { ReactNode } from "react";
import { FormControl, FormLabel, Switch } from "@chakra-ui/react";

import { BooleanSettings, useSettingStore } from "_store";

type Props = {
  settingName: BooleanSettings;
  children: ReactNode;
};

export function SettingSwitch(props: Props) {
  const { settingName, children } = props;

  const switchId = `${settingName}_elem_id`;

  const settingValue = useSettingStore((state) => state[settingName]);
  const setBoolSetting = useSettingStore((state) => state.setBoolSetting);

  return (
    <FormControl display="flex" alignItems="center" mb={2}>
      <Switch
        id={switchId}
        isChecked={settingValue}
        onChange={(e) => setBoolSetting(settingName, e.target.checked)}
      />
      <FormLabel htmlFor={switchId} mb={0} ml={2}>
        {children}
      </FormLabel>
    </FormControl>
  );
}
