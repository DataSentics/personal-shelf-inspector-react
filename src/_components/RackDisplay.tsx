import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Stack,
  Text,
  Button,
} from "@chakra-ui/react";
import { ORDINALS } from "_constants/words";

import { Rack } from "_utils/objects";

type Props = {
  rack: Rack;
};

export default function RackDisplay(props: Props) {
  const { rack } = props;
  return (
    <Tabs variant="enclosed">
      <TabList flexWrap="wrap">
        {/* <Tab>One</Tab>
        <Tab>Two</Tab>
        <Tab>Three</Tab> */}
        {rack.shelves.map((_, index) => (
          <Tab key={`Tab_${index}`}>{`${ORDINALS.cs[index]}`}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {rack.shelves.map((shelf, index) => (
          <TabPanel key={`TabPanel_${index}`}>
            <Stack spacing={3}>
              {shelf.map((product, productIndex) => (
                <Box
                  borderColor="blackAlpha.300"
                  borderWidth="1px"
                  borderRadius={4}
                  key={`PrdcOnShelf_${productIndex}`}
                  padding={2}
                >
                  <Button>{product.name}</Button>
                  <Text>
                    {product.priceMain}.{product.priceSub}Kč
                  </Text>
                </Box>
              ))}
            </Stack>
          </TabPanel>
        ))}
        {/* <TabPanel>
          <p>one1!</p>
        </TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel> */}
      </TabPanels>
    </Tabs>
  );
}
