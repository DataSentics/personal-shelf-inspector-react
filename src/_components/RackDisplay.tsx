import { Tabs, TabList, Tab, Stack, Heading } from "@chakra-ui/react";
import { useState } from "react";
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

  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <Heading mb={6}>Regály</Heading>

      <Tabs variant="enclosed" onChange={setTabIndex}>
        <TabList flexWrap="wrap">
          {rack.shelves.map((_, index) => (
            <Tab key={`Tab_${index}`}>{`${ORDINALS.cs[index]}`}</Tab>
          ))}
        </TabList>

        {/* Chakra-UI TabPanel(s) are not use as the messup TalkBack reading of data inside */}
        {rack.shelves.map((shelf, index) => (
          <Stack
            spacing={0}
            key={`TabPanel_${index}`}
            hidden={index !== tabIndex}
          >
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
        ))}
      </Tabs>
    </>
  );
}
