import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { ORDINALS } from "_constants/words";

import { Rack } from "_utils/objects";
import ProductDisplay from "./ProductDisplay";

type Props = {
  rack: Rack;
  showPricetagImgs: boolean;
  showPricetagDetailsImgs: boolean;
};

export default function RackDisplay(props: Props) {
  const { rack, showPricetagImgs, showPricetagDetailsImgs } = props;
  return (
    <>
      <Heading mb={6}>Regály</Heading>

      <Tabs variant="enclosed">
        <TabList flexWrap="wrap">
          {rack.shelves.map((_, index) => (
            <Tab key={`Tab_${index}`}>{`${ORDINALS.cs[index]}`}</Tab>
          ))}
        </TabList>

        <TabPanels>
          {rack.shelves.map((shelf, index) => (
            <TabPanel key={`TabPanel_${index}`}>
              <Stack spacing={0}>
                {shelf.map((product, productIndex) => (
                  <ProductDisplay
                    key={`PrdcOnShelf_${productIndex}`}
                    product={product}
                    pricetagImgs={showPricetagImgs}
                    pricetagDetailsImgs={showPricetagDetailsImgs}
                    isEven={productIndex % 2 === 0}
                  />
                ))}
              </Stack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </>
  );
}
