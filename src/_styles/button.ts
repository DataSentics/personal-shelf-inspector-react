import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const xl = defineStyle({
  fontSize: "2xl",
  px: "8",
  h: "16",
  borderRadius: "md",
});

export const buttonTheme = defineStyleConfig({
  sizes: { xl },
  defaultProps: {
    colorScheme: "dsPrimary",
  },
});
