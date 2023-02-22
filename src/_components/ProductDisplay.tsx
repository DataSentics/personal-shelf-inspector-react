import { Box, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { isNil } from "remeda";
import type { Product } from "_utils/objects";

type Props = {
  product: Product;
  isEven?: boolean;
  pricetagImgs?: boolean;
  pricetagDetailsImgs?: boolean;
};

type ProductImageDisplayProps = Pick<
  Props,
  "product" | "pricetagImgs" | "pricetagDetailsImgs"
>;

function ProductImageDisplay(props: ProductImageDisplayProps) {
  const { product, pricetagImgs, pricetagDetailsImgs } = props;

  if (!pricetagImgs && !pricetagDetailsImgs) return null;

  return (
    <Stack direction="row" wrap="wrap" justifyContent="center">
      {pricetagImgs && (
        <img alt="Cenovka produktu" src={product.collage.bbox.imageUrl} />
      )}
      {pricetagDetailsImgs && (
        <>
          <Box>
            <Text>Jméno</Text>
            <img alt="Nazov produktu" src={product.collage.name?.imageUrl} />
          </Box>

          <Box>
            <Text>Cena</Text>
            <img
              alt="Cena v celých korunách"
              src={product.collage.priceMain?.imageUrl}
            />
          </Box>

          <Box>
            <Text>Halíře</Text>
            <img
              alt="Cena v halířech"
              src={product.collage.priceSub?.imageUrl}
            />
          </Box>
        </>
      )}
    </Stack>
  );
}

const DISPLAY_CURRENCY = "Kč";

function ProductDisplay(props: Props) {
  const { product, isEven, pricetagImgs, pricetagDetailsImgs } = props;

  const bgColorMode = useColorModeValue("blackAlpha.200", "whiteAlpha.400");
  const bgColorModeHover = useColorModeValue("gray.200", "whiteAlpha.200");
  const backgroundColor = isEven ? bgColorMode : undefined;

  const { priceMain, priceSub } = product;

  const priceString = isNil(priceMain)
    ? "Nenalenzena"
    : `${priceMain}.${priceSub ?? 0}${DISPLAY_CURRENCY}`;

  return (
    <Box
      // backgroundColor="whiteAlpha.300"
      backgroundColor={backgroundColor}
      padding={6}
      borderRadius="md"
      role="listitem"
      _hover={{ bg: bgColorModeHover }}
    >
      <Box display="flex" flexDirection="column">
        <Text as="span" fontSize="xl">
          {product.name}.
        </Text>
        <Text as="span" alignSelf="flex-end">
          Cena:
          <Text as="span" fontSize="3xl" fontWeight="bold">
            {" "}
            {priceString}
          </Text>
        </Text>
      </Box>

      <ProductImageDisplay
        product={product}
        pricetagImgs={pricetagImgs}
        pricetagDetailsImgs={pricetagDetailsImgs}
      />
    </Box>
  );
}

export default ProductDisplay;
