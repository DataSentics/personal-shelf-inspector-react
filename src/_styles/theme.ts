import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { buttonTheme } from "./button";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const colors = {
  dsPrimary: {
    // Datasentics orange (#FF7E00) + shades via https://mdigi.tools/color-shades/#FF7E00
    50: "#fff2e5",
    100: "#ffd8b3",
    200: "#ffbf80",
    300: "#ffa54d",
    400: "#ff8b1a",
    500: "#e67100",
    600: "#b35800",
    700: "#803f00",
    800: "#4d2600",
    900: "#1a0d00",
  },
};

const theme = extendTheme({
  config,
  colors,
  components: { Button: buttonTheme },
});

export default theme;
