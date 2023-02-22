import { Tabs, TabList, Tab, Stack, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { ORDINALS } from "_constants/i18n";
import type { Rack } from "_utils/objects";

import ProductDisplay from "./ProductDisplay";

type Props = {
  rack: Rack;
  showPricetagImgs: boolean;
  showPricetagDetailsImgs: boolean;
};

export default function RackDisplay(props: Props) {
  const { rack, showPricetagImgs, showPricetagDetailsImgs } = props;

  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <Heading mt={2} mb={6}>
        Regály
      </Heading>

      <Tabs variant="enclosed" onChange={setTabIndex}>
        <TabList flexWrap="wrap">
          {rack.shelves.map((_, index) => (
            <Tab key={`Tab_${index}`}>{`${ORDINALS.cs[index]}`}</Tab>
          ))}
        </TabList>

        {/* Chakra-UI TabPanel(s) are not use as it messes-up TalkBack reading of data inside */}
        {rack.shelves.map((shelf, index) => (
          <Stack
            spacing={0}
            key={`TabPanel_${index}`}
            hidden={index !== tabIndex}
            role="list"
          >
            {shelf.map((product, productIndex) => (
              <ProductDisplay
                key={`PrdcOnShelf_${product._id}`}
                product={product}
                pricetagImgs={showPricetagImgs}
                pricetagDetailsImgs={showPricetagDetailsImgs}
                isEven={productIndex % 2 === 0}
              />
            ))}
          </Stack>
        ))}
      </Tabs>
    </>
  );
}
